import { createFileRoute } from "@tanstack/react-router";

import { CourseTrackPage } from "@/components/CourseTrackPage";
import { tracks } from "@/lib/cpp-tracks";

const title = "C++ Beginner — 8 units from first build to your own classes";
const description =
  "A 6-week beginner C++ course: toolchain, types, control flow, classes, pointers and the STL, with three hands-on robotics projects.";

export const Route = createFileRoute("/courses/cpp-beginner")({
  head: () => ({
    meta: [
      { title: `${title} | RobotCodeHub` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://robotcodehub.com/courses/cpp-beginner" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/courses/cpp-beginner" }],
  }),
  component: () => <CourseTrackPage track={tracks.beginner} />,
});
