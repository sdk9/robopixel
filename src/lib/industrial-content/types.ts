// Shared helpers for the paid Industrial Robots lesson bodies (server-only).

export type Note = readonly [line: string, note: string];

function annotate(open: string, close: string, pairs: Note[]) {
  const out: string[] = [];
  for (const [line, note] of pairs) {
    out.push(line);
    if (note) {
      const indent = /^\s*/.exec(line)?.[0] ?? "";
      out.push(`${indent}${open}${note}${close}`);
    }
  }
  return out.join("\n");
}

/** C++ example: every code line is followed by a `//` note saying what it does and why. */
export const cpp = (...pairs: Note[]) => annotate("// ", "", pairs);
/** Python, shell and YAML examples use `#` notes. */
export const hash = (...pairs: Note[]) => annotate("# ", "", pairs);
/** XML (URDF, launch files) examples use comment tags. */
export const xml = (...pairs: Note[]) => annotate("<!-- ", " -->", pairs);

export type LessonSpec = {
  /** Must equal the title in the public outline; a test checks this. */
  title: string;
  summary: string;
  goals: [string, string, string];
  concept: [string, string];
  steps: [string, string, string, string];
  example: string;
  walk: [string, string, string];
  expect: [string, string];
  fix: [[string, string], [string, string]];
  exercise: string;
  checklist: [string, string, string];
  /** Key of an interactive Robot Code Lab in industrial-robot-labs.ts. */
  lab?: string;
  /** Overrides the module's default documentation link. */
  source?: [label: string, href: string];
};

export const lesson = (spec: LessonSpec): LessonSpec => spec;
