import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PixelArtFrame } from "@/components/PixelArtFrame";
import { courseCatalog } from "@/lib/course-catalog";

const ubuntu = "/images/ubuntu-1280.webp";
const cpp = "/images/cpp-1280.webp";
const ros2 = "/images/ros2-1280.webp";
const robots = "/images/industrial-robots-1280.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RobotCodeHub — Practical C++, ROS 2 and robotics courses" },
      {
        name: "description",
        content:
          "Learn Ubuntu Linux, C++, ROS 2 Lyrical Luth and seven industrial robot models in one practical course path.",
      },
      { property: "og:title", content: "RobotCodeHub" },
      { property: "og:description", content: "Practical, documentation-led robotics courses." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://robotcodehub.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/" }],
  }),
  component: Index,
});

const courses = [
  {
    number: "01",
    title: courseCatalog.ubuntu.title,
    description: "Install Ubuntu, learn the terminal and prepare a dependable ROS 2 workstation.",
    price: courseCatalog.ubuntu.price,
    image: ubuntu,
    alt: "Pixel-art Ubuntu robotics workstation with a laptop and tools",
    to: "/courses/ubuntu-linux" as const,
    details: "6 units · no prerequisite",
  },
  {
    number: "02",
    title: courseCatalog.cpp.title,
    description:
      "Progress from first compilation to deterministic, production-minded robotics code.",
    price: courseCatalog.cpp.price,
    image: cpp,
    alt: "Pixel-art C++ coding desk with electronics",
    to: "/courses/cpp-beginner" as const,
    details: "Beginner · Intermediate · Advanced",
  },
  {
    number: "03",
    title: courseCatalog.ros2.title,
    description: "Build nodes, interfaces, actions and diagnosable robot systems in modern C++.",
    price: courseCatalog.ros2.price,
    image: ros2,
    alt: "Pixel-art mobile robot with LiDAR in a clean workshop",
    to: "/courses/ros2-lyrical" as const,
    details: "Ubuntu 26.04 · Tier 1",
  },
  {
    number: "04",
    title: courseCatalog.industrial.title,
    description: "Program seven robot types with safety, kinematics, planning, C++ and ROS 2.",
    price: courseCatalog.industrial.price,
    image: robots,
    alt: "Pixel-art industrial robot arm in a safety cell",
    to: "/courses/industrial-robots" as const,
    details: "7 models · permanent access",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div
            className="pixel-dots absolute inset-y-0 right-0 hidden w-1/2 opacity-60 md:block"
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.05fr_.95fr] md:items-center md:py-20">
            <div>
              <p className="text-sm font-medium uppercase text-primary">
                Robotics, taught from the foundations up
              </p>
              <h1 className="pixel-title mt-5 max-w-3xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                <span>Learn the system.</span>
                <br />
                <span className="pixel-title-accent">Then move the machine.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                A quiet, practical route from a clean Ubuntu installation to C++, ROS 2 Lyrical Luth
                and guided, simulation-first industrial robot exercises.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">
                <span>
                  <b className="text-primary">04</b> courses
                </span>
                <span>
                  <b className="text-primary">03</b> free
                </span>
                <span>
                  <b className="text-primary">01</b> guided robot course
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-xl pb-5 md:pb-0">
              <div
                className="absolute -left-4 -top-4 h-16 w-16 border-l-2 border-t-2 border-primary"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-4 -right-4 h-20 w-20 border-b-2 border-r-2 border-primary"
                aria-hidden="true"
              />
              <PixelArtFrame
                src={robots}
                alt="Pixel-art industrial robot arm in a workshop cell"
                label="ROBOT CELL 04"
                meta="LIVE WORKSHOP"
                imageClassName="aspect-[4/3]"
              />
              <div className="relative mx-4 -mt-4 grid grid-cols-3 border border-foreground/20 bg-background shadow-[4px_4px_0_var(--line)]">
                {[
                  { image: ubuntu, number: "01", label: "LINUX" },
                  { image: cpp, number: "02", label: "C++" },
                  { image: ros2, number: "03", label: "ROS 2" },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center gap-2 border-r border-border p-2 last:border-r-0"
                  >
                    <img
                      src={item.image.replace("-1280", "-640")}
                      alt=""
                      width={640}
                      height={357}
                      decoding="async"
                      className="size-9 border border-border object-cover"
                    />
                    <span className="font-mono text-[9px] leading-tight text-muted-foreground">
                      <b className="block text-primary">{item.number}</b>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="courses" className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs uppercase text-primary">The archive</p>
                <h2 className="mt-2 font-heading text-4xl md:text-5xl">Four courses, in order</h2>
              </div>
              <p className="hidden text-sm text-muted-foreground md:block">
                Start wherever your experience fits.
              </p>
            </div>
            <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-2">
              {courses.map((course) => (
                <article
                  key={course.number}
                  className="group bg-background p-4 transition-colors hover:bg-card md:p-6"
                >
                  <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                    <span>{course.number}</span>
                    <Link
                      to={course.to}
                      className="border border-border bg-card px-2 py-1 font-medium text-foreground hover:bg-secondary"
                    >
                      {course.price}
                    </Link>
                  </div>
                  <Link
                    to={course.to}
                    className="relative mt-4 block overflow-hidden border border-foreground/15 bg-secondary"
                  >
                    <img
                      src={course.image.replace("-1280", "-640")}
                      alt={course.alt}
                      width={640}
                      height={357}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <span className="absolute left-0 top-0 border-b border-r border-foreground/20 bg-background/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[.14em]">
                      Module {course.number}
                    </span>
                    <span
                      className="absolute bottom-2 right-2 size-2 border border-background bg-primary shadow-[3px_0_0_var(--background),0_3px_0_var(--background)]"
                      aria-hidden="true"
                    />
                  </Link>
                  <h3 className="mt-5 font-heading text-3xl">
                    <Link to={course.to}>{course.title}</Link>
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
                  <Link
                    to={course.to}
                    className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground"
                  >
                    <span>{course.details}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
          {[
            [
              "01",
              "Documentation-led",
              "Lessons follow official Ubuntu, ISO C++ and ROS 2 documentation, with source links on each course.",
            ],
            [
              "02",
              "Build as you learn",
              "Small workshop projects turn each concept into something observable, testable and useful.",
            ],
            [
              "03",
              "No invented promises",
              "Clear prerequisites, transparent pricing and no fabricated graduate or placement claims.",
            ],
          ].map(([n, title, copy]) => (
            <article key={n} className="border-t border-border pt-4">
              <span className="text-xs text-primary">{n}</span>
              <h2 className="mt-4 font-heading text-2xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-5 py-6 text-xs text-muted-foreground">
          <span>RobotCodeHub · www.robotcodehub.com</span>
          <nav className="flex gap-5">
            <Link to="/terms">Terms</Link>
            <Link to="/refunds">Refunds</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
