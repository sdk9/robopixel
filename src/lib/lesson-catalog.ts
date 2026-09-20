import { practiceByTitle, splitPractice, trackEntries, type CppEntry } from "@/lib/cpp-curriculum";
import { tracks } from "@/lib/cpp-tracks";
import { ros2Course, ubuntuCourse } from "@/lib/documented-courses";
import { industrialLessonOutlines } from "@/lib/industrial-lessons-public";
import type { RobotLabConfig } from "@/lib/robot-lab";

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  duration: string;
  objectives: string[];
  concept: string[];
  steps: string[];
  example: string;
  codeWalkthrough: string[];
  expected: string[];
  troubleshooting: Array<{ symptom: string; fix: string }>;
  exercise: string;
  checklist: string[];
  notes?: string[];
  sourceLabel?: string;
  sourceHref?: string;
  image?: {
    src: string;
    alt: string;
    label: string;
  };
  lab?: RobotLabConfig;
  /** C++ course only: hands-on practice code (starter with TODOs, full solution, expected output). */
  practice?: { lang: "cpp" | "cmake" | "ros"; starter: string; solution: string; output: string } | undefined;
  /** Industrial course only: the module and section the lesson belongs to. */
  module?: string | undefined;
  section?: string | undefined;
};

export type LessonCourse = {
  slug: string;
  title: string;
  href: string;
  paid: boolean;
  sourceLabel: string;
  sourceHref: string;
  lessons: Lesson[];
};

