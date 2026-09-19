import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getIndustrialLessonContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input) =>
    z.object({ lessonSlug: z.string().regex(/^\d{2}-[a-z0-9-]+$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { hasFullAccess } = await import("@/lib/full-access.server");
    if (!hasFullAccess(context.claims)) {
      const { getConfiguredPaddleEnvironment } = await import("@/lib/paddle.server");
      const environment = getConfiguredPaddleEnvironment();
      const { data: entitlement, error } = await context.supabase
        .from("course_entitlements")
        .select("status")
        .eq("user_id", context.userId)
        .eq("course_id", "industrial_robots_course")
        .eq("environment", environment)
        .maybeSingle();
      if (error || entitlement?.status !== "active")
        throw new Error("Paid course access is required.");
    }

    const { industrialLessons } = await import("@/lib/industrial-lessons");
    const lesson = industrialLessons.find((candidate) => candidate.slug === data.lessonSlug);
    if (!lesson) throw new Error("Lesson not found.");
    return lesson;
  });
