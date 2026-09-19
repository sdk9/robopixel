import { tracks } from "@/lib/cpp-tracks";
import { ros2Course, ubuntuCourse } from "@/lib/documented-courses";
import { industrialLessonOutlines } from "@/lib/industrial-lessons-public";

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

const cppExamples: Record<string, string> = {
  "Toolchain & first build": code(
    `mkdir robot_app && cd robot_app`,
    `# Create the project folder, then enter it (&& only runs cd if mkdir succeeded).`,
    `cat > main.cpp <<'CPP'`,
    `// (the lines below, up to the lone CPP marker, are written into main.cpp)`,
    `#include <iostream>`,
    `// Pull in the standard header that provides std::cout for printing text.`,
    ``,
    `int main() {`,
    `  // Program entry point: the operating system starts running your code here.`,
    `  std::cout << "ready\\n";`,
    `  // Send the text "ready" followed by a newline to the terminal.`,
    `  return 0;`,
    `  // Give exit code 0 back to the shell, meaning "everything succeeded".`,
    `}`,
    `// End of main: the program finishes here.`,
    `CPP`,
    `# The lone CPP line ends the here-document, so cat saves everything above into main.cpp.`,
    `g++ -std=c++23 -Wall -Wextra -Wpedantic main.cpp -o robot_app`,
    `# Compile main.cpp as C++23 with extra warnings enabled; -o names the executable robot_app.`,
    `./robot_app`,
    `# Run the program you just built; it should print: ready`,
  ),
  "Types, values, conversions": code(
    `const double radians = 1.5708;`,
    `// A read-only floating-point value: a quarter turn (about 90 degrees) expressed in radians.`,
    `const int encoder_ticks = 2048;`,
    `// A read-only whole number: how many encoder counts the sensor reports for one full turn.`,
    `const double ticks_per_radian = encoder_ticks / radians;`,
    `// Divide ticks by radians to get a scale factor; the int is converted to double first, so no fraction is lost.`,
  ),
  "Control flow & functions": code(
    `double clamp(double value, double low, double high) {`,
    `  // Declare a function that takes a value plus a lower and upper limit, and returns a double.`,
    `  if (value < low) return low;`,
    `  // Too small: return the lower limit instead of the requested value.`,
    `  if (value > high) return high;`,
    `  // Too large: return the upper limit instead.`,
    `  return value;`,
    `  // Otherwise the value is already inside the range, so pass it through unchanged.`,
    `}`,
    `// End of the function body.`,
  ),
  "Arrays, vectors, strings": code(
    `std::vector<double> joints{0.0, 0.5, -0.2};`,
    `// Create a resizable list of three joint angles; the order matters (first value = first joint).`,
    `for (const double angle : joints) {`,
    `  // Loop once per element, copying each value into a read-only variable named angle.`,
    `  std::cout << angle << '\\n';`,
    `  // Print the current angle followed by a newline character.`,
    `}`,
    `// End of the loop body; the loop stops after the last joint.`,
  ),
  "Structs & classes": code(
    `class Motor {`,
    `// Start defining a new type named Motor that bundles data with its operations.`,
    `public:`,
    `// Everything below this label can be used by any code outside the class.`,
    `  explicit Motor(int id) : id_{id} {}`,
    `  // Constructor: sets id_ when a Motor is created; explicit blocks accidental int-to-Motor conversions.`,
    `  int id() const { return id_; }`,
    `  // Getter: returns the ID, and const promises that reading it never changes the motor.`,
    `private:`,
    `// Everything below is hidden from outside code, so it cannot be put into an invalid state.`,
    `  int id_;`,
    `  // The stored motor ID; the trailing underscore marks it as a member variable.`,
    `};`,
    `// End of the class definition (the semicolon is required).`,
  ),
  "References & pointers": code(
    `void zero(double& value) { value = 0.0; }`,
    `// A function taking a reference: value is another name for the caller's variable, so writing to it changes the original.`,
    `double joint = 1.2;`,
    `// Create a joint angle variable with the starting value 1.2.`,
    `zero(joint);`,
    `// Call the function; joint itself is now 0.0, not a copy.`,
  ),
  "Standard algorithms": code(
    `std::sort(samples.begin(), samples.end());`,
    `// Reorder the samples from smallest to largest; begin() is included in the range, end() is one past the last element.`,
    `auto unsafe = std::find_if(samples.begin(), samples.end(),`,
    `// Search the range for the first element that satisfies the rule on the next line; unsafe stores where it was found.`,
    `  [](double value) { return value > 80.0; });`,
    `  // A lambda (small unnamed function): true for any sample above 80, which counts as unsafe. If none match, unsafe equals end().`,
  ),
  "Debugging & tests": code(
    `REQUIRE(clamp(12.0, 0.0, 10.0) == 10.0);`,
    `// Test: a value above the maximum must be limited to 10.0, otherwise the test fails.`,
    `REQUIRE(clamp(-1.0, 0.0, 10.0) == 0.0);`,
    `// Test: a value below the minimum must be raised to 0.0.`,
  ),
  "Object lifetime & RAII": code(
    `class MotorSession {`,
    `// Define a type whose lifetime represents an open connection to a motor.`,
    `public:`,
    `// The members below are usable from outside the class.`,
    `  MotorSession() { connect(); }`,
    `  // Constructor: connecting happens automatically the moment the object is created.`,
    `  ~MotorSession() { disconnect(); }`,
    `  // Destructor: disconnecting happens automatically when the object leaves scope, even after an early return or exception.`,
    `};`,
    `// End of the class definition.`,
  ),
  "Smart pointers": code(
    `auto driver = std::make_unique<MotorDriver>();`,
    `// Create a MotorDriver on the heap with exactly one owner; it is deleted automatically when driver goes out of scope.`,
    `auto monitor = std::make_shared<StatusMonitor>();`,
    `// Create a StatusMonitor that several owners can share; it is deleted when the last owner is gone.`,
  ),
  "Copy, move, rule of five": code(
    `class Frame {`,
    `// Define a type that owns a buffer of values.`,
    `public:`,
    `// The members below are usable from outside the class.`,
    `  Frame() = default;`,
    `  // Default constructor: create an empty Frame using the compiler's standard behaviour.`,
    `  ~Frame() = default;`,
    `  // Destructor: cleanup is handled by the members (the vector frees itself).`,
    `  Frame(const Frame&) = default;`,
    `  // Copy constructor: build a new Frame as an independent duplicate of another.`,
    `  Frame& operator=(const Frame&) = default;`,
    `  // Copy assignment: overwrite an existing Frame with a duplicate of another.`,
    `  Frame(Frame&&) noexcept = default;`,
    `  // Move constructor: steal another Frame's buffer instead of copying it; noexcept promises it cannot throw.`,
    `  Frame& operator=(Frame&&) noexcept = default;`,
    `  // Move assignment: replace this Frame's contents by stealing from another.`,
    `private:`,
    `// The members below are hidden from outside code.`,
    `  std::vector<double> values_;`,
    `  // The resource this class owns: a growable list of numbers.`,
    `};`,
    `// End of the class definition.`,
  ),
  "Templates & concepts": code(
    `template <typename T>`,
    `// Begin a template: the code below works for any type T that is supplied later.`,
    `concept Numeric = (std::integral<T> || std::floating_point<T>) &&`,
    `// Define a named rule "Numeric": T must be a whole-number type or a floating-point type...`,
    `                  (!std::same_as<std::remove_cv_t<T>, bool>);`,
    `                  // ...and, ignoring const/volatile, T must not be bool.`,
    `template <Numeric T>`,
    `// A second template, restricted so only types that satisfy Numeric are accepted.`,
    `constexpr T midpoint(T a, T b) { return std::midpoint(a, b); }`,
    `// Return the value halfway between a and b; constexpr allows it to be evaluated at compile time.`,
  ),
  "Error handling strategies": code(
    `auto connect() -> std::expected<Device, Error>;`,
    `// Declare a function whose result is either a usable Device or an Error, so failure is part of its type.`,
    `if (auto device = connect()) { device->start(); }`,
    `// Call connect(); the if is true only on success, and only then is the device started (-> reaches the value inside).`,
  ),
  "Threads & synchronisation": code(
    `class SampleStore {`,
    `// Define a type that lets several threads share the latest sensor sample safely.`,
    `public:`,
    `// The members below are usable from outside the class.`,
    `  void update(double sample) {`,
    `    // A function that stores a new sample.`,
    `    std::scoped_lock lock{mutex_};`,
    `    // Lock the mutex now; it is released automatically when lock leaves scope, so only one thread runs this section at a time.`,
    `    latest_sample_ = sample;`,
    `    // Overwrite the stored value while holding the lock, so no other thread sees a half-written value.`,
    `  }`,
    `  // End of update; the lock is released here.`,
    `private:`,
    `// The members below are hidden from outside code.`,
    `  std::mutex mutex_;`,
    `  // The mutual-exclusion lock that guards latest_sample_.`,
    `  double latest_sample_{0.0};`,
    `  // The shared value, starting at 0.0.`,
    `};`,
    `// End of the class definition.`,
  ),
  "Performance & memory layout": code(
    `std::vector<Sample> buffer;`,
    `// Create an empty, resizable buffer of Sample objects stored side by side in memory.`,
    `buffer.reserve(10'000); // allocate once before the hot path`,
    `// Ask for room for 10,000 samples up front (the ' is just a digit separator), so later push_backs do not reallocate.`,
  ),
  "Build systems at scale": code(
    `add_library(robot_math src/robot_math.cpp)`,
    `# Define a library target named robot_math built from src/robot_math.cpp.`,
    `target_compile_features(robot_math PUBLIC cxx_std_23)`,
    `# Require C++23 for this library; PUBLIC means anything that links to it needs C++23 too.`,
    `target_include_directories(robot_math PUBLIC include)`,
    `# Add the include folder to the library's header search path, and pass it on to every consumer.`,
  ),
  "Real-time constraints": code(
    `auto next = std::chrono::steady_clock::now();`,
    `// Record the current moment on a clock that never jumps backwards; this is the first deadline.`,
    `while (running) {`,
    `  // Repeat the control loop for as long as the running flag stays true.`,
    `  next += 1ms; // advance the absolute schedule; do not rebase on now()`,
    `  // Move the deadline exactly 1 millisecond later, so small delays do not add up (no drift).`,
    `  controller.tick();`,
    `  // Run one step of the control algorithm.`,
    `  std::this_thread::sleep_until(next);`,
    `  // Sleep until the absolute deadline, so every cycle starts on schedule.`,
    `}`,
    `// End of the loop body; jump back and start the next cycle.`,
  ),
  "Custom allocators & pools": code(
    `std::array<std::byte, 4096> storage;`,
    `// Reserve a fixed block of 4096 raw bytes up front; no heap allocation happens later.`,
    `std::pmr::monotonic_buffer_resource pool{storage.data(), storage.size()};`,
    `// Create a pool that hands out memory from that block (pointer and size); it frees everything at once and never one piece at a time.`,
  ),
  "Lock-free data structures": code(
    `value.store(next, std::memory_order_release);`,
    `// Atomically write next into value; release makes all earlier writes visible to a thread that reads it with acquire.`,
    `auto current = value.load(std::memory_order_acquire);`,
    `// Atomically read value; acquire guarantees you also see everything written before the matching release.`,
  ),
  "Template metaprogramming": code(
    `template <typename Unit> struct Quantity { double value; };`,
    `// A number tagged with a unit type; the tag exists only at compile time and costs nothing at runtime.`,
    `struct Radians {};`,
    `// An empty type that is used purely as a label meaning "radians".`,
    `using Angle = Quantity<Radians>;`,
    `// Give the tagged type a friendly name; Angle and other units are now different types the compiler will not mix up.`,
  ),
  "Architecture & interfaces": code(
    `struct MotorPort {`,
    `// Define an interface: what the application needs from a motor, with no hardware details.`,
    `  virtual void command(double torque) = 0;`,
    `  // A pure virtual function (= 0): each implementation must provide it, whether a real motor or a test fake.`,
    `  virtual ~MotorPort() = default;`,
    `  // A virtual destructor so deleting a derived object through this interface cleans up correctly.`,
    `};`,
    `// End of the interface definition.`,
  ),
  "Sanitizers & static analysis": code(
    `cmake -S . -B build -DCMAKE_CXX_FLAGS='-fsanitize=address,undefined'`,
    `# Configure the project (source = current folder, build files in build/) and add flags that instrument the code to catch memory errors and undefined behaviour.`,
    `cmake --build build && ./build/tests`,
    `# Build the project, then run the test program only if the build succeeded; any sanitizer report appears in its output.`,
  ),
  "Latency instrumentation": code(
    `const auto elapsed = std::chrono::steady_clock::now() - started;`,
    `// Subtract the earlier start time from the current time to get how long the step took.`,
    `histogram.record(elapsed);`,
    `// Add that duration to the histogram, so you can study the whole distribution and not only the average.`,
  ),
  "Capstone hardening": code(
    `ctest --test-dir build --output-on-failure`,
    `# Run every registered test in the build folder and print the full output of any test that fails.`,
    `clang-tidy src/*.cpp -- -Iinclude`,
    `# Statically analyse each source file without running it; everything after -- is passed to the compiler (here, the include path).`,
  ),
};

