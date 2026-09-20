import { describe, expect, it } from "vitest";

import { industrialRobotLabs } from "@/lib/industrial-robot-labs";
import { compileRobotProgram, getRobotGoalProgress, type RobotLabConfig } from "@/lib/robot-lab";

const config: RobotLabConfig = {
  scene: "amr",
  mission: "Test route",
  objective: "Reach the dock",
  starterCode: "",
  solutionCode: "",
  hint: "",
  accent: "#fff",
  commands: [
    {
      name: "navigate",
      example: 'robot.navigate("dock");',
      description: "Navigate",
      arguments: [{ type: "string", values: ["rack", "dock"] }],
    },
    {
      name: "setSpeed",
      example: "robot.setSpeed(35);",
      description: "Set speed",
      arguments: [{ type: "number", values: [35] }],
    },
  ],
  goals: [
    { label: "Limit speed", command: "setSpeed(35)" },
    { label: "Visit rack", command: 'navigate("rack")' },
    { label: "Reach dock", command: 'navigate("dock")' },
  ],
  points: {
    rack: { x: 10, y: 10, label: "Rack" },
    dock: { x: 20, y: 20, label: "Dock" },
  },
  initial: { x: 0, y: 0 },
};

describe("robot code lab compiler", () => {
  it("parses the safe command language and ignores comments", () => {
    const result = compileRobotProgram(
      `// route plan
robot.setSpeed(35);
robot.navigate("rack"); // collect
robot.navigate("dock");`,
      config,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.commands.map((command) => command.token)).toEqual([
      "setSpeed(35)",
      'navigate("rack")',
      'navigate("dock")',
    ]);
    expect(getRobotGoalProgress(result.commands, config.goals)).toEqual([true, true, true]);
  });

  it("ships a valid but incomplete starter and a complete solution for all seven robots", () => {
    expect(Object.keys(industrialRobotLabs)).toHaveLength(7);
    for (const lab of Object.values(industrialRobotLabs)) {
      const starter = compileRobotProgram(lab.starterCode, lab);
      const solution = compileRobotProgram(lab.solutionCode, lab);
      expect(starter.ok, `${lab.mission} starter should compile`).toBe(true);
      expect(solution.ok, `${lab.mission} solution should compile`).toBe(true);
      if (!starter.ok || !solution.ok) continue;
      expect(getRobotGoalProgress(starter.commands, lab.goals).every(Boolean)).toBe(false);
      expect(getRobotGoalProgress(solution.commands, lab.goals).every(Boolean)).toBe(true);
    }
  });

  it("rejects unknown commands and invalid waypoint values", () => {
    expect(compileRobotProgram("robot.fly();", config)).toMatchObject({
      ok: false,
      line: 1,
    });
    expect(compileRobotProgram('robot.navigate("office");', config)).toMatchObject({
      ok: false,
      line: 1,
    });
  });

  it("requires mission goals in order", () => {
    const result = compileRobotProgram(
      `robot.navigate("rack");
robot.setSpeed(35);
robot.navigate("dock");`,
      config,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(getRobotGoalProgress(result.commands, config.goals)).toEqual([true, false, false]);
  });
});
