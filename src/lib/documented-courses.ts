import type { SignupTrack } from "@/lib/signups.functions";

export type DocumentedCourse = {
  track: SignupTrack;
  slug: "ubuntu-linux" | "ros2-lyrical";
  eyebrow: string;
  title: string;
  summary: string;
  duration: string;
  prerequisite: string;
  image: string;
  imageAlt: string;
  outcomes: string[];
  lessons: Array<{ title: string; detail: string }>;
  projects: Array<{ title: string; detail: string }>;
  verified: string;
  sources: Array<{ label: string; href: string }>;
};

export const ubuntuCourse: DocumentedCourse = {
  track: "ubuntu",
  slug: "ubuntu-linux",
  eyebrow: "Course 01",
  title: "Ubuntu Linux for Robotics",
  summary:
    "Set up Ubuntu with confidence, learn the terminal and prepare a clean development environment for ROS 2 Lyrical Luth.",
  duration: "6 units · self-paced",
  prerequisite: "None",
  image: "/images/ubuntu-1280.webp",
  imageAlt: "Pixel-art Ubuntu robotics workstation with a laptop and tools",
  outcomes: [
    "Install Ubuntu safely",
    "Navigate files from the terminal",
    "Manage permissions and processes",
    "Install trusted packages",
    "Diagnose basic networking",
    "Prepare a ROS-ready workspace",
  ],
  lessons: [
    {
      title: "Installation planning",
      detail:
        "Hardware checks, backups, installation media, disk choices and the supported Ubuntu 26.04 target.",
    },
    {
      title: "Terminal essentials",
      detail: "Shell navigation, paths, files, pipes, redirection and built-in help.",
    },
    {
      title: "Users and permissions",
      detail: "Ownership, groups, sudo and executable permissions without unsafe shortcuts.",
    },
    {
      title: "Packages and updates",
      detail: "APT repositories, package installation, upgrades and package inspection.",
    },
    {
      title: "Processes and networking",
      detail: "Inspect jobs and services, addresses, ports, DNS and common connectivity checks.",
    },
    {
      title: "Developer workstation",
      detail: "Git, compilers, CMake, environment variables and a clean ROS 2-ready setup.",
    },
  ],
  projects: [
    {
      title: "Safe workstation setup",
      detail: "Install and document a repeatable Ubuntu development environment.",
    },
    {
      title: "System health report",
      detail: "Build a shell-based report for disk, memory, processes and networking.",
    },
    {
      title: "Robotics workspace",
      detail: "Prepare and validate the directories, tools and environment used in later courses.",
    },
  ],
  verified: "September 2026",
  sources: [
    { label: "Ubuntu Desktop documentation", href: "https://documentation.ubuntu.com/desktop/" },
    { label: "Ubuntu Server documentation", href: "https://documentation.ubuntu.com/server/" },
  ],
};

export const ros2Course: DocumentedCourse = {
  track: "ros2",
  slug: "ros2-lyrical",
  eyebrow: "Course 03",
  title: "ROS 2 Lyrical Luth",
  summary:
    "Follow the official ROS 2 learning sequence on its Tier 1 platform, Ubuntu 26.04, then build dependable C++ robot software.",
  duration: "8 units · self-paced",
  prerequisite: "Ubuntu course and C++ Beginner",
  image: "/images/ros2-1280.webp",
  imageAlt: "Pixel-art mobile robot with LiDAR being tested in a clean workshop",
  outcomes: [
    "Install and source ROS 2 correctly",
    "Inspect a running ROS graph",
    "Build nodes with rclcpp",
    "Choose topics, services and actions",
    "Create packages and interfaces",
    "Record and diagnose systems",
  ],
  lessons: [
    {
      title: "Install and configure",
      detail:
        "Official apt packages for ROS 2 Lyrical Luth on Ubuntu 26.04, environment sourcing and domain settings.",
    },
    {
      title: "CLI and the ROS graph",
      detail: "Discover nodes, topics, services, parameters and actions with command-line tools.",
    },
    {
      title: "Nodes and topics",
      detail: "Create C++ nodes and exchange streaming data with publishers and subscribers.",
    },
    {
      title: "Services, parameters and actions",
      detail: "Use each communication pattern for the kind of work it fits.",
    },
    {
      title: "Launch, rosbag and diagnostics",
      detail: "Start complete systems, record data and investigate runtime behavior.",
    },
    {
      title: "Workspaces and packages",
      detail: "Build with colcon, structure ament_cmake packages and manage dependencies.",
    },
    {
      title: "Custom interfaces",
      detail: "Define and use messages, services and actions from C++ packages.",
    },
    {
      title: "C++ components",
      detail: "Composition, executors, callback groups and lifecycle-aware design.",
    },
  ],
  projects: [
    {
      title: "Sensor publisher",
      detail: "Publish typed sensor samples and inspect rates, values and QoS behavior.",
    },
    {
      title: "Navigation action",
      detail: "Build a cancellable action server with feedback and a C++ client.",
    },
    {
      title: "Diagnosable robot stack",
      detail: "Launch multiple nodes, record a bag and trace an injected failure.",
    },
  ],
  verified: "September 2026",
  sources: [
    { label: "ROS 2 Lyrical documentation", href: "https://docs.ros.org/en/lyrical/" },
    { label: "ROS 2 tutorials", href: "https://docs.ros.org/en/lyrical/Tutorials.html" },
  ],
};
