export const courseCatalog = {
  ubuntu: {
    id: "ubuntu",
    title: "Ubuntu Linux for Robotics",
    price: "Free",
    href: "/courses/ubuntu-linux",
  },
  cpp: {
    id: "cpp",
    title: "C++ for Robotics",
    price: "Free",
    href: "/courses/cpp-beginner",
  },
  ros2: {
    id: "ros2",
    title: "ROS 2 Lyrical Luth",
    price: "Free",
    href: "/courses/ros2-lyrical",
  },
  industrial: {
    id: "industrial_robots_course",
    title: "Industrial Robots",
    price: "$30",
    priceId: "industrial_robots_one_time",
    href: "/courses/industrial-robots",
  },
} as const;

export type FreeCourseId = "ubuntu" | "beginner" | "intermediate" | "advanced" | "ros2";

export const SUPPORT_EMAIL = "support@robotcodehub.com";
