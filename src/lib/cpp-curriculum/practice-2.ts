import { practice, type Practice } from "./practice-types";

// Phases 3 and 4.
export const practicePhase34: Record<string, Practice> = {
  "auto and type inference": practice(
    "cpp",
    "elbow 2\nshoulder 1.5",
    String.raw`
#include <iostream>
#include <map>
#include <string>

int main() {
  std::map<std::string, double> limits{{"shoulder", 1.5}, {"elbow", 2.0}};
  //>> loop over limits with const auto& and a structured binding [joint, limit]; print "joint limit"
  for (const auto& [joint, limit] : limits) {
    std::cout << joint << ' ' << limit << '\n';
  }
  //<<
  return 0;
}
`,
  ),
  "Smart pointers: std::unique_ptr": practice(
    "cpp",
    "created\na empty\ndestroyed",
    String.raw`
#include <iostream>
#include <memory>

struct Driver {
  Driver() { std::cout << "created\n"; }
  ~Driver() { std::cout << "destroyed\n"; }
};

int main() {
  //>> make a unique_ptr<Driver> named a with make_unique, then move it into b
  auto a = std::make_unique<Driver>();
  auto b = std::move(a);
  //<<
  std::cout << (a ? "a owns it" : "a empty") << '\n';
  return 0;
}
`,
  ),
  "Smart pointers: std::shared_ptr and std::weak_ptr": practice(
    "cpp",
    "2\nexpired",
    String.raw`
#include <iostream>
#include <memory>

struct Status {
  int fault{0};
};

int main() {
  auto status = std::make_shared<Status>();
  //>> make viewer a second owner, print use_count(), then create a weak_ptr and reset both owners
  auto viewer = status;
  std::cout << status.use_count() << '\n';
  std::weak_ptr<Status> watcher = status;
  status.reset();
  viewer.reset();
  //<<
  if (auto alive = watcher.lock()) std::cout << alive->fault << '\n';
  else std::cout << "expired\n";
  return 0;
}
`,
  ),
  "Move semantics: move constructor, move assignment and std::move": practice(
    "cpp",
    "0 1000",
    String.raw`
#include <iostream>
#include <utility>
#include <vector>

class Frame {
 public:
  explicit Frame(std::size_t n) : data_(n) {}
  Frame(const Frame&) = default;
  Frame& operator=(const Frame&) = default;
  //>> write the move constructor and move assignment: steal data_ with std::move, both noexcept
  Frame(Frame&& other) noexcept : data_{std::move(other.data_)} {}
  Frame& operator=(Frame&& other) noexcept {
    data_ = std::move(other.data_);
    return *this;
  }
  //<<
  std::size_t size() const { return data_.size(); }

 private:
  std::vector<double> data_;
};

int main() {
  Frame a{1000};
  Frame b = std::move(a);
  std::cout << a.size() << ' ' << b.size() << '\n';
  return 0;
}
`,
  ),
  "Lambdas: capture lists and inline callbacks": practice(
    "cpp",
    "2",
    String.raw`
#include <iostream>
#include <vector>

int main() {
  const int threshold = 80;
  int count = 0;
  //>> write a lambda too_hot that captures threshold by copy and count by reference; it adds 1 to count when temp > threshold
  auto too_hot = [threshold, &count](double temp) {
    if (temp > threshold) ++count;
  };
  //<<
  for (double t : std::vector<double>{70, 85, 90, 60}) too_hot(t);
  std::cout << count << '\n';
  return 0;
}
`,
  ),
  "STL containers: vector, map, unordered_map, list": practice(
    "cpp",
    "3\n41.5\nmissing",
    String.raw`
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

int main() {
  std::vector<double> angles;
  //>> reserve room for 6 values, then push_back three angles
  angles.reserve(6);
  angles.push_back(0.1);
  angles.push_back(0.2);
  angles.push_back(0.3);
  //<<
  std::unordered_map<std::string, double> temps;
  temps["motor1"] = 41.5;
  std::cout << angles.size() << '\n' << temps["motor1"] << '\n';
  //>> use find() to look up "motor2" and print "missing" when it is absent
  if (temps.find("motor2") == temps.end()) std::cout << "missing\n";
  //<<
  return 0;
}
`,
  ),
  "STL algorithms: sort, find and for_each": practice(
    "cpp",
    "41\n85.5\n69.65",
    String.raw`
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
  std::vector<double> temps{41.0, 85.5, 62.0, 90.1};
  //>> sort a copy named sorted; find the first temperature above 80; compute the mean with accumulate
  auto sorted = temps;
  std::sort(sorted.begin(), sorted.end());
  auto hot = std::find_if(temps.begin(), temps.end(), [](double t) { return t > 80.0; });
  double mean = std::accumulate(temps.begin(), temps.end(), 0.0) / temps.size();
  //<<
  std::cout << sorted.front() << '\n' << *hot << '\n' << mean << '\n';
  return 0;
}
`,
  ),
  "Iterators: input, output, forward, bidirectional and random-access": practice(
    "cpp",
    "30\n4\n3",
    String.raw`
#include <iostream>
#include <iterator>
#include <list>
#include <vector>

int main() {
  std::vector<int> v{10, 20, 30, 40};
  std::list<int> l{1, 2, 3};
  //>> use random access on v (begin() + 2), then std::prev on the list's end()
  auto it = v.begin() + 2;
  auto last = std::prev(l.end());
  //<<
  std::cout << *it << '\n' << (v.end() - v.begin()) << '\n' << *last << '\n';
  return 0;
}
`,
  ),
  "std::chrono: timing and durations": practice(
    "cpp",
    "50 Hz\ntrue",
    String.raw`
#include <chrono>
#include <iostream>
#include <thread>

int main() {
  using namespace std::chrono_literals;
  constexpr auto period = 20ms;
  //>> convert the period to seconds as a double and print the frequency in Hz (1 / seconds)
  const double seconds = std::chrono::duration<double>(period).count();
  std::cout << 1.0 / seconds << " Hz\n";
  //<<
  const auto start = std::chrono::steady_clock::now();
  std::this_thread::sleep_for(10ms);
  const auto elapsed = std::chrono::steady_clock::now() - start;
  std::cout << std::boolalpha << (elapsed >= 10ms) << '\n';
  return 0;
}
`,
  ),
  "Multithreading: std::thread, std::mutex and std::lock_guard": practice(
    "cpp",
    "2000",
    String.raw`
#include <iostream>
#include <mutex>
#include <thread>

int main() {
  std::mutex m;
  int samples = 0;
  auto work = [&] {
    for (int i = 0; i < 1000; ++i) {
      //>> lock m with a lock_guard, then increment samples
      std::lock_guard<std::mutex> lock{m};
      ++samples;
      //<<
    }
  };
  std::thread a{work}, b{work};
  a.join();
  b.join();
  std::cout << samples << '\n';
  return 0;
}
`,
  ),
  "Async programming: std::future and std::async": practice(
    "cpp",
    "42",
    String.raw`
#include <future>
#include <iostream>

int main() {
  //>> start a std::async job (std::launch::async) that returns 6 * 7, then get() the result
  auto pending = std::async(std::launch::async, [] { return 6 * 7; });
  int answer = pending.get();
  //<<
  std::cout << answer << '\n';
  return 0;
}
`,
  ),
  "std::optional and std::variant": practice(
    "cpp",
    "move 1.5\n-1",
    String.raw`
#include <iostream>
#include <optional>
#include <variant>

struct Stop {};
struct MoveTo {
  double x;
};

int main() {
  std::variant<Stop, MoveTo> cmd = MoveTo{1.5};
  //>> use std::get_if<MoveTo>(&cmd): print "move x" when it holds a MoveTo, otherwise "stop"
  if (auto* m = std::get_if<MoveTo>(&cmd)) std::cout << "move " << m->x << '\n';
  else std::cout << "stop\n";
  //<<
  std::optional<double> reading;
  std::cout << reading.value_or(-1.0) << '\n';
  return 0;
}
`,
  ),
  "std::function": practice(
    "cpp",
    "button 7",
    String.raw`
#include <functional>
#include <iostream>

class Button {
 public:
  using Callback = std::function<void(int)>;
  //>> store the callback in on_press(); call it in press() only if one was set
  void on_press(Callback cb) { cb_ = std::move(cb); }
  void press(int id) {
    if (cb_) cb_(id);
  }
  //<<

 private:
  Callback cb_;
};

int main() {
  Button b;
  b.on_press([](int id) { std::cout << "button " << id << '\n'; });
  b.press(7);
  return 0;
}
`,
  ),
  "Type traits": practice(
    "cpp",
    "whole number\nfraction",
    String.raw`
#include <iostream>
#include <string>
#include <type_traits>

template <typename T>
std::string describe(T) {
  //>> use if constexpr: is_integral_v -> "whole number", is_floating_point_v -> "fraction", otherwise "other"
  if constexpr (std::is_integral_v<T>) return "whole number";
  else if constexpr (std::is_floating_point_v<T>) return "fraction";
  else return "other";
  //<<
}

int main() {
  std::cout << describe(3) << '\n' << describe(2.5) << '\n';
  return 0;
}
`,
  ),
  "constexpr (C++17)": practice(
    "cpp",
    "24",
    String.raw`
#include <array>
#include <iostream>

//>> write constexpr factorial(int n) with a loop
constexpr int factorial(int n) {
  int r = 1;
  for (int i = 2; i <= n; ++i) r *= i;
  return r;
}
//<<

static_assert(factorial(4) == 24, "factorial is wrong");

int main() {
  std::array<double, factorial(4)> table{};  // size computed at compile time
  std::cout << table.size() << '\n';
  return 0;
}
`,
  ),

  // ------------------------------------------------------------------ Phase 4
  "Function templates": practice(
    "cpp",
    "7\n2.5\n10",
    String.raw`
#include <iostream>

//>> write template max_of(T a, T b) and clamp_to(T v, T low, T high)
template <typename T>
T max_of(T a, T b) {
  return a < b ? b : a;
}

template <typename T>
T clamp_to(T v, T low, T high) {
  return v < low ? low : (v > high ? high : v);
}
//<<

int main() {
  std::cout << max_of(3, 7) << '\n' << max_of(2.5, 1.5) << '\n' << clamp_to(12, 0, 10) << '\n';
  return 0;
}
`,
  ),
  "Class templates": practice(
    "cpp",
    "1110\n3",
    String.raw`
#include <array>
#include <iostream>

template <typename T, std::size_t N>
class RingBuffer {
 public:
  //>> write push(): return false when count_ == N, otherwise store at (head_ + count_) % N and grow count_
  bool push(const T& v) {
    if (count_ == N) return false;
    data_[(head_ + count_) % N] = v;
    ++count_;
    return true;
  }
  //<<
  std::size_t size() const { return count_; }

 private:
  std::array<T, N> data_{};
  std::size_t head_{0}, count_{0};
};

int main() {
  RingBuffer<int, 3> rb;
  std::cout << rb.push(1) << rb.push(2) << rb.push(3) << rb.push(4) << '\n' << rb.size() << '\n';
  return 0;
}
`,
  ),
  "Template specialization": practice(
    "cpp",
    "int pointer unknown",
    String.raw`
#include <iostream>

template <typename T>
struct Describe {
  static const char* name() { return "unknown"; }
};

//>> specialize Describe for int (full) and for T* (partial)
template <>
struct Describe<int> {
  static const char* name() { return "int"; }
};

template <typename T>
struct Describe<T*> {
  static const char* name() { return "pointer"; }
};
//<<

int main() {
  std::cout << Describe<int>::name() << ' ' << Describe<char*>::name() << ' ' << Describe<float>::name() << '\n';
  return 0;
}
`,
  ),
  "SFINAE basics": practice(
    "cpp",
    "integer floating",
    String.raw`
#include <iostream>
#include <type_traits>

//>> write two kind() overloads that use enable_if_t: one for integral types ("integer"), one for floating-point ("floating")
template <typename T>
std::enable_if_t<std::is_integral_v<T>, const char*> kind(T) {
  return "integer";
}

template <typename T>
std::enable_if_t<std::is_floating_point_v<T>, const char*> kind(T) {
  return "floating";
}
//<<

int main() {
  std::cout << kind(3) << ' ' << kind(2.5) << '\n';
  return 0;
}
`,
  ),
  "Generic programming patterns": practice(
    "cpp",
    "2.5\n1.5",
    String.raw`
#include <array>
#include <iostream>
#include <numeric>
#include <vector>

//>> write template mean(const C& c): sum with accumulate from c.begin() to c.end(), divide by c.size()
template <typename C>
double mean(const C& c) {
  return std::accumulate(c.begin(), c.end(), 0.0) / c.size();
}
//<<

int main() {
  std::cout << mean(std::vector<int>{1, 2, 3, 4}) << '\n';
  std::cout << mean(std::array<double, 2>{1.0, 2.0}) << '\n';
  return 0;
}
`,
  ),
};
