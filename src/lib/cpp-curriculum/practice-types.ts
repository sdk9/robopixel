// Practice code is authored once as a complete, working solution. Regions between a
// "//>> hint" line and a "//<<" line are replaced by "// TODO: hint" in the starter file.
export type Practice = {
  lang: "cpp" | "cmake" | "ros";
  /** What the finished program prints (or what the build/run should show). */
  output: string;
  /** Full solution with //>> ... //<< markers. */
  code: string;
};

export const practice = (lang: Practice["lang"], output: string, code: string): Practice => ({
  lang,
  output,
  code: code.replace(/^\n/, ""),
});

const start = /^(\s*)(\/\/|#|<!--)>>\s*(.*?)(?:\s*-->)?$/;
const end = /^\s*(\/\/|#|<!--)<<\s*(?:-->)?\s*$/;

/** Split an authored practice into the starter (with TODOs) and the full solution. */
export function splitPractice(code: string): { starter: string; solution: string } {
  const starter: string[] = [];
  const solution: string[] = [];
  let skipping = false;
  for (const line of code.replace(/\r/g, "").split("\n")) {
    const open = start.exec(line);
    if (open) {
      starter.push(`${open[1]}${open[2]} TODO: ${open[3]}${open[2] === "<!--" ? " -->" : ""}`);
      skipping = true;
    } else if (end.test(line)) {
      skipping = false;
    } else {
      if (!skipping) starter.push(line);
      solution.push(line);
    }
  }
  return { starter: starter.join("\n").trimEnd(), solution: solution.join("\n").trimEnd() };
}
