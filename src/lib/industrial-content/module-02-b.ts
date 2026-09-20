import { hash, cpp, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 02 · SCARA Robot — lessons 16–30 (Assembly & Precision, then ROS 2 & Automation)
export const module02b: LessonSpec[] = [
  lesson({
    title: "Micro-assembly tolerances",
    summary:
      "Add up part tolerances with worst-case and root-sum-square stack-ups and compare them with the robot's accuracy.",
    goals: [
      "Explain a tolerance stack-up",
      "Compute worst-case and statistical (RSS) totals",
      "Decide whether the robot's placement accuracy is good enough",
    ],
    concept: [
      "In micro-assembly several small errors add together: the part's own tolerance, the feeder's position error, the gripper's slip, the robot's accuracy and the board's tolerance. The worst case simply adds them all, which is safe but often too pessimistic and expensive to meet.",
      "The root-sum-square (RSS) method combines independent random errors as the square root of the sum of their squares. It predicts what usually happens, not what can never happen. Use worst case where a failure is dangerous or costly, and RSS where a small reject rate is acceptable, and always compare the total with the tolerance the assembly allows.",
    ],
    steps: [
      "List every error source with its tolerance in millimetres.",
      "Compute the worst-case sum and the RSS total.",
      "Compare both with the allowed placement tolerance.",
      "Find the largest contributor and reduce it first.",
    ],
    example: hash(
      ["import math", "for the square root."],
      ["", ""],
      [
        "errors = {'part': 0.02, 'feeder': 0.03, 'gripper slip': 0.01, 'robot accuracy': 0.02}",
        "each source of error in mm (plus/minus).",
      ],
      ["", ""],
      [
        "worst = sum(errors.values())",
        "worst case: every error at its maximum, in the same direction.",
      ],
      [
        "rss = math.sqrt(sum(v * v for v in errors.values()))",
        "statistical total: independent errors rarely all peak together.",
      ],
      ["allowed = 0.05", "the placement tolerance the assembly permits (mm)."],
      ["", ""],
      [
        "print(round(worst, 3), round(rss, 3), 'worst-case ok' if worst <= allowed else 'worst-case fails', 'rss ok' if rss <= allowed else 'rss fails')",
        "prints 0.08 0.042: the worst case fails, but the statistical total fits.",
      ],
      [
        "biggest = max(errors, key=errors.get)",
        "the source that contributes the largest single error.",
      ],
      ["print('improve first:', biggest)", "prints 'feeder': start with the biggest contributor."],
    ),
    walk: [
      "Two totals side by side show how much of the risk is only theoretical.",
      "The feeder error (0.03 mm) is the biggest single term, so a better feeder helps more than a better robot.",
      "RSS assumes independent errors; systematic errors, such as a fixed offset, must be added directly.",
    ],
    expect: [
      "The script prints 0.08 and 0.042, and says the worst case fails but RSS is fine for 0.05 mm.",
      "Reducing the feeder error to 0.01 mm brings the worst case to 0.06 mm and RSS to about 0.03 mm.",
    ],
    fix: [
      [
        "Assembled boards still fail although RSS says they should pass.",
        "Some errors are systematic, for example a calibration offset. Remove or add those directly instead of treating them as random.",
      ],
      [
        "The tolerance budget is impossible to meet.",
        "Tighten the largest term first, or change the design so that the parts self-align with chamfers.",
      ],
    ],
    exercise:
      "Add a systematic offset of 0.015 mm to the stack-up (added directly to the RSS total) and recompute whether the assembly still passes.",
    checklist: [
      "Every error source is listed with a value",
      "Worst case and RSS are both computed",
      "Systematic errors are handled separately",
    ],
  }),
  lesson({
    title: "Error compensation",
    summary:
      "Correct systematic position errors by measuring them on a grid and interpolating a correction map.",
    goals: [
      "Explain how a position error map is measured",
      "Interpolate the error between grid points",
      "Apply a correction and verify the improvement",
    ],
    concept: [
      "A robot's accuracy error is largely systematic: the same target produces nearly the same error each time, and the error varies smoothly over the workspace. That means it can be measured and cancelled. The robot is sent to a grid of positions, the real position is measured with a camera or a gauge, and the difference at each grid point is stored.",
      "For any other target the error is interpolated between the surrounding grid points and subtracted from the command. The correction only helps against systematic error; random scatter (repeatability) remains. Verify with new points that were not used to build the map, and rebuild the map whenever the tool, the calibration or the temperature changes significantly.",
    ],
    steps: [
      "Command a 3 x 3 grid of points and measure the real position at each one.",
      "Store the x and y error of every point.",
      "Build an interpolator over the grid and subtract the interpolated error from targets.",
      "Test the correction on points that were not part of the grid.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the arrays."],
      [
        "from scipy.interpolate import RegularGridInterpolator",
        "interpolates values on a rectangular grid.",
      ],
      ["", ""],
      ["xs = np.array([100.0, 200.0, 300.0])", "grid x positions in mm."],
      ["ys = np.array([-100.0, 0.0, 100.0])", "grid y positions in mm."],
      [
        "err_x = np.array([[0.04, 0.05, 0.06], [0.03, 0.04, 0.05], [0.02, 0.03, 0.04]])",
        "measured x error (mm) at each grid point (rows = x, columns = y).",
      ],
      [
        "err_y = np.array([[-0.02, -0.01, 0.00], [-0.01, 0.00, 0.01], [0.00, 0.01, 0.02]])",
        "measured y error (mm) at each grid point.",
      ],
      ["", ""],
      [
        "fx = RegularGridInterpolator((xs, ys), err_x)",
        "smooth estimate of the x error anywhere inside the grid.",
      ],
      ["fy = RegularGridInterpolator((xs, ys), err_y)", "smooth estimate of the y error."],
      ["", ""],
      ["def corrected(x, y):", "the command that makes the robot actually reach (x, y)."],
      [
        "    ex, ey = float(fx([[x, y]])[0]), float(fy([[x, y]])[0])",
        "interpolated error at the target.",
      ],
      ["    return x - ex, y - ey", "command the opposite of the error, so the error cancels."],
      ["", ""],
      [
        "print(corrected(250.0, 50.0))",
        "a point between grid nodes: prints a command that is slightly shifted from (250, 50).",
      ],
    ),
    walk: [
      "Interpolation gives a correction for every point in the grid area, not only at the measured nodes.",
      "The correction subtracts the error, so a robot that lands 0.04 mm too far in x is told to aim 0.04 mm short.",
      "Points outside the grid raise an error, which is a useful reminder to measure the whole working area.",
    ],
    expect: [
      "The corrected command differs from the target by the interpolated error, about 0.04 mm in x here.",
      "On a verification grid the residual error is lower than before the correction.",
    ],
    fix: [
      [
        "A ValueError says the point is out of bounds.",
        "The target is outside the measured grid. Extend the grid to cover the whole work area.",
      ],
      [
        "Accuracy gets worse after correction.",
        "The map is stale or the sign is wrong. Check the sign convention and rebuild the map after any mechanical change.",
      ],
    ],
    exercise:
      "Measure a 5 x 5 grid in simulation with a known synthetic error and compare the residual error for a 3 x 3 and a 5 x 5 correction map.",
    checklist: [
      "The grid covers the whole working area",
      "Verification points are separate from map points",
      "The map is rebuilt after mechanical changes",
    ],
  }),
  lesson({
    title: "High-speed pick & place",
    summary:
      "Run a staged pick and place cycle with validated targets: across, down, up and place.",
    goals: [
      "Describe the staged motion of a SCARA pick and place",
      "Validate every target before it is sent",
      "Complete the interactive lab by adding the missing release command",
    ],
    concept: [
      "A SCARA pick and place is a fixed sequence: move across to the pick point, go down, grip, come up, move across to the place point, go down, release and come up. Keeping the phases separate means that horizontal moves happen at a safe height and vertical moves happen over a known position.",
      "In code the cycle is a short list of targets. Every target is checked against the joint and workspace limits before it is used, and the loop waits for each move to finish before starting the next one. A rejected target stops the cycle instead of being silently corrected, so the operator learns what went wrong.",
    ],
    steps: [
      "Describe revolute, prismatic and fixed tool joints in xacro.",
      "Publish the model and verify base_link to tool0 with tf2_echo.",
      "Represent each pick/place phase as a named joint target in radians and metres.",
      "Execute approach, descend, retract and place goals sequentially, checking each result. Then open the Robot Code Lab below and finish the mission.",
    ],
    example: cpp(
      [
        "std::vector<std::array<double, 4>> cycle{",
        "a list of poses; each pose holds four numbers: two joint angles (rad), the vertical axis (m) and tool rotation (rad).",
      ],
      [
        "  {0.25, 0.70, 0.00, 0.0},",
        "approach: the arm is positioned above the pick point with the vertical axis raised.",
      ],
      [
        "  {0.25, 0.70, -0.08, 0.0},",
        "descend: the same position, but the vertical axis lowers by 0.08 m.",
      ],
      ["  {0.25, 0.70, 0.00, 0.0},", "retract: lift back up to the raised height."],
      [
        "  {-0.30, 0.55, -0.05, 1.57}",
        "place: swing to the drop location, lower slightly and rotate the tool by about 90 degrees (1.57 rad).",
      ],
      ["};", "end of the cycle list."],
      [
        "for (const auto & target : cycle) {",
        "visit each pose in order, reading it through a const reference so nothing is copied or changed.",
      ],
      [
        '  if (!within_limits(target)) throw std::range_error("unsafe target");',
        "refuse to continue if this pose is outside the allowed range, by raising an error.",
      ],
      [
        "  send_and_wait(target);",
        "send the pose to the controller and wait for its result before starting the next one.",
      ],
      ["}", "end of the loop; the phases ran strictly one after another."],
    ),
    walk: [
      "The list makes the four phases visible, so a reviewer can check heights and positions at a glance.",
      "within_limits() runs before every send, which makes it impossible to command a pose that was never validated.",
      "send_and_wait() blocks until the result arrives, which guarantees the ordering of the phases.",
    ],
    expect: [
      "The four poses run in order with no limit error, and the simulated part ends on the assembly station.",
      "A pose outside the joint limits stops the cycle with 'unsafe target' before anything moves to it.",
    ],
    fix: [
      [
        "The tool drags the part sideways.",
        "A horizontal move started before the lift finished. Wait for each vertical move to complete before the next horizontal one.",
      ],
      [
        "The cycle stops on the first pose.",
        "The joint values are in degrees or the limits are in a different unit. Keep radians and metres everywhere.",
      ],
    ],
    exercise:
      "Build a simulated four-stage pick-and-place cycle. Add a tool offset frame and prove its pose with tf2_echo before motion.",
    checklist: [
      "Prismatic values use metres",
      "Each phase waits for the prior result",
      "Invalid workspaces are rejected",
    ],
    lab: "02-scara-robot",
    source: [
      "ROS 2 tf2 tutorials",
      "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/Tf2/Tf2-Main.html",
    ],
  }),
  lesson({
    title: "Cycle-time optimization",
    summary:
      "Break a cycle into its segments, find the biggest time consumers and test what-if changes.",
    goals: [
      "Split a cycle into motion, wait and process time",
      "Find the largest contributors with a simple table",
      "Test changes such as blending and lower lifts on paper before the robot runs",
    ],
    concept: [
      "The cycle time is the sum of motion segments, waiting for sensors and process time such as gripper closing or vacuum build-up. Optimising means finding where the time actually goes, not guessing. A table with a time for each item sorted by size shows the target immediately.",
      "Typical levers are lower lifts, blending corners, overlapping motion and gripper action, faster gripper timing and removing unnecessary waits. Each change should be tested at low risk and its effect measured, because a saved millisecond that causes a drop or a collision costs far more than it earns.",
    ],
    steps: [
      "Time every segment of the real cycle with timestamps.",
      "Sort the segments by duration and add up the total.",
      "Apply a what-if change (for example 30 % less lift time) and recompute the total.",
      "Try the best change on the robot at low speed and compare the measured result.",
    ],
    example: hash(
      ["segments = {", "measured times in seconds for one pick and place cycle."],
      [
        "    'lift up': 0.09, 'move across': 0.26, 'lower': 0.09,",
        "the three motion segments of the gate path.",
      ],
      [
        "    'vacuum on': 0.06, 'settle': 0.04, 'vacuum off': 0.05,",
        "process and waiting times around the gripper.",
      ],
      ["}", "end of the table."],
      ["", ""],
      ["def total(s):", "sum of all segment times."],
      ["    return round(sum(s.values()), 3)", "the cycle time in seconds."],
      ["", ""],
      ["print(total(segments))", "prints 0.59 for the current cycle."],
      [
        "for name, t in sorted(segments.items(), key=lambda kv: -kv[1])[:3]:",
        "the three largest contributors, biggest first.",
      ],
      ["    print(name, t, f'{t / total(segments):.0%}')", "each with its share of the cycle."],
      ["", ""],
      [
        "faster = dict(segments, **{'lift up': 0.06, 'lower': 0.06, 'settle': 0.02})",
        "what-if: lower lifts and less settling time.",
      ],
      [
        "print(total(faster), 'saves', round(total(segments) - total(faster), 3), 's')",
        "prints 0.51 and a saving of 0.08 s (14 %).",
      ],
    ),
    walk: [
      "Sorting the table shows that the move across is the biggest piece, so faster joints help more than a faster gripper.",
      "The what-if dictionary changes only three numbers, so the effect of each idea can be checked quickly.",
      "The numbers are estimates until they are measured on the real robot with timestamps.",
    ],
    expect: [
      "The script prints a total of 0.59 s, lists the three largest items and predicts 0.51 s for the faster plan.",
      "After a real test, the measured saving is within the predicted range or you can explain the difference.",
    ],
    fix: [
      [
        "A faster cycle drops parts.",
        "The gripper or vacuum needs more time. Add the required settle time back and keep the speed gain elsewhere.",
      ],
      [
        "Measured times do not add up.",
        "Overlapping motions are counted twice. Measure the total cycle separately and compare it with the sum.",
      ],
    ],
    exercise:
      "Add a 'blend' option that overlaps 30 % of the lower motion with the vacuum-on time and compute the new total.",
    checklist: [
      "Time is measured per segment",
      "Changes are tested one at a time",
      "Safety and part handling are not traded for speed",
    ],
  }),
  lesson({
    title: "Quality control",
    summary:
      "Monitor a placement process with X-bar control limits and react before parts go out of tolerance.",
    goals: [
      "Explain what a control chart shows",
      "Compute control limits from sample means and ranges",
      "Detect a drifting process with a simple rule",
    ],
    concept: [
      "A control chart watches the process, not single parts. Take a small sample (for example 5 parts) every so often, plot the mean, and compare it with control limits computed from the process's own normal variation. A point outside the limits, or a long run on one side, signals that something changed even if every part is still within its tolerance.",
      "For an X-bar chart with samples of five, the limits are the grand mean plus and minus A2 times the average range, with A2 = 0.577. These limits are not the customer's tolerance: they describe what the process normally does. Reacting to a drift early avoids scrap and shows whether a tool, a feeder or the temperature is changing.",
    ],
    steps: [
      "Collect 20 samples of 5 placement offsets.",
      "Compute each sample's mean and range.",
      "Compute the grand mean, the average range and the limits.",
      "Add a rule: alert when a mean is outside the limits or eight in a row are on the same side.",
    ],
    example: hash(
      ["A2 = 0.577", "chart constant for samples of five."],
      ["", ""],
      ["def limits(samples):", "control limits from a list of samples (each a list of 5 values)."],
      ["    means = [sum(s) / len(s) for s in samples]", "the mean of every sample."],
      [
        "    ranges = [max(s) - min(s) for s in samples]",
        "the range (largest minus smallest) of every sample.",
      ],
      [
        "    grand, rbar = sum(means) / len(means), sum(ranges) / len(ranges)",
        "the average of the means and the average range.",
      ],
      [
        "    return grand - A2 * rbar, grand, grand + A2 * rbar",
        "lower limit, centre line, upper limit.",
      ],
      ["", ""],
      ["def alert(sample_mean, lcl, ucl, recent):", "should someone look at the process?"],
      ["    if not (lcl <= sample_mean <= ucl):", "a single point outside the limits."],
      ["        return 'out of control'", "act immediately."],
      [
        "    if len(recent) >= 8 and (all(m > 0 for m in recent[-8:]) or all(m < 0 for m in recent[-8:])):",
        "eight points in a row on one side of the centre line.",
      ],
      ["        return 'drift'", "the process is slowly moving away from the centre."],
      ["    return 'ok'", "nothing to do."],
    ),
    walk: [
      "The limits are computed from the process's own data, which is why they can warn before a tolerance is broken.",
      "The run rule catches slow drifts that never cross a limit but still show that the process changed.",
      "recent holds the sample means minus the centre line, so its sign says which side each point is on.",
    ],
    expect: [
      "With stable data the function returns 'ok' for nearly all samples.",
      "A sample mean shifted by several standard errors returns 'out of control'.",
    ],
    fix: [
      [
        "The chart raises too many alerts.",
        "The limits were computed from too few samples or from an unstable period. Recompute from at least 20 samples of a known good process.",
      ],
      [
        "A shift is never detected.",
        "The sample interval is too long or the sample too small. Sample more often when the process is new or has just been changed.",
      ],
    ],
    exercise:
      "Simulate a process that drifts 0.002 mm per sample and find after how many samples the alert triggers.",
    checklist: [
      "Limits come from real process data",
      "The drift rule is in use",
      "Alerts lead to a defined action",
    ],
  }),
  lesson({
    title: "URDF SCARA modeling",
    summary:
      "Write a URDF for a four-axis SCARA with two revolute joints, a prismatic axis and a rotating tool.",
    goals: [
      "Describe all four SCARA joints in URDF",
      "Set the prismatic axis direction and limits correctly",
      "Check the model against forward kinematics",
    ],
    concept: [
      "The URDF of a SCARA has the same building blocks as any robot: links, joints, limits and inertia. The arm joints are revolute about z, the vertical axis is a prismatic joint whose axis points down (or up, depending on the model), and the last joint is a continuous or limited revolute joint that rotates the tool.",
      "The positions of the joint frames follow the real geometry: joint 2 sits a1 along link 1, the prismatic joint sits a2 along link 2, and so on. The result must agree with the forward kinematics from the DH lesson. A mismatch between the two usually means a wrong origin or axis sign, and it is much easier to find it here than on the real robot.",
    ],
    steps: [
      "Write the four links and four joints with the datasheet's dimensions.",
      "Set the limits of each joint from the datasheet.",
      "Run check_urdf and view the robot in RViz.",
      "Compare tf2_echo base_link tool0 with the forward kinematics at three poses.",
    ],
    example: xml(
      [
        '<joint name="joint_1" type="revolute">',
        "the shoulder: rotates the whole arm about the vertical axis.",
      ],
      [
        '  <parent link="base_link"/><child link="link_1"/>',
        "joint 1 connects the base and link 1.",
      ],
      [
        '  <origin xyz="0 0 0.30" rpy="0 0 0"/><axis xyz="0 0 1"/>',
        "0.30 m above the base and rotating about z.",
      ],
      [
        '  <limit lower="-2.4" upper="2.4" velocity="6.0" effort="60"/>',
        "range in radians, speed in rad/s and torque limit in N*m.",
      ],
      ["</joint>", "end of joint 1."],
      [
        '<joint name="joint_2" type="revolute">',
        "the elbow: rotates link 2 about a second vertical axis.",
      ],
      ['  <parent link="link_1"/><child link="link_2"/>', "connects link 1 and link 2."],
      [
        '  <origin xyz="0.225 0 0" rpy="0 0 0"/><axis xyz="0 0 1"/>',
        "0.225 m along link 1 (the length a1).",
      ],
      [
        '  <limit lower="-2.6" upper="2.6" velocity="8.0" effort="30"/>',
        "the elbow's own range and limits.",
      ],
      ["</joint>", "end of joint 2."],
      [
        '<joint name="joint_3" type="prismatic">',
        "the vertical axis: slides the tool up and down.",
      ],
      ['  <parent link="link_2"/><child link="link_3"/>', "connects link 2 and the sliding quill."],
      [
        '  <origin xyz="0.175 0 0" rpy="0 0 0"/><axis xyz="0 0 -1"/>',
        "0.175 m along link 2 (a2); the axis points down, so a positive value lowers the tool.",
      ],
      [
        '  <limit lower="0.0" upper="0.15" velocity="1.0" effort="100"/>',
        "stroke in metres and force limit in newtons.",
      ],
      ["</joint>", "end of joint 3."],
      ['<joint name="joint_4" type="revolute">', "the tool rotation."],
      ['  <parent link="link_3"/><child link="tool0"/>', "connects the quill to the tool frame."],
      [
        '  <origin xyz="0 0 0" rpy="0 0 0"/><axis xyz="0 0 1"/>',
        "rotates the tool about the vertical axis.",
      ],
      [
        '  <limit lower="-6.28" upper="6.28" velocity="20.0" effort="5"/>',
        "almost two full turns of tool rotation.",
      ],
      ["</joint>", "end of joint 4."],
    ),
    walk: [
      "The origins repeat the link lengths a1 and a2 from the DH table, so the model and the maths can be compared line by line.",
      "The prismatic axis (0 0 -1) is what makes a positive joint value move the tool down.",
      "Effort is torque for revolute joints and force for prismatic joints, so their units differ.",
    ],
    expect: [
      "At all-zero joints tf2_echo reports the tool 0.4 m along x from the base and 0.30 m above it.",
      "Moving joint_3 in RViz lowers the tool by the same amount.",
    ],
    fix: [
      [
        "Moving the prismatic joint moves the tool the wrong way.",
        "Flip the axis vector between (0 0 1) and (0 0 -1) to match the vendor's convention.",
      ],
      [
        "The tool frame is mirrored.",
        "One of the revolute axes has the wrong sign; check each axis against the datasheet.",
      ],
    ],
    exercise:
      "Add links with visual and collision shapes, inertial data and a fixed joint for a gripper frame, then run check_urdf.",
    checklist: [
      "Origins match the real link lengths",
      "The prismatic axis direction matches the vendor",
      "tf2_echo agrees with forward kinematics",
    ],
  }),
  lesson({
    title: "MoveIt kinematics plugin",
    summary:
      "Use a fast closed-form SCARA solver in MoveIt instead of the default numerical solver.",
    goals: [
      "Explain why a closed-form solver suits a SCARA",
      "Configure MoveIt to use a custom kinematics plugin",
      "Verify the solver by running forward kinematics on its output",
    ],
    concept: [
      "MoveIt asks a kinematics plugin to solve inverse kinematics thousands of times per plan. For a SCARA the closed-form solution from the earlier lesson is tiny and exact, so replacing the default numerical solver gives faster planning, both postures on demand and no failures caused by poor seeds.",
      "The plugin is selected in the kinematics configuration by name. The solver must respect the joint limits from the robot model and must return the solution nearest to the seed when several exist. Every solver should be tested by feeding its answers back through forward kinematics, because an error here silently moves the tool to the wrong place.",
    ],
    steps: [
      "Write the SCARA IK function that returns both postures.",
      "Wrap it in a kinematics plugin class (see the custom IK lesson for the interface).",
      "Set the solver name in kinematics.yaml for the arm's planning group.",
      "Test the solver with forward kinematics on 1,000 random reachable poses.",
    ],
    example: cpp(
      [
        "std::optional<std::array<double, 4>> solve(double x, double y, double z, double yaw,",
        "closed-form SCARA solver: returns joint values or nothing.",
      ],
      [
        "                                            const std::array<double, 4> & seed) {",
        "the seed is the current joint state, used to pick the nearest posture.",
      ],
      [
        "  const double c2 = (x * x + y * y - a1 * a1 - a2 * a2) / (2 * a1 * a2);",
        "cosine of the elbow angle from the law of cosines.",
      ],
      ["  if (std::abs(c2) > 1.0) return std::nullopt;", "no solution outside the reach."],
      ["  std::optional<std::array<double, 4>> best;", "the best solution found so far."],
      ["  double best_distance = 1e9;", "its distance to the seed."],
      ["  for (double sign : {1.0, -1.0}) {", "try both elbow postures."],
      ["    const double s2 = sign * std::sqrt(1.0 - c2 * c2);", "sine of the elbow angle."],
      ["    const double q2 = std::atan2(s2, c2);", "the elbow angle."],
      [
        "    const double q1 = std::atan2(y, x) - std::atan2(a2 * s2, a1 + a2 * c2);",
        "the shoulder angle.",
      ],
      [
        "    const std::array<double, 4> q{q1, q2, z0 - z, yaw - q1 - q2};",
        "the full candidate: shoulder, elbow, vertical, tool rotation.",
      ],
      ["    if (!within_limits(q)) continue;", "drop candidates that violate the joint limits."],
      [
        "    const double d = std::abs(q[0] - seed[0]) + std::abs(q[1] - seed[1]);",
        "how far the arm would have to swing from where it is.",
      ],
      ["    if (d < best_distance) { best_distance = d; best = q; }", "keep the closest posture."],
      ["  }", "end of the posture loop."],
      ["  return best;", "the nearest valid solution or nothing."],
      ["}", "end of the solver."],
    ),
    walk: [
      "Limit filtering happens inside the solver, so MoveIt never receives an unreachable joint set.",
      "Choosing by distance to the seed keeps the arm in its current posture during Cartesian paths.",
      "A std::optional result makes 'no solution' a normal outcome that callers must handle.",
    ],
    expect: [
      "Planning time for Cartesian goals drops compared with the numerical solver.",
      "Forward kinematics on every returned solution reproduces the requested pose within 1e-6 m.",
    ],
    fix: [
      [
        "MoveIt still uses the old solver.",
        "The planning group name in kinematics.yaml does not match the SRDF group. Compare the two files.",
      ],
      [
        "The arm changes posture in the middle of a line.",
        "The seed is not the previous point of the path. Seed each solve with the previous solution.",
      ],
    ],
    exercise:
      "Add a unit test that runs the solver on 1,000 random reachable poses and asserts the forward-kinematics error is below 1e-6.",
    checklist: [
      "Joint limits are applied inside the solver",
      "The nearest solution to the seed is returned",
      "Every solution is verified with forward kinematics",
    ],
  }),
  lesson({
    title: "Trajectory execution",
    summary:
      "Configure the joint trajectory controller with tolerances so a move is only 'successful' when it really arrived.",
    goals: [
      "Write a joint_trajectory_controller configuration",
      "Explain goal and path tolerances",
      "Decide how the controller reacts to a missed tolerance",
    ],
    concept: [
      "The joint trajectory controller receives a trajectory, interpolates it and sends commands to the hardware. Its configuration lists the joints, the command and state interfaces and the tolerances. A goal tolerance says how close to the end point the joints must settle, a path tolerance says how far they may stray from the trajectory on the way, and a goal time says how long they get to settle.",
      "If a tolerance is missed the controller aborts the goal, and the application receives a failed result. Tolerances that are too loose hide problems and tolerances that are too tight abort good moves. Choose them from measured behaviour, tighten them for precision tasks and always read the result of the action.",
    ],
    steps: [
      "List the four joints and their interfaces in the controller file.",
      "Set the goal tolerance and path tolerance for each joint.",
      "Send a trajectory and check that the result is successful.",
      "Provoke a failure with a very small tolerance and read the error code.",
    ],
    example: hash(
      ["scara_controller:", "the controller's name."],
      ["  ros__parameters:", "ROS 2 parameter section."],
      [
        "    joints: [joint_1, joint_2, joint_3, joint_4]",
        "the four SCARA joints in the order of the trajectory points.",
      ],
      ["    command_interfaces: [position]", "the controller commands joint positions."],
      ["    state_interfaces: [position, velocity]", "and reads position and velocity feedback."],
      [
        "    allow_partial_joints_goal: false",
        "a goal must name all four joints, so nothing is half-commanded.",
      ],
      ["    constraints:", "tolerances for the moves."],
      ["      goal_time: 0.5", "the joints have 0.5 s after the last point to settle."],
      [
        "      stopped_velocity_tolerance: 0.01",
        "at the end, joint speeds must be below 0.01 rad/s.",
      ],
      [
        "      joint_1: {trajectory: 0.05, goal: 0.002}",
        "may stray 0.05 rad from the path and must end within 0.002 rad.",
      ],
      ["      joint_2: {trajectory: 0.05, goal: 0.002}", "the same for the elbow."],
      [
        "      joint_3: {trajectory: 0.005, goal: 0.0002}",
        "the vertical axis in metres: much tighter, because z matters for insertion.",
      ],
      [
        "      joint_4: {trajectory: 0.1, goal: 0.005}",
        "the tool rotation is allowed larger tolerances.",
      ],
    ),
    walk: [
      "Each joint has its own numbers, because a prismatic axis in metres needs a different tolerance from a rotary one in radians.",
      "goal_time bounds the wait for settling, so a stuck joint fails the goal instead of blocking forever.",
      "Setting allow_partial_joints_goal to false prevents a program from commanding only some of the joints by mistake.",
    ],
    expect: [
      "A normal move finishes with a SUCCESSFUL result within 0.5 s of the last point.",
      "With goal set to 0.00001 the same move is aborted with GOAL_TOLERANCE_VIOLATED.",
    ],
    fix: [
      [
        "Good moves are aborted.",
        "Tolerances are tighter than what the hardware can settle to. Measure the real settling error and set the goal tolerance just above it.",
      ],
      [
        "The move ends but the arm drifts afterwards.",
        "The controller holds position with a stale target. Send a hold trajectory, or use the stopped-velocity tolerance to ensure the arm is at rest.",
      ],
    ],
    exercise:
      "Send the same trajectory 20 times and record the settling error of each joint, then set the goal tolerances at twice the largest observed error.",
    checklist: [
      "Tolerances are set per joint and unit",
      "Failures are visible in the result code",
      "Values come from measurement, not guesswork",
    ],
  }),
  lesson({
    title: "PLC integration",
    summary:
      "Exchange start, ready and error signals with a PLC over OPC UA and keep the handshake safe.",
    goals: [
      "Explain the roles of a PLC and a ROS 2 cell controller",
      "Read and write PLC tags over OPC UA",
      "Design a handshake that fails safely when the link drops",
    ],
    concept: [
      "In a factory the PLC usually owns the line: sensors, conveyors, interlocks and the overall sequence. The robot cell controller is a client of that system. They exchange a few well-defined signals: the PLC says 'start' and 'part present', the robot answers 'ready', 'busy', 'done' and 'error'. Standard protocols are OPC UA, Profinet, EtherNet/IP and Modbus.",
      "The exchange must be a handshake, not a level: the PLC raises start, the robot raises busy, the PLC drops start, and the robot raises done. If the link drops, the robot must stop safely and report an error, and it must not restart on its own when the link returns. Emergency stops never go over this link; they belong to the safety circuit.",
    ],
    steps: [
      "Agree the signal list with the PLC programmer: names, types and directions.",
      "Read the start tag and write the ready tag with an OPC UA client.",
      "Implement the handshake as a small state machine.",
      "Test a dropped connection and confirm the robot stops in a safe state.",
    ],
    example: hash(
      ["import asyncio", "OPC UA client calls are asynchronous."],
      ["from asyncua import Client", "an open-source OPC UA client library."],
      ["", ""],
      ["async def handshake(url):", "one pick-and-place request from the PLC."],
      [
        "    async with Client(url=url, timeout=2) as plc:",
        "connect; a 2 s timeout makes a dead link visible quickly.",
      ],
      [
        "        start = plc.get_node('ns=2;s=Cell.Start')",
        "the tag the PLC sets to request a cycle.",
      ],
      ["        busy = plc.get_node('ns=2;s=Cell.Busy')", "the tag the robot sets while working."],
      [
        "        done = plc.get_node('ns=2;s=Cell.Done')",
        "the tag the robot sets when the cycle is finished.",
      ],
      ["        while not await start.read_value():", "wait for the request."],
      ["            await asyncio.sleep(0.05)", "poll every 50 ms without using all the CPU."],
      ["        await busy.write_value(True)", "tell the PLC the robot has taken the job."],
      ["        await run_cycle()", "do the actual pick and place (defined elsewhere)."],
      ["        await done.write_value(True)", "report that the cycle is finished."],
      ["        while await start.read_value():", "wait until the PLC drops its request."],
      ["            await asyncio.sleep(0.05)", "part of the four-step handshake."],
      ["        await busy.write_value(False)", "release the busy flag."],
      ["        await done.write_value(False)", "clear done, ready for the next cycle."],
    ),
    walk: [
      "Each side changes its own signals only, which prevents both from writing the same tag.",
      "The four-step handshake makes it impossible to miss a request or run the same request twice.",
      "The connection timeout turns a broken link into an exception that the caller must handle with a safe stop.",
    ],
    expect: [
      "The PLC sets start, the robot runs one cycle, and the PLC sees done exactly once.",
      "Disconnecting the network stops the client with a timeout error, and the robot stays stopped.",
    ],
    fix: [
      [
        "The robot starts twice for one request.",
        "The start tag was not waited on until it dropped. Complete the full handshake before accepting a new request.",
      ],
      [
        "Values arrive late.",
        "Polling is too slow or the network is busy. Use subscriptions for fast signals, and keep polling only for slow ones.",
      ],
    ],
    exercise:
      "Add a heartbeat tag that the robot toggles every 500 ms and the PLC monitors, so the PLC can stop the line if the robot stops responding.",
    checklist: [
      "The handshake has four steps",
      "A lost link stops the robot safely",
      "Emergency stops are not sent over this link",
    ],
  }),
  lesson({
    title: "SCADA monitoring",
    summary:
      "Publish cell health as ROS 2 diagnostics that a SCADA or dashboard can display and alarm on.",
    goals: [
      "Explain what a SCADA system needs from a robot cell",
      "Publish diagnostic status with levels and values",
      "Choose thresholds that trigger warnings before failures",
    ],
    concept: [
      "SCADA (supervisory control and data acquisition) collects data from many machines in one place: states, counters, alarms and trends. A robot cell should report a small, stable set of values: state, cycle count, cycle time, error count, temperatures and the last error text. The values must be easy to map onto SCADA tags.",
      "ROS 2 has a standard message for this: diagnostic_msgs/DiagnosticArray, with an OK, WARN, ERROR or STALE level, a message and key-value pairs. A bridge then maps them to OPC UA or MQTT tags. Alarms should have two thresholds: a warning while there is still time to act and an error that stops the work.",
    ],
    steps: [
      "Choose the values to publish and their warning and error thresholds.",
      "Publish them as a DiagnosticStatus message at 1 Hz.",
      "Subscribe with rqt_robot_monitor to check the levels.",
      "Simulate a warning and an error and confirm the level changes.",
    ],
    example: hash(
      [
        "from diagnostic_msgs.msg import DiagnosticArray, DiagnosticStatus, KeyValue",
        "the standard diagnostic message types.",
      ],
      ["", ""],
      [
        "def status(cycle_time, errors, temp):",
        "build one status message from the cell's numbers.",
      ],
      [
        "    s = DiagnosticStatus(name='scara_cell', hardware_id='cell_01')",
        "an identifiable status entry.",
      ],
      ["    if errors > 5 or temp > 70.0:", "error thresholds: too many faults or too hot."],
      [
        "        s.level, s.message = DiagnosticStatus.ERROR, 'stop and inspect'",
        "the level a dashboard shows in red.",
      ],
      [
        "    elif errors > 2 or temp > 60.0 or cycle_time > 0.7:",
        "warning thresholds: act soon, but the cell still runs.",
      ],
      ["        s.level, s.message = DiagnosticStatus.WARN, 'check the cell'", "shown in yellow."],
      ["    else:", "everything normal."],
      ["        s.level, s.message = DiagnosticStatus.OK, 'running'", "shown in green."],
      [
        "    s.values = [KeyValue(key='cycle_time_s', value=str(cycle_time)), KeyValue(key='errors', value=str(errors)), KeyValue(key='temp_c', value=str(temp))]",
        "the raw numbers, so a SCADA can trend them.",
      ],
      ["    return s", "hand the message to the publisher."],
      ["", ""],
      [
        "# publisher.publish(DiagnosticArray(status=[status(0.59, 1, 41.0)]))",
        "publish once per second from a timer in the node.",
      ],
    ),
    walk: [
      "Two thresholds per value give the operator a warning before the error stops production.",
      "The values list carries the raw numbers, so the dashboard can draw trends and not only colours.",
      "The message text names the action, which is more useful to an operator than a code.",
    ],
    expect: [
      "rqt_robot_monitor shows scara_cell in green for normal values.",
      "Feeding 3 errors changes it to yellow and 6 errors to red.",
    ],
    fix: [
      [
        "The dashboard shows STALE.",
        "The publisher stopped or the rate is too low. Publish at least once per second, and treat missing messages as a warning.",
      ],
      [
        "Alarms flap between OK and WARN.",
        "Add hysteresis: clear the warning only when the value is clearly below the threshold.",
      ],
    ],
    exercise:
      "Add a 'cycles per minute' value and a warning when it falls 10 % below the average of the last hour.",
    checklist: [
      "Every alarm has a warning and an error level",
      "Raw values are published for trends",
      "Messages tell the operator what to do",
    ],
  }),
  lesson({
    title: "Gazebo SCARA simulation",
    summary:
      "Simulate the SCARA in Gazebo with position-controlled joints through gz_ros2_control.",
    goals: [
      "Add the ros2_control hardware block for simulated joints",
      "Load the controller configuration into the Gazebo plugin",
      "Check that all four joints follow commands",
    ],
    concept: [
      "To use the same controllers in simulation and on the real robot, the URDF carries a ros2_control block that names the hardware plugin and lists the joints with their command and state interfaces. In Gazebo the plugin is gz_ros2_control/GazeboSimSystem, and a second plugin element loads the controller configuration file.",
      "A SCARA joint is usually position-controlled. The prismatic axis needs sensible limits and damping, or it will oscillate in the simulator because of its small mass. Compare the simulated tool position with the forward kinematics to prove the simulation matches the model before using it to test anything else.",
    ],
    steps: [
      "Add the ros2_control block with four position joints to the URDF.",
      "Add the Gazebo plugin element pointing at the controllers file.",
      "Launch the simulation and the controller spawner.",
      "Command each joint separately and confirm it moves as expected.",
    ],
    example: xml(
      [
        '<ros2_control name="GazeboSimSystem" type="system">',
        "the hardware description for the simulator.",
      ],
      [
        "  <hardware><plugin>gz_ros2_control/GazeboSimSystem</plugin></hardware>",
        "use Gazebo's simulated hardware instead of a real driver.",
      ],
      [
        '  <joint name="joint_1"><command_interface name="position"/><state_interface name="position"/><state_interface name="velocity"/></joint>',
        "joint 1 takes position commands and reports position and velocity.",
      ],
      [
        '  <joint name="joint_2"><command_interface name="position"/><state_interface name="position"/><state_interface name="velocity"/></joint>',
        "the same for the elbow.",
      ],
      [
        '  <joint name="joint_3"><command_interface name="position"/><state_interface name="position"/><state_interface name="velocity"/></joint>',
        "the vertical axis.",
      ],
      [
        '  <joint name="joint_4"><command_interface name="position"/><state_interface name="position"/><state_interface name="velocity"/></joint>',
        "the tool rotation.",
      ],
      ["</ros2_control>", "end of the hardware block."],
      ["<gazebo>", "settings that only the simulator reads."],
      [
        '  <plugin filename="gz_ros2_control-system" name="gz_ros2_control::GazeboSimROS2ControlPlugin">',
        "the plugin that connects Gazebo to ros2_control.",
      ],
      [
        "    <parameters>$(find scara_bringup)/config/controllers.yaml</parameters>",
        "the controller configuration file from the previous lessons.",
      ],
      ["  </plugin>", "end of the plugin."],
      ["</gazebo>", "end of the simulator section."],
    ),
    walk: [
      "The ros2_control block is identical in structure to the one for real hardware; only the plugin name changes.",
      "The parameters element ties the simulated robot to the same controller file the real robot uses.",
      "Velocity states are requested even for position control, because some controllers and monitors need them.",
    ],
    expect: [
      "After launch, ros2 control list_hardware_interfaces shows all four joints.",
      "Commanding joint_3 to 0.1 m lowers the tool by 0.1 m in Gazebo and in tf2_echo.",
    ],
    fix: [
      [
        "The prismatic joint oscillates.",
        "Add joint damping and friction in the URDF <dynamics> element and reduce the controller gains.",
      ],
      [
        "Controllers never start.",
        "The controllers file path is wrong or use_sim_time is not set. Check the plugin's parameters element and the node parameters.",
      ],
    ],
    exercise:
      "Command a circle in x-y through inverse kinematics and compare the simulated path with the commanded one. Record the maximum deviation.",
    checklist: [
      "The same controllers run in simulation and reality",
      "All joints report position and velocity",
      "Simulated poses match forward kinematics",
    ],
  }),
  lesson({
    title: "Vision pipeline",
    summary:
      "Build a ROS 2 node that finds a part in an image and publishes its pose for the robot.",
    goals: [
      "Explain the stages of a simple vision pipeline",
      "Detect a part with thresholding and contours",
      "Publish the result as a stamped pose",
    ],
    concept: [
      "A vision pipeline turns an image into a target. The stages are: acquire the image, prepare it (undistort, crop, blur), segment the part (threshold, contours or a learned detector), measure its centre and angle, convert them to the robot frame and publish a message with a timestamp. Each stage can be tested on its own with saved images.",
      "Classical thresholding works well on a controlled background with controlled light, which is the common case in assembly. The message must carry the timestamp of the image, not the time of publishing, so downstream nodes can account for the delay. A detection that fails must publish nothing (or a flag), never an old result.",
    ],
    steps: [
      "Save five example images of the part in different positions.",
      "Threshold the image and find the largest contour.",
      "Compute its centre and orientation with minAreaRect.",
      "Publish the pose with the image's timestamp and check it in RViz.",
    ],
    example: hash(
      ["import cv2", "OpenCV for the image processing."],
      ["from cv_bridge import CvBridge", "converts ROS images to OpenCV arrays."],
      ["from geometry_msgs.msg import PoseStamped", "the message used to publish the result."],
      ["", ""],
      ["bridge = CvBridge()", "one converter for the node."],
      ["", ""],
      ["def on_image(msg, publisher):", "called for every camera image."],
      ["    img = bridge.imgmsg_to_cv2(msg, 'mono8')", "convert to a grey image."],
      [
        "    _, mask = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)",
        "separate the part from the background automatically (Otsu).",
      ],
      [
        "    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)",
        "outlines of the white regions.",
      ],
      ["    if not contours:", "nothing found in this image."],
      ["        return", "publish nothing; never re-send an old result."],
      [
        "    (cx, cy), _, angle = cv2.minAreaRect(max(contours, key=cv2.contourArea))",
        "centre and rotation of the largest region.",
      ],
      ["    out = PoseStamped()", "create the result message."],
      [
        "    out.header = msg.header",
        "keep the image's timestamp and frame, so consumers know when the part was seen.",
      ],
      [
        "    out.pose.position.x, out.pose.position.y = float(cx), float(cy)",
        "pixel position; converted to metres in the next node using the calibration.",
      ],
      [
        "    out.pose.orientation.z = float(angle)",
        "the rotation angle in degrees, stored in a spare field for this simple example.",
      ],
      ["    publisher.publish(out)", "send the detection to the rest of the cell."],
    ),
    walk: [
      "Otsu's method picks the threshold from the image itself, which tolerates small lighting changes.",
      "Copying the header keeps the image timestamp, which the conveyor-tracking and latency logic depend on.",
      "Publishing nothing on failure is safer than publishing zeros or an old pose.",
    ],
    expect: [
      "For each saved image the node prints a centre that matches the part when drawn on the image.",
      "An empty image produces no message.",
    ],
    fix: [
      [
        "The largest contour is the wrong object.",
        "Filter contours by area and aspect ratio, and control the background and lighting.",
      ],
      [
        "The angle jumps by 90 degrees.",
        "minAreaRect angle conventions differ between OpenCV versions. Normalise it and test with a rotated part.",
      ],
    ],
    exercise:
      "Convert the pixel centre to robot millimetres with the calibration from the next lesson and publish it in the robot frame.",
    checklist: [
      "The image timestamp is preserved",
      "No detection means no message",
      "Lighting and background are controlled",
    ],
  }),
  lesson({
    title: "Calibration routines",
    summary:
      "Fit a camera-to-robot mapping from measured point pairs with a least-squares affine transform.",
    goals: [
      "Explain why a top-down camera can use a 2D affine calibration",
      "Fit the transform from at least four point pairs",
      "Judge the result from its residual error",
    ],
    concept: [
      "For a camera looking straight down on a flat work plane, the mapping from pixels to robot x-y is close to an affine transform (rotation, scale, shear and translation): x = a·u + b·v + c and y = d·u + e·v + f. Six numbers describe it, so three point pairs are the minimum and more pairs average out measurement noise.",
      "To calibrate, the robot touches a target at several known positions, the camera detects it at each one, and the pairs (u, v) and (x, y) are collected. Solving by least squares gives the matrix, and the remaining residuals show how good the fit is. A residual larger than about a third of a pixel usually means a tilted camera or lens distortion that a 2D affine map cannot remove.",
    ],
    steps: [
      "Place the tool over a fiducial at nine positions spread over the field of view.",
      "Record the pixel position from the camera and the robot x-y at each one.",
      "Fit the affine matrix by least squares.",
      "Check the largest residual and repeat if it is too large.",
    ],
    example: hash(
      ["import numpy as np", "numpy for least squares."],
      ["", ""],
      [
        "def fit_affine(pixels, robot):",
        "pixels and robot are N x 2 arrays of matching points (N >= 3).",
      ],
      [
        "    P = np.hstack([np.asarray(pixels, float), np.ones((len(pixels), 1))])",
        "each row is (u, v, 1), so the translation is part of the fit.",
      ],
      [
        "    M, *_ = np.linalg.lstsq(P, np.asarray(robot, float), rcond=None)",
        "solve P @ M = robot for the 3x2 matrix M.",
      ],
      [
        "    residual = np.linalg.norm(P @ M - robot, axis=1)",
        "distance between the fitted and the measured robot position at every point.",
      ],
      ["    return M, residual", "the transform and how well it fits."],
      ["", ""],
      ["def to_robot(M, u, v):", "convert one detected pixel to robot coordinates."],
      ["    return np.array([u, v, 1.0]) @ M", "apply the fitted transform."],
      ["", ""],
      [
        "pix = [(100, 100), (500, 100), (500, 400), (100, 400), (300, 250)]",
        "pixel positions of five calibration points.",
      ],
      [
        "rob = [(120.0, 80.0), (200.0, 80.0), (200.0, 140.0), (120.0, 140.0), (160.0, 110.0)]",
        "the robot positions (mm) measured at those points: 0.2 mm per pixel.",
      ],
      ["M, res = fit_affine(pix, rob)", "fit the transform."],
      [
        "print(res.max().round(4), to_robot(M, 300, 250).round(2))",
        "the largest residual (about 0) and the mapped point: (160.0, 110.0).",
      ],
    ),
    walk: [
      "Appending a column of ones lets one matrix product handle rotation, scale and translation together.",
      "The residual is computed for every point, so a single bad measurement is easy to spot.",
      "The example data are perfectly linear, so the residual is almost zero; real data will show noise of a few hundredths of a millimetre.",
    ],
    expect: [
      "The largest residual for the example data is close to 0.0 mm.",
      "Mapping pixel (300, 250) gives (160.0, 110.0).",
    ],
    fix: [
      [
        "Residuals grow at the image edges.",
        "Lens distortion is present. Undistort the image before the fit, or use a homography or a higher-order fit.",
      ],
      [
        "The mapping is mirrored.",
        "The camera image may be flipped relative to the robot. The sign of the scale terms shows it; correct the mounting or the matrix.",
      ],
    ],
    exercise:
      "Add noise of 0.05 mm to the robot positions and study how the mean residual changes with 4, 9 and 25 calibration points.",
    checklist: [
      "Points cover the whole field of view",
      "The residual is checked after fitting",
      "Lens distortion is corrected first",
    ],
  }),
  lesson({
    title: "Safety zones",
    summary:
      "Check whether the tool is inside a configured zone and reduce speed or stop when a person is near.",
    goals: [
      "Define zones as polygons",
      "Test whether a point is inside a zone",
      "Map zones to speed limits, and explain what belongs to certified hardware",
    ],
    concept: [
      "A cell is divided into zones: a work zone where the robot moves at full speed, a slow zone where a person may be near, and a stop zone where the robot must not enter or must stop. Zones are polygons in the floor plan, and a point-in-polygon test tells which zone a position is in.",
      "Zones that protect people must be implemented with safety-rated hardware such as laser scanners, light curtains and safety PLCs with their own validated logic. The ROS 2 application uses the same zone information for scheduling and for early slow-down, which improves the work flow, but it never replaces the safety chain and it must never be the only protection.",
    ],
    steps: [
      "Define the work and slow zones as lists of corner points.",
      "Implement the point-in-polygon test.",
      "Map each zone to a speed factor.",
      "Test points inside and outside every zone.",
    ],
    example: hash(
      ["def inside(point, polygon):", "ray casting: is the point inside the polygon?"],
      ["    x, y = point", "the point's coordinates."],
      ["    hit = False", "count crossings by flipping this flag."],
      [
        "    for (x1, y1), (x2, y2) in zip(polygon, polygon[1:] + polygon[:1]):",
        "walk around every edge of the polygon.",
      ],
      [
        "        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:",
        "does a horizontal ray to the right of the point cross this edge?",
      ],
      ["            hit = not hit", "each crossing toggles inside and outside."],
      ["    return hit", "an odd number of crossings means the point is inside."],
      ["", ""],
      [
        "ZONES = [('stop', [(0.0, 0.0), (0.2, 0.0), (0.2, 0.2), (0.0, 0.2)], 0.0), ('slow', [(-0.2, -0.2), (0.4, -0.2), (0.4, 0.4), (-0.2, 0.4)], 0.25)]",
        "zones from the most to the least restrictive: name, corners (metres) and speed factor.",
      ],
      ["", ""],
      ["def speed_factor(point):", "how fast the robot may move at this position."],
      ["    for name, polygon, factor in ZONES:", "check the most restrictive zone first."],
      ["        if inside(point, polygon):", "is the tool in this zone?"],
      ["            return factor", "use the zone's speed factor."],
      ["    return 1.0", "in no special zone: full speed."],
      ["", ""],
      [
        "print(speed_factor((0.1, 0.1)), speed_factor((0.3, 0.3)), speed_factor((0.9, 0.9)))",
        "prints 0.0 0.25 1.0: stop zone, slow zone, free work area.",
      ],
    ),
    walk: [
      "Ordering the zones from most to least restrictive means the strictest applicable rule always wins.",
      "The polygon test is small and exact, so the same function can be unit tested with edge cases.",
      "This logic reduces speed for efficiency; the certified safety hardware still owns the protective stop.",
    ],
    expect: [
      "The three test points print 0.0, 0.25 and 1.0.",
      "Points exactly on an edge are handled consistently, which the exercise asks you to test.",
    ],
    fix: [
      [
        "A point is reported in the wrong zone.",
        "The polygon points are in the wrong order or coordinate frame. Plot the polygon and the test point to check.",
      ],
      [
        "The team relies on this code for personnel safety.",
        "Stop. Person protection needs certified devices and a validated safety function; this code only supports the process.",
      ],
    ],
    exercise:
      "Write unit tests for points on an edge, on a corner and just outside each zone, and decide which side each case belongs to.",
    checklist: [
      "Zones are checked from strict to loose",
      "Coordinate frames are consistent",
      "People are protected by certified hardware, not this code",
    ],
  }),
  lesson({
    title: "Full assembly cell project",
    summary:
      "Combine feeder, vision, placing, verification and error handling into one supervised assembly cell.",
    goals: [
      "Design the cell as a supervisor with clear states",
      "Connect vision, motion, I/O and safety checks in one cycle",
      "Handle errors by state, not by ad-hoc code",
    ],
    concept: [
      "A finished assembly cell is one system: a feeder brings parts, a camera finds them, the SCARA picks and places, a second check verifies the result, and a PLC starts and stops the line. A supervisor node owns the cell state and decides what happens next. Each subsystem does its own job and reports success or failure.",
      "A state machine keeps this understandable. Every state has one action and defined exits, including error exits, and every error ends in a state that is safe and visible: a stop state that waits for an operator. Counters and logs record every cycle and every failure, so the cell can be improved with data.",
    ],
    steps: [
      "Draw the states and transitions on paper: idle, pick, inspect, place, verify, error.",
      "Write the transition table in code.",
      "Connect the state actions to the real functions from the earlier lessons.",
      "Run 100 simulated cycles with injected failures and check the counters.",
    ],
    example: hash(
      ["TRANSITIONS = {", "the state machine as data: state, event -> next state."],
      ["    ('idle', 'start'): 'pick',", "the PLC requests a cycle."],
      [
        "    ('pick', 'ok'): 'inspect', ('pick', 'fail'): 'error',",
        "a good pick goes on; a failed pick is an error.",
      ],
      [
        "    ('inspect', 'ok'): 'place', ('inspect', 'bad_part'): 'pick',",
        "a bad part is discarded and the next one is picked.",
      ],
      [
        "    ('place', 'ok'): 'verify', ('place', 'fail'): 'error',",
        "a good placement is checked; a failure is an error.",
      ],
      [
        "    ('verify', 'ok'): 'idle', ('verify', 'bad'): 'error',",
        "a verified board finishes the cycle; a bad one stops the cell.",
      ],
      ["    ('error', 'reset'): 'idle',", "only an operator's reset leaves the error state."],
      ["}", "end of the table."],
      ["", ""],
      ["class Cell:", "the supervisor."],
      [
        "    def __init__(self, actions):",
        "actions maps a state name to the function that does the work.",
      ],
      [
        "        self.state, self.actions, self.log = 'idle', actions, []",
        "start idle, with an empty event log.",
      ],
      ["", ""],
      ["    def handle(self, event):", "process one event."],
      [
        "        nxt = TRANSITIONS.get((self.state, event))",
        "look up the next state; an unknown pair returns None.",
      ],
      ["        if nxt is None:", "the event is not allowed in this state."],
      ["            self.log.append(('rejected', self.state, event))", "record it; never guess."],
      ["            return", "stay in the current state."],
      [
        "        self.log.append((self.state, event, nxt))",
        "record every transition for later analysis.",
      ],
      ["        self.state = nxt", "move to the next state."],
      ["        if nxt in self.actions:", "does the new state have an action?"],
      [
        "            self.handle(self.actions[nxt]())",
        "run it and feed its result back in as the next event.",
      ],
    ),
    walk: [
      "The whole behaviour of the cell is one table, so it can be reviewed and tested without running a robot.",
      "Unknown events are rejected and logged, which prevents an out-of-order signal from causing motion.",
      "Only 'reset' leaves the error state, so a failure always needs an operator's decision.",
    ],
    expect: [
      "A simulated run of 100 cycles logs every transition, and injected failures always end in the error state.",
      "The counters show how many parts were placed, discarded and how many errors occurred.",
    ],
    fix: [
      [
        "The cell continues after a failure.",
        "A transition from an error state is missing an exit rule or an action swallows the failure. Test each error path.",
      ],
      [
        "The cell hangs in a state.",
        "An action never returns an event. Add timeouts to every action and turn a timeout into a 'fail' event.",
      ],
    ],
    exercise:
      "Add a 'no part' event to the pick state that goes to a waiting state, and limit the wait to 30 seconds before raising an error.",
    checklist: [
      "Every state has defined exits, including errors",
      "Error states need an operator reset",
      "Every transition is logged",
    ],
  }),
];
