import { module01a } from "@/lib/industrial-content/module-01-a";
import { module01b } from "@/lib/industrial-content/module-01-b";
import { module01c } from "@/lib/industrial-content/module-01-c";
import { module01d } from "@/lib/industrial-content/module-01-d";
import type { LessonSpec } from "@/lib/industrial-content/types";

// Module 01 · Six-Axis Articulated Arm (40 lessons)
export const module01: LessonSpec[] = [...module01a, ...module01b, ...module01c, ...module01d];
