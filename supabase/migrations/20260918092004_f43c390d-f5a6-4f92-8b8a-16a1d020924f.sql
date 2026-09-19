ALTER TABLE public.course_signups DROP CONSTRAINT IF EXISTS course_signups_track_check;
ALTER TABLE public.course_signups ADD CONSTRAINT course_signups_track_check CHECK (track = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'ubuntu'::text, 'ros2'::text]));
DROP POLICY IF EXISTS "Anyone can submit a course signup" ON public.course_signups;
CREATE POLICY "Anyone can submit a course signup"
ON public.course_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 100
  AND char_length(email) BETWEEN 3 AND 255
  AND track = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'ubuntu'::text, 'ros2'::text])
  AND (goal IS NULL OR char_length(goal) <= 1000)
);

CREATE TABLE public.course_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  paddle_transaction_id text NOT NULL UNIQUE,
  paddle_customer_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'refunded')),
  environment text NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'live')),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, environment)
);
GRANT SELECT ON public.course_entitlements TO authenticated;
GRANT ALL ON public.course_entitlements TO service_role;
ALTER TABLE public.course_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view their own course access"
ON public.course_entitlements
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX course_entitlements_user_course_idx
ON public.course_entitlements (user_id, course_id, environment);

CREATE OR REPLACE FUNCTION public.set_course_entitlements_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER set_course_entitlements_updated_at
BEFORE UPDATE ON public.course_entitlements
FOR EACH ROW EXECUTE FUNCTION public.set_course_entitlements_updated_at();