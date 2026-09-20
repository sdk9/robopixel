export type LessonArtwork = {
  src: string;
  alt: string;
  label: string;
};

export const industrialLessonArtwork: Record<string, LessonArtwork> = {
  "01": {
    src: "/images/lesson-articulated-arm-1280.webp",
    alt: "Retro pixel-art six-axis industrial robot arm inside a guarded training cell",
    label: "6-AXIS CELL",
  },
  "02": {
    src: "/images/lesson-scara-1280.webp",
    alt: "Retro pixel-art SCARA robot working above an electronics assembly conveyor",
    label: "SCARA CELL",
  },
  "03": {
    src: "/images/lesson-delta-1280.webp",
    alt: "Retro pixel-art delta robot sorting colored parts on a conveyor",
    label: "DELTA CELL",
  },
  "04": {
    src: "/images/lesson-cartesian-1280.webp",
    alt: "Retro pixel-art three-axis Cartesian gantry above a machine-tending fixture",
    label: "GANTRY CELL",
  },
  "05": {
    src: "/images/lesson-humanoid-1280.webp",
    alt: "Retro pixel-art humanoid robot standing in an industrial training bay",
    label: "HUMANOID BAY",
  },
  "06": {
    src: "/images/lesson-cobot-1280.webp",
    alt: "Retro pixel-art collaborative robot arranging blocks at an open workbench",
    label: "COBOT BENCH",
  },
  "07": {
    src: "/images/lesson-amr-1280.webp",
    alt: "Retro pixel-art autonomous mobile robot carrying a tote through a warehouse aisle",
    label: "AMR AISLE",
  },
};

/** Artwork is chosen by module number, which is the first two digits of a lesson slug. */
export function getIndustrialLessonArtwork(slug: string): LessonArtwork {
  const artwork = industrialLessonArtwork[slug.slice(0, 2)];
  if (!artwork) throw new Error(`Missing artwork for industrial lesson: ${slug}`);
  return artwork;
}