const cppConcepts: Record<string, string[]> = {
  "Toolchain & first build": [
    "C++ source code is not run directly. The compiler translates each source file, the linker joins the compiled pieces, and the operating system starts the finished executable.",
    "Warnings are early design feedback. This course enables them from the first build so suspicious conversions and unused values are corrected before they become robot faults.",
  ],
  "Types, values, conversions": [
    "A type tells the compiler what a value represents, how much storage it needs, and which operations are valid. Robotics programs commonly separate whole encoder counts from fractional angles and time values.",
    "Use const when a value must not change after initialization. Avoid silent narrowing because losing a fraction or overflowing an integer can change a motion command.",
  ],
  "Control flow & functions": [
    "Control flow decides which statements run. Functions give a decision a name, define its inputs and output, and let you test it away from the rest of the robot.",
    "The clamp function is a software boundary: values below the minimum become the minimum, values above the maximum become the maximum, and valid values pass through unchanged.",
  ],
  "Arrays, vectors, strings": [
    "A collection stores several values under one name. Arrays have a fixed size; vectors can grow; strings store text. Joint positions are often represented as an ordered collection.",
    "The order is part of the meaning: the first angle must correspond to the first joint name. A loop lets the same operation run once for every element.",
  ],
  "Structs & classes": [
    "A class combines data with the operations allowed on that data. Encapsulation prevents unrelated code from placing an object into an invalid state.",
    "A constructor establishes the starting state. A const member function promises that observing an object will not modify it.",
  ],
  "References & pointers": [
    "A reference is another name for an existing object and must refer to something valid. A pointer stores an address and may deliberately be empty.",
    "Use references for required inputs or outputs and pointers when absence is meaningful. Never dereference a pointer until its validity is known.",
  ],
  "Standard algorithms": [
    "Standard algorithms express intent—sort, find, transform—without hand-written indexing. Their iterator range is half-open: the first position is included and the end marker is excluded.",
    "A lambda supplies a small rule to an algorithm. Here it identifies the first sample above a safe temperature.",
  ],
  "Debugging & tests": [
    "A debugger shows what the program is doing now; a test records what it must continue doing later. Both shorten the distance between a failure and its cause.",
    "Boundary tests are especially important in robotics because minimums, maximums, zero, and invalid values are where safety checks most often fail.",
  ],
  "Object lifetime & RAII": [
    "RAII ties a resource to an object's lifetime: acquire it during construction and release it during destruction. Cleanup then happens on every scope exit, including exceptions.",
    "This pattern prevents forgotten disconnects, locks, and file handles by making ownership visible in the type.",
  ],
  "Smart pointers": [
    "A unique pointer represents one owner; moving it transfers ownership. A shared pointer represents shared lifetime, while a weak pointer observes without extending that lifetime.",
    "Choose ownership first, then the pointer type. Default to unique ownership and use shared ownership only when the design truly requires it.",
  ],
  "Copy, move, rule of five": [
    "Copying creates an independent value. Moving transfers resources from an object that will no longer need them, which can avoid expensive buffer duplication.",
    "After a move, the source remains valid but its value is unspecified. Code must not assume its previous contents remain.",
  ],
  "Templates & concepts": [
    "Templates describe an operation for a family of types. Concepts state the requirements that a type must satisfy and produce clearer errors than unconstrained templates.",
    "Generic code is useful for vectors, poses, and numeric units only when every accepted type supports the operations used inside the algorithm.",
  ],
  "Error handling strategies": [
    "Expected failures, such as a device not being present, should be represented explicitly. Programming errors and recoverable operating conditions are not the same category.",
    "An expected-style result carries either a usable value or an error, forcing the caller to inspect success before starting the device.",
  ],
  "Threads & synchronisation": [
    "Threads can run at the same time and may race when they access shared state. A mutex establishes exclusive access to a critical section.",
    "Keep the protected section small and never hold a lock while waiting on slow I/O; both choices reduce latency and deadlock risk.",
  ],
  "Performance & memory layout": [
    "Performance depends on memory access as well as instruction count. Contiguous vectors are cache-friendly, but growing them can allocate and move their contents.",
    "Reserve capacity before a time-sensitive loop when the maximum working size is known, then measure rather than guessing where time is spent.",
  ],
  "Build systems at scale": [
    "CMake targets model libraries and executables plus their requirements. Target-based configuration keeps include paths and language versions attached to the code that needs them.",
    "PUBLIC requirements are used by both the library and its consumers; PRIVATE requirements remain implementation details.",
  ],
  "Real-time constraints": [
    "Real-time means completing work before a deadline, not merely running quickly on average. Jitter is variation in completion time and can destabilize a controller.",
    "A control loop should avoid unbounded allocation, blocking I/O, and unpredictable locks. Its timing must be measured under realistic load.",
  ],
  "Custom allocators & pools": [
    "A memory pool obtains storage before the time-critical phase and serves later allocations from that known region.",
    "A monotonic resource is fast because it releases the entire region together; it is suitable only when individual objects do not need separate deallocation.",
  ],
  "Lock-free data structures": [
    "Atomics coordinate access without a mutex, but correct ordering is part of the algorithm. Release publishes earlier writes; acquire makes those writes visible to the reader.",
    "Lock-free does not automatically mean faster or safer. Start with a proven single-producer/single-consumer design and test it under ThreadSanitizer.",
  ],
  "Template metaprogramming": [
    "Compile-time types can encode physical units so invalid operations fail during compilation instead of during motion.",
    "A quantity tagged as radians is distinct from torque even though both contain a double. This moves an entire class of integration mistakes out of runtime.",
  ],
  "Architecture & interfaces": [
    "An interface states what a layer needs without selecting a particular device. The control algorithm can then be tested with a simulator and connected to hardware through another implementation.",
    "Dependency inversion keeps vendor details at the boundary and makes failure injection practical.",
  ],
  "Sanitizers & static analysis": [
    "Sanitizers instrument a running program to detect memory, undefined-behavior, and thread errors. Static analysis inspects paths without executing them.",
    "Use these tools in test builds, interpret the first reported root cause, and never suppress a finding merely to make a report green.",
  ],
  "Latency instrumentation": [
    "A latency measurement needs a defined start, end, clock, and unit. A histogram preserves the distribution that an average hides.",
    "Robotics teams care about high percentiles and deadline misses because one late cycle can matter more than thousands of fast cycles.",
  ],
  "Capstone hardening": [
    "Hardening asks how software behaves outside the happy path: malformed input, resource exhaustion, timing pressure, and dependency failure.",
    "Tests, analysis, fuzzing, and failure injection provide different evidence. Release readiness requires all of them plus documented limits.",
  ],
};

