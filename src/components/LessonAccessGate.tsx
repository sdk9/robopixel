import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IndustrialCheckout } from "@/components/IndustrialCheckout";
import { supabase } from "@/integrations/supabase/client";
import { getIndustrialLessonContent } from "@/lib/lesson-content.functions";
import type { Lesson } from "@/lib/lesson-catalog";

type State =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "locked" }
  | { status: "open"; lesson: Lesson };

export function LessonAccessGate({
  lessonSlug,
  children,
}: {
  lessonSlug: string;
  children: (lesson: Lesson) => ReactNode;
}) {
  const loadLesson = useServerFn(getIndustrialLessonContent);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setState({ status: "signed-out" });
        return;
      }
      try {
        const lesson = await loadLesson({ data: { lessonSlug } });
        if (active) setState({ status: "open", lesson });
      } catch {
        if (active) setState({ status: "locked" });
      }
    })();
    return () => {
      active = false;
    };
  }, [lessonSlug, loadLesson]);

  if (state.status === "open") return children(state.lesson);
  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <LoaderCircle className="size-4 animate-spin" />
        Checking course access…
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-16 text-center">
      <LockKeyhole className="mx-auto size-7 text-primary" aria-hidden="true" />
      <h1 className="mt-4 font-heading text-4xl">This lesson is part of the paid course.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {state.status === "signed-out"
          ? "Sign in and purchase the course, or sign in with the account that already owns it."
          : "Purchase the course once to unlock all seven lessons permanently."}
      </p>
      <div className="mt-7 text-left">
        <IndustrialCheckout />
      </div>
      <Button variant="link" className="mt-4" asChild>
        <a href="/courses/industrial-robots">Back to course outline</a>
      </Button>
    </section>
  );
}
