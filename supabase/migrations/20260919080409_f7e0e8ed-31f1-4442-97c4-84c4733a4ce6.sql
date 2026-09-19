REVOKE SELECT ON public.course_signups FROM anon, authenticated;
GRANT SELECT ON public.course_signups TO service_role;
CREATE POLICY "Only backend services can read signups"
ON public.course_signups
FOR SELECT
TO service_role
USING (true);