const cppExercises: Record<string, string> = {
  "Toolchain & first build":
    "Create a two-file program with main.cpp and status.cpp. Compile each source file, link them into robot_status, run it, then deliberately misspell a function name and identify whether the compiler or linker reports the problem.",
  "Types, values, conversions":
    "Convert 2,048 encoder ticks into radians using named constants. Print the result, then add a deliberately narrowing conversion to int and explain the lost information.",
  "Control flow & functions":
    "Write clamp_velocity(requested, limit). Test values below, inside, and above the permitted range, including a negative limit that your function must reject.",
  "Arrays, vectors, strings":
    "Store six named joint angles, print each name beside its angle, then reject an input vector whose size does not match the joint-name vector.",
  "Structs & classes":
    "Create a Motor class whose constructor requires an ID and maximum speed. Add a const status method and prevent a speed command outside the configured range.",
  "References & pointers":
    "Write one function that resets a required joint value through a reference and another that reads an optional sensor through a pointer. Test both a valid pointer and nullptr.",
  "Standard algorithms":
    "Given ten motor-temperature samples, sort a copy, find the first value above 80 °C, and calculate the mean. Confirm that the original order remains unchanged.",
  "Debugging & tests":
    "Write unit tests for clamp_velocity at the lower boundary, upper boundary, normal range, and invalid configuration. Break one condition, observe the failing test, then repair it.",
  "Object lifetime & RAII":
    "Implement a simulated DeviceSession that records connect on construction and disconnect on destruction. Return early from a function and prove cleanup still occurs.",
  "Smart pointers":
    "Model one uniquely owned motor driver and two monitors sharing a read-only status source. Draw the ownership graph and remove one monitor to observe which objects remain alive.",
  "Copy, move, rule of five":
    "Create a FrameBuffer that owns a vector, logs copy and move operations, and can be returned from a function. Compare behavior with and without std::move at the call site.",
  "Templates & concepts":
    "Implement a constrained midpoint function for arithmetic types. Test int and double, then pass std::string and explain the concept error without weakening the constraint.",
  "Error handling strategies":
    "Return either a connected SimDevice or a typed ConnectError. Handle unavailable, permission-denied, and success cases without starting a missing device.",
  "Threads & synchronisation":
    "Run one thread that updates a sensor sample and another that reads it. Protect the shared value with a scoped lock, then verify the program with ThreadSanitizer.",
  "Performance & memory layout":
    "Fill a telemetry vector with 10,000 samples while counting capacity changes. Call reserve first, repeat the run, and compare allocation count and elapsed time.",
  "Build systems at scale":
    "Split robot_math into a library with a public header and a small executable. Express the C++ standard and include path on the library target, then build from a clean directory.",
  "Real-time constraints":
    "Run a simulated controller for 10,000 one-millisecond cycles. Record each lateness value and report the worst case and missed-deadline count without printing inside the loop.",
  "Custom allocators & pools":
    "Allocate a fixed batch of command objects from a pmr monotonic buffer before a simulated control phase. Detect and report what happens when the pool is too small.",
  "Lock-free data structures":
    "Use a proven single-producer/single-consumer queue to transfer numbered samples. Verify ordering, dropped-sample behavior, and the empty case under ThreadSanitizer.",
  "Template metaprogramming":
    "Create distinct Angle and Torque quantity types. Support adding matching units and prove at compile time that adding an angle to torque is rejected.",
  "Architecture & interfaces":
    "Define a MotorPort, a FakeMotor for tests, and one application service that depends only on the interface. Inject a failure and verify the application reports it without vendor code.",
  "Sanitizers & static analysis":
    "Prepare three tiny failures: out-of-bounds access, signed overflow, and a data race. Run the appropriate sanitizer for each, record the first useful diagnostic, then fix the cause.",
  "Latency instrumentation":
    "Measure a simulated planning step with steady_clock for 5,000 runs. Produce a histogram plus median, 95th, and 99th percentile values and count deadline misses.",
  "Capstone hardening":
    "Take one earlier robotics project and add boundary tests, sanitizer builds, static analysis, malformed-input tests, one injected dependency failure, and a written release checklist.",
};

