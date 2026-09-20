import { phase1 } from "./phase-1";
import { phase2 } from "./phase-2";
import { phase3 } from "./phase-3";
import { phase4, phase5 } from "./phase-4-5";
import { phase6 } from "./phase-6";
import { phase7 } from "./phase-7";
import { practicePhase12 } from "./practice-1";
import { practicePhase34 } from "./practice-2";
import { practicePhase56 } from "./practice-3";
import { practicePhase7 } from "./practice-4";
import type { Practice } from "./practice-types";
import type { CppPhase, CppSpec } from "./types";

export type { CppPhase, CppSpec } from "./types";
export { splitPractice, type Practice } from "./practice-types";

export const cppPhases: CppPhase[] = [phase1, phase2, phase3, phase4, phase5, phase6, phase7];

/** Which phases each free track teaches, in order. */
export const trackPhases = {
  beginner: [phase1, phase2],
  intermediate: [phase3, phase4, phase5],
  advanced: [phase6, phase7],
} as const;

/** A lesson together with the phase it belongs to. */
export type CppEntry = CppSpec & { phase: string };

export function trackEntries(key: keyof typeof trackPhases): CppEntry[] {
  return trackPhases[key].flatMap((phase) =>
    phase.lessons.map((lesson) => ({ ...lesson, phase: phase.title })),
  );
}

export const practiceByTitle: Record<string, Practice> = {
  ...practicePhase12,
  ...practicePhase34,
  ...practicePhase56,
  ...practicePhase7,
};
