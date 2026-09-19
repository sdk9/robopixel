import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Terminal, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLab, labs } from "@/lib/lab-catalog";
import { exercisesForLab } from "@/lib/practice-catalog";

export const Route = createFileRoute("/labs/$labSlug")({
  loader: ({ params }) => {
    const lab = getLab(params.labSlug);
    if (!lab) throw notFound();
    return lab;
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.title} | ROS 2 Labs | RobotCodeHub`
      : "Lab unavailable | RobotCodeHub";
    const description = loaderData?.summary ?? "This ROS 2 lab could not be found.";
    const url = loaderData
      ? `https://robotcodehub.com/labs/${loaderData.slug}`
      : "https://robotcodehub.com/labs";
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
        <h1 className="font-heading text-5xl">Lab not found.</h1>
        <Button asChild variant="link" className="mt-4">
          <Link to="/labs">View all labs</Link>
        </Button>
      </div>
    </main>
  ),
  component: LabPage,
});

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 overflow-x-auto border border-border bg-secondary p-5 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function LabPage() {
  const lab = Route.useLoaderData();
  const index = labs.findIndex((item) => item.slug === lab.slug);
  const previous = labs[index - 1];
  const next = labs[index + 1];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-5xl items-center justify-end px-5 py-4">
          <Link to="/labs" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" />
            Lab workspace
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 md:py-14">
        <article className="min-w-0 max-w-3xl">
          <p className="text-xs uppercase text-primary">
            ROS 2 Lyrical lab {lab.number} · {lab.duration}
          </p>
          <h1 className="mt-3 font-heading text-5xl leading-none md:text-6xl">{lab.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{lab.summary}</p>
          {exercisesForLab(lab.slug).map((exercise) => (
            <Link
              key={exercise.id}
              to="/practice/$exerciseId"
              params={{ exerciseId: exercise.id }}
              className="mt-5 inline-flex items-center gap-2 border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-background"
            >
              <Terminal className="size-4 text-primary" />
              Practice this lab in your browser: {exercise.title}
            </Link>
          ))}
          {lab.concept && (
            <section className="mt-9 border-l-2 border-primary pl-5">
              <p className="text-xs uppercase text-primary">Understand before building</p>
              <h2 className="mt-2 font-heading text-3xl">How this part of ROS 2 works</h2>
              <div className="mt-4 space-y-3 leading-relaxed text-muted-foreground">
                {lab.concept.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </section>
          )}
          <section className="mt-10 grid gap-6 border-y border-border py-7 sm:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl">Before you start</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {lab.prerequisites.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-2xl">Files you will touch</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {lab.files.map((item) => (
                  <li key={item}>
                    <code>{item}</code>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section className="mt-9">
            <p className="text-xs uppercase text-primary">Step 1</p>
            <h2 className="mt-2 font-heading text-3xl">Set up</h2>
            <CodeBlock>{lab.setup}</CodeBlock>
          </section>
          <section className="mt-9">
            <p className="text-xs uppercase text-primary">Step 2</p>
            <h2 className="mt-2 font-heading text-3xl">Create the file</h2>
            <CodeBlock>{lab.code}</CodeBlock>
            {lab.walkthrough && (
              <div className="mt-5">
                <h3 className="font-heading text-2xl">What each part does</h3>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {lab.walkthrough.map((item, itemIndex) => (
                    <li key={item}>
                      <span className="mr-2 text-primary">{itemIndex + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
          <section className="mt-9">
            <p className="text-xs uppercase text-primary">Step 3</p>
            <h2 className="mt-2 font-heading text-3xl">Build, run and inspect</h2>
            <CodeBlock>{lab.run}</CodeBlock>
          </section>
          <section className="mt-9 border-y border-border py-7">
            <h2 className="font-heading text-3xl">Proof that it works</h2>
            <ul className="mt-4 space-y-3">
              {lab.expected.map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <Check className="mt-0.5 size-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="mt-8">
            <div className="flex items-center gap-2">
              <Wrench className="size-4 text-primary" />
              <h2 className="font-heading text-3xl">Recovery notes</h2>
            </div>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {lab.recovery.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a
              href={lab.sourceHref}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm underline underline-offset-4"
            >
              {lab.sourceLabel}
              <ExternalLink className="size-4" />
            </a>
          </section>
        </article>
        <nav className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          {previous ? (
            <Link
              to="/labs/$labSlug"
              params={{ labSlug: previous.slug }}
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
              to="/labs/$labSlug"
              params={{ labSlug: next.slug }}
              className="border border-border p-4 text-right text-sm"
            >
              <span className="flex items-center justify-end gap-2 text-muted-foreground">
                Next
                <ArrowRight className="size-4" />
              </span>
              <strong className="mt-2 block">{next.title}</strong>
            </Link>
          ) : (
            <Link
              to="/courses/industrial-robots"
              className="border border-border p-4 text-right text-sm"
            >
              <span className="text-muted-foreground">Next course</span>
              <strong className="mt-2 block">Industrial Robots</strong>
            </Link>
          )}
        </nav>
      </main>
    </div>
  );
}
