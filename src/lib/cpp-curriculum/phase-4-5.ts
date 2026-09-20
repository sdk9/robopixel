import { cpp, sh, type CppPhase } from "./types";

export const phase4: CppPhase = {
  number: 4,
  title: "Phase 4 — Templates & Generic Programming",
  blurb: "Write one piece of code that works for many types, the way the standard library and rclcpp do.",
  lessons: [
    {
      title: "Function templates",
      detail: "Type parameters, deduction, explicit arguments and when templates fail to compile.",
      time: "45–75 min",
      concept: [
        "A function template is a recipe: template <typename T> T max_of(T a, T b). The compiler generates a real function for each type you use, so there is no run-time cost. It deduces T from the arguments, or you can write it yourself: max_of<double>(1, 2.5).",
        "Templates are checked when they are used, so an error appears only for a type that lacks the operations the body needs (for example, < on a type without it). The messages are long: read the first error, and the line that names your type.",
      ],
      example: cpp(
        ["template <typename T>", "Declare a template with one type parameter named T."],
        ["T max_of(T a, T b) {", "Takes and returns the same type T."],
        ["  return a < b ? b : a;", "Requires that T supports the < operator."],
        ["}", "End of the template."],
        ["auto i = max_of(3, 7);", "T is deduced as int; result 7."],
        ["auto d = max_of(2.5, 1.5);", "T is deduced as double; result 2.5."],
        ["auto m = max_of<double>(1, 2.5);", "Explicit T: the int 1 is converted to double."],
        ["template <typename T>", "A second template."],
        ["T clamp_to(T v, T low, T high) { return v < low ? low : (v > high ? high : v); }", "A generic clamp that works for ints, doubles and any type with <."],
        ["auto c = clamp_to(12, 0, 10);", "Returns 10."],
      ),
      exercise:
        "Write template <typename T> T lerp(T a, T b, double t). Test it with double and with a Vec2 that has the operators it needs, then call it with std::string and read the first line of the error.",
    },
    {
      title: "Class templates",
      detail: "Generic containers and value types, template arguments and class template deduction (C++17).",
      time: "60–90 min",
      concept: [
        "A class template makes a whole class generic: template <typename T, std::size_t N> class RingBuffer. Its member functions are usually written in the header, because the compiler needs the full definition when it creates each instance. Non-type parameters such as N are compile-time values.",
        "C++17 adds class template argument deduction, so you can write std::pair p{1, 2.5} or Stack s{1} without spelling the types. The standard containers and rclcpp::Publisher<MsgT> are class templates.",
      ],
      example: cpp(
        ["template <typename T, std::size_t N>", "A template with a type T and a compile-time size N."],
        ["class RingBuffer {", "A fixed-capacity queue that overwrites nothing."],
        ["public:", "Public interface."],
        ["  bool push(const T& v) {", "Add a value, or report that the buffer is full."],
        ["    if (count_ == N) return false;", "Full: refuse."],
        ["    data_[(head_ + count_) % N] = v;", "Store at the next free slot, wrapping around."],
        ["    ++count_; return true;", "Track the new size and report success."],
        ["  }", "End of push."],
        ["  std::size_t size() const { return count_; }", "Number of stored values."],
        ["private:", "Hidden data."],
        ["  std::array<T, N> data_{};", "Storage lives inside the object; no heap."],
        ["  std::size_t head_{0}, count_{0};", "Position of the oldest value and the count."],
        ["};", "End of the class template."],
        ["RingBuffer<double, 8> samples;", "An instance holding up to 8 doubles."],
      ),
      exercise:
        "Finish RingBuffer with pop() returning std::optional<T>. Test with int and std::string, and make sure a full buffer refuses a push and an empty one returns nullopt.",
    },
    {
      title: "Template specialization",
      detail: "Full and partial specialization, and overriding the generic behaviour for one type.",
      time: "45–75 min",
      concept: [
        "A specialization is a special version of a template for particular types. A full specialization (template <> ...) replaces the generic code for one exact type; a partial specialization (class templates only) handles a family such as all pointers, T*. Function templates cannot be partially specialized: use overloading instead.",
        "Specialize when one type really needs different code, for example printing a bool as true/false. Do not specialize the standard library's templates other than the ones the standard allows (such as std::hash for your own type).",
      ],
      example: cpp(
        ["template <typename T>", "The generic template."],
        ["struct Describe { static const char* name() { return \"unknown\"; } };", "Default answer for every type."],
        ["template <>", "A full specialization follows, with no type parameter left."],
        ["struct Describe<int> { static const char* name() { return \"int\"; } };", "Used only when T is exactly int."],
        ["template <>", "Another full specialization."],
        ["struct Describe<double> { static const char* name() { return \"double\"; } };", "Used only when T is double."],
        ["template <typename T>", "A partial specialization is still a template."],
        ["struct Describe<T*> { static const char* name() { return \"pointer\"; } };", "Used for any pointer type."],
        ["std::cout << Describe<int>::name() << ' ' << Describe<char*>::name() << '\\n';", "Prints: int pointer."],
      ),
      exercise:
        "Write a template struct UnitName<T> with specializations for Meters, Radians and NewtonMeters tag types. Add a partial specialization for std::vector<T> that appends '[]' to the inner name.",
    },
    {
      title: "SFINAE basics",
      detail: "Substitution failure is not an error: enable_if and choosing overloads by type.",
      time: "60–90 min",
      concept: [
        "SFINAE stands for 'substitution failure is not an error': if substituting a type into a template's signature fails, the compiler quietly drops that overload instead of reporting an error. std::enable_if_t<condition, T> is the standard way to switch an overload on or off.",
        "This lets you provide one function for integral types and another for floating-point types. In C++17 prefer if constexpr when one function body can branch by type, and use enable_if when you need separate overloads. C++20 concepts replace most of this later, but ROS 2 C++17 code still uses SFINAE.",
      ],
      example: cpp(
        ["#include <type_traits>", "Header for enable_if_t and the traits."],
        ["template <typename T>", "Overload 1: whole numbers only."],
        ["std::enable_if_t<std::is_integral_v<T>, const char*> kind(T) { return \"integer\"; }", "The return type exists only when T is integral; otherwise this overload disappears."],
        ["template <typename T>", "Overload 2: fractions only."],
        ["std::enable_if_t<std::is_floating_point_v<T>, const char*> kind(T) { return \"floating\"; }", "The return type exists only when T is a float type."],
        ["std::cout << kind(3) << '\\n';", "Only overload 1 is viable: prints integer."],
        ["std::cout << kind(2.5) << '\\n';", "Only overload 2 is viable: prints floating."],
        ["// kind(std::string{});", "No overload is viable, so this would not compile, with a clear 'no matching function' error."],
      ),
      exercise:
        "Write serialize(T) with one overload for arithmetic types (to_string) and one for types that have a .to_string() method, detected with a small trait. Then rewrite the arithmetic/other split with if constexpr and compare readability.",
    },
    {
      title: "Generic programming patterns",
      detail: "Policies, tag dispatch, CRTP and writing small generic algorithms.",
      time: "60–90 min",
      concept: [
        "Generic code is written against the operations a type must support, not against one specific type. Common patterns are tag dispatch (choose an implementation from a small tag type), policy classes (pass behaviour as a template parameter) and CRTP (a class derives from a template of itself to get static polymorphism without virtual calls).",
        "Keep generic code simple: write the concrete version first, make it generic only when a second type appears, and test it with at least two different types. A small, well-named template beats a clever one.",
      ],
      example: cpp(
        ["struct Fast {}; struct Safe {};", "Two empty tag types used only to select code."],
        ["template <typename T>", "Fast overload."],
        ["T scale(T v, T f, Fast) { return v * f; }", "The tag says: no checks, just multiply."],
        ["template <typename T>", "Safe overload."],
        ["T scale(T v, T f, Safe) { return f < 0 ? T{} : v * f; }", "The tag says: refuse negative factors."],
        ["template <typename Derived>", "CRTP base: knows the derived type at compile time."],
        ["struct Shape { double area_twice() const { return 2 * static_cast<const Derived*>(this)->area(); } };", "Calls Derived::area() without a virtual function."],
        ["struct Square : Shape<Square> { double side{2}; double area() const { return side * side; } };", "Derive from Shape of itself: the CRTP pattern."],
        ["std::cout << scale(3.0, 2.0, Safe{}) << ' ' << Square{}.area_twice() << '\\n';", "Prints: 6 8."],
      ),
      exercise:
        "Write a generic mean() that works on any container with begin()/end() of numbers. Add a policy parameter that chooses between plain mean and trimmed mean, and test it with vector<int>, array<double,4> and list<float>.",
    },
  ],
};

