import { createFileRoute } from "@tanstack/react-router";

import { CourseTrackPage } from "@/components/CourseTrackPage";
import { tracks } from "@/lib/cpp-tracks";

const title = "C++17 Advanced — node-style design and ROS 2 C++";
const description =
  "A free C++17 advanced course: callbacks, event loops, thread-safe queues, timers, then ROS 2 nodes, topics, services, actions, TF2, URDF, Gazebo, Nav2 and lifecycle nodes.";

export const Route = createFileRoute("/courses/cpp-advanced")({
  head: () => ({
    meta: [
      { title: `${title} | Code The Robot` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "https://codetherobot.com/courses/cpp-advanced" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://codetherobot.com/courses/cpp-advanced" }],
  }),
  component: () => <CourseTrackPage track={tracks.advanced} />,
});
