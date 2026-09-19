import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { completeLesson, getLessonCompletion } from "@/lib/lesson-progress.functions";

export function LessonCompletion({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  const getCompletion = useServerFn(getLessonCompletion);
  const saveCompletion = useServerFn(completeLesson);
  const [state, setState] = useState<"signed-out" | "idle" | "saving" | "complete">("signed-out");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      try {
        const result = await getCompletion({ data: { courseSlug, lessonSlug } });
        if (active) setState(result.completedAt ? "complete" : "idle");
      } catch {
        if (active) setState("idle");
      }
    })();
    return () => {
      active = false;
    };
  }, [courseSlug, lessonSlug, getCompletion]);

  if (state === "signed-out")
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        Sign in to save lesson completion and resume from your account.
      </p>
    );
  if (state === "complete")
    return (
      <p role="status" className="mt-8 flex items-center gap-2 text-sm text-primary">
        <CheckCircle2 className="size-4" />
        Lesson completed and saved.
      </p>
    );

  return (
    <Button
      className="mt-8"
      variant="outline"
      disabled={state === "saving"}
      onClick={async () => {
        setState("saving");
        try {
          await saveCompletion({ data: { courseSlug, lessonSlug } });
          setState("complete");
        } catch {
          setState("idle");
        }
      }}
    >
      {state === "saving" ? "Saving…" : "Mark lesson complete"}
    </Button>
  );
}
