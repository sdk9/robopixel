import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const lessonKey = z.object({
  courseSlug: z.string().regex(/^[a-z0-9-]+$/),
  lessonSlug: z.string().regex(/^\d{2}-[a-z0-9-]+$/),
});

export const getLessonCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => lessonKey.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("lesson_progress")
      .select("completed_at")
      .eq("user_id", context.userId)
      .eq("course_slug", data.courseSlug)
      .eq("lesson_slug", data.lessonSlug)
      .maybeSingle();
    if (error) throw new Error("Lesson progress could not be loaded.");
    return { completedAt: row?.completed_at ?? null };
  });

export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) => lessonKey.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const completedAt = new Date().toISOString();
    const { error } = await supabaseAdmin.from("lesson_progress").upsert(
      {
        user_id: context.userId,
        course_slug: data.courseSlug,
        lesson_slug: data.lessonSlug,
        completed_at: completedAt,
      },
      { onConflict: "user_id,course_slug,lesson_slug" },
    );
    if (error) throw new Error("Lesson progress could not be saved.");
    return { completedAt };
  });
