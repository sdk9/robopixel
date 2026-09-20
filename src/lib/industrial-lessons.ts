// Server-only: the complete paid Industrial Robots lessons. Imported dynamically by the
// authenticated server function so lesson bodies never ship in the public bundle.
import type { Lesson } from "@/lib/lesson-catalog";
import { getIndustrialLessonArtwork } from "@/lib/industrial-lesson-art";
import { industrialRobotLabs } from "@/lib/industrial-robot-labs";
import { industrialOutline } from "@/lib/industrial-outline";
import type { LessonSpec } from "@/lib/industrial-content/types";
import { module01 } from "@/lib/industrial-content/module-01";
import { module02 } from "@/lib/industrial-content/module-02";
import { module03 } from "@/lib/industrial-content/module-03";
import { module04 } from "@/lib/industrial-content/module-04";
import { module05 } from "@/lib/industrial-content/module-05";
import { module06 } from "@/lib/industrial-content/module-06";
import { module07 } from "@/lib/industrial-content/module-07";

const specsByModule: Record<string, LessonSpec[]> = {
  "01": module01,
  "02": module02,
  "03": module03,
  "04": module04,
  "05": module05,
  "06": module06,
  "07": module07,
};

const defaultNotes = [
  "Practise in simulation or with mock hardware first, and use conservative limits.",
  "Manufacturer manuals, risk assessments and site safety procedures always take priority over this course.",
];

export const industrialLessons: Lesson[] = industrialOutline.map((entry) => {
  const spec = specsByModule[entry.module.number]?.[entry.indexInModule];
  if (!spec) throw new Error(`Missing lesson content for ${entry.slug}`);
  if (spec.title !== entry.title) {
    throw new Error(
      `Lesson content order mismatch: expected "${entry.title}", found "${spec.title}"`,
    );
  }
  const lab = spec.lab ? industrialRobotLabs[spec.lab] : undefined;
  if (spec.lab && !lab) throw new Error(`Missing interactive lab ${spec.lab} for ${entry.slug}`);
  const [sourceLabel, sourceHref] = spec.source ?? [
    entry.module.sourceLabel,
    entry.module.sourceHref,
  ];
  return {
    slug: entry.slug,
    title: entry.title,
    summary: spec.summary,
    duration: lab ? "60–90 min" : "45–75 min",
    objectives: spec.goals,
    concept: spec.concept,
    steps: spec.steps,
    example: spec.example,
    codeWalkthrough: spec.walk,
    expected: spec.expect,
    troubleshooting: spec.fix.map(([symptom, fix]) => ({ symptom, fix })),
    exercise: spec.exercise,
    checklist: spec.checklist,
    notes: defaultNotes,
    sourceLabel,
    sourceHref,
    image: getIndustrialLessonArtwork(entry.slug),
    module: entry.module.title,
    section: entry.section,
    ...(lab ? { lab } : {}),
  };
});
