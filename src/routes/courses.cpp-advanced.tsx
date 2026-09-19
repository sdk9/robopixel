import { createFileRoute } from "@tanstack/react-router";

import { CourseTrackPage } from "@/components/CourseTrackPage";
import { tracks } from "@/lib/cpp-tracks";

const title = "C++ Advanced — real-time, deterministic robotics code";
const description =
  "A self-paced advanced C++ course on real-time constraints, custom allocators, lock-free queues, metaprogramming and measured control-loop timing.";

export const Route = createFileRoute("/courses/cpp-advanced")({
  head: () => ({
    meta: [
      { title: `${title} | RobotCodeHub` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://robotcodehub.com/courses/cpp-advanced" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/courses/cpp-advanced" }],
  }),
  component: () => <CourseTrackPage track={tracks.advanced} />,
});
