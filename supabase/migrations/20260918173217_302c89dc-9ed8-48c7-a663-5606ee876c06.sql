CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  transaction_id text,
  handled boolean NOT NULL DEFAULT false,
  note text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, environment)
);
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only backend services manage payment events"
ON public.payment_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
CREATE INDEX payment_events_transaction_idx ON public.payment_events (transaction_id);

ALTER TABLE public.course_entitlements DROP CONSTRAINT IF EXISTS course_entitlements_status_check;
ALTER TABLE public.course_entitlements ADD CONSTRAINT course_entitlements_status_check
CHECK (status IN ('active', 'refunded', 'revoked'));
