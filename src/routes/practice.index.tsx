import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, TerminalSquare } from "lucide-react";

import { usePracticeProgress } from "@/components/PracticeProgress";
import { practiceExercises, practiceGroups } from "@/lib/practice-catalog";

export const Route = createFileRoute("/practice/")({
  head: () => ({
    meta: [
      { title: "Browser Practice Labs | RobotCodeHub" },
      {
        name: "description",
        content:
          "Write C++ and ROS 2 exercises in your browser, compile them for real and get your work checked automatically, lab by lab.",
      },
      { property: "og:title", content: "Browser Practice Labs | RobotCodeHub" },
      {
        property: "og:description",
        content:
          "32 guided C++ and ROS 2 exercises with real compiling, expected output and automatic checks.",
      },
      { property: "og:url", content: "https://robotcodehub.com/practice" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/practice" }],
  }),
  component: PracticeIndex,
});

function PracticeIndex() {
  const progress = usePracticeProgress();
  const passed = new Set(progress.passed);
  const attempted = new Set(progress.attempted);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-4">
          <Link to="/labs" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" />
            Lab workspace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-xs uppercase text-primary">Practice</p>
        <h1 className="mt-3 max-w-4xl font-heading text-6xl leading-none md:text-7xl">
          Write it, compile it, prove it.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Every exercise below opens a workbench: guided steps, starter code, the exact output your
          program must produce, and automatic checks. Your C++ is compiled with a real GCC
          toolchain, not simulated. ROS 2 exercises add a terminal transcript so you can see what
          the same work looks like on Ubuntu.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 border border-border bg-secondary p-5 text-sm">
          <TerminalSquare className="size-5 text-primary" />
          <span>{practiceExercises.length} exercises</span>
          <span className="text-muted-foreground">·</span>
          <span>
            {progress.signedIn
              ? `${passed.size} passed`
              : "Sign in to save your progress across devices"}
          </span>
        </div>

        {practiceGroups.map((group) => (
          <section key={group.id} className="mt-12">
            <h2 className="font-heading text-3xl">{group.label}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {group.blurb}
            </p>
            <ol className="mt-5 border-t border-border">
              {practiceExercises
                .filter((exercise) => exercise.group === group.id)
                .map((exercise) => (
                  <li
                    key={exercise.id}
                    className="grid gap-2 border-b border-border py-4 md:grid-cols-[3rem_2rem_16rem_1fr_auto] md:items-center"
                  >
                    <span className="text-sm text-primary">{exercise.number}</span>
                    <span>
                      {passed.has(exercise.id) ? (
                        <CheckCircle2 className="size-4 text-primary" aria-label="Passed" />
                      ) : (
                        <CircleDashed
                          className={`size-4 ${attempted.has(exercise.id) ? "text-primary" : "text-muted-foreground"}`}
                          aria-label={attempted.has(exercise.id) ? "Attempted" : "Not started"}
                        />
                      )}
                    </span>
                    <h3 className="font-heading text-xl">{exercise.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {exercise.brief}
                    </p>
                    <Link
                      to="/practice/$exerciseId"
                      params={{ exerciseId: exercise.id }}
                      className="flex items-center gap-2 text-sm font-medium text-primary"
                    >
                      Open workbench
                      <ArrowRight className="size-4" />
                    </Link>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </main>
    </div>
  );
}
