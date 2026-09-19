import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FolderTree } from "lucide-react";
import { labs } from "@/lib/lab-catalog";

export const Route = createFileRoute("/labs/")({
  head: () => ({
    meta: [
      { title: "ROS 2 Lab Workspace | RobotCodeHub" },
      {
        name: "description",
        content:
          "Build a ROS 2 Lyrical C++ workspace through eight guided, documentation-linked robotics labs.",
      },
      { property: "og:title", content: "ROS 2 Lab Workspace | RobotCodeHub" },
      { property: "og:url", content: "https://robotcodehub.com/labs" },
      {
        property: "og:description",
        content: "Eight guided ROS 2 Lyrical setup and C++ robotics labs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/labs" }],
  }),
  component: LabsIndex,
});

function LabsIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-4">
          <Link
            to="/courses/ros2-lyrical"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft className="size-4" />
            ROS 2 course
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="text-xs uppercase text-primary">Guided workspace</p>
        <h1 className="mt-3 max-w-4xl font-heading text-6xl leading-none md:text-7xl">
          Build one workspace, lab by lab.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Start on Ubuntu 26.04, create <code>~/robot_ws</code>, then add C++ nodes, communication,
          robot descriptions and simulated control.
        </p>
        <Link
          to="/practice"
          className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Practice every lab in your browser
          <ArrowRight className="size-4" />
        </Link>
        <div className="mt-8 border border-border bg-secondary p-5">
          <div className="flex gap-3">
            <FolderTree className="mt-1 size-5 text-primary" />
            <pre className="overflow-x-auto text-sm leading-relaxed">
              <code>{`~/robot_ws/\n├── src/\n│   ├── robot_basics/\n│   ├── robot_topics/\n│   ├── robot_interfaces/\n│   ├── robot_bringup/\n│   └── training_arm_description/\n├── build/\n├── install/\n└── log/`}</code>
            </pre>
          </div>
        </div>
        <ol className="mt-10 border-t border-border">
          {labs.map((lab) => (
            <li
              key={lab.slug}
              className="grid gap-3 border-b border-border py-5 md:grid-cols-[4rem_18rem_1fr_auto] md:items-center"
            >
              <span className="text-sm text-primary">{lab.number}</span>
              <h2 className="font-heading text-2xl">{lab.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {lab.summary} · {lab.duration}
              </p>
              <Link
                to="/labs/$labSlug"
                params={{ labSlug: lab.slug }}
                className="flex items-center gap-2 text-sm font-medium text-primary"
              >
                Open lab
                <ArrowRight className="size-4" />
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