export function lessonSlug(index: number, title: string) {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${String(index + 1).padStart(2, "0")}-${words}`;
}

const code = (...lines: string[]) => lines.join("\n");

function teachingFields(title: string, summary: string, kind: "cpp" | "ubuntu" | "ros2") {
  const concept = kind === "cpp" ? undefined : documentedConcepts[title];
  return {
    objectives: [
      `Explain ${title.toLowerCase()} in your own words`,
      `Use it in a small ${kind === "ubuntu" ? "workstation" : "robotics"} example`,
      "Verify the result instead of assuming it worked",
    ],
    concept: concept ?? [
      summary,
      "Learn the rule first, then use the smallest working example to see where it applies and where it does not.",
    ],
    codeWalkthrough:
      kind === "cpp"
        ? [
            "Read declarations from right to left: identify each value's type, name, and initial value.",
            "Follow the data through each expression before considering syntax shortcuts.",
            "Compile with warnings enabled; a clean build is part of the result, not an optional polish step.",
          ]
        : kind === "ubuntu"
          ? [
              "Lines without sudo only inspect or change files you own; sudo authorizes a system-wide change.",
              "Read command output before moving to the next line. Stop if names, versions, disks, or paths differ from the lesson.",
              "Comments beginning with # explain safety checks and are not executed by the shell.",
            ]
          : [
              "The ros2 commands query the running graph; they do not prove that a node's internal behavior is correct.",
              "Build from the workspace root, then source install/setup.bash so the shell can discover the new package.",
              "Use a second sourced terminal to inspect nodes and interfaces while the example runs.",
            ],
    expected:
      kind === "cpp"
        ? [
            "After adding the shown fragment to the guided exercise with its listed headers and surrounding program, the finished program builds with -Wall -Wextra -Wpedantic.",
            "Changing the stated input produces the result you predicted.",
          ]
        : kind === "ubuntu"
          ? [
              "Each command completes without an unexplained error.",
              "Your notes contain the command, the important output, and what it proves.",
            ]
          : [
              "ROS_DISTRO is lyrical in every terminal used for the exercise.",
              "The complete package from the exercise builds and the expected graph entity appears in a second terminal.",
            ],
    troubleshooting:
      kind === "cpp"
        ? [
            {
              symptom: "The compiler reports that a name or type is unknown.",
              fix: "Start at the first error. Check spelling, required #include lines, and whether the declaration appears before use.",
            },
            {
              symptom: "The program runs but the value is wrong.",
              fix: "Print the inputs and intermediate values, then check conversions, units, and collection order.",
            },
          ]
        : kind === "ubuntu"
          ? [
              {
                symptom: "A command says permission denied.",
                fix: "Check ownership and permissions first. Do not add sudo unless the command changes a documented system location.",
              },
              {
                symptom: "A command or package is not found.",
                fix: "Check spelling, Ubuntu version, enabled repositories, and whether the previous installation command succeeded.",
              },
            ]
          : [
              {
                symptom: "ros2 cannot find a package or executable.",
                fix: "Source /opt/ros/lyrical/setup.bash, build from the workspace root, then source install/setup.bash in that terminal.",
              },
              {
                symptom: "Nodes run but cannot discover each other.",
                fix: "Confirm both terminals use Lyrical, the same ROS_DOMAIN_ID, and compatible network/discovery settings.",
              },
            ],
  };
}

function cppPractice(title: string): Lesson["practice"] {
  const item = practiceByTitle[title];
  if (!item) return undefined;
  return { lang: item.lang, output: item.output, ...splitPractice(item.code) };
}

function cppLesson(entry: CppEntry, index: number): Lesson {
  return {
    slug: lessonSlug(index, entry.title),
    title: entry.title,
    summary: entry.detail,
    duration: entry.time,
    ...teachingFields(entry.title, entry.detail, "cpp"),
    concept: entry.concept,
    steps: [
      `Read the ${entry.title.toLowerCase()} example and identify what each line owns or changes.`,
      "Create a small source file, compile with -std=c++17 and warnings enabled, and run it.",
      "Change one input, predict the result before running, then compare the output.",
      "Record one compiler or runtime error and explain the correction in your own words.",
    ],
    example: entry.example,
    exercise: entry.exercise,
    checklist: [
      "The program builds with -std=c++17 and no warnings",
      "You can explain the key rule without reading the example",
      "The normal and edge cases both have recorded results",
    ],
    module: entry.phase,
    practice: cppPractice(entry.title),
  };
}
const ubuntuExamples = [
  code(
    `lsb_release -a`,
    `# Print the Ubuntu release and codename, so you know which version you are on.`,
    `lsblk -f`,
    `# List disks and partitions with their filesystems; identify the right device before touching any disk.`,
    `free -h`,
    `# Show total, used and free memory in human-readable units (MB/GB).`,
    `# Back up important files before changing disks.`,
  ),
  code(
    `pwd`,
    `# Print the working directory, the folder that relative paths start from.`,
    `mkdir -p ~/robot_ws/src`,
    `# Create the workspace folders; -p also creates missing parents and does not fail if they already exist.`,
    `cd ~/robot_ws`,
    `# Move into the workspace folder (~ means your home directory).`,
    `printf 'robot workspace\\n' > README.txt`,
    `# Write the text "robot workspace" into README.txt; > overwrites the file if it already exists.`,
    `cat README.txt`,
    `# Print the file's contents to check that the write worked.`,
  ),
  code(
    `id`,
    `# Show your user name, user ID and the groups you belong to.`,
    `ls -l ~/robot_ws`,
    `# List the workspace in long format: owner, group and permission bits for each entry.`,
    `chmod u+x ./check-system.sh`,
    `# Add execute permission for the file's owner (u = user) only; nobody else gains access.`,
    `# Use sudo only for commands that require administration.`,
  ),
  code(
    `sudo apt update`,
    `# Refresh the package index from the configured repositories; installed software is not changed.`,
    `apt list --upgradable`,
    `# Show which installed packages have newer versions available (read-only, no sudo needed).`,
    `apt show cmake`,
    `# Display details about the cmake package (version, dependencies, description) before installing it.`,
    `sudo apt install cmake git build-essential`,
    `# Install CMake, Git and the compiler toolchain; sudo is needed because this changes the whole system.`,
  ),
  code(
    `ps aux | head`,
    `# List running processes, then pipe (|) the output to head so only the first ten lines are shown.`,
    `systemctl --failed`,
    `# List the systemd services that failed to start, a common cause of missing features.`,
    `ip address`,
    `# Show each network interface and its IP addresses.`,
    `ss -lnt`,
    `# Show TCP ports that are listening (-l), as numbers (-n), so you know which services accept connections.`,
    `resolvectl status`,
    `# Show DNS settings, to check that names can be translated to addresses.`,
  ),
  code(
    `git --version`,
    `# Print the installed Git version, which confirms Git is available.`,
    `g++ --version`,
    `# Print the C++ compiler version.`,
    `cmake --version`,
    `# Print the CMake version.`,
    `mkdir -p ~/robot_ws/src`,
    `# Create the workspace source folder if it is not there yet (safe to repeat).`,
    `printenv | sort | less`,
    `# List all environment variables, sort them alphabetically, and page through them (press q to quit).`,
  ),
];

