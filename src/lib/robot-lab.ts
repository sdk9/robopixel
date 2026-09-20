export type RobotLabScene =
  "articulated" | "scara" | "delta" | "cartesian" | "humanoid" | "cobot" | "amr";

export type RobotLabArgument = {
  type: "string" | "number" | "boolean";
  values?: Array<string | number | boolean>;
};

export type RobotLabCommandSpec = {
  name: string;
  example: string;
  description: string;
  arguments: RobotLabArgument[];
};

export type RobotLabGoal = {
  label: string;
  command: string;
};

export type RobotLabPoint = {
  x: number;
  y: number;
  label: string;
  color?: string;
};

export type RobotLabConfig = {
  scene: RobotLabScene;
  mission: string;
  objective: string;
  starterCode: string;
  solutionCode: string;
  hint: string;
  /** The one command the learner types themselves; shown in the "how to" panel. */
  missingCommand?: string | undefined;
  accent: string;
  commands: RobotLabCommandSpec[];
  goals: RobotLabGoal[];
  points: Record<string, RobotLabPoint>;
  initial: { x: number; y: number };
};

export type RobotCommandArgument = string | number | boolean;

export type CompiledRobotCommand = {
  name: string;
  arguments: RobotCommandArgument[];
  source: string;
  sourceLine: number;
  token: string;
};

export type RobotProgramResult =
  | { ok: true; commands: CompiledRobotCommand[] }
  | { ok: false; commands: []; error: string; line: number };

function stripComment(line: string) {
  let quote: string | null = null;
  for (let index = 0; index < line.length - 1; index += 1) {
    const character = line[index];
    if ((character === '"' || character === "'") && line[index - 1] !== "\\") {
      quote = quote === character ? null : (quote ?? character);
    }
    if (!quote && character === "/" && line[index + 1] === "/") return line.slice(0, index);
  }
  return line;
}

function splitArguments(value: string): string[] | null {
  if (!value.trim()) return [];
  const result: string[] = [];
  let quote: string | null = null;
  let current = "";
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index] ?? "";
    if ((character === '"' || character === "'") && value[index - 1] !== "\\") {
      quote = quote === character ? null : (quote ?? character);
      current += character;
      continue;
    }
    if (character === "," && !quote) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += character;
  }
  if (quote) return null;
  result.push(current.trim());
  return result;
}

function parseArgument(raw: string): RobotCommandArgument | undefined {
  if (/^(["']).*\1$/.test(raw)) return raw.slice(1, -1);
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) {
    const value = Number(raw);
    if (Number.isFinite(value)) return value;
  }
  return undefined;
}

function formatArgument(value: RobotCommandArgument) {
  return typeof value === "string" ? `"${value}"` : String(value);
}

export function robotCommandToken(name: string, argumentsValue: RobotCommandArgument[]) {
  return `${name}(${argumentsValue.map(formatArgument).join(",")})`;
}

export function compileRobotProgram(program: string, config: RobotLabConfig): RobotProgramResult {
  const commands: CompiledRobotCommand[] = [];
  const specs = new Map(config.commands.map((command) => [command.name, command]));
  const lines = program.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const source = stripComment(lines[index] ?? "").trim();
    if (!source) continue;
    const match = /^robot\.([A-Za-z][A-Za-z0-9_]*)\s*\((.*)\)\s*;?$/.exec(source);
    if (!match) {
      return {
        ok: false,
        commands: [],
        error: 'Use the form robot.command("value");',
        line: index + 1,
      };
    }

    const name = match[1] ?? "";
    const spec = specs.get(name);
    if (!spec) {
      return {
        ok: false,
        commands: [],
        error: `Unknown command robot.${name}(). Choose one from the command deck.`,
        line: index + 1,
      };
    }

    const rawArguments = splitArguments(match[2] ?? "");
    if (!rawArguments) {
      return { ok: false, commands: [], error: "A quoted value is not closed.", line: index + 1 };
    }
    if (rawArguments.length !== spec.arguments.length) {
      return {
        ok: false,
        commands: [],
        error: `${spec.name} expects ${spec.arguments.length} argument${spec.arguments.length === 1 ? "" : "s"}.`,
        line: index + 1,
      };
    }

    const parsedArguments: RobotCommandArgument[] = [];
    for (let argumentIndex = 0; argumentIndex < rawArguments.length; argumentIndex += 1) {
      const argument = parseArgument(rawArguments[argumentIndex] ?? "");
      const requirement = spec.arguments[argumentIndex];
      if (argument === undefined || typeof argument !== requirement?.type) {
        return {
          ok: false,
          commands: [],
          error: `Argument ${argumentIndex + 1} of ${spec.name} must be a ${requirement?.type ?? "value"}.`,
          line: index + 1,
        };
      }
      if (requirement.values && !requirement.values.includes(argument)) {
        return {
          ok: false,
          commands: [],
          error: `${formatArgument(argument)} is not available for ${spec.name}.`,
          line: index + 1,
        };
      }
      parsedArguments.push(argument);
    }

    commands.push({
      name,
      arguments: parsedArguments,
      source,
      sourceLine: index + 1,
      token: robotCommandToken(name, parsedArguments),
    });
  }

  if (commands.length === 0) {
    return { ok: false, commands: [], error: "Add at least one robot command.", line: 1 };
  }
  return { ok: true, commands };
}

export function getRobotGoalProgress(commands: CompiledRobotCommand[], goals: RobotLabGoal[]) {
  let commandIndex = 0;
  let blocked = false;
  return goals.map((goal) => {
    if (blocked) return false;
    const matchIndex = commands.findIndex(
      (command, index) => index >= commandIndex && command.token === goal.command,
    );
    if (matchIndex < 0) {
      blocked = true;
      return false;
    }
    commandIndex = matchIndex + 1;
    return true;
  });
}
