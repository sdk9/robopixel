import { hash, cpp, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 02 · SCARA Robot — lessons 1–15 (Geometry & Kinematics, then the start of Assembly & Precision)
export const module02a: LessonSpec[] = [
  lesson({
    title: "SCARA architecture (RRP)",
    summary:
      "Understand the two horizontal revolute joints, the vertical prismatic axis and the tool rotation of a SCARA arm.",
    goals: [
      "Describe the R-R-P (plus tool rotation) joint structure of a SCARA",
      "Explain why SCARA arms are fast and rigid vertically but compliant sideways",
      "Compute the tool yaw from the joint angles",
    ],
    concept: [
      "SCARA stands for Selective Compliance Assembly Robot Arm. Two revolute joints with vertical axes (R-R) swing the arm in a horizontal plane, a prismatic joint (P) moves the tool up and down, and an optional fourth revolute joint rotates the tool about the vertical axis. That gives four degrees of freedom: x, y, z and yaw.",
      "Because all rotation axes are vertical, gravity does not load the two arm joints, so the arm can accelerate hard and repeat precisely in the plane. It is stiff in z and slightly compliant in x-y, which helps parts self-align while being inserted. It cannot tilt the tool, so it suits flat, top-down work such as electronics assembly.",
    ],
    steps: [
      "Sketch the SCARA from above and from the side and label joints 1 to 4.",
      "Mark which joints are revolute and which is prismatic and give each its unit.",
      "Write the formula for the tool yaw as the sum of the rotation joints.",
      "Compare with a datasheet and note the reach, stroke and rotation limits.",
    ],
    example: hash(
      ["from dataclasses import dataclass", "a small record type for the robot description."],
      ["", ""],
      ["@dataclass", "generate the constructor for the class below."],
      ["class Scara:", "geometry and limits of one SCARA robot."],
      ["    a1: float = 0.225", "length of link 1 in metres."],
      ["    a2: float = 0.175", "length of link 2 in metres."],
      ["    stroke: float = 0.150", "vertical travel of the prismatic axis in metres."],
      ["", ""],
      [
        "    def tool_yaw(self, q1, q2, q4):",
        "orientation of the tool about the vertical axis (radians).",
      ],
      [
        "        return q1 + q2 + q4",
        "all three rotations share the same vertical axis, so they simply add.",
      ],
      ["", ""],
      ["    def max_reach(self):", "largest horizontal distance from the base."],
      ["        return self.a1 + self.a2", "arm fully stretched."],
      ["", ""],
      ["robot = Scara()", "create the example robot."],
      [
        "print(robot.max_reach(), robot.tool_yaw(0.5, -0.2, 0.1))",
        "prints 0.4 and 0.4: reach in metres and yaw in radians.",
      ],
    ),
    walk: [
      "Only three lengths describe the geometry, which is why SCARA kinematics is short and easy to verify.",
      "The yaw is a plain sum because all rotation axes point the same way; on a six-axis arm this would need matrices.",
      "max_reach() is the outer edge of the cylindrical workspace covered in a later lesson.",
    ],
    expect: [
      "The script prints 0.4 for the reach and 0.4 for the yaw (0.5 - 0.2 + 0.1).",
      "You can explain why a SCARA is faster than an articulated arm for flat pick and place.",
    ],
    fix: [
      [
        "The tool yaw does not match the datasheet.",
        "Some robots define joint 4 relative to the ground, not to link 2. Check the datasheet's definition before adding angles.",
      ],
      [
        "The prismatic axis moves the wrong way.",
        "Positive z can mean up or down depending on the vendor. Check the sign in the manual and use it consistently.",
      ],
    ],
    exercise:
      "Add limits for all four joints to the Scara class and a method that returns True if a given joint set is inside the limits.",
    checklist: [
      "Joint types and axes are correct",
      "Yaw is computed from the correct joints",
      "Limits come from the datasheet",
    ],
  }),
  lesson({
    title: "DH modeling",
    summary: "Write the Denavit–Hartenberg table of a SCARA and build its forward transform.",
    goals: [
      "Fill a DH table for an R-R-P-R robot",
      "Identify the joint variable in each row",
      "Multiply the four joint transforms into one tool pose",
    ],
    concept: [
      "A SCARA DH table has four rows. Joints 1 and 2 are revolute with link lengths a1 and a2, joint 3 is prismatic with a variable offset d3, and joint 4 is revolute at the tool. All z axes are vertical or flipped, which is why alpha is 0 or π and the table is much simpler than the table of a six-axis arm.",
      "The prismatic axis usually points down, so the second link carries a twist of π and the vertical position falls as d3 grows. Sign conventions differ between vendors, which is why the first test of any model is to compare a few known poses against the manufacturer's numbers.",
    ],
    steps: [
      "Fill the table: (theta, d, a, alpha) for each of the four joints.",
      "Mark theta1, theta2, d3 and theta4 as the variables.",
      "Implement the DH transform and multiply the four rows in order.",
      "Compare the tool position at q = (0, 0, 0, 0) with the datasheet.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the matrices."],
      ["", ""],
      ["def dh(theta, d, a, alpha):", "standard DH transform of one joint."],
      [
        "    ct, st, ca, sa = np.cos(theta), np.sin(theta), np.cos(alpha), np.sin(alpha)",
        "trigonometric terms.",
      ],
      [
        "    return np.array([[ct, -st*ca, st*sa, a*ct], [st, ct*ca, -ct*sa, a*st], [0, sa, ca, d], [0, 0, 0, 1]])",
        "the 4x4 transform.",
      ],
      ["", ""],
      [
        "A1, A2, D1 = 0.225, 0.175, 0.300",
        "link lengths and the height of joint 2 above the base (metres).",
      ],
      ["", ""],
      ["def forward(q1, q2, d3, q4):", "tool pose for the four joint values."],
      ["    T = dh(q1, D1, A1, 0.0)", "row 1: rotate about z, link 1 of length A1."],
      [
        "    T = T @ dh(q2, 0.0, A2, np.pi)",
        "row 2: link 2 with a twist of pi, so the z axis points down.",
      ],
      [
        "    T = T @ dh(0.0, d3, 0.0, 0.0)",
        "row 3: prismatic joint, the offset d3 is the variable.",
      ],
      ["    T = T @ dh(q4, 0.0, 0.0, 0.0)", "row 4: tool rotation."],
      ["    return T", "the tool pose in the base frame."],
      ["", ""],
      [
        "print(forward(0, 0, 0.05, 0)[:3, 3].round(3))",
        "arm stretched, tool 5 cm down: prints [0.4 0. 0.25].",
      ],
    ),
    walk: [
      "The alpha of pi in row 2 flips the z axis, so a positive d3 lowers the tool.",
      "Only the joint values change between calls; the geometry constants stay fixed.",
      "The result at q = 0 is the stretched-out pose, which is the easiest one to check by hand.",
    ],
    expect: [
      "The printed position is [0.4 0. 0.25]: full reach along x, 0.30 m minus 0.05 m in z.",
      "Changing d3 moves the tool along z only.",
    ],
    fix: [
      [
        "Moving the prismatic joint raises the tool instead of lowering it.",
        "The z direction depends on the alpha of row 2. Compare with the vendor's convention and adjust the sign of d3 or alpha.",
      ],
      [
        "The x-y position is mirrored.",
        "One rotation direction is flipped. Test with q1 = 90 degrees and q2 = 0 and compare with the real robot.",
      ],
    ],
    exercise:
      "Compute the tool pose for ten random joint sets and check that x and y only depend on q1 and q2, and z only on d3.",
    checklist: [
      "The table matches the vendor's convention",
      "Forward kinematics is checked at known poses",
      "Units are metres and radians",
    ],
  }),
  lesson({
    title: "FK & IK derivation",
    summary:
      "Derive closed-form forward and inverse kinematics for a SCARA and pick the right arm posture.",
    goals: [
      "Write the forward kinematics equations for x, y, z and yaw",
      "Solve the two-link inverse kinematics with the law of cosines",
      "Return both arm postures and choose the closest to the current one",
    ],
    concept: [
      "For a SCARA the forward kinematics is short: x = a1·cos q1 + a2·cos(q1 + q2), y = a1·sin q1 + a2·sin(q1 + q2), z = z0 − d3 and yaw φ = q1 + q2 + q4. The planar part is a two-link arm, so inverse kinematics uses the law of cosines just like the earlier planar example.",
      "There are two solutions for the arm, often called left-handed and right-handed (elbow left or elbow right). The robot can normally reach the same point in both postures but cannot change posture without passing through the stretched singularity, so the controller must choose the solution matching the current posture, and reject targets that need a posture change in the middle of a straight line.",
    ],
    steps: [
      "Derive cos q2 = (x² + y² − a1² − a2²) / (2·a1·a2).",
      "Compute q2 with both signs of the sine and q1 for each.",
      "Compute d3 = z0 − z and q4 = φ − q1 − q2.",
      "Check both solutions with the forward equations.",
    ],
    example: cpp(
      ["struct Solution { double q1, q2, d3, q4; };", "one complete joint solution."],
      ["", ""],
      [
        "std::vector<Solution> ik(double x, double y, double z, double yaw, double a1, double a2, double z0) {",
        "all solutions for a target pose (empty if unreachable).",
      ],
      [
        "  const double c2 = (x * x + y * y - a1 * a1 - a2 * a2) / (2 * a1 * a2);",
        "law of cosines gives cos(q2).",
      ],
      [
        "  if (std::abs(c2) > 1.0) return {};",
        "outside -1..1 means the point is out of reach: no solution.",
      ],
      ["  std::vector<Solution> out;", "we will return up to two solutions."],
      [
        "  for (double sign : {1.0, -1.0}) {",
        "try both arm postures (elbow left and elbow right).",
      ],
      ["    const double s2 = sign * std::sqrt(1.0 - c2 * c2);", "sin(q2) with the chosen sign."],
      ["    const double q2 = std::atan2(s2, c2);", "elbow angle."],
      [
        "    const double q1 = std::atan2(y, x) - std::atan2(a2 * s2, a1 + a2 * c2);",
        "shoulder angle from the direction to the target minus the link-2 offset.",
      ],
      [
        "    out.push_back({q1, q2, z0 - z, yaw - q1 - q2});",
        "vertical joint from z, tool joint from the yaw that remains.",
      ],
      ["  }", "end of the posture loop."],
      ["  return out;", "the caller picks the posture closest to the current one."],
      ["}", "end of the function."],
    ),
    walk: [
      "The two loop passes give the two mirror-image postures with the same tool position.",
      "d3 and q4 are trivial once q1 and q2 are known, which is why SCARA IK is so cheap.",
      "Returning an empty list for unreachable targets forces the caller to handle failure.",
    ],
    expect: [
      "A reachable target returns two solutions; forward kinematics on either gives the target back.",
      "A target beyond the reach a1 + a2 returns an empty list.",
    ],
    fix: [
      [
        "The arm suddenly swings to the other posture.",
        "The solver chose the wrong solution. Pick the one closest to the current joint angles.",
      ],
      [
        "A straight-line move fails half-way.",
        "The line crosses the stretched-arm singularity or needs a posture change. Move the line or change posture with a joint move first.",
      ],
    ],
    exercise:
      "Add a chooser that takes the current joints and returns the solution with the smaller joint distance. Test it on a path of 50 points along a straight line.",
    checklist: [
      "Both postures are computed",
      "Unreachable targets are reported",
      "The solution closest to the current pose is used",
    ],
  }),
  lesson({
    title: "Cylindrical workspace",
    summary: "Describe the reachable region as a ring times a stroke and check targets against it.",
    goals: [
      "Explain the cylindrical shape of the SCARA workspace",
      "Compute the inner and outer radius from the link lengths",
      "Reject targets in the dead zone or beyond the stroke",
    ],
    concept: [
      "A SCARA reaches everything in a ring around its base: the outer radius is a1 + a2 and the inner radius is |a1 − a2|. In the vertical direction it is limited by the stroke of the prismatic axis. The result is a hollow cylinder, and the space around the base, inside the inner radius, is a dead zone the tool cannot reach.",
      "Joint limits cut the ring further: joint 1 and joint 2 do not turn a full circle, so a wedge behind the robot is also unreachable. When placing a feeder, conveyor and fixture, put every pick and place point comfortably inside the ring with a margin, and keep the stretched-arm region for slow moves because the robot is stiffest and most accurate away from the boundary.",
    ],
    steps: [
      "Compute the outer and inner radius from a1 and a2.",
      "Write a function that checks a target's radius and height.",
      "Add the joint-limit wedge by checking the reachable angles for q1 and q2.",
      "Test the corners of your planned work area.",
    ],
    example: hash(
      ["import math", "for the distance calculation."],
      ["", ""],
      ["A1, A2 = 0.225, 0.175", "link lengths in metres."],
      ["Z_MIN, Z_MAX = 0.0, 0.15", "vertical range of the tool in metres."],
      ["MARGIN = 0.01", "keep 1 cm away from the boundary."],
      ["", ""],
      ["def in_workspace(x, y, z):", "is the tool position reachable with a margin?"],
      ["    r = math.hypot(x, y)", "horizontal distance from the base axis."],
      [
        "    ok_ring = abs(A1 - A2) + MARGIN <= r <= A1 + A2 - MARGIN",
        "inside the ring: not in the dead zone and not at the limit of the reach.",
      ],
      ["    ok_height = Z_MIN <= z <= Z_MAX", "inside the stroke of the prismatic axis."],
      ["    return ok_ring and ok_height", "both conditions must hold."],
      ["", ""],
      [
        "print(in_workspace(0.30, 0.10, 0.05), in_workspace(0.02, 0.0, 0.05), in_workspace(0.45, 0.0, 0.05))",
        "prints True False False: a normal point, one in the dead zone, one beyond the reach.",
      ],
    ),
    walk: [
      "The margin is added on both edges, so planned positions are never right on the boundary.",
      "The inner radius is 0.05 m here, so a point 2 cm from the base cannot be reached.",
      "The height limit uses the actual stroke; a floor or fixture may make the useful range smaller.",
    ],
    expect: [
      "The three test points print True, False, False.",
      "You can sketch the top view of the workspace: a ring with a wedge cut out by the joint limits.",
    ],
    fix: [
      [
        "A target inside the ring is rejected.",
        "The margin or the joint-limit wedge excludes it. Print r and the joint angles to see which limit is the cause.",
      ],
      [
        "The tool crashes into the fixture.",
        "The workspace check ignores obstacles. Add a check for fixture volumes in the same function.",
      ],
    ],
    exercise:
      "Add the joint-limit wedge (q1 within ±2.4 rad, q2 within ±2.6 rad) to in_workspace by calling the inverse kinematics and checking the angles.",
    checklist: [
      "Targets keep a margin from the boundary",
      "The dead zone is respected",
      "Joint limits are part of the check",
    ],
  }),
  lesson({
    title: "Singularities",
    summary:
      "Find the stretched and folded singularities of a SCARA and slow down before reaching them.",
    goals: [
      "Locate the two singular configurations of the planar arm",
      "Compute the determinant of the planar Jacobian",
      "Scale the speed near a singularity",
    ],
    concept: [
      "The planar Jacobian of a SCARA has the determinant a1·a2·sin q2. It is zero when q2 = 0 (arm fully stretched) and when q2 = ±π (arm folded back on itself). At those poses the tip cannot move along the arm's direction, so a straight-line move through them demands infinite joint speed.",
      "The practical rule is to keep working targets away from the reach limit and the dead zone, and to slow down when |sin q2| becomes small. Joint moves pass through singularities safely because they do not need the Jacobian; straight-line moves in Cartesian space do not, so they should be checked before they start.",
    ],
    steps: [
      "Compute det J for elbow angles from 0 to π.",
      "Find where |det J| drops below 5 % of its maximum.",
      "Write a speed factor from |sin q2| and test it along a path.",
      "Mark the singular radii on the workspace sketch.",
    ],
    example: hash(
      ["import math", "for sine."],
      ["", ""],
      ["A1, A2 = 0.225, 0.175", "link lengths in metres."],
      ["", ""],
      ["def det_j(q2):", "determinant of the planar Jacobian."],
      ["    return A1 * A2 * math.sin(q2)", "zero for q2 = 0 and q2 = pi."],
      ["", ""],
      ["def speed_factor(q2, threshold=0.2):", "1.0 far from a singularity, falling to 0 near it."],
      ["    s = abs(math.sin(q2))", "how far the elbow is from straight or folded."],
      [
        "    return min(1.0, s / threshold)",
        "below the threshold the speed shrinks in proportion.",
      ],
      ["", ""],
      ["for q2 in (1.2, 0.4, 0.1, 0.0):", "from clearly bent to fully stretched."],
      [
        "    print(q2, round(det_j(q2), 4), round(speed_factor(q2), 2))",
        "the determinant and the allowed speed fall together.",
      ],
    ),
    walk: [
      "The determinant is a single sine, which is why singularities of a SCARA are easy to predict.",
      "The speed factor only limits Cartesian moves; a joint move can still cross the pose.",
      "The stretched pose (q2 = 0) is the practical limit of the reach, so targets should stay clear of it.",
    ],
    expect: [
      "The determinant and the speed factor both fall to zero at q2 = 0.",
      "For q2 = 1.2 the speed factor is 1.0, so full speed is allowed.",
    ],
    fix: [
      [
        "A straight-line move slows down to a crawl.",
        "The line passes close to the stretched pose. Move the line inward or use a joint move for that section.",
      ],
      [
        "The controller reports a singularity at a normal pose.",
        "Check that q2 is measured from the correct zero: some robots define the stretched pose as 90 degrees.",
      ],
    ],
    exercise:
      "Generate a straight line across the workspace and print the speed factor along it. Find the point where the line gets closest to the singularity.",
    checklist: [
      "Straight lines are checked for singularities",
      "Speed scales down near the stretched pose",
      "Working points stay away from the reach limit",
    ],
  }),
  lesson({
    title: "Compliance & stiffness",
    summary:
      "Estimate the Cartesian stiffness of the arm from its joint stiffness and see why SCARA is compliant in x-y.",
    goals: [
      "Explain selective compliance and why it helps assembly",
      "Compute the Cartesian stiffness matrix from the joint stiffness",
      "Find the stiffest and softest directions at a pose",
    ],
    concept: [
      "A SCARA is rigid in z (the prismatic axis is a stiff ball-screw) and comparatively compliant in the x-y plane, where the two rotary joints and their gearboxes flex. That selective compliance lets a peg slide into a hole even when it is a little misaligned, but it also means the tip deflects under side forces and the stiffness depends on the pose.",
      "With joint stiffness Kj (N·m per rad) and the planar Jacobian J, the Cartesian stiffness is K = J⁻ᵀ · Kj · J⁻¹. Its eigenvalues are the stiffness in the principal directions. Near a singularity K becomes very stiff along the arm and very soft across it, so accuracy under load changes over the workspace.",
    ],
    steps: [
      "Write the planar Jacobian for two joint angles.",
      "Assemble Kj as a diagonal matrix from the gearbox data.",
      "Compute K and its eigenvalues at two poses.",
      "Compare the stiffness of a bent pose with a nearly stretched pose.",
    ],
    example: hash(
      ["import numpy as np", "numpy for matrices and eigenvalues."],
      ["", ""],
      ["A1, A2 = 0.225, 0.175", "link lengths in metres."],
      [
        "KJ = np.diag([4.0e4, 3.0e4])",
        "joint stiffness in N*m/rad for joint 1 and 2 (from the gearbox datasheet).",
      ],
      ["", ""],
      ["def jacobian(q1, q2):", "planar Jacobian: tip velocity per joint velocity."],
      [
        "    s1, c1, s12, c12 = np.sin(q1), np.cos(q1), np.sin(q1 + q2), np.cos(q1 + q2)",
        "reused trigonometric terms.",
      ],
      [
        "    return np.array([[-A1*s1 - A2*s12, -A2*s12], [A1*c1 + A2*c12, A2*c12]])",
        "partial derivatives of the tip position.",
      ],
      ["", ""],
      ["def stiffness(q1, q2):", "principal Cartesian stiffness values in N/m."],
      ["    J = jacobian(q1, q2)", "the Jacobian at this pose."],
      ["    Ji = np.linalg.inv(J)", "invert it (valid away from singularities)."],
      ["    K = Ji.T @ KJ @ Ji", "convert the joint stiffness into Cartesian stiffness."],
      ["    return np.linalg.eigvalsh(K)", "the two principal stiffnesses, smallest first."],
      ["", ""],
      [
        "print(stiffness(0.3, 1.5).round(0), stiffness(0.3, 0.3).round(0))",
        "a bent pose versus an almost stretched pose.",
      ],
    ),
    walk: [
      "The matrix product turns joint-level stiffness into stiffness at the tool, which is what the process feels.",
      "The two eigenvalues are the softest and the stiffest direction; their ratio shows how anisotropic the arm is.",
      "Near the stretched pose the ratio grows large, which explains why precision assembly is done in the middle of the workspace.",
    ],
    expect: [
      "The stretched pose shows a much larger ratio between the two stiffnesses than the bent pose.",
      "You can predict the tip deflection for a 5 N side force: force divided by the stiffness in that direction.",
    ],
    fix: [
      [
        "The computed stiffness looks far too high or too low.",
        "Joint stiffness must be at the joint output in N·m/rad, after the gearbox, not the motor side.",
      ],
      [
        "The inverse fails.",
        "The pose is singular. Move away from q2 = 0 or π, or use a pseudo-inverse.",
      ],
    ],
    exercise:
      "Map the softest stiffness over a grid of x and y positions inside the workspace and mark where it drops below 20 kN/m.",
    checklist: [
      "Joint stiffness is at the output side",
      "Stiffness is checked at the working poses",
      "Precision tasks avoid the stretched region",
    ],
  }),
  lesson({
    title: "High-speed motion profiles",
    summary: "Build a gate-shaped pick path with lift, transfer and lower and estimate its time.",
    goals: [
      "Describe the standard gate (arch) path of a SCARA pick and place",
      "Generate waypoints with lift heights",
      "Estimate the time of each segment with a trapezoidal profile",
    ],
    concept: [
      "The classic SCARA cycle is a gate path: lift a few millimetres, move across at height, then lower onto the target. The vertical segments are short and the horizontal one is long. Keeping lifts small saves time, because a prismatic axis is slower than the rotary joints, and the arm can start moving sideways before the lift is complete by blending the corners.",
      "The cycle time of a segment follows the trapezoidal profile from the earlier arm lessons: accelerate, cruise, decelerate. Adding the times of all segments gives a cycle estimate before you run anything. Reducing the lift height or blending the corners cuts time, but the blend must keep enough clearance over parts and fixtures.",
    ],
    steps: [
      "Define the pick and place positions and a 15 mm lift height.",
      "Generate the six waypoints of the gate path.",
      "Estimate the time of each segment with the trapezoid function.",
      "Reduce the lift height to 8 mm and compare the total time.",
    ],
    example: hash(
      ["import math", "for the triangular profile."],
      ["", ""],
      ["def seg_time(d, vmax, amax):", "time for one rest-to-rest segment of length d."],
      ["    ramp = vmax**2 / amax", "distance needed to accelerate and brake once each."],
      ["    if d <= ramp:", "too short to reach the maximum speed: triangular profile."],
      ["        return 2 * math.sqrt(d / amax)", "accelerate to the middle, then brake."],
      ["    return d / vmax + vmax / amax", "cruise time plus the acceleration and braking time."],
      ["", ""],
      ["def gate(pick, place, lift):", "waypoints of a gate path (x, y, z in metres)."],
      [
        "    return [pick, (pick[0], pick[1], pick[2] + lift), (place[0], place[1], place[2] + lift), place]",
        "up, across, down.",
      ],
      ["", ""],
      [
        "def cycle(points, v_xy=2.0, a_xy=20.0, v_z=0.8, a_z=8.0):",
        "total time of the path with separate limits for xy and z.",
      ],
      ["    total = 0.0", "sum of all segment times."],
      ["    for p, q in zip(points, points[1:]):", "walk through the path segment by segment."],
      ["        dxy = math.hypot(q[0] - p[0], q[1] - p[1])", "horizontal distance."],
      ["        dz = abs(q[2] - p[2])", "vertical distance."],
      [
        "        total += max(seg_time(dxy, v_xy, a_xy) if dxy else 0.0, seg_time(dz, v_z, a_z) if dz else 0.0)",
        "xy and z move together, so the slower one sets the segment time.",
      ],
      ["    return total", "the estimated cycle time in seconds."],
      ["", ""],
      [
        "print(round(cycle(gate((0.2, 0.0, 0.0), (0.0, 0.25, 0.0), 0.015)), 3))",
        "cycle estimate for one way of the pick and place.",
      ],
    ),
    walk: [
      "Segments with both xy and z motion take the time of the slower axis, because they run in parallel.",
      "The triangular case matters here: the short vertical moves never reach their top speed.",
      "This is an estimate without blending; blended corners are shorter than the sum of the segments.",
    ],
    expect: [
      "The script prints a cycle time of about 0.43 seconds.",
      "Reducing the lift height from 15 mm to 8 mm lowers it to about 0.39 seconds.",
    ],
    fix: [
      [
        "The real cycle is slower than the estimate.",
        "Controller limits, jerk limits and settling times add up. Measure the real segments and update the limits.",
      ],
      [
        "The tool drags a part during the sideways move.",
        "The lift is too low for the part height. Set the lift from the part height plus a margin, not from the cycle time.",
      ],
    ],
    exercise:
      "Add corner blending by shortening each vertical segment by 30 % and estimate how much time it saves and how clearance changes.",
    checklist: [
      "Lift height is based on part height plus margin",
      "xy and z limits are separate",
      "Estimates are compared with measured cycle times",
    ],
  }),
  lesson({
    title: "Repeatability vs accuracy",
    summary:
      "Measure the difference between hitting the same point again and hitting the right point.",
    goals: [
      "Define repeatability and accuracy",
      "Compute both from measured positions",
      "Decide which one a task depends on",
    ],
    concept: [
      "Repeatability describes how close the tool comes to the same point when the same target is commanded repeatedly. Accuracy describes how close that point is to the target that was intended. A SCARA typically has a very good repeatability (±0.01 mm) and a worse accuracy, because the kinematic model has small errors in link lengths and zero offsets.",
      "Many tasks only need repeatability: if you teach a pick and place point by hand, the robot returns to that same point reliably. Accuracy matters when positions come from a model, a drawing or a camera in a different frame. Repeatability is measured as the spread of the results, and accuracy as the offset between their centre and the target.",
    ],
    steps: [
      "Command the same target 30 times, approaching from the same direction.",
      "Measure each reached position with a dial gauge, laser or a camera.",
      "Compute the centre of the results and the spread around it.",
      "Compare the centre with the commanded target.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the statistics."],
      ["", ""],
      [
        "def analyse(measured, target):",
        "measured: N x 2 array of reached positions (mm); target: (x, y) commanded (mm).",
      ],
      ["    measured = np.asarray(measured, float)", "make sure it is a numeric array."],
      ["    centre = measured.mean(axis=0)", "the average reached point."],
      [
        "    spread = np.linalg.norm(measured - centre, axis=1)",
        "how far each result is from the average.",
      ],
      [
        "    repeatability = 3 * spread.std(ddof=1)",
        "three standard deviations of the scatter: 99.7 % of the results fall within this.",
      ],
      [
        "    accuracy = np.linalg.norm(centre - np.asarray(target, float))",
        "distance between the average reached point and the intended target.",
      ],
      ["    return round(repeatability, 3), round(accuracy, 3)", "both in millimetres."],
      ["", ""],
      ["rng = np.random.default_rng(3)", "seeded generator for a repeatable example."],
      [
        "data = np.array([120.05, 80.10]) + rng.normal(0, 0.004, (30, 2))",
        "simulated results: 0.05 and 0.10 mm away from the target, with 4 micrometre scatter.",
      ],
      [
        "print(analyse(data, (120.0, 80.0)))",
        "the repeatability is small, the accuracy error is about 0.11 mm.",
      ],
    ),
    walk: [
      "The centre absorbs any constant offset, so repeatability measures only the scatter.",
      "Accuracy uses the same centre but compares it with the target, so it includes the systematic error.",
      "Approaching from a fixed direction keeps backlash out of the numbers, which is why the test specifies it.",
    ],
    expect: [
      "The printed repeatability is a few hundredths of a millimetre or less.",
      "The accuracy value is about 0.11 mm, matching the built-in 0.05 and 0.10 mm offsets.",
    ],
    fix: [
      [
        "Repeatability is worse than the datasheet.",
        "Check the fixture and gauge, thermal drift, loose tooling and the approach direction before blaming the robot.",
      ],
      [
        "Accuracy drifts between days.",
        "Temperature changes link lengths and joint offsets. Warm the robot up and recalibrate at the working temperature.",
      ],
    ],
    exercise:
      "Repeat the test approaching from opposite directions and report the extra scatter caused by backlash.",
    checklist: [
      "Approach direction is fixed during the test",
      "Repeatability and accuracy are reported separately",
      "The measuring device is better than the robot",
    ],
  }),
  lesson({
    title: "Joint calibration",
    summary: "Find the zero offsets of the joints using two known reference poses.",
    goals: [
      "Explain what a joint zero offset is",
      "Compute offsets from a known reference pose",
      "Verify the calibration with a second, independent pose",
    ],
    concept: [
      "An encoder measures rotation relative to where it was switched on or relative to a mechanical index. The zero offset is the difference between that reading and the joint angle the kinematic model expects. If the offsets are wrong by even 0.1 degree, the tool is off by about 0.7 mm at 400 mm reach, which is far more than the robot's repeatability.",
      "To calibrate, move the robot to a pose with a known joint configuration (a reference block, a mechanical pin or a fixture) and record the encoder values. The offset for each joint is the measured value minus the model value. A second, different reference pose should then be used to verify the result and not to compute it.",
    ],
    steps: [
      "Place the robot on the mechanical reference and record all encoder values.",
      "Compute the offsets against the known reference joint values.",
      "Apply the offsets in the controller or in the software model.",
      "Move to a second reference pose and check the residual error.",
    ],
    example: hash(
      ["import numpy as np", "numpy for vector arithmetic."],
      ["", ""],
      [
        "def offsets(encoder, reference):",
        "zero offsets in radians for all joints (encoder minus what the model expects).",
      ],
      [
        "    return np.asarray(encoder, float) - np.asarray(reference, float)",
        "the constant difference to remove from every reading.",
      ],
      ["", ""],
      ["def corrected(encoder, off):", "joint angles with the zero offset removed."],
      [
        "    return np.asarray(encoder, float) - off",
        "subtract the offsets from any later reading.",
      ],
      ["", ""],
      ["ref_a = [0.0, 0.0, 0.0]", "reference pose A: joints straight, as defined by the fixture."],
      [
        "read_a = [0.0031, -0.0018, 0.0007]",
        "what the encoders report at pose A (radians): the raw readings.",
      ],
      ["off = offsets(read_a, ref_a)", "the offsets: about 0.18, -0.10 and 0.04 degrees."],
      ["", ""],
      ["ref_b = [1.5708, -1.5708, 0.0]", "verification pose B, chosen independently."],
      ["read_b = [1.5739, -1.5726, 0.0007]", "raw encoder values at pose B."],
      [
        "print(np.degrees(corrected(read_b, off) - ref_b).round(3))",
        "residual error in degrees: near zero means the calibration is good.",
      ],
    ),
    walk: [
      "The offset is a pure subtraction, so the correction is easy to apply in one place.",
      "Pose B is used only to verify; if it were used to compute the offsets the check would prove nothing.",
      "The residual is printed in degrees because that is how people judge the size of an angular error.",
    ],
    expect: [
      "The three residuals are near 0.000 degrees after the correction.",
      "Without the correction, pose B shows errors of about 0.18 and 0.10 degrees.",
    ],
    fix: [
      [
        "Residuals are large at pose B.",
        "There is a kinematic error beyond the zero offset, such as a wrong link length. Use more poses and a least-squares calibration.",
      ],
      [
        "Offsets change after a power cycle.",
        "The encoder is incremental and needs homing. Home the robot on its index before applying offsets.",
      ],
    ],
    exercise:
      "Extend the code to compute offsets from four poses by least squares and print the largest residual over all poses.",
    checklist: [
      "The reference pose is a mechanical fact, not a guess",
      "Verification uses a different pose",
      "Homing is done before applying offsets",
    ],
  }),
  lesson({
    title: "Tool frame setup",
    summary:
      "Define the tool offset in x, y, z and yaw and convert between tool and flange positions.",
    goals: [
      "Describe the tool frame of a SCARA",
      "Compute the flange pose that puts the tool at a target",
      "Verify the tool frame by rotating around a fixed point",
    ],
    concept: [
      "The controller commands the flange pose. The tool frame is an offset from the flange to the tool tip: dx, dy and dz plus a rotation about z. To place the tool tip at a target, the controller subtracts the rotated tool offset from that target. If the offset is wrong, the tip is off, and the error changes with the tool yaw.",
      "The quickest test is a rotation check: mark a point on the table, put the tool tip on it, then rotate the tool about z by different angles. If the tip stays on the mark, the x and y offset are right. A z check uses a touch on a known surface. Every tool change needs its own tested tool frame.",
    ],
    steps: [
      "Measure dx, dy and dz of the tool tip relative to the flange centre.",
      "Write the function that converts a tool target to a flange target.",
      "Rotate the tool 90 degrees and check that the tip does not move.",
      "Store the tool frames in a configuration file, one per tool.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the rotation."],
      ["", ""],
      ["def rot(phi):", "2D rotation matrix for an angle phi (radians)."],
      ["    c, s = np.cos(phi), np.sin(phi)", "cosine and sine of the angle."],
      ["    return np.array([[c, -s], [s, c]])", "standard rotation matrix."],
      ["", ""],
      [
        "def flange_for_tool(tool_xy, tool_z, yaw, offset):",
        "flange position that puts the tool tip at (tool_xy, tool_z) with the given yaw.",
      ],
      ["    dx, dy, dz = offset", "the tool offset measured in the flange frame."],
      [
        "    xy = np.asarray(tool_xy, float) - rot(yaw) @ np.array([dx, dy])",
        "rotate the offset into the world and subtract it.",
      ],
      ["    return xy, tool_z - dz", "the vertical offset just subtracts."],
      ["", ""],
      ["offset = (0.020, 0.000, 0.085)", "the tip is 20 mm off-centre and 85 mm below the flange."],
      ["for yaw in (0.0, np.pi / 2):", "two different tool orientations for the same tip target."],
      [
        "    print(flange_for_tool((0.300, 0.100), 0.050, yaw, offset))",
        "the flange target changes with the yaw so that the tip target stays the same.",
      ],
    ),
    walk: [
      "The offset is rotated by the yaw, which is why the flange position must change when only the yaw changes.",
      "If dx and dy are both zero the tool is on the axis and the yaw does not matter for the position.",
      "The z offset is independent of the yaw for a SCARA because its tool axis is vertical.",
    ],
    expect: [
      "For yaw 0 the flange x is 0.280; for yaw 90 degrees the flange x is 0.300 and y is 0.080.",
      "In the rotation test on the real robot the tip stays on the mark within the repeatability.",
    ],
    fix: [
      [
        "The tip moves in a circle when the tool is rotated.",
        "The x and y offsets are wrong. Adjust them until the tip stays on the mark.",
      ],
      [
        "The tool touches the table too early or too late.",
        "The dz offset is wrong or the tool is loose. Re-touch the surface and update the value.",
      ],
    ],
    exercise:
      "Write the inverse function that computes the tool tip position from a flange position and yaw, and check that the two functions cancel each other.",
    checklist: [
      "One verified tool frame per tool",
      "The tip stays put in a rotation test",
      "z offset is verified with a touch",
    ],
  }),
  lesson({
    title: "Electronics assembly workflows",
    summary:
      "Break a board assembly into pick, inspect, place and verify steps with clear failure handling.",
    goals: [
      "Describe the steps of an electronics assembly cycle",
      "Write the cycle as a table of steps with checks",
      "Route a failed step to a defined recovery",
    ],
    concept: [
      "Electronics assembly on a SCARA usually means picking components from a feeder or tray, checking them, placing them on a board, and verifying the result. Each step has a fixed order and each step can fail: the feeder can be empty, the vacuum can fail, the part can be off-centre or the placement can be out of tolerance.",
      "A reliable workflow is written as a table of steps: what to do, what to check afterwards and what to do when the check fails. That keeps the failure handling visible and testable instead of being buried in nested if statements. Counting failures per step also tells you where to improve the process.",
    ],
    steps: [
      "List the steps of one cycle: pick, inspect, place, verify.",
      "For every step write the check that proves it succeeded.",
      "For every check write what happens when it fails (retry, skip or stop).",
      "Run the workflow with a simulated failure and check the counters.",
    ],
    example: hash(
      ["STEPS = [", "the whole cycle as data: name, action, check, action if it fails."],
      [
        "    ('pick', 'pick_part', 'vacuum_ok', 'retry'),",
        "pick from the feeder; the vacuum must reach the setpoint; otherwise retry.",
      ],
      [
        "    ('inspect', 'move_to_camera', 'part_ok', 'discard'),",
        "look at the part; if it is defective, throw it away.",
      ],
      [
        "    ('place', 'place_part', 'placed', 'retry'),",
        "place on the board; confirm the placement.",
      ],
      [
        "    ('verify', 'move_to_camera', 'position_ok', 'stop'),",
        "check the placed part; a bad placement stops the line.",
      ],
      ["]", "end of the table."],
      ["", ""],
      [
        "def run_cycle(robot, max_retry=2):",
        "execute the steps and handle failures as the table says.",
      ],
      ["    for name, action, check, on_fail in STEPS:", "go through the steps in order."],
      [
        "        for attempt in range(max_retry + 1):",
        "the first try plus a limited number of retries.",
      ],
      ["            getattr(robot, action)()", "call the action by name."],
      ["            if getattr(robot, check)():", "did the check pass?"],
      ["                break", "yes: continue with the next step."],
      [
        "            robot.count_failure(name)",
        "record the failure so the process can be improved.",
      ],
      [
        "            if on_fail != 'retry' or attempt == max_retry:",
        "no retry allowed, or the retries are used up.",
      ],
      ["                return on_fail", "leave the cycle with 'discard' or 'stop'."],
      ["    return 'done'", "all steps succeeded."],
    ),
    walk: [
      "The step table can be reviewed by a process engineer without reading any control code.",
      "Retries are limited, so a stuck feeder ends in a defined action instead of an endless loop.",
      "count_failure() gives a per-step failure count, which shows which step to fix first.",
    ],
    expect: [
      "With a failing vacuum check, the cycle retries twice and then reports the step's failure action.",
      "The failure counters show that the pick step failed three times.",
    ],
    fix: [
      [
        "The line stops too often.",
        "Use the counters to find the weak step. A retry with a small position offset often fixes feeder problems.",
      ],
      [
        "A bad placement is not noticed.",
        "Verify with a camera or a force check after the place step, not only the placing move.",
      ],
    ],
    exercise:
      "Add a 'rework' outcome for the verify step that removes the part and places a new one, with a limit of one rework per board.",
    checklist: [
      "Every step has a check",
      "Failures have defined actions",
      "Failure counts are recorded",
    ],
  }),
  lesson({
    title: "Press-fit operations",
    summary:
      "Press a part into a bore with force monitoring and decide success from the force–depth curve.",
    goals: [
      "Describe how a press-fit differs from a free placement",
      "Monitor force during insertion and stop on limit",
      "Decide success from the final depth and peak force",
    ],
    concept: [
      "In a press-fit the part is slightly larger than the hole, so it must be pushed in against friction. The insertion force rises as the part enters and levels at the friction force; at the bottom it rises steeply. A good press-fit has a force in an expected range and stops at a target depth.",
      "The robot presses in small steps while reading the force from a sensor or the motor current. It stops when the target depth is reached, when the force exceeds a hard limit (a jam or misalignment) or when the depth is reached with too little force (a worn or oversized hole). All three outcomes are recorded.",
    ],
    steps: [
      "Set the target depth, the expected force window and the hard force limit.",
      "Press downward in 0.2 mm steps and read the force after each step.",
      "Stop on the hard limit or at the target depth.",
      "Classify the result from the depth and the peak force.",
    ],
    example: hash(
      [
        "def press_fit(robot, depth=3.0, f_min=40.0, f_max=180.0, hard=250.0, step=0.2):",
        "insert a part; depths in mm, forces in N.",
      ],
      ["    z, peak = 0.0, 0.0", "current depth and the largest force seen."],
      ["    while z < depth:", "keep pressing until the target depth."],
      ["        robot.move_down(step)", "press 0.2 mm deeper."],
      ["        z += step", "update the depth."],
      ["        f = robot.force()", "read the force after this step."],
      ["        peak = max(peak, f)", "remember the peak force."],
      ["        if f > hard:", "a jam or a misaligned part."],
      ["            robot.retract()", "back off immediately."],
      ["            return 'jam'", "report the failure."],
      [
        "    return 'ok' if f_min <= peak <= f_max else 'suspect'",
        "success only if the peak force is inside the expected window; otherwise flag the part.",
      ],
    ),
    walk: [
      "Small steps with a force check after each one make the press stop quickly when something is wrong.",
      "The hard limit is checked on every step, and the response is to retract, not to continue.",
      "The force window catches parts that went in too easily, which the depth alone would not show.",
    ],
    expect: [
      "A good part returns 'ok' with a peak force inside 40–180 N.",
      "A misaligned part returns 'jam' and the tool retracts before the force gets high.",
    ],
    fix: [
      [
        "Good parts are flagged as suspect.",
        "The force window is too narrow. Measure a set of good parts and set the window from that data.",
      ],
      [
        "The force reading is noisy.",
        "Filter the reading over several samples and check the sensor's mounting and cabling.",
      ],
    ],
    exercise:
      "Record the force at each step for ten parts and plot the force against depth. Set the window from the mean plus and minus three standard deviations.",
    checklist: [
      "A hard force limit stops the press",
      "The force window comes from measured good parts",
      "Every result is recorded",
    ],
  }),
  lesson({
    title: "Peg-in-hole strategies",
    summary:
      "Use a spiral search and compliance to find the hole when position error is larger than the clearance.",
    goals: [
      "Explain why small clearances need a search or compliance",
      "Generate a spiral search path",
      "Detect success from a drop in height",
    ],
    concept: [
      "When the clearance between peg and hole is smaller than the position error, a plain vertical move lands on the edge and jams. Two remedies are used together: passive compliance (the SCARA's compliant x-y plane or a compliant tool) lets the peg slide toward the hole once it touches, and an active search moves the peg in a pattern until it drops in.",
      "A spiral is the standard search pattern because it covers the area around the nominal position evenly and without gaps, starting with small radii. The robot presses lightly down while spiralling and watches the z position or force: when the peg finds the hole it drops, and the search stops. A maximum radius limits the search so a missing hole does not run forever.",
    ],
    steps: [
      "Set the pitch of the spiral to about half the clearance.",
      "Generate spiral points around the nominal hole position up to a maximum radius.",
      "Move to each point with a light downward force and check the z drop.",
      "Stop on success or at the maximum radius, and report which happened.",
    ],
    example: hash(
      ["import math", "for the spiral."],
      ["", ""],
      [
        "def spiral(cx, cy, pitch=0.2, r_max=2.0, step=0.1):",
        "search points (mm) around the nominal hole (cx, cy).",
      ],
      ["    points, theta = [], 0.0", "collected points and the running angle."],
      ["    while True:", "extend the spiral until the maximum radius."],
      [
        "        r = pitch * theta / (2 * math.pi)",
        "the Archimedean spiral: the radius grows steadily with the angle.",
      ],
      ["        if r > r_max:", "outside the search area."],
      ["            break", "stop generating points."],
      [
        "        points.append((cx + r * math.cos(theta), cy + r * math.sin(theta)))",
        "convert the polar coordinates to x and y.",
      ],
      [
        "        theta += step / max(r, step)",
        "smaller angle steps at large radii keep the point spacing near constant.",
      ],
      ["    return points", "the ordered search path."],
      ["", ""],
      ["def insert(robot, cx, cy):", "search until the peg drops into the hole."],
      ["    for x, y in spiral(cx, cy):", "visit the points in order."],
      ["        robot.move_xy(x, y)", "shift the peg to this point."],
      ["        robot.press_light()", "press down with a small force, not a hard push."],
      [
        "        if robot.dropped(1.0):",
        "did the peg go 1 mm deeper than the surface? Then it is in the hole.",
      ],
      ["            return True", "success."],
      ["    return False", "hole not found: report so a person or another strategy can react."],
    ),
    walk: [
      "The pitch is chosen from the clearance, so the spiral cannot step over the hole.",
      "Pressing lightly keeps the peg from jamming on the edge and lets compliance pull it in.",
      "The maximum radius bounds the search time, and a returned False makes a missing hole visible.",
    ],
    expect: [
      "With a position error of 0.4 mm and a clearance of 0.3 mm the search finds the hole within about a second.",
      "With no hole, the function returns False after the last point.",
    ],
    fix: [
      [
        "The peg jams at the edge.",
        "The pressing force is too high or the peg is not chamfered. Reduce the force and check the chamfers.",
      ],
      [
        "The search takes too long.",
        "Improve the initial position with vision or reduce the pitch only as far as needed.",
      ],
    ],
    exercise:
      "Simulate a hole with a random offset of up to 1 mm and measure the mean number of points the spiral needs for pitches of 0.1, 0.2 and 0.4 mm.",
    checklist: [
      "The spiral pitch is smaller than the clearance",
      "Contact force is kept low during the search",
      "The search has a maximum radius",
    ],
  }),
  lesson({
    title: "Vision alignment",
    summary:
      "Correct the pick and place position with a camera measurement of the part's offset and rotation.",
    goals: [
      "Convert a measured part pose into a robot pick pose",
      "Compute the rotation correction for the tool",
      "Reject parts whose measured offset is out of range",
    ],
    concept: [
      "Parts on a feeder or tray are never exactly where the program expects. A camera measures the part's position and angle, and the robot corrects its pick pose so the gripper meets the part exactly. For a SCARA this is a 2D problem: an x-y offset and a rotation about z.",
      "The measurement is made in the camera frame and must be converted to the robot frame with the calibration transform. A sanity check compares the measured offset with the largest offset the process can produce, because a huge offset usually means a wrong detection, not a wildly placed part. Those parts are rejected instead of being picked.",
    ],
    steps: [
      "Detect the part and read its centre and angle in the camera frame.",
      "Convert them into the robot frame with the camera-to-robot transform.",
      "Compute the pick pose: position plus the tool yaw that matches the part angle.",
      "Reject measurements outside the allowed offset window.",
    ],
    example: hash(
      ["import math", "for the angle handling."],
      ["", ""],
      ["MAX_OFFSET = 5.0", "the largest believable offset from the nominal position (mm)."],
      ["", ""],
      [
        "def pick_pose(measured, nominal):",
        "measured and nominal are (x, y, angle) with x and y in mm and angle in degrees, in the robot frame.",
      ],
      [
        "    dx, dy = measured[0] - nominal[0], measured[1] - nominal[1]",
        "how far the part is from the taught position.",
      ],
      ["    if math.hypot(dx, dy) > MAX_OFFSET:", "more than the process can produce?"],
      ["        return None", "probably a wrong detection: do not pick."],
      [
        "    dtheta = (measured[2] - nominal[2] + 180.0) % 360.0 - 180.0",
        "the shortest rotation between the two angles (-180 to 180 degrees).",
      ],
      [
        "    return measured[0], measured[1], nominal[2] + dtheta",
        "go to the part's position and rotate the tool by the measured angle.",
      ],
      ["", ""],
      [
        "print(pick_pose((100.8, 50.4, 12.0), (100.0, 50.0, 0.0)))",
        "a small offset and a 12 degree rotation: a valid pick pose.",
      ],
      [
        "print(pick_pose((110.0, 50.0, 0.0), (100.0, 50.0, 0.0)))",
        "a 10 mm offset: prints None because it is outside the window.",
      ],
    ),
    walk: [
      "The offset window guards against false detections, which is the most common vision failure.",
      "The modulo expression finds the shortest way round, so a part at 179 degrees is not rotated by -181.",
      "Returning None makes 'do not pick' an explicit case that the caller must handle.",
    ],
    expect: [
      "The first call returns (100.8, 50.4, 12.0), and the second returns None.",
      "Rotating the part by 180 degrees still gives a valid, shortest rotation.",
    ],
    fix: [
      [
        "The gripper always lands slightly to one side.",
        "The camera-to-robot calibration has a small offset. Recalibrate with a grid of known points.",
      ],
      [
        "Parts with a symmetric shape are rotated by 90 degrees wrongly.",
        "Symmetric parts have several equivalent angles. Reduce the angle modulo the part's symmetry.",
      ],
    ],
    exercise:
      "Handle a part with 180 degree symmetry by reducing the rotation to the range -90 to 90 degrees and show that the tool never turns more than a quarter turn.",
    checklist: [
      "Offsets are converted into the robot frame",
      "Out-of-window detections are rejected",
      "Rotation takes the shortest path",
    ],
  }),
  lesson({
    title: "Conveyor synchronization",
    summary:
      "Work out how fast a belt can run for a SCARA to pick moving parts and where to place the pick window.",
    goals: [
      "Explain tracking a moving conveyor with a SCARA",
      "Compute the maximum belt speed for a given pick window and cycle time",
      "Choose the pick window position inside the workspace",
    ],
    concept: [
      "To pick from a moving belt the robot follows the part at belt speed, closes the gripper and lifts. Parts are only reachable while they are inside the pick window, the part of the belt inside the robot's workspace. A part moves through a window of length L at speed v in L / v seconds, and the robot needs its cycle time to pick and return.",
      "That gives a simple capacity rule: the number of parts the robot can pick per minute is limited by both the cycle time and the window time. The window should be placed where the robot is stiffest and fastest, normally in the middle of the workspace, and parts should be picked first-in first-out so none escape the window.",
    ],
    steps: [
      "Measure the length of the pick window along the belt.",
      "Compute how long a part stays inside it at the belt speed.",
      "Compare with the robot's pick time and find the maximum belt speed.",
      "Compute the parts per minute from the cycle time.",
    ],
    example: hash(
      ["def window_time(length_m, belt_speed):", "seconds a part stays inside the pick window."],
      ["    return length_m / belt_speed", "distance divided by speed."],
      ["", ""],
      [
        "def max_belt_speed(length_m, pick_time):",
        "fastest belt for which a part can still be picked.",
      ],
      [
        "    return length_m / pick_time",
        "the part must stay in the window at least as long as a pick takes.",
      ],
      ["", ""],
      ["def parts_per_minute(cycle_time, window_t):", "throughput limit of one robot."],
      ["    per_cycle = 60.0 / cycle_time", "cycles per minute from the robot's speed."],
      [
        "    return per_cycle",
        "each cycle handles one part; the window only decides whether the part is reachable.",
      ],
      ["", ""],
      ["L = 0.25", "pick window length in metres."],
      [
        "print(window_time(L, 0.20), max_belt_speed(L, 0.6), round(parts_per_minute(0.5, 1.25)))",
        "1.25 s in the window at 0.2 m/s; a 0.6 s pick allows up to 0.417 m/s; 120 parts per minute.",
      ],
    ),
    walk: [
      "The window time and the pick time are compared directly, which turns the layout into two numbers.",
      "Throughput is set by whichever is slower: the cycle time or the rate at which parts arrive.",
      "Real systems add tracking error and camera latency, which shorten the usable window; keep a margin.",
    ],
    expect: [
      "The script prints 1.25, about 0.417 and 120 for the example values.",
      "Doubling the belt speed halves the window time and leaves less time for the pick.",
    ],
    fix: [
      [
        "Parts are missed at the edge of the window.",
        "The usable window is shorter than the geometric one. Subtract the tracking start-up distance and the latency travel.",
      ],
      [
        "Parts stack up faster than the robot can pick.",
        "Add a second robot downstream, or reduce the feed rate; the belt should not run faster than one robot can handle.",
      ],
    ],
    exercise:
      "Include a 50 ms camera latency in the calculation and compute the shortened usable window at 0.3 m/s.",
    checklist: [
      "Window time exceeds pick time with a margin",
      "Latency is subtracted from the window",
      "The window sits in the stiff middle of the workspace",
    ],
  }),
];
