import { hash, cpp, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 03 · Delta Parallel Robot — lessons 16–30 (High-Speed Applications, then ROS 2 & Simulation)
export const module03b: LessonSpec[] = [
  lesson({
    title: "Error correction",
    summary:
      "Learn a running correction from measured pick misses so systematic errors shrink automatically.",
    goals: [
      "Distinguish random misses from systematic offsets",
      "Measure the miss vector of each pick",
      "Apply a filtered correction to later picks",
    ],
    concept: [
      "Picks miss for two reasons. Random misses come from noise, and nothing can be corrected. Systematic misses come from a small calibration error, a wrong belt speed or a latency mismatch, and they show up as a consistent offset in the same direction. A verification camera or the gripper's own sensors give the miss vector for every pick.",
      "Averaging the last few miss vectors gives an estimate of the systematic offset, and subtracting a fraction of it from later picks removes it. The filter must be slow enough not to chase noise and must have limits, so a broken camera or a bad part can never drag the correction far away.",
    ],
    steps: [
      "Record the miss vector (dx, dy) of each pick, measured against the target before any correction.",
      "Keep a moving average over the last 20 picks.",
      "Apply 80 % of the average as a correction and limit it to 2 mm.",
      "Reset the correction after a tool change or recalibration.",
    ],
    example: hash(
      [
        "from collections import deque",
        "a list with a maximum length, used for the moving average.",
      ],
      ["", ""],
      ["class Correction:", "learns a systematic pick offset from measured misses."],
      [
        "    def __init__(self, window=20, gain=0.8, limit=2.0):",
        "window of picks, the share of the average miss to cancel and the largest allowed correction (mm).",
      ],
      [
        "        self.dx, self.dy = deque(maxlen=window), deque(maxlen=window)",
        "the most recent x and y misses.",
      ],
      ["        self.gain, self.limit = gain, limit", "store the settings."],
      ["", ""],
      [
        "    def add(self, miss_x, miss_y):",
        "call after every pick with the miss (mm) measured against the target before the correction was added.",
      ],
      ["        self.dx.append(miss_x)", "remember the x miss."],
      ["        self.dy.append(miss_y)", "and the y miss."],
      ["", ""],
      ["    def offset(self):", "the correction to add to the next pick position."],
      ["        if len(self.dx) < 5:", "too little data to trust."],
      ["            return 0.0, 0.0", "do nothing until at least five picks were measured."],
      [
        "        cx = -self.gain * sum(self.dx) / len(self.dx)",
        "the opposite of the average miss, scaled by the gain.",
      ],
      ["        cy = -self.gain * sum(self.dy) / len(self.dy)", "the same for y."],
      [
        "        clip = lambda v: max(-self.limit, min(self.limit, v))",
        "never let the correction exceed the limit.",
      ],
      ["        return clip(cx), clip(cy)", "the safe, filtered correction."],
    ),
    walk: [
      "A minimum of five picks avoids acting on one or two noisy measurements.",
      "Cancelling only 80 % of the average leaves a small margin, so noise cannot push the correction past zero.",
      "The limit turns a broken camera into a bounded error, not an ever-growing one.",
    ],
    expect: [
      "With a constant 0.4 mm miss in x the correction settles at -0.32 mm and only about 0.08 mm of the miss remains.",
      "Random misses with a zero mean leave the correction near zero.",
    ],
    fix: [
      [
        "The correction oscillates.",
        "The gain is too high or the window too short. Lower the gain and widen the window.",
      ],
      [
        "Correction drifts after a tool change.",
        "Reset the filter after a tool change or recalibration, because the old offset no longer applies.",
      ],
    ],
    exercise:
      "Simulate 200 picks with a systematic miss of 0.5 mm and random noise of 0.1 mm and plot the miss with and without the correction.",
    checklist: [
      "Only systematic errors are corrected",
      "The correction is limited",
      "The filter is reset after mechanical changes",
    ],
  }),
  lesson({
    title: "Multi-robot coordination",
    summary: "Share parts on one conveyor between several delta robots without double picks.",
    goals: [
      "Explain how upstream and downstream robots divide parts",
      "Assign each part to exactly one robot",
      "Balance the load between robots",
    ],
    concept: [
      "On a fast belt one delta cannot pick everything, so several robots stand along it. Each part must be picked by exactly one robot, and every robot should have a similar amount of work. The usual rule is that the upstream robot takes parts while it has time, and whatever it cannot reach passes on to the next one.",
      "A central scheduler that sees all detections avoids conflicts. It assigns a part to the first robot whose window the part is in and that is ready, or balances by giving the next part to the least busy robot. Assignment must be recorded before the pick starts, or two robots may go for the same part.",
    ],
    steps: [
      "Give each robot a position along the belt and a window.",
      "For each new part list the robots whose window it will cross.",
      "Assign the part to the least busy of them that can arrive in time.",
      "Record the assignment and remove the part from the other robots' lists.",
    ],
    example: hash(
      ["class Robot:", "the scheduler's view of one robot."],
      [
        "    def __init__(self, name, x_start, x_end):",
        "the robot's pick window along the belt (mm).",
      ],
      [
        "        self.name, self.x_start, self.x_end, self.busy_until, self.count = name, x_start, x_end, 0.0, 0",
        "name, window, the time it becomes free and how many parts it took.",
      ],
      ["", ""],
      [
        "def assign(part_x, t_detect, belt_v, robots, cycle=0.5):",
        "give a part (position part_x at time t_detect) to one robot.",
      ],
      ["    options = []", "robots that could take the part."],
      ["    for r in robots:", "check every robot."],
      [
        "        t_arrive = t_detect + max(0.0, (r.x_start - part_x) / belt_v)",
        "when the part reaches the start of this robot's window.",
      ],
      ["        t_leave = t_detect + (r.x_end - part_x) / belt_v", "when it leaves the window."],
      [
        "        t_pick = max(t_arrive, r.busy_until)",
        "the earliest the robot could start: when the part is there and the robot is free.",
      ],
      ["        if t_pick + cycle <= t_leave:", "can the pick be finished before the part leaves?"],
      [
        "            options.append((r.count, t_pick, r))",
        "candidate: sorted by how many parts it already has.",
      ],
      ["    if not options:", "nobody can catch this part."],
      ["        return None", "let the part pass to the end of the line."],
      [
        "    _, t_pick, chosen = min(options, key=lambda o: (o[0], o[1]))",
        "the least busy robot, and the earliest time as a tie-breaker.",
      ],
      [
        "    chosen.busy_until, chosen.count = t_pick + cycle, chosen.count + 1",
        "reserve the robot and count the part before anything moves.",
      ],
      ["    return chosen.name, t_pick", "the assignment."],
    ),
    walk: [
      "The scheduler reserves the robot in the same function that chooses it, so the same part cannot be assigned twice.",
      "The 'finished before it leaves' check prevents assigning parts that would be missed anyway.",
      "Choosing the robot with the smallest count spreads the wear and the workload evenly.",
    ],
    expect: [
      "Parts are distributed over the robots almost evenly and no part appears twice.",
      "When all robots are busy the function returns None and the part continues down the belt.",
    ],
    fix: [
      [
        "Two robots go for the same part.",
        "The assignment was not recorded before starting the pick. Reserve inside the assignment function.",
      ],
      [
        "The last robot is idle while the first is overloaded.",
        "The balance rule is missing. Choose by count or by busy time, not by position alone.",
      ],
    ],
    exercise:
      "Simulate 1,000 parts at random spacing for three robots and report the picks per robot and the number of parts missed by all.",
    checklist: [
      "Each part has exactly one owner",
      "The assignment is recorded before motion",
      "Load is balanced between robots",
    ],
  }),
  lesson({
    title: "Quality inspection",
    summary:
      "Inspect parts on the belt with a size check and a reject rule that removes only confirmed bad parts.",
    goals: [
      "Explain in-line inspection on a moving belt",
      "Apply a size tolerance with a confirmation rule",
      "Choose between rejecting with the robot and blowing off",
    ],
    concept: [
      "In-line inspection measures each part as it passes the camera and compares the result with the tolerance. Because a single measurement on a moving part is noisy, a robust rule confirms a bad result before rejecting: two measurements from two frames must both be out of tolerance. This stops false rejects, which cost as much as missed defects.",
      "A reject can be done by the robot (pick and place into a reject bin) or by a separate device such as an air blow-off. The robot is precise but uses cycle time; a blow-off is fast but only suits light parts. Every reject is counted with a reason, so the process owner can find the cause.",
    ],
    steps: [
      "Define the nominal size and the tolerance.",
      "Measure the part in two frames.",
      "Reject only if both measurements are out of tolerance.",
      "Count rejects by reason and report them.",
    ],
    example: hash(
      ["NOMINAL, TOL = 30.0, 0.4", "part width in mm and its allowed deviation."],
      ["rejects = {'too_small': 0, 'too_large': 0}", "counters by reason."],
      ["", ""],
      [
        "def judge(measurements):",
        "decide about one part from its measurements in several frames.",
      ],
      ["    small = [m < NOMINAL - TOL for m in measurements]", "for each measurement: too small?"],
      ["    large = [m > NOMINAL + TOL for m in measurements]", "for each measurement: too large?"],
      ["    if len(measurements) >= 2 and all(small):", "every frame says the part is too small."],
      ["        rejects['too_small'] += 1", "count it by its reason."],
      ["        return 'reject'", "confirmed bad part."],
      ["    if len(measurements) >= 2 and all(large):", "every frame says the part is too large."],
      ["        rejects['too_large'] += 1", "count it."],
      ["        return 'reject'", "confirmed bad part."],
      [
        "    return 'accept' if not any(small) and not any(large) else 'recheck'",
        "clean pass, or a doubtful part that needs another look.",
      ],
      ["", ""],
      [
        "print(judge([29.5, 29.4]), judge([29.5, 30.0]), judge([30.1, 30.2]))",
        "prints reject, recheck, accept.",
      ],
    ),
    walk: [
      "The three outcomes (accept, reject, recheck) avoid forcing a decision on doubtful measurements.",
      "Requiring all frames to agree on a reject prevents one noisy measurement from scrapping a good part.",
      "The counters by reason give a first indication of whether the fault is the supplier or the machine.",
    ],
    expect: [
      "The example prints reject, recheck and accept in that order.",
      "The counters show one 'too_small' reject.",
    ],
    fix: [
      [
        "Too many good parts are rejected.",
        "Measurement noise is larger than the tolerance margin. Improve lighting and calibration or widen the confirmation rule.",
      ],
      [
        "Bad parts get through.",
        "The recheck outcome is treated as accept somewhere. Send rechecks to a second inspection or to reject.",
      ],
    ],
    exercise:
      "Add a third frame and require two of three measurements to agree, then compare false reject rates on simulated noisy data.",
    checklist: [
      "Rejects need confirmation",
      "Doubtful parts are not silently accepted",
      "Rejects are counted by reason",
    ],
  }),
  lesson({
    title: "Safety guarding",
    summary: "Compute the minimum safety distance for a light curtain with the ISO 13855 formula.",
    goals: [
      "Explain why fast robots need guarding and safety distance",
      "Apply S = K × T + C to find the safe distance",
      "Understand why the stop time must include the robot and the safety chain",
    ],
    concept: [
      "A delta robot is fast and its moving platform can hit hard, so the cell is guarded with fixed fences and interlocked gates or light curtains. A protective device only helps if the robot stops before the person can reach the hazard. ISO 13855 gives the minimum distance S = K × T + C, where K is the approach speed (2,000 mm/s, or 1,600 mm/s for larger distances), T is the total stopping time and C an extra distance depending on the device.",
      "T is not just the robot's braking time. It includes the response time of the sensor, the safety controller and the actual stopping time of the machine. For light curtains C = 8 × (d − 14) mm, where d is the detection capability of the curtain in millimetres (up to 40 mm). Using a wrong or optimistic T is one of the most dangerous mistakes in cell design, so the stop time must be measured on the real robot.",
    ],
    steps: [
      "Measure the total stopping time of the robot and the response time of the safety devices.",
      "Choose the detection capability of the light curtain.",
      "Compute the minimum distance with the standard formula.",
      "Place the curtain at least that far from the hazard and review the design with a safety expert.",
    ],
    example: hash(
      [
        "def min_distance(stop_time_s, d_mm):",
        "minimum distance (mm) between a light curtain and the hazard; illustrative, verify against ISO 13855.",
      ],
      [
        "    c = max(0.0, 8.0 * (d_mm - 14.0)) if d_mm <= 40 else 850.0",
        "extra distance: depends on how small an object the curtain detects.",
      ],
      ["    s = 2000.0 * stop_time_s + c", "first try with an approach speed of 2000 mm/s."],
      ["    if s > 500.0:", "for larger distances the standard allows a lower approach speed."],
      [
        "        s = max(500.0, 1600.0 * stop_time_s + c)",
        "recompute with 1600 mm/s, but never below 500 mm.",
      ],
      ["    return round(s, 1)", "the minimum safe distance in millimetres."],
      ["", ""],
      [
        "print(min_distance(0.3, 30))",
        "a 0.3 s total stop time and a 30 mm detection capability: prints 608.0.",
      ],
      [
        "print(min_distance(0.6, 30))",
        "a slower stop time makes the distance grow: prints 1088.0.",
      ],
    ),
    walk: [
      "The result grows linearly with the stop time, which is why a faster stop lets the curtain sit closer.",
      "The extra distance C punishes coarse detection, so a finer curtain saves floor space.",
      "This function is an illustration of the formula; a real design must follow the standard and be reviewed by a qualified person.",
    ],
    expect: [
      "The first call prints 608.0 mm and the second prints 1088.0 mm.",
      "Cutting the stop time from 0.6 s to 0.3 s reduces the distance by about 44 %.",
    ],
    fix: [
      [
        "The curtain is too close after the robot was replaced.",
        "The stop time changed. Re-measure T after every change of robot, payload, speed or safety hardware and recompute S.",
      ],
      [
        "People can reach around or under the curtain.",
        "The formula only covers approach. Add fixed guards, check for reaching over and around, and review the layout with an expert.",
      ],
    ],
    exercise:
      "Measure or assume three stop times (0.2, 0.3 and 0.5 s) and compare the minimum distances for curtains with 14 mm and 30 mm detection capability.",
    checklist: [
      "Stop time is measured on the real robot",
      "Distance includes sensor and controller response",
      "The design is reviewed by a qualified person",
    ],
  }),
  lesson({
    title: "Maintenance & tuning",
    summary: "Trend motor torque and temperature to predict wear before it stops production.",
    goals: [
      "Choose values that show wear",
      "Fit a trend and predict when a limit will be reached",
      "Turn the prediction into a maintenance work order",
    ],
    concept: [
      "Delta robots run millions of cycles. Wear shows up slowly: friction in the joints rises, so the motor torque for the same motion increases; belts stretch and temperatures creep up. Comparing today's numbers with a healthy baseline finds problems weeks before a failure. The values must be recorded under comparable conditions, for example the average torque of a standard reference cycle.",
      "A straight-line fit of the last weeks of data gives a slope. Dividing the distance to the alarm limit by the slope predicts the remaining days. Planned maintenance at the predicted time is cheaper than a breakdown, and the same numbers show whether the repair worked, because the trend drops again afterwards.",
    ],
    steps: [
      "Log the average torque of the reference cycle every day.",
      "Fit a straight line to the last 30 days.",
      "Predict the day on which the alarm limit will be reached.",
      "Create a maintenance task when fewer than 14 days remain.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the line fit."],
      ["", ""],
      [
        "def days_left(torques, limit):",
        "torques: one value per day (N*m), oldest first; limit: the alarm value.",
      ],
      ["    days = np.arange(len(torques))", "0, 1, 2, ...: the day numbers."],
      [
        "    slope, intercept = np.polyfit(days, torques, 1)",
        "the best straight line through the data.",
      ],
      ["    if slope <= 0:", "no upward trend."],
      ["        return None", "nothing to predict."],
      ["    now = slope * days[-1] + intercept", "the fitted value today."],
      ["    return (limit - now) / slope", "days until the line reaches the limit."],
      ["", ""],
      [
        "data = [3.00, 3.01, 3.03, 3.04, 3.07, 3.08, 3.10, 3.13, 3.14, 3.17]",
        "ten days of average reference-cycle torque.",
      ],
      ["left = days_left(data, limit=5.0)", "the alarm limit is 5.0 N*m."],
      ["print(round(left))", "prints about 97: roughly 97 days remain if the trend continues."],
      [
        "print('schedule maintenance' if left is not None and left < 14 else 'ok for now')",
        "act only when fewer than 14 days remain.",
      ],
    ),
    walk: [
      "A fitted line is less sensitive to a single noisy day than comparing the last two values.",
      "A non-positive slope returns None, so improvement or steady operation never triggers an alarm.",
      "The threshold of 14 days gives the maintenance team time to plan the work.",
    ],
    expect: [
      "The script prints about 97 days and 'ok for now'.",
      "After a repair the torque falls and the predicted time returns to None or a large value.",
    ],
    fix: [
      [
        "The prediction jumps around.",
        "The data are not comparable. Record the same reference cycle at the same temperature and payload.",
      ],
      [
        "A sudden step in the data appears.",
        "A tool change or recalibration has changed the baseline. Start a new trend after such events.",
      ],
    ],
    exercise:
      "Add a temperature trend and produce a combined score that raises the alarm when either trend crosses its limit within 14 days.",
    checklist: [
      "Data come from a comparable reference cycle",
      "Trends restart after mechanical changes",
      "Predictions create planned maintenance tasks",
    ],
  }),
  lesson({
    title: "URDF/SDF parallel robot modeling",
    summary:
      "Model a delta as a simulator-friendly description with the parallelogram closed loops made explicit.",
    goals: [
      "Explain why URDF cannot describe closed kinematic loops",
      "Describe the delta in SDF with ball joints that close the loops",
      "Provide a simplified serial model for MoveIt and visualisation",
    ],
    concept: [
      "URDF describes a tree: every link has exactly one parent. A delta has closed loops, because each arm connects the base to the platform and the three arms meet at the platform. URDF cannot express this directly. SDF, the format used by Gazebo, can: extra joints (ball joints) may connect links already reachable by another path, which closes the loops in the physics engine.",
      "In practice a delta uses two models. The SDF with ball joints is used for the physics simulation. A simplified URDF, where the platform is a chain of three prismatic joints (x, y and z) driven by a plugin or a controller that converts platform positions to motor angles, is used for visualisation and planning. Both must have the same dimensions.",
    ],
    steps: [
      "Write one arm of the SDF: motor joint, upper arm, rods and ball joints.",
      "Repeat the arm three times with a 120 degree rotation.",
      "Connect the rods to the platform with ball joints, which closes the loops.",
      "Write a simplified URDF with three prismatic joints for the platform.",
    ],
    example: xml(
      ['<model name="delta">', "the whole robot as one SDF model."],
      ['  <link name="base"><pose>0 0 0 0 0 0</pose></link>', "the fixed base."],
      [
        '  <link name="upper_arm_1"><pose>0.115 0 0 0 0 0</pose></link>',
        "the motor-driven upper arm of arm 1.",
      ],
      ['  <joint name="motor_1" type="revolute">', "the driven joint between base and upper arm."],
      ["    <parent>base</parent><child>upper_arm_1</child>", "the base holds the arm."],
      [
        "    <axis><xyz>0 1 0</xyz><limit><lower>-0.7</lower><upper>1.5</upper></limit></axis>",
        "rotation about y with the motor range in radians.",
      ],
      ["  </joint>", "end of the motor joint."],
      ['  <link name="rod_1a"/>', "one of the two parallel rods of arm 1 (shape omitted here)."],
      [
        '  <joint name="elbow_1a" type="ball"><parent>upper_arm_1</parent><child>rod_1a</child></joint>',
        "a ball joint lets the rod swing freely at the upper arm.",
      ],
      [
        '  <joint name="wrist_1a" type="ball"><parent>rod_1a</parent><child>platform</child></joint>',
        "the other end joins the platform: with three arms this closes the loops.",
      ],
      [
        '  <link name="platform"/>',
        "the moving platform (arms 2 and 3 are defined the same way, rotated by 120 degrees).",
      ],
      ["</model>", "end of the model."],
    ),
    walk: [
      "The platform has several parents in effect, which is exactly what URDF cannot do and SDF can.",
      "Ball joints have no limits on their own, so a real model adds limit stops or checks the angles in code.",
      "The motor joint is the only active joint per arm; everything else follows from the closed loops.",
    ],
    expect: [
      "In Gazebo the platform stays level and moves when the motor joints are commanded.",
      "The simplified URDF shows the platform position as three prismatic joint values.",
    ],
    fix: [
      [
        "The simulation explodes or jitters.",
        "Closed loops are stiff for the physics engine. Reduce the step size, add small damping to the ball joints and give links realistic masses.",
      ],
      [
        "The platform tilts.",
        "The rods are not exactly parallel or the arms are not identical. Check every dimension against arm 1.",
      ],
    ],
    exercise:
      "Add the second and third arms with rotated poses and verify that the platform stays level in simulation for ten random motor angle sets.",
    checklist: [
      "The loops are closed with ball joints in SDF",
      "The simple URDF has the same dimensions",
      "Physics settings are tuned for stiff loops",
    ],
  }),
  lesson({
    title: "Custom IK solver",
    summary:
      "Wrap the delta's inverse kinematics in a ROS 2 node that turns platform targets into motor commands safely.",
    goals: [
      "Publish motor commands from platform targets",
      "Check reachability and motor limits in the node",
      "Publish a fault instead of a command for bad targets",
    ],
    concept: [
      "MoveIt's default kinematics plugins assume a serial arm, so a delta needs its own solver. A small ROS 2 node holds the closed-form inverse kinematics: it subscribes to platform targets, computes the three motor angles, checks reachability and limits and publishes the motor command. Everything else in the system then works in platform coordinates, which is much easier to think about.",
      "The node must fail safely. If the target is unreachable or the angles are outside the limits, it publishes nothing to the controller and reports a fault. It also stamps its output with the input's timestamp, so downstream nodes know how old the command is.",
    ],
    steps: [
      "Create a node with a subscription for PointStamped platform targets.",
      "Call the inverse kinematics function for each target.",
      "Publish a Float64MultiArray of motor angles if the result is valid.",
      "Publish a Bool fault topic and log a warning otherwise.",
    ],
    example: hash(
      ["import math", "for the degree to radian conversion."],
      ["import rclpy", "the ROS 2 Python client library."],
      ["from rclpy.node import Node", "base class of all nodes."],
      ["from geometry_msgs.msg import PointStamped", "the input: a platform target."],
      [
        "from std_msgs.msg import Bool, Float64MultiArray",
        "the outputs: motor angles and a fault flag.",
      ],
      ["from delta_kinematics import inverse", "the inverse kinematics from the earlier lesson."],
      ["", ""],
      ["LOW, HIGH = -40.0, 85.0", "motor limits in degrees."],
      ["", ""],
      ["class DeltaIK(Node):", "the solver node."],
      ["    def __init__(self):", "set up subscription and publishers."],
      ["        super().__init__('delta_ik')", "name the node."],
      [
        "        self.pub = self.create_publisher(Float64MultiArray, 'motor_command', 10)",
        "where valid motor angles go.",
      ],
      [
        "        self.fault = self.create_publisher(Bool, 'ik_fault', 10)",
        "a flag that tells the supervisor about a bad target.",
      ],
      [
        "        self.create_subscription(PointStamped, 'platform_target', self.on_target, 10)",
        "listen for platform targets in millimetres.",
      ],
      ["", ""],
      ["    def on_target(self, msg):", "called for every target."],
      ["        p = msg.point", "the point in the message."],
      ["        angles = inverse(p.x, p.y, p.z)", "solve the three motor angles."],
      [
        "        ok = angles is not None and all(LOW <= a <= HIGH for a in angles)",
        "reachable and inside the motor limits?",
      ],
      ["        self.fault.publish(Bool(data=not ok))", "publish the health of this target."],
      ["        if not ok:", "bad target."],
      [
        "            self.get_logger().warn(f'target ({p.x:.0f}, {p.y:.0f}, {p.z:.0f}) rejected')",
        "explain why nothing moves.",
      ],
      ["            return", "never publish a command for a bad target."],
      [
        "        self.pub.publish(Float64MultiArray(data=[math.radians(a) for a in angles]))",
        "controllers use radians.",
      ],
    ),
    walk: [
      "The fault topic is published for every target, so a supervisor sees good and bad results, not only errors.",
      "Nothing reaches the controller when the target is bad, which is the safe default.",
      "Conversion to radians happens at the boundary, so the rest of the system uses SI units.",
    ],
    expect: [
      "A reachable target produces a motor_command message with three angles and ik_fault False.",
      "A target above the base or far outside the radius produces a warning, ik_fault True and no command.",
    ],
    fix: [
      [
        "The robot moves to a mirrored position.",
        "Motor numbering or direction differ from the model. Check with three simple targets along each arm's axis.",
      ],
      [
        "The node is slow.",
        "Pure Python is fine at a few hundred hertz; for a 1 kHz loop implement the solver in C++.",
      ],
    ],
    exercise:
      "Add the timestamp of the input to the output message (use a MultiArray with a stamped wrapper) and measure the node's latency.",
    checklist: [
      "Motor limits are checked in the node",
      "Bad targets create a fault, not a command",
      "SI units at the node boundary",
    ],
  }),
  lesson({
    title: "MoveIt integration",
    summary:
      "Plan in platform coordinates with MoveIt using a virtual prismatic chain, and convert to motor angles in the controller.",
    goals: [
      "Explain why a delta is planned in Cartesian platform space",
      "Define a planning group of three prismatic virtual joints",
      "Keep the conversion to motor angles outside MoveIt",
    ],
    concept: [
      "MoveIt plans for serial chains of joints. A delta's three DOF are the platform's x, y and z, so it is convenient to give MoveIt a virtual robot whose joints are three prismatic axes. MoveIt plans paths for that virtual platform, with collision checking against the cell, and the result is a trajectory in x, y and z.",
      "A controller then applies the inverse kinematics to each point of the trajectory to obtain motor angles. The workspace limits are built into the virtual joints' limits as a box; more accurate boundaries are enforced by the inverse kinematics node, which rejects unreachable points. Collision checking uses the platform and the tool, while the arm swings are handled by the workspace limits.",
    ],
    steps: [
      "Create a URDF with prismatic joints platform_x, platform_y and platform_z.",
      "Define the planning group and named poses in the SRDF.",
      "Plan a path between two poses in MoveIt.",
      "Feed the planned points through the inverse kinematics node and check each result.",
    ],
    example: xml(
      ['<robot name="delta_platform">', "the virtual robot MoveIt uses for planning."],
      ['  <group name="platform">', "the planning group: everything that moves the platform."],
      ['    <joint name="platform_x"/>', "prismatic joint along x."],
      ['    <joint name="platform_y"/>', "prismatic joint along y."],
      ['    <joint name="platform_z"/>', "prismatic joint along z."],
      ["  </group>", "end of the group."],
      [
        '  <group_state name="home" group="platform">',
        "a named pose the program can request by name.",
      ],
      ['    <joint name="platform_x" value="0.0"/>', "centred in x."],
      ['    <joint name="platform_y" value="0.0"/>', "centred in y."],
      ['    <joint name="platform_z" value="-0.30"/>', "0.30 m below the base (metres in ROS)."],
      ["  </group_state>", "end of the named pose."],
      [
        '  <disable_collisions link1="platform_link_x" link2="platform_link_y" reason="Adjacent"/>',
        "neighbouring virtual links always touch; ignore them.",
      ],
      ["</robot>", "end of the file."],
    ),
    walk: [
      "The virtual joints turn a parallel robot into a simple three-axis machine for the planner.",
      "Named poses are used by programs and are independent of the motor angles.",
      "The reachability check remains in the IK node, because the box limits of the virtual joints only approximate the true workspace.",
    ],
    expect: [
      "MoveIt plans a path between two named poses with three joint values per point.",
      "Every planned point passes the reachability and motor limit checks, or the plan is rejected before execution.",
    ],
    fix: [
      [
        "Planned points are unreachable for the real robot.",
        "The box limits are larger than the true workspace. Shrink them, or check all points with the IK node before executing.",
      ],
      [
        "The robot is slow along a MoveIt path.",
        "Time parametrisation uses generic limits. Replace it with the speed scaling from the earlier lesson.",
      ],
    ],
    exercise:
      "Plan 20 random point-to-point moves and count how many are rejected by the IK reachability check.",
    checklist: [
      "MoveIt plans in platform coordinates",
      "The IK node checks every trajectory point",
      "Speed limits reflect the motors, not generic values",
    ],
  }),
  lesson({
    title: "High-speed trajectory planning",
    summary:
      "Scale the speed of a path segment by segment so that motor limits hold and the platform is as fast as allowed.",
    goals: [
      "Turn a geometric path into a timed trajectory",
      "Limit each segment's speed from the motor limits",
      "Compute the total time of the move",
    ],
    concept: [
      "A path only says where to go; a trajectory says when. To be fast without exceeding any limit, the speed along the path must vary: quick where the motors have reserve and slower near the edge of the workspace. This can be computed directly: for each short segment find the largest platform speed for which no motor exceeds its speed limit.",
      "The time of a segment is its length divided by that speed. Adding the times gives the duration of the move, and the profile can be smoothed with the input shaper afterwards. Acceleration limits are added the same way, using the torque check from the dynamics lesson.",
    ],
    steps: [
      "Sample a straight path at 5 mm spacing.",
      "For each segment compute the motor speeds per unit platform speed with the Jacobian.",
      "Find the highest platform speed that respects the motor limit.",
      "Sum the segment times to get the duration.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      ["MOTOR_MAX = 1200.0", "maximum motor speed in degrees per second."],
      ["V_MAX = 3000.0", "the highest platform speed allowed by the mechanics (mm/s)."],
      ["", ""],
      [
        "def timed_path(points, jacobian):",
        "returns segment times (s) for a list of (x, y, z) points.",
      ],
      ["    times = []", "one time per segment."],
      ["    for a, b in zip(points, points[1:]):", "walk along the path segment by segment."],
      ["        d = np.asarray(b, float) - np.asarray(a, float)", "the segment vector in mm."],
      ["        length = np.linalg.norm(d)", "its length."],
      ["        direction = d / length", "unit direction of travel."],
      [
        "        per_speed = np.abs(jacobian(a) @ direction).max()",
        "the busiest motor's speed for 1 mm/s of platform speed (deg/s per mm/s).",
      ],
      [
        "        v = min(V_MAX, MOTOR_MAX / per_speed)",
        "the fastest platform speed that keeps every motor inside its limit.",
      ],
      ["        times.append(length / v)", "time for this segment."],
      ["    return times", "the whole timing of the path."],
      ["", ""],
      [
        "# t = sum(timed_path(points, lambda p: jacobian(inverse, p)))",
        "the duration of the move in seconds.",
      ],
    ),
    walk: [
      "The busiest motor decides the speed, which is why the path slows where one arm is nearly stretched.",
      "V_MAX keeps the speed limited by the mechanics even where the motors have plenty of reserve.",
      "The result feeds a trajectory generator that adds acceleration limits and input shaping.",
    ],
    expect: [
      "Segments near the centre run at V_MAX and segments near the edge are slower.",
      "The total time of a symmetric path is the same in both directions.",
    ],
    fix: [
      [
        "The robot cannot follow the timing.",
        "Acceleration limits are missing. Apply them between segments with the torque check.",
      ],
      [
        "The times are too optimistic.",
        "Motor limits are for peak speed at no load. Use the values at your payload.",
      ],
    ],
    exercise:
      "Compute the duration of a 300 mm line at heights of -250 and -400 mm and explain the difference.",
    checklist: [
      "The busiest motor limits the speed",
      "Acceleration limits are added",
      "Limits are valid for the real payload",
    ],
  }),
  lesson({
    title: "Gazebo conveyor simulation",
    summary:
      "Simulate a belt with parts kinematically and publish part positions for the tracking and pick logic.",
    goals: [
      "Explain why belts are often simulated kinematically",
      "Write a node that moves parts along a belt and spawns new ones",
      "Publish part poses with timestamps",
    ],
    concept: [
      "Simulating a belt with real friction and contact in Gazebo is difficult and often unstable for small parts. For testing pick logic a simpler approach works well: a node moves the parts along the belt at a chosen speed and publishes their poses, and the robot simulation reads those poses like camera detections. The physics stays out of it, while timing and geometry stay realistic.",
      "This kinematic belt is easy to control: speed, spawn rate and randomness are parameters, so tests are repeatable. Add noise and delay to the published poses to imitate the vision system. When the logic is proven, the same nodes run with the real camera and belt encoder.",
    ],
    steps: [
      "Write a node with a 100 Hz timer that moves parts by speed × dt.",
      "Spawn a new part at the belt start every 0.4 seconds with a random lateral offset.",
      "Publish the poses as a PoseArray with a timestamp.",
      "Remove parts that pass the end of the belt.",
    ],
    example: hash(
      ["import random", "for random spawn positions."],
      ["import rclpy", "the ROS 2 Python client library."],
      ["from rclpy.node import Node", "base class of all nodes."],
      ["from geometry_msgs.msg import Pose, PoseArray", "poses of all parts on the belt."],
      ["", ""],
      ["class Belt(Node):", "a simulated conveyor."],
      [
        "    def __init__(self, speed=0.4, spawn_every=0.4, length=1.2):",
        "belt speed in m/s, seconds between parts and belt length in m.",
      ],
      ["        super().__init__('belt_sim')", "name the node."],
      [
        "        self.speed, self.spawn_every, self.length, self.parts, self.since = speed, spawn_every, length, [], 0.0",
        "settings, the parts (x, y) list and time since the last spawn.",
      ],
      [
        "        self.pub = self.create_publisher(PoseArray, 'parts', 10)",
        "where part poses are published.",
      ],
      ["        self.create_timer(0.01, self.step)", "run the simulation at 100 Hz."],
      ["", ""],
      ["    def step(self):", "advance the belt by one 10 ms tick."],
      ["        dt = 0.01", "the tick length in seconds."],
      [
        "        self.parts = [(x + self.speed * dt, y) for x, y in self.parts if x < self.length]",
        "move every part downstream and drop those past the end.",
      ],
      ["        self.since += dt", "count the time since the last spawn."],
      ["        if self.since >= self.spawn_every:", "time for a new part."],
      [
        "            self.parts.append((0.0, random.uniform(-0.1, 0.1)))",
        "at the belt start with a random lateral offset of up to 10 cm.",
      ],
      ["            self.since = 0.0", "restart the spawn timer."],
      ["        msg = PoseArray()", "build the message."],
      [
        "        msg.header.stamp = self.get_clock().now().to_msg()",
        "stamp with the current (simulated) time.",
      ],
      ["        msg.header.frame_id = 'belt'", "poses are given in the belt frame."],
      ["        for x, y in self.parts:", "one pose per part."],
      ["            p = Pose(); p.position.x, p.position.y = x, y", "position on the belt."],
      ["            msg.poses.append(p)", "add it to the array."],
      ["        self.pub.publish(msg)", "send all parts to the tracking node."],
    ),
    walk: [
      "All physics is one line: x increases by speed times dt, which makes the belt exact and repeatable.",
      "The header stamp lets downstream nodes practise the same age checks they use with the real camera.",
      "Random offsets exercise the robot's lateral reach, not only the straight-ahead case.",
    ],
    expect: [
      "Parts appear at the belt start, travel at 0.4 m/s and disappear at 1.2 m.",
      "The number of parts on the belt stays near 7 at 0.4 s spawn spacing.",
    ],
    fix: [
      [
        "Parts move at the wrong speed.",
        "The timer is not running at 100 Hz, so use the real elapsed time from the clock instead of a constant dt.",
      ],
      [
        "Nodes complain about time going backwards.",
        "use_sim_time is set for some nodes but not all. Set it consistently.",
      ],
    ],
    exercise:
      "Add Gaussian noise of 1 mm and a 50 ms delay to the published poses to imitate a vision system and test how the pick logic copes.",
    checklist: [
      "Speed and spawn rate are parameters",
      "Poses carry timestamps",
      "Noise and delay imitate the real system",
    ],
  }),
  lesson({
    title: "Vision + tracking nodes",
    summary:
      "Associate detections between frames to give parts stable IDs and predict their future positions.",
    goals: [
      "Explain why part IDs are needed",
      "Associate new detections with existing tracks by predicted position",
      "Drop tracks that are lost or already picked",
    ],
    concept: [
      "A camera reports positions frame after frame, but it does not tell which detection is which part. Without IDs the robot may pick the same part twice, or lose a part when two detections swap. A tracker keeps a list of tracks. For each new detection it predicts where each track should be (using the belt speed) and assigns the detection to the nearest track within a gate distance.",
      "New detections that match nothing start new tracks. Tracks not matched for several frames are removed. A track that the robot has picked is marked and kept only until it leaves the field of view, so it is not reported again as a new part. The tracker's output is a list of parts with IDs and predicted positions, which the scheduler uses.",
    ],
    steps: [
      "Predict every track forward by belt speed times the elapsed time.",
      "Match each detection to the nearest predicted track within the gate distance.",
      "Create tracks for unmatched detections.",
      "Delete tracks unmatched for five frames.",
    ],
    example: hash(
      ["import math", "for distances."],
      ["", ""],
      ["class Tracker:", "keeps part IDs stable across frames."],
      [
        "    def __init__(self, belt_v, gate=15.0, max_misses=5):",
        "belt speed in mm/s, matching distance in mm, frames allowed without a match.",
      ],
      [
        "        self.v, self.gate, self.max_misses, self.tracks, self.next_id = belt_v, gate, max_misses, {}, 1",
        "settings and the dictionary of tracks.",
      ],
      ["", ""],
      [
        "    def update(self, detections, dt):",
        "process one frame of (x, y) detections taken dt seconds after the previous one.",
      ],
      [
        "        for t in self.tracks.values():",
        "move every track forward to where the belt has taken it.",
      ],
      ["            t['x'] += self.v * dt", "predicted position."],
      ["            t['misses'] += 1", "assume it is missing until a detection matches it."],
      ["        for x, y in detections:", "match each detection."],
      [
        "            best = min(self.tracks.values(), key=lambda t: math.dist((x, y), (t['x'], t['y'])), default=None)",
        "the closest predicted track.",
      ],
      [
        "            if best and math.dist((x, y), (best['x'], best['y'])) <= self.gate:",
        "close enough to be the same part.",
      ],
      [
        "                best.update(x=x, y=y, misses=0)",
        "update the track with the measured position.",
      ],
      ["            else:", "nothing matches: this is a new part."],
      [
        "                self.tracks[self.next_id] = {'x': x, 'y': y, 'misses': 0, 'picked': False}",
        "start a track.",
      ],
      ["                self.next_id += 1", "the next ID."],
      [
        "        self.tracks = {i: t for i, t in self.tracks.items() if t['misses'] <= self.max_misses}",
        "forget tracks that have been unmatched too long.",
      ],
      ["        return self.tracks", "the current parts with their IDs."],
    ),
    walk: [
      "Predicting first makes matching robust when the belt moves parts many millimetres between frames.",
      "The gate distance stops a detection from being glued to a far-away track.",
      "The miss counter gives short dropouts a chance to recover without creating duplicate IDs.",
    ],
    expect: [
      "The same physical part keeps the same ID over many frames.",
      "A part missed for two frames is still tracked; after five frames its track disappears.",
    ],
    fix: [
      [
        "IDs keep changing.",
        "The gate is too small for the belt movement or the belt speed is wrong. Measure the speed and set the gate to about half the part spacing.",
      ],
      [
        "Two parts are merged into one track.",
        "Parts are closer than the gate. Reduce the gate or use extra features like colour to match.",
      ],
    ],
    exercise:
      "Feed the tracker with the simulated belt's detections plus 3 mm noise and report ID switches over 1,000 frames.",
    checklist: [
      "Belt speed is used for prediction",
      "The gate is smaller than the part spacing",
      "Picked and lost parts are handled",
    ],
  }),
  lesson({
    title: "Real-time control loops",
    summary: "Run a control loop with a fixed period using real-time scheduling and locked memory.",
    goals: [
      "Explain jitter and why a delta needs a real-time loop",
      "Configure a thread for real-time priority and locked memory",
      "Use absolute sleeps for a drift-free period",
    ],
    concept: [
      "A delta at 10 g needs commands every millisecond. If a loop iteration is late by even a fraction of a millisecond, the motion becomes rough and the platform vibrates. A normal Linux thread can be delayed by other processes and by page faults. A real-time thread uses a fixed-priority scheduler (SCHED_FIFO) and memory locked into RAM, so neither the scheduler nor the memory system stalls it.",
      "The timing itself should use absolute wake-up times: compute the next wake-up as the previous one plus the period, and sleep until that moment. A relative sleep of 1 ms after work that takes 0.1 ms would produce an average period of 1.1 ms. Inside the loop there should be no allocations, no blocking I/O and no logging that can block.",
    ],
    steps: [
      "Install a real-time kernel or enable the PREEMPT_RT features on the control PC.",
      "Give the control thread SCHED_FIFO priority and lock memory.",
      "Use clock_nanosleep with an absolute time for the loop period.",
      "Measure the loop jitter over 10 minutes and record the maximum.",
    ],
    example: cpp(
      ["#include <pthread.h>", "thread scheduling functions."],
      ["#include <sys/mman.h>", "memory locking."],
      ["#include <time.h>", "clocks and absolute sleeps."],
      ["", ""],
      ["void control_thread() {", "runs the 1 kHz loop."],
      ["  sched_param p{}; p.sched_priority = 80;", "a high real-time priority (1-99)."],
      [
        "  pthread_setschedparam(pthread_self(), SCHED_FIFO, &p);",
        "switch this thread to first-in-first-out real-time scheduling.",
      ],
      [
        "  mlockall(MCL_CURRENT | MCL_FUTURE);",
        "lock all memory in RAM so page faults cannot stall the loop.",
      ],
      [
        "  timespec next; clock_gettime(CLOCK_MONOTONIC, &next);",
        "start from the current time on a clock that never jumps.",
      ],
      ["  while (running) {", "the periodic loop."],
      [
        "    next.tv_nsec += 1'000'000;",
        "the next wake-up is 1 ms after the previous one, not after 'now'.",
      ],
      [
        "    if (next.tv_nsec >= 1'000'000'000) { next.tv_nsec -= 1'000'000'000; ++next.tv_sec; }",
        "keep the nanoseconds in range.",
      ],
      [
        "    clock_nanosleep(CLOCK_MONOTONIC, TIMER_ABSTIME, &next, nullptr);",
        "sleep until exactly that absolute time.",
      ],
      ["    control_step();", "read sensors, compute, write commands: no allocation, no blocking."],
      ["  }", "end of the loop."],
      ["}", "end of the thread function."],
    ),
    walk: [
      "Absolute wake-up times remove accumulated drift, so the loop stays at 1000 Hz on average.",
      "mlockall avoids the worst source of latency spikes: a page fault while the loop is running.",
      "control_step() must be short and deterministic; anything that can block belongs in another thread.",
    ],
    expect: [
      "The measured period is 1 ms with a maximum jitter well below 100 microseconds on a tuned system.",
      "Removing the real-time settings shows occasional spikes of several milliseconds.",
    ],
    fix: [
      [
        "pthread_setschedparam fails.",
        "The process lacks permission. Grant the user real-time limits (rtprio) or run with the required capability.",
      ],
      [
        "Spikes appear under load.",
        "Other tasks share the core. Isolate a CPU core for the loop, move interrupts away from it and use a real-time kernel.",
      ],
    ],
    exercise:
      "Write a test that records the actual wake-up time of 100,000 iterations and prints the mean, the standard deviation and the maximum lateness.",
    checklist: [
      "The thread uses real-time priority",
      "Memory is locked",
      "No allocations or blocking calls in the loop",
    ],
  }),
  lesson({
    title: "ROS 2 control tuning",
    summary: "Tune the joint controller's gains for the delta's motors from a step response.",
    goals: [
      "Set the gains in a joint trajectory controller",
      "Tune from a step response in a safe order",
      "Check the result with path tracking, not only steps",
    ],
    concept: [
      "The joint trajectory controller can run its own feedback loop on the position error and command effort or velocity. Its gains are given per joint in the parameter file: p reacts to the error, i removes the steady-state error and d damps. The tuning order is the same as on any servo: raise p until the step response is fast, add d to remove overshoot and add a very small i last.",
      "For fast robots such as a delta, tune with the real payload, since the response changes with mass. Test with steps of several sizes, then with a real path, because a controller that is good for steps can still track a fast path poorly. Log the error signals so that the tuning is based on numbers, and keep a record of the accepted values.",
    ],
    steps: [
      "Set p small and command a 0.1 rad step on one joint.",
      "Increase p until the response is fast but starts to oscillate, then reduce it by 30 %.",
      "Add d to remove the overshoot.",
      "Add a small i if a steady error remains and test with a full pick path.",
    ],
    example: hash(
      ["delta_controller:", "controller name."],
      ["  ros__parameters:", "the parameter section."],
      ["    joints: [motor_1, motor_2, motor_3]", "the three motors."],
      [
        "    command_interfaces: [effort]",
        "the controller commands torque, so the gains define the behaviour.",
      ],
      ["    state_interfaces: [position, velocity]", "feedback needed for the P and D terms."],
      ["    gains:", "per-joint feedback gains."],
      [
        "      motor_1: {p: 80.0, i: 0.5, d: 3.0, i_clamp: 5.0}",
        "p sets the stiffness, d the damping, i removes a steady offset and i_clamp limits windup.",
      ],
      [
        "      motor_2: {p: 80.0, i: 0.5, d: 3.0, i_clamp: 5.0}",
        "the arms are identical, so they share the same values.",
      ],
      [
        "      motor_3: {p: 80.0, i: 0.5, d: 3.0, i_clamp: 5.0}",
        "keep all three the same, or the platform will tilt in feel.",
      ],
      ["    constraints:", "tolerances for accepting a move."],
      ["      goal_time: 0.2", "arrive and settle within 0.2 s of the last point."],
      ["      motor_1: {trajectory: 0.02, goal: 0.002}", "path and goal tolerances in radians."],
    ),
    walk: [
      "Effort commands make the gains meaningful: p is torque per radian of error.",
      "The clamp on the integral prevents a long, small error from building a large torque.",
      "Tolerances tell the action interface when a move counts as arrived, so they must be consistent with the gains.",
    ],
    expect: [
      "A 0.1 rad step settles in a few tens of milliseconds with less than 10 % overshoot.",
      "Tracking error along a fast pick path stays within the trajectory tolerance.",
    ],
    fix: [
      [
        "The motors hum or buzz.",
        "d is too high or the velocity signal is noisy. Lower d or filter the velocity.",
      ],
      [
        "Tuning is good empty but poor with parts.",
        "The payload changes the dynamics. Tune with the heaviest payload, or schedule gains by payload.",
      ],
    ],
    exercise:
      "Record step responses for three values of p and print rise time and overshoot for each in a table.",
    checklist: [
      "Tuning follows p, then d, then i",
      "The real payload is used",
      "Accepted gains are recorded",
    ],
  }),
  lesson({
    title: "Safety monitoring",
    summary:
      "Monitor speed and position limits in software and raise a fault that stops the application, as a layer above the certified safety system.",
    goals: [
      "Explain the layers of safety in a cell",
      "Write a monitor that checks joint speeds against limits",
      "Publish a fault and react in the supervisor",
    ],
    concept: [
      "Safety has layers. The bottom layer is the certified safety system: emergency stops, safety-rated speed monitoring and guarding. Above it sits software monitoring, which catches problems earlier and more gently: a joint moving faster than expected, a position outside the planned area, a controller not responding. Software monitoring reduces trips of the safety system but never replaces it.",
      "A monitor node subscribes to the joint states, compares them with limits and publishes a fault flag. The supervisor reacts to the fault by stopping new motion, moving to a safe pose if possible and reporting to the operator. The monitor must itself be watched: if its heartbeat stops, the supervisor treats that as a fault.",
    ],
    steps: [
      "Set speed and position limits slightly inside the certified limits.",
      "Subscribe to joint states and compare every message with the limits.",
      "Publish a fault and a reason when a limit is exceeded.",
      "Publish a heartbeat and make the supervisor treat a missing heartbeat as a fault.",
    ],
    example: hash(
      ["import rclpy", "the ROS 2 Python client library."],
      ["from rclpy.node import Node", "base class of all nodes."],
      ["from sensor_msgs.msg import JointState", "input: measured joint states."],
      ["from std_msgs.msg import String, Bool", "outputs: fault reason and heartbeat."],
      ["", ""],
      ["SPEED_LIMIT = 20.0", "software speed limit in rad/s, set below the certified limit."],
      ["", ""],
      ["class Monitor(Node):", "watches the robot's joint states."],
      ["    def __init__(self):", "set up the topics."],
      ["        super().__init__('safety_monitor')", "name the node."],
      [
        "        self.fault = self.create_publisher(String, 'monitor_fault', 10)",
        "publishes the reason when something is wrong.",
      ],
      [
        "        self.beat = self.create_publisher(Bool, 'monitor_heartbeat', 10)",
        "proves that the monitor itself is alive.",
      ],
      [
        "        self.create_subscription(JointState, 'joint_states', self.on_state, 10)",
        "listen to the joint states.",
      ],
      [
        "        self.create_timer(0.1, lambda: self.beat.publish(Bool(data=True)))",
        "send a heartbeat ten times a second.",
      ],
      ["", ""],
      ["    def on_state(self, msg):", "called for every joint state message."],
      ["        for name, v in zip(msg.name, msg.velocity):", "check each joint."],
      ["            if abs(v) > SPEED_LIMIT:", "faster than the software limit."],
      [
        "                self.fault.publish(String(data=f'{name} speed {v:.1f} rad/s above limit'))",
        "publish a fault with the joint and the value.",
      ],
    ),
    walk: [
      "The limit is lower than the certified one, so the software reacts before the safety system has to.",
      "The reason text tells the operator which joint and value caused the fault.",
      "The heartbeat lets a supervisor detect a crashed monitor, which would otherwise look like a healthy system.",
    ],
    expect: [
      "In normal motion no fault is published and the heartbeat arrives at 10 Hz.",
      "A simulated joint speed of 25 rad/s produces a fault message naming the joint.",
    ],
    fix: [
      [
        "The monitor triggers on start-up.",
        "The first messages carry stale velocities. Ignore messages during the first second, or filter with a short median.",
      ],
      [
        "The team treats the monitor as the safety function.",
        "It is not. Only certified hardware protects people. The monitor supports the process.",
      ],
    ],
    exercise:
      "Add a position-envelope check and a timeout fault when joint states stop arriving for 200 ms.",
    checklist: [
      "The software limits sit inside the certified limits",
      "The monitor has a heartbeat",
      "Certified hardware remains the safety function",
    ],
  }),
  lesson({
    title: "Full packaging line project",
    summary:
      "Describe a whole packaging line as configuration and check its capacity before building it.",
    goals: [
      "Describe stations, belts and robots as configuration data",
      "Check that the line can reach the target rate",
      "Keep line configuration out of the code",
    ],
    concept: [
      "A packaging line is a set of stations connected by belts: infeed, one or more robot stations, a reject station and the outfeed. Each station has a rate, each belt has a speed and each robot a cycle time. Writing this down as configuration lets you check the capacity of the line before any hardware exists and lets the same code run different lines.",
      "The capacity of the line is limited by its slowest element. A validation script reads the configuration, computes the capacity of each station, compares them with the target rate and reports the bottleneck. The same configuration file also parameterises the ROS 2 launch files, the simulated belt and the dashboards, so the description exists only once.",
    ],
    steps: [
      "Write the line configuration with the infeed rate, robots and target rate.",
      "Compute the capacity of each station.",
      "Find the bottleneck and check the utilisation.",
      "Use the same file to configure the simulation and the launch files.",
    ],
    example: hash(
      ["line:", "the description of one packaging line."],
      ["  target_rate_ppm: 240", "products per minute the line must achieve."],
      ["  infeed:", "the belt that brings the products."],
      ["    speed_mm_s: 400", "belt speed."],
      ["    max_ppm: 300", "the most products per minute the infeed can deliver."],
      ["  robots:", "the pick and place stations along the belt."],
      [
        "    - {name: delta_1, cycle_s: 0.5, efficiency: 0.85}",
        "the first robot: 0.5 s cycle, 85 % of picks succeed in time.",
      ],
      ["    - {name: delta_2, cycle_s: 0.5, efficiency: 0.85}", "the second robot."],
      ["    - {name: delta_3, cycle_s: 0.5, efficiency: 0.85}", "the third robot."],
      ["  outfeed:", "the belt that takes the packed cartons away."],
      ["    max_ppm: 260", "the most cartons per minute it can carry."],
      ["  reject:", "the reject station."],
      ["    max_ppm: 30", "the most rejects per minute it can handle."],
    ),
    walk: [
      "Every number in the file has a unit in its name, so a wrong unit is easy to spot in review.",
      "The three robots together give 3 × 102 = 306 products per minute, more than the target of 240.",
      "The outfeed limit of 260 is the true bottleneck: it is only 8 % above the target, which leaves little headroom.",
    ],
    expect: [
      "A validation script reports the capacity of each station and names the outfeed as the bottleneck.",
      "Changing target_rate_ppm to 280 makes the script report that the line cannot reach it.",
    ],
    fix: [
      [
        "The line reaches the rate on paper but not in practice.",
        "Efficiency is too optimistic or an availability figure is missing. Measure real values and update the file.",
      ],
      [
        "The simulation and the launch files differ from the file.",
        "Something was hard-coded. Read all numbers from the configuration file.",
      ],
    ],
    exercise:
      "Write a Python script that reads this YAML file, prints each station's capacity, lists the bottleneck and returns a non-zero exit code when the target rate is not met.",
    checklist: [
      "Capacities are checked before building",
      "All numbers live in one configuration file",
      "The bottleneck is named and understood",
    ],
  }),
];
