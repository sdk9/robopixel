import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, Terminal } from "lucide-react";
import { PixelArtFrame } from "@/components/PixelArtFrame";
import { SignupForm } from "@/components/SignupForm";
import type { Track } from "@/lib/cpp-tracks";
import { lessonSlug } from "@/lib/lesson-catalog";
import { courseCatalog } from "@/lib/course-catalog";

const navTracks = [
  { to: "/courses/cpp-beginner", label: "Beginner" },
  { to: "/courses/cpp-intermediate", label: "Intermediate" },
  { to: "/courses/cpp-advanced", label: "Advanced" },
] as const;

export function CourseTrackPage({ track }: { track: Track }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-3 px-5 py-4">
          <nav className="flex gap-4">
            {navTracks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-foreground underline underline-offset-8" }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.1fr_.9fr] md:py-16">
          <div>
            <p className="text-sm uppercase text-primary">
              {track.level} · {courseCatalog.cpp.price}
            </p>
            <h1 className="mt-3 font-heading text-6xl leading-none md:text-7xl">{track.title}</h1>
            <p className="mt-4 max-w-2xl text-xl text-primary">{track.tagline}</p>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{track.blurb}</p>
            <p className="mt-6 text-sm">
              <span className="text-muted-foreground">Prerequisite:</span> {track.prereq}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/lessons/$courseSlug/$lessonSlug"
                params={{
                  courseSlug: `cpp-${track.slug}`,
                  lessonSlug: lessonSlug(0, track.lessons[0]?.title ?? "lesson"),
                }}
                className="inline-flex items-center bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Start course <ArrowUpRight className="ml-2 size-4" />
              </Link>
              <Link
                to="/practice"
                className="inline-flex items-center border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-secondary"
              >
                <Terminal className="mr-2 size-4" />
                Practice in your browser
              </Link>
            </div>
          </div>
          <div className="space-y-5">
            <PixelArtFrame
              src="/images/cpp-1280.webp"
              alt="Pixel-art C++ robotics programming workbench"
              label={`${track.level} TRACK`}
              meta="COMPILER READY"
            />
            <div className="border border-border bg-card p-6">
              <p className="text-xs uppercase text-primary">You will be able to</p>
              <ul className="mt-4 space-y-3">
                {track.outcomes.map((o) => (
                  <li key={o} className="flex gap-3 text-sm">
                    <Check className="size-4 shrink-0 text-primary" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <h2 className="font-heading text-4xl">Lesson outline</h2>
            <div className="mt-6 border-t border-border">
              {track.lessons.map((l, index) => (
                <div
                  key={l.n}
                  className="grid gap-3 border-b border-border py-4 md:grid-cols-[4rem_16rem_1fr_3rem_auto] md:items-center"
                >
                  <span className="text-sm text-primary">{l.n}</span>
                  <h3 className="font-medium">{l.title}</h3>
                  <p className="text-sm text-muted-foreground">{l.detail}</p>
                  <span className="text-xs text-muted-foreground">{l.time}</span>
                  <Link
                    to="/lessons/$courseSlug/$lessonSlug"
                    params={{
                      courseSlug: `cpp-${track.slug}`,
                      lessonSlug: lessonSlug(index, l.title),
                    }}
                    className="text-sm font-medium text-primary underline underline-offset-4"
                  >
                    Open lesson
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="font-heading text-4xl">Project examples</h2>
          <div className="mt-6 grid gap-px border border-border bg-border md:grid-cols-3">
            {track.projects.map((p) => (
              <article key={p.code} className="bg-background p-5">
                <span className="text-xs text-primary">{p.code}</span>
                <h3 className="mt-3 font-heading text-2xl">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
                <pre className="mt-4 overflow-auto bg-secondary p-3 text-[11px]">
                  <code>{p.snippet}</code>
                </pre>
              </article>
            ))}
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 md:grid-cols-[.8fr_1.2fr]">
          <div className="border-t border-border pt-5">
            <p className="text-xs uppercase text-primary">Free course</p>
            <h2 className="mt-2 font-heading text-4xl">Begin when you are ready.</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {track.duration}. Curriculum aligned with the ISO C++ reference material and verified
              September 2026.
            </p>
            <a
              href="https://isocpp.org/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm underline underline-offset-4"
            >
              ISO C++ resources
            </a>
            {track.next && (
              <div>
                <Link to={track.next.to} className="mt-5 inline-flex text-sm text-primary">
                  {track.next.label} →
                </Link>
              </div>
            )}
          </div>
          <SignupForm track={track.slug} />
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowLeft className="size-4" />
            All courses
          </Link>
        </div>
      </footer>
    </div>
  );
}
