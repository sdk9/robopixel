import { createFileRoute } from "@tanstack/react-router";
import { DocumentedCoursePage } from "@/components/DocumentedCoursePage";
import { ros2Course as course } from "@/lib/documented-courses";

export const Route = createFileRoute("/courses/ros2-lyrical")({
  head: () => ({
    meta: [
      { title: "ROS 2 Lyrical Luth | RobotCodeHub" },
      { name: "description", content: course.summary },
      { property: "og:title", content: course.title },
      { property: "og:description", content: course.summary },
      { property: "og:url", content: "https://robotcodehub.com/courses/ros2-lyrical" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/courses/ros2-lyrical" }],
  }),
  component: () => <DocumentedCoursePage course={course} />,
});
