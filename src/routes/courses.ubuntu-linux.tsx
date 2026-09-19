import { createFileRoute } from "@tanstack/react-router";
import { DocumentedCoursePage } from "@/components/DocumentedCoursePage";
import { ubuntuCourse as course } from "@/lib/documented-courses";

export const Route = createFileRoute("/courses/ubuntu-linux")({
  head: () => ({
    meta: [
      { title: "Ubuntu Linux for Robotics | RobotCodeHub" },
      { name: "description", content: course.summary },
      { property: "og:title", content: course.title },
      { property: "og:description", content: course.summary },
      { property: "og:url", content: "https://robotcodehub.com/courses/ubuntu-linux" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://robotcodehub.com/courses/ubuntu-linux" }],
  }),
  component: () => <DocumentedCoursePage course={course} />,
});
