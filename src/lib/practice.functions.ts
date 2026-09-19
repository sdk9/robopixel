import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type SubmissionInput = { exerciseId: string; code: string };

function validateSubmission(input: SubmissionInput): SubmissionInput {
  if (!input || typeof input.exerciseId !== "string" || typeof input.code !== "string") {
    throw new Error("A lab id and some code are required.");
  }
  if (input.code.trim().length === 0) throw new Error("Write some code before running it.");
  if (input.code.length > 20000) throw new Error("That submission is too long.");
  return { exerciseId: input.exerciseId, code: input.code };
}

/** Compile and check without saving — used when nobody is signed in. */
export const runPracticeExercise = createServerFn({ method: "POST" })
  .validator(validateSubmission)
  .handler(async ({ data }) => {
    const { enforceRateLimit } = await import("@/lib/rate-limit.server");
    await enforceRateLimit({ action: "practice-anonymous", maxRequests: 10, windowSeconds: 600 });
    const { gradeSubmission } = await import("./practice.server");
    return gradeSubmission(data.exerciseId, data.code);
  });

/** Compile, check and record the attempt for the signed-in learner. */
export const submitPracticeExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(validateSubmission)
  .handler(async ({ data, context }) => {
    const { enforceRateLimit } = await import("@/lib/rate-limit.server");
    await enforceRateLimit({
      action: "practice-authenticated",
      maxRequests: 30,
      windowSeconds: 600,
      subject: context.userId,
    });
    const { gradeSubmission } = await import("./practice.server");
    const result = await gradeSubmission(data.exerciseId, data.code);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("practice_submissions").insert({
      user_id: context.userId,
      exercise_id: data.exerciseId,
      code: data.code,
      passed: result.passed,
      output: result.compiled ? result.stdout : result.compilerMessage,
    });
    if (error) return { ...result, saved: false as const };
    return { ...result, saved: true as const };
  });

export const getPracticeProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("practice_submissions")
      .select("exercise_id, passed, created_at")
      .order("created_at", { ascending: false });
    if (error) return { passed: [] as string[], attempted: [] as string[] };
    const passed = new Set<string>();
    const attempted = new Set<string>();
    for (const row of data ?? []) {
      attempted.add(row.exercise_id);
      if (row.passed) passed.add(row.exercise_id);
    }
    return { passed: [...passed], attempted: [...attempted] };
  });

export const getLastSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { exerciseId: string }) => {
    if (!input || typeof input.exerciseId !== "string") throw new Error("A lab id is required.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("practice_submissions")
      .select("code, passed, created_at")
      .eq("exercise_id", data.exerciseId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error || !rows || rows.length === 0) return null;
    const row = rows[0]!;
    return { code: row.code, passed: row.passed, createdAt: row.created_at };
  });