function teachingFields(title: string, summary: string, kind: "cpp" | "ubuntu" | "ros2") {
  const concept = kind === "cpp" ? cppConcepts[title] : documentedConcepts[title];
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

function cppLesson(title: string, summary: string, duration: string, index: number): Lesson {
  return {
    slug: lessonSlug(index, title),
    title,
    summary,
    duration,
    ...teachingFields(title, summary, "cpp"),
    steps: [
      `Read the ${title.toLowerCase()} example and identify what each line owns or changes.`,
      "Create a small source file, compile with warnings enabled, and run it from the terminal.",
      "Change one input, predict the result before running, then compare the output.",
      "Record one compiler or runtime error and explain the correction in your own words.",
    ],
    example:
      cppExamples[title] ??
      "// Build the smallest test that demonstrates this lesson's idea.\nint main() { return 0; }",
    exercise:
      cppExercises[title] ??
      `Build a small robotics-flavoured program that demonstrates ${title.toLowerCase()}. Keep the first version simple, compile with -Wall -Wextra, and test one normal and one edge case.`,
    checklist: [
      "The program builds without warnings",
      "You can explain the key rule without reading the example",
      "The normal and edge cases both have recorded results",
    ],
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
    lessons: track.lessons.map((lesson, index) =>
      cppLesson(lesson.title, lesson.detail, lesson.time, index),
    ),
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