const rosExamples = [
  code(
    `sudo apt install software-properties-common curl`,
    `# Install the tools needed to manage repositories and download files.`,
    `sudo add-apt-repository universe`,
    `# Enable Ubuntu's "universe" repository, which ROS 2 packages depend on.`,
    `sudo apt update && sudo apt install curl -y`,
    `# Refresh the package index, then (only if that worked) make sure curl is installed; -y answers yes automatically.`,
    `export ROS_APT_SOURCE_VERSION=$(curl -s https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest | grep -F 'tag_name' | awk -F'"' '{print $4}')`,
    `# Ask GitHub for the newest ros-apt-source release, extract its tag name, and store it in a shell variable.`,
    `curl -L -o /tmp/ros2-apt-source.deb "https://github.com/ros-infrastructure/ros-apt-source/releases/download/\${ROS_APT_SOURCE_VERSION}/ros2-apt-source_\${ROS_APT_SOURCE_VERSION}.$(. /etc/os-release && echo $VERSION_CODENAME)_all.deb"`,
    `# Download the package that configures the ROS 2 repository for your Ubuntu codename and save it to /tmp.`,
    `sudo dpkg -i /tmp/ros2-apt-source.deb`,
    `# Install the downloaded package, which adds the ROS 2 repository and its signing key.`,
    `sudo apt update && sudo apt upgrade`,
    `# Refresh the index so it includes the ROS repository, then upgrade installed packages.`,
    `sudo apt install ros-lyrical-desktop ros-dev-tools`,
    `# Install the ROS 2 Lyrical desktop distribution plus its development tools.`,
    `source /opt/ros/lyrical/setup.bash`,
    `# Load the ROS environment into this terminal only; new terminals need it again.`,
    `printenv ROS_DISTRO`,
    `# Print the ROS distribution name; it should say lyrical.`,
  ),
  code(
    `ros2 node list`,
    `# Show the names of the nodes currently running in the ROS graph.`,
    `ros2 topic list -t`,
    `# Show every topic, with -t adding each topic's message type.`,
    `ros2 service list`,
    `# Show the available services (request and response calls).`,
    `ros2 action list`,
    `# Show the available actions (long-running goals with feedback and cancellation).`,
  ),
  code(
    `ros2 pkg create --build-type ament_cmake --license Apache-2.0 robot_nodes --dependencies rclcpp std_msgs`,
    `# Generate a new C++ package named robot_nodes using CMake, with an Apache-2.0 license, depending on rclcpp and std_msgs.`,
    `colcon build --symlink-install`,
    `# Build the workspace; --symlink-install links installed files back to the source so some edits apply without a rebuild.`,
  ),
  code(
    `ros2 interface show example_interfaces/srv/AddTwoInts`,
    `# Print the definition of a service type: its request fields, then its response fields.`,
    `ros2 param list`,
    `# List the parameters (configuration values) of the running nodes.`,
    `ros2 action list -t`,
    `# List the actions along with their types.`,
  ),
  code(
    `ros2 launch robot_bringup system.launch.py`,
    `# Start every node, parameter and remapping described in the launch file with a single command.`,
    `ros2 bag record /scan /odom`,
    `# Record the /scan and /odom topics to a bag file, so the event can be replayed and studied later.`,
    `ros2 doctor --report`,
    `# Print a diagnostic report about your ROS installation and network setup.`,
  ),
  code(
    `mkdir -p ~/robot_ws/src`,
    `# Create the workspace and its src folder, where source packages live.`,
    `cd ~/robot_ws`,
    `# Move to the workspace root; colcon must be run from here.`,
    `colcon build`,
    `# Find every package under src, order them by dependency, and build them.`,
    `source install/setup.bash`,
    `# Load the freshly built workspace (the overlay) into this terminal so ROS can find your packages.`,
  ),
  code(
    `ros2 interface show sensor_msgs/msg/JointState`,
    `# Print the fields of the standard JointState message (names, positions, velocities, efforts).`,
    `# Define project interfaces in a dedicated interface package.`,
  ),
  code(
    `rclcpp_components_register_nodes(robot_components`,
    `# Start a CMake call that registers node classes from the robot_components library as loadable components.`,
    `  "robot::SensorComponent")`,
    `  # The fully qualified class to register, so it can be loaded into a shared component container at runtime.`,
    `# Select executor and callback groups from measured concurrency needs.`,
  ),
];

