import { hash, cpp, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 01 · Section B — Motion & Control (lessons 11–20)
export const module01b: LessonSpec[] = [
  lesson({
    title: "PTP vs LIN vs CIRC motions",
    summary:
      "Choose between joint-space, straight-line and circular-arc moves and command each with MoveIt's Pilz planner.",
    goals: [
      "Explain what PTP, LIN and CIRC motions do to the tool path",
      "Pick the right motion type for free travel, approach and welding",
      "Command a PTP move and a LIN move through the Pilz industrial planner",
    ],
    concept: [
      "PTP (point-to-point) moves every joint together in joint space: it is the fastest and safest way to travel between two poses, but the tool path is a curve you do not control. LIN keeps the tool on a straight line, and CIRC follows a circular arc through a middle point. LIN and CIRC control the tool path, so they are used for approaches, gluing and welding.",
      "Straight-line moves can fail where PTP succeeds, because the line may cross a singularity or leave the reach. A typical program therefore uses PTP for travel, LIN for the last centimetres of an approach and retreat, and CIRC for curved seams. MoveIt provides these three motion types through the Pilz industrial motion planner.",
    ],
    steps: [
      "Open the Robot Code Lab below and read the mission and the notes under every command.",
      "Type the missing command on the marked empty line, then press Run program and watch the arm.",
      "In a MoveIt simulation, plan the same start and goal once with PTP and once with LIN and compare the tool paths.",
      "Write down when you would choose each motion type in a real cell.",
    ],
    example: cpp(
      [
        'moveit::planning_interface::MoveGroupInterface arm(node, "manipulator");',
        "connect to the planning group that holds the six arm joints.",
      ],
      [
        'arm.setPlanningPipelineId("pilz_industrial_motion_planner");',
        "use the Pilz pipeline, which offers PTP, LIN and CIRC.",
      ],
      [
        "arm.setMaxVelocityScalingFactor(0.2);",
        "run at 20 % of the maximum joint speed while testing; safe and easy to watch.",
      ],
      ["arm.setMaxAccelerationScalingFactor(0.2);", "limit acceleration for the same reason."],
      ["", ""],
      ['arm.setPlannerId("PTP");', "joint-space move: fastest travel, curved tool path."],
      ['arm.setNamedTarget("ready");', "the goal is a named pose stored in the SRDF."],
      [
        "moveit::planning_interface::MoveGroupInterface::Plan travel;",
        "a container for the planned trajectory.",
      ],
      [
        "if (arm.plan(travel) == moveit::core::MoveItErrorCode::SUCCESS) arm.execute(travel);",
        "execute only if planning succeeded, so a failed plan never moves the robot.",
      ],
      ["", ""],
      ['arm.setPlannerId("LIN");', "straight-line move in Cartesian space."],
      [
        "arm.setPoseTarget(approach_pose);",
        "the goal is a tool pose 10 cm above the part (approach_pose is defined elsewhere).",
      ],
      [
        "moveit::planning_interface::MoveGroupInterface::Plan approach;",
        "another trajectory container.",
      ],
      [
        "if (arm.plan(approach) == moveit::core::MoveItErrorCode::SUCCESS) arm.execute(approach);",
        "the tool goes straight down; if a singularity is in the way, planning fails safely.",
      ],
    ),
    walk: [
      "Only the planner ID changes between the two moves, so the rest of the program stays readable.",
      "Scaling factors of 0.2 keep test motions slow enough to stop by hand if something looks wrong.",
      "Each move is planned first and executed only on success; a failed LIN move never becomes an uncontrolled motion.",
    ],
    expect: [
      "The PTP move reaches the named pose; the tool path is curved in the visualiser.",
      "The LIN move keeps the tool on a straight line, or fails with a clear planning error near a singularity.",
    ],
    fix: [
      [
        "LIN planning fails but PTP works.",
        "The straight line probably crosses a singularity, a joint limit or leaves the reach. Move the goal, use PTP to a better pose first, or split the move.",
      ],
      [
        "Planner ID 'LIN' is not found.",
        "The Pilz pipeline is not loaded. Check that pilz_industrial_motion_planner is in the planning pipelines of your MoveIt configuration.",
      ],
    ],
    exercise:
      "Plan a pick sequence: PTP to a pose above the part, LIN down 10 cm, close the gripper, LIN back up, PTP to the place pose. Run it 10 times at 20 % speed and log every planning result.",
    checklist: [
      "PTP is used for travel and LIN for approaches",
      "Every plan is checked before execute",
      "Speed and acceleration are scaled down while testing",
    ],
    lab: "01-six-axis-articulated-arm",
  }),
  lesson({
    title: "Trajectory interpolation",
    summary: "Blend between waypoints with polynomial paths that start and stop smoothly.",
    goals: [
      "Explain why straight linear interpolation gives jerky motion",
      "Build a quintic polynomial with zero start and end velocity and acceleration",
      "Sample the path at the controller rate",
    ],
    concept: [
      "A trajectory is a path with time attached: position, velocity and acceleration for every instant. Linear interpolation between two poses has a constant speed, which means an infinite acceleration at the ends. That excites vibration and wears gearboxes.",
      "A quintic (fifth-order) polynomial s(τ) = 10τ³ − 15τ⁴ + 6τ⁵ goes from 0 to 1 as τ goes from 0 to 1, with zero velocity and zero acceleration at both ends. Multiplying by the joint distance gives a smooth move. Real controllers sample it at a fixed rate, often 1 kHz.",
    ],
    steps: [
      "Choose a start and end angle for one joint and a duration of 2 seconds.",
      "Compute the quintic blend factor for τ = t / duration.",
      "Sample the trajectory at 100 Hz and print the first and last few values.",
      "Confirm numerically that velocity is near zero at both ends.",
    ],
    example: hash(
      [
        "def quintic(q0, q1, duration, hz=100):",
        "positions of one joint moving from q0 to q1 with smooth start and stop.",
      ],
      ["    n = int(duration * hz)", "number of samples to produce."],
      ["    points = []", "the list that will hold the trajectory."],
      ["    for k in range(n + 1):", "one sample per control tick, including the final one."],
      ["        tau = k / n", "normalised time from 0 to 1."],
      [
        "        s = 10*tau**3 - 15*tau**4 + 6*tau**5",
        "quintic blend: 0 at the start, 1 at the end, zero velocity and acceleration at both.",
      ],
      ["        points.append(q0 + (q1 - q0) * s)", "scale the blend to the actual distance."],
      ["    return points", "hand the samples to the controller."],
      ["", ""],
      ["path = quintic(0.0, 1.2, duration=2.0)", "move one joint by 1.2 rad in 2 seconds."],
      [
        "print(path[:3], path[-3:])",
        "values start and end very slowly, which proves the smooth start and stop.",
      ],
    ),
    walk: [
      "The polynomial coefficients are fixed, so any distance and duration reuse the same shape.",
      "Because s starts and ends with zero slope, the joint speed is zero at both ends of the move.",
      "Sampling at a fixed rate matches how a real controller consumes a trajectory.",
    ],
    expect: [
      "The first samples change by tiny amounts, then the steps grow and shrink again toward the end.",
      "The last sample equals 1.2 exactly.",
    ],
    fix: [
      [
        "The joint jerks at the start.",
        "You used linear interpolation or a cubic without acceleration constraints. Use a quintic or a jerk-limited profile.",
      ],
      [
        "The move takes longer than expected.",
        "The duration is in seconds and the rate in hertz; check both when converting to sample counts.",
      ],
    ],
    exercise:
      "Interpolate all six joints at once with the same duration and check that they all arrive together. Then compute the peak velocity for each joint from the samples.",
    checklist: [
      "Start and end velocity are zero",
      "Sampling rate matches the controller",
      "All joints share the same duration",
    ],
  }),
  lesson({
    title: "Velocity & acceleration profiles",
    summary:
      "Compute trapezoidal and triangular speed profiles and see how limits set the move time.",
    goals: [
      "Explain the trapezoidal velocity profile and when it becomes a triangle",
      "Compute the acceleration, cruise and deceleration times for a move",
      "Find which limit dominates the move time",
    ],
    concept: [
      "A trapezoidal profile accelerates at a constant rate a to a cruise speed v, holds it, then decelerates at the same rate. If the move is too short to reach v, the speed graph is a triangle instead. The move time follows directly from distance, maximum speed and maximum acceleration.",
      "The limits come from motors, gearboxes and the payload, not from wishes. Because the slowest joint sets the time, synchronised multi-joint moves scale every joint to that time. Knowing the profile lets you predict cycle times before the robot moves.",
    ],
    steps: [
      "Take a 2.0 rad move with vmax = 2 rad/s and amax = 4 rad/s².",
      "Compute the distance covered during acceleration and deceleration.",
      "Decide between a trapezoid and a triangle and calculate the total time.",
      "Repeat with a 0.2 rad move and compare.",
    ],
    example: hash(
      ["import math", "square roots for the triangular case."],
      ["", ""],
      ["def profile(dist, vmax, amax):", "times for a rest-to-rest move of length dist."],
      ["    t_acc = vmax / amax", "time needed to reach the cruise speed."],
      [
        "    d_acc = 0.5 * amax * t_acc**2",
        "distance covered while accelerating (the same again while braking).",
      ],
      ["    if 2 * d_acc >= dist:", "no room for a cruise phase: the profile is a triangle."],
      ["        t_acc = math.sqrt(dist / amax)", "accelerate for half the distance, then brake."],
      ["        return t_acc, 0.0, 2 * t_acc", "acceleration time, no cruise, total time."],
      [
        "    t_cruise = (dist - 2 * d_acc) / vmax",
        "the remaining distance is covered at the constant speed.",
      ],
      [
        "    return t_acc, t_cruise, 2 * t_acc + t_cruise",
        "acceleration time, cruise time, total time.",
      ],
      ["", ""],
      [
        "print(profile(2.0, 2.0, 4.0))",
        "long move: trapezoid with a cruise phase; prints (0.5, 0.5, 1.5).",
      ],
      [
        "print(profile(0.2, 2.0, 4.0))",
        "short move: a triangle, so the speed limit is never reached; prints about (0.224, 0.0, 0.447).",
      ],
    ),
    walk: [
      "The test 2*d_acc >= dist decides between the two shapes without any iteration.",
      "For short moves the acceleration limit, not the speed limit, sets the time.",
      "The function returns times, which is exactly what a scheduler needs for cycle-time estimates.",
    ],
    expect: [
      "The long move prints (0.5, 0.5, 1.5): half a second to accelerate, half a second of cruise, 1.5 seconds in total.",
      "The short move prints a cruise time of 0.0, proving it never reached the maximum speed.",
    ],
    fix: [
      [
        "The real robot is slower than the estimate.",
        "The controller applies its own limits or jerk limits. Read them from the controller configuration and use those values.",
      ],
      [
        "Joints finish at different times.",
        "Scale every joint to the slowest joint's total time so they move in sync.",
      ],
    ],
    exercise:
      "Write a function that takes six joint distances and six limit pairs, finds the slowest joint and returns the synchronised duration for the whole move.",
    checklist: [
      "Limits come from the actual robot",
      "Both trapezoid and triangle cases are handled",
      "The slowest joint sets the move time",
    ],
  }),
  lesson({
    title: "Dynamic modeling (Newton-Euler)",
    summary:
      "Compute the joint torques needed for a motion with the recursive Newton–Euler algorithm.",
    goals: [
      "Write the manipulator equation M(q)q̈ + C(q,q̇)q̇ + g(q) = τ",
      "Explain what the mass, Coriolis and gravity terms represent",
      "Compute joint torques from a URDF with a dynamics library",
    ],
    concept: [
      "Robot dynamics relates joint torques to motion: M(q)·q̈ + C(q,q̇)·q̇ + g(q) = τ. M is the mass matrix (inertia, which depends on the pose), C collects Coriolis and centrifugal terms that appear when several joints move, and g is the gravity torque. Payload changes M and g, so it must be part of the model.",
      "The recursive Newton–Euler algorithm (RNEA) computes τ from q, q̇ and q̈ in linear time by moving forward along the links for velocities and accelerations, then backward for forces. Libraries such as Pinocchio implement it and read the masses and inertias directly from the URDF.",
    ],
    steps: [
      "Check that the URDF has a mass and an inertia for every link.",
      "Load the URDF into a dynamics library.",
      "Compute the torque for a standing pose (zero speed and acceleration), which is pure gravity.",
      "Compute the torque for a fast move and compare the two.",
    ],
    example: hash(
      ["import pinocchio as pin", "Pinocchio is a fast rigid-body dynamics library."],
      ["import numpy as np", "numpy for the joint vectors."],
      ["", ""],
      [
        "model = pin.buildModelFromUrdf('arm.urdf')",
        "read the links, joints, masses and inertias from the robot description.",
      ],
      ["data = model.createData()", "workspace for the algorithm's intermediate results."],
      ["", ""],
      [
        "q = np.zeros(model.nq)",
        "joint positions: all zero (arm straight up or in its home pose).",
      ],
      ["v = np.zeros(model.nv)", "joint velocities: standing still."],
      ["a = np.zeros(model.nv)", "joint accelerations: none."],
      [
        "tau_gravity = pin.rnea(model, data, q, v, a)",
        "recursive Newton-Euler: with no motion the result is only the gravity torque.",
      ],
      ["print(tau_gravity.round(2))", "the torque each motor must apply just to hold the pose."],
      ["", ""],
      ["a = np.full(model.nv, 2.0)", "now ask every joint to accelerate at 2 rad/s^2."],
      [
        "tau_move = pin.rnea(model, data, q, v, a)",
        "torque needed for that acceleration plus gravity.",
      ],
      ["print((tau_move - tau_gravity).round(2))", "the extra torque caused by inertia alone."],
    ),
    walk: [
      "Subtracting the two results separates the gravity part from the acceleration part of the torque.",
      "model.nq and model.nv keep the code independent of the number of joints.",
      "If masses in the URDF are wrong, every torque here is wrong too, so the model needs real data.",
    ],
    expect: [
      "The gravity torque is largest for the shoulder joint and small for the wrist joints.",
      "The extra acceleration torque grows with the mass and length of the links beyond each joint.",
    ],
    fix: [
      [
        "Torque values are all zero.",
        "The URDF probably has no <inertial> blocks or zero masses. Add mass and inertia to every link.",
      ],
      [
        "Results are far from the real robot.",
        "Add the payload and the tool mass, and use the manufacturer's dynamic parameters when they are available.",
      ],
    ],
    exercise:
      "Attach a 2 kg tool mass at the flange in the URDF and report how much the shoulder gravity torque changes.",
    checklist: [
      "Every link has mass and inertia",
      "Payload and tool mass are included",
      "Gravity and inertial torques are separated",
    ],
  }),
  lesson({
    title: "PID joint control",
    summary: "Build a PID position controller with anti-windup and tune it for one joint.",
    goals: [
      "Explain what the P, I and D terms do",
      "Implement a discrete PID with a limited integral",
      "Tune the gains from a step response",
    ],
    concept: [
      "A PID controller computes a joint command from the position error: P reacts to the present error, I removes the steady offset by summing past error, and D damps by reacting to how fast the error changes. It is the standard low-level loop in servo drives, often running at 1–10 kHz.",
      "Real actuators saturate, so the integral term must not keep growing while the command is clipped; that is integrator windup and it causes overshoot. Clamp the integral (or stop integrating while saturated), filter the derivative and tune in a safe order: raise P until it oscillates, add D to damp, then add a little I.",
    ],
    steps: [
      "Simulate a simple joint (inertia with some friction) in code.",
      "Implement the PID with output limits and an integral limit.",
      "Apply a 0.5 rad step and record the response.",
      "Adjust the gains and note overshoot and settling time.",
    ],
    example: hash(
      ["class PID:", "a discrete PID controller for one joint."],
      [
        "    def __init__(self, kp, ki, kd, limit, dt):",
        "gains, output limit and the control period in seconds.",
      ],
      [
        "        self.kp, self.ki, self.kd, self.limit, self.dt = kp, ki, kd, limit, dt",
        "store the settings.",
      ],
      ["        self.integral = 0.0", "accumulated error over time."],
      ["        self.prev_error = 0.0", "last error, used for the derivative."],
      ["", ""],
      ["    def step(self, target, measured):", "one control cycle: returns the command."],
      ["        error = target - measured", "how far the joint is from where it should be."],
      ["        self.integral += error * self.dt", "add the error over this period to the sum."],
      [
        "        self.integral = max(-self.limit, min(self.limit, self.integral))",
        "clamp the integral to prevent windup while the output is saturated.",
      ],
      [
        "        derivative = (error - self.prev_error) / self.dt",
        "rate of change of the error; damps overshoot.",
      ],
      ["        self.prev_error = error", "remember the error for the next cycle."],
      [
        "        out = self.kp * error + self.ki * self.integral + self.kd * derivative",
        "the three terms added together.",
      ],
      [
        "        return max(-self.limit, min(self.limit, out))",
        "never command more than the actuator can deliver.",
      ],
    ),
    walk: [
      "The three terms are separate on one line, so tuning one gain at a time is easy to reason about.",
      "Clamping the integral is the anti-windup: it stops the sum from growing while the output is limited.",
      "The derivative uses the error difference divided by dt, so dt must equal the real loop period.",
    ],
    expect: [
      "A 0.5 rad step settles without large overshoot once D is added.",
      "With ki = 0 a small steady error remains under load; adding a little I removes it.",
    ],
    fix: [
      [
        "The joint oscillates.",
        "P is too high or D too low. Lower kp or raise kd, and check the loop period is constant.",
      ],
      [
        "The joint overshoots after a long move.",
        "The integral wound up. Lower the integral limit or stop integrating while the output is saturated.",
      ],
    ],
    exercise:
      "Simulate a joint with 0.1 kg·m² inertia and add a constant 1 N·m load. Tune the three gains so overshoot is below 5 % and the steady error is below 0.001 rad.",
    checklist: [
      "The integral term is limited",
      "dt matches the real loop period",
      "Tuning follows P, then D, then I",
    ],
  }),
  lesson({
    title: "Feedforward torque control",
    summary:
      "Add a model-based feedforward torque so the feedback loop only corrects small errors.",
    goals: [
      "Explain why feedforward improves tracking",
      "Write the computed-torque law from the dynamic model",
      "Combine feedforward and PD feedback safely",
    ],
    concept: [
      "Feedback alone reacts after an error appears. Feedforward uses the dynamic model to compute the torque a motion should need and applies it in advance, so the controller starts almost right. The computed-torque law is τ = M(q)(q̈_d + Kd·ė + Kp·e) + C·q̇ + g, where the desired acceleration q̈_d and the model do most of the work.",
      "Feedforward is only as good as the model. A wrong payload or friction makes the feedforward torque wrong, and the feedback loop then has to compensate. Keep the feedback gains, and always limit the total torque, because a model error must never become an unbounded command.",
    ],
    steps: [
      "Compute the desired position, velocity and acceleration for a planned move.",
      "Compute the feedforward torque with the dynamic model.",
      "Add the PD feedback term on the tracking error.",
      "Clamp the sum to the torque limits and compare tracking with and without the feedforward.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "def computed_torque(model_rnea, mass, q, qd, q_des, qd_des, qdd_des, kp, kd, tau_max):",
        "torque command for one control cycle.",
      ],
      ["    e = q_des - q", "position error."],
      ["    ed = qd_des - qd", "velocity error."],
      ["    a_cmd = qdd_des + kd * ed + kp * e", "desired acceleration plus a PD correction."],
      [
        "    tau_ff = model_rnea(q, qd, a_cmd)",
        "let the dynamic model turn that acceleration into joint torques (gravity and Coriolis included).",
      ],
      [
        "    return np.clip(tau_ff, -tau_max, tau_max)",
        "limit the command: a model error must never demand unlimited torque.",
      ],
      ["", ""],
      [
        "# model_rnea(q, qd, a) can be pinocchio.rnea with the model and data already bound.",
        "reuse the algorithm from the dynamics lesson.",
      ],
      [
        "# kp, kd are vectors of gains per joint, tau_max the drive's torque limit per joint.",
        "keep the gains and limits per joint, not global.",
      ],
    ),
    walk: [
      "The model handles gravity and inertia, so the gains only need to fix what the model misses.",
      "The desired acceleration qdd_des comes from the trajectory, which is why smooth trajectories matter.",
      "np.clip is the last line of defence: whatever the model says, the command stays inside the drive's limits.",
    ],
    expect: [
      "Tracking error during fast moves is much lower than with feedback only.",
      "With a wrong payload in the model the error grows, which shows why the model must match the tool.",
    ],
    fix: [
      [
        "The arm shakes at high gains.",
        "The model has errors that the high gain amplifies. Lower kp and kd, filter velocity and check the loop timing.",
      ],
      [
        "Tracking is worse than with plain PID.",
        "The model's mass or friction is wrong. Verify the payload and compare the model torque with measured motor current.",
      ],
    ],
    exercise:
      "Log the tracking error of a 1 rad move with feedback only, then with computed torque, and report the peak error of both.",
    checklist: [
      "The payload is in the model",
      "The torque is clamped",
      "Feedback stays active on top of the feedforward",
    ],
  }),
  lesson({
    title: "Collision detection",
    summary:
      "Detect unexpected contact by comparing measured motor torque with the model prediction.",
    goals: [
      "Explain geometric and torque-based collision detection",
      "Compute a residual between measured and modelled torque",
      "Choose a threshold and a reaction that stops the robot safely",
    ],
    concept: [
      "There are two ways to know about a collision. Geometric checking uses a model to keep the planned path away from obstacles before moving. Reactive detection notices contact while moving: the measured torque (motor current) departs from what the dynamic model predicts, and the difference, the residual, jumps when the arm hits something.",
      "A threshold turns the residual into a decision. Too low and normal payload and friction changes cause false stops; too high and a real collision is felt late. The reaction, such as stopping with braking or a small retreat, is part of the safety design and must be tested with real impact forces.",
    ],
    steps: [
      "Record measured and predicted torque during a normal, free move.",
      "Compute the residual and find its largest normal value.",
      "Set a threshold above that value with a margin.",
      "Simulate a contact by adding an extra torque and confirm the detector triggers.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "THRESHOLD = np.array([6.0, 6.0, 4.0, 2.0, 2.0, 1.0])",
        "residual limits per joint in N*m, chosen above normal noise (measure them, do not guess).",
      ],
      ["", ""],
      [
        "def collision(measured, predicted, filt, alpha=0.2):",
        "returns (collided?, updated filter).",
      ],
      ["    residual = measured - predicted", "torque the model cannot explain."],
      [
        "    filt = (1 - alpha) * filt + alpha * residual",
        "low-pass filter: ignores single noisy samples but reacts within a few cycles.",
      ],
      [
        "    return bool(np.any(np.abs(filt) > THRESHOLD)), filt",
        "any joint above its limit means contact; return the filter state for the next cycle.",
      ],
      ["", ""],
      ["def on_collision(robot):", "what to do when contact is detected."],
      ["    robot.stop_with_brake()", "stop first; deciding what happened comes later."],
      [
        "    robot.log('collision detected, motion stopped')",
        "record the event so an operator can see why it stopped.",
      ],
    ),
    walk: [
      "The filter makes the detector robust to noise; alpha trades speed of reaction against false alarms.",
      "Thresholds are per joint because wrist joints have far smaller torques than the shoulder.",
      "The reaction is separate from the detection so it can be tested and changed independently.",
    ],
    expect: [
      "In a free move the filtered residual stays below the thresholds.",
      "An injected 8 N·m disturbance on joint 1 triggers the detector within a few control cycles.",
    ],
    fix: [
      [
        "False collisions during fast moves.",
        "The model misses friction or payload. Update the payload, add friction terms or raise the threshold a little after measuring.",
      ],
      [
        "A real collision is detected too late.",
        "Lower the threshold or raise alpha, and check the loop timing; verify the result with a force measurement, not by feel.",
      ],
    ],
    exercise:
      "Collect residuals for 50 free moves, set the thresholds at 3× the observed maximum, and report how big a contact force each threshold corresponds to.",
    checklist: [
      "Thresholds come from measurements",
      "The reaction stops the robot safely",
      "Detection is tested with real contact forces",
    ],
  }),
  lesson({
    title: "Gravity compensation",
    summary:
      "Compute the torque that cancels the arm's weight so hand guiding and control need less effort.",
    goals: [
      "Derive the gravity torques of a two-link arm",
      "Add a gravity term to a joint controller",
      "Explain how payload changes the compensation",
    ],
    concept: [
      "Gravity pulls on every link with a torque that depends only on the pose: g(q). Gravity compensation applies exactly that torque so the arm floats. It makes hand-guiding light and lets the feedback loop concentrate on tracking, instead of fighting the arm's own weight.",
      "For a planar two-link arm, g1 = (m1·lc1 + m2·l1)·G·cos q1 + m2·lc2·G·cos(q1 + q2) and g2 = m2·lc2·G·cos(q1 + q2), where lc is the distance to a link's centre of mass. An unknown payload appears as extra mass at the tool, so it must be measured or estimated, or the compensation over- or under-shoots.",
    ],
    steps: [
      "Write the link masses and centre-of-mass distances of a two-link arm.",
      "Implement g(q) with the two formulas.",
      "Print the torques for the arm stretched horizontally and hanging down.",
      "Add a 1 kg payload at the tool and see how the torques change.",
    ],
    example: hash(
      ["import math", "cosines for the pose-dependent terms."],
      ["", ""],
      ["G = 9.81", "gravity in m/s^2."],
      ["", ""],
      [
        "def gravity(q1, q2, m1, m2, l1, lc1, lc2, payload=0.0, l2=0.3):",
        "torques (N*m) that hold the arm still in this pose.",
      ],
      ["    m2_eff = m2 + payload", "the payload acts like extra mass at the end of link 2."],
      [
        "    lc2_eff = (m2 * lc2 + payload * l2) / m2_eff",
        "the combined centre of mass moves toward the tip.",
      ],
      ["    g2 = m2_eff * lc2_eff * G * math.cos(q1 + q2)", "torque on the elbow joint."],
      [
        "    g1 = (m1 * lc1 + m2_eff * l1) * G * math.cos(q1) + g2",
        "the shoulder holds link 1 and everything beyond it.",
      ],
      ["    return g1, g2", "feedforward torques to add to the controller output."],
      ["", ""],
      [
        "print(gravity(0.0, 0.0, 2.0, 1.5, 0.3, 0.15, 0.15))",
        "arm stretched horizontally: the worst case, maximum torque.",
      ],
      [
        "print(gravity(-math.pi/2, 0.0, 2.0, 1.5, 0.3, 0.15, 0.15))",
        "arm hanging straight down: gravity acts along the arm, so the torque is about zero.",
      ],
    ),
    walk: [
      "The cosine terms show why the torque is largest when the arm is horizontal and zero when it is vertical.",
      "The payload is folded into mass and centre of mass, so the same function covers loaded and unloaded cases.",
      "The result is added to the controller output; it does not replace feedback.",
    ],
    expect: [
      "The horizontal pose prints large torques and the hanging pose prints values close to zero.",
      "Adding a payload increases both torques, with the shoulder increasing the most.",
    ],
    fix: [
      [
        "The arm drifts down when released.",
        "The compensation under-estimates the weight. Check masses, centre-of-mass distances and the payload.",
      ],
      [
        "The arm floats upward.",
        "The compensation is too large, often because the payload is still in the model after the tool was removed.",
      ],
    ],
    exercise:
      "Move the arm through five poses and compare the predicted gravity torque with measured motor torque at rest. Use the difference to correct the link masses.",
    checklist: [
      "Payload is part of the compensation",
      "Torques are checked in several poses",
      "Feedback control stays active",
    ],
  }),
  lesson({
    title: "Redundancy resolution",
    summary:
      "Use the null space of the Jacobian to satisfy a task and a second goal at the same time.",
    goals: [
      "Explain what kinematic redundancy is",
      "Compute a joint velocity with the pseudo-inverse and a null-space term",
      "Use the extra freedom to stay away from joint limits",
    ],
    concept: [
      "A robot is redundant for a task when it has more joints than the task needs. A six-axis arm doing arc welding needs only five DOF, because rotation about the torch axis does not matter, so one DOF is free. A 7-axis arm has one free DOF even for a full 6-DOF pose.",
      "The extra motion that changes the joints without moving the tool lives in the null space of the Jacobian. The velocity q̇ = J⁺·v + (I − J⁺J)·q̇₀ tracks the tool velocity v with the first term and uses q̇₀ freely in the second, for example to move away from a joint limit or a singularity. The two parts never disturb each other.",
    ],
    steps: [
      "Pick a three-joint planar arm that positions a point in 2D: it has one redundant DOF.",
      "Compute the pseudo-inverse of the Jacobian and the tool velocity command.",
      "Add the null-space term pulling the joints toward the middle of their ranges.",
      "Verify that the tool velocity is unchanged by the null-space term.",
    ],
    example: hash(
      ["import numpy as np", "numpy for matrix maths."],
      ["", ""],
      [
        "def joint_velocity(J, v, q, q_mid, k=1.0):",
        "joint speeds that follow the tool velocity v and stay near the range centre.",
      ],
      [
        "    J_pinv = np.linalg.pinv(J)",
        "pseudo-inverse: the smallest joint motion that produces v.",
      ],
      ["    n = J.shape[1]", "number of joints."],
      [
        "    null_projector = np.eye(n) - J_pinv @ J",
        "projects any joint motion onto the directions that do not move the tool.",
      ],
      [
        "    secondary = k * (q_mid - q)",
        "the second goal: drift toward the middle of the joint ranges.",
      ],
      [
        "    return J_pinv @ v + null_projector @ secondary",
        "task motion plus a harmless self-motion.",
      ],
      ["", ""],
      [
        "J = np.array([[-0.5, -0.3, -0.1], [0.4, 0.3, 0.1]])",
        "example Jacobian: three joints, two task directions (x and y).",
      ],
      ["v = np.array([0.02, 0.0])", "move the tool 2 cm/s in x."],
      [
        "dq = joint_velocity(J, v, np.array([0.5, 0.3, 0.2]), np.zeros(3))",
        "solve for the joint speeds.",
      ],
      [
        "print(dq.round(4), (J @ dq).round(4))",
        "the second vector equals v, so the extra motion did not move the tool.",
      ],
    ),
    walk: [
      "The null-space projector removes the part of any secondary motion that would move the tool.",
      "That is why the printed J @ dq equals the requested tool velocity even though the joints also move toward their centres.",
      "The gain k sets how strongly the secondary goal pulls; large values can make the joints move fast.",
    ],
    expect: [
      "J @ dq equals v to numerical precision.",
      "Changing k changes the joint speeds but not the tool velocity.",
    ],
    fix: [
      [
        "The tool drifts when the secondary goal is enabled.",
        "The projector is wrong or the Jacobian is stale. Recompute J every cycle and check the shape of the projector.",
      ],
      [
        "Joint speeds are huge near a singularity.",
        "The pseudo-inverse blows up there. Use a damped pseudo-inverse and limit the joint speeds.",
      ],
    ],
    exercise:
      "For a five-DOF welding task, add a secondary goal that keeps joint 5 as far from zero as possible, and show that the torch pose is unaffected.",
    checklist: [
      "Task and null-space terms are separate",
      "The Jacobian is updated each cycle",
      "Joint speeds are limited",
    ],
  }),
  lesson({
    title: "Smooth motion planning",
    summary: "Generate jerk-limited trajectories online with Ruckig so motion is fast and gentle.",
    goals: [
      "Explain why jerk limits matter for gearboxes and payloads",
      "Generate a jerk-limited trajectory for six joints",
      "Change the target while moving without a jolt",
    ],
    concept: [
      "Jerk is the rate of change of acceleration. A trapezoidal profile changes acceleration instantly, which means infinite jerk: it shakes the payload, excites the arm's flexibility and shortens gearbox life. A jerk-limited (S-curve) profile rounds the corners, so the move is a little longer but much smoother.",
      "Ruckig is an open-source library that computes jerk-limited, time-optimal trajectories online, one control cycle at a time. Because it starts from the current position, velocity and acceleration, you can change the target during motion and the new trajectory blends in without jumping. That is exactly what streaming or sensor-driven applications need.",
    ],
    steps: [
      "Add the Ruckig dependency and create a generator for six joints with a 1 ms cycle.",
      "Set the maximum velocity, acceleration and jerk of each joint from the datasheet.",
      "Run the update loop until the target is reached, sending each output to the controller.",
      "Change the target halfway through the move and confirm that motion stays continuous.",
    ],
    example: cpp(
      ["#include <ruckig/ruckig.hpp>", "the jerk-limited trajectory generator."],
      ["", ""],
      ["ruckig::Ruckig<6> otg{0.001};", "a generator for six joints with a 1 ms control cycle."],
      ["ruckig::InputParameter<6> input;", "current state, target and limits."],
      ["ruckig::OutputParameter<6> output;", "the state to command in the next cycle."],
      ["", ""],
      [
        "input.max_velocity = {1.5, 1.5, 1.5, 2.0, 2.0, 2.5};",
        "joint speed limits in rad/s from the datasheet.",
      ],
      [
        "input.max_acceleration = {4.0, 4.0, 4.0, 6.0, 6.0, 8.0};",
        "acceleration limits in rad/s^2.",
      ],
      [
        "input.max_jerk = {40.0, 40.0, 40.0, 60.0, 60.0, 80.0};",
        "jerk limits in rad/s^3: these make the motion smooth.",
      ],
      [
        "input.current_position = {0.0, -1.57, 1.57, 0.0, 1.57, 0.0};",
        "where the robot is now (read from the controller).",
      ],
      ["input.target_position = {0.5, -1.2, 1.2, 0.3, 1.2, 0.5};", "where it should go."],
      ["input.target_velocity = {0, 0, 0, 0, 0, 0};", "arrive at rest."],
      ["", ""],
      [
        "while (otg.update(input, output) == ruckig::Working) {",
        "compute one 1 ms step; keep going while the move is unfinished.",
      ],
      ["  send_to_controller(output.new_position);", "command the new joint positions."],
      [
        "  output.pass_to_input(input);",
        "feed the new state back as the next cycle's start, so a changed target blends in smoothly.",
      ],
      ["}", "the move is finished when the generator stops returning Working."],
    ),
    walk: [
      "The limits are inputs, not code, so slower or safer limits are a configuration change.",
      "pass_to_input() is what allows retargeting mid-move: each cycle starts from the true current state.",
      "The loop is a real-time loop, so the update call must run inside the control cycle with no blocking work.",
    ],
    expect: [
      "The velocity and acceleration graphs are smooth curves with no steps.",
      "Changing input.target_position mid-move produces a smooth blend, not a stop or a jolt.",
    ],
    fix: [
      [
        "The robot vibrates at the end of a move.",
        "The jerk limits are too high for the mechanics. Lower them and repeat; smoother is often faster overall.",
      ],
      [
        "update() takes too long for the cycle.",
        "Run it in the real-time thread on a pinned core and avoid allocations; check the cycle time.",
      ],
    ],
    exercise:
      "Compare a trapezoidal profile and a Ruckig profile for the same 1 rad move. Record peak jerk and total time for both.",
    checklist: [
      "Limits come from the datasheet",
      "Retargeting is tested mid-move",
      "The update fits inside the control cycle",
    ],
  }),
];
