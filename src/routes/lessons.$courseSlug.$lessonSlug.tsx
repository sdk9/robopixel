import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  ExternalLink,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

import { LessonAccessGate } from "@/components/LessonAccessGate";
import { LessonCompletion } from "@/components/LessonCompletion";
import { PixelArtFrame } from "@/components/PixelArtFrame";
import { Button } from "@/components/ui/button";
import { getLesson, type Lesson, type LessonCourse } from "@/lib/lesson-catalog";

export const Route = createFileRoute("/lessons/$courseSlug/$lessonSlug")({
  loader: ({ params }) => {
    const result = getLesson(params.courseSlug, params.lessonSlug);
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.lesson.title} | ${loaderData.course.title} | RobotCodeHub`
      : "Lesson unavailable | RobotCodeHub";
    const description =
      loaderData?.lesson.summary ?? "This RobotCodeHub lesson could not be found.";
    const url = loaderData
      ? `https://robotcodehub.com/lessons/${loaderData.course.slug}/${loaderData.lesson.slug}`
      : "https://robotcodehub.com";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        ...(loaderData?.lesson.image
          ? [
              {
                property: "og:image",
                content: `https://robotcodehub.com${loaderData.lesson.image.src}`,
              },
            ]
          : []),
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: ({ reset }) => (
    <LessonMessage title="This lesson did not load." action="Try again" onAction={reset} />
  ),
  notFoundComponent: () => (
    <LessonMessage title="Lesson not found." action="View all courses" href="/" />
  ),
  component: LessonPage,
});

function LessonMessage({
  title,
  action,
  href,
  onAction,
}: {
  title: string;
  action: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div>
        <h1 className="font-heading text-5xl">{title}</h1>
        {href ? (
          <Button asChild variant="link" className="mt-5">
            <a href={href}>{action}</a>
          </Button>
        ) : (
          <Button variant="link" className="mt-5" onClick={onAction}>
            {action}
          </Button>
        )}
      </div>
    </main>
  );
}

function LessonPage() {
  const { course, lesson, index } = Route.useLoaderData();
  if (course.paid) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LessonAccessGate lessonSlug={lesson.slug}>
          {(protectedLesson) => (
            <LessonPageContent course={course} lesson={protectedLesson} index={index} />
          )}
        </LessonAccessGate>
      </div>
    );
  }
  return <LessonPageContent course={course} lesson={lesson} index={index} />;
}

