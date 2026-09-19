-- Production hardening: keep writes behind verified server functions, make
-- payment processing retryable, and bind checkout completion to a user-owned
-- short-lived purchase intent.

REVOKE INSERT ON public.course_signups FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can submit a course signup" ON public.course_signups;

REVOKE INSERT ON public.practice_submissions FROM authenticated;
DROP POLICY IF EXISTS "Learners insert their own submissions" ON public.practice_submissions;

CREATE TABLE public.lesson_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  lesson_slug text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_slug, lesson_slug)
);
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
CREATE POLICY "Learners read their own lesson progress"
ON public.lesson_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE public.purchase_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  used_at timestamptz,
  paddle_transaction_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_intents ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.purchase_intents TO service_role;
CREATE POLICY "Only backend services manage purchase intents"
ON public.purchase_intents FOR ALL TO service_role
USING (true) WITH CHECK (true);
CREATE INDEX purchase_intents_user_idx
ON public.purchase_intents (user_id, created_at DESC);

ALTER TABLE public.payment_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error text;

UPDATE public.payment_events
SET status = CASE WHEN handled THEN 'completed' ELSE 'received' END;

ALTER TABLE public.payment_events
  DROP CONSTRAINT IF EXISTS payment_events_status_check;
ALTER TABLE public.payment_events
  ADD CONSTRAINT payment_events_status_check
  CHECK (status IN ('received', 'processing', 'completed', 'failed'));

CREATE TABLE public.rate_limits (
  action text NOT NULL,
  subject_hash text NOT NULL,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (action, subject_hash)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.rate_limits TO service_role;
CREATE POLICY "Only backend services manage rate limits"
ON public.rate_limits FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_action text,
  p_subject_hash text,
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_row public.rate_limits%ROWTYPE;
BEGIN
  IF p_max_requests < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Invalid rate-limit configuration';
  END IF;

  SELECT * INTO current_row
  FROM public.rate_limits
  WHERE action = p_action AND subject_hash = p_subject_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (action, subject_hash, request_count)
    VALUES (p_action, p_subject_hash, 1);
    RETURN true;
  END IF;

  IF current_row.window_started_at <= now() - make_interval(secs => p_window_seconds) THEN
    UPDATE public.rate_limits
    SET window_started_at = now(), request_count = 1
    WHERE action = p_action AND subject_hash = p_subject_hash;
    RETURN true;
  END IF;

  IF current_row.request_count >= p_max_requests THEN
    RETURN false;
  END IF;

  UPDATE public.rate_limits
  SET request_count = request_count + 1
  WHERE action = p_action AND subject_hash = p_subject_hash;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_payment_event(
  p_event_id text,
  p_event_type text,
  p_environment text,
  p_transaction_id text,
  p_payload jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_row public.payment_events%ROWTYPE;
BEGIN
  INSERT INTO public.payment_events (
    event_id, event_type, environment, transaction_id, payload
  ) VALUES (
    p_event_id, p_event_type, p_environment, p_transaction_id, p_payload
  ) ON CONFLICT (event_id, environment) DO NOTHING;

  SELECT * INTO event_row
  FROM public.payment_events
  WHERE event_id = p_event_id AND environment = p_environment
  FOR UPDATE;

  IF event_row.status = 'completed' THEN
    RETURN false;
  END IF;

  IF event_row.status = 'processing'
     AND event_row.processing_started_at > now() - interval '10 minutes' THEN
    RETURN false;
  END IF;

  UPDATE public.payment_events
  SET status = 'processing',
      handled = false,
      processing_started_at = now(),
      attempt_count = attempt_count + 1,
      last_error = null,
      payload = p_payload,
      transaction_id = p_transaction_id
  WHERE event_id = p_event_id AND environment = p_environment;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_course_purchase(
  p_intent_id uuid,
  p_transaction_id text,
  p_customer_id text,
  p_environment text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  purchase_intent public.purchase_intents%ROWTYPE;
BEGIN
  SELECT * INTO purchase_intent
  FROM public.purchase_intents
  WHERE id = p_intent_id
    AND environment = p_environment
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown purchase intent';
  END IF;
  IF purchase_intent.used_at IS NOT NULL THEN
    IF purchase_intent.paddle_transaction_id = p_transaction_id THEN
      RETURN purchase_intent.user_id;
    END IF;
    RAISE EXCEPTION 'Purchase intent has already been used';
  END IF;
  IF purchase_intent.expires_at <= now() THEN
    RAISE EXCEPTION 'Purchase intent has expired';
  END IF;

  INSERT INTO public.course_entitlements (
    user_id, course_id, paddle_transaction_id, paddle_customer_id,
    status, environment, purchased_at, refunded_at
  ) VALUES (
    purchase_intent.user_id, purchase_intent.course_id, p_transaction_id,
    p_customer_id, 'active', p_environment, now(), null
  )
  ON CONFLICT (user_id, course_id, environment) DO UPDATE
  SET paddle_transaction_id = EXCLUDED.paddle_transaction_id,
      paddle_customer_id = EXCLUDED.paddle_customer_id,
      status = 'active',
      purchased_at = now(),
      refunded_at = null;

  UPDATE public.purchase_intents
  SET used_at = now(), paddle_transaction_id = p_transaction_id
  WHERE id = p_intent_id;

  RETURN purchase_intent.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_payment_event(text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_course_purchase(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_payment_event(text, text, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_course_purchase(uuid, text, text, text) TO service_role;
