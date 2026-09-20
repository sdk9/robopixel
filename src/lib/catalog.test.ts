import { describe, expect, it } from "vitest";

import { lessonCourses } from "@/lib/lesson-catalog";

describe("lesson catalogue", () => {
  it("contains 321 uniquely addressed lessons", () => {
    const lessons = Object.values(lessonCourses).flatMap((course) =>
      course.lessons.map((lesson) => `${course.slug}/${lesson.slug}`),
    );
    expect(lessons).toHaveLength(321);
    expect(new Set(lessons).size).toBe(lessons.length);
  });

  it("never ships paid lesson bodies in the public catalogue", () => {
    const paid = lessonCourses["industrial-robots"];
    expect(paid?.paid).toBe(true);
    for (const lesson of paid?.lessons ?? []) {
      expect(lesson.concept).toEqual([]);
      expect(lesson.steps).toEqual([]);
      expect(lesson.example).toBe("");
      expect(lesson.exercise).toBe("");
    }
    expect(JSON.stringify(paid)).not.toContain("Reject targets outside the URDF limits");
  });
});
