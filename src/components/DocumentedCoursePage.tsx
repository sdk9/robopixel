import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, FlaskConical, Terminal } from "lucide-react";

import { SignupForm } from "@/components/SignupForm";
import { PixelArtFrame } from "@/components/PixelArtFrame";
import type { DocumentedCourse } from "@/lib/documented-courses";
import { lessonSlug } from "@/lib/lesson-catalog";
import { courseCatalog } from "@/lib/course-catalog";

export function DocumentedCoursePage({ course }: { course: DocumentedCourse }) {
  const price =
    course.slug === "ubuntu-linux" ? courseCatalog.ubuntu.price : courseCatalog.ros2.price;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All courses
          </Link>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1.1fr_.9fr] md:items-end md:py-16">
          <div>
            <p className="text-sm font-medium uppercase text-primary">
              {course.eyebrow} · {price}
            </p>
            <h1 className="mt-3 max-w-3xl font-heading text-5xl leading-[.95] md:text-7xl">
              {course.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {course.summary}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/lessons/$courseSlug/$lessonSlug"
                params={{
                  courseSlug: course.slug,
                  lessonSlug: lessonSlug(0, course.lessons[0]?.title ?? "lesson"),
                }}
                className="inline-flex items-center bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Start course <ArrowUpRight className="ml-2 size-4" />
              </Link>
              <Link
                to="/labs"
                className="inline-flex items-center border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                <FlaskConical className="mr-2 size-4" />
                Open ROS 2 labs
              </Link>
              <Link
                to="/practice"
                className="inline-flex items-center border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                <Terminal className="mr-2 size-4" />
                Practice in your browser
              </Link>
            </div>
            <dl className="mt-7 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Duration</dt>
                <dd className="mt-1 text-sm">{course.duration}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">Prerequisite</dt>
                <dd className="mt-1 text-sm">{course.prerequisite}</dd>
              </div>
            </dl>
          </div>
          <PixelArtFrame
            src={course.image}
            alt={course.imageAlt}
            label={course.eyebrow}
            meta={course.slug === "ubuntu-linux" ? "SYSTEM SETUP" : "NODE NETWORK"}
            imageClassName="aspect-[4/3]"
          />
        </section>
        <section className="border-y border-border bg-secondary">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-xs uppercase text-primary">Learning outcomes</p>
              <h2 className="mt-2 font-heading text-4xl">What you will be able to do</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {course.outcomes.map((item) => (
                <li key={item} className="flex gap-3 border-t border-border pt-3 text-sm">
                  <Check className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-xs uppercase text-primary">Course outline</p>
          <h2 className="mt-2 font-heading text-4xl">Lessons in order</h2>
          <ol className="mt-7 border-t border-border">
            {course.lessons.map((lesson, index) => (
              <li
                key={lesson.title}
                className="grid gap-3 border-b border-border py-5 md:grid-cols-[4rem_16rem_1fr_auto] md:items-center"
              >
                <span className="text-sm text-primary">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="font-medium">{lesson.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{lesson.detail}</p>
                <Link
                  to="/lessons/$courseSlug/$lessonSlug"
                  params={{ courseSlug: course.slug, lessonSlug: lessonSlug(index, lesson.title) }}
                  className="text-sm font-medium text-primary underline underline-offset-4"
                >
                  Open lesson
                </Link>
              </li>
            ))}
          </ol>
        </section>
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <p className="text-xs uppercase text-primary">Practice</p>
            <h2 className="mt-2 font-heading text-4xl">Project examples</h2>
            <div className="mt-7 grid gap-px border border-border bg-border md:grid-cols-3">
              {course.projects.map((project) => (
                <article key={project.title} className="bg-background p-5">
                  <h3 className="font-heading text-2xl">{project.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {project.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase text-primary">Documentation</p>
            <h2 className="mt-2 font-heading text-4xl">Checked against primary sources</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Verified {course.verified}. Links open the official documentation.
            </p>
            <div className="mt-5 space-y-2">
              {course.sources.map((source) => (
                <a
                  key={source.href}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm underline underline-offset-4"
                >
                  {source.label}
                  <ArrowUpRight className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div id="signup">
            <SignupForm track={course.track} />
          </div>
        </section>
      </main>
    </div>
  );
}
