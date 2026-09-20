import { createFileRoute } from "@tanstack/react-router";

import { CourseTrackPage } from "@/components/CourseTrackPage";
import { tracks } from "@/lib/cpp-tracks";

const title = "C++17 Beginner — foundations and object-oriented programming";
const description =
  "A free C++17 beginner course: compilers, syntax, memory, RAII, classes, inheritance, polymorphism, headers and error handling, with a note under every line of code.";

export const Route = createFileRoute("/courses/cpp-beginner")({
  head: () => ({
    meta: [
      { title: `${title} | Code The Robot` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://codetherobot.com/courses/cpp-beginner" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://codetherobot.com/courses/cpp-beginner" }],
  }),
  component: () => <CourseTrackPage track={tracks.beginner} />,
});