const documentedConcepts: Record<string, string[]> = {
  "Installation planning": [
    "Installing an operating system changes the disk that stores your files, so preparation matters more than speed. First identify the computer, storage devices, firmware mode, network access, and anything that must be backed up.",
    "Ubuntu 26.04 is the target for this course because it is the Tier 1 platform for ROS 2 Lyrical Luth. Do not format or repartition a disk until the device names and backup are independently checked.",
  ],
  "Terminal essentials": [
    "The shell reads a command, starts a program, and displays its output. Your working directory is the folder relative paths begin from; an absolute path begins at the filesystem root `/`.",
    "Pipes send one program's output into another program. Redirection writes output to a file. These are composable tools, but redirection can overwrite data, so inspect the destination first.",
  ],
  "Users and permissions": [
    "Linux evaluates permissions for the file owner, its group, and everyone else. Read, write, and execute have different meanings for files and directories.",
    "sudo runs one command with administrative authority. It is not a cure for permission errors: first decide who should own the file and whether the requested operation truly changes the whole system.",
  ],
  "Packages and updates": [
    "APT installs signed packages from configured repositories and tracks their dependencies. `apt update` refreshes the package index; it does not upgrade installed software.",
    "Inspect a package before installing it. Keep the official repository configuration coherent, and avoid mixing instructions written for another Ubuntu or ROS release.",
  ],
  "Processes and networking": [
    "A process is a running program; a service is commonly managed by systemd so it can start, stop, and report status consistently. A failed service often explains why a device or network feature is missing.",
    "An IP address identifies an interface, a port identifies a network service, and DNS translates names. Check these layers in order instead of treating every connection problem as the same failure.",
  ],
  "Developer workstation": [
    "A dependable workstation has known versions of Git, the compiler, CMake, and ROS tools. Environment variables influence what commands and packages the shell can discover.",
    "Keep source code under the workspace `src` directory and generated build, install, and log files at the workspace root. This structure is what colcon expects later.",
  ],
  "Install and configure": [
    "ROS 2 Lyrical is a distribution: a tested collection of packages released together. The desktop package installs the core middleware, command-line tools, common libraries, and visual tools.",
    "Sourcing `/opt/ros/lyrical/setup.bash` modifies the current shell environment only. New terminals need to source it again unless you deliberately add the command to your shell startup file.",
  ],
  "CLI and the ROS graph": [
    "The ROS graph is the live network of nodes and their topics, services, actions, and parameters. A node is a named process participant; interfaces are the typed contracts between participants.",
    "Use graph inspection before reading code. If an expected topic does not exist, the problem is earlier than message contents or callback logic.",
  ],
  "Nodes and topics": [
    "A publisher sends a stream of typed messages to a topic; subscribers receive matching messages asynchronously. Neither side needs to know the other's process location.",
    "Topics fit ongoing data such as joint state or sensor samples. Queue depth and Quality of Service define what happens when producers, consumers, or networks run at different rates.",
  ],
  "Services, parameters and actions": [
    "A service is a short request and response. An action represents longer work with feedback and cancellation. A parameter configures a node. Choosing the correct pattern makes failure and progress visible.",
    "Do not use a service for motion that takes seconds: its lack of progress and cancellation semantics makes the system harder to operate safely.",
  ],
  "Launch, rosbag and diagnostics": [
    "A launch file starts a repeatable system with node names, parameters, remappings, and conditions in one place. rosbag records typed traffic so an event can be replayed and studied.",
    "Diagnostics should answer what failed and where to look next. Record the graph and relevant topics before restarting a faulty system, because a restart destroys evidence.",
  ],
  "Workspaces and packages": [
    "A workspace is a directory containing source packages and generated build results. colcon discovers packages, orders them by dependency, and invokes each package's build system.",
    "An underlay is the installed ROS distribution; your built workspace becomes an overlay. Source them in that order so your packages are discoverable without replacing the base installation.",
  ],
  "Custom interfaces": [
    "Messages, services, and actions are language-neutral contracts. Keeping project interfaces in a dedicated package prevents circular dependencies and lets C++ and Python nodes agree on the same generated types.",
    "Change an interface deliberately: every dependent package must rebuild, and deployed nodes must use compatible definitions.",
  ],
  "C++ components": [
    "A component is a node that can be loaded into a shared process. Composition can reduce communication overhead, but one process also means failures and executor choices are shared.",
    "Executors schedule callbacks. Callback groups state which callbacks may overlap. Choose them from measured concurrency needs, not as a shortcut to make blocked code appear faster.",
  ],
};

