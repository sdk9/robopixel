import { practice, type Practice } from "./practice-types";

// Phases 5 and 6.
export const practicePhase56: Record<string, Practice> = {
  "Basic CMakeLists": practice(
    "cmake",
    "Built target robot_app",
    String.raw`
# CMakeLists.txt  (next to src/main.cpp, which contains: int main() { return 0; })
cmake_minimum_required(VERSION 3.16)
project(robot_app LANGUAGES CXX)
#>> require C++17 without compiler extensions (three set() lines)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
#<<
#>> build an executable named robot_app from src/main.cpp
add_executable(robot_app src/main.cpp)
#<<
# Build: cmake -S . -B build && cmake --build build
`,
  ),
  "Targets, linking and include directories": practice(
    "cmake",
    "Built target robot_math\nBuilt target robot_app",
    String.raw`
# CMakeLists.txt  (src/robot_math.cpp, include/robot_math.hpp, src/main.cpp)
cmake_minimum_required(VERSION 3.16)
project(robot_suite LANGUAGES CXX)
#>> create the robot_math library and give it PUBLIC include/ and cxx_std_17
add_library(robot_math src/robot_math.cpp)
target_include_directories(robot_math PUBLIC include)
target_compile_features(robot_math PUBLIC cxx_std_17)
#<<
add_executable(robot_app src/main.cpp)
#>> link robot_app PRIVATE to robot_math
target_link_libraries(robot_app PRIVATE robot_math)
#<<
`,
  ),
  "Static vs shared libraries": practice(
    "cmake",
    "librobot_static.a and librobot_shared.so appear in build/",
    String.raw`
# CMakeLists.txt  (same source file built both ways)
cmake_minimum_required(VERSION 3.16)
project(libs LANGUAGES CXX)
#>> build one STATIC and one SHARED library from src/robot_math.cpp
add_library(robot_static STATIC src/robot_math.cpp)
add_library(robot_shared SHARED src/robot_math.cpp)
#<<
add_executable(robot_app src/main.cpp)
#>> link the application to the shared library
target_link_libraries(robot_app PRIVATE robot_shared)
#<<
# Check it: ldd build/robot_app | grep robot_shared
`,
  ),
  "Organizing multi-file projects": practice(
    "cmake",
    "100% tests passed, 0 tests failed out of 1",
    String.raw`
# Top-level CMakeLists.txt  (folders: src/, apps/, tests/, each with its own CMakeLists.txt)
cmake_minimum_required(VERSION 3.16)
project(robot_suite LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)
#>> turn on testing and pull in the three subfolders
enable_testing()
add_subdirectory(src)
add_subdirectory(apps)
add_subdirectory(tests)
#<<
# tests/CMakeLists.txt would contain:
#   add_executable(math_tests math_tests.cpp)
#   add_test(NAME math_tests COMMAND math_tests)
# Run: cmake -S . -B build && cmake --build build && ctest --test-dir build
`,
  ),
  "Using external libraries": practice(
    "cmake",
    "Built target pose_app",
    String.raw`
# CMakeLists.txt  (needs: sudo apt install libeigen3-dev)
cmake_minimum_required(VERSION 3.16)
project(pose LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)
#>> find Threads and Eigen3 (REQUIRED, NO_MODULE for Eigen)
find_package(Threads REQUIRED)
find_package(Eigen3 3.3 REQUIRED NO_MODULE)
#<<
add_executable(pose_app src/pose.cpp)
#>> link pose_app PRIVATE to the imported targets Threads::Threads and Eigen3::Eigen
target_link_libraries(pose_app PRIVATE Threads::Threads Eigen3::Eigen)
#<<
`,
  ),
  "Debugging with gdb": practice(
    "cpp",
    "-1",
    String.raw`
// Build with: g++ -std=c++17 -g -O0 debug.cpp -o debug   then run: gdb ./debug
#include <iostream>

int first_value(const int* p) {
  //>> guard against a null pointer: return -1 instead of dereferencing it (without the guard gdb shows a crash in this line)
  if (p == nullptr) return -1;
  //<<
  return *p;
}

int main() {
  const int* missing = nullptr;
  std::cout << first_value(missing) << '\n';
  return 0;
}
`,
  ),
  "clang-tidy and static analysis": practice(
    "cpp",
    "6",
    String.raw`
// Run: clang-tidy -p build --checks='modernize-*,bugprone-*' tidy.cpp
#include <iostream>
#include <vector>

int main() {
  //>> use nullptr instead of NULL and a range-based for loop with const auto& (modernize checks)
  const int* unused = nullptr;
  std::vector<int> values{1, 2, 3};
  int sum = 0;
  for (const auto& v : values) sum += v;
  //<<
  (void)unused;
  std::cout << sum << '\n';
  return 0;
}
`,
  ),

  // ------------------------------------------------------------------ Phase 6
  "Class-based node-like structures": practice(
    "cpp",
    "arm: too hot",
    String.raw`
#include <iostream>
#include <string>

class TemperatureNode {
 public:
  explicit TemperatureNode(std::string name) : name_{std::move(name)} {}
  //>> write on_sample(): store the value in last_ and print "<name>: too hot" when it is above limit_
  void on_sample(double celsius) {
    last_ = celsius;
    if (celsius > limit_) std::cout << name_ << ": too hot\n";
  }
  //<<

 private:
  std::string name_;
  double limit_{80.0};
  double last_{0.0};
};

int main() {
  TemperatureNode node{"arm"};
  node.on_sample(70.0);
  node.on_sample(85.0);
  return 0;
}
`,
  ),
  "Callbacks and lambdas": practice(
    "cpp",
    "last: ready",
    String.raw`
#include <functional>
#include <iostream>
#include <string>

class Subscriber {
 public:
  using Callback = std::function<void(const std::string&)>;
  explicit Subscriber(Callback cb) : cb_{std::move(cb)} {}
  void deliver(const std::string& msg) const { cb_(msg); }

 private:
  Callback cb_;
};

class Logger {
 public:
  //>> create sub_ with a lambda that captures this and stores the message in last_
  Logger() : sub_{[this](const std::string& m) { last_ = m; }} {}
  //<<
  std::string last_;
  Subscriber sub_;
};

int main() {
  Logger logger;
  logger.sub_.deliver("ready");
  std::cout << "last: " << logger.last_ << '\n';
  return 0;
}
`,
  ),
  "Event-driven programming": practice(
    "cpp",
    "temp 42\nfault 1",
    String.raw`
#include <functional>
#include <iostream>
#include <map>
#include <queue>
#include <string>

struct Event {
  std::string type;
  double value;
};

class EventLoop {
 public:
  using Handler = std::function<void(const Event&)>;
  void on(const std::string& type, Handler h) { handlers_[type] = std::move(h); }
  void post(Event e) { queue_.push(std::move(e)); }
  void run_pending() {
    //>> while the queue is not empty: take the oldest event, pop it, and call its handler if one exists
    while (!queue_.empty()) {
      Event e = std::move(queue_.front());
      queue_.pop();
      if (auto it = handlers_.find(e.type); it != handlers_.end()) it->second(e);
    }
    //<<
  }

 private:
  std::map<std::string, Handler> handlers_;
  std::queue<Event> queue_;
};

int main() {
  EventLoop loop;
  loop.on("temperature", [](const Event& e) { std::cout << "temp " << e.value << '\n'; });
  loop.on("fault", [](const Event& e) { std::cout << "fault " << e.value << '\n'; });
  loop.post({"temperature", 42});
  loop.post({"fault", 1});
  loop.run_pending();
  return 0;
}
`,
  ),
  "Asynchronous patterns": practice(
    "cpp",
    "result 3.14",
    String.raw`
#include <chrono>
#include <iostream>
#include <mutex>
#include <thread>
#include <vector>

int main() {
  std::mutex m;
  std::vector<double> results;
  std::thread worker{[&] {
    std::this_thread::sleep_for(std::chrono::milliseconds(50));  // pretend to plan a path
    //>> lock m and push_back(3.14) onto results
    std::lock_guard<std::mutex> lock{m};
    results.push_back(3.14);
    //<<
  }};
  worker.join();
  std::lock_guard<std::mutex> lock{m};
  for (double r : results) std::cout << "result " << r << '\n';
  return 0;
}
`,
  ),
  "Clean API design": practice(
    "cpp",
    "0.5",
    String.raw`
#include <iostream>

struct Meters {
  explicit Meters(double v) : value{v} {}
  double value;
};

struct Seconds {
  explicit Seconds(double v) : value{v} {}
  double value;
};

//>> write speed(Meters, Seconds) returning metres per second, marked [[nodiscard]]
[[nodiscard]] double speed(Meters d, Seconds t) { return d.value / t.value; }
//<<

int main() {
  std::cout << speed(Meters{2.0}, Seconds{4.0}) << '\n';
  // speed(Seconds{4.0}, Meters{2.0});  // try un-commenting: the compiler rejects swapped units
  return 0;
}
`,
  ),
  "Logging patterns": practice(
    "cpp",
    "[arm] joint 3 near limit",
    String.raw`
#include <iostream>
#include <string>

enum class Level { debug, info, warn, error };

class Logger {
 public:
  explicit Logger(std::string name, Level min = Level::info) : name_{std::move(name)}, min_{min} {}
  void log(Level lvl, const std::string& msg) const {
    //>> return silently when lvl is below min_; otherwise print "[name] msg"
    if (lvl < min_) return;
    std::cout << '[' << name_ << "] " << msg << '\n';
    //<<
  }

 private:
  std::string name_;
  Level min_;
};

int main() {
  Logger log{"arm"};
  log.log(Level::debug, "raw encoder value 8123");  // hidden: below the info threshold
  log.log(Level::warn, "joint 3 near limit");
  return 0;
}
`,
  ),
  "Configuration structs": practice(
    "cpp",
    "rate_hz must be positive\nok",
    String.raw`
#include <iostream>
#include <optional>
#include <string>

struct ArmConfig {
  std::string frame{"base_link"};
  double rate_hz{50.0};
  double max_speed{1.2};
};

//>> return an error message for a non-positive rate_hz or max_speed, otherwise std::nullopt
std::optional<std::string> validate(const ArmConfig& c) {
  if (c.rate_hz <= 0.0) return "rate_hz must be positive";
  if (c.max_speed <= 0.0) return "max_speed must be positive";
  return std::nullopt;
}
//<<

int main() {
  ArmConfig bad;
  bad.rate_hz = -1.0;
  if (auto err = validate(bad)) std::cout << *err << '\n';
  ArmConfig good;
  if (!validate(good)) std::cout << "ok\n";
  return 0;
}
`,
  ),
  "Thread-safe queues": practice(
    "cpp",
    "5050",
    String.raw`
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <queue>
#include <thread>

template <typename T>
class SafeQueue {
 public:
  void push(T v) {
    {
      std::lock_guard<std::mutex> lock{m_};
      q_.push(std::move(v));
    }
    cv_.notify_one();
  }
  T pop() {
    //>> lock with unique_lock, wait until the queue is not empty, then return and remove the front item
    std::unique_lock<std::mutex> lock{m_};
    cv_.wait(lock, [this] { return !q_.empty(); });
    T v = std::move(q_.front());
    q_.pop();
    return v;
    //<<
  }

 private:
  std::mutex m_;
  std::condition_variable cv_;
  std::queue<T> q_;
};

int main() {
  SafeQueue<int> queue;
  std::thread producer{[&] {
    for (int i = 1; i <= 100; ++i) queue.push(i);
  }};
  int sum = 0;
  for (int i = 0; i < 100; ++i) sum += queue.pop();
  producer.join();
  std::cout << sum << '\n';
  return 0;
}
`,
  ),
  "Timers and periodic tasks": practice(
    "cpp",
    "ticks 5\ntrue",
    String.raw`
#include <chrono>
#include <iostream>
#include <thread>

int main() {
  using clock = std::chrono::steady_clock;
  using namespace std::chrono_literals;
  constexpr auto period = 20ms;
  const auto start = clock::now();
  auto next = start + period;
  int ticks = 0;
  for (int i = 0; i < 5; ++i) {
    ++ticks;  // the periodic task would run here
    //>> sleep until the absolute deadline next, then advance next by period
    std::this_thread::sleep_until(next);
    next += period;
    //<<
  }
  std::cout << "ticks " << ticks << '\n' << std::boolalpha << (clock::now() - start >= 100ms) << '\n';
  return 0;
}
`,
  ),
};
