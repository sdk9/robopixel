import { practice, type Practice } from "./practice-types";

// Phases 1 and 2. Keys are lesson titles.
export const practicePhase12: Record<string, Practice> = {
  "Compilers & the build process": practice(
    "cpp",
    "standard: 201703",
    String.raw`
#include <iostream>

int main() {
  //>> print "standard: " followed by __cplusplus (201703 means C++17)
  std::cout << "standard: " << __cplusplus << '\n';
  //<<
  return 0;
}
`,
  ),
  "Compilation vs linking; object files and executables": practice(
    "cpp",
    "12",
    String.raw`
#include <iostream>

int report(int joints);  // declaration: a promise that report() exists somewhere

int main() {
  std::cout << report(6) << '\n';  // the compiler accepts this; the linker needs the body
  return 0;
}

//>> define report(): return joints * 2 (without it the linker says "undefined reference")
int report(int joints) { return joints * 2; }
//<<
`,
  ),
  "Basic syntax, variables and types; auto basics": practice(
    "cpp",
    "325.949",
    String.raw`
#include <iostream>

int main() {
  const int encoder_ticks{2048};
  const double full_turn_rad{6.283185307179586};
  //>> declare ticks_per_rad with auto: encoder_ticks divided by full_turn_rad
  const auto ticks_per_rad = encoder_ticks / full_turn_rad;
  //<<
  std::cout << ticks_per_rad << '\n';
  return 0;
}
`,
  ),
  "Comments, formatting and naming": practice(
    "cpp",
    "68.7549 deg/s",
    String.raw`
#include <iostream>

constexpr double pi = 3.14159265358979;
constexpr double max_joint_speed_rad_s = 1.2;  // unit in the name: radians per second

//>> write rad_to_deg(double rad) returning rad * 180.0 / pi
constexpr double rad_to_deg(double rad) { return rad * 180.0 / pi; }
//<<

int main() {
  std::cout << rad_to_deg(max_joint_speed_rad_s) << " deg/s\n";
  return 0;
}
`,
  ),
  "Input and output: std::cout, std::cin, streams": practice(
    "cpp",
    "joint 3 speed 12.5",
    String.raw`
#include <iostream>
#include <sstream>

int main() {
  std::istringstream line{"12.5 3"};  // pretend this text was typed by a user
  double speed{};
  int joint{};
  //>> read speed then joint from line; if reading fails print "bad input" to std::cerr and return 1
  if (!(line >> speed >> joint)) {
    std::cerr << "bad input\n";
    return 1;
  }
  //<<
  std::cout << "joint " << joint << " speed " << speed << '\n';
  return 0;
}
`,
  ),
  "Control flow: if, else and switch": practice(
    "cpp",
    "close\nstop",
    String.raw`
#include <iostream>

enum class State { open, closing, closed, fault };

const char* next_action(State s) {
  switch (s) {
    //>> add a case for each state: open -> "close", closing -> "wait", closed -> "open", fault -> "stop"
    case State::open: return "close";
    case State::closing: return "wait";
    case State::closed: return "open";
    case State::fault: return "stop";
    //<<
  }
  return "none";
}

int main() {
  std::cout << next_action(State::open) << '\n';
  std::cout << next_action(State::fault) << '\n';
  return 0;
}
`,
  ),
  "Loops: for, while and do-while": practice(
    "cpp",
    "sum 55\nsteps 4",
    String.raw`
#include <iostream>

int main() {
  int sum{0};
  //>> for loop: add i * i to sum for i = 1 to 5
  for (int i = 1; i <= 5; ++i) sum += i * i;
  //<<
  double torque{0.0};
  int steps{0};
  //>> while torque < 5.0: add 1.25 to torque and count the step
  while (torque < 5.0) {
    torque += 1.25;
    ++steps;
  }
  //<<
  std::cout << "sum " << sum << "\nsteps " << steps << '\n';
  return 0;
}
`,
  ),
  "Functions: parameters, return types and overloading": practice(
    "cpp",
    "10\nint\ndouble",
    String.raw`
#include <iostream>

//>> write clamp(value, low, high): return low if below, high if above, otherwise value
double clamp(double value, double low, double high) {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}
//<<

//>> overload describe() for int (returns "int") and for double (returns "double")
const char* describe(int) { return "int"; }
const char* describe(double) { return "double"; }
//<<

int main() {
  std::cout << clamp(12.0, 0.0, 10.0) << '\n';
  std::cout << describe(3) << '\n';
  std::cout << describe(2.5) << '\n';
  return 0;
}
`,
  ),
  "Arrays and strings: raw arrays, std::string, std::array": practice(
    "cpp",
    "shoulder_joint 14\n0.6",
    String.raw`
#include <array>
#include <iostream>
#include <string>

int main() {
  std::array<double, 3> joints{0.1, 0.2, 0.3};
  std::string name{"shoulder"};
  //>> append "_joint" to name
  name += "_joint";
  //<<
  double total{0.0};
  //>> add every joint angle to total with a range-based for loop
  for (double angle : joints) total += angle;
  //<<
  std::cout << name << ' ' << name.size() << '\n' << total << '\n';
  return 0;
}
`,
  ),
  "Pointers and references: T*, T& and passing by reference": practice(
    "cpp",
    "0\n3.4\n-1",
    String.raw`
#include <iostream>

//>> write zero(double& value) so it sets the caller's variable to 0.0
void zero(double& value) { value = 0.0; }
//<<

//>> write read_or(const double* sensor, double fallback): return *sensor, or fallback if sensor is nullptr
double read_or(const double* sensor, double fallback) {
  return sensor != nullptr ? *sensor : fallback;
}
//<<

int main() {
  double joint{1.2};
  zero(joint);
  double reading{3.4};
  std::cout << joint << '\n' << read_or(&reading, -1.0) << '\n' << read_or(nullptr, -1.0) << '\n';
  return 0;
}
`,
  ),
  "Memory model: stack vs heap, new/delete, and why raw pointers are dangerous": practice(
    "cpp",
    "sum 30",
    String.raw`
#include <iostream>

int main() {
  //>> allocate an array of 3 ints on the heap with new[], fill it with i * 10, add them up, then delete[] it
  int* values = new int[3];
  int sum{0};
  for (int i = 0; i < 3; ++i) {
    values[i] = i * 10;
    sum += values[i];
  }
  delete[] values;
  //<<
  std::cout << "sum " << sum << '\n';
  return 0;
}
`,
  ),
  "Structs and classes: members, methods and constructors": practice(
    "cpp",
    "motor 3 ok\nrejected",
    String.raw`
#include <iostream>

class Motor {
 public:
  Motor(int id, double max_speed) : id_{id}, max_speed_{max_speed} {}
  int id() const { return id_; }
  //>> write set_speed(double speed): return false if speed is below 0 or above max_speed_, otherwise store it and return true
  bool set_speed(double speed) {
    if (speed < 0.0 || speed > max_speed_) return false;
    speed_ = speed;
    return true;
  }
  //<<

 private:
  int id_;
  double max_speed_;
  double speed_{0.0};
};

int main() {
  Motor m{3, 1.5};
  std::cout << "motor " << m.id() << (m.set_speed(1.0) ? " ok" : " fail") << '\n';
  std::cout << (m.set_speed(9.0) ? "accepted" : "rejected") << '\n';
  return 0;
}
`,
  ),
  "RAII: deterministic cleanup, and why ROS 2 uses it everywhere": practice(
    "cpp",
    "connect\nworking\ndisconnect",
    String.raw`
#include <iostream>

class MotorSession {
 public:
  //>> constructor prints "connect"; destructor prints "disconnect"
  MotorSession() { std::cout << "connect\n"; }
  ~MotorSession() { std::cout << "disconnect\n"; }
  //<<
  MotorSession(const MotorSession&) = delete;
  MotorSession& operator=(const MotorSession&) = delete;
};

void run(bool ready) {
  MotorSession session;
  if (!ready) return;  // the destructor still runs on this early return
  std::cout << "working\n";
}

int main() {
  run(true);
  return 0;
}
`,
  ),

  // ------------------------------------------------------------------ Phase 2
  Encapsulation: practice(
    "cpp",
    "true\nfalse\n1",
    String.raw`
#include <iostream>

class Joint {
 public:
  Joint(double low, double high) : low_{low}, high_{high} {}
  //>> write move_to(angle): refuse angles outside [low_, high_]; otherwise store and return true
  bool move_to(double angle) {
    if (angle < low_ || angle > high_) return false;
    angle_ = angle;
    return true;
  }
  //<<
  double angle() const { return angle_; }

 private:
  double low_, high_;
  double angle_{0.0};
};

int main() {
  Joint j{-1.57, 1.57};
  std::cout << std::boolalpha << j.move_to(1.0) << '\n' << j.move_to(5.0) << '\n' << j.angle() << '\n';
  return 0;
}
`,
  ),
  Inheritance: practice(
    "cpp",
    "servo 2 gain 0.8",
    String.raw`
#include <iostream>

class Motor {
 public:
  explicit Motor(int id) : id_{id} {}
  int id() const { return id_; }

 protected:
  int id_;
};

//>> derive ServoMotor from Motor (public); its constructor calls Motor{id} and stores gain
class ServoMotor : public Motor {
 public:
  ServoMotor(int id, double gain) : Motor{id}, gain_{gain} {}
  double gain() const { return gain_; }

 private:
  double gain_;
};
//<<

int main() {
  ServoMotor s{2, 0.8};
  std::cout << "servo " << s.id() << " gain " << s.gain() << '\n';
  return 0;
}
`,
  ),
  "Polymorphism and virtual functions": practice(
    "cpp",
    "6\n0",
    String.raw`
#include <iostream>

class Controller {
 public:
  virtual ~Controller() = default;
  virtual double update(double error) = 0;
};

//>> derive PController (returns kp * error) and ZeroController (returns 0.0), both marked override
class PController : public Controller {
 public:
  explicit PController(double kp) : kp_{kp} {}
  double update(double error) override { return kp_ * error; }

 private:
  double kp_;
};

class ZeroController : public Controller {
 public:
  double update(double) override { return 0.0; }
};
//<<

void run(Controller& c) { std::cout << c.update(3.0) << '\n'; }

int main() {
  PController p{2.0};
  ZeroController z;
  run(p);
  run(z);
  return 0;
}
`,
  ),
  "Abstract classes and interfaces": practice(
    "cpp",
    "5",
    String.raw`
#include <algorithm>
#include <iostream>

class MotorPort {
 public:
  virtual ~MotorPort() = default;
  virtual bool command(double torque) = 0;
};

class FakeMotor : public MotorPort {
 public:
  //>> implement command(): remember the torque in last_ and return true
  bool command(double torque) override {
    last_ = torque;
    return true;
  }
  //<<
  double last() const { return last_; }

 private:
  double last_{0.0};
};

//>> write apply(MotorPort& port, double torque): limit torque to at most 5.0, then send it
bool apply(MotorPort& port, double torque) { return port.command(std::min(torque, 5.0)); }
//<<

int main() {
  FakeMotor fake;
  apply(fake, 8.0);
  std::cout << fake.last() << '\n';
  return 0;
}
`,
  ),
  "Operator overloading": practice(
    "cpp",
    "(4, 6)",
    String.raw`
#include <iostream>

struct Vec2 {
  double x{0.0}, y{0.0};
};

//>> overload operator+ (add components) and operator<< (print as "(x, y)")
Vec2 operator+(const Vec2& a, const Vec2& b) { return Vec2{a.x + b.x, a.y + b.y}; }

std::ostream& operator<<(std::ostream& out, const Vec2& v) {
  return out << '(' << v.x << ", " << v.y << ')';
}
//<<

int main() {
  Vec2 a{1, 2}, b{3, 4};
  std::cout << a + b << '\n';
  return 0;
}
`,
  ),
  Namespaces: practice(
    "cpp",
    "hardware\nsim",
    String.raw`
#include <iostream>

//>> put a Motor struct with a name() function in namespace robot::hardware ("hardware") and another in robot::sim ("sim")
namespace robot::hardware {
struct Motor {
  static const char* name() { return "hardware"; }
};
}  // namespace robot::hardware

namespace robot::sim {
struct Motor {
  static const char* name() { return "sim"; }
};
}  // namespace robot::sim
//<<

int main() {
  std::cout << robot::hardware::Motor::name() << '\n';
  std::cout << robot::sim::Motor::name() << '\n';
  return 0;
}
`,
  ),
  "Header files and project structure": practice(
    "cpp",
    "10\n0",
    String.raw`
#include <iostream>

// ---- limits.hpp (the header: declarations only) ----
namespace robot {
double clamp(double v, double low, double high);
}

// ---- main.cpp ----
int main() {
  std::cout << robot::clamp(12.0, 0.0, 10.0) << '\n';
  std::cout << robot::clamp(-3.0, 0.0, 10.0) << '\n';
  return 0;
}

// ---- limits.cpp (the source: definitions) ----
//>> define robot::clamp() here, outside main; the header only declared it
namespace robot {
double clamp(double v, double low, double high) {
  return v < low ? low : (v > high ? high : v);
}
}  // namespace robot
//<<
`,
  ),
  Exceptions: practice(
    "cpp",
    "error: speed must be >= 0\nspeed 2.5",
    String.raw`
#include <iostream>
#include <stdexcept>

double parse_speed(double raw) {
  //>> throw std::invalid_argument("speed must be >= 0") when raw is negative
  if (raw < 0.0) throw std::invalid_argument("speed must be >= 0");
  //<<
  return raw;
}

int main() {
  //>> call parse_speed(-3.0) inside try and print "error: " + e.what() in a catch block
  try {
    parse_speed(-3.0);
  } catch (const std::invalid_argument& e) {
    std::cout << "error: " << e.what() << '\n';
  }
  //<<
  std::cout << "speed " << parse_speed(2.5) << '\n';
  return 0;
}
`,
  ),
  "Error handling patterns": practice(
    "cpp",
    "21.5\nno reading",
    String.raw`
#include <iostream>
#include <optional>

//>> return std::nullopt when not connected, otherwise 21.5
std::optional<double> read_sensor(bool connected) {
  if (!connected) return std::nullopt;
  return 21.5;
}
//<<

int main() {
  if (auto v = read_sensor(true)) std::cout << *v << '\n';
  if (auto v = read_sensor(false)) std::cout << *v << '\n';
  else std::cout << "no reading\n";
  return 0;
}
`,
  ),
};
