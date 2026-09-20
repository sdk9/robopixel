import { trackEntries } from "@/lib/cpp-curriculum";
import type { SignupTrack } from "./signups.functions";

export type Lesson = { n: string; title: string; detail: string; time: string; phase: string };
export type ProjectExample = { code: string; title: string; detail: string; snippet: string };

export type Track = {
  slug: SignupTrack;
  level: string;
  title: string;
  tagline: string;
  blurb: string;
  duration: string;
  lessonCount: string;
  prereq: string;
  price: string;
  outcomes: string[];
  lessons: Lesson[];
  projects: ProjectExample[];
  next: { label: string; to: string } | null;
};

function outline(key: "beginner" | "intermediate" | "advanced"): Lesson[] {
  return trackEntries(key).map((entry, index) => ({
    n: String(index + 1).padStart(2, "0"),
    title: entry.title,
    detail: entry.detail,
    time: entry.time,
    phase: entry.phase,
  }));
}

const beginnerLessons = outline("beginner");
const intermediateLessons = outline("intermediate");
const advancedLessons = outline("advanced");

export const tracks: Record<"beginner" | "intermediate" | "advanced", Track> = {
  beginner: {
    slug: "beginner",
    level: "Track 01 · Beginner",
    title: "C++ Beginner",
    tagline: "C++17 foundations and object-oriented programming, line by line.",
    blurb:
      "Phase 1 covers the toolchain, the core language, memory and RAII. Phase 2 adds encapsulation, inheritance, polymorphism, headers and error handling: the object model that ROS 2 is built on. Every lesson uses C++17 and puts a plain-English note under every line of code.",
    duration: `${beginnerLessons.length} lessons · 2 phases · self-paced`,
    lessonCount: `${beginnerLessons.length} lessons`,
    prereq: "None. A laptop and a terminal are enough.",
    price: "Free",
    outcomes: [
      "Compile, link and debug a multi-file C++17 program",
      "Use pointers, references, the stack and the heap safely",
      "Design classes with RAII, inheritance and virtual functions",
      "Handle errors with exceptions and std::optional",
    ],
    lessons: beginnerLessons,
    projects: [
      {
        code: "PRJ-01",
        title: "Sensor log parser & report",
        detail:
          "Read a robot telemetry file, compute min, max and mean per joint, and print a formatted report using std::string, std::array and streams.",
        snippet: `std::ifstream in{"joints.csv"};\ndouble torque{};\nwhile (in >> torque) { peak = std::max(peak, torque); }`,
      },
      {
        code: "PRJ-02",
        title: "Joint limit checker class",
        detail:
          "A small class that validates target angles against per-axis limits, keeps its invariant private, and reports violations with a clear message.",
        snippet: `class JointLimits {\npublic:\n  bool allows(int axis, double deg) const;\n};`,
      },
      {
        code: "PRJ-03",
        title: "Motor interface with a fake",
        detail:
          "An abstract MotorPort interface, a simulated motor for tests, and an application function that depends only on the interface.",
        snippet: `class MotorPort {\npublic:\n  virtual ~MotorPort() = default;\n  virtual bool command(double torque) = 0;\n};`,
      },
    ],
    next: { label: "Continue to C++ Intermediate", to: "/courses/cpp-intermediate" },
  },
  intermediate: {
    slug: "intermediate",
    level: "Track 02 · Intermediate",
    title: "C++ Intermediate",
    tagline: "Modern C++17, templates and CMake: the heart of ROS 2 C++.",
    blurb:
      "Phase 3 teaches modern C++ (C++11 to C++17): smart pointers, move semantics, lambdas, the STL, threads and the C++17 vocabulary types. Phase 4 covers templates and generic programming. Phase 5 covers CMake, gdb and clang-tidy, which every ROS 2 package depends on.",
    duration: `${intermediateLessons.length} lessons · 3 phases · self-paced`,
    lessonCount: `${intermediateLessons.length} lessons`,
    prereq: "C++ Beginner, or comfort with classes, pointers, references and virtual functions.",
    price: "Free",
    outcomes: [
      "Own memory with unique_ptr, shared_ptr and move semantics",
      "Use lambdas, STL containers, algorithms, threads and futures",
      "Write templates and choose code by type with if constexpr",
      "Build, debug and analyse a multi-target project with CMake, gdb and clang-tidy",
    ],
    lessons: intermediateLessons,
    projects: [
      {
        code: "PRJ-04",
        title: "Fixed-capacity telemetry ring",
        detail:
          "A ring buffer class template holding any sample type, protected by a mutex so a producer thread and a consumer thread can share it safely.",
        snippet: `template <typename T, std::size_t N>\nclass RingBuffer {\n  std::array<T, N> data_{};\npublic:\n  bool push(const T& v);\n};`,
      },
      {
        code: "PRJ-05",
        title: "Owned device handle",
        detail:
          "Wrap a fake serial device in a move-only RAII type that can never leak or double-close its handle, and transfer it between owners with std::move.",
        snippet: `class Device {\n  int fd_{-1};\npublic:\n  Device(Device&& o) noexcept : fd_{std::exchange(o.fd_, -1)} {}\n  ~Device() { if (fd_ >= 0) ::close(fd_); }\n};`,
      },
      {
        code: "PRJ-06",
        title: "Generic trajectory interpolator",
        detail:
          "One templated interpolator that works for scalars, 2D points and 6-axis joint vectors, built as a CMake library with unit tests.",
        snippet: `template <typename P>\nP lerp(const P& a, const P& b, double t) {\n  return a + (b - a) * t;\n}`,
      },
    ],
    next: { label: "Continue to C++ Advanced", to: "/courses/cpp-advanced" },
  },
  advanced: {
    slug: "advanced",
    level: "Track 03 · Advanced",
    title: "C++ Advanced",
    tagline: "Node-style C++17 design, then real ROS 2 C++ from nodes to lifecycle nodes.",
    blurb:
      "Phase 6 trains your C++ for ROS 2's architecture without ROS installed: node-like classes, callbacks, event loops, thread-safe queues and timers. Phase 7 is the actual ROS 2 C++ course: nodes, publishers, subscribers, services, actions, parameters, launch files, TF2, URDF, Gazebo, Nav2, packages, executors and lifecycle nodes.",
    duration: `${advancedLessons.length} lessons · 2 phases · self-paced`,
    lessonCount: `${advancedLessons.length} lessons`,
    prereq: "C++ Intermediate, or working experience with smart pointers, lambdas, templates and CMake.",
    price: "Free",
    outcomes: [
      "Structure code as node-like classes with callbacks, queues and timers",
      "Write ROS 2 nodes, publishers, subscribers, services and actions in C++17",
      "Describe a robot with URDF, transform it with TF2 and simulate it in Gazebo",
      "Package, launch and manage ROS 2 systems with executors and lifecycle nodes",
    ],
    lessons: advancedLessons,
    projects: [
      {
        code: "PRJ-07",
        title: "Event loop and thread-safe queue",
        detail:
          "A small event dispatcher with a blocking thread-safe queue, a worker thread and a fixed-rate timer, built without ROS so the ideas are clear.",
        snippet: `queue.push(Event{"temperature", 42.0});\nauto e = queue.pop();  // blocks until an event arrives\nhandlers.at(e.type)(e);`,
      },
      {
        code: "PRJ-08",
        title: "Temperature node pair",
        detail:
          "A publisher and subscriber package with parameters, a launch file and a gtest, built with colcon and inspected with the ros2 CLI.",
        snippet: `pub_ = create_publisher<std_msgs::msg::Float64>("temperature", 10);\ntimer_ = create_wall_timer(500ms, [this] { publish_sample(); });`,
      },
      {
        code: "PRJ-09",
        title: "Simulated mobile robot",
        detail:
          "A URDF robot spawned in Gazebo, driven by a C++ node, with TF2 frames and a Nav2 goal sent through the NavigateToPose action.",
        snippet: `auto client = rclcpp_action::create_client<Nav>(node, "navigate_to_pose");\nclient->async_send_goal(goal);`,
      },
    ],
    next: { label: "Continue to ROS 2 Lyrical Luth", to: "/courses/ros2-lyrical" },
  },
};
