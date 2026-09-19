import { createFileRoute, Link } from "@tanstack/react-router";

import { IndustrialCheckout } from "@/components/IndustrialCheckout";
import { PixelArtFrame } from "@/components/PixelArtFrame";
import { lessonCourses } from "@/lib/lesson-catalog";
import { courseCatalog } from "@/lib/course-catalog";

const title = "Industrial Robots — Seven Robot Models";
const description = `Learn safety, kinematics, simulation, controllers, C++ and ROS 2 integration across seven industrial robot types for a ${courseCatalog.industrial.price} payment.`;

const industrialLessons = lessonCourses["industrial-robots"]?.lessons ?? [];

export const Route = createFileRoute("/courses/industrial-robots")({
  head: () => ({
    meta: [
      { title: `${title} | RobotCodeHub` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://robotcodehub.com/courses/industrial-robots" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/courses/industrial-robots" }],
  }),
  component: IndustrialRobotsPage,
});

function IndustrialRobotsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-4">
          <span className="text-sm text-muted-foreground">
            Course 04 · {courseCatalog.industrial.price}
          </span>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.3fr_.7fr] md:py-16">
          <div>
            <p className="text-sm font-medium uppercase text-primary">Industrial Robots</p>
            <h1 className="pixel-title mt-4 max-w-3xl text-4xl sm:text-5xl md:text-6xl">
              Seven machines. One practical control course.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Move from safe setup and coordinate frames to planning, simulation, controllers, and
              complete C++ with ROS 2 integrations.
            </p>
            <PixelArtFrame
              src="/images/industrial-robots-1280.webp"
              alt="Pixel-art industrial robot arm in a clean safety cell"
              label="ROBOT CELL 04"
              meta="SAFETY SYSTEM ONLINE"
              className="mt-8"
            />
          </div>
          <div className="md:pt-12">
            <IndustrialCheckout />
          </div>
        </section>
        <section className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <p className="text-sm uppercase text-primary">The fleet</p>
            <h2 className="mt-2 font-heading text-4xl">Seven distinct robot models</h2>
            <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {industrialLessons.map((lesson, index) => (
                <li
                  key={lesson.slug}
                  className="group border border-border bg-background p-3 shadow-[4px_4px_0_var(--line)]"
                >
                  <Link
                    to="/lessons/$courseSlug/$lessonSlug"
                    params={{ courseSlug: "industrial-robots", lessonSlug: lesson.slug }}
                    className="block"
                  >
                    {lesson.image && (
                      <img
                        src={lesson.image.src.replace("-1280", "-640")}
                        alt={lesson.image.alt}
                        width={640}
                        height={384}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/9] w-full border border-foreground/15 object-cover transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    )}
                    <span className="mt-3 block font-mono text-[10px] uppercase tracking-[.14em] text-primary">
                      Module {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong className="mt-1 block font-heading text-2xl font-normal">
                      {lesson.title}
                    </strong>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
          {[
            [
              "Safety & setup",
              "Risk assessment, work cells, emergency stops, payloads, tooling and coordinate frames.",
            ],
            [
              "Motion & control",
              "Forward and inverse kinematics, trajectories, collision-aware planning and controller tuning.",
            ],
            [
              "C++ & ROS 2",
              "Drivers, hardware interfaces, actions, diagnostics, simulation and repeatable deployment.",
            ],
          ].map(([heading, copy]) => (
            <article key={heading} className="border-t border-border pt-4">
              <h2 className="font-heading text-2xl">{heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </article>
          ))}
        </section>
        <section className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <p className="text-sm uppercase text-primary">Course lessons</p>
            <h2 className="mt-2 font-heading text-4xl">Seven practical robot modules</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Lesson pages unlock after the one-time purchase.
            </p>
            <ol className="mt-6 border-t border-border">
              {industrialLessons.map((lesson, index) => (
                <li
                  key={lesson.slug}
                  className="grid gap-3 border-b border-border py-5 md:grid-cols-[4rem_16rem_1fr_auto] md:items-center"
                >
                  <span className="text-sm text-primary">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="font-medium">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground">{lesson.summary}</p>
                  <Link
                    to="/lessons/$courseSlug/$lessonSlug"
                    params={{ courseSlug: "industrial-robots", lessonSlug: lesson.slug }}
                    className="text-sm font-medium text-primary underline underline-offset-4"
                  >
                    View lesson
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
