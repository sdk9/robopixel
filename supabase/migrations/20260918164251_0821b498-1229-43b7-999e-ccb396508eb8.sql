CREATE TABLE public.practice_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  output TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX practice_submissions_user_exercise_idx ON public.practice_submissions (user_id, exercise_id, created_at DESC);

GRANT SELECT, INSERT ON public.practice_submissions TO authenticated;
GRANT ALL ON public.practice_submissions TO service_role;

ALTER TABLE public.practice_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learners read their own submissions" ON public.practice_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Learners insert their own submissions" ON public.practice_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);