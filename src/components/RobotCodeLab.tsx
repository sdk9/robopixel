import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleAlert, Gauge, Lightbulb, Play, RotateCcw, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  compileRobotProgram,
  getRobotGoalProgress,
  type CompiledRobotCommand,
  type RobotLabConfig,
  type RobotLabPoint,
} from "@/lib/robot-lab";

type RunStatus = "idle" | "running" | "success" | "failed";

type SimulationState = {
  x: number;
  y: number;
  gripperClosed: boolean;
  carrying: boolean;
  heading: number;
  verticalOffset: number;
  action: string;
};

function createInitialState(config: RobotLabConfig): SimulationState {
  return {
    ...config.initial,
    gripperClosed: false,
    carrying: false,
    heading: 0,
    verticalOffset: 0,
    action: "Controller ready",
  };
}

function commandDescription(command: CompiledRobotCommand) {
  return `${command.sourceLine.toString().padStart(2, "0")}  ${command.source}`;
}

function executeCommand(
  state: SimulationState,
  command: CompiledRobotCommand,
  config: RobotLabConfig,
): SimulationState {
  const next = { ...state, action: command.source };
  const first = command.arguments[0];

  if (["move", "navigate", "walk"].includes(command.name) && typeof first === "string") {
    const point = config.points[first];
    if (point) {
      next.x = point.x;
      next.y = point.y;
      next.verticalOffset = 0;
    }
  }
  if (command.name === "moveTo") {
    const gridX = Number(command.arguments[0]);
    const gridY = Number(command.arguments[1]);
    next.x = 54 + gridX * 61;
    next.y = 198 - gridY * 42;
  }
  if (command.name === "home") {
    next.x = config.initial.x;
    next.y = config.initial.y;
    next.verticalOffset = 0;
  }
  if (command.name === "lower" && typeof first === "number") {
    next.verticalOffset = Math.min(38, first);
  }
  if (command.name === "raise") next.verticalOffset = 0;
  if (command.name === "grip") {
    next.gripperClosed = first === "close";
    next.carrying = first === "close";
  }
  if (command.name === "pick") {
    next.gripperClosed = true;
    next.carrying = true;
  }
  if (command.name === "drop") {
    next.gripperClosed = false;
    next.carrying = false;
  }
  if (command.name === "turn" && typeof first === "number") next.heading += first;
  return next;
}

function StatusLight({ active, color }: { active: boolean; color: string }) {
  return (
    <span
      className="inline-block size-2 border border-black/30"
      style={{ backgroundColor: active ? color : "#52606b" }}
      aria-hidden="true"
    />
  );
}

function Waypoint({ point, active }: { point: RobotLabPoint; active: boolean }) {
  return (
    <g transform={`translate(${point.x} ${point.y})`}>
      <rect
        x="-8"
        y="-8"
        width="16"
        height="16"
        fill={active ? (point.color ?? "#ffce47") : "#263746"}
        stroke={active ? "#fff5c2" : "#657887"}
        strokeWidth="2"
        transform="rotate(45)"
      />
      <text x="0" y="-17" textAnchor="middle" className="robot-lab-map-label">
        {point.label}
      </text>
    </g>
  );
}

// Sprites and scene backgrounds are drawn in Aseprite (art/build-robots.lua) and exported to
// /images/robots. One art pixel is one scene unit.
type SceneMotion = { tick: number; moving: boolean };

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** A steady animation clock; stays on frame 0 for visitors who ask for reduced motion. */
function useTick(interval = 120) {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) {
      setTick(0);
      return;
    }
    const timer = window.setInterval(() => setTick((value) => value + 1), interval);
    return () => window.clearInterval(timer);
  }, [interval, reduced]);
  return tick;
}

type Pose = { x: number; y: number; v: number };

