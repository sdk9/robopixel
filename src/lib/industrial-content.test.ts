import { describe, expect, it } from "vitest";

import { industrialLessons } from "@/lib/industrial-lessons";
import { industrialModules, industrialOutline } from "@/lib/industrial-outline";

describe("industrial course content", () => {
  it("has the planned number of lessons per module", () => {
    const counts = industrialModules.map((module) =>
      module.sections.reduce((total, section) => total + section.lessons.length, 0),
    );
    expect(counts).toEqual([40, 30, 30, 25, 40, 30, 40]);
    expect(industrialOutline).toHaveLength(235);
  });

  it("has complete content for every outline entry, in the same order", () => {
    expect(industrialLessons).toHaveLength(industrialOutline.length);
    industrialLessons.forEach((lesson, index) => {
      expect(lesson.slug).toBe(industrialOutline[index]?.slug);
      expect(lesson.title).toBe(industrialOutline[index]?.title);
    });
  });

  it("gives every lesson full teaching material with a note under every code line", () => {
    for (const lesson of industrialLessons) {
      const label = `${lesson.slug}`;
      expect(lesson.objectives, label).toHaveLength(3);
      expect(lesson.concept.length, label).toBeGreaterThanOrEqual(2);
      expect(lesson.steps, label).toHaveLength(4);
      expect(lesson.codeWalkthrough, label).toHaveLength(3);
      expect(lesson.expected, label).toHaveLength(2);
      expect(lesson.troubleshooting, label).toHaveLength(2);
      expect(lesson.exercise.length, label).toBeGreaterThan(40);
      expect(lesson.checklist, label).toHaveLength(3);
      const lines = lesson.example.split("\n").filter((line) => line.trim() !== "");
      expect(lines.length, label).toBeGreaterThanOrEqual(6);
      // Every code line is followed by a comment line (the note), and never two code lines in a row.
      const isComment = (line: string) => /^\s*(#|\/\/|<!--)/.test(line);
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i] ?? "";
        if (isComment(line)) continue;
        expect(isComment(lines[i + 1] ?? ""), `${label}: no note under "${line.trim()}"`).toBe(
          true,
        );
      }
    }
  });

  it("uses unique lesson slugs", () => {
    const slugs = industrialOutline.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^\d{2}-[a-z0-9-]+$/);
  });
});