const documentedExercises: Record<string, string> = {
  "Installation planning":
    "Create an installation worksheet listing CPU, RAM, firmware mode, disk model and size, backup location, network adapter, and Ubuntu 26.04 image checksum. Stop before making disk changes.",
  "Terminal essentials":
    "Create ~/robot_ws/src, write a README, list it using both relative and absolute paths, pipe the listing through a filter, and explain every command in your notes.",
  "Users and permissions":
    "Create a private script, inspect its owner and mode, add execute permission only for yourself, run it, then explain why chmod 777 is unnecessary.",
  "Packages and updates":
    "Refresh package metadata, inspect the available CMake version, install the development tools, and record which command changed the system and which commands only inspected it.",
  "Processes and networking":
    "Produce a short health report containing failed services, interface addresses, listening ports, and DNS status. Label each output with the question it answers.",
  "Developer workstation":
    "Build a repeatable workstation checklist that verifies Git, g++, CMake, the ~/robot_ws/src layout, and the environment used by a fresh terminal.",
  "Install and configure":
    "Install the documented Lyrical desktop package, source it in a fresh terminal, and record the exact ROS_DISTRO output plus the path of the ros2 executable.",
  "CLI and the ROS graph":
    "Run a small demo node, then create a graph inventory listing its node name, topics with types, services, actions, and parameters. Explain which entries disappear when the node stops.",
  "Nodes and topics":
    "Create a C++ temperature publisher and subscriber. Publish once per second, inspect the type and rate from a second terminal, then change the rate and explain the observed result.",
  "Services, parameters and actions":
    "Design one robot behavior three ways, then implement the appropriate interface: parameter for configuration, service for a quick reset, and cancellable action for a timed movement.",
  "Launch, rosbag and diagnostics":
    "Launch two nodes with parameters, record their important topic for 20 seconds, stop the system, and replay the bag while documenting one injected failure.",
  "Workspaces and packages":
    "Create two ament_cmake packages where one library is used by one executable. Build with colcon, source the overlay, and prove dependency discovery from a fresh terminal.",
  "Custom interfaces":
    "Create a RobotStatus message with timestamp, mode, and fault code; publish it from C++; inspect the generated definition and received values with the CLI.",
  "C++ components":
    "Convert two simple nodes into components, load them into one container, inspect the graph, and compare process count and failure boundaries with separate executables.",
};

