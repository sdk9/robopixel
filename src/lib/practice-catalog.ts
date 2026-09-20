export type PracticeCheck = { label: string; pattern: string };

export type PracticeTerminalStep = { command: string; output: string };

export type PracticeExercise = {
  id: string;
  group: "cpp-beginner" | "cpp-intermediate" | "cpp-advanced" | "ros2";
  groupLabel: string;
  number: string;
  title: string;
  brief: string;
  origin: { label: string; to: string };
  steps: string[];
  starterCode: string;
  expectedOutput: string;
  checks: PracticeCheck[];
  hint: string;
  terminal?: PracticeTerminalStep[];
};

const SHIM = `// Teaching shim: stands in for rclcpp so the lab compiles in your browser.
#include <functional>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

struct Logger {
  void info(const std::string& message) const { std::cout << "[INFO] " << message << "\\n"; }
};
`;

export const practiceExercises: PracticeExercise[] = [
  // ---------------------------------------------------------------- C++ beginner
  {
    id: "cppb-01",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "01",
    title: "Toolchain & first build",
    brief: "Compile and run your first program, and print two lines exactly.",
    origin: { label: "C++ Beginner lesson 01", to: "/courses/cpp-beginner" },
    steps: [
      "Include <iostream>, the header that declares std::cout.",
      "Inside main, print the two required lines, each ending with a newline.",
      "Return 0 so the shell sees a successful exit status.",
      "Press Run: your code is compiled with g++ and the real program output is compared with the expected output.",
    ],
    starterCode: `#include <iostream>

int main() {
  // TODO: print the two expected lines.
  return 0;
}
`,
    expectedOutput: "Code The Robot toolchain ready\nbuild 1",
    checks: [
      { label: "Includes <iostream>", pattern: "#include\\s*<iostream>" },
      { label: "Uses std::cout", pattern: "std::cout" },
      { label: "Returns 0 from main", pattern: "return\\s+0\\s*;" },
    ],
    hint: 'std::cout << "text\\n"; prints one line.',
  },
  {
    id: "cppb-02",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "02",
    title: "Types, values, conversions",
    brief: "Convert degrees to radians and show what an explicit narrowing cast does.",
    origin: { label: "C++ Beginner lesson 02", to: "/courses/cpp-beginner" },
    steps: [
      "Store 90 degrees in a const double and convert it to radians.",
      "Print the radian value with four decimal places using std::fixed and std::setprecision.",
      "Cast radians * 1000 to int and print it: the fraction is discarded, not rounded.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>

int main() {
  const double degrees = 90.0;
  // TODO: convert to radians, then print both lines.
  return 0;
}
`,
    expectedOutput: "radians 1.5708\nmillirad 1570",
    checks: [
      { label: "Uses a const value", pattern: "const\\s+double" },
      { label: "Sets a fixed precision", pattern: "setprecision" },
      { label: "Uses an explicit cast", pattern: "static_cast<int>" },
    ],
    hint: "radians = degrees * 3.14159265358979 / 180.0;",
  },
  {
    id: "cppb-03",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "03",
    title: "Control flow & functions",
    brief: "Write a clamp function and apply it to a list of joint targets.",
    origin: { label: "C++ Beginner lesson 03", to: "/courses/cpp-beginner" },
    steps: [
      "Write double clamp(double value, double low, double high).",
      "Loop over the three targets and print each clamped value with two decimals.",
      "A safe clamp never returns a value outside the limits, even for inputs far outside them.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>
#include <vector>

double clamp(double value, double low, double high) {
  // TODO: return value limited to [low, high].
  return value;
}

int main() {
  std::cout << std::fixed << std::setprecision(2);
  for (double target : std::vector<double>{-0.5, 0.2, 1.4}) {
    std::cout << "clamped " << clamp(target, 0.0, 1.0) << "\\n";
  }
  return 0;
}
`,
    expectedOutput: "clamped 0.00\nclamped 0.20\nclamped 1.00",
    checks: [
      { label: "Defines a clamp function", pattern: "double\\s+clamp\\s*\\(" },
      { label: "Branches on the limits", pattern: "(if|<|>)" },
    ],
    hint: "if (value < low) return low; if (value > high) return high; return value;",
  },
  {
    id: "cppb-04",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "04",
    title: "Vectors & strings",
    brief: "Store joint names in a std::vector and print them with a one-based index.",
    origin: { label: "C++ Beginner lesson 04", to: "/courses/cpp-beginner" },
    steps: [
      "Create a std::vector<std::string> with shoulder, elbow and wrist.",
      "Print each entry as index and name, counting from 1.",
      "Print the number of entries using .size().",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <vector>

int main() {
  std::vector<std::string> joints{"shoulder", "elbow", "wrist"};
  // TODO: print each joint with a one-based index, then the count.
  return 0;
}
`,
    expectedOutput: "1 shoulder\n2 elbow\n3 wrist\ncount 3",
    checks: [
      { label: "Uses std::vector", pattern: "std::vector" },
      { label: "Reads the container size", pattern: "\\.size\\(\\)" },
    ],
    hint: "for (std::size_t i = 0; i < joints.size(); ++i) print i + 1 and joints[i].",
  },
  {
    id: "cppb-05",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "05",
    title: "Structs & classes",
    brief: "Build a Joint class with private data and a const query method.",
    origin: { label: "C++ Beginner lesson 05", to: "/courses/cpp-beginner" },
    steps: [
      "Give Joint a constructor that stores a name and an angle.",
      "Add bool withinLimit(double limit) const that answers without changing the object.",
      "Print the name plus ok or blocked for each joint.",
    ],
    starterCode: `#include <iostream>
#include <string>

class Joint {
public:
  Joint(std::string name, double angle) : name_(std::move(name)), angle_(angle) {}

  const std::string& name() const { return name_; }

  bool withinLimit(double limit) const {
    // TODO: return true when the angle is at or below the limit.
    return true;
  }

private:
  std::string name_;
  double angle_;
};

int main() {
  const Joint elbow{"elbow", 0.6};
  const Joint wrist{"wrist", 0.3};
  std::cout << elbow.name() << (elbow.withinLimit(0.5) ? " ok" : " blocked") << "\\n";
  std::cout << wrist.name() << (wrist.withinLimit(0.5) ? " ok" : " blocked") << "\\n";
  return 0;
}
`,
    expectedOutput: "elbow blocked\nwrist ok",
    checks: [
      { label: "Keeps data private", pattern: "private:" },
      {
        label: "Query method is const",
        pattern: "withinLimit\\s*\\(\\s*double\\s+\\w+\\s*\\)\\s*const",
      },
      { label: "Compares against the limit", pattern: "angle_" },
    ],
    hint: "return angle_ <= limit;",
  },
  {
    id: "cppb-06",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "06",
    title: "References & pointers",
    brief: "Change a value through a reference and guard a pointer before using it.",
    origin: { label: "C++ Beginner lesson 06", to: "/courses/cpp-beginner" },
    steps: [
      "Write void scale(double& value, double factor) that changes the caller's variable.",
      "Write void report(const double* target) that prints the value, or 'no target' when the pointer is null.",
      "Never dereference a pointer before checking it.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>

void scale(double& value, double factor) {
  // TODO: multiply the caller's variable in place.
}

void report(const double* target) {
  // TODO: print "target 1.00" or "no target".
}

int main() {
  std::cout << std::fixed << std::setprecision(2);
  double speed = 0.25;
  scale(speed, 4.0);
  report(&speed);
  report(nullptr);
  return 0;
}
`,
    expectedOutput: "target 1.00\nno target",
    checks: [
      { label: "Takes a reference parameter", pattern: "double&\\s*\\w+" },
      { label: "Checks the pointer", pattern: "(nullptr|!\\s*target|target\\s*==)" },
    ],
    hint: 'if (target == nullptr) { print "no target"; return; }',
  },
  {
    id: "cppb-07",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "07",
    title: "Standard algorithms",
    brief: "Sort torque samples, sum them and find the peak with the standard library.",
    origin: { label: "C++ Beginner lesson 07", to: "/courses/cpp-beginner" },
    steps: [
      "Sort the samples ascending with std::sort and print them on one line.",
      "Add them with std::accumulate and print the sum.",
      "Find the largest with std::max_element and print it.",
    ],
    starterCode: `#include <algorithm>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
  std::vector<double> torques{3.5, 1.25, 7.75, 2.0};
  std::cout << std::fixed << std::setprecision(2);
  // TODO: sort, print the sorted line, then the sum and the peak.
  return 0;
}
`,
    expectedOutput: "sorted 1.25 2.00 3.50 7.75\nsum 14.50\npeak 7.75",
    checks: [
      { label: "Uses std::sort", pattern: "std::sort" },
      { label: "Uses std::accumulate", pattern: "std::accumulate" },
      { label: "Uses std::max_element", pattern: "std::max_element" },
    ],
    hint: "std::accumulate(torques.begin(), torques.end(), 0.0) needs a 0.0 seed, not 0.",
  },
  {
    id: "cppb-08",
    group: "cpp-beginner",
    groupLabel: "C++ Beginner",
    number: "08",
    title: "Debugging & first tests",
    brief: "Write a tiny test harness that proves a range check behaves correctly.",
    origin: { label: "C++ Beginner lesson 08", to: "/courses/cpp-beginner" },
    steps: [
      "Implement bool inRange(double value, double low, double high).",
      "Check three cases: below, inside and above the range.",
      "Print pass or fail per case, then a final line when all cases pass.",
    ],
    starterCode: `#include <iostream>

bool inRange(double value, double low, double high) {
  // TODO: true only when value sits inside the closed range.
  return false;
}

int main() {
  const bool cases[3] = {
    inRange(-0.1, 0.0, 1.0) == false,
    inRange(0.5, 0.0, 1.0) == true,
    inRange(1.5, 0.0, 1.0) == false,
  };
  bool all = true;
  for (int i = 0; i < 3; ++i) {
    std::cout << "test " << (i + 1) << (cases[i] ? " pass" : " fail") << "\\n";
    if (!cases[i]) all = false;
  }
  if (all) std::cout << "all tests passed\\n";
  return 0;
}
`,
    expectedOutput: "test 1 pass\ntest 2 pass\ntest 3 pass\nall tests passed",
    checks: [
      { label: "Implements inRange", pattern: "bool\\s+inRange" },
      { label: "Compares both bounds", pattern: ">=|<=" },
    ],
    hint: "return value >= low && value <= high;",
  },

  // ------------------------------------------------------------ C++ intermediate
  {
    id: "cppi-01",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "01",
    title: "Object lifetime & RAII",
    brief: "Enable and disable a motor from a constructor and destructor so it can never leak.",
    origin: { label: "C++ Intermediate lesson 01", to: "/courses/cpp-intermediate" },
    steps: [
      "Print 'motor enabled' in the constructor and 'motor disabled' in the destructor.",
      "Create the guard inside a nested scope and print work in between.",
      "The destructor runs when the scope ends, before the final line.",
    ],
    starterCode: `#include <iostream>

class MotorGuard {
public:
  MotorGuard() {
    // TODO: announce that the motor is enabled.
  }
  ~MotorGuard() {
    // TODO: announce that the motor is disabled.
  }
};

int main() {
  {
    MotorGuard guard;
    std::cout << "work\\n";
  }
  std::cout << "done\\n";
  return 0;
}
`,
    expectedOutput: "motor enabled\nwork\nmotor disabled\ndone",
    checks: [
      { label: "Has a destructor", pattern: "~MotorGuard" },
      { label: "Prints from both ends of the lifetime", pattern: "motor disabled" },
    ],
    hint: "The destructor body runs automatically at the closing brace of the scope.",
  },
  {
    id: "cppi-02",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "02",
    title: "Smart pointers",
    brief: "Own a device with std::unique_ptr and release it deliberately.",
    origin: { label: "C++ Intermediate lesson 02", to: "/courses/cpp-intermediate" },
    steps: [
      "Create the device with std::make_unique.",
      "Call use() through the pointer.",
      "Call reset() and confirm the destructor ran before the final line.",
    ],
    starterCode: `#include <iostream>
#include <memory>
#include <string>

struct Device {
  explicit Device(std::string name) : name_(std::move(name)) { std::cout << "open " << name_ << "\\n"; }
  ~Device() { std::cout << "close " << name_ << "\\n"; }
  void use() const { std::cout << "use " << name_ << "\\n"; }
  std::string name_;
};

int main() {
  // TODO: create a unique_ptr<Device> named gripper, use it, then reset it.
  std::cout << "after reset\\n";
  return 0;
}
`,
    expectedOutput: "open gripper\nuse gripper\nclose gripper\nafter reset",
    checks: [
      { label: "Uses std::make_unique", pattern: "std::make_unique" },
      { label: "Releases the device explicitly", pattern: "\\.reset\\(" },
      { label: "No raw new", pattern: "^(?![\\s\\S]*\\bnew\\s+Device\\b)[\\s\\S]*$" },
    ],
    hint: 'auto gripper = std::make_unique<Device>("gripper");',
  },
  {
    id: "cppi-03",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "03",
    title: "Copy, move, rule of five",
    brief: "Show the difference between copying and moving a buffer.",
    origin: { label: "C++ Intermediate lesson 03", to: "/courses/cpp-intermediate" },
    steps: [
      "Announce 'copied' in the copy constructor and 'moved' in the move constructor.",
      "Copy one buffer, then move another.",
      "After a move the source is valid but empty: print its size.",
    ],
    starterCode: `#include <iostream>
#include <utility>
#include <vector>

class Buffer {
public:
  Buffer() : data_(4, 0.0) {}
  Buffer(const Buffer& other) : data_(other.data_) {
    // TODO: announce a copy.
  }
  Buffer(Buffer&& other) noexcept : data_(std::move(other.data_)) {
    // TODO: announce a move.
  }
  std::size_t size() const { return data_.size(); }

private:
  std::vector<double> data_;
};

int main() {
  Buffer first;
  Buffer copy{first};
  std::cout << "source size " << first.size() << "\\n";
  Buffer moved{std::move(first)};
  std::cout << "moved size " << moved.size() << "\\n";
  std::cout << "source size " << first.size() << "\\n";
  return 0;
}
`,
    expectedOutput: "copied\nsource size 4\nmoved\nmoved size 4\nsource size 0",
    checks: [
      { label: "Has a move constructor", pattern: "Buffer\\s*\\(\\s*Buffer&&" },
      { label: "Move constructor is noexcept", pattern: "Buffer&&[^)]*\\)\\s*noexcept" },
      { label: "Announces both operations", pattern: "moved" },
    ],
    hint: 'std::cout << "copied\\n"; in one constructor and "moved\\n" in the other.',
  },
  {
    id: "cppi-04",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "04",
    title: "Templates & concepts",
    brief: "Write one interpolator that serves scalars and 2D points.",
    origin: { label: "C++ Intermediate lesson 04", to: "/courses/cpp-intermediate" },
    steps: [
      "Write a template function lerp that works for any type supporting + and *.",
      "Add the operators Point needs so the same template compiles for it.",
      "Interpolate halfway and print both results.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>

struct Point {
  double x{0.0};
  double y{0.0};
};

Point operator+(const Point& a, const Point& b) { return {a.x + b.x, a.y + b.y}; }
Point operator*(const Point& a, double s) { return {a.x * s, a.y * s}; }

// TODO: one template function lerp(a, b, t) used by both calls below.

int main() {
  std::cout << std::fixed << std::setprecision(2);
  std::cout << "scalar " << lerp(0.0, 2.0, 0.5) << "\\n";
  const Point mid = lerp(Point{0.0, 0.0}, Point{2.0, 4.0}, 0.5);
  std::cout << "point " << mid.x << " " << mid.y << "\\n";
  return 0;
}
`,
    expectedOutput: "scalar 1.00\npoint 1.00 2.00",
    checks: [
      { label: "Declares a template", pattern: "template\\s*<" },
      { label: "Defines lerp once", pattern: "lerp\\s*\\(" },
    ],
    hint: "template <typename T> T lerp(const T& a, const T& b, double t) { return a * (1.0 - t) + b * t; }",
  },
  {
    id: "cppi-05",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "05",
    title: "Error handling strategies",
    brief: "Return an optional instead of throwing for an expected parsing failure.",
    origin: { label: "C++ Intermediate lesson 05", to: "/courses/cpp-intermediate" },
    steps: [
      "Return std::optional<double> from parseSpeed: empty when the text is not a number.",
      "Catch the conversion failure inside the function; the caller should not need a try block.",
      "Print the value when present and an error line when not.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>
#include <optional>
#include <string>

std::optional<double> parseSpeed(const std::string& text) {
  // TODO: convert with std::stod and return std::nullopt on failure.
  return std::nullopt;
}

int main() {
  std::cout << std::fixed << std::setprecision(2);
  for (const std::string& text : {std::string{"0.25"}, std::string{"fast"}}) {
    const auto speed = parseSpeed(text);
    if (speed) std::cout << "speed " << *speed << "\\n";
    else std::cout << "error: not a number\\n";
  }
  return 0;
}
`,
    expectedOutput: "speed 0.25\nerror: not a number",
    checks: [
      { label: "Uses std::optional", pattern: "std::optional" },
      { label: "Returns nullopt on failure", pattern: "std::nullopt" },
      { label: "Contains the failure locally", pattern: "catch" },
    ],
    hint: "try { return std::stod(text); } catch (const std::exception&) { return std::nullopt; }",
  },
  {
    id: "cppi-06",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "06",
    title: "Threads & synchronisation",
    brief: "Increment one counter from two threads without losing updates.",
    origin: { label: "C++ Intermediate lesson 06", to: "/courses/cpp-intermediate" },
    steps: [
      "Protect the shared counter with a std::mutex and std::lock_guard.",
      "Join both threads before reading the result.",
      "The total must be exactly 2000 on every run: that is what a correct lock buys you.",
    ],
    starterCode: `#include <iostream>
#include <mutex>
#include <thread>

int counter = 0;
std::mutex counter_mutex;

void bump(int times) {
  for (int i = 0; i < times; ++i) {
    // TODO: lock before touching the shared counter.
    ++counter;
  }
}

int main() {
  std::thread a{bump, 1000};
  std::thread b{bump, 1000};
  a.join();
  b.join();
  std::cout << "counter " << counter << "\\n";
  return 0;
}
`,
    expectedOutput: "counter 2000",
    checks: [
      { label: "Uses a lock guard", pattern: "(lock_guard|scoped_lock|unique_lock)" },
      { label: "Joins both threads", pattern: "b\\.join\\(\\)" },
    ],
    hint: "std::lock_guard<std::mutex> lock{counter_mutex}; inside the loop body.",
  },
  {
    id: "cppi-07",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "07",
    title: "Performance & memory layout",
    brief: "Reserve capacity up front so a hot loop stops reallocating.",
    origin: { label: "C++ Intermediate lesson 07", to: "/courses/cpp-intermediate" },
    steps: [
      "Reserve room for 64 samples before the loop.",
      "Count how many times the data pointer moves while pushing 64 samples.",
      "With a correct reserve the count is zero reallocations.",
    ],
    starterCode: `#include <iostream>
#include <vector>

int main() {
  std::vector<double> samples;
  // TODO: reserve capacity for 64 samples before pushing.
  const double* base = samples.data();
  int reallocations = 0;
  for (int i = 0; i < 64; ++i) {
    samples.push_back(i * 0.5);
    if (samples.data() != base) {
      ++reallocations;
      base = samples.data();
    }
  }
  std::cout << "size " << samples.size() << "\\n";
  std::cout << "reallocations " << reallocations << "\\n";
  return 0;
}
`,
    expectedOutput: "size 64\nreallocations 0",
    checks: [
      { label: "Reserves capacity", pattern: "\\.reserve\\(" },
      {
        label: "Reserves at least 64",
        pattern: "reserve\\(\\s*6[4-9]|reserve\\(\\s*1[0-9][0-9]|reserve\\(\\s*\\d{3,}",
      },
    ],
    hint: "samples.reserve(64); before taking the base pointer.",
  },
  {
    id: "cppi-08",
    group: "cpp-intermediate",
    groupLabel: "C++ Intermediate",
    number: "08",
    title: "Build systems at scale",
    brief: "Separate an interface from its implementation using a namespace boundary.",
    origin: { label: "C++ Intermediate lesson 08", to: "/courses/cpp-intermediate" },
    steps: [
      "Declare the limits type and the check function inside namespace drive.",
      "Call it through its qualified name from main, as another translation unit would.",
      "This is the same boundary a CMake library target enforces at link time.",
    ],
    starterCode: `#include <iostream>

// TODO: put Limits and allows() inside namespace drive.
struct Limits {
  double max_speed{0.25};
};

bool allows(const Limits& limits, double speed) { return speed <= limits.max_speed; }

int main() {
  const drive::Limits limits;
  std::cout << "0.20 " << (drive::allows(limits, 0.20) ? "allowed" : "rejected") << "\\n";
  std::cout << "0.40 " << (drive::allows(limits, 0.40) ? "allowed" : "rejected") << "\\n";
  return 0;
}
`,
    expectedOutput: "0.20 allowed\n0.40 rejected",
    checks: [
      { label: "Declares a namespace", pattern: "namespace\\s+drive" },
      { label: "Calls through the qualified name", pattern: "drive::allows" },
    ],
    hint: "namespace drive { struct Limits {...}; bool allows(...) {...} }",
  },

  // ---------------------------------------------------------------- C++ advanced
  {
    id: "cppa-01",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "01",
    title: "Real-time constraints",
    brief: "Run a fixed-step loop and count deadline misses instead of drifting.",
    origin: { label: "C++ Advanced lesson 01", to: "/courses/cpp-advanced" },
    steps: [
      "Advance the loop clock by exactly one period per tick, never by the measured duration.",
      "Count a miss whenever the work exceeds the period.",
      "Print the tick count and the number of misses.",
    ],
    starterCode: `#include <iostream>

int main() {
  const int period_us = 1000;
  const int work_us[5] = {820, 950, 640, 700, 880};
  int now_us = 0;
  int misses = 0;
  for (int tick = 0; tick < 5; ++tick) {
    // TODO: advance now_us by one fixed period and count a miss when work exceeds it.
  }
  std::cout << "ticks 5\\n";
  std::cout << "elapsed_us " << now_us << "\\n";
  std::cout << "misses " << misses << "\\n";
  return 0;
}
`,
    expectedOutput: "ticks 5\nelapsed_us 5000\nmisses 0",
    checks: [
      { label: "Advances by the fixed period", pattern: "now_us\\s*\\+=\\s*period_us" },
      { label: "Compares work against the period", pattern: "work_us\\[tick\\]\\s*>" },
    ],
    hint: "now_us += period_us; if (work_us[tick] > period_us) ++misses;",
  },
  {
    id: "cppa-02",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "02",
    title: "Custom allocators & pools",
    brief: "Hand out memory from a fixed arena with no heap traffic.",
    origin: { label: "C++ Advanced lesson 02", to: "/courses/cpp-advanced" },
    steps: [
      "Return a pointer into the buffer and advance the offset by the requested size.",
      "Return nullptr when the arena is exhausted instead of falling back to the heap.",
      "Print how many bytes were handed out.",
    ],
    starterCode: `#include <cstddef>
#include <iostream>

class Arena {
public:
  void* allocate(std::size_t bytes) {
    // TODO: bump-allocate from buffer_, or return nullptr when full.
    return nullptr;
  }
  std::size_t used() const { return used_; }

private:
  alignas(std::max_align_t) unsigned char buffer_[64]{};
  std::size_t used_{0};
};

int main() {
  Arena arena;
  const void* a = arena.allocate(16);
  const void* b = arena.allocate(16);
  const void* c = arena.allocate(64);
  std::cout << "first " << (a != nullptr ? "ok" : "null") << "\\n";
  std::cout << "second " << (b != nullptr ? "ok" : "null") << "\\n";
  std::cout << "oversized " << (c != nullptr ? "ok" : "null") << "\\n";
  std::cout << "used " << arena.used() << "\\n";
  return 0;
}
`,
    expectedOutput: "first ok\nsecond ok\noversized null\nused 32",
    checks: [
      { label: "Refuses oversized requests", pattern: "nullptr" },
      { label: "Tracks the offset", pattern: "used_\\s*\\+=" },
      { label: "No heap allocation", pattern: "^(?![\\s\\S]*\\b(new|malloc)\\b)[\\s\\S]*$" },
    ],
    hint: "if (used_ + bytes > sizeof(buffer_)) return nullptr; void* p = buffer_ + used_; used_ += bytes; return p;",
  },
  {
    id: "cppa-03",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "03",
    title: "Lock-free data structures",
    brief: "Complete a single-producer single-consumer ring buffer.",
    origin: { label: "C++ Advanced lesson 03", to: "/courses/cpp-advanced" },
    steps: [
      "push stores a value and advances the head; it fails when the ring is full.",
      "pop reads from the tail and fails when head equals tail.",
      "Print each popped value, then the empty result.",
    ],
    starterCode: `#include <atomic>
#include <iostream>

template <typename T, std::size_t N>
class Ring {
public:
  bool push(T value) {
    const std::size_t head = head_.load(std::memory_order_relaxed);
    const std::size_t next = (head + 1) % N;
    if (next == tail_.load(std::memory_order_acquire)) return false;
    slots_[head] = value;
    // TODO: publish the new head with release ordering.
    return true;
  }

  bool pop(T& out) {
    const std::size_t tail = tail_.load(std::memory_order_relaxed);
    if (tail == head_.load(std::memory_order_acquire)) return false;
    out = slots_[tail];
    tail_.store((tail + 1) % N, std::memory_order_release);
    return true;
  }

private:
  T slots_[N]{};
  std::atomic<std::size_t> head_{0};
  std::atomic<std::size_t> tail_{0};
};

int main() {
  Ring<int, 4> ring;
  ring.push(10);
  ring.push(20);
  int value = 0;
  while (ring.pop(value)) std::cout << "pop " << value << "\\n";
  std::cout << "empty " << (ring.pop(value) ? "no" : "yes") << "\\n";
  return 0;
}
`,
    expectedOutput: "pop 10\npop 20\nempty yes",
    checks: [
      {
        label: "Publishes the head with release ordering",
        pattern: "head_\\.store\\([^)]*memory_order_release",
      },
      { label: "Uses atomics, not locks", pattern: "^(?![\\s\\S]*mutex)[\\s\\S]*$" },
    ],
    hint: "head_.store(next, std::memory_order_release);",
  },
  {
    id: "cppa-04",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "04",
    title: "Compile-time unit safety",
    brief: "Make a wrong unit a compile error and keep the maths constexpr.",
    origin: { label: "C++ Advanced lesson 04", to: "/courses/cpp-advanced" },
    steps: [
      "Give Radians a constexpr constructor and a constexpr addition that only accepts Radians.",
      "Prove the result at compile time with static_assert.",
      "Print the runtime value of the same constant.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>

struct Radians {
  double value{0.0};
  // TODO: add a constexpr constructor and constexpr operator+ for Radians only.
};

int main() {
  constexpr Radians a{1.0};
  constexpr Radians b{0.5};
  constexpr Radians sum = a + b;
  static_assert(sum.value == 1.5, "compile-time sum must be exact");
  std::cout << std::fixed << std::setprecision(2) << "sum " << sum.value << "\\n";
  return 0;
}
`,
    expectedOutput: "sum 1.50",
    checks: [
      { label: "Uses constexpr", pattern: "constexpr" },
      { label: "Adds only matching units", pattern: "operator\\+\\s*\\(\\s*(const\\s+)?Radians" },
      { label: "Keeps the static_assert", pattern: "static_assert" },
    ],
    hint: "constexpr Radians operator+(const Radians& other) const { return Radians{value + other.value}; }",
  },
  {
    id: "cppa-05",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "05",
    title: "Architecture & interfaces",
    brief: "Drive two controller implementations through one abstract interface.",
    origin: { label: "C++ Advanced lesson 05", to: "/courses/cpp-advanced" },
    steps: [
      "Give Controller a pure virtual command() and a virtual destructor.",
      "Implement it twice and store both behind std::unique_ptr<Controller>.",
      "Call each one through the base pointer only.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>
#include <memory>
#include <vector>

class Controller {
public:
  // TODO: virtual destructor and pure virtual double command(double error) const.
};

class Proportional : public Controller {
public:
  double command(double error) const override { return 2.0 * error; }
};

class Deadband : public Controller {
public:
  double command(double error) const override { return (error < 0.1) ? 0.0 : error; }
};

int main() {
  std::vector<std::unique_ptr<Controller>> stack;
  stack.push_back(std::make_unique<Proportional>());
  stack.push_back(std::make_unique<Deadband>());
  std::cout << std::fixed << std::setprecision(2);
  for (const auto& controller : stack) std::cout << "command " << controller->command(0.05) << "\\n";
  return 0;
}
`,
    expectedOutput: "command 0.10\ncommand 0.00",
    checks: [
      { label: "Virtual destructor on the interface", pattern: "virtual\\s+~Controller" },
      {
        label: "Pure virtual command",
        pattern: "command\\s*\\(\\s*double\\s+\\w+\\s*\\)\\s*const\\s*=\\s*0",
      },
    ],
    hint: "virtual ~Controller() = default; virtual double command(double error) const = 0;",
  },
  {
    id: "cppa-06",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "06",
    title: "Sanitizers & bounds discipline",
    brief: "Fix an off-by-one loop that a sanitizer would flag as a buffer overrun.",
    origin: { label: "C++ Advanced lesson 06", to: "/courses/cpp-advanced" },
    steps: [
      "The loop currently reads one element past the end of the array.",
      "Fix the bound so exactly four elements are summed.",
      "Print the size and the sum.",
    ],
    starterCode: `#include <iostream>

int main() {
  const int samples[4] = {1, 2, 3, 4};
  const int count = 4;
  int sum = 0;
  for (int i = 0; i <= count; ++i) {  // TODO: this reads out of bounds.
    sum += samples[i];
  }
  std::cout << "count " << count << "\\n";
  std::cout << "sum " << sum << "\\n";
  return 0;
}
`,
    expectedOutput: "count 4\nsum 10",
    checks: [
      { label: "No <= bound on the index", pattern: "^(?![\\s\\S]*i\\s*<=\\s*count)[\\s\\S]*$" },
      { label: "Loops over the samples", pattern: "samples\\[" },
    ],
    hint: "for (int i = 0; i < count; ++i)",
  },
  {
    id: "cppa-07",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "07",
    title: "Latency instrumentation",
    brief: "Bucket loop latencies into a histogram and report deadline misses.",
    origin: { label: "C++ Advanced lesson 07", to: "/courses/cpp-advanced" },
    steps: [
      "Place each sample in the bucket for its 500 microsecond band, capped at the last bucket.",
      "Print each bucket count.",
      "Print how many samples exceeded the 1000 microsecond deadline.",
    ],
    starterCode: `#include <iostream>

int main() {
  const int samples[6] = {320, 480, 700, 980, 1200, 640};
  int buckets[3] = {0, 0, 0};  // <500us, <1000us, >=1000us
  int over_deadline = 0;
  for (int i = 0; i < 6; ++i) {
    // TODO: increment the right bucket and count deadline misses.
  }
  std::cout << "under_500 " << buckets[0] << "\\n";
  std::cout << "under_1000 " << buckets[1] << "\\n";
  std::cout << "over_1000 " << buckets[2] << "\\n";
  std::cout << "missed " << over_deadline << "\\n";
  return 0;
}
`,
    expectedOutput: "under_500 2\nunder_1000 3\nover_1000 1\nmissed 1",
    checks: [
      { label: "Fills the buckets", pattern: "buckets\\[" },
      { label: "Counts deadline misses", pattern: "over_deadline" },
    ],
    hint: "Use if (sample < 500) buckets[0]++; else if (sample < 1000) buckets[1]++; else { buckets[2]++; ++over_deadline; }",
  },
  {
    id: "cppa-08",
    group: "cpp-advanced",
    groupLabel: "C++ Advanced",
    number: "08",
    title: "Capstone: motion pipeline",
    brief: "Wire planner, interpolator and driver into one deterministic pipeline.",
    origin: { label: "C++ Advanced lesson 08", to: "/courses/cpp-advanced" },
    steps: [
      "The planner clamps the goal to the joint limit.",
      "The interpolator produces three evenly spaced setpoints.",
      "The driver prints each setpoint with two decimals.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>
#include <vector>

double plan(double goal, double limit) { return goal > limit ? limit : goal; }

std::vector<double> interpolate(double target, int steps) {
  std::vector<double> points;
  points.reserve(steps);
  // TODO: push target * (i + 1) / steps for each step.
  return points;
}

int main() {
  std::cout << std::fixed << std::setprecision(2);
  const double target = plan(1.5, 0.9);
  for (double setpoint : interpolate(target, 3)) std::cout << "setpoint " << setpoint << "\\n";
  return 0;
}
`,
    expectedOutput: "setpoint 0.30\nsetpoint 0.60\nsetpoint 0.90",
    checks: [
      { label: "Fills the trajectory", pattern: "push_back" },
      { label: "Reserves before the loop", pattern: "reserve" },
    ],
    hint: "points.push_back(target * (i + 1) / steps); with a double division.",
  },

  // -------------------------------------------------------------------- ROS 2 labs
  {
    id: "ros2-install-lyrical",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "01",
    title: "Verify a ROS 2 Lyrical install",
    brief:
      "Write the environment check that tells a learner whether their shell is really sourced.",
    origin: { label: "Lab 01 · Install ROS 2 Lyrical", to: "/labs/install-lyrical" },
    steps: [
      "Return 'ready' only when the distro is lyrical and the Ubuntu release is 26.04.",
      "Report the specific problem otherwise: an unsourced shell or an unsupported release.",
      "Compare your reasoning with the terminal transcript on the right.",
    ],
    starterCode: `${SHIM}
std::string environmentReport(const std::string& distro, const std::string& ubuntu) {
  // TODO: return "ready", "shell not sourced" or "unsupported ubuntu".
  return "unknown";
}

int main() {
  Logger log;
  log.info(environmentReport("lyrical", "26.04"));
  log.info(environmentReport("", "26.04"));
  log.info(environmentReport("lyrical", "24.04"));
  return 0;
}
`,
    expectedOutput: "[INFO] ready\n[INFO] shell not sourced\n[INFO] unsupported ubuntu",
    checks: [
      { label: "Detects an unsourced shell", pattern: '(empty\\(\\)|== *"")' },
      { label: "Checks the Ubuntu release", pattern: "26\\.04" },
    ],
    hint: 'Check the empty distro first, then the Ubuntu release, then return "ready".',
    terminal: [
      { command: "source /opt/ros/lyrical/setup.bash", output: "" },
      { command: "echo $ROS_DISTRO", output: "lyrical" },
      {
        command: "ros2 run demo_nodes_cpp talker",
        output:
          "[INFO] [talker]: Publishing: 'Hello World: 1'\n[INFO] [talker]: Publishing: 'Hello World: 2'",
      },
    ],
  },
  {
    id: "ros2-workspace",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "02",
    title: "Prove the overlay wins",
    brief: "Decide whether ~/robot_ws is ahead of /opt/ros/lyrical on the search path.",
    origin: { label: "Lab 02 · Create the workspace", to: "/labs/workspace" },
    steps: [
      "Return true only when the workspace prefix appears before the ROS install prefix.",
      "Report both the correct and the reversed order.",
      "This is exactly what printenv AMENT_PREFIX_PATH shows you in a real shell.",
    ],
    starterCode: `${SHIM}
bool overlayFirst(const std::vector<std::string>& prefixes) {
  // TODO: true when a path containing "robot_ws" comes before "/opt/ros".
  return false;
}

int main() {
  Logger log;
  log.info(overlayFirst({"/home/dev/robot_ws/install", "/opt/ros/lyrical"}) ? "overlay active" : "overlay shadowed");
  log.info(overlayFirst({"/opt/ros/lyrical", "/home/dev/robot_ws/install"}) ? "overlay active" : "overlay shadowed");
  return 0;
}
`,
    expectedOutput: "[INFO] overlay active\n[INFO] overlay shadowed",
    checks: [
      { label: "Searches for the workspace prefix", pattern: "robot_ws" },
      { label: "Compares the positions", pattern: "(find|npos|for)" },
    ],
    hint: "Walk the vector in order and return true if you meet robot_ws before /opt/ros.",
    terminal: [
      {
        command: "cd ~/robot_ws && colcon build --symlink-install",
        output:
          "Starting >>> robot_basics\nFinished <<< robot_basics [2.41s]\n\nSummary: 1 package finished [2.68s]",
      },
      { command: "source install/setup.bash", output: "" },
      {
        command: "printenv AMENT_PREFIX_PATH",
        output: "/home/dev/robot_ws/install/robot_basics:/opt/ros/lyrical",
      },
    ],
  },
  {
    id: "ros2-cpp-package",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "03",
    title: "First node class",
    brief: "Write the node constructor that announces itself the way rclcpp does.",
    origin: { label: "Lab 03 · Build an ament C++ package", to: "/labs/cpp-package" },
    steps: [
      "Store the node name and log 'robot basics ready' from the constructor.",
      "Expose the name through a const accessor.",
      "In a real package this is exactly the body of your StatusNode constructor.",
    ],
    starterCode: `${SHIM}
class StatusNode {
public:
  explicit StatusNode(std::string name) : name_(std::move(name)) {
    // TODO: log "robot basics ready".
  }
  const std::string& name() const { return name_; }

private:
  Logger log_;
  std::string name_;
};

int main() {
  const StatusNode node{"status_node"};
  std::cout << "node " << node.name() << "\\n";
  return 0;
}
`,
    expectedOutput: "[INFO] robot basics ready\nnode status_node",
    checks: [
      { label: "Logs from the constructor", pattern: "log_\\.info" },
      { label: "Keeps the name private", pattern: "private:" },
    ],
    hint: 'log_.info("robot basics ready"); inside the constructor body.',
    terminal: [
      {
        command: "colcon build --packages-select robot_basics --symlink-install",
        output: "Finished <<< robot_basics [3.02s]",
      },
      {
        command: "ros2 run robot_basics status_node",
        output: "[INFO] [status_node]: robot basics ready",
      },
      { command: "ros2 node list", output: "/status_node" },
    ],
  },
  {
    id: "ros2-topics-cpp",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "04",
    title: "Publisher and subscriber",
    brief: "Connect a timer-driven publisher to a subscriber callback.",
    origin: { label: "Lab 04 · C++ publisher and subscriber", to: "/labs/topics-cpp" },
    steps: [
      "Store the callback when subscribe() is called.",
      "publish() must hand the value to the stored callback.",
      "Three timer ticks should deliver three increasing targets.",
    ],
    starterCode: `${SHIM}
class Topic {
public:
  void subscribe(std::function<void(double)> callback) {
    // TODO: remember the callback.
  }
  void publish(double value) {
    // TODO: deliver the value to the subscriber, if any.
  }

private:
  std::function<void(double)> callback_;
};

int main() {
  Logger log;
  Topic joint_target;
  joint_target.subscribe([&log](double value) {
    std::ostringstream text;
    text << std::fixed << std::setprecision(2) << "received " << value;
    log.info(text.str());
  });
  double target = 0.0;
  for (int tick = 0; tick < 3; ++tick) {
    joint_target.publish(target);
    target += 0.01;
  }
  return 0;
}
`,
    expectedOutput: "[INFO] received 0.00\n[INFO] received 0.01\n[INFO] received 0.02",
    checks: [
      { label: "Stores the callback", pattern: "callback_\\s*=" },
      {
        label: "Guards against no subscriber",
        pattern: "(if\\s*\\(\\s*callback_|callback_\\s*\\))",
      },
    ],
    hint: "Add #include <sstream>, assign callback_ = std::move(callback); and call it from publish when set.",
    terminal: [
      {
        command: "ros2 run robot_topics joint_publisher",
        output: "[INFO] [joint_publisher]: publishing 0.00",
      },
      { command: "ros2 topic echo /joint_target", output: "data: 0.0\n---\ndata: 0.01\n---" },
      {
        command: "ros2 topic hz /joint_target",
        output: "average rate: 10.002\n  min: 0.099s max: 0.101s",
      },
    ],
  },
  {
    id: "ros2-services-actions",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "05",
    title: "Action feedback and result",
    brief: "Produce decreasing feedback and a final result for a motion goal.",
    origin: { label: "Lab 05 · Services and motion actions", to: "/labs/services-actions" },
    steps: [
      "Move toward the target in fixed increments and report the remaining distance each step.",
      "Stop when the remaining distance reaches zero and report the result.",
      "Feedback must never increase: that is what an operator watches.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

struct Logger {
  void info(const std::string& message) const { std::cout << "[INFO] " << message << "\\n"; }
};

int main() {
  Logger log;
  const double target = 0.4;
  const double step = 0.1;
  double position = 0.1;
  // TODO: loop until position reaches target, logging "remaining X.XX" each step.
  std::ostringstream done;
  done << std::fixed << std::setprecision(2) << "reached " << position;
  log.info(done.str());
  return 0;
}
`,
    expectedOutput:
      "[INFO] remaining 0.20\n[INFO] remaining 0.10\n[INFO] remaining 0.00\n[INFO] reached 0.40",
    checks: [
      { label: "Loops toward the target", pattern: "(while|for)" },
      { label: "Reports remaining distance", pattern: "remaining" },
    ],
    hint: "position += step; then log target - position with two decimals, until position >= target.",
    terminal: [
      { command: "ros2 action list -t", output: "/move_joint [robot_interfaces/action/MoveJoint]" },
      {
        command:
          'ros2 action send_goal /move_joint robot_interfaces/action/MoveJoint "{target: 0.5}" --feedback',
        output:
          "Goal accepted with ID: 9f2c\nFeedback: remaining: 0.2\nFeedback: remaining: 0.1\nResult: reached: true",
      },
    ],
  },
  {
    id: "ros2-launch-parameters",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "06",
    title: "Validate a parameter on set",
    brief: "Accept a loaded parameter only when it is inside the declared safe range.",
    origin: { label: "Lab 06 · Launch and parameters", to: "/labs/launch-parameters" },
    steps: [
      "Reject any max_speed above the declared maximum and keep the previous value.",
      "Accept a value inside the range and report the new value.",
      "A loaded YAML value is not automatically safe: the node decides.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

class SpeedParameter {
public:
  bool set(double value) {
    // TODO: accept only values in (0.0, 0.25]; keep the old value otherwise.
    return false;
  }
  double value() const { return value_; }

private:
  double value_{0.25};
};

int main() {
  SpeedParameter speed;
  std::cout << std::fixed << std::setprecision(2);
  std::cout << "set 0.20 " << (speed.set(0.20) ? "accepted" : "rejected") << "\\n";
  std::cout << "set 0.90 " << (speed.set(0.90) ? "accepted" : "rejected") << "\\n";
  std::cout << "value " << speed.value() << "\\n";
  return 0;
}
`,
    expectedOutput: "set 0.20 accepted\nset 0.90 rejected\nvalue 0.20",
    checks: [
      { label: "Enforces the upper limit", pattern: "0\\.25" },
      { label: "Rejects instead of clamping silently", pattern: "return\\s+false" },
    ],
    hint: "if (value <= 0.0 || value > 0.25) return false; value_ = value; return true;",
    terminal: [
      {
        command: "ros2 launch robot_bringup system.launch.py",
        output: "[INFO] [status_node]: robot basics ready",
      },
      { command: "ros2 param get /status_node max_speed", output: "Double value is: 0.25" },
      {
        command: "ros2 param set /status_node max_speed 0.9",
        output: "Setting parameter failed: value outside declared range",
      },
    ],
  },
  {
    id: "ros2-frames-description",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "07",
    title: "Compose a transform chain",
    brief:
      "Add two link offsets for the special case where both transforms have identity rotation.",
    origin: { label: "Lab 07 · tf2, URDF and xacro", to: "/labs/frames-description" },
    steps: [
      "Confirm both transforms have identity rotation; only then add translations component by component.",
      "Print the composed translation with three decimals, in metres.",
      "This matches tf2_echo only for this zero-rotation model; general composition must rotate the child translation and compose orientation.",
    ],
    starterCode: `#include <iomanip>
#include <iostream>

struct Translation {
  double x{0.0};
  double y{0.0};
  double z{0.0};
};

Translation compose(const Translation& a, const Translation& b) {
  // TODO: return the sum of both translations.
  return {};
}

int main() {
  const Translation base_to_upper{0.0, 0.0, 0.2};
  const Translation upper_to_tool{0.0, 0.0, 0.3};
  const Translation base_to_tool = compose(base_to_upper, upper_to_tool);
  std::cout << std::fixed << std::setprecision(3);
  std::cout << "translation " << base_to_tool.x << " " << base_to_tool.y << " " << base_to_tool.z << "\\n";
  return 0;
}
`,
    expectedOutput: "translation 0.000 0.000 0.500",
    checks: [
      { label: "Adds every axis", pattern: "a\\.z\\s*\\+\\s*b\\.z" },
      { label: "Returns a Translation", pattern: "return" },
    ],
    hint: "For identity rotations only, return {a.x + b.x, a.y + b.y, a.z + b.z}. With rotation, use a tf2 transform instead of component-wise addition.",
    terminal: [
      {
        command: "ros2 launch training_arm_description display.launch.py",
        output: "[INFO] [robot_state_publisher]: got segment base_link",
      },
      {
        command: "ros2 run tf2_ros tf2_echo base_link tool0",
        output:
          "At time 12.400\n- Translation: [0.000, 0.000, 0.500]\n- Rotation: in RPY [0.000, 0.000, 0.000]",
      },
    ],
  },
  {
    id: "ros2-ros2-control",
    group: "ros2",
    groupLabel: "ROS 2 Labs",
    number: "08",
    title: "Controller lifecycle",
    brief: "Walk a controller through the states controller_manager requires before motion.",
    origin: { label: "Lab 08 · ros2_control and diagnostics", to: "/labs/ros2-control" },
    steps: [
      "configure() moves unconfigured to inactive; activate() only works from inactive.",
      "Refuse to activate a controller that was never configured.",
      "Print the state after each request, like ros2 control list_controllers does.",
    ],
    starterCode: `#include <iostream>
#include <string>

class ControllerState {
public:
  bool configure() {
    // TODO: only valid from "unconfigured".
    return false;
  }
  bool activate() {
    // TODO: only valid from "inactive".
    return false;
  }
  const std::string& state() const { return state_; }

private:
  std::string state_{"unconfigured"};
};

int main() {
  ControllerState arm;
  std::cout << "activate " << (arm.activate() ? "ok" : "refused") << "\\n";
  std::cout << "configure " << (arm.configure() ? "ok" : "refused") << "\\n";
  std::cout << "activate " << (arm.activate() ? "ok" : "refused") << "\\n";
  std::cout << "state " << arm.state() << "\\n";
  return 0;
}
`,
    expectedOutput: "activate refused\nconfigure ok\nactivate ok\nstate active",
    checks: [
      { label: "Guards the configure transition", pattern: "unconfigured" },
      { label: "Guards the activate transition", pattern: "inactive" },
      { label: "Reaches the active state", pattern: "active" },
    ],
    hint: 'if (state_ != "inactive") return false; state_ = "active"; return true;',
    terminal: [
      {
        command: "ros2 run controller_manager spawner arm_controller",
        output: "[INFO] Loaded arm_controller\n[INFO] Configured and activated arm_controller",
      },
      {
        command: "ros2 control list_controllers",
        output:
          "joint_state_broadcaster[joint_state_broadcaster/JointStateBroadcaster] active\narm_controller[joint_trajectory_controller/JointTrajectoryController] active",
      },
    ],
  },
];

export const practiceGroups = [
  {
    id: "cpp-beginner",
    label: "C++ Beginner",
    blurb: "Language core: types, control flow, containers, classes and tests.",
  },
  {
    id: "cpp-intermediate",
    label: "C++ Intermediate",
    blurb: "Ownership, moves, templates, threads and build boundaries.",
  },
  {
    id: "cpp-advanced",
    label: "C++ Advanced",
    blurb: "Determinism, arenas, lock-free paths and compile-time safety.",
  },
  {
    id: "ros2",
    label: "ROS 2 Labs",
    blurb: "One exercise per lab, with a simulated ROS 2 terminal beside it.",
  },
] as const;

export function getExercise(id: string) {
  return practiceExercises.find((exercise) => exercise.id === id);
}

export function exercisesForLab(labSlug: string) {
  return practiceExercises.filter((exercise) => exercise.origin.to === `/labs/${labSlug}`);
}
