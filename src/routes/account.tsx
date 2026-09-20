import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, LoaderCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { courseCatalog, SUPPORT_EMAIL } from "@/lib/course-catalog";
import { getAccountOverview, restorePurchase } from "@/lib/payments.functions";

const title = "My account";
const description = "See your Code The Robot purchase, practice progress and billing details.";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: `${title} | Code The Robot` },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Code The Robot — ${title}` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

type Overview = Awaited<ReturnType<typeof getAccountOverview>>;

function Account() {
  const navigate = useNavigate();
  const loadOverview = useServerFn(getAccountOverview);
  const restore = useServerFn(restorePurchase);

  const [state, setState] = useState<"loading" | "signed-out" | "ready" | "error">("loading");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setState("signed-out");
      return;
    }
    try {
      setOverview(await loadOverview());
      setState("ready");
    } catch {
      setState("error");
    }
  }, [loadOverview]);

  useEffect(() => {
    void load();
  }, [load]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  async function handleRestore() {
    setRestoring(true);
    setMessage(null);
    try {
      const result = await restore();
      setMessage(result.message);
      if (result.restored) await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Access could not be restored.");
    } finally {
      setRestoring(false);
    }
  }

  const robots = overview?.entitlements.find(
    (row) => row.course_id === courseCatalog.industrial.id,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-4xl items-center justify-end px-5 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All courses
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 md:py-14">
        <h1 className="font-heading text-5xl leading-[.95] md:text-6xl">My account</h1>

        {state === "loading" && (
          <p role="status" aria-live="polite" className="mt-6 text-sm text-muted-foreground">
            Loading your account…
          </p>
        )}

        {state === "signed-out" && (
          <div className="mt-6 border border-border bg-card p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in to see your purchase and practice progress.
            </p>
            <Link
              to="/auth"
              search={{ redirect: "/account" }}
              className="mt-4 inline-flex items-center bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Link>
          </div>
        )}

        {state === "error" && (
          <div className="mt-6 border border-border bg-card p-6">
            <p className="text-sm text-destructive">Your account details could not be loaded.</p>
            <Button className="mt-4" variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          </div>
        )}

        {state === "ready" && overview && (
          <div className="mt-8 space-y-px border border-border bg-border">
            <section className="bg-background p-6">
              <h2 className="font-heading text-2xl">Signed in</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {overview.email ?? "Your account"}
              </p>
              <Button className="mt-4" variant="outline" onClick={() => void signOut()}>
                Sign out
              </Button>
            </section>

            <section className="bg-background p-6">
              <h2 className="font-heading text-2xl">{courseCatalog.industrial.title}</h2>
              {robots ? (
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase text-muted-foreground">Status</dt>
                    <dd className="mt-1 text-sm">
                      {robots.status === "active"
                        ? "Active — permanent access"
                        : robots.status === "refunded"
                          ? "Refunded — access removed"
                          : "Removed after a payment dispute"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-muted-foreground">Purchased</dt>
                    <dd className="mt-1 text-sm">
                      {new Date(robots.purchased_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-muted-foreground">Order reference</dt>
                    <dd className="mt-1 break-all text-sm">{robots.paddle_transaction_id}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  You have not purchased this course yet. It is {courseCatalog.industrial.price} and
                  includes all 235 lessons in seven robot modules permanently.
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={courseCatalog.industrial.href}
                  className="inline-flex items-center border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  {robots?.status === "active" ? "Open the robot lessons" : "View the course"}
                </Link>
                <a
                  href="https://paddle.net"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Receipts and billing
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Refund%20request`}
                  className="inline-flex items-center border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Request a refund
                </a>
              </div>
            </section>

            <section className="bg-background p-6">
              <h2 className="font-heading text-2xl">Course progress</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {overview.lessons.completed} lessons completed
              </p>
              {overview.lessons.latest && (
                <Link
                  to="/lessons/$courseSlug/$lessonSlug"
                  params={{
                    courseSlug: overview.lessons.latest.course_slug,
                    lessonSlug: overview.lessons.latest.lesson_slug,
                  }}
                  className="mt-4 inline-flex items-center border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Resume latest course
                </Link>
              )}
            </section>

            <section className="bg-background p-6">
              <h2 className="font-heading text-2xl">Practice progress</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {overview.practice.passed} exercises passed · {overview.practice.attempted}{" "}
                attempted
              </p>
              <Link
                to="/practice"
                className="mt-4 inline-flex items-center border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Open practice labs
              </Link>
            </section>

            <section className="bg-background p-6">
              <h2 className="font-heading text-2xl">Paid but no access?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                If your payment went through but the course is still locked, check your purchase
                with the payment provider and restore access yourself.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => void handleRestore()}
                disabled={restoring}
              >
                {restoring ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Restore my purchase
              </Button>
              {message && (
                <p role="status" aria-live="polite" className="mt-3 text-sm text-primary">
                  {message}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Still stuck? Email{" "}
                <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