/** Moves the robot toward its target in a handful of pixel-art steps and reports when it is travelling. */
function useSmoothPose(target: Pose) {
  const reduced = usePrefersReducedMotion();
  const [pose, setPose] = useState<Pose>(target);
  const current = useRef<Pose>(target);
  const { x: targetX, y: targetY, v: targetV } = target;
  useEffect(() => {
    const start = current.current;
    const destination = { x: targetX, y: targetY, v: targetV };
    if (
      reduced ||
      (start.x === destination.x && start.y === destination.y && start.v === destination.v)
    ) {
      current.current = destination;
      setPose(destination);
      return;
    }
    const steps = 8;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const t = step / steps;
      const next = {
        x: start.x + (destination.x - start.x) * t,
        y: start.y + (destination.y - start.y) * t,
        v: start.v + (destination.v - start.v) * t,
      };
      current.current = next;
      setPose(next);
      if (step >= steps) window.clearInterval(timer);
    }, 78);
    return () => window.clearInterval(timer);
  }, [reduced, targetX, targetY, targetV]);
  const moving = pose.x !== targetX || pose.y !== targetY || pose.v !== targetV;
  return { pose, moving };
}

/** Steps the gripper through its half-closed frame instead of snapping open or shut. */
function useGripperFrame(closed: boolean) {
  const [frame, setFrame] = useState(closed ? 2 : 0);
  useEffect(() => {
    const target = closed ? 2 : 0;
    if (frame === target) return;
    const timer = window.setTimeout(() => setFrame(frame + Math.sign(target - frame)), 90);
    return () => window.clearTimeout(timer);
  }, [closed, frame]);
  return frame;
}

function Sprite({
  sheet,
  width,
  height,
  frames,
  frame = 0,
  x = 0,
  y = 0,
}: {
  sheet: string;
  width: number;
  height: number;
  frames: number;
  frame?: number;
  x?: number;
  y?: number;
}) {
  const current = ((frame % frames) + frames) % frames;
  return (
    <svg
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox={`${current * width} 0 ${width} ${height}`}
      overflow="hidden"
      aria-hidden="true"
    >
      <image
        href={`/images/robots/${sheet}.png`}
        width={width * frames}
        height={height}
        style={{ imageRendering: "pixelated" }}
      />
    </svg>
  );
}

type Point2 = readonly [number, number];

