import type { RobotLabConfig } from "@/lib/robot-lab";

const stringArgument = (values: string[]) => ({ type: "string" as const, values });
const numberArgument = (values?: number[]) =>
  values ? { type: "number" as const, values } : { type: "number" as const };

type Step = {
  code: string;
  what: string;
  why: string;
  /** The line the learner has to type; it is left out of the starter code. */
  yours?: boolean;
};

const WRAP = 62;

function wrapNote(label: string, text: string) {
  const prefix = `// ${label}: `;
  const indent = `//${" ".repeat(prefix.length - 2)}`;
  const lines: string[] = [];
  let current = prefix;
  for (const word of text.split(" ")) {
    if (current.length + word.length + 1 > WRAP && current.trim() !== prefix.trim()) {
      lines.push(current.trimEnd());
      current = indent;
    }
    current += `${current.endsWith(" ") ? "" : " "}${word}`;
  }
  lines.push(current.trimEnd());
  return lines;
}

/** Builds the editor text: every command is followed by a `// What` and `// Why` note. */
function buildProgram(steps: Step[], mode: "starter" | "solution") {
  const out = [
    "// Read this top to bottom: the robot runs one command per line.",
    "// The // notes are for you. The robot ignores them.",
    ...(mode === "starter"
      ? ["// Find the line marked >>> YOUR TURN and type the missing command."]
      : []),
    "",
  ];
  for (const step of steps) {
    if (step.yours && mode === "starter") {
      out.push(
        `// >>> YOUR TURN: type   ${step.code}   on the empty line just below.`,
        ...wrapNote("What it will do", step.what),
        ...wrapNote("Why it is needed", step.why),
        "",
        "",
      );
    } else {
      out.push(step.code, ...wrapNote("What", step.what), ...wrapNote("Why", step.why), "");
    }
  }
  return out.join("\n").trimEnd();
}

function labProgram(steps: Step[]) {
  const missing = steps.find((step) => step.yours);
  return {
    starterCode: buildProgram(steps, "starter"),
    solutionCode: buildProgram(steps, "solution"),
    missingCommand: missing?.code,
  };
}

