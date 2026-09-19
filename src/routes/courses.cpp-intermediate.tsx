import { createFileRoute } from "@tanstack/react-router";

import { CourseTrackPage } from "@/components/CourseTrackPage";
import { tracks } from "@/lib/cpp-tracks";

const title = "C++ Intermediate — RAII, move semantics and templates";
const description =
  "A self-paced intermediate C++ course on object lifetime, smart pointers, move semantics, templates, threads and performance, with three engineering project briefs.";

export const Route = createFileRoute("/courses/cpp-intermediate")({
  head: () => ({
    meta: [
      { title: `${title} | RobotCodeHub` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://robotcodehub.com/courses/cpp-intermediate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/courses/cpp-intermediate" }],
  }),
  component: () => <CourseTrackPage track={tracks.intermediate} />,
});
