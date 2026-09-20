import { getExercise, type PracticeExercise } from "./practice-catalog";

export type CheckResult = { label: string; passed: boolean };

export type GradeResult = {
  compiled: boolean;
  compilerMessage: string;
  stdout: string;
  outputMatches: boolean;
  checks: CheckResult[];
  passed: boolean;
};

function normalise(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .replace(/\n+$/g, "");
}

async function compileWithWandbox(code: string) {
  const response = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      compiler: "gcc-head",
      code,
      options: "warning,c++17",
      "compiler-option-raw": "-pthread",
      save: false,
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`compiler service returned ${response.status}`);
  const body = (await response.json()) as {
    status?: string;
    compiler_error?: string;
    program_output?: string;
    program_error?: string;
  };
  const compilerError = body.compiler_error ?? "";
  const runtimeError = body.program_error ?? "";
  const compiled =
    compilerError.trim() === "" && (body.status === undefined || body.status === "0");
  return {
    compiled,
    compilerMessage: compilerError || runtimeError,
    stdout: body.program_output ?? "",
  };
}

async function compileWithGodbolt(code: string) {
  const response = await fetch("https://godbolt.org/api/compiler/g132/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      source: code,
      options: {
        userArguments: "-O1 -std=c++17 -pthread",
        executeParameters: { args: [], stdin: "" },
        compilerOptions: { executorRequest: true },
        filters: { execute: true },
      },
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`fallback compiler returned ${response.status}`);
  const body = (await response.json()) as {
    code?: number;
    stdout?: { text: string }[];
    stderr?: { text: string }[];
    buildResult?: { code?: number; stderr?: { text: string }[] };
  };
  const build = body.buildResult;
  const buildFailed = (build?.code ?? 0) !== 0;
  const runtimeFailed = typeof body.code === "number" && body.code !== 0;
  const lines = (entries?: { text: string }[]) =>
    (entries ?? []).map((entry) => entry.text).join("\n");
  return {
    compiled: !buildFailed && !runtimeFailed,
    compilerMessage: buildFailed
      ? lines(build?.stderr)
      : runtimeFailed
        ? lines(body.stderr) || `Program exited with status ${body.code}.`
        : lines(body.stderr),
    stdout: lines(body.stdout),
  };
}

function stripComments(code: string) {
  return code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/gm, " ");
}

function runChecks(exercise: PracticeExercise, code: string): CheckResult[] {
  const executableSource = stripComments(code);
  return exercise.checks.map((check) => {
    let passed = false;
    try {
      passed = new RegExp(check.pattern, "m").test(executableSource);
    } catch {
      passed = false;
    }
    return { label: check.label, passed };
  });
}

export async function gradeSubmission(exerciseId: string, code: string): Promise<GradeResult> {
  const exercise = getExercise(exerciseId);
  if (!exercise) throw new Error("Unknown exercise");
  if (code.length > 20000) throw new Error("Submission is too long");

  let run: { compiled: boolean; compilerMessage: string; stdout: string };
  try {
    run = await compileWithWandbox(code);
  } catch {
    run = await compileWithGodbolt(code);
  }

  const checks = runChecks(exercise, code);
  const stdout = normalise(run.stdout);
  const outputMatches = run.compiled && stdout === normalise(exercise.expectedOutput);
  const passed = run.compiled && outputMatches && checks.every((check) => check.passed);

  return {
    compiled: run.compiled,
    compilerMessage: run.compilerMessage.slice(0, 4000),
    stdout: stdout.slice(0, 4000),
    outputMatches,
    checks,
    passed,
  };
}