const programs = {
  "01-six-axis-articulated-arm": labProgram([
    {
      code: "robot.speed(35);",
      what: "slows the arm down to 35% of full speed.",
      why: "test at low speed first, so a mistake is slow and safe.",
    },
    {
      code: 'robot.move("pick");',
      what: "moves the arm over the PICK spot, where the orange part is.",
      why: "the gripper has to be at the part before it can grab it.",
    },
    {
      code: 'robot.grip("close");',
      what: "closes the gripper fingers around the part.",
      why: "now the part is held and travels with the arm.",
    },
    {
      code: 'robot.move("inspect");',
      what: "carries the part to the VISION camera spot.",
      why: "the part is checked before it is put down.",
    },
    {
      code: 'robot.move("place");',
      what: "carries the part over the finished tray (PLACE).",
      why: "without it the arm opens the gripper over the wrong spot.",
      yours: true,
    },
    {
      code: 'robot.grip("open");',
      what: "opens the gripper and lets go of the part.",
      why: "the last step: the part must be released on the tray.",
    },
  ]),
  "02-scara-robot": labProgram([
    {
      code: "robot.speed(45);",
      what: "sets the work cycle to 45% speed.",
      why: "SCARA arms are fast, a moderate speed protects the board.",
    },
    {
      code: 'robot.move("pcb");',
      what: "slides the arm sideways over the FEEDER, where the board is.",
      why: "a SCARA first moves flat, and only then goes up or down.",
    },
    {
      code: "robot.lower(35);",
      what: "pushes the tool down 35 mm until it touches the board.",
      why: "the suction cup must touch the board to pick it up.",
    },
    {
      code: 'robot.grip("close");',
      what: "turns the vacuum on, so the board sticks to the tool.",
      why: "this is what actually picks the board up.",
    },
    {
      code: "robot.raise(35);",
      what: "lifts the board back up by 35 mm.",
      why: "always lift before moving sideways, or the board drags.",
    },
    {
      code: 'robot.move("assembly");',
      what: "slides the arm over the ASSEMBLY station.",
      why: "the board has to be above the place where it goes.",
    },
    {
      code: "robot.lower(20);",
      what: "lowers the board 20 mm into its seat.",
      why: "the board must sit in the fixture before it is released.",
    },
    {
      code: 'robot.grip("open");',
      what: "turns the vacuum off, so the board is released.",
      why: "otherwise the board stays stuck to the tool and is carried away.",
      yours: true,
    },
  ]),
  "03-delta-parallel-robot": labProgram([
    {
      code: 'robot.track("red");',
      what: "tells the camera to follow the red part on the moving belt.",
      why: "the belt never stops, so the robot has to aim at where the part is going.",
    },
    {
      code: 'robot.move("red_part");',
      what: "swings the gripper over the red part.",
      why: "the gripper must reach the part before it can grab it.",
    },
    {
      code: 'robot.grip("close");',
      what: "closes the gripper and picks the red part off the belt.",
      why: "now the part is held and can be carried to a bin.",
    },
    {
      code: 'robot.move("red_bin");',
      what: "carries the part over the RED BIN on the right.",
      why: "red parts go in the red bin, blue parts go in the blue bin.",
      yours: true,
    },
    {
      code: 'robot.grip("open");',
      what: "opens the gripper, and the part drops into the bin.",
      why: "the last step: the sorted part must be released.",
    },
  ]),
  "04-cartesian-gantry": labProgram([
    {
      code: "robot.home();",
      what: "sends every axis to its start position (the HOME corner).",
      why: "the gantry needs a known starting point before it can count cells.",
    },
    {
      code: "robot.moveTo(2, 1);",
      what: "moves to grid cell column 2, row 1 (columns 1-5, rows 1-3).",
      why: "cells are grid squares, not pixels, so the fixture sits at 2, 1.",
    },
    {
      code: "robot.lower(30);",
      what: "lowers the inspection head 30 mm toward the fixture.",
      why: "the camera has to be close to see the fixture properly.",
    },
    {
      code: "robot.scan();",
      what: "takes the inspection picture (the purple pulse appears).",
      why: "this is the goal of the mission: scan the first fixture.",
      yours: true,
    },
    {
      code: "robot.raise(30);",
      what: "lifts the head 30 mm back up.",
      why: "always lift before travelling, or the head hits the fixtures.",
    },
    {
      code: "robot.moveTo(4, 2);",
      what: "travels to grid cell column 4, row 2, the next cell.",
      why: "the mission ends at the next cell.",
    },
  ]),
  "05-humanoid-platform": labProgram([
    {
      code: 'robot.walk("station");',
      what: "walks the robot to the OPERATOR station.",
      why: "the robot must get close to the operator first.",
    },
    {
      code: "robot.turn(90);",
      what: "turns the robot 90 degrees on the spot to face the operator.",
      why: "people expect the robot to face them before it signals.",
    },
    {
      code: 'robot.signal("ready");',
      what: "raises an arm and shows a READY message bubble.",
      why: "the operator must know the robot is ready before it moves off.",
      yours: true,
    },
    {
      code: 'robot.walk("panel");',
      what: "walks the robot to the training PANEL.",
      why: "the panel is where the start button is.",
    },
    {
      code: 'robot.press("start");',
      what: "presses the START button on the panel.",
      why: "the last step of the mission.",
    },
  ]),
  "06-collaborative-robot": labProgram([
    {
      code: "robot.limitForce(20);",
      what: "caps the pushing force at 20 newtons.",
      why: "a cobot shares the table with people, so it must be gentle FIRST.",
      yours: true,
    },
    {
      code: 'robot.move("blue_block");',
      what: "moves the gripper over the BLUE block.",
      why: "the gripper has to be at the block before grabbing it.",
    },
    {
      code: 'robot.grip("close");',
      what: "closes the soft gripper around the block.",
      why: "now the block is held and moves with the arm.",
    },
    {
      code: 'robot.move("stack");',
      what: "carries the block over the STACK.",
      why: "the block has to be above the stack to be placed on it.",
    },
    {
      code: 'robot.grip("open");',
      what: "opens the gripper and puts the block down.",
      why: "the block is released on top of the stack.",
    },
    {
      code: 'robot.signal("done");',
      what: "shows a DONE light to the operator.",
      why: "the operator knows the cycle is finished and it is safe to reach in.",
    },
  ]),
  "07-autonomous-mobile-robot": labProgram([
    {
      code: "robot.setSpeed(35);",
      what: "limits the driving speed to 35%.",
      why: "warehouses have people, so the robot drives slowly indoors.",
    },
    {
      code: 'robot.navigate("rack_a");',
      what: "drives to RACK A, where the tote is.",
      why: "the robot must be at the rack before it can pick the tote.",
    },
    {
      code: 'robot.pick("tote");',
      what: "loads the blue tote on top of the robot.",
      why: "now the robot carries the tote.",
    },
    {
      code: 'robot.navigate("checkpoint");',
      what: "drives to the safety CHECKPOINT first.",
      why: "the checkpoint keeps the route out of the aisle people walk in.",
      yours: true,
    },
    {
      code: 'robot.navigate("dock");',
      what: "drives to the DOCK on the right.",
      why: "the dock is where the tote must be delivered.",
    },
    {
      code: 'robot.drop("tote");',
      what: "unloads the tote at the dock.",
      why: "the last step: the delivery is finished.",
    },
  ]),
};