/** A shaded arm link drawn between two joints, with a cable along its back and a coloured end band. */
function Tube({
  from,
  to,
  width,
  body,
  hi,
  shade,
  band,
}: {
  from: Point2;
  to: Point2;
  width: number;
  body: string;
  hi: string;
  shade: string;
  band: string;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const shifted = (k: number) => ({
    x1: x1 + nx * k,
    y1: y1 + ny * k,
    x2: x2 + nx * k,
    y2: y2 + ny * k,
  });
  const bandFrom = { x: x1 + dx * 0.68, y: y1 + dy * 0.68 };
  const cable = `M ${x1 + nx * -6} ${y1 + ny * -6} Q ${(x1 + x2) / 2 + nx * -width} ${(y1 + y2) / 2 + ny * -width} ${x2 + nx * -6} ${y2 + ny * -6}`;
  return (
    <g>
      <path d={cable} fill="none" stroke="#1a1f2b" strokeWidth="4" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1f2b" strokeWidth={width + 4} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={body} strokeWidth={width} />
      <line {...shifted(-width * 0.26)} stroke={hi} strokeWidth={width * 0.24} />
      <line {...shifted(width * 0.3)} stroke={shade} strokeWidth={width * 0.24} />
      <line
        x1={bandFrom.x}
        y1={bandFrom.y}
        x2={x2}
        y2={y2}
        stroke="#1a1f2b"
        strokeWidth={width + 4}
      />
      <line x1={bandFrom.x} y1={bandFrom.y} x2={x2} y2={y2} stroke={band} strokeWidth={width} />
      <line
        x1={bandFrom.x - nx * 0}
        y1={bandFrom.y}
        x2={x2}
        y2={y2}
        stroke="#ffffff"
        strokeOpacity="0.28"
        strokeWidth={width * 0.22}
        transform={`translate(${nx * -width * 0.26} ${ny * -width * 0.26})`}
      />
    </g>
  );
}

function ArmRobot({
  state,
  tick,
  cobot = false,
}: { state: SimulationState; cobot?: boolean } & SceneMotion) {
  const baseX = 205;
  const baseY = 218;
  const toolX = state.x;
  const toolY = state.y + state.verticalOffset;
  const elbowX = baseX + (toolX - baseX) * 0.42;
  const elbowY = Math.min(baseY - 56, toolY - 35);
  const gripFrame = useGripperFrame(state.gripperClosed);
  const colors = cobot
    ? { body: "#f1ede4", hi: "#ffffff", shade: "#c7c2b6", band: "#3f7fc4" }
    : { body: "#ebe0c9", hi: "#faf3e2", shade: "#c4b394", band: "#e8743c" };
  return (
    <g>
      <Sprite
        sheet={cobot ? "cobot-base" : "arm-base"}
        width={56}
        height={34}
        frames={4}
        frame={tick >> 2}
        x={177}
        y={196}
      />
      <Tube from={[baseX, baseY - 12]} to={[elbowX, elbowY]} width={16} {...colors} />
      <Tube from={[elbowX, elbowY]} to={[toolX, toolY]} width={13} {...colors} />
      <Sprite
        sheet="joint"
        width={24}
        height={24}
        frames={4}
        frame={tick >> 1}
        x={baseX - 12}
        y={baseY - 24}
      />
      <Sprite
        sheet="joint"
        width={24}
        height={24}
        frames={4}
        frame={tick >> 1}
        x={elbowX - 12}
        y={elbowY - 12}
      />
      <g transform={`translate(${toolX} ${toolY})`}>
        {state.carrying && (
          <Sprite sheet="metal-block" width={22} height={18} frames={1} x={-11} y={16} />
        )}
        <Sprite
          sheet={cobot ? "cobot-gripper" : "arm-gripper"}
          width={32}
          height={34}
          frames={3}
          frame={gripFrame}
          x={-16}
          y={-8}
        />
      </g>
    </g>
  );
}

function ScaraRobot({ state, tick }: { state: SimulationState } & SceneMotion) {
  const toolY = state.y + state.verticalOffset;
  const colors = { body: "#ebe0c9", hi: "#faf3e2", shade: "#c4b394", band: "#2f4868" };
  return (
    <g>
      <Sprite
        sheet="scara-head"
        width={36}
        height={44}
        frames={4}
        frame={tick >> 2}
        x={182}
        y={24}
      />
      <Tube from={[200, 62]} to={[238, 92]} width={16} {...colors} />
      <Tube from={[238, 92]} to={[state.x, state.y]} width={13} {...colors} />
      <Sprite sheet="joint" width={24} height={24} frames={4} frame={tick >> 1} x={188} y={50} />
      <Sprite sheet="joint" width={24} height={24} frames={4} frame={tick >> 1} x={226} y={80} />
      <g transform={`translate(${state.x} ${toolY})`}>
        {state.carrying && (
          <Sprite sheet="plate" width={28} height={10} frames={1} x={-14} y={22} />
        )}
        <Sprite
          sheet="scara-tool"
          width={24}
          height={36}
          frames={4}
          frame={(state.carrying ? 2 : 0) + (tick % 2)}
          x={-12}
          y={-14}
        />
      </g>
    </g>
  );
}

function DeltaRobot({ state, tick }: { state: SimulationState } & SceneMotion) {
  const y = state.y + state.verticalOffset;
  const rods = [
    { from: 117, to: state.x - 16 },
    { from: 201, to: state.x },
    { from: 285, to: state.x + 16 },
  ];
  return (
    <g>
      {rods.map((rod) =>
        [-3, 3].map((offset) => (
          <g key={`${rod.from}${offset}`}>
            <line
              x1={rod.from + offset}
              y1="58"
              x2={rod.to + offset}
              y2={y - 3}
              stroke="#1a1f2b"
              strokeWidth="5"
            />
            <line
              x1={rod.from + offset}
              y1="58"
              x2={rod.to + offset}
              y2={y - 3}
              stroke="#4d5866"
              strokeWidth="3"
            />
            <line
              x1={rod.from + offset - 1}
              y1="58"
              x2={rod.to + offset - 1}
              y2={y - 3}
              stroke="#a2aebb"
              strokeWidth="1"
            />
          </g>
        )),
      )}
      <Sprite
        sheet="delta-frame"
        width={216}
        height={34}
        frames={4}
        frame={tick >> 1}
        x={92}
        y={26}
      />
      <g transform={`translate(${state.x} ${y})`}>
        {state.carrying && (
          <Sprite sheet="cube-red" width={20} height={18} frames={1} x={-10} y={8} />
        )}
        <Sprite
          sheet="delta-platform"
          width={44}
          height={32}
          frames={4}
          frame={(state.carrying ? 2 : 0) + (tick % 2)}
          x={-22}
          y={-8}
        />
      </g>
    </g>
  );
}

function CartesianRobot({ state, tick, moving }: { state: SimulationState } & SceneMotion) {
  const y = state.y + state.verticalOffset;
  const scanning = state.action.includes("scan");
  return (
    <g>
      {[38, 350].map((x) => (
        <g key={x}>
          <rect x={x} y="52" width="12" height="176" fill="#1a1f2b" />
          <rect x={x + 1} y="52" width="10" height="176" fill="#ebe0c9" />
          <rect x={x + 1} y="52" width="3" height="176" fill="#faf3e2" />
          <rect x={x + 8} y="52" width="3" height="176" fill="#c4b394" />
          <rect x={x - 4} y="222" width="20" height="8" fill="#1a1f2b" />
          <rect x={x - 3} y="223" width="18" height="6" fill="#48525f" />
        </g>
      ))}
      <Sprite
        sheet="gantry-rail"
        width={336}
        height={16}
        frames={4}
        frame={moving ? tick : 0}
        x={32}
        y={38}
      />
      <g transform={`translate(${state.x} 0)`}>
        <rect x="-7" y="58" width="14" height={Math.max(24, y - 56)} fill="#1a1f2b" />
        <rect x="-6" y="58" width="12" height={Math.max(24, y - 56)} fill="#ebe0c9" />
        <rect x="-6" y="58" width="3" height={Math.max(24, y - 56)} fill="#faf3e2" />
        <rect x="3" y="58" width="3" height={Math.max(24, y - 56)} fill="#c4b394" />
        <Sprite
          sheet="gantry-carriage"
          width={36}
          height={30}
          frames={4}
          frame={tick >> 2}
          x={-18}
          y={34}
        />
        <Sprite
          sheet="gantry-tool"
          width={28}
          height={30}
          frames={4}
          frame={scanning ? tick : 0}
          x={-14}
          y={y - 4}
        />
      </g>
      {scanning && (
        <Sprite
          sheet="scan-pulse"
          width={64}
          height={64}
          frames={5}
          frame={tick}
          x={state.x - 32}
          y={y - 16}
        />
      )}
    </g>
  );
}

function HumanoidRobot({ state, tick, moving }: { state: SimulationState } & SceneMotion) {
  const signalling = state.action.includes("signal");
  const sheet = signalling ? "humanoid-signal" : moving ? "humanoid-walk" : "humanoid-idle";
  const frames = moving && !signalling ? 6 : 4;
  return (
    <g transform={`translate(${state.x} ${state.y}) rotate(${state.heading})`}>
      <Sprite
        sheet={sheet}
        width={96}
        height={96}
        frames={frames}
        frame={moving && !signalling ? tick : tick >> 2}
        x={-32}
        y={-54}
      />
    </g>
  );
}

/** Direction of travel in degrees (0 = facing right), so a top-down robot turns toward where it drives. */
function useHeading(x: number, y: number) {
  const previous = useRef({ x, y });
  const [heading, setHeading] = useState(0);
  useEffect(() => {
    const dx = x - previous.current.x;
    const dy = y - previous.current.y;
    if (Math.hypot(dx, dy) > 0.5) setHeading((Math.atan2(dy, dx) * 180) / Math.PI);
    previous.current = { x, y };
  }, [x, y]);
  return heading;
}

function AmrRobot({ state, tick, moving }: { state: SimulationState } & SceneMotion) {
  const heading = useHeading(state.x, state.y);
  return (
    <g transform={`translate(${state.x} ${state.y}) rotate(${heading})`}>
      <Sprite
        sheet="amr-top"
        width={72}
        height={48}
        frames={4}
        frame={moving ? tick : 0}
        x={-36}
        y={-24}
      />
      {state.carrying && (
        <Sprite sheet="amr-tote-top" width={40} height={28} frames={1} x={-30} y={-14} />
      )}
      <Sprite
        sheet="amr-lidar-top"
        width={16}
        height={16}
        frames={4}
        frame={tick >> 1}
        x={6}
        y={-8}
      />
    </g>
  );
}

function PixelScene({
  config,
  state,
  running,
}: {
  config: RobotLabConfig;
  state: SimulationState;
  running: boolean;
}) {
  const currentPoint = Object.values(config.points).find(
    (point) => Math.abs(point.x - state.x) < 2 && Math.abs(point.y - state.y) < 2,
  );
  const tick = useTick();
  const { pose, moving } = useSmoothPose({ x: state.x, y: state.y, v: state.verticalOffset });
  const view = { ...state, x: pose.x, y: pose.y, verticalOffset: pose.v };
  const motion = { tick, moving };

  return (
    <div className="robot-lab-stage relative overflow-hidden border-b-4 border-[#101820] bg-[#16232d] lg:border-b-0">
      <svg
        viewBox="0 0 400 260"
        role="img"
        aria-label={`${config.mission} animated robot simulation`}
        className="block h-full min-h-[300px] w-full"
        shapeRendering="crispEdges"
      >
        <image
          href={`/images/robots/bg-${config.scene}.png`}
          width="400"
          height="260"
          style={{ imageRendering: "pixelated" }}
        />

        {(config.scene === "scara" || config.scene === "delta") && (
          <Sprite
            sheet="belt"
            width={330}
            height={36}
            frames={4}
            frame={running ? tick : 0}
            x={35}
            y={config.scene === "scara" ? 172 : 168}
          />
        )}
        {config.scene === "cartesian" && (
          <g fill="none" stroke="#727f8e" strokeWidth="1" strokeDasharray="4 4" opacity="0.7">
            {Array.from({ length: 5 }, (_, index) => (
              <line
                key={`v-${index}`}
                x1={115 + index * 61}
                y1="72"
                x2={115 + index * 61}
                y2="220"
              />
            ))}
            {Array.from({ length: 3 }, (_, index) => (
              <line
                key={`h-${index}`}
                x1="55"
                y1={114 + index * 42}
                x2="360"
                y2={114 + index * 42}
              />
            ))}
          </g>
        )}
        {config.scene === "amr" && (
          <path
            d="M 66 206 L 92 80 L 220 144 L 334 70"
            fill="none"
            stroke="#4a7fc2"
            strokeWidth="6"
            strokeDasharray="6 8"
            opacity="0.8"
          />
        )}

        {Object.entries(config.points).map(([name, point]) => (
          <Waypoint key={name} point={point} active={currentPoint === point} />
        ))}

        {config.scene === "articulated" && <ArmRobot state={view} {...motion} />}
        {config.scene === "scara" && <ScaraRobot state={view} {...motion} />}
        {config.scene === "delta" && <DeltaRobot state={view} {...motion} />}
        {config.scene === "cartesian" && <CartesianRobot state={view} {...motion} />}
        {config.scene === "humanoid" && <HumanoidRobot state={view} {...motion} />}
        {config.scene === "cobot" && <ArmRobot state={view} cobot {...motion} />}
        {config.scene === "amr" && <AmrRobot state={view} {...motion} />}

        <g transform="translate(12 16)">
          <rect width="130" height="27" fill="#101820" opacity="0.92" />
          <circle cx="14" cy="13.5" r="5" fill={running ? "#7ee081" : "#ffce47"} />
          <text x="26" y="18" className="robot-lab-hud-text">
            {running ? "PROGRAM RUNNING" : "SIMULATION READY"}
          </text>
        </g>
      </svg>
      <div className="absolute bottom-3 left-3 right-3 border-2 border-black/60 bg-[#101820]/90 px-3 py-2 font-mono text-[11px] text-[#dff6ff]">
        <span className="mr-2 text-[#7ee081]">STATUS</span>
        {state.action}
      </div>
    </div>
  );
}

/** Finds the empty line under the ">>> YOUR TURN" note, where the learner types the missing command. */
function findYourTurnSpot(text: string) {
  const lines = text.split("\n");
  const marker = lines.findIndex((line) => line.includes(">>> YOUR TURN:"));
  if (marker < 0) return null;
  let index = marker + 1;
  while (index < lines.length && (lines[index] ?? "").trim().startsWith("//")) index += 1;
  let offset = 0;
  for (let position = 0; position < index; position += 1)
    offset += (lines[position] ?? "").length + 1;
  return { line: index + 1, offset, length: (lines[index] ?? "").length };
}

export function RobotCodeLab({ config }: { config: RobotLabConfig }) {
  const [program, setProgram] = useState(config.starterCode);
  const [simulation, setSimulation] = useState(() => createInitialState(config));
  const [runCommands, setRunCommands] = useState<CompiledRobotCommand[]>([]);
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [message, setMessage] = useState("Edit the program, then press Run.");
  const [log, setLog] = useState<string[]>(["> controller connected", "> safety cell: simulated"]);
  const [speed, setSpeed] = useState(1);
  const [hintVisible, setHintVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const executedCommands = useMemo(() => runCommands.slice(0, cursor), [cursor, runCommands]);
  const goalProgress = useMemo(
    () => getRobotGoalProgress(executedCommands, config.goals),
    [config.goals, executedCommands],
  );
  const activeLine = status === "running" ? runCommands[cursor]?.sourceLine : undefined;

  useEffect(() => {
    if (status !== "running") return;
    if (cursor >= runCommands.length) {
      const completed = getRobotGoalProgress(runCommands, config.goals).every(Boolean);
      setStatus(completed ? "success" : "failed");
      setMessage(
        completed
          ? "Mission complete — every objective passed."
          : "Program finished, but one or more mission steps are missing or out of order.",
      );
      setLog((entries) => [...entries, completed ? "> mission complete" : "> mission incomplete"]);
      return;
    }

    const command = runCommands[cursor];
    if (!command) return;
    const timer = window.setTimeout(() => {
      setSimulation((current) => executeCommand(current, command, config));
      setLog((entries) => [...entries.slice(-5), `> ${commandDescription(command)}`]);
      setCursor((current) => current + 1);
    }, 720 / speed);
    return () => window.clearTimeout(timer);
  }, [config, cursor, runCommands, speed, status]);

  function resetScene(nextMessage = "Scene reset. Your code is unchanged.") {
    setStatus("idle");
    setRunCommands([]);
    setCursor(0);
    setSimulation(createInitialState(config));
    setMessage(nextMessage);
    setLog(["> controller connected", "> scene reset"]);
  }

  function runProgram() {
    const result = compileRobotProgram(program, config);
    setSimulation(createInitialState(config));
    setCursor(0);
    setLog(["> compiling program..."]);
    if (!result.ok) {
      setRunCommands([]);
      setStatus("failed");
      setMessage(`Line ${result.line}: ${result.error}`);
      setLog(["> compile stopped", `> line ${result.line}: ${result.error}`]);
      return;
    }
    setRunCommands(result.commands);
    setStatus("running");
    setMessage(
      `Running ${result.commands.length} command${result.commands.length === 1 ? "" : "s"}...`,
    );
  }

  function insertCommand(example: string) {
    const editor = textareaRef.current;
    if (!editor) {
      setProgram((current) => `${current.trimEnd()}\n${example}`);
      return;
    }
    // If the editor has not been clicked yet, put the command on the empty "your turn" line.
    const spot = document.activeElement === editor ? null : findYourTurnSpot(program);
    const start = spot ? spot.offset : editor.selectionStart;
    const end = spot ? spot.offset + spot.length : editor.selectionEnd;
    const prefix = program.slice(0, start);
    const suffix = program.slice(end);
    const needsLineBreak = prefix.length > 0 && !prefix.endsWith("\n");
    const needsTrailingBreak = suffix.length > 0 && !suffix.startsWith("\n");
    const insertion = `${needsLineBreak ? "\n" : ""}${example}${needsTrailingBreak ? "\n" : ""}`;
    setProgram(`${prefix}${insertion}${suffix}`);
    window.requestAnimationFrame(() => {
      const position = start + insertion.length - (needsTrailingBreak ? 1 : 0);
      editor.focus();
      editor.setSelectionRange(position, position);
    });
  }

  function jumpToYourTurn() {
    const editor = textareaRef.current;
    const spot = findYourTurnSpot(program);
    if (!editor || !spot) return;
    editor.focus();
    editor.setSelectionRange(spot.offset, spot.offset + spot.length);
    editor.scrollTop = Math.max(0, (spot.line - 4) * 24);
    setMessage(
      `Your cursor is on line ${spot.line}. Type ${config.missingCommand ?? "the missing command"} there.`,
    );
  }

  const lineCount = Math.max(1, program.split(/\r?\n/).length);
  const yourTurn = findYourTurnSpot(program);

  return (
    <section className="mt-10 overflow-hidden border-4 border-[#101820] bg-[#e8dec7] shadow-[8px_8px_0_#9aaeb8]">
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#101820] bg-[#263746] px-4 py-3 text-white"
        style={{ boxShadow: `inset 7px 0 0 ${config.accent}` }}
      >
        <div>
          <p className="font-pixel text-[10px] tracking-wider text-[#9edff7]">ROBOT CODE LAB</p>
          <h2 className="mt-1 font-pixel text-sm md:text-base">{config.mission}</h2>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-2">
            <StatusLight active={status === "running"} color="#7ee081" /> LIVE SIM
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <StatusLight active={status === "success"} color="#ffce47" /> GOALS
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="flex min-h-[560px] flex-col bg-[#16232d]">
          <PixelScene config={config} state={simulation} running={status === "running"} />
          <div className="grid gap-px bg-[#101820] sm:grid-cols-2">
            <div className="bg-[#20313d] p-4 text-[#dff6ff]">
              <p className="font-pixel text-[10px] text-[#ffce47]">MISSION</p>
              <p className="mt-2 text-sm leading-relaxed">{config.objective}</p>
            </div>
            <div className="bg-[#20313d] p-4 text-[#dff6ff]">
              <p className="font-pixel text-[10px] text-[#7ee081]">OBJECTIVES</p>
              <ul className="mt-2 space-y-1.5 text-xs">
                {config.goals.map((goal, index) => (
                  <li key={goal.command} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 grid size-4 shrink-0 place-items-center border ${goalProgress[index] ? "border-[#7ee081] bg-[#7ee081] text-[#101820]" : "border-[#657887]"}`}
                    >
                      {goalProgress[index] && <Check className="size-3" strokeWidth={4} />}
                    </span>
                    <span className={goalProgress[index] ? "text-white" : "text-[#a8bac5]"}>
                      {goal.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="m-3 flex-1 border-2 border-[#101820] bg-[#fff3c7] px-4 py-4 text-sm leading-relaxed text-[#233440] shadow-[4px_4px_0_#101820]">
            <p className="font-pixel text-[10px] text-[#8a5a00]">HOW TO DO THIS LAB</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5">
              <li>Read the MISSION above. It says what the robot has to do.</li>
              <li>
                Read the code on the right. Every command has a <b>// What</b> and a <b>// Why</b>{" "}
                note under it, so you know what each line does.
              </li>
              <li>
                {yourTurn ? (
                  <>
                    Find the note that says <b>&gt;&gt;&gt; YOUR TURN</b> (line {yourTurn.line}). On
                    the empty line right under it, type{" "}
                    <code className="bg-white px-1 font-mono">
                      {config.missingCommand ?? "the missing command"}
                    </code>
                    . You can also click the same command in the Command Deck under the editor.
                  </>
                ) : (
                  <>Your missing command is in place. Change it and see what the robot does.</>
                )}
              </li>
              <li>
                Press <b>Run program</b> (or Ctrl + Enter). The robot follows the lines one by one,
                top to bottom.
              </li>
              <li>
                Watch the OBJECTIVES above tick off. If one stays empty, a command is missing or in
                the wrong order. Stuck? Press <b>Hint</b>.
              </li>
            </ol>
            {yourTurn && (
              <button
                type="button"
                onClick={jumpToYourTurn}
                disabled={status === "running"}
                className="mt-2 border-2 border-[#101820] bg-[#ffce47] px-3 py-1.5 font-pixel text-[9px] text-[#101820] shadow-[2px_2px_0_#101820] hover:bg-[#ffd76a] disabled:opacity-50"
              >
                Take me to line {yourTurn.line}
              </button>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col bg-[#f4ecd9]">
          <div className="flex items-center justify-between border-b-2 border-[#b7a98d] bg-[#d9cbaa] px-3 py-2">
            <span className="flex items-center gap-2 font-pixel text-[10px] text-[#263746]">
              <Terminal className="size-4" /> PROGRAM.CPP
            </span>
            <span className="font-mono text-[10px] text-[#5b5549]">CTRL + ENTER TO RUN</span>
          </div>

          <div className="grid min-h-[270px] grid-cols-[2.25rem_minmax(0,1fr)] bg-[#fffaf0] font-mono text-[13px] leading-6">
            <div className="select-none border-r border-[#d5c9b2] bg-[#eee4cf] py-3 text-right text-[#897d68]">
              {Array.from({ length: lineCount }, (_, index) => (
                <div
                  key={index}
                  className={`pr-2 ${activeLine === index + 1 ? "bg-[#ffce47] font-bold text-[#101820]" : ""}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={program}
              onChange={(event) => {
                setProgram(event.target.value);
                if (status !== "idle") resetScene("Code changed. Run it to test the new program.");
              }}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  runProgram();
                }
              }}
              aria-label={`${config.mission} code editor`}
              spellCheck={false}
              wrap="off"
              disabled={status === "running"}
              style={{ height: `${Math.max(270, lineCount * 24 + 24)}px` }}
              className="min-h-[270px] w-full resize-y overflow-x-auto whitespace-pre bg-transparent p-3 text-[#233440] outline-none disabled:opacity-80"
            />
          </div>

          <div className="border-t-2 border-[#b7a98d] p-3">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={runProgram}
                disabled={status === "running"}
                className="rounded-none border-2 border-[#101820] bg-[#4b963f] font-pixel text-[10px] shadow-[3px_3px_0_#101820] hover:bg-[#5bac4d]"
              >
                <Play className="size-4 fill-current" /> Run program
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => resetScene()}
                className="rounded-none border-2 border-[#101820] bg-[#fffaf0] font-pixel text-[10px] shadow-[3px_3px_0_#101820]"
              >
                <RotateCcw className="size-4" /> Reset
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setHintVisible((visible) => !visible)}
                className="rounded-none font-pixel text-[10px]"
              >
                <Lightbulb className="size-4" /> Hint
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Gauge className="size-4 text-[#536979]" />
              <label
                htmlFor={`lab-speed-${config.scene}`}
                className="font-pixel text-[9px] text-[#536979]"
              >
                RUN SPEED
              </label>
              <input
                id={`lab-speed-${config.scene}`}
                type="range"
                min="0.5"
                max="2"
                step="0.5"
                value={speed}
                onChange={(event) => setSpeed(Number(event.target.value))}
                className="h-2 flex-1 accent-[#4b963f]"
              />
              <span className="w-8 font-mono text-xs">{speed}×</span>
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`mt-3 flex min-h-10 items-start gap-2 border-2 px-3 py-2 text-xs leading-relaxed ${status === "success" ? "border-[#4b963f] bg-[#dff2d6]" : status === "failed" ? "border-[#b64b4b] bg-[#f6d7cf]" : "border-[#b7a98d] bg-[#fffaf0]"}`}
            >
              {status === "success" ? (
                <Check className="mt-0.5 size-4 shrink-0" />
              ) : status === "failed" ? (
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
              ) : (
                <Terminal className="mt-0.5 size-4 shrink-0" />
              )}
              {message}
            </div>

            {hintVisible && (
              <div className="mt-3 border-l-4 border-[#ffb000] bg-[#fff3c7] px-3 py-2 text-xs leading-relaxed">
                <strong>Hint:</strong> {config.hint}
                <button
                  type="button"
                  onClick={() => {
                    setProgram(config.solutionCode);
                    resetScene("Guided example loaded. Press Run to watch it execute.");
                  }}
                  className="ml-2 underline underline-offset-2"
                >
                  Load guided example
                </button>
              </div>
            )}
          </div>

          <div className="border-t-2 border-[#b7a98d] bg-[#e8dec7] p-3">
            <p className="font-pixel text-[9px] text-[#536979]">COMMAND DECK · CLICK TO INSERT</p>
            <ul className="mt-2 space-y-1.5">
              {config.commands.map((command) => (
                <li key={command.name} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => insertCommand(command.example)}
                    disabled={status === "running"}
                    className="border border-[#897d68] bg-[#fffaf0] px-2 py-1 font-mono text-[10px] text-[#263746] hover:border-[#263746] hover:bg-white disabled:opacity-50"
                  >
                    {command.example}
                  </button>
                  <span className="text-[11px] text-[#5b5549]">{command.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto border-t-2 border-[#101820] bg-[#101820] px-3 py-2 font-mono text-[10px] leading-5 text-[#9edff7]">
            {log.map((entry, index) => (
              <div key={`${entry}-${index}`}>{entry}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
