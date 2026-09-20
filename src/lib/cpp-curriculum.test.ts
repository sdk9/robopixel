import { describe, expect, it } from "vitest";

import { cppPhases, practiceByTitle, splitPractice, trackEntries } from "@/lib/cpp-curriculum";
import { lessonCourses } from "@/lib/lesson-catalog";

describe("C++17 curriculum", () => {
  it("has seven phases and every lesson is placed in a free track", () => {
    expect(cppPhases.map((phase) => phase.number)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    const total = cppPhases.reduce((n, phase) => n + phase.lessons.length, 0);
    const inTracks = (["beginner", "intermediate", "advanced"] as const).reduce(
      (n, key) => n + trackEntries(key).length,
      0,
    );
    expect(inTracks).toBe(total);
    expect(lessonCourses["cpp-beginner"]?.lessons.length).toBe(trackEntries("beginner").length);
  });

  it("puts a note under every code line and never uses post-C++17 features", () => {
    const isComment = (line: string) => /^\s*(#|\/\/|<!--)/.test(line);
    for (const phase of cppPhases) {
      for (const lesson of phase.lessons) {
        const label = lesson.title;
        expect(lesson.concept.length, label).toBeGreaterThanOrEqual(2);
        expect(lesson.exercise.length, label).toBeGreaterThan(40);
        const lines = lesson.example.split("\n").filter((line) => line.trim() !== "");
        expect(lines.length, label).toBeGreaterThanOrEqual(6);
        lines.forEach((line, i) => {
          if (isComment(line)) return;
          expect(isComment(lines[i + 1] ?? ""), `${label}: no note under "${line}"`).toBe(true);
        });
        expect(lesson.example, label).not.toMatch(
          /c\+\+2[03]|std::expected|std::span|std::format|\bconcept\b|\brequires\b|std::jthread|std::pmr|<=>/,
        );
      }
    }
  });

  it("gives every lesson practice code with TODOs in the starter and none in the solution", () => {
    for (const phase of cppPhases) {
      for (const lesson of phase.lessons) {
        const item = practiceByTitle[lesson.title];
        expect(item, lesson.title).toBeDefined();
        if (!item) continue;
        const { starter, solution } = splitPractice(item.code);
        expect(starter, lesson.title).toContain("TODO:");
        expect(starter, lesson.title).not.toMatch(/(\/\/|#)(>>|<<)/);
        expect(solution, lesson.title).not.toContain("TODO:");
        expect(item.output.length, lesson.title).toBeGreaterThan(0);
      }
    }
    expect(lessonCourses["cpp-beginner"]?.lessons[0]?.practice?.starter).toContain("TODO:");
  });

  it("covers every topic of the requested curriculum", () => {
    const titles = cppPhases.flatMap((phase) => phase.lessons.map((lesson) => lesson.title)).join("|");
    for (const topic of [
      "Compilers",
      "Compilation vs linking",
      "Pointers and references",
      "Memory model",
      "RAII",
      "Encapsulation",
      "Inheritance",
      "Polymorphism",
      "Abstract",
      "Operator overloading",
      "Namespaces",
      "Header files",
      "Exceptions",
      "Error handling",
      "auto",
      "std::unique_ptr",
      "std::shared_ptr",
      "Move semantics",
      "Lambdas",
      "STL containers",
      "STL algorithms",
      "Iterators",
      "std::chrono",
      "std::thread",
      "Async",
      "std::optional",
      "std::function",
      "Type traits",
      "constexpr",
      "Function templates",
      "Class templates",
      "specialization",
      "SFINAE",
      "Generic programming",
      "Basic CMakeLists",
      "Static vs shared",
      "external libraries",
      "gdb",
      "clang-tidy",
      "Timers",
      "Thread-safe queues",
      "Configuration structs",
      "Logging",
      "Publishers",
      "Subscribers",
      "Services",
      "Actions",
      "Parameters",
      "Launch files",
      "TF2",
      "URDF",
      "Gazebo",
      "Nav2",
      "packages",
      "Multi-threaded executors",
      "Lifecycle nodes",
    ]) {
      expect(titles.toLowerCase(), topic).toContain(topic.toLowerCase());
    }
  });
});
