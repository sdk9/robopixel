import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  LoaderCircle,
  Play,
  RotateCcw,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getExercise, practiceExercises } from "@/lib/practice-catalog";
import {
  getLastSubmission,
  runPracticeExercise,
  submitPracticeExercise,
} from "@/lib/practice.functions";

export const Route = createFileRoute("/practice/$exerciseId")({
  loader: ({ params }) => {
    const exercise = getExercise(params.exerciseId);
    if (!exercise) throw notFound();
    return exercise;
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.title} | Practice Lab | RobotCodeHub`
      : "Practice lab unavailable | RobotCodeHub";
    const description = loaderData?.brief ?? "This practice lab could not be found.";
    const url = loaderData
      ? `https://robotcodehub.com/practice/${loaderData.id}`
      : "https://robotcodehub.com/practice";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div>
        <h1 className="font-heading text-5xl">Practice lab not found.</h1>
        <Button asChild variant="link" className="mt-4">
          <Link to="/practice">View all practice labs</Link>
        </Button>
      </div>
    </main>
  ),
  component: PracticeWorkbench,
});

type CheckResult = { label: string; passed: boolean };
type Result = {
  compiled: boolean;
  compilerMessage: string;
  stdout: string;
  outputMatches: boolean;
  checks: CheckResult[];
  passed: boolean;
  saved?: boolean;
};

