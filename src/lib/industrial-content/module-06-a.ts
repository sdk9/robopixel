import { hash, cpp, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 06 · Collaborative Robot (Cobot) — lessons 1–15 (Safety & Interaction, then Control & Applications)
export const module06a: LessonSpec[] = [
  lesson({
    title: "ISO 15066",
    summary:
      "Understand power and force limiting and compute a speed limit from the allowed contact force.",
    goals: [
      "Name the four collaborative operation modes",
      "Explain the transient contact model of ISO/TS 15066",
      "Compute a maximum speed from an allowed force, a body stiffness and the effective masses",
    ],
    concept: [
      "ISO/TS 15066 (whose content is being absorbed into the revised ISO 10218 series; always check the current edition) describes four ways of working safely with a robot near people: safety-rated monitored stop, hand guiding, speed and separation monitoring, and power and force limiting (PFL). A cobot is normally used in PFL, where contact with a person is allowed but the force and pressure must stay below limits that depend on the body region.",
      "For a transient contact the standard gives a model: the maximum relative speed is v = F_max / √(k · μ). F_max is the allowed force for the body region, k the effective stiffness of that region (N/m) and μ the reduced mass of the human body part and the robot, 1/μ = 1/m_H + 1/(M + m_L). A heavier robot or load lowers the allowed speed. The real limits come from the standard's tables and from measuring the actual application, not from a calculation alone.",
    ],
    steps: [
      "Find the allowed force and stiffness for the body region in the current standard.",
      "Compute the reduced mass from the human body part's mass and the robot's effective mass.",
      "Compute the maximum relative speed.",
      "Verify the result by measuring the real contact force with a calibrated force and pressure measuring device.",
    ],
    example: hash(
      ["import math", "for the square root."],
      ["", ""],
      [
        "def max_speed(f_max, k, m_human, m_robot, m_load):",
        "highest allowed relative speed in m/s for a transient contact.",
      ],
      [
        "    mu = 1.0 / (1.0 / m_human + 1.0 / (m_robot + m_load))",
        "reduced mass of the two bodies that collide.",
      ],
      ["    return f_max / math.sqrt(k * mu)", "the standard's model: v = F / sqrt(k * mu)."],
      ["", ""],
      [
        "# ILLUSTRATIVE numbers only. Take real values from the current standard.",
        "the limits depend on the body region and on the edition of the standard.",
      ],
      [
        "v = max_speed(f_max=140.0, k=75_000.0, m_human=0.6, m_robot=8.0, m_load=1.0)",
        "140 N allowed, 75 N/mm stiffness, 0.6 kg body part, 8 kg robot and 1 kg load.",
      ],
      ["print(round(v, 2), 'm/s')", "prints 0.68 m/s."],
      [
        "print(round(max_speed(140.0, 75_000.0, 0.6, 8.0, 10.0), 2), 'm/s')",
        "a ten times heavier load: prints only 0.67 m/s, because the human mass dominates.",
      ],
    ),
    walk: [
      "The reduced mass is dominated by the smaller of the two masses, which is why the human body part matters so much.",
      "The result is a limit on relative speed of the contact, so it must include the speed of the person, too.",
      "The standard's numbers are tabulated per body region, and a hand needs different limits from the chest or the head.",
    ],
    expect: [
      "The script prints 0.68 m/s and then 0.67 m/s for the illustrative values.",
      "Doubling the allowed force doubles the allowed speed, but doubling the stiffness lowers it by about 30 %.",
    ],
    fix: [
      [
        "The calculation allows a speed that hurts in a test.",
        "The model is only a first estimate. Measure the real contact force with a calibrated measuring device and reduce the speed until it passes.",
      ],
      [
        "The team treats the calculation as the certification.",
        "The risk assessment and measurements are what count. Use the calculation only to set a starting value.",
      ],
    ],
    exercise:
      "Compute the maximum speed for three body regions with different force and stiffness values from the standard and tabulate the results.",
    checklist: [
      "Values come from the current standard",
      "The body region is named for every limit",
      "Limits are verified by measurement",
    ],
  }),
  lesson({
    title: "Force limits",
    summary:
      "Configure a force limit before the robot enters the shared workspace, and complete the interactive cobot lab.",
    goals: [
      "Explain why the force limit must be set first",
      "Enforce the order 'limit before motion' in code",
      "Complete the lab by adding the missing force-limit command",
    ],
    concept: [
      "A collaborative robot's force limit is a protective parameter: it defines the contact force at which the robot stops. If motion starts before the limit is set, the robot works with its default, which may be higher than what the risk assessment allows. So the program must set the limit first, confirm that it was accepted, and refuse any motion command until then.",
      "The limit is chosen from the risk assessment for the task and the body regions at risk, and different phases may use different limits: a low limit while working near a person and a higher one inside a fenced, empty area. Changing the limit at runtime is a safety-relevant action and should be logged. Some controllers require a safety configuration checksum for such changes, which the application must not bypass.",
    ],
    steps: [
      "Open the Robot Code Lab below and read the mission and the notes under every command.",
      "Type the missing command on the marked empty line, then press Run program and watch the cobot.",
      "In your own code make every move command check that the force limit is set.",
      "Log every change of the limit with the time and the reason.",
    ],
    example: hash(
      ["class Cobot:", "a thin wrapper that refuses motion until a force limit is set."],
      ["    def __init__(self, driver):", "driver talks to the real or simulated robot."],
      ["        self.driver, self.limit_n = driver, None", "no limit set yet."],
      ["", ""],
      [
        "    def set_force_limit(self, newtons):",
        "set the contact force at which the robot stops.",
      ],
      [
        "        if not 0.0 < newtons <= 150.0:",
        "reject values outside the range the risk assessment allows.",
      ],
      [
        "            raise ValueError('force limit outside the allowed range')",
        "refuse instead of clamping silently.",
      ],
      ["        self.driver.write('force_limit', newtons)", "send it to the robot."],
      [
        "        if self.driver.read('force_limit') != newtons:",
        "read it back to be sure it was accepted.",
      ],
      [
        "            raise RuntimeError('robot did not accept the force limit')",
        "a failed change is a fault.",
      ],
      ["        self.limit_n = newtons", "remember it."],
      [
        "        print(f'force limit set to {newtons} N')",
        "log the change (a real system writes to a persistent log).",
      ],
      ["", ""],
      ["    def move(self, target):", "any motion command."],
      ["        if self.limit_n is None:", "the limit has not been set yet."],
      [
        "            raise RuntimeError('set the force limit before moving')",
        "no motion without a limit.",
      ],
      ["        self.driver.move(target)", "now the move is allowed."],
    ),
    walk: [
      "The range check and the read-back make sure that the value the robot uses is the value that was intended.",
      "move() refuses to run without a limit, so forgetting the first line of the program is caught immediately.",
      "The log line is a placeholder for a persistent, timestamped record of every change.",
    ],
    expect: [
      "Calling move() before set_force_limit() raises an error and nothing moves.",
      "set_force_limit(20) succeeds, prints the message and enables all later moves.",
    ],
    fix: [
      [
        "The limit is set but the robot still pushes hard.",
        "The limit applies to the robot's own estimate of the force, which has an error. Verify with a measuring device.",
      ],
      [
        "The controller rejects the new limit.",
        "Safety-configuration changes may need a password or a checksum confirmation. Follow the vendor's procedure; never bypass it.",
      ],
    ],
    exercise:
      "Set the force limit before entering the shared workspace and stack the blue block. Then add a rule that lowers the limit to 10 N whenever a person is detected within 1 m.",
    checklist: [
      "The limit is set before any motion",
      "The set value is read back",
      "Every change is logged",
    ],
    lab: "06-collaborative-robot",
  }),
  lesson({
    title: "Torque sensing",
    summary:
      "Estimate the external force on the tool from joint torque sensors and the dynamic model.",
    goals: [
      "Explain how joint torque sensors detect contact",
      "Compute the external joint torque from measured and model torque",
      "Convert it to a Cartesian force with the Jacobian",
    ],
    concept: [
      "Many cobots have a torque sensor in every joint. The sensor measures the torque transmitted through the joint. The dynamic model predicts the torque needed for the motion and for gravity. The difference, the external torque, is caused by contact with something outside the robot: τ_ext = τ_measured − τ_model.",
      "The external joint torque can be turned into a force at the tool with the Jacobian: F = (Jᵀ)⁺ · τ_ext. This is only an estimate. Errors in the model (payload, friction) look like contact, so the estimate has a threshold and a filter, and the payload must be set correctly. It is precisely this estimate that a cobot uses for its collision detection and for hand guiding.",
    ],
    steps: [
      "Read the joint torques and compute the model torque for the current motion.",
      "Subtract to get the external joint torque.",
      "Convert it to a Cartesian force with the Jacobian.",
      "Compare the force with the limit from the previous lesson.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the linear algebra."],
      ["", ""],
      [
        "def external_force(J, tau_measured, tau_model):",
        "estimated force and torque (6 values) acting on the tool.",
      ],
      [
        "    tau_ext = np.asarray(tau_measured, float) - np.asarray(tau_model, float)",
        "torque that the model cannot explain: caused by contact.",
      ],
      [
        "    return np.linalg.pinv(J.T) @ tau_ext",
        "map the joint torques to a force and torque at the tool.",
      ],
      ["", ""],
      ["def too_much(force, limit_n=20.0):", "is the contact force above the limit?"],
      [
        "    return float(np.linalg.norm(force[:3])) > limit_n",
        "compare the size of the force part with the limit.",
      ],
      ["", ""],
      [
        "# J: 6x6 tool Jacobian at the current pose (from the robot model)",
        "the Jacobian changes with the pose.",
      ],
      ["# f = external_force(J, tau_measured, tau_model)", "the estimated tool wrench."],
      ["# if too_much(f): stop_robot()", "react when the limit is exceeded."],
    ),
    walk: [
      "Everything the model explains is removed, so only real contact remains in the result.",
      "The pseudo-inverse of the transposed Jacobian is the standard way to map joint torques to a tool wrench.",
      "The force is only as good as the model, so the payload and the friction terms are part of the safety.",
    ],
    expect: [
      "With no contact and a correct model the estimated force is near zero.",
      "Pressing on the tool makes the estimate grow in the direction of the push.",
    ],
    fix: [
      [
        "The estimate is never zero.",
        "Friction or payload are wrong in the model. Identify the payload and add friction compensation.",
      ],
      [
        "The estimate is noisy.",
        "Filter the torques lightly and use a threshold above the noise level.",
      ],
    ],
    exercise:
      "Push the tool by hand in simulation with a 10 N force in three directions and compare the estimated force with the applied one.",
    checklist: [
      "The payload is set correctly",
      "Torques are filtered lightly",
      "The estimate is compared with a real measurement",
    ],
  }),
  lesson({
    title: "Hand-guiding",
    summary:
      "Move the cobot by hand with an admittance law that has a dead band and a speed limit.",
    goals: [
      "Explain admittance control",
      "Write a velocity command from the measured hand force",
      "Add a dead band and a speed limit",
    ],
    concept: [
      "Hand guiding lets a person teach positions by moving the robot by hand. It uses admittance control: the measured force from the hand becomes a velocity command, v = F / D, where D is a virtual damping. A large D makes the robot feel heavy and slow, a small D makes it light and fast.",
      "A dead band ignores small forces (noise and slight touches), so the robot does not drift. A speed limit keeps the motion safe whatever the force. Hand guiding needs an enabling device, so that the robot only moves while the person is holding it deliberately, and releasing it stops the motion. The reduced speed limit (typically 250 mm/s) applies.",
    ],
    steps: [
      "Read the force from the sensor and remove the tool's weight.",
      "Apply a 3 N dead band.",
      "Divide by the damping to get a velocity, and clip it to the speed limit.",
      "Stop at once when the enabling device is released.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "def admittance(force, enabled, damping=60.0, dead=3.0, v_max=0.25):",
        "tool velocity (m/s) for a measured hand force (N).",
      ],
      ["    if not enabled:", "the enabling device is not held."],
      ["        return np.zeros(3)", "no motion."],
      ["    f = np.asarray(force, float)", "the force as a vector."],
      ["    mag = np.linalg.norm(f)", "its size."],
      ["    if mag <= dead:", "inside the dead band: ignore noise and light touches."],
      ["        return np.zeros(3)", "no motion."],
      ["    direction = f / mag", "the direction of the push."],
      [
        "    speed = min((mag - dead) / damping, v_max)",
        "speed grows with the force above the dead band, and is limited to 0.25 m/s.",
      ],
      ["    return direction * speed", "the velocity command."],
      ["", ""],
      [
        "print(admittance([2, 0, 0], True), admittance([15, 0, 0], True), admittance([100, 0, 0], True))",
        "prints zero, 0.2 m/s along x and the limit 0.25 m/s.",
      ],
    ),
    walk: [
      "Subtracting the dead band makes the motion start smoothly instead of jumping to a minimum speed.",
      "The clip at the end makes the speed limit independent of how hard the person pushes.",
      "Passing 'enabled' into the function makes the enabling device part of every call, not an afterthought.",
    ],
    expect: [
      "2 N gives no motion, 15 N gives 0.2 m/s and 100 N gives the 0.25 m/s limit.",
      "Releasing the enabling device gives zero velocity immediately, whatever the force.",
    ],
    fix: [
      [
        "The robot drifts on its own.",
        "The tool weight is not removed from the force reading. Calibrate the payload and tare the sensor.",
      ],
      ["Guiding feels heavy.", "The damping is too high. Lower it, but keep the speed limit."],
    ],
    exercise:
      "Add a variable damping that is higher near the workspace boundary so the robot feels heavier when it approaches a limit.",
    checklist: [
      "An enabling device is required",
      "A dead band and speed limit are set",
      "The payload is compensated",
    ],
  }),
  lesson({
    title: "Safe zones",
    summary:
      "Gate new motion by the state of a protected zone and by a conservative training speed limit.",
    goals: [
      "Document that collaboration requires an application risk assessment",
      "Block goals when the zone is occupied or the state is unknown",
      "Test that blocked commands produce no action goal",
    ],
    concept: [
      "A cobot cell has zones: an area where the robot works at normal collaborative limits and an area (or a state) where a person is in a protected position and the robot must not move at all. The application reads a zone-clear signal and refuses new goals while it is false. A missing or stale signal must be treated as 'blocked', because a lost sensor must never look like a free zone.",
      "This code is application-level training code and not a safety function. Real protective separation is done by validated safety equipment: safety-rated scanners, safety controllers and the robot's own safety functions. The application can additionally validate speed against a conservative limit and log every blocked request, which makes commissioning and audits much easier.",
    ],
    steps: [
      "Document that collaboration requires an application risk assessment.",
      "Subscribe to a simulated protected-zone state and gate new goals.",
      "Validate speed against a conservative training limit.",
      "Record blocked requests and test recovery after the zone clears.",
    ],
    example: cpp(
      [
        "bool command_allowed(double speed) const {",
        "a read-only check (const) that decides whether a motion request may proceed.",
      ],
      [
        "  return zone_clear_.load(std::memory_order_acquire) &&",
        "read the protected-zone flag safely across threads; the zone must be clear...",
      ],
      [
        "         speed >= 0.0 && speed <= training_speed_limit_;",
        "...and the speed must be non-negative and not above the conservative training limit.",
      ],
      [
        "}",
        "end of the check; if the zone state was never received, the flag stays false and the command is blocked.",
      ],
      [
        "void request_motion(const MotionRequest & request) {",
        "entry point for a motion request from elsewhere in the program.",
      ],
      [
        "  if (!command_allowed(request.speed)) {",
        "run the gate; enter this block if the command is not allowed.",
      ],
      [
        '    RCLCPP_WARN(get_logger(), "motion blocked"); return;',
        "log that the motion was blocked, then leave without sending anything.",
      ],
      ["  }", "end of the blocked branch."],
      [
        "  motion_client_->async_send_goal(to_goal(request));",
        "only allowed requests reach here: convert the request into an action goal and send it without blocking.",
      ],
      ["}", "end of the function."],
    ),
    walk: [
      "The atomic flag can be written by the zone subscriber and read by the motion code without a lock.",
      "The default value of the flag is false, so a missing signal blocks motion, which is the safe failure.",
      "Blocked requests are logged, which gives commissioning a clear record of what the gate refused.",
    ],
    expect: [
      "With the zone clear and a speed within the limit, an action goal is sent.",
      "With the zone occupied or an over-speed request, no action goal is produced.",
    ],
    fix: [
      [
        "The robot never moves.",
        "The zone flag never became true. Check that the zone topic is published and that the subscriber's QoS matches.",
      ],
      [
        "Someone assumes the gate protects people.",
        "It does not. Only validated safety equipment protects people; this gate is a process layer on top.",
      ],
    ],
    exercise:
      "Create a protected-zone publisher and command gate. Prove that occupied-zone and over-speed requests produce no action goal.",
    checklist: [
      "Missing state defaults to blocked",
      "No safety state comes from UI alone",
      "Blocked commands are logged",
    ],
    source: [
      "ROS 2 security",
      "https://docs.ros.org/en/lyrical/Concepts/Intermediate/About-Security.html",
    ],
  }),
  lesson({
    title: "Speed & separation monitoring",
    summary:
      "Compute the protective separation distance and slow or stop the robot as a person comes closer.",
    goals: [
      "Explain speed and separation monitoring (SSM)",
      "Compute the protective separation distance with its components",
      "Turn the measured distance into a speed limit",
    ],
    concept: [
      "In speed and separation monitoring the robot keeps a distance from a person that depends on their speeds. The protective separation distance is the distance at which the robot must have started to stop, so it is standing still before the person reaches it. It adds up: the distance the person travels during the robot's reaction and stopping time (S_h), the distance the robot travels during its reaction time (S_r), the robot's stopping distance (S_s), the intrusion distance and the position uncertainty of the sensors (C and Z).",
      "The person is assumed to approach at 1.6 m/s as in the standard. The faster the robot moves, the larger the distance, so the robot's allowed speed falls as the person gets closer, down to a protective stop. SSM must be done with safety-rated sensors and controllers. The calculation here shows how the parts add up.",
    ],
    steps: [
      "Measure the robot's reaction time and stopping distance at its working speed.",
      "Add the human approach distance, the robot travel during reaction and the uncertainties.",
      "Compare the measured distance with the separation distance.",
      "Reduce the speed until the separation distance is smaller than the measured one.",
    ],
    example: hash(
      [
        "def separation(v_robot, t_reaction=0.1, t_stop=0.2, stop_dist=0.10, v_human=1.6, c=0.20, z=0.07):",
        "protective separation distance in metres (illustrative values).",
      ],
      [
        "    s_h = v_human * (t_reaction + t_stop)",
        "how far the person moves while the robot reacts and stops.",
      ],
      ["    s_r = v_robot * t_reaction", "how far the robot moves during its reaction time."],
      [
        "    return s_h + s_r + stop_dist + c + z",
        "add the stopping distance, the intrusion distance and the sensor uncertainty.",
      ],
      ["", ""],
      [
        "def speed_limit(distance, v_max=0.5):",
        "highest robot speed for which the measured distance is still enough.",
      ],
      [
        "    while v_max > 0.0 and separation(v_max) > distance:",
        "reduce the speed until the separation fits.",
      ],
      ["        v_max -= 0.05", "in steps of 0.05 m/s."],
      ["    return max(v_max, 0.0)", "zero means a protective stop."],
      ["", ""],
      [
        "print(round(separation(0.5), 2), speed_limit(1.2), speed_limit(0.8))",
        "prints 0.9, then 0.5 (far away) and 0.0 (too close).",
      ],
    ),
    walk: [
      "The person's approach distance (0.48 m here) is the largest term, which is why fast reaction times matter so much.",
      "The robot's own speed only enters through S_r, so slowing down gives a small gain in distance.",
      "This shows the structure of the calculation; the real distances must be measured and validated on the actual robot and sensors.",
    ],
    expect: [
      "The separation for 0.5 m/s is 0.9 m; at 1.2 m the robot may run at full speed and at 0.8 m it must stop.",
      "Halving the reaction time from 0.1 s to 0.05 s reduces the distance by about 0.1 m.",
    ],
    fix: [
      [
        "The robot stops far too often.",
        "The measured stopping time is worse than needed. Measure it and improve reaction times, or accept a larger separation.",
      ],
      [
        "The distance is under-estimated.",
        "Sensor latency and position uncertainty are missing. Include them as C and Z, and verify with tests.",
      ],
    ],
    exercise:
      "Tabulate the separation distance for reaction times of 50, 100 and 200 ms and comment on the layout consequence.",
    checklist: [
      "Times and distances are measured on the real robot",
      "Sensor latency and uncertainty are included",
      "Safety-rated sensors do the monitoring",
    ],
  }),
  lesson({
    title: "Human detection",
    summary:
      "Find the nearest person in a laser scan sector and turn the distance into a speed factor.",
    goals: [
      "Explain how a 2D safety scanner sees a person",
      "Compute the nearest distance in a sector of the scan",
      "Handle invalid readings safely",
    ],
    concept: [
      "A 2D laser scanner mounted at leg height sees the legs of a person as a group of close returns. Cell workflows look at the scan in sectors, for example a warning field and a stop field around the robot, and take the nearest valid range in each sector. Invalid readings (infinite or zero) must not be treated as free space unless the scanner is a certified safety device that reports its own faults.",
      "The distance to the nearest object becomes a speed factor, which the robot's speed limit is multiplied by. Because a scanner sees objects as well as people, the cell may classify what is seen (a moving group of returns is a person, a static return is a fixture). In a real cell, the safety-rated scanner's protective fields do the stopping; the application uses the same information to slow down earlier and more smoothly.",
    ],
    steps: [
      "Split the scan into three sectors: front, left and right.",
      "Take the smallest valid range in each sector.",
      "Compute a speed factor from the smallest distance.",
      "Treat a sector with no valid data as blocked.",
    ],
    example: hash(
      ["import math", "for the angle checks."],
      ["", ""],
      [
        "def nearest(ranges, angle_min, step, lo_deg, hi_deg):",
        "smallest valid range (m) between two angles (degrees) of a laser scan, or None.",
      ],
      ["    best = None", "no valid reading yet."],
      ["    for i, r in enumerate(ranges):", "check every beam."],
      ["        a = math.degrees(angle_min + i * step)", "the beam's angle in degrees."],
      ["        if not (lo_deg <= a <= hi_deg):", "outside the sector."],
      ["            continue", "skip it."],
      [
        "        if not math.isfinite(r) or r <= 0.05:",
        "invalid: infinite, zero or too close to be believable.",
      ],
      [
        "            continue",
        "ignore it here; the caller decides what a sector with no data means.",
      ],
      ["        best = r if best is None else min(best, r)", "keep the smallest valid range."],
      ["    return best", "the nearest object in the sector."],
      ["", ""],
      ["def factor(dist, stop=0.6, slow=1.8):", "speed factor for the nearest distance."],
      ["    if dist is None:", "no valid reading in the sector."],
      ["        return 0.0", "unknown means blocked."],
      [
        "    return 0.0 if dist <= stop else min(1.0, (dist - stop) / (slow - stop))",
        "stop inside 0.6 m, full speed beyond 1.8 m, a ramp in between.",
      ],
    ),
    walk: [
      "A sector with no valid data returns a speed factor of zero, so a blind scanner cannot look like an empty room.",
      "The ramp between the stop and slow distances makes the robot slow down gradually.",
      "The scanner's protective fields still stop the robot by hardware, whatever this function returns.",
    ],
    expect: [
      "A person at 1.2 m in the front sector gives a factor of 0.5.",
      "A fully blocked or invalid sector gives zero.",
    ],
    fix: [
      [
        "The robot slows down for fixtures.",
        "Static returns are treated as people. Subtract a stored map of the fixed scene or use only moving returns.",
      ],
      [
        "The robot does not react to a person.",
        "The person is outside the scanner's plane or hidden behind an obstacle. Add a second scanner or a camera.",
      ],
    ],
    exercise:
      "Build a simulated scan with a person walking across the front sector and plot the speed factor over time.",
    checklist: [
      "Invalid readings do not look like free space",
      "Sectors match the robot's motion",
      "Protective fields stay in certified hardware",
    ],
  }),
  lesson({
    title: "Workspace sharing",
    summary:
      "Coordinate a human and a cobot at a shared workstation with an explicit handover state machine.",
    goals: [
      "Describe the phases of a human-robot handover",
      "Write the handover as a state machine with timeouts",
      "Make every transition depend on a detected condition",
    ],
    concept: [
      "When a person and a cobot share a workstation, the hardest moment is the handover of a part. A safe handover has phases: the robot brings the part to the handover point, waits until the person's hand is there and has grasped the part, releases only after the grasp is confirmed (by force and by the hand's position), and retreats. Releasing too early drops the part; releasing too late stops the person.",
      "A state machine with a timeout for every waiting state makes this reliable. If the person does not take the part within 10 seconds, the robot returns to a safe state instead of waiting forever with an extended arm. Every transition depends on a sensor condition, never only on time, and the robot's speed while the hand is near follows the safe speed limits.",
    ],
    steps: [
      "Draw the states: approach, wait for hand, confirm grasp, release, retreat.",
      "Write the transition conditions from sensors.",
      "Add a timeout to every waiting state.",
      "Test a person who never takes the part.",
    ],
    example: hash(
      ["import time", "for the timeouts."],
      ["", ""],
      ["class Handover:", "the handover of one part from the cobot to a person."],
      [
        "    def __init__(self, robot, timeout=10.0):",
        "the robot interface and the maximum waiting time.",
      ],
      [
        "        self.robot, self.timeout, self.state, self.t0 = robot, timeout, 'approach', time.time()",
        "start with the approach.",
      ],
      ["", ""],
      ["    def step(self):", "call repeatedly; returns the current state."],
      ["        r = self.robot", "a short name for the robot."],
      [
        "        if self.state == 'approach' and r.at_handover_point():",
        "the part has been brought to the handover point.",
      ],
      ["            self.state, self.t0 = 'wait_hand', time.time()", "wait for the person's hand."],
      ["        elif self.state == 'wait_hand' and r.hand_present():", "a hand is near the part."],
      ["            self.state = 'confirm'", "check that it is really holding it."],
      [
        "        elif self.state == 'confirm' and r.pull_force() > 3.0:",
        "the person pulls on the part with more than 3 N.",
      ],
      [
        "            r.open_gripper(); self.state = 'retreat'",
        "release only after the grasp is confirmed by force.",
      ],
      [
        "        elif self.state == 'retreat' and r.at_home():",
        "the arm is back at its safe pose.",
      ],
      ["            self.state = 'done'", "handover complete."],
      [
        "        if self.state in ('wait_hand', 'confirm') and time.time() - self.t0 > self.timeout:",
        "the person did not take the part in time.",
      ],
      [
        "            r.go_home_with_part(); self.state = 'aborted'",
        "return to the safe pose with the part.",
      ],
      ["        return self.state", "the caller can log or display it."],
    ),
    walk: [
      "Release happens only on a force condition, so the part cannot be dropped before the person holds it.",
      "The timeout applies to both waiting states, which prevents the robot from staying extended indefinitely.",
      "'aborted' is a normal, defined outcome, not an exception, so the rest of the program can plan for it.",
    ],
    expect: [
      "A cooperating person completes approach, wait, confirm, retreat and done.",
      "A person who never takes the part leads to 'aborted' after 10 seconds and the robot goes home with the part.",
    ],
    fix: [
      [
        "The robot releases early.",
        "The pull force threshold is too low. Raise it and add a check that the hand is actually near the part.",
      ],
      [
        "Handovers feel slow.",
        "The robot waits after the grasp. Use the pull force directly, with a short debounce, as the release trigger.",
      ],
    ],
    exercise:
      "Add the reverse handover: the person gives the part to the robot, which closes the gripper only after the part is detected between the fingers.",
    checklist: [
      "Every transition depends on a sensor",
      "Waiting states have timeouts",
      "Release requires a confirmed grasp",
    ],
  }),
  lesson({
    title: "Ergonomics",
    summary:
      "Check working height, load and repetition so the shared workstation is comfortable and healthy.",
    goals: [
      "Explain why cobot cells must be designed for the person",
      "Check the height and reach of the handover position",
      "Flag risky load and repetition combinations",
    ],
    concept: [
      "A cobot removes the heavy and repetitive work, but the workstation still has to fit the person. Poor posture, reaching far, lifting above the shoulders or repeating the same movement thousands of times cause injuries even when every safety limit is respected. The handover point, the part presentation and the controls should be at comfortable heights and inside easy reach.",
      "Simple rules help: presentation between elbow and shoulder height (roughly 0.9 to 1.3 m for a standing person), reach within about 0.5 m of the body, low loads and limited repetition per hour. A cell should check its own configuration against such rules and warn the designer. A formal ergonomic assessment (for example EN 1005 or RULA) is done by an expert; this is a first screening.",
    ],
    steps: [
      "List the handover position, the part weight and the cycle rate.",
      "Check the height and the reach against the comfortable range.",
      "Compute the number of repetitions per hour.",
      "Print warnings for anything outside the range.",
    ],
    example: hash(
      [
        "def check(height_m, reach_m, weight_kg, cycles_per_hour):",
        "returns a list of warnings for a workstation setup (a first screening, not an assessment).",
      ],
      ["    warnings = []", "collected warnings."],
      ["    if not 0.9 <= height_m <= 1.3:", "outside the comfortable presentation height."],
      ["        warnings.append('handover height should be about 0.9-1.3 m')", "the reason."],
      ["    if reach_m > 0.5:", "too far from the body."],
      ["        warnings.append('reach above 0.5 m: bring the part closer')", "the reason."],
      ["    if weight_kg > 3.0:", "heavy for repeated handling by hand."],
      ["        warnings.append('part above 3 kg: consider a lift assist')", "the reason."],
      ["    if cycles_per_hour > 600:", "very high repetition."],
      [
        "        warnings.append('over 600 handovers per hour: risk of repetitive strain')",
        "the reason.",
      ],
      ["    return warnings", "empty means nothing to flag."],
      ["", ""],
      [
        "print(check(1.1, 0.4, 1.0, 300), check(0.6, 0.7, 4.0, 900))",
        "the first setup is fine (empty list); the second prints four warnings.",
      ],
    ),
    walk: [
      "Each rule has a clear number and a reason, so a designer can discuss and change it.",
      "The check runs on the configuration, so it can be part of an automated review of every cell layout.",
      "It is a screening tool. A qualified person must perform the actual ergonomic assessment.",
    ],
    expect: [
      "The first call prints [] and the second prints four warnings.",
      "Raising the handover height from 0.6 to 1.0 m removes the height warning.",
    ],
    fix: [
      [
        "Operators still complain of strain.",
        "The rules are a starting point. Observe the real work, involve the operators and have an expert assess the task.",
      ],
      [
        "The cell layout changes often.",
        "Run the check automatically whenever the layout file changes.",
      ],
    ],
    exercise:
      "Add a rule for the operator's height range (1.5 to 1.9 m) by allowing an adjustable handover height and test with three operator heights.",
    checklist: [
      "Handover height and reach are checked",
      "Load and repetition are limited",
      "An expert performs the formal assessment",
    ],
  }),
  lesson({
    title: "Risk assessment",
    summary:
      "Keep a review-ready hazard record and check that every significant hazard has a protective measure that lowers its risk.",
    goals: [
      "Structure a cobot risk assessment as data",
      "Verify that each high risk has a measure and a lower residual risk",
      "Understand that the assessment belongs to the application, not the robot",
    ],
    concept: [
      "A cobot is not 'safe' by itself: safety belongs to the whole application, including the tool, the part, the speed, the layout and the people. A risk assessment lists the hazards of the task (a sharp tool, a pinch point between the arm and a fixture, a falling part), rates them, states the protective measures and re-rates the residual risk. ISO 12100 gives the process and ISO 10218 and ISO/TS 15066 add the robot-specific parts.",
      "Keeping the assessment as structured data lets a script check it: every hazard has a severity and a likelihood, every hazard above the acceptable score has at least one measure, and the residual score after the measures is lower than before. The script cannot judge whether the ratings are right, which is the work of the assessment team; it makes sure that the record is complete and consistent.",
    ],
    steps: [
      "List the hazards of the application, including the tool and the part.",
      "Rate severity and likelihood before any measure.",
      "Add the measures and rate the residual risk.",
      "Run the consistency check and have the team review the record.",
    ],
    example: hash(
      [
        "HAZARDS = [",
        "the assessment record: hazard, severity, likelihood, measures, residual severity, residual likelihood.",
      ],
      [
        "    {'name': 'pinch between arm and fixture', 'sev': 3, 'lik': 3, 'measures': ['1 cm minimum gap', 'force limit 20 N'], 'rsev': 3, 'rlik': 1},",
        "a moderate injury, likely before the measures and unlikely after them.",
      ],
      [
        "    {'name': 'sharp screwdriver bit', 'sev': 3, 'lik': 2, 'measures': [], 'rsev': 3, 'rlik': 2},",
        "a hazard with no measure recorded.",
      ],
      ["]", "end of the record."],
      ["", ""],
      ["def review(hazards, acceptable=6):", "list the problems in the assessment record."],
      ["    issues = []", "collected issues."],
      ["    for h in hazards:", "check every hazard."],
      [
        "        score, residual = h['sev'] * h['lik'], h['rsev'] * h['rlik']",
        "the risk score before and after the measures.",
      ],
      [
        "        if score > acceptable and not h['measures']:",
        "a significant risk with no protective measure.",
      ],
      ["            issues.append(f\"{h['name']}: score {score} has no measure\")", "report it."],
      ["        if h['measures'] and residual >= score:", "measures that do not lower the risk."],
      [
        "            issues.append(f\"{h['name']}: measures do not reduce the risk\")",
        "report it.",
      ],
      ["        if residual > acceptable:", "the risk after the measures is still too high."],
      [
        "            issues.append(f\"{h['name']}: residual risk {residual} above {acceptable}\")",
        "report it.",
      ],
      ["    return issues", "an empty list means the record is consistent."],
      ["", ""],
      [
        "print(review(HAZARDS))",
        "prints [] because both scores are at or below 6 (9 and 1 for the pinch, 6 for the bit).",
      ],
    ),
    walk: [
      "The check tests completeness and logic, and leaves the judgement about the numbers to the people.",
      "The sharp bit has a score of 6, exactly the acceptable limit, which is a reason to discuss it, not to ignore it.",
      "Measures are recorded as text so that each one can be traced to a test in the commissioning plan.",
    ],
    expect: [
      "The script prints an empty list for the example record.",
      "Raising the sharp bit's likelihood to 3 makes the script report a score of 9 with no measure.",
    ],
    fix: [
      [
        "The team argues about the numbers.",
        "That is the useful part. Write down the reasoning next to each rating so the decision can be reviewed.",
      ],
      [
        "The cell changed after the assessment.",
        "Any change of tool, part, speed or layout needs a new assessment. Version the record with the cell configuration.",
      ],
    ],
    exercise:
      "Add three more hazards (a falling part, a trapped finger in the gripper, cable snagging) and complete their measures and residual risks.",
    checklist: [
      "Hazards include the tool and the part",
      "Every significant risk has a measure",
      "The assessment is versioned with the cell",
    ],
  }),
  lesson({
    title: "Impedance control",
    summary:
      "Make the robot behave like a spring and damper with an impedance law and predict its damping ratio.",
    goals: [
      "Write the impedance law F = K(x_d − x) − D·v",
      "Compute the natural frequency and damping ratio",
      "Simulate the response to a push",
    ],
    concept: [
      "Impedance control gives the robot the behaviour of a virtual spring and damper around a target: F = K·(x_d − x) − D·v. A low stiffness K makes the robot soft and safe to touch, a high stiffness makes it precise. The damping D removes oscillation. Together with the effective mass M of the robot these define the dynamics of a second-order system.",
      "The natural frequency is ω = √(K / M) and the damping ratio is ζ = D / (2·√(K·M)). A ratio near 1 is critically damped (fast, no overshoot), below 1 the robot oscillates after a push and above 1 it is slow. Choosing K and D is choosing how the robot feels: for delicate contact use low K and enough D, for accurate positioning use high K.",
    ],
    steps: [
      "Choose the stiffness, damping and effective mass.",
      "Compute the natural frequency and damping ratio.",
      "Simulate a 20 N push for 0.1 s and record the displacement.",
      "Change K and D and compare the response.",
    ],
    example: hash(
      ["import math", "for square roots."],
      ["", ""],
      ["M, K, D = 2.0, 500.0, 40.0", "effective mass (kg), stiffness (N/m) and damping (N*s/m)."],
      ["wn = math.sqrt(K / M)", "natural frequency in rad/s."],
      ["zeta = D / (2 * math.sqrt(K * M))", "damping ratio: below 1 oscillates, 1 is critical."],
      [
        "print(round(wn, 1), round(zeta, 2))",
        "prints 15.8 rad/s (2.5 Hz) and a damping ratio of 0.63.",
      ],
      ["", ""],
      [
        "def simulate(push_n=20.0, push_s=0.1, dt=0.001, t_end=1.0):",
        "displacement (m) of the tool after a short push.",
      ],
      ["    x = v = 0.0", "start at rest at the target."],
      ["    peak = 0.0", "the largest displacement."],
      ["    for k in range(int(t_end / dt)):", "step through time."],
      [
        "        f_ext = push_n if k * dt < push_s else 0.0",
        "the external push acts for the first 0.1 s.",
      ],
      [
        "        a = (f_ext - K * x - D * v) / M",
        "Newton's law: external force minus spring and damper, divided by the mass.",
      ],
      ["        v += a * dt", "update the velocity."],
      ["        x += v * dt", "update the position."],
      ["        peak = max(peak, abs(x))", "remember the largest displacement."],
      [
        "    return round(peak, 4), round(x, 5)",
        "the peak displacement and the final position (back near zero).",
      ],
      ["", ""],
      [
        "print(simulate())",
        "the peak is a few centimetres and the final position is close to zero.",
      ],
    ),
    walk: [
      "The damping ratio of 0.63 means a small overshoot and a quick return, a common compromise.",
      "The spring pulls the tool back to the target after the push, which is what makes it feel elastic.",
      "Lower K would let the person push the robot farther, and higher K would make it stiffer and more dangerous to touch.",
    ],
    expect: [
      "The first print shows 15.8 and 0.63.",
      "The simulation shows a peak displacement of a few centimetres and a final position close to zero.",
    ],
    fix: [
      ["The robot oscillates after a push.", "The damping ratio is too low. Raise D or lower K."],
      [
        "The real robot cannot realise the model.",
        "Impedance control through joint torques has delays and friction. Lower the stiffness and check the sensor bandwidth.",
      ],
    ],
    exercise:
      "Find D that gives a critically damped response (zeta = 1) for the same K and M and compare the peak displacement.",
    checklist: [
      "The natural frequency and damping are computed",
      "The response is simulated before use",
      "Stiffness is chosen for the task and safety",
    ],
  }),
  lesson({
    title: "Force control",
    summary:
      "Press with a controlled force using a PI loop on the force error and a limit on the speed.",
    goals: [
      "Explain force control along one axis",
      "Write a PI force controller that outputs a velocity",
      "Limit speed and force excursion for safety",
    ],
    concept: [
      "Many tasks such as polishing, pressing a button or wiping need a defined contact force rather than a position. Force control along one axis measures the force and adjusts the tool's velocity along that axis: too little force, move toward the surface; too much force, move away. The other axes remain in position control (hybrid control).",
      "A PI controller on the force error is enough: v = Kp·e + Ki·∫e. The stiffness of the contact makes force control sensitive: a small motion gives a big change in force, so the gains must be low and the speed limited. Before contact the robot approaches slowly until the force rises above a threshold, and it always has a maximum force at which it retreats.",
    ],
    steps: [
      "Approach the surface at a low fixed speed until the force exceeds 2 N.",
      "Switch to force control with a target force of 10 N.",
      "Limit the velocity output and the total travel.",
      "Retreat if the force ever exceeds the maximum.",
    ],
    example: hash(
      ["class ForceControl:", "keeps a target contact force along the tool's z axis."],
      [
        "    def __init__(self, target=10.0, kp=0.002, ki=0.01, v_max=0.02, f_max=30.0):",
        "target force (N), gains, speed limit (m/s) and the retreat force (N).",
      ],
      [
        "        self.target, self.kp, self.ki, self.v_max, self.f_max, self.integral = target, kp, ki, v_max, f_max, 0.0",
        "store the settings and the integral term.",
      ],
      ["", ""],
      [
        "    def velocity(self, force, dt):",
        "velocity along z (positive = toward the surface) for the measured force (N).",
      ],
      ["        if force > self.f_max:", "too much force."],
      ["            self.integral = 0.0", "clear the integral."],
      ["            return -self.v_max", "retreat at the speed limit."],
      ["        e = self.target - force", "how far the force is from the target."],
      [
        "        self.integral = max(-2000.0, min(2000.0, self.integral + e * dt))",
        "accumulate the error, limited against windup.",
      ],
      ["        v = self.kp * e + self.ki * self.integral", "proportional plus integral action."],
      [
        "        return max(-self.v_max, min(self.v_max, v))",
        "never move faster than the speed limit.",
      ],
    ),
    walk: [
      "The retreat rule sits before the controller, so a force spike is answered immediately.",
      "The integral is clamped, so a long contact loss does not build up a large speed request.",
      "The speed limit of 2 cm/s keeps the contact gentle even if the gains are too high.",
    ],
    expect: [
      "With the tool at 5 N the controller commands motion toward the surface; at 15 N it commands motion away.",
      "In simulation against a spring surface the force settles near 10 N without large overshoot.",
    ],
    fix: [
      [
        "The force oscillates.",
        "The gains are too high for the contact stiffness. Lower kp and ki, and filter the force.",
      ],
      [
        "The controller never reaches the target.",
        "The speed limit or the integral limit is too small. Check the surface stiffness and the limits.",
      ],
    ],
    exercise:
      "Simulate a surface with stiffness 20,000 N/m and tune kp and ki so the force reaches 10 N within 0.5 s with less than 20 % overshoot.",
    checklist: [
      "Approach is slow before contact",
      "Velocity and force are limited",
      "The integral is clamped",
    ],
  }),
  lesson({
    title: "Assembly tasks",
    summary: "Detect a snap fit from the force curve: a rise, a peak and a sudden drop.",
    goals: [
      "Describe the force signature of a snap-fit connection",
      "Detect it in a force series with a peak and a drop rule",
      "Decide success or failure from the signature",
    ],
    concept: [
      "A snap-fit (a clip that latches) has a typical force pattern when pressed together: the force rises as the parts are pushed, reaches a peak as the latch deflects, and drops suddenly when the latch snaps into place. The drop is the sign that the connection is made, and the peak size tells whether the latch is sound.",
      "A robust detector looks for a peak above a minimum value followed by a drop to less than a fraction of that peak. No peak means the parts were not pressed together; a peak without a drop means a jam. Combined with the position of the tool at the moment of the drop, it also confirms that the parts are at the right depth. Force limits must stop the press in any case.",
    ],
    steps: [
      "Record the force during a good assembly to see the signature.",
      "Choose a minimum peak and a drop fraction from the recordings.",
      "Write the detector and test it on good, missing-click and jammed recordings.",
      "Add a force limit that stops the press.",
    ],
    example: hash(
      [
        "def snap_detected(forces, min_peak=25.0, drop=0.6):",
        "did the force series show a peak followed by a sudden drop?",
      ],
      [
        "    peak, peak_i = max((f, i) for i, f in enumerate(forces))",
        "the largest force and where it happened.",
      ],
      ["    if peak < min_peak:", "the force never got high enough."],
      ["        return False", "the parts were not pressed together."],
      ["    after = forces[peak_i + 1:]", "the readings after the peak."],
      ["    if not after:", "the series ends at the peak."],
      ["        return False", "no drop visible yet."],
      [
        "    return min(after) < drop * peak",
        "the force fell below 60 % of the peak: the latch snapped.",
      ],
      ["", ""],
      ["good = [5, 10, 18, 32, 15, 14]", "rise, peak and a sudden drop."],
      ["jam = [5, 12, 22, 35, 40, 44]", "the force keeps rising: something is blocked."],
      ["print(snap_detected(good), snap_detected(jam))", "prints True False."],
    ),
    walk: [
      "Both a peak and a drop are required, so a jam (peak without drop) is not reported as success.",
      "The drop fraction is relative to the peak, so it works for different latch strengths.",
      "The thresholds must come from real recordings of good and bad assemblies, not from guesses.",
    ],
    expect: [
      "The script prints True for the good series and False for the jammed one.",
      "A series that ends before the drop returns False, which the caller must treat as 'not finished'.",
    ],
    fix: [
      [
        "Good parts are rejected.",
        "The minimum peak is too high for a softer latch. Record 30 good parts and set the values from them.",
      ],
      [
        "Jammed parts pass.",
        "The force limit is missing or too high. Stop the press at a hard limit and record the jam.",
      ],
    ],
    exercise:
      "Collect 20 simulated good and 20 jammed force series with noise and choose min_peak and drop that separate them completely.",
    checklist: [
      "The signature is recorded from real assemblies",
      "Peak and drop are both required",
      "A hard force limit stops the press",
    ],
  }),
];