export const phase5: CppPhase = {
  number: 5,
  title: "Phase 5 — CMake & Build Systems",
  blurb: "Critical for ROS 2: every ROS 2 package builds with CMake, so learn targets, libraries, debugging and static analysis.",
  lessons: [
    {
      title: "Basic CMakeLists",
      detail: "cmake_minimum_required, project, add_executable and an out-of-source build.",
      time: "45–75 min",
      concept: [
        "CMake does not compile code itself: it reads CMakeLists.txt and generates build files for Make or Ninja. Always build 'out of source' into a separate build/ folder so generated files never mix with your code.",
        "A minimal file names the CMake version, the project, the C++ standard, and one executable. ROS 2's ament_cmake is a set of extra CMake helpers on top of this same syntax.",
      ],
      example: sh(
        ["cmake_minimum_required(VERSION 3.16)", "Require CMake 3.16 or newer; it fixes the rules the file is read with."],
        ["project(robot_app LANGUAGES CXX)", "Name the project and enable the C++ compiler."],
        ["set(CMAKE_CXX_STANDARD 17)", "Use the C++17 language standard."],
        ["set(CMAKE_CXX_STANDARD_REQUIRED ON)", "Fail instead of silently falling back to an older standard."],
        ["set(CMAKE_CXX_EXTENSIONS OFF)", "Use -std=c++17, not the GNU extension -std=gnu++17."],
        ["add_executable(robot_app src/main.cpp)", "Build an executable named robot_app from src/main.cpp."],
        ["# Build: cmake -S . -B build && cmake --build build && ./build/robot_app", "Configure into build/, compile, and run (in a shell, not in this file)."],
      ),
      exercise:
        "Create a project with CMakeLists.txt and src/main.cpp. Configure and build it out of source, run it, delete build/ and rebuild. Then print CMAKE_CXX_STANDARD with message() to see it.",
    },
    {
      title: "Targets, linking and include directories",
      detail: "Libraries as targets, target_link_libraries and PUBLIC vs PRIVATE.",
      time: "60–90 min",
      concept: [
        "Modern CMake is target-based. A target (library or executable) carries its own sources, include directories, compile options and dependencies. target_link_libraries(app PRIVATE robot_math) both links and inherits the library's public include folders.",
        "PUBLIC means the library and everything that links to it need the setting; PRIVATE means only the library itself; INTERFACE means only the users. Put settings on targets, never in global variables, so that every package builds the same way on every machine.",
      ],
      example: sh(
        ["add_library(robot_math src/robot_math.cpp)", "Define a library target from its source file."],
        ["target_include_directories(robot_math PUBLIC include)", "Give the library, and everything that links it, the include/ folder."],
        ["target_compile_features(robot_math PUBLIC cxx_std_17)", "Require C++17 for the library and its users."],
        ["target_compile_options(robot_math PRIVATE -Wall -Wextra -Wpedantic)", "Warnings for the library's own code only."],
        ["add_executable(robot_app src/main.cpp)", "The application target."],
        ["target_link_libraries(robot_app PRIVATE robot_math)", "Link the library and inherit its PUBLIC include folder and features."],
      ),
      exercise:
        "Split robot_math into a library with a public header and a small executable. Put the C++ standard and include path on the library target, and show that main.cpp finds the header without an -I flag of its own.",
    },
    {
      title: "Static vs shared libraries",
      detail: "add_library STATIC and SHARED, position-independent code, and runtime paths.",
      time: "45–75 min",
      concept: [
        "A static library (libx.a) is copied into the executable at link time: one self-contained file, but every executable carries its own copy. A shared library (libx.so) is loaded at run time and shared between programs, so updating it fixes all of them, but it must be found when the program starts.",
        "ROS 2 packages are shared libraries by default, because nodes and plugins load them at run time. In CMake, add_library(x STATIC ...) or SHARED forces the choice; BUILD_SHARED_LIBS flips the default. Use ldd to see which shared libraries an executable needs.",
      ],
      example: sh(
        ["add_library(robot_static STATIC src/robot_math.cpp)", "Build librobot_static.a, copied into executables at link time."],
        ["add_library(robot_shared SHARED src/robot_math.cpp)", "Build librobot_shared.so, loaded when the program starts."],
        ["set_target_properties(robot_shared PROPERTIES POSITION_INDEPENDENT_CODE ON)", "Shared libraries need position-independent code."],
        ["target_link_libraries(robot_app PRIVATE robot_shared)", "Link the application to the shared version."],
        ["# ldd build/robot_app", "In a shell: list the shared libraries the program needs at run time."],
        ["# LD_LIBRARY_PATH=build ./build/robot_app", "In a shell: tell the loader where to find the .so if it cannot."],
      ),
      exercise:
        "Build the same code as a static and as a shared library, link an executable to each, compare file sizes with ls -l, and run ldd on both to see the difference.",
    },
    {
      title: "Organizing multi-file projects",
      detail: "Folder layout, add_subdirectory, tests and a public include tree.",
      time: "60–90 min",
      concept: [
        "Larger projects use one CMakeLists.txt per folder and add_subdirectory to pull them together: src/ for libraries, apps/ for executables and tests/ for tests. Each library owns its own headers under include/<name>/, so users write #include <name/header.hpp>.",
        "Enable tests with enable_testing() and add_test(), then run them with ctest. A build that anyone can start with three commands is the goal, and it is exactly how a colcon workspace expects packages to behave.",
      ],
      example: sh(
        ["cmake_minimum_required(VERSION 3.16)", "Top-level file: required version."],
        ["project(robot_suite LANGUAGES CXX)", "The whole suite is one project."],
        ["set(CMAKE_CXX_STANDARD 17)", "One standard for every subfolder."],
        ["enable_testing()", "Turn on ctest support for this build."],
        ["add_subdirectory(src)", "Read src/CMakeLists.txt, which defines the libraries."],
        ["add_subdirectory(apps)", "Read apps/CMakeLists.txt, which defines executables."],
        ["add_subdirectory(tests)", "Read tests/CMakeLists.txt, which defines the test programs."],
        ["add_test(NAME math_tests COMMAND math_tests)", "Register the test executable so ctest can run it (this line lives in tests/CMakeLists.txt)."],
      ),
      exercise:
        "Create src/, apps/ and tests/ with one library, one app and one test that checks clamp(). Build from an empty directory and run ctest --output-on-failure. Break the test on purpose and confirm ctest reports it.",
    },
    {
      title: "Using external libraries",
      detail: "find_package, imported targets, FetchContent and pkg-config.",
      time: "60–90 min",
      concept: [
        "find_package(Name REQUIRED) locates an installed library and gives you an imported target such as Threads::Threads or Eigen3::Eigen. Link to that target and CMake adds the right include folders and flags. ROS 2 packages are found the same way: find_package(rclcpp REQUIRED).",
        "When a library is not installed, FetchContent downloads and builds it inside your project, pinned to a version or commit for reproducibility. Prefer the system package (apt) for stable libraries and pin versions for anything you fetch.",
      ],
      example: sh(
        ["find_package(Threads REQUIRED)", "Find the platform's thread library; stop with a clear error if it is missing."],
        ["find_package(Eigen3 3.3 REQUIRED NO_MODULE)", "Find Eigen (linear algebra) version 3.3 or newer; install with sudo apt install libeigen3-dev."],
        ["add_executable(pose_app src/pose.cpp)", "An executable that uses both libraries."],
        ["target_link_libraries(pose_app PRIVATE Threads::Threads Eigen3::Eigen)", "Link the imported targets; include paths come along automatically."],
        ["include(FetchContent)", "Enable the FetchContent module."],
        ["FetchContent_Declare(catch2 GIT_REPOSITORY https://github.com/catchorg/Catch2.git GIT_TAG v3.5.2)", "Describe a dependency to download, pinned to an exact release tag."],
        ["FetchContent_MakeAvailable(catch2)", "Download and add it to this build."],
      ),
      exercise:
        "Install libeigen3-dev, use find_package and Eigen3::Eigen to multiply two 3×3 matrices in a small program, and build it with CMake. Then remove the package and read the CMake error message.",
    },
    {
      title: "Debugging with gdb",
      detail: "Debug builds, breakpoints, stepping, backtraces and watching variables.",
      time: "60–90 min",
      concept: [
        "gdb runs your program under control: you can stop it at a line, look at variables, step one line at a time and read the call stack after a crash. Build with debug information (-g) and without optimization (-O0), or lines and variables will not match what you see.",
        "Useful commands: break (b), run (r), next (n), step (s), print (p), backtrace (bt), continue (c), watch and quit. After a segmentation fault, bt shows the chain of calls that led to it. Under CMake, use -DCMAKE_BUILD_TYPE=Debug.",
      ],
      example: sh(
        ["cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug", "Configure a debug build (adds -g and no optimization)."],
        ["cmake --build build", "Compile it."],
        ["gdb ./build/robot_app", "Start gdb with the program loaded (it does not run yet)."],
        ["(gdb) break main.cpp:42", "Set a breakpoint on line 42 so the program stops there."],
        ["(gdb) run", "Start the program; it stops at the breakpoint."],
        ["(gdb) print joint_angle", "Show the current value of a variable."],
        ["(gdb) next", "Run one line without entering any function it calls."],
        ["(gdb) backtrace", "Show the chain of function calls that reached this point."],
        ["(gdb) continue", "Resume until the next breakpoint or the end."],
      ),
      exercise:
        "Write a program that dereferences a null pointer in a helper function. Build it with -g, run it under gdb, read the backtrace to find the exact line, then fix the bug and confirm it runs clean.",
    },
    {
      title: "clang-tidy and static analysis",
      detail: "Finding bugs without running the code, and using compile_commands.json.",
      time: "45–75 min",
      concept: [
        "Static analysis reads your code and reports likely bugs, style problems and outdated constructs without executing it. clang-tidy has hundreds of checks; useful groups are bugprone-*, performance-*, modernize-* and readability-*. Enable CMAKE_EXPORT_COMPILE_COMMANDS so the tool sees the same flags as the compiler.",
        "Treat findings as questions: understand each one before fixing it, and never silence a check just to make the report green. Add clang-tidy and clang-format to your CI job so problems are caught before merging. ROS 2 also provides ament_lint for the same purpose.",
      ],
      example: sh(
        ["cmake -S . -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON", "Configure and write build/compile_commands.json, the list of exact compiler commands."],
        ["clang-tidy -p build src/main.cpp", "Analyse one file using the compile commands in build/."],
        ["clang-tidy -p build --checks='bugprone-*,performance-*,modernize-*' src/main.cpp", "Run only selected groups of checks."],
        ["clang-tidy -p build --fix src/main.cpp", "Apply the automatic fixes (commit first so you can review the diff)."],
        ["clang-format -i src/main.cpp", "Reformat the file in place using the project style."],
        ["cppcheck --enable=warning,style --std=c++17 src", "A second, independent analyser for a different set of findings."],
      ),
      exercise:
        "Run clang-tidy with bugprone-*, performance-* and modernize-* on a program you wrote in Phase 3. Fix at least three findings by hand, explain each one in a note, and decide whether any should be ignored.",
    },
  ],
};