function PracticeWorkbench() {
  const exercise = Route.useLoaderData();
  const index = practiceExercises.findIndex((item) => item.id === exercise.id);
  const previous = practiceExercises[index - 1];
  const next = practiceExercises[index + 1];

  const runOnly = useServerFn(runPracticeExercise);
  const runAndSave = useServerFn(submitPracticeExercise);
  const loadLast = useServerFn(getLastSubmission);

  const [code, setCode] = useState(exercise.starterCode);
  const [signedIn, setSignedIn] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let active = true;
    setCode(exercise.starterCode);
    setResult(null);
    setError(null);
    setShowHint(false);
    async function restore() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setSignedIn(Boolean(data.user));
      if (!data.user) return;
      try {
        const last = await loadLast({ data: { exerciseId: exercise.id } });
        if (active && last?.code) setCode(last.code);
      } catch {
        /* keep the starter code */
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, [exercise.id, exercise.starterCode, loadLast]);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const outcome = signedIn
        ? await runAndSave({ data: { exerciseId: exercise.id, code } })
        : await runOnly({ data: { exerciseId: exercise.id, code } });
      setResult(outcome as Result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The compiler service could not be reached. Try again in a moment.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-5 py-4">
          <Link to="/practice" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" />
            All practice labs
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl min-w-0 px-5 py-10 md:py-14">
        <p className="text-xs uppercase text-primary">
          {exercise.groupLabel} · exercise {exercise.number}
        </p>
        <h1 className="mt-3 font-heading text-4xl leading-none md:text-6xl">{exercise.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {exercise.brief}
        </p>
        <Link
          to={exercise.origin.to}
          className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4"
        >
          {exercise.origin.label}
          <ArrowRight className="size-4" />
        </Link>

        <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <section>
              <h2 className="font-heading text-2xl">Guided steps</h2>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {exercise.steps.map((step, stepIndex) => (
                  <li key={step}>
                    <span className="mr-2 text-primary">{stepIndex + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-8 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-2xl">Your code</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCode(exercise.starterCode);
                      setResult(null);
                    }}
                  >
                    <RotateCcw className="size-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => void run()} disabled={running}>
                    {running ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    {running ? "Compiling…" : "Run & check"}
                  </Button>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(event) => setCode(event.target.value)}
                spellCheck={false}
                aria-label="C++ source code"
                className="mt-3 h-[26rem] w-full min-w-0 resize-y border border-border bg-secondary p-4 font-mono text-[13px] leading-relaxed outline-none focus:border-primary"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {signedIn
                  ? "Signed in: every run is saved to your account and restored next time."
                  : "Not signed in: your work runs but is not saved. Sign in to keep your progress."}
              </p>
            </section>

            {error && (
              <div
                role="alert"
                className="mt-5 flex gap-3 border border-border bg-secondary p-4 text-sm"
              >
                <CircleAlert className="mt-0.5 size-4 text-primary" />
                {error}
              </div>
            )}

            {result && (
              <section role="status" aria-live="polite" className="mt-8 min-w-0">
                <h2 className="font-heading text-2xl">
                  {result.passed ? "Passed." : "Not passed yet."}
                </h2>
                {!result.compiled && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">
                      The compiler rejected your code. Read the first error only, fix it, and run
                      again.
                    </p>
                    <pre className="mt-3 overflow-x-auto border border-border bg-secondary p-4 text-xs leading-relaxed">
                      <code>{result.compilerMessage || "No compiler message returned."}</code>
                    </pre>
                  </div>
                )}
                {result.compiled && (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <h3 className="text-xs uppercase text-primary">Your output</h3>
                      <pre className="mt-2 overflow-x-auto border border-border bg-secondary p-4 text-xs leading-relaxed">
                        <code>{result.stdout || "(nothing printed)"}</code>
                      </pre>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs uppercase text-primary">Expected output</h3>
                      <pre className="mt-2 overflow-x-auto border border-border bg-secondary p-4 text-xs leading-relaxed">
                        <code>{exercise.expectedOutput}</code>
                      </pre>
                    </div>
                  </div>
                )}
                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    {result.outputMatches ? (
                      <Check className="mt-0.5 size-4 text-primary" />
                    ) : (
                      <X className="mt-0.5 size-4 text-muted-foreground" />
                    )}
                    Output matches exactly
                  </li>
                  {result.checks.map((check) => (
                    <li key={check.label} className="flex items-start gap-2">
                      {check.passed ? (
                        <Check className="mt-0.5 size-4 text-primary" />
                      ) : (
                        <X className="mt-0.5 size-4 text-muted-foreground" />
                      )}
                      {check.label}
                    </li>
                  ))}
                </ul>
                {signedIn && result.saved === false && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Your result could not be saved this time, but the check above is accurate.
                  </p>
                )}
              </section>
            )}
          </div>

          <aside className="min-w-0 space-y-6">
            <section className="border border-border p-4">
              <h2 className="font-heading text-xl">Expected output</h2>
              <pre className="mt-3 overflow-x-auto bg-secondary p-3 text-xs leading-relaxed">
                <code>{exercise.expectedOutput}</code>
              </pre>
            </section>

            <section className="border border-border p-4">
              <h2 className="font-heading text-xl">Automated checks</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {exercise.checks.map((check) => (
                  <li key={check.label}>· {check.label}</li>
                ))}
              </ul>
            </section>

            {exercise.terminal && (
              <section className="border border-border p-4">
                <h2 className="font-heading text-xl">On Ubuntu it looks like this</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  Simulated transcript of the real lab commands.
                </p>
                <div className="mt-3 space-y-3">
                  {exercise.terminal.map((step) => (
                    <div key={step.command} className="min-w-0">
                      <pre className="overflow-x-auto bg-secondary p-3 text-xs leading-relaxed">
                        <code>
                          $ {step.command}
                          {step.output ? `\n${step.output}` : ""}
                        </code>
                      </pre>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="border border-border p-4">
              <h2 className="font-heading text-xl">Stuck?</h2>
              {showHint ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {exercise.hint}
                </p>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowHint(true)}
                >
                  Show hint
                </Button>
              )}
            </section>
          </aside>
        </div>

        <nav className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          {previous ? (
            <Link
              to="/practice/$exerciseId"
              params={{ exerciseId: previous.id }}
              className="border border-border p-4 text-sm"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <ArrowLeft className="size-4" />
                Previous
              </span>
              <strong className="mt-2 block">{previous.title}</strong>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to="/practice/$exerciseId"
              params={{ exerciseId: next.id }}
              className="border border-border p-4 text-right text-sm"
            >
              <span className="flex items-center justify-end gap-2 text-muted-foreground">
                Next
                <ArrowRight className="size-4" />
              </span>
              <strong className="mt-2 block">{next.title}</strong>
            </Link>
          ) : (
            <Link to="/labs" className="border border-border p-4 text-right text-sm">
              <span className="text-muted-foreground">Back to</span>
              <strong className="mt-2 block">ROS 2 lab workspace</strong>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
