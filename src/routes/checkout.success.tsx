import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getIndustrialRobotsAccess } from "@/lib/payments.functions";
import { lessonCourses } from "@/lib/lesson-catalog";

const title = "Purchase complete — Industrial Robots";
const description = "Confirmation and course access for the Industrial Robots course.";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: `${title} | Code The Robot` },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutSuccess,
});

function CheckoutSuccess() {
  const getAccess = useServerFn(getIndustrialRobotsAccess);
  const [active, setActive] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    async function check() {
      attempts += 1;
      try {
        const result = await getAccess();
        if (cancelled) return;
        if (result.active) {
          setActive(true);
          setChecking(false);
          return;
        }
      } catch {
        /* Session or webhook may still be settling. */
      }
      if (attempts < 8 && !cancelled) window.setTimeout(check, 1500);
      else if (!cancelled) setChecking(false);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [getAccess]);

  const firstLesson = lessonCourses["industrial-robots"]?.lessons[0];

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-foreground">
      <div
        role="status"
        aria-live="polite"
        className="max-w-lg border border-border bg-card p-8 text-center"
      >
        {active ? (
          <CheckCircle2 className="mx-auto size-10 text-primary" />
        ) : checking ? (
          <LoaderCircle className="mx-auto size-10 animate-spin text-primary" />
        ) : null}
        <h1 className="mt-4 font-heading text-4xl">
          {active
            ? "Your course is ready"
            : checking
              ? "Confirming your access"
              : "Payment received"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {active
            ? "Industrial Robots is now connected to your account permanently."
            : "Payment confirmation can take a moment. Your access will appear automatically after confirmation."}
        </p>
        {active && firstLesson ? (
          <Button asChild className="mt-6">
            <Link
              to="/lessons/$courseSlug/$lessonSlug"
              params={{ courseSlug: "industrial-robots", lessonSlug: firstLesson.slug }}
            >
              Open your first lesson
            </Link>
          </Button>
        ) : (
          <Button asChild className="mt-6">
            <Link to="/courses/industrial-robots">Return to the course</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
