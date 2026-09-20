import type { Lesson } from "@/lib/lesson-catalog";
import { getIndustrialLessonArtwork } from "@/lib/industrial-lesson-art";
import { industrialOutline } from "@/lib/industrial-outline";

// Public catalogue entries intentionally contain no paid teaching material: only the module,
// section and title. The complete lesson is returned only by an authenticated server function.
export const industrialLessonOutlines: Lesson[] = industrialOutline.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  summary: `${entry.module.title} · ${entry.section}`,
  duration: "45–90 min",
  objectives: [],
  concept: [],
  steps: [],
  example: "",
  codeWalkthrough: [],
  expected: [],
  troubleshooting: [],
  exercise: "",
  checklist: [],
  image: getIndustrialLessonArtwork(entry.slug),
  module: entry.module.title,
  section: entry.section,
}));
