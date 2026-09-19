CREATE TABLE public.course_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  track TEXT NOT NULL,
  goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.course_signups TO anon;
GRANT INSERT ON public.course_signups TO authenticated;
GRANT ALL ON public.course_signups TO service_role;

ALTER TABLE public.course_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a course signup"
  ON public.course_signups FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND track IN ('beginner', 'intermediate', 'advanced')
    AND (goal IS NULL OR char_length(goal) <= 1000)
  );