function LessonPageContent({
  course,
  lesson,
  index,
}: {
  course: LessonCourse;
  lesson: Lesson;
  index: number;
}) {
  const previous = course.lessons[index - 1];
  const next = course.lessons[index + 1];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-4 px-5 py-4">
          <Link
            to={course.href}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Course outline
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">
        <div className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <article className="min-w-0">
            <p className="text-xs font-medium uppercase text-primary">
              {course.title} · Lesson {String(index + 1).padStart(2, "0")} of{" "}
              {course.lessons.length}
            </p>
            <h1 className="mt-3 font-heading text-5xl leading-none md:text-6xl">{lesson.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {lesson.summary}
            </p>
            <p className="mt-3 text-xs uppercase text-muted-foreground">
              Estimated time · {lesson.duration}
            </p>
            {lesson.image && (
              <PixelArtFrame
                src={lesson.image.src}
                alt={lesson.image.alt}
                label={lesson.image.label}
                meta={`LESSON ${String(index + 1).padStart(2, "0")}`}
                className="mt-8"
                loading="eager"
              />
            )}

            <section className="mt-10 grid gap-6 border-y border-border py-8 md:grid-cols-[14rem_1fr]">
              <div>
                <p className="text-xs uppercase text-primary">Learning goals</p>
                <h2 className="mt-2 font-heading text-3xl">What you will understand</h2>
              </div>
              <ul className="space-y-3">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-3 leading-relaxed">
                    <Check className="mt-1 size-4 shrink-0 text-primary" />
                    {objective}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10">
              <div className="flex items-center gap-2 text-primary">
                <Lightbulb className="size-4" />
                <p className="text-xs uppercase">Understand the idea first</p>
              </div>
              <h2 className="mt-2 font-heading text-3xl">The mental model</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
                {lesson.concept.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="mt-10 border-t border-border pt-8">
              <p className="text-xs uppercase text-primary">Guided lesson</p>
              <h2 className="mt-2 font-heading text-3xl">Work through these steps</h2>
              <ol className="mt-5 space-y-5">
                {lesson.steps.map((step, stepIndex) => (
                  <li key={step} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span className="text-sm text-primary">{stepIndex + 1}.</span>
                    <p className="leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-10 min-w-0">
              <p className="text-xs uppercase text-primary">Worked example</p>
              <h2 className="mt-2 font-heading text-3xl">Read it before you run it</h2>
              <pre className="mt-5 max-w-full overflow-x-auto border border-border bg-secondary p-5 text-sm leading-relaxed">
                <code>{lesson.example}</code>
              </pre>
              <div className="mt-5 border-l-2 border-primary pl-5">
                <h3 className="font-heading text-2xl">What the example is doing</h3>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {lesson.codeWalkthrough.map((item, itemIndex) => (
                    <li key={item}>
                      <span className="mr-2 text-primary">{itemIndex + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="mt-10 border-y border-border py-8">
              <p className="text-xs uppercase text-primary">Expected result</p>
              <h2 className="mt-2 font-heading text-3xl">How you know it worked</h2>
              <ul className="mt-4 space-y-3">
                {lesson.expected.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-10 border-y border-border py-8">
              <p className="text-xs uppercase text-primary">Practical exercise</p>
              <h2 className="mt-2 font-heading text-3xl">Apply the lesson</h2>
              <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                {lesson.exercise}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-heading text-3xl">Before you continue</h2>
              <ul className="mt-4 space-y-3">
                {lesson.checklist.map((item) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="mt-8">
              <div className="flex items-center gap-2">
                <CircleHelp className="size-4 text-primary" />
                <h2 className="font-heading text-3xl">If something goes wrong</h2>
              </div>
              <div className="mt-4 divide-y divide-border border-y border-border">
                {lesson.troubleshooting.map((item) => (
                  <div key={item.symptom} className="grid gap-2 py-4 sm:grid-cols-[14rem_1fr]">
                    <strong className="text-sm font-medium">{item.symptom}</strong>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.fix}</p>
                  </div>
                ))}
              </div>
            </section>
            {lesson.notes && (
              <section className="mt-8 border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-4 text-primary" />
                  <h2 className="font-heading text-2xl">Safety boundary</h2>
                </div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {lesson.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
            )}
            <LessonCompletion courseSlug={course.slug} lessonSlug={lesson.slug} />
            {lesson.sourceHref && (
              <a
                href={lesson.sourceHref}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4"
              >
                {lesson.sourceLabel}
                <ExternalLink className="size-4" />
              </a>
            )}
          </article>

          <aside className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-5">
            <p className="text-xs uppercase text-muted-foreground">Course lessons</p>
            <ol className="mt-3 space-y-1">
              {course.lessons.map((item, lessonIndex) => (
                <li key={item.slug}>
                  <Link
                    to="/lessons/$courseSlug/$lessonSlug"
                    params={{ courseSlug: course.slug, lessonSlug: item.slug }}
                    className={`block border-l px-3 py-2 text-sm ${lessonIndex === index ? "border-primary bg-secondary text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
                  >
                    {String(lessonIndex + 1).padStart(2, "0")} · {item.title}
                  </Link>
                </li>
              ))}
            </ol>
            <a
              href={course.sourceHref}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center gap-2 text-xs underline underline-offset-4"
            >
              {course.sourceLabel}
              <ExternalLink className="size-3" />
            </a>
          </aside>
        </div>

        <nav className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          {previous ? (
            <Link
              to="/lessons/$courseSlug/$lessonSlug"
              params={{ courseSlug: course.slug, lessonSlug: previous.slug }}
              className="border border-border p-4 text-sm hover:bg-secondary"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <ArrowLeft className="size-4" />
                Previous lesson
              </span>
              <strong className="mt-2 block font-medium">{previous.title}</strong>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to="/lessons/$courseSlug/$lessonSlug"
              params={{ courseSlug: course.slug, lessonSlug: next.slug }}
              className="border border-border p-4 text-right text-sm hover:bg-secondary"
            >
              <span className="flex items-center justify-end gap-2 text-muted-foreground">
                Next lesson
                <ArrowRight className="size-4" />
              </span>
              <strong className="mt-2 block font-medium">{next.title}</strong>
            </Link>
          ) : (
            <Link
              to={course.href}
              className="border border-border p-4 text-right text-sm hover:bg-secondary"
            >
              <span className="text-muted-foreground">Course complete</span>
              <strong className="mt-2 block font-medium">Back to course outline</strong>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
