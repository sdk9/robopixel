import { createFileRoute } from "@tanstack/react-router";

import { CourseTrackPage } from "@/components/CourseTrackPage";
import { tracks } from "@/lib/cpp-tracks";

const title = "C++17 Intermediate — modern C++, templates and CMake";
const description =
  "A free C++17 intermediate course: smart pointers, move semantics, lambdas, the STL, threads, futures, templates, CMake, gdb and clang-tidy.";

export const Route = createFileRoute("/courses/cpp-intermediate")({
  head: () => ({
    meta: [
      { title: `${title} | Code The Robot` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://codetherobot.com/courses/cpp-intermediate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://codetherobot.com/courses/cpp-intermediate" }],
  }),
  component: () => <CourseTrackPage track={tracks.intermediate} />,
});
