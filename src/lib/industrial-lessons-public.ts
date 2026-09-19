import type { Lesson } from "@/lib/lesson-catalog";
import { getIndustrialLessonArtwork } from "@/lib/industrial-lesson-art";

const outlines = [
  [
    "01-six-axis-articulated-arm",
    "Six-axis articulated arm",
    "Model six revolute joints, validate targets and send a guarded trajectory through ros2_control.",
  ],
  [
    "02-scara-robot",
    "SCARA robot",
    "Coordinate planar joints, a vertical axis and tool rotation for a staged assembly cycle.",
  ],
  [
    "03-delta-parallel-robot",
    "Delta parallel robot",
    "Build a timing-aware conveyor simulation without treating generic code as vendor kinematics.",
  ],
  [
    "04-cartesian-gantry",
    "Cartesian gantry",
    "Home three linear axes and command bounded XYZ trajectories with explicit state transitions.",
  ],
  [
    "05-humanoid-platform",
    "Humanoid platform",
    "Monitor orientation and coordinate joint groups inside a simulation-only stability envelope.",
  ],
  [
    "06-collaborative-robot",
    "Collaborative robot",
    "Build an operator-aware command gate while keeping certified safety outside application code.",
  ],
  [
    "07-autonomous-mobile-robot",
    "Autonomous mobile robot",
    "Transform stamped goals into map and run cancellable simulated missions with recorded evidence.",
  ],
] as const;

// Public catalogue entries intentionally contain no paid teaching material.
// The complete lesson is returned only by an authenticated server function.
export const industrialLessonOutlines: Lesson[] = outlines.map(([slug, title, summary]) => ({
  slug,
  title,
  summary,
  duration: "60–90 min",
  objectives: [],
  concept: [],
  steps: [],
  example: "",
  codeWalkthrough: [],
  expected: [],
  troubleshooting: [],
  exercise: "",
  checklist: [],
  image: getIndustrialLessonArtwork(slug),
}));
