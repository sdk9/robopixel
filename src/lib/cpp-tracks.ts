import type { SignupTrack } from "./signups.functions";

export type Lesson = { n: string; title: string; detail: string; time: string };
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

export const tracks: Record<"beginner" | "intermediate" | "advanced", Track> = {
  beginner: {
    slug: "beginner",
    level: "Track 01 · Beginner",
    title: "C++ Beginner",
    tagline: "From zero to a compiled program you understand line by line.",
    blurb:
      "Start with the toolchain and the language core: types, control flow, functions, and your first real classes. Every unit ends in code you compile and run yourself.",
    duration: "8 focused units · self-paced",
    lessonCount: "8 units",
    prereq: "None. A laptop and a terminal are enough.",
    price: "Free",
    outcomes: [
      "Compile, link and debug a multi-file C++ project",
      "Read and write modern C++ syntax with confidence",
      "Use the standard library containers and algorithms",
      "Reason about stack, heap and object lifetime",
    ],
    lessons: [
      {
        n: "01",
        title: "Toolchain & first build",
        detail: "g++, CMake, compilation stages, reading compiler errors.",
        time: "60–90m",
      },
      {
        n: "02",
        title: "Types, values, conversions",
        detail: "Integers, floats, auto, const correctness, narrowing traps.",
        time: "60–90m",
      },
      {
        n: "03",
        title: "Control flow & functions",
        detail: "Branching, loops, parameters, overloads, default arguments.",
        time: "60–90m",
      },
      {
        n: "04",
        title: "Arrays, vectors, strings",
        detail: "std::vector, std::string, iteration, range-based for.",
        time: "60–90m",
      },
      {
        n: "05",
        title: "Structs & classes",
        detail: "Members, constructors, encapsulation, const methods.",
        time: "60–90m",
      },
      {
        n: "06",
        title: "References & pointers",
        detail: "Address-of, dereference, null, passing by reference.",
        time: "60–90m",
      },
      {
        n: "07",
        title: "Standard algorithms",
        detail: "sort, find, transform, accumulate, lambdas as predicates.",
        time: "60–90m",
      },
      {
        n: "08",
        title: "Debugging & tests",
        detail: "gdb basics, assertions, first unit tests with Catch2.",
        time: "60–90m",
      },
    ],
    projects: [
      {
        code: "PRJ-01",
        title: "Sensor log parser & histogram",
        detail:
          "Read a robot telemetry CSV, compute min/max/mean per joint, print a formatted report and a histogram of torque values.",
        snippet: `std::vector<Sample> samples = load("joints.csv");\nauto peak = *std::max_element(samples.begin(), samples.end(),\n    [](auto& a, auto& b) { return a.torque < b.torque; });`,
      },
      {
        code: "PRJ-02",
        title: "Joint limit checker class",
        detail:
          "A small class that validates target angles against per-axis limits and reports violations with a human-readable message.",
        snippet: `class JointLimits {\npublic:\n  bool allows(int axis, double deg) const;\n};`,
      },
      {
        code: "PRJ-03",
        title: "Terminal gripper simulator loop program",
        detail:
          "A loop-driven console program that opens/closes a simulated gripper and tracks payload state with a simple physics model. The program reads commands from stdin and prints the gripper state to stdout. The loop runs at a fixed timestep and applies the commands to the gripper state. The program uses a simple physics model to simulate the gripper's behavior, including the effects of payload weight and friction. The program also includes a simple rendering function that displays the gripper state in the terminal.",
        snippet: `while (running) {\n  auto cmd = readCommand();\n  gripper.apply(cmd);\n  render(gripper.state());\n}`,
      },
    ],
    next: { label: "Continue to C++ Intermediate", to: "/courses/cpp-intermediate" },
  },
  intermediate: {
    slug: "intermediate",
    level: "Track 02 · Intermediate",
    title: "C++ Intermediate",
    tagline: "Own memory, templates and the object model like a systems engineer.",
    blurb:
      "The layer that separates hobby code from production robotics code: RAII, smart pointers, move semantics, templates and a working mental model of the compiler and the object model. Every unit ends in code you compile and run yourself. This track is a prerequisite for the C++ Advanced track.",
    duration: "8 focused units · self-paced",
    lessonCount: "8 units",
    prereq: "C++ Beginner, or comfort with classes, pointers and the STL.",
    price: "Free",
    outcomes: [
      "Design leak-free types with RAII and smart pointers",
      "Write move-aware classes that don't copy hot data unnecessarily",
      "Build generic components with templates and concepts",
      "Profile and remove real allocation hot spots",
    ],
    lessons: [
      {
        n: "01",
        title: "Object lifetime & RAII",
        detail: "Scope, destructors, resource ownership as a type rule and a design pattern.",
        time: "5h",
      },
      {
        n: "02",
        title: "Smart pointers",
        detail: "unique_ptr, shared_ptr, weak_ptr, ownership diagrams.",
        time: "5h",
      },
      {
        n: "03",
        title: "Copy, move, rule of five",
        detail: "Value categories, move constructors, std::move pitfalls and std::forward.",
        time: "6h",
      },
      {
        n: "04",
        title: "Templates & concepts",
        detail: "Function and class templates, constraints, type traits and SFINAE.",
        time: "6h",
      },
      {
        n: "05",
        title: "Error handling strategies",
        detail: "Exceptions vs expected, noexcept, error taxonomies, and error propagation.",
        time: "5h",
      },
      {
        n: "06",
        title: "Threads & synchronisation",
        detail: "std::thread, mutex, atomics, data-race hunting and deadlock avoidance.",
        time: "6h",
      },
      {
        n: "07",
        title: "Performance & memory layout",
        detail:
          "Cache lines, reserve, small-buffer tricks, perf profiling and memory layout analysis.",
        time: "5h",
      },
      {
        n: "08",
        title: "Build systems at scale",
        detail: "CMake targets, libraries, dependency hygiene and reproducible builds.",
        time: "4h",
      },
    ],
    projects: [
      {
        code: "PRJ-04",
        title: "Lock-free telemetry ring",
        detail:
          "A fixed-capacity ring buffer with a producer thread and a consumer thread, benchmarked for latency and throughput. The ring buffer is implemented as a template class that can hold any type of data. The producer thread pushes data into the ring buffer, while the consumer thread pops data from the ring buffer. The implementation uses atomic operations to ensure thread safety without locks. The project includes a benchmark that measures the latency and throughput of the ring buffer under different load conditions.",
        snippet: `template <typename T, std::size_t N>\nclass RingBuffer {\n  std::atomic<std::size_t> head_{0}, tail_{0};\npublic:\n  bool push(T value) noexcept;\n};`,
      },
      {
        code: "PRJ-05",
        title: "Owned device handle",
        detail:
          "Wrap a fake serial device in a move-only RAII type that can never leak or double-close its file descriptor. The Device class is implemented as a move-only type that manages a file descriptor. The constructor takes ownership of the file descriptor, and the destructor closes it if it is valid. The move constructor transfers ownership of the file descriptor to the new object, leaving the original object in a valid but unspecified state. The class ensures that the file descriptor is never leaked or double-closed, providing safe resource management.",
        snippet: `class Device {\n  int fd_{-1};\npublic:\n  Device(Device&&) noexcept;\n  ~Device() { if (fd_ >= 0) ::close(fd_); }\n};`,
      },
      {
        code: "PRJ-06",
        title: "Generic trajectory interpolator",
        detail:
          "One templated interpolator that works for scalars, 2D points and 6-axis joint vectors with a single interface. The Interpolator class is implemented as a template that can interpolate between two values of any type that supports linear interpolation. The class provides a method to compute the interpolated value at a given time t, where t is a value between 0 and 1. The implementation uses template specialization to handle different types, such as scalars, 2D points, and 6-axis joint vectors, allowing for a single interface to be used for all types.",
        snippet: `template <Interpolatable P>\nP lerp(const P& a, const P& b, double t);`,
      },
    ],
    next: { label: "Continue to C++ Advanced", to: "/courses/cpp-advanced" },
  },
  advanced: {
    slug: "advanced",
    level: "Track 03 · Advanced",
    title: "C++ Advanced",
    tagline:
      "Real-time, deterministic C++ for machines that must not miss a deadline or a heartbeat.",
    blurb:
      "Architecture and determinism: allocation-free control loops, lock-free messaging, deep template machinery and the discipline needed for code that drives actuators and reads sensors in real time. Every unit ends in code you compile and run yourself. This track is a prerequisite for the ROS 2 Lyrical Luth track.",
    duration: "8 focused units · self-paced",
    lessonCount: "8 units",
    prereq: "C++ Intermediate, or working experience with RAII, move semantics and templates.",
    price: "Free",
    outcomes: [
      "Design allocation-free control loops and measure their timing limits",
      "Design lock-free message paths between real-time threads",
      "Apply advanced templates and compile-time computation",
      "Instrument latency and prove timing budgets with data",
    ],
    lessons: [
      {
        n: "01",
        title: "Real-time constraints",
        detail: "Determinism, jitter budgets, priority inversion, what to ban and what to allow.",
        time: "6h",
      },
      {
        n: "02",
        title: "Custom allocators & pools",
        detail: "Arena allocation, pmr, allocation-free steady state.",
        time: "6h",
      },
      {
        n: "03",
        title: "Lock-free data structures",
        detail: "Memory order, SPSC queues, hazard-free designs and ABA avoidance.",
        time: "7h",
      },
      {
        n: "04",
        title: "Template metaprogramming",
        detail: "constexpr, CRTP, tag dispatch, compile-time unit checks and static reflection.",
        time: "7h",
      },
      {
        n: "05",
        title: "Architecture & interfaces",
        detail: "Layered control stacks, dependency inversion, plugins and ABI stability.",
        time: "6h",
      },
      {
        n: "06",
        title: "Sanitizers & static analysis",
        detail: "ASan, TSan, UBSan, clang-tidy in CI and pre-commit.",
        time: "5h",
      },
      {
        n: "07",
        title: "Latency instrumentation",
        detail:
          "Tracing, histograms, deadline-miss detection and reporting. The unit includes a hands-on exercise where students implement latency instrumentation in a control loop, collect timing data, and analyze the results to identify potential bottlenecks and areas for optimization.",
        time: "6h",
      },
      {
        n: "08",
        title: "Capstone hardening",
        detail:
          "Review, fuzzing, failure injection, release readiness and CI/CD pipelines. The unit includes a final project where students apply the concepts learned throughout the track to harden a real-time control system, ensuring it meets strict timing and reliability requirements.",
        time: "7h",
      },
    ],
    projects: [
      {
        code: "PRJ-07",
        title: "1 kHz control loop",
        detail:
          "A PID joint-controller simulation targeting a 1 ms period, with zero steady-state heap traffic and a measured jitter histogram; hard real-time is not claimed on a standard kernel. The project involves implementing a control loop that runs at a frequency of 1 kHz, using a PID controller to regulate the position of a simulated joint. The implementation is designed to avoid any heap allocations during steady-state operation, ensuring that the control loop can run with minimal latency and jitter. The project includes instrumentation to measure the timing characteristics of the control loop, allowing students to analyze the performance and identify any potential issues related to timing or resource usage.",
        snippet: `void ControlLoop::tick(std::chrono::nanoseconds dt) noexcept {\n  const auto err = target_ - state_.position;\n  command_ = pid_.update(err, dt);  // no allocation, no locks\n}`,
      },
      {
        code: "PRJ-08",
        title: "Compile-time unit system",
        detail:
          "Strong types for radians, metres and newton-metres that make unit mistakes a compile error and allow for compile-time unit conversions. The project involves implementing a type-safe unit system that enforces correct usage of physical units at compile time. The system defines strong types for various units, such as radians, meters, and newton-meters, and provides compile-time checks to prevent unit mismatches. The implementation includes operator overloads and conversion functions that allow for seamless usage of the unit types in calculations, while ensuring that any incorrect usage results in a compile-time error.",
        snippet: `constexpr auto torque = 4.2_Nm;\nconstexpr auto angle  = 1.57_rad;\n// static_assert: torque + angle does not compile`,
      },
      {
        code: "PRJ-09",
        title: "Capstone: motion stack",
        detail:
          "A layered planner → interpolator → driver pipeline with sanitizers, tests and latency reporting in CI. The project involves integrating various components to create a cohesive motion control system, ensuring proper handling of planning, interpolation, and driver-level execution.",
        snippet: `Planner planner{limits};\nInterpolator interp{planner.plan(goal)};\nDriver driver{interp, ControlLoop::Period{1ms}};`,
      },
    ],
    next: { label: "Continue to ROS 2 Lyrical Luth", to: "/courses/ros2-lyrical" },
  },
};