function documentedLesson(
  kind: "ubuntu" | "ros2",
  title: string,
  summary: string,
  index: number,
): Lesson {
  const isUbuntu = kind === "ubuntu";
  return {
    slug: lessonSlug(index, title),
    title,
    summary,
    duration: "45–75 min",
    ...teachingFields(title, summary, kind),
    steps: isUbuntu
      ? [
          "Open a terminal and record the current state before changing anything.",
          `Follow the guided ${title.toLowerCase()} commands one at a time.`,
          "Read each command's output and compare it with the expected state.",
          "Write the successful commands in a setup note you can repeat later.",
        ]
      : [
          "Source the ROS 2 Lyrical environment in a fresh terminal.",
          `Run the ${title.toLowerCase()} inspection commands before creating code.`,
          "Build only the affected package, then source the workspace overlay.",
          "Inspect the ROS graph and verify the result from a second terminal.",
        ],
    example: (isUbuntu ? ubuntuExamples : rosExamples)[index] ?? "",
    exercise:
      documentedExercises[title] ??
      (isUbuntu
        ? `Complete a safe ${title.toLowerCase()} check on your workstation and save the commands plus outputs in a text file.`
        : `Create a minimal ROS 2 workspace demonstration for ${title.toLowerCase()}, then prove it works with the ROS 2 CLI.`),
    checklist: isUbuntu
      ? [
          "You recorded the starting state",
          "Every command and output is understood",
          "The change can be repeated from your notes",
        ]
      : [
          "ROS_DISTRO reports lyrical",
          "The workspace builds without errors",
          "The expected node, topic, service, or action is visible in the graph",
        ],
  };
}

function cppCourse(key: keyof typeof tracks, slug: string): LessonCourse {
  const track = tracks[key];
  return {
    slug,
    title: track.title,
    href: `/courses/${slug}`,
    paid: false,
    sourceLabel: "ISO C++ resources",
    sourceHref: "https://isocpp.org/",
    lessons: trackEntries(key).map((entry, index) => cppLesson(entry, index)),
  };
}

export const lessonCourses: Record<string, LessonCourse> = {
  "ubuntu-linux": {
    slug: ubuntuCourse.slug,
    title: ubuntuCourse.title,
    href: "/courses/ubuntu-linux",
    paid: false,
    sourceLabel: "Ubuntu documentation",
    sourceHref: "https://documentation.ubuntu.com/",
    lessons: ubuntuCourse.lessons.map((lesson, index) =>
      documentedLesson("ubuntu", lesson.title, lesson.detail, index),
    ),
  },
  "cpp-beginner": cppCourse("beginner", "cpp-beginner"),
  "cpp-intermediate": cppCourse("intermediate", "cpp-intermediate"),
  "cpp-advanced": cppCourse("advanced", "cpp-advanced"),
  "ros2-lyrical": {
    slug: ros2Course.slug,
    title: ros2Course.title,
    href: "/courses/ros2-lyrical",
    paid: false,
    sourceLabel: "ROS 2 Lyrical tutorials",
    sourceHref: "https://docs.ros.org/en/lyrical/Tutorials.html",
    lessons: ros2Course.lessons.map((lesson, index) =>
      documentedLesson("ros2", lesson.title, lesson.detail, index),
    ),
  },
  "industrial-robots": {
    slug: "industrial-robots",
    title: "Industrial Robots",
    href: "/courses/industrial-robots",
    paid: true,
    sourceLabel: "ros2_control documentation",
    sourceHref: "https://control.ros.org/lyrical/",
    lessons: industrialLessonOutlines,
  },
};

export function getLesson(courseSlug: string, lessonSlugValue: string) {
  const course = lessonCourses[courseSlug];
  if (!course) return null;
  const index = course.lessons.findIndex((lesson) => lesson.slug === lessonSlugValue);
  if (index < 0) return null;
  const lesson = course.lessons[index];
  if (!lesson) return null;
  return { course, lesson, index };
}