export const industrialRobotLabs: Record<string, RobotLabConfig> = {
  "01-six-axis-articulated-arm": {
    scene: "articulated",
    mission: "Guarded pick-and-place",
    objective: "Pick the orange part, inspect it, and place it in the finished tray.",
    accent: "#ffb000",
    ...programs["01-six-axis-articulated-arm"],
    hint: 'Add robot.move("place"); before opening the gripper.',
    commands: [
      {
        name: "speed",
        example: "robot.speed(35);",
        description: "Set a reduced simulation speed.",
        arguments: [numberArgument([20, 35, 50])],
      },
      {
        name: "move",
        example: 'robot.move("pick");',
        description: "Move through a named safe waypoint.",
        arguments: [stringArgument(["home", "pick", "inspect", "place"])],
      },
      {
        name: "grip",
        example: 'robot.grip("close");',
        description: "Open or close the simulated gripper.",
        arguments: [stringArgument(["open", "close"])],
      },
    ],
    goals: [
      { label: "Use reduced speed", command: "speed(35)" },
      { label: "Move to the pick pose", command: 'move("pick")' },
      { label: "Close the gripper", command: 'grip("close")' },
      { label: "Pass the inspection pose", command: 'move("inspect")' },
      { label: "Move to the place pose", command: 'move("place")' },
      { label: "Release the part", command: 'grip("open")' },
    ],
    points: {
      home: { x: 210, y: 92, label: "HOME" },
      pick: { x: 92, y: 186, label: "PICK", color: "#ffb000" },
      inspect: { x: 210, y: 126, label: "VISION", color: "#4ecdc4" },
      place: { x: 326, y: 184, label: "PLACE", color: "#7ee081" },
    },
    initial: { x: 210, y: 92 },
  },
  "02-scara-robot": {
    scene: "scara",
    mission: "PCB assembly cycle",
    objective: "Lift a circuit board from the feeder and seat it at the assembly station.",
    accent: "#5ec8ff",
    ...programs["02-scara-robot"],
    hint: 'The final action is robot.grip("open");.',
    commands: [
      {
        name: "speed",
        example: "robot.speed(45);",
        description: "Set the cycle speed.",
        arguments: [numberArgument([30, 45, 60])],
      },
      {
        name: "move",
        example: 'robot.move("pcb");',
        description: "Move in the horizontal SCARA plane.",
        arguments: [stringArgument(["home", "pcb", "assembly"])],
      },
      {
        name: "lower",
        example: "robot.lower(35);",
        description: "Lower the vertical prismatic axis.",
        arguments: [numberArgument([20, 35])],
      },
      {
        name: "raise",
        example: "robot.raise(35);",
        description: "Retract the vertical axis.",
        arguments: [numberArgument([20, 35])],
      },
      {
        name: "grip",
        example: 'robot.grip("close");',
        description: "Control the vacuum gripper.",
        arguments: [stringArgument(["open", "close"])],
      },
    ],
    goals: [
      { label: "Approach the PCB", command: 'move("pcb")' },
      { label: "Lower to pickup height", command: "lower(35)" },
      { label: "Secure the PCB", command: 'grip("close")' },
      { label: "Retract before travel", command: "raise(35)" },
      { label: "Move above assembly", command: 'move("assembly")' },
      { label: "Release the PCB", command: 'grip("open")' },
    ],
    points: {
      home: { x: 196, y: 80, label: "HOME" },
      pcb: { x: 92, y: 155, label: "FEEDER", color: "#ffce47" },
      assembly: { x: 310, y: 155, label: "ASSEMBLY", color: "#7ee081" },
    },
    initial: { x: 196, y: 80 },
  },
  "03-delta-parallel-robot": {
    scene: "delta",
    mission: "High-speed color sort",
    objective: "Track the red part and divert it into the matching bin.",
    accent: "#ff5d73",
    ...programs["03-delta-parallel-robot"],
    hint: 'The red part belongs at robot.move("red_bin");.',
    commands: [
      {
        name: "track",
        example: 'robot.track("red");',
        description: "Lock vision tracking to a color.",
        arguments: [stringArgument(["red", "blue", "yellow"])],
      },
      {
        name: "move",
        example: 'robot.move("red_part");',
        description: "Move the parallel end effector.",
        arguments: [stringArgument(["home", "red_part", "red_bin", "blue_bin"])],
      },
      {
        name: "grip",
        example: 'robot.grip("close");',
        description: "Control the high-speed vacuum cup.",
        arguments: [stringArgument(["open", "close"])],
      },
    ],
    goals: [
      { label: "Track red objects", command: 'track("red")' },
      { label: "Intercept the red part", command: 'move("red_part")' },
      { label: "Pick while tracked", command: 'grip("close")' },
      { label: "Move to the red bin", command: 'move("red_bin")' },
      { label: "Release the sorted part", command: 'grip("open")' },
    ],
    points: {
      home: { x: 200, y: 100, label: "HOME" },
      red_part: { x: 172, y: 188, label: "RED PART", color: "#ff5d73" },
      red_bin: { x: 322, y: 180, label: "RED BIN", color: "#ff5d73" },
      blue_bin: { x: 72, y: 180, label: "BLUE BIN", color: "#5ec8ff" },
    },
    initial: { x: 200, y: 100 },
  },
  "04-cartesian-gantry": {
    scene: "cartesian",
    mission: "Gantry inspection grid",
    objective: "Home all axes, scan the first fixture, then travel to the next cell.",
    accent: "#a98bff",
    ...programs["04-cartesian-gantry"],
    hint: "Call robot.scan(); while the tool is lowered over grid cell 2, 1.",
    commands: [
      {
        name: "home",
        example: "robot.home();",
        description: "Reference all linear axes.",
        arguments: [],
      },
      {
        name: "moveTo",
        example: "robot.moveTo(2, 1);",
        description: "Move to an X/Y grid cell.",
        arguments: [numberArgument([1, 2, 3, 4, 5]), numberArgument([1, 2, 3])],
      },
      {
        name: "lower",
        example: "robot.lower(30);",
        description: "Lower the Z carriage in millimetres.",
        arguments: [numberArgument([20, 30])],
      },
      {
        name: "raise",
        example: "robot.raise(30);",
        description: "Raise the Z carriage in millimetres.",
        arguments: [numberArgument([20, 30])],
      },
      {
        name: "scan",
        example: "robot.scan();",
        description: "Capture an inspection image.",
        arguments: [],
      },
    ],
    goals: [
      { label: "Reference the gantry", command: "home()" },
      { label: "Move to grid cell 2, 1", command: "moveTo(2,1)" },
      { label: "Lower the inspection head", command: "lower(30)" },
      { label: "Scan the fixture", command: "scan()" },
      { label: "Raise before travel", command: "raise(30)" },
      { label: "Move to grid cell 4, 2", command: "moveTo(4,2)" },
    ],
    points: {
      home: { x: 70, y: 72, label: "HOME" },
    },
    initial: { x: 70, y: 72 },
  },
  "05-humanoid-platform": {
    scene: "humanoid",
    mission: "Operator assistance route",
    objective: "Walk to the station, acknowledge the operator, then start the training panel.",
    accent: "#ff8a5b",
    ...programs["05-humanoid-platform"],
    hint: 'Use robot.signal("ready"); before leaving the operator station.',
    commands: [
      {
        name: "walk",
        example: 'robot.walk("station");',
        description: "Walk to a mapped location.",
        arguments: [stringArgument(["home", "station", "panel"])],
      },
      {
        name: "turn",
        example: "robot.turn(90);",
        description: "Turn in place by degrees.",
        arguments: [numberArgument([-90, 90, 180])],
      },
      {
        name: "signal",
        example: 'robot.signal("ready");',
        description: "Show a clear operator signal.",
        arguments: [stringArgument(["ready", "waiting", "done"])],
      },
      {
        name: "press",
        example: 'robot.press("start");',
        description: "Press a named training control.",
        arguments: [stringArgument(["start", "reset"])],
      },
    ],
    goals: [
      { label: "Walk to the station", command: 'walk("station")' },
      { label: "Face the operator", command: "turn(90)" },
      { label: "Signal ready", command: 'signal("ready")' },
      { label: "Walk to the panel", command: 'walk("panel")' },
      { label: "Press start", command: 'press("start")' },
    ],
    points: {
      home: { x: 64, y: 190, label: "HOME" },
      station: { x: 198, y: 170, label: "OPERATOR", color: "#ffce47" },
      panel: { x: 330, y: 118, label: "PANEL", color: "#7ee081" },
    },
    initial: { x: 64, y: 190 },
  },
  "06-collaborative-robot": {
    scene: "cobot",
    mission: "Force-limited block stack",
    objective: "Set the force limit before entering the shared workspace and stack the blue block.",
    accent: "#4ecdc4",
    ...programs["06-collaborative-robot"],
    hint: "The first command must be robot.limitForce(20);.",
    commands: [
      {
        name: "limitForce",
        example: "robot.limitForce(20);",
        description: "Set the simulated contact-force ceiling.",
        arguments: [numberArgument([10, 20, 30])],
      },
      {
        name: "move",
        example: 'robot.move("blue_block");',
        description: "Move through the shared workbench.",
        arguments: [stringArgument(["home", "blue_block", "stack"])],
      },
      {
        name: "grip",
        example: 'robot.grip("close");',
        description: "Control the compliant gripper.",
        arguments: [stringArgument(["open", "close"])],
      },
      {
        name: "signal",
        example: 'robot.signal("done");',
        description: "Signal cycle state to the operator.",
        arguments: [stringArgument(["ready", "done"])],
      },
    ],
    goals: [
      { label: "Set a 20 N force limit", command: "limitForce(20)" },
      { label: "Approach the blue block", command: 'move("blue_block")' },
      { label: "Grip the block", command: 'grip("close")' },
      { label: "Move to the stack", command: 'move("stack")' },
      { label: "Release the block", command: 'grip("open")' },
      { label: "Signal completion", command: 'signal("done")' },
    ],
    points: {
      home: { x: 205, y: 92, label: "HOME" },
      blue_block: { x: 96, y: 186, label: "BLUE", color: "#5ec8ff" },
      stack: { x: 316, y: 178, label: "STACK", color: "#ffce47" },
    },
    initial: { x: 205, y: 92 },
  },
  "07-autonomous-mobile-robot": {
    scene: "amr",
    mission: "Warehouse tote delivery",
    objective: "Collect a tote at rack A, pass the safety checkpoint, and deliver it to the dock.",
    accent: "#7ee081",
    ...programs["07-autonomous-mobile-robot"],
    hint: 'Navigate to "checkpoint" before navigating to "dock".',
    commands: [
      {
        name: "setSpeed",
        example: "robot.setSpeed(35);",
        description: "Set the indoor speed percentage.",
        arguments: [numberArgument([20, 35, 50])],
      },
      {
        name: "navigate",
        example: 'robot.navigate("rack_a");',
        description: "Plan and follow a route to a waypoint.",
        arguments: [stringArgument(["home", "rack_a", "checkpoint", "dock"])],
      },
      {
        name: "pick",
        example: 'robot.pick("tote");',
        description: "Collect a tote from the rack.",
        arguments: [stringArgument(["tote"])],
      },
      {
        name: "drop",
        example: 'robot.drop("tote");',
        description: "Release the tote at the dock.",
        arguments: [stringArgument(["tote"])],
      },
    ],
    goals: [
      { label: "Limit indoor speed", command: "setSpeed(35)" },
      { label: "Navigate to rack A", command: 'navigate("rack_a")' },
      { label: "Collect the tote", command: 'pick("tote")' },
      { label: "Pass the checkpoint", command: 'navigate("checkpoint")' },
      { label: "Navigate to the dock", command: 'navigate("dock")' },
      { label: "Deliver the tote", command: 'drop("tote")' },
    ],
    points: {
      home: { x: 66, y: 206, label: "CHARGE" },
      rack_a: { x: 92, y: 80, label: "RACK A", color: "#ffce47" },
      checkpoint: { x: 220, y: 144, label: "CHECK", color: "#5ec8ff" },
      dock: { x: 334, y: 70, label: "DOCK", color: "#7ee081" },
    },
    initial: { x: 66, y: 206 },
  },
};
