import { hash, cpp, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 03 · Delta Parallel Robot — lessons 1–15 (Parallel Kinematics, then High-Speed Applications)
export const module03a: LessonSpec[] = [
  lesson({
    title: "Delta robot architecture",
    summary:
      "Understand the three parallelogram arms, the fixed base and the light moving platform of a delta robot.",
    goals: [
      "Describe how three arms with parallelogram forearms move a platform in x, y and z",
      "Explain why a delta is so fast",
      "Name the four geometry parameters used in the kinematics",
    ],
    concept: [
      "A delta robot hangs from a fixed base. Three identical arms are spaced 120 degrees apart, each with a motor at the base driving an upper arm. The end of each upper arm connects to the moving platform through a light parallelogram of two parallel rods, which keeps the platform level. Only the motors move; the moving parts are light carbon rods and a small platform.",
      "Because the motors are fixed and the moving mass is small, deltas reach accelerations of many g and pick more than a hundred parts per minute. The platform can only translate (three degrees of freedom); a fourth rotating axis is added through a telescopic shaft for orienting the tool. Four numbers describe the geometry: the base radius f, the platform radius e, the upper arm length rf and the rod length re.",
    ],
    steps: [
      "Sketch the delta from above and from the side and label base, upper arms, rods and platform.",
      "Mark the three motor axes and the 120 degree spacing.",
      "Write the four geometry parameters with real values from a datasheet.",
      "Explain in two sentences why the platform stays level.",
    ],
    example: hash(
      ["from dataclasses import dataclass", "a small record type for the robot description."],
      ["import math", "for the 120 degree spacing."],
      ["", ""],
      ["@dataclass", "generate the constructor for the class below."],
      ["class Delta:", "the geometry of one delta robot (all lengths in millimetres)."],
      ["    f: float = 457.3", "side length of the fixed base triangle."],
      ["    e: float = 115.0", "side length of the moving platform triangle."],
      ["    rf: float = 112.0", "upper arm (bicep) length driven by the motor."],
      [
        "    re: float = 232.0",
        "rod (forearm) length, a parallelogram that keeps the platform level.",
      ],
      ["", ""],
      ["    def motor_angles(self):", "the three motors sit 120 degrees apart around the base."],
      [
        "        return [0.0, math.radians(120.0), math.radians(240.0)]",
        "each arm's direction in the base plane.",
      ],
      ["", ""],
      ["robot = Delta()", "create the example robot."],
      [
        "print([round(math.degrees(a)) for a in robot.motor_angles()])",
        "prints [0, 120, 240]: three identical arms evenly spaced.",
      ],
    ),
    walk: [
      "Four numbers are enough to describe the whole mechanism, which is why delta kinematics can be written in a few lines.",
      "The motors stay on the base, so the moving mass is only the arms, rods and platform.",
      "The 120 degree spacing is used again in the inverse kinematics by rotating the target into each arm's plane.",
    ],
    expect: [
      "The script prints [0, 120, 240].",
      "You can explain why the platform cannot rotate and how a fourth axis is added.",
    ],
    fix: [
      [
        "Kinematics results are off by a constant factor.",
        "f and e are triangle side lengths in some formulas and radii in others. Check the definition used by the equations you copy.",
      ],
      [
        "The model does not match the real robot.",
        "Vendors publish the arm and rod lengths; measure the real robot to confirm them before trusting the model.",
      ],
    ],
    exercise:
      "Look up a real delta robot datasheet and fill the Delta class with its values, then compute its work envelope height and diameter from the datasheet numbers.",
    checklist: [
      "The four geometry parameters are correct",
      "Units are millimetres or metres, never mixed",
      "You can explain why the platform stays level",
    ],
  }),
  lesson({
    title: "FK & IK nonlinear equations",
    summary:
      "Solve the inverse kinematics of the delta in closed form and the forward kinematics numerically.",
    goals: [
      "Solve the motor angle of one arm from the platform position",
      "Rotate the target to solve the other two arms",
      "Find the forward kinematics by solving the inverse equations numerically",
    ],
    concept: [
      "Inverse kinematics of a delta is easy in closed form: each arm's forearm rod can be treated as a sphere of radius re around the platform's attachment point, and the upper arm's end moves on a circle of radius rf. Their intersection gives the elbow joint position and from it the motor angle. The other two arms use the same function after rotating the target by plus and minus 120 degrees.",
      "Forward kinematics (motor angles to platform position) is the intersection of three spheres, which is a nonlinear problem with two solutions, one below and one above the base. In practice it is solved numerically by searching for the position whose inverse kinematics reproduces the given angles, starting from a good guess such as the current position. This is fast enough for the control loop.",
    ],
    steps: [
      "Implement the single-arm angle function with the discriminant check.",
      "Rotate the target by ±120 degrees for the other arms.",
      "Verify that a target on the vertical axis gives three equal angles.",
      "Solve forward kinematics numerically and check that it reproduces the target.",
    ],
    example: hash(
      ["import math", "trigonometric functions."],
      [
        "from scipy.optimize import fsolve",
        "a numerical equation solver, used for forward kinematics.",
      ],
      ["", ""],
      [
        "F, E, RF, RE = 457.3, 115.0, 112.0, 232.0",
        "geometry in mm: base, platform, upper arm, rod.",
      ],
      ["T30 = 1 / math.sqrt(3)", "tan(30 degrees), which appears in the triangle geometry."],
      ["", ""],
      ["def angle_yz(x0, y0, z0):", "motor angle (degrees) of the arm that lies in the y-z plane."],
      ["    y1 = -0.5 * T30 * F", "position of the motor joint on the base edge."],
      ["    y0 = y0 - 0.5 * T30 * E", "shift the platform centre to its edge attachment point."],
      [
        "    a = (x0*x0 + y0*y0 + z0*z0 + RF*RF - RE*RE - y1*y1) / (2*z0)",
        "the sphere equation reduced to a plane: z = a + b*y.",
      ],
      ["    b = (y1 - y0) / z0", "the slope of that plane."],
      [
        "    d = -(a + b*y1)**2 + RF * (b*b*RF + RF)",
        "discriminant of the circle-plane intersection.",
      ],
      ["    if d < 0:", "no real intersection."],
      ["        return None", "the target is unreachable."],
      [
        "    yj = (y1 - a*b - math.sqrt(d)) / (b*b + 1)",
        "choose the outer intersection: the elbow bends outwards.",
      ],
      ["    zj = a + b*yj", "the elbow's height."],
      [
        "    return math.degrees(math.atan(-zj / (y1 - yj))) + (180.0 if yj > y1 else 0.0)",
        "the arm angle from the elbow position.",
      ],
      ["", ""],
      [
        "def inverse(x, y, z):",
        "all three motor angles for a platform position (z is negative, below the base).",
      ],
      ["    c, s = -0.5, math.sqrt(3) / 2", "cosine and sine of 120 degrees."],
      [
        "    angles = [angle_yz(x, y, z), angle_yz(x*c + y*s, y*c - x*s, z), angle_yz(x*c - y*s, y*c + x*s, z)]",
        "solve the first arm directly, and the others after rotating the target by +/-120 degrees.",
      ],
      [
        "    return None if None in angles else angles",
        "any unreachable arm makes the whole target unreachable.",
      ],
      ["", ""],
      [
        "def forward(angles, guess=(0.0, 0.0, -200.0)):",
        "platform position from three motor angles.",
      ],
      [
        "    return fsolve(lambda p: [a - b for a, b in zip(inverse(*p), angles)], guess)",
        "find the position whose inverse angles equal the measured ones.",
      ],
      ["", ""],
      ["print(inverse(0, 0, -200))", "on the vertical axis all three angles are equal."],
    ),
    walk: [
      "The discriminant check is the reachability test: no real solution means the target is outside the workspace.",
      "Rotating the target lets one function serve all three arms, so there is only one formula to test.",
      "forward() uses the inverse function as a residual, so it can never disagree with the inverse kinematics.",
    ],
    expect: [
      "inverse(0, 0, -200) prints three identical angles.",
      "forward(inverse(x, y, z)) returns (x, y, z) to within a tiny numerical error.",
    ],
    fix: [
      [
        "The solver returns a position above the base.",
        "The forward problem has two solutions. Start the search near the expected working position, below the base.",
      ],
      [
        "All angles come out negative or reversed.",
        "Some conventions measure the arm angle from the horizontal, others from the vertical. Compare one pose with the real robot's motor reading.",
      ],
    ],
    exercise:
      "Check inverse() on 1,000 random points inside the workspace by running forward() and reporting the largest position error.",
    checklist: [
      "The target is negative in z (below the base)",
      "Unreachable targets return no solution",
      "Forward and inverse kinematics agree",
    ],
  }),
  lesson({
    title: "Jacobian derivation",
    summary: "Compute the delta's Jacobian numerically to relate platform speed to motor speed.",
    goals: [
      "Explain what the Jacobian links in a delta robot",
      "Compute it by finite differences of the inverse kinematics",
      "Convert a platform velocity into motor velocities",
    ],
    concept: [
      "The Jacobian of the inverse kinematics tells how quickly each motor angle must change for a given platform velocity: dθ = J · dx. For a delta an analytic Jacobian exists but is long; a numerical derivative of the inverse kinematics function is short, accurate enough and easy to check.",
      "The Jacobian depends on the platform position, so it is recomputed each cycle. It appears in every later topic: it converts velocity limits at the motors into velocity limits at the platform, it maps platform forces into motor torques and its condition number shows how close the robot is to a singularity.",
    ],
    steps: [
      "Write the central-difference derivative of the inverse kinematics.",
      "Build the 3 x 3 Jacobian by perturbing x, y and z in turn.",
      "Multiply it by a desired platform velocity to get motor velocities.",
      "Compare the result with a small finite motion computed directly.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the matrices."],
      ["", ""],
      [
        "def jacobian(inverse, p, h=0.05):",
        "3x3 matrix of motor angle change (deg) per mm of platform motion.",
      ],
      ["    p = np.asarray(p, float)", "the platform position (x, y, z) in mm."],
      ["    J = np.zeros((3, 3))", "the matrix to fill in."],
      ["    for i in range(3):", "perturb x, then y, then z."],
      ["        d = np.zeros(3); d[i] = h", "a small step of h mm along axis i."],
      [
        "        J[:, i] = (np.array(inverse(*(p + d))) - np.array(inverse(*(p - d)))) / (2 * h)",
        "central difference: better accuracy than a one-sided step.",
      ],
      ["    return J", "the Jacobian at this position."],
      ["", ""],
      [
        "def motor_speeds(inverse, p, v):",
        "motor speeds (deg/s) for a platform velocity v (mm/s).",
      ],
      [
        "    return jacobian(inverse, p) @ np.asarray(v, float)",
        "linear map: joint speeds are the Jacobian times the platform speed.",
      ],
      ["", ""],
      [
        "# print(motor_speeds(inverse, (0, 0, -200), (500, 0, 0)))",
        "example: moving 0.5 m/s along x mainly loads arm 1 and arms 2 and 3 share the rest.",
      ],
    ),
    walk: [
      "The central difference evaluates the function on both sides of the point, which cancels the first-order error.",
      "The step h is small compared with the arm lengths but large compared with floating-point noise.",
      "The Jacobian is a function of position; a fixed matrix would be wrong everywhere except at one point.",
    ],
    expect: [
      "Multiplying the Jacobian by a small displacement predicts the change of the motor angles from the inverse function.",
      "Motor speeds for a move along x differ between the three arms, as expected from their 120 degree spacing.",
    ],
    fix: [
      [
        "The Jacobian is noisy.",
        "The step size is too small. Use h around 0.05–0.5 mm for millimetre-scaled models.",
      ],
      [
        "The Jacobian contains NaN.",
        "One of the perturbed points is unreachable. Keep away from the workspace boundary or check the inverse function for None.",
      ],
    ],
    exercise:
      "Compare the numerical Jacobian at three positions and print how the largest element changes, then explain why the motor loads differ.",
    checklist: [
      "The Jacobian is recomputed each cycle",
      "Units are degrees per millimetre",
      "Unreachable neighbours are handled",
    ],
  }),
  lesson({
    title: "Singularities",
    summary:
      "Use the Jacobian's condition number to find where a delta loses control of a direction.",
    goals: [
      "Explain singularities in a parallel robot",
      "Measure closeness with the condition number",
      "Keep the working area away from singular regions",
    ],
    concept: [
      "A parallel robot can be singular in two ways. At the boundary of the workspace the arms are fully stretched or folded and motion outward is impossible. Inside the workspace a parallel robot can also gain uncontrolled freedom, where the platform can move without the motors moving, or the motors cannot move the platform in some direction. Both are dangerous: control is lost.",
      "The condition number of the Jacobian, the ratio between its largest and smallest singular values, is a practical warning. It is about 1 in the best posture and grows without bound near a singularity. Choosing a working area where the condition number stays below a limit (for example 10) is a simple design rule.",
    ],
    steps: [
      "Compute the Jacobian at a grid of points in the planned work area.",
      "Compute the condition number at each point.",
      "Mark the points whose condition number exceeds the limit.",
      "Shrink or move the work area so that no marked points remain.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the singular values."],
      ["", ""],
      ["def condition(J):", "how well-conditioned the Jacobian is."],
      ["    s = np.linalg.svd(J, compute_uv=False)", "the singular values, largest first."],
      [
        "    return float(s[0] / s[-1]) if s[-1] > 1e-12 else float('inf')",
        "ratio of largest to smallest; infinite means singular.",
      ],
      ["", ""],
      [
        "def safe_area(inverse, jacobian, points, limit=10.0):",
        "which planned points are safely away from singularities?",
      ],
      ["    bad = []", "points that are too close to a singularity."],
      ["    for p in points:", "check every planned position."],
      [
        "        if inverse(*p) is None or condition(jacobian(inverse, p)) > limit:",
        "unreachable, or too badly conditioned.",
      ],
      ["            bad.append(p)", "remember it."],
      ["    return bad", "an empty list means the whole area is safe."],
    ),
    walk: [
      "A single number summarises how much the arm's ability to move differs between directions.",
      "Unreachable points are counted as bad, so the check covers both boundary and interior problems.",
      "The limit is a design choice; verify it by testing the real robot near the boundary of the area.",
    ],
    expect: [
      "In the middle of the workspace the condition number is close to 1 to 3.",
      "Near the workspace edge it rises steeply, and points beyond the limit are reported.",
    ],
    fix: [
      [
        "The robot vibrates in part of the workspace.",
        "The area is near a singularity. Move the pick and place points inward or reduce the speed there.",
      ],
      [
        "The condition number seems too high everywhere.",
        "The Jacobian is in mixed units. Normalise angles and lengths before computing it.",
      ],
    ],
    exercise:
      "Sample a 20 x 20 grid at three heights and print the percentage of points below a condition number of 10 for each height.",
    checklist: [
      "The condition number is checked over the work area",
      "Points near the edge are avoided",
      "The limit is checked on the real robot",
    ],
  }),
  lesson({
    title: "Workspace mapping",
    summary:
      "Find the reachable region of the delta by sampling positions and testing the inverse kinematics and motor limits.",
    goals: [
      "Explain the shape of the delta's workspace",
      "Sample positions and test reachability and motor limits",
      "Choose a rectangular pick area inside the workspace",
    ],
    concept: [
      "The delta's workspace is roughly a cylinder-like volume below the base whose radius shrinks toward the bottom and top. Its limits come from four things: the arms reaching their stretched or folded limits, the motor angle limits, the rods hitting the base and the joint angles of the ball joints.",
      "The simplest way to map it is to test many points. For each point in a grid, run the inverse kinematics and check that the angles lie within the motor limits. The result tells the height range and the usable radius at each height, which then defines a rectangular pick area for a conveyor or tray inside the workspace with a margin.",
    ],
    steps: [
      "Set the motor angle limits, for example -40 to 85 degrees.",
      "Sample a grid at several heights and test each point.",
      "Print the largest reachable radius at each height.",
      "Choose a rectangle that fits inside the smallest radius with a 10 mm margin.",
    ],
    example: hash(
      ["import math", "for the radius."],
      ["", ""],
      ["LOW, HIGH = -40.0, 85.0", "motor angle limits in degrees."],
      ["", ""],
      ["def reachable(inverse, p):", "is the point reachable within the motor limits?"],
      ["    a = inverse(*p)", "the three motor angles or None."],
      [
        "    return a is not None and all(LOW <= v <= HIGH for v in a)",
        "the geometry works and every motor stays inside its range.",
      ],
      ["", ""],
      [
        "def max_radius(inverse, z, step=10, limit=400):",
        "largest reachable distance from the axis at height z (mm).",
      ],
      ["    best = 0", "the largest radius found so far."],
      ["    for r in range(0, limit, step):", "test radii from the axis outwards."],
      [
        "        if all(reachable(inverse, (r * math.cos(t), r * math.sin(t), z)) for t in [i * math.pi / 6 for i in range(12)]):",
        "a radius counts only if all 12 directions around the circle are reachable.",
      ],
      ["            best = r", "remember the largest radius that passed."],
      ["    return best", "the usable radius at this height."],
      ["", ""],
      [
        "# for z in (-250, -300, -350, -400): print(z, max_radius(inverse, z))",
        "print the radius at four heights: the workspace shrinks toward the bottom.",
      ],
    ),
    walk: [
      "Testing 12 directions around the circle protects against a workspace that is lopsided because of the motor limits.",
      "The result is a table of radius against height, which is easier to use in the cell design than a 3D plot.",
      "A rectangle is inscribed in the smallest circle you need, with margin, so the corners are reachable too.",
    ],
    expect: [
      "The reachable radius is largest around the middle height and smaller at the top and bottom.",
      "A rectangular pick area that fits the smallest radius passes the reachable() test at all its corners.",
    ],
    fix: [
      [
        "Points inside the workspace are rejected.",
        "The motor limits are tighter than the geometry. Print which angle failed and check the limits against the datasheet.",
      ],
      [
        "The workspace is smaller than in the datasheet.",
        "The datasheet workspace may ignore payload or the platform's tilt limits. Check the definitions.",
      ],
    ],
    exercise:
      "Find the rectangle of 300 x 200 mm with the largest height range where all corners and edge midpoints are reachable.",
    checklist: [
      "Radius is tested in all directions",
      "Motor limits are part of the test",
      "The pick area keeps a margin from the edge",
    ],
  }),
  lesson({
    title: "Platform dynamics",
    summary:
      "Compute the motor torques needed to accelerate the platform and payload using the Jacobian.",
    goals: [
      "Relate platform force to motor torque with the Jacobian",
      "Compute the force for a chosen acceleration",
      "Check the result against the motor's torque limit",
    ],
    concept: [
      "The platform and payload have a mass m. To accelerate it with a, the arms must supply a force F = m·(a + g) at the platform. Virtual work links platform force and motor torque: with the Jacobian J that maps platform velocity to motor rates, the torques are τ = J⁻ᵀ · F, where the Jacobian is expressed in radians per metre.",
      "This simplified model ignores the mass of the arms and rods, which matters in a real delta, but it shows the key point: the torque needed for a given acceleration depends on the posture. Near a singularity the torque grows large. The motor's torque limit therefore sets a position-dependent acceleration limit.",
    ],
    steps: [
      "Convert the Jacobian to radians per metre.",
      "Compute the platform force for a 10 g upward acceleration and a 200 g payload.",
      "Solve for the motor torques with the transposed Jacobian.",
      "Compare each torque with the motor's peak torque.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the linear solve."],
      ["", ""],
      ["G = 9.81", "gravity in m/s^2."],
      ["", ""],
      [
        "def motor_torques(J_rad_per_m, mass, accel):",
        "torques (N*m) for a platform acceleration vector (m/s^2).",
      ],
      [
        "    a = np.asarray(accel, float) + np.array([0.0, 0.0, G])",
        "add gravity: the arms must also hold the platform up (z axis points up).",
      ],
      ["    F = mass * a", "force the arms must deliver at the platform (N)."],
      [
        "    return np.linalg.solve(J_rad_per_m.T, F)",
        "virtual work: solve J^T * tau = F for the motor torques.",
      ],
      ["", ""],
      [
        "# J = np.radians(jacobian(inverse, p)) * 1000.0",
        "convert degrees per mm into radians per metre.",
      ],
      [
        "# tau = motor_torques(J, mass=0.5, accel=(98.1, 0.0, 0.0))",
        "half a kilogram of platform and payload accelerating at 10 g sideways.",
      ],
      [
        "# print(np.abs(tau) <= 8.0)",
        "compare with an 8 N*m peak torque: True for each motor means the move is possible.",
      ],
    ),
    walk: [
      "Adding gravity to the acceleration vector means a stationary platform still needs torque.",
      "The linear solve is cheaper and more accurate than forming an explicit inverse.",
      "The result depends on the position through the Jacobian, so the limit must be checked at the worst point of the path.",
    ],
    expect: [
      "A sideways acceleration loads mainly the two motors on that side and reduces the load on the third.",
      "The required torque grows at postures where the Jacobian is poorly conditioned.",
    ],
    fix: [
      [
        "Torque values are absurdly large.",
        "The Jacobian is in the wrong units. It must be radians per metre, not degrees per millimetre.",
      ],
      [
        "The real motors reach their limit earlier than predicted.",
        "The model ignores the arms' inertia and friction. Add measured values or keep a large safety margin.",
      ],
    ],
    exercise:
      "Find the largest sideways acceleration that keeps all three torques below the motor limit at the centre and at the edge of the pick area.",
    checklist: [
      "The Jacobian units are radians per metre",
      "Gravity is included",
      "Limits are checked at the worst point of the path",
    ],
  }),
  lesson({
    title: "Arm compliance",
    summary:
      "Estimate the platform stiffness from the axial stiffness of the rods and see how it varies with pose.",
    goals: [
      "Explain why a delta is stiff along its rods",
      "Assemble the Cartesian stiffness matrix from six rods",
      "Find the softest direction at a pose",
    ],
    concept: [
      "Each delta arm has two rods carrying almost pure axial load, tension or compression, because their ends are ball joints. A rod of area A, length l and modulus E has an axial stiffness k = E·A / l. The platform is held by six such rods, and each one stiffens the platform along its own direction.",
      "The Cartesian stiffness is the sum over the rods of k times the outer product of the rod direction with itself: K = Σ k · u uᵀ. Its eigenvalues give the stiffness in the principal directions and its smallest one is the weak direction where vibration and deflection appear. Compliance of the upper arms and joints lowers the result further.",
    ],
    steps: [
      "Compute the axial stiffness of one carbon rod.",
      "Write the unit direction vector of each of the six rods at a pose.",
      "Sum the outer products and compute the eigenvalues.",
      "Compare the softest direction at the centre with that near the edge.",
    ],
    example: hash(
      ["import numpy as np", "numpy for vectors and eigenvalues."],
      ["", ""],
      [
        "def rod_k(E=140e9, area=1.1e-5, length=0.232):",
        "axial stiffness of one carbon-fibre rod in N/m.",
      ],
      [
        "    return E * area / length",
        "E*A/l: stiff, because the rods are short and made of carbon fibre.",
      ],
      ["", ""],
      [
        "def stiffness(rod_dirs, k):",
        "3x3 Cartesian stiffness matrix from a list of unit vectors along the rods.",
      ],
      ["    K = np.zeros((3, 3))", "start with no stiffness."],
      ["    for u in rod_dirs:", "add each rod's contribution."],
      [
        "        u = np.asarray(u, float) / np.linalg.norm(u)",
        "make sure the direction is a unit vector.",
      ],
      ["        K += k * np.outer(u, u)", "a rod resists motion along its own axis only."],
      ["    return K", "the combined stiffness of the platform."],
      ["", ""],
      [
        "dirs = [(0.3, 0.0, -1.0), (0.3, 0.0, -1.0), (-0.15, 0.26, -1.0), (-0.15, 0.26, -1.0), (-0.15, -0.26, -1.0), (-0.15, -0.26, -1.0)]",
        "example rod directions at a pose: each pair leans outward at 120 degree spacing.",
      ],
      [
        "print(np.linalg.eigvalsh(stiffness(dirs, rod_k())).round(-3))",
        "principal stiffnesses in N/m: the smallest is the weak direction.",
      ],
    ),
    walk: [
      "The outer product u uᵀ is what turns one rod's stiffness into a matrix that only resists motion along that rod.",
      "The horizontal eigenvalues are smaller than the vertical one, because the rods are mostly vertical.",
      "Real stiffness is lower, because joints and upper arms are compliant, so treat this as an upper bound.",
    ],
    expect: [
      "The two horizontal eigenvalues are about 1.6 × 10⁶ N/m and the vertical one is about 3.6 × 10⁷ N/m.",
      "Tilting the rods further outward raises the horizontal stiffness and lowers the vertical one.",
    ],
    fix: [
      [
        "The measured stiffness is much lower than the estimate.",
        "Joint play and upper arm bending are missing from the model. Measure deflection under a known force and fit a joint stiffness.",
      ],
      [
        "Eigenvalues come out negative.",
        "A direction vector is not a real unit vector, or the matrix was built incorrectly. Print each term.",
      ],
    ],
    exercise:
      "Add a series stiffness of 5 × 10⁵ N/m for each ball joint (in series with the rod) and recompute the weakest direction.",
    checklist: [
      "Rods are treated as axial members",
      "Direction vectors are unit vectors",
      "The estimate is compared with a measurement",
    ],
  }),
  lesson({
    title: "High-speed motion constraints",
    summary:
      "Turn motor torque and speed limits into limits on the platform's acceleration and velocity.",
    goals: [
      "Explain the limits that stop a delta from going faster",
      "Compute the maximum platform acceleration from the motor torque",
      "Scale a path's speed so that no motor exceeds its limits",
    ],
    concept: [
      "A delta's speed is limited by motor torque and speed, by the acceleration the payload tolerates (a part can slip or vibrate), by ball-joint and rod limits and by vibration of the frame. Several of these depend on the posture, so a single global acceleration value is either too cautious or unsafe somewhere.",
      "The practical method is to check limits along the path: at each sample compute the motor rates and torques for the planned speed, find the ratio to the limits and slow the path where the ratio is above 1. The result is a speed scale that varies along the path, which the trajectory generator then respects.",
    ],
    steps: [
      "Sample the planned path at a fixed spacing.",
      "At each point compute the motor speeds for the planned platform speed with the Jacobian.",
      "Compute the ratio of each motor's speed to its limit.",
      "Scale the speed at each point so the largest ratio is at most 1.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      ["MOTOR_MAX = 1200.0", "maximum motor speed in degrees per second."],
      ["", ""],
      [
        "def speed_scale(jacobian, direction, speed):",
        "factor (0..1) by which the requested platform speed must be reduced.",
      ],
      ["    v = speed * np.asarray(direction, float)", "platform velocity vector in mm/s."],
      ["    motor = np.abs(jacobian @ v)", "each motor's speed in degrees per second."],
      ["    worst = motor.max() / MOTOR_MAX", "the busiest motor as a fraction of its limit."],
      [
        "    return min(1.0, 1.0 / worst) if worst > 0 else 1.0",
        "slow down only when the limit would be exceeded.",
      ],
      ["", ""],
      [
        "def scaled_path_speeds(jacobians, directions, speed):",
        "allowed speeds along a whole path.",
      ],
      [
        "    return [speed * speed_scale(J, d, speed) for J, d in zip(jacobians, directions)]",
        "the requested speed multiplied by the scale at every path point.",
      ],
    ),
    walk: [
      "The scale is computed per point because the Jacobian, and so the limit, changes along the path.",
      "min(1.0, ...) never speeds up a slow request; it only reduces requests that are too fast.",
      "The same pattern works for torque limits by using the torque calculation from the dynamics lesson.",
    ],
    expect: [
      "Where the Jacobian is large the allowed speed drops, and in the centre it stays at the requested value.",
      "After scaling, no motor reaches its speed limit along the path.",
    ],
    fix: [
      [
        "The path is slower than the datasheet promises.",
        "The datasheet numbers are for the best posture and a short payload. Check the values at your posture and payload.",
      ],
      [
        "The motion still vibrates at the corners.",
        "Velocity limits are not enough. Add jerk limits or input shaping (see the vibration lesson).",
      ],
    ],
    exercise:
      "Apply the scale to a 300 mm straight path at three heights and print the slowest allowed speed for each height.",
    checklist: [
      "Limits are checked along the whole path",
      "Speed limits and torque limits are both considered",
      "Jerk and vibration limits are added on top",
    ],
  }),
  lesson({
    title: "Vibration control",
    summary:
      "Cancel residual vibration with a two-impulse input shaper tuned to the platform's frequency.",
    goals: [
      "Explain why fast stops make a delta ring",
      "Compute the amplitudes and timing of a ZV input shaper",
      "Apply the shaper to a trajectory command",
    ],
    concept: [
      "A delta's frame and arms have a lowest natural frequency, often 30 to 60 Hz. A fast stop excites it, and the platform rings for a fraction of a second, which delays picking and spoils accuracy. The cure without extra hardware is input shaping: split each command into two smaller commands so that the vibrations they cause cancel each other.",
      "The zero-vibration (ZV) shaper uses two impulses. The first has amplitude 1 / (1 + K) at time 0 and the second K / (1 + K) at half a vibration period, with K = exp(−ζπ / √(1 − ζ²)) and ζ the damping ratio. Convolving the command with these impulses delays the motion by half a period but removes the vibration at that frequency.",
    ],
    steps: [
      "Measure the natural frequency and the damping ratio from a free-decay recording.",
      "Compute the two impulse amplitudes and the delay.",
      "Convolve the position command with the shaper.",
      "Compare the residual vibration with and without shaping.",
    ],
    example: hash(
      ["import math", "for the exponential and square root."],
      ["import numpy as np", "numpy for the convolution."],
      ["", ""],
      [
        "def zv_shaper(freq_hz, zeta):",
        "impulse amplitudes and times for a given frequency and damping ratio.",
      ],
      [
        "    k = math.exp(-zeta * math.pi / math.sqrt(1 - zeta**2))",
        "how much of the first vibration remains after half a period.",
      ],
      [
        "    half = 0.5 / (freq_hz * math.sqrt(1 - zeta**2))",
        "half of the damped vibration period.",
      ],
      [
        "    return [(0.0, 1 / (1 + k)), (half, k / (1 + k))]",
        "two impulses whose amplitudes add up to 1.",
      ],
      ["", ""],
      [
        "def shape(command, dt, freq_hz, zeta):",
        "apply the shaper to a sampled command (list of positions).",
      ],
      ["    command = np.asarray(command, float)", "make sure the command is a numeric array."],
      ["    shaper = zv_shaper(freq_hz, zeta)", "the two impulses."],
      ["    n = int(round(shaper[1][0] / dt))", "the second impulse's delay in samples."],
      [
        "    padded = np.concatenate([command, np.full(n, command[-1])])",
        "hold the final position for n extra samples so both delayed copies line up.",
      ],
      [
        "    out = np.zeros(len(padded) + n)",
        "the output is n samples longer than the padded command.",
      ],
      ["    for t, amp in shaper:", "add one delayed, scaled copy of the command per impulse."],
      ["        k = int(round(t / dt))", "this impulse's delay in samples."],
      ["        out[k:k + len(padded)] += amp * padded", "the scaled copy, shifted in time."],
      [
        "        out[k + len(padded):] += amp * padded[-1]",
        "after a copy ends, it keeps holding its share of the final position.",
      ],
      ["    return out", "the shaped command to send to the controller."],
    ),
    walk: [
      "The two amplitudes add to 1, so the shaped move still ends at the requested position.",
      "The delay is only half a vibration period (about 10 ms at 50 Hz), which is a good price for no ringing.",
      "The shaper only works at the frequency it was designed for; a different payload changes that frequency.",
    ],
    expect: [
      "The shaped command reaches the same end point, delayed by about half a period.",
      "In simulation or on the robot the residual vibration after the stop is much smaller.",
    ],
    fix: [
      [
        "The vibration is not reduced.",
        "The frequency estimate is wrong. Measure it again under the real payload, and widen the shaper (ZVD) for uncertainty.",
      ],
      [
        "The robot feels slower.",
        "The delay is at the price of removing vibration. Use a shaper only on moves that end at high-accuracy positions.",
      ],
    ],
    exercise:
      "Simulate a 50 Hz mass-spring system with damping 0.02, drive it with a step and with the shaped step, and compare the peak residual oscillation.",
    checklist: [
      "The natural frequency is measured under the real payload",
      "Shaper amplitudes add up to 1",
      "The delay is accepted by the cycle time",
    ],
  }),
  lesson({
    title: "Payload effects",
    summary:
      "Predict how the payload changes the maximum acceleration and when to derate the robot.",
    goals: [
      "Explain how payload changes acceleration limits",
      "Compute the maximum acceleration for a given payload",
      "Choose a speed derating rule for heavier parts",
    ],
    concept: [
      "A delta is rated for a payload at a stated acceleration. A heavier payload needs a larger force for the same acceleration, so the maximum acceleration falls roughly as one over the total moving mass. The gripper counts as payload too, and heavy tools reduce the possible speed much more than a light part does.",
      "Because the platform's mass is small, the payload is a large fraction of the total moving mass. The clear way to handle this is a derating table: for each payload the maximum acceleration is reduced according to the torque budget. The controller then uses the table with the actual part weight, which it may know from the pick recipe.",
    ],
    steps: [
      "Estimate the maximum platform force from the motor torque and the Jacobian.",
      "Compute the maximum acceleration for several payloads.",
      "Build a derating table with a safety margin.",
      "Apply the table in the trajectory planner based on the part weight.",
    ],
    example: hash(
      ["G = 9.81", "gravity in m/s^2."],
      ["PLATFORM = 0.35", "mass of the platform, gripper and rods' moving share (kg)."],
      [
        "F_MAX = 120.0",
        "largest force the motors can deliver at the platform in the worst direction (N).",
      ],
      ["", ""],
      [
        "def max_accel(payload_kg, margin=0.8):",
        "largest allowed acceleration in m/s^2 with a 20 % safety margin.",
      ],
      ["    total = PLATFORM + payload_kg", "all the mass that moves."],
      [
        "    return margin * F_MAX / total - G",
        "the force left over after holding the weight, divided by the mass.",
      ],
      ["", ""],
      ["def derating(payloads):", "a small lookup table for the planner."],
      [
        "    return {p: round(max_accel(p) / G, 1) for p in payloads}",
        "acceleration in multiples of g for each payload.",
      ],
      ["", ""],
      [
        "print(derating([0.0, 0.1, 0.25, 0.5]))",
        "prints about {0.0: 27.0, 0.1: 20.7, 0.25: 15.3, 0.5: 10.5}: heavier parts, lower acceleration.",
      ],
    ),
    walk: [
      "Subtracting g reflects that the arms must also hold the weight, which matters most for heavy parts.",
      "The margin is written into the function so it cannot be forgotten when the table is used.",
      "The table is data, so it can be changed after measurements without changing the planner.",
    ],
    expect: [
      "Accelerations fall with the payload: about 27 g with no payload and about 10.5 g at 0.5 kg for these numbers.",
      "You can explain why a heavy gripper hurts more than a light part of the same weight.",
    ],
    fix: [
      [
        "The robot fails at heavier parts although the table allows it.",
        "The maximum force differs by direction. Use the smallest value over the whole work area.",
      ],
      [
        "Cycle time gets worse than predicted.",
        "Heavier parts also need more gripper time and settling. Add those to the cycle estimate.",
      ],
    ],
    exercise:
      "Add a direction-dependent F_MAX (vertical 180 N, horizontal 120 N) and compute a table for both directions.",
    checklist: [
      "Gripper mass is counted as payload",
      "Derating is applied automatically from the part weight",
      "The worst direction sets the limit",
    ],
  }),
  lesson({
    title: "Packaging workflows",
    summary: "Size a packaging line: how many robots and what buffer a target rate needs.",
    goals: [
      "Explain the pick-and-place flow of a packaging line",
      "Compute the number of robots needed for a rate",
      "Estimate the buffer needed between stations",
    ],
    concept: [
      "In a typical packaging line products arrive on an infeed conveyor and delta robots pick them and place them into trays or cartons on an outfeed conveyor. The important numbers are the product rate, the pick rate of one robot and the availability of the line. The number of robots is the product rate divided by the useful pick rate of one robot, rounded up.",
      "The pick rate of a robot is lower than its maximum, because part spacing, missed parts and picks that need longer moves reduce it. A buffer between stations absorbs short interruptions, so upstream machines keep running while a robot recovers from an error. A rule of thumb is to size the buffer for one to two minutes of production.",
    ],
    steps: [
      "Write the required line rate in products per minute.",
      "Estimate the useful pick rate per robot from the cycle time and an efficiency factor.",
      "Compute the number of robots and the resulting utilisation.",
      "Compute the buffer needed to bridge a two-minute stop.",
    ],
    example: hash(
      ["import math", "for rounding up."],
      ["", ""],
      [
        "def plan(rate_ppm, cycle_s, efficiency=0.85, stop_min=2.0):",
        "size a packaging line: rate in products per minute.",
      ],
      [
        "    per_robot = 60.0 / cycle_s * efficiency",
        "useful pick rate of one robot: the cycle rate reduced for misses and gaps.",
      ],
      [
        "    robots = math.ceil(rate_ppm / per_robot)",
        "always round up: a fraction of a robot does not exist.",
      ],
      [
        "    utilisation = rate_ppm / (robots * per_robot)",
        "how busy each robot is: about 0.7 to 0.9 is healthy.",
      ],
      [
        "    buffer = rate_ppm * stop_min",
        "products that arrive during a stop; the buffer must hold them.",
      ],
      ["    return robots, round(utilisation, 2), int(buffer)", "the result of the estimate."],
      ["", ""],
      [
        "print(plan(rate_ppm=240, cycle_s=0.5))",
        "240 products per minute with a 0.5 s cycle: prints (3, 0.78, 480).",
      ],
    ),
    walk: [
      "The efficiency factor is where real-world losses go, so the estimate is not based on the datasheet maximum.",
      "Utilisation close to 1 leaves no headroom, so a small disturbance immediately causes lost products.",
      "The buffer is a simple product of rate and time, which makes the assumption behind it visible.",
    ],
    expect: [
      "The script prints (3, 0.78, 480): three robots at 78 % utilisation and a 480 product buffer.",
      "Raising the rate to 320 per minute adds a fourth robot.",
    ],
    fix: [
      [
        "The line does not reach the rate in practice.",
        "The efficiency is too optimistic. Measure real picks per minute and update the factor.",
      ],
      [
        "The buffer overflows during a stop.",
        "The stop is longer than assumed. Add a second buffer or a faster recovery procedure.",
      ],
    ],
    exercise:
      "Add a second product type with a 0.7 s cycle and split the line rate between them. Decide how many robots each needs.",
    checklist: [
      "Efficiency comes from measurements",
      "Utilisation leaves headroom",
      "The buffer covers a realistic stop",
    ],
  }),
  lesson({
    title: "Sorting & binning",
    summary:
      "Sort parts by colour into bins with a rule table, and complete the interactive delta lab.",
    goals: [
      "Write a sorting rule as a lookup table",
      "Handle full bins and unknown parts",
      "Finish the delta lab by choosing the correct destination",
    ],
    concept: [
      "Sorting means classifying each part (by colour, size, shape or a code) and putting it into the matching bin. The classification comes from the vision system; the robot only needs a table that maps each class to a destination. Keeping that table as data makes it easy to change for a new product without touching motion code.",
      "The real cases are the exceptions: a bin fills up, a part is of an unknown class or two parts overlap. Each needs a defined action, such as switching to a spare bin, sending the part to a reject bin or leaving it for a second pass. Counting the parts in every bin gives the production report for free.",
    ],
    steps: [
      "Open the Robot Code Lab below and read the mission and the notes under each command.",
      "Type the missing command on the marked empty line, then press Run program and watch the delta.",
      "In your own code write the class-to-bin table and the exception rules.",
      "Test a full bin and an unknown class and check the counters.",
    ],
    example: hash(
      [
        "BINS = {'red': ['red_bin_1', 'red_bin_2'], 'blue': ['blue_bin_1'], 'yellow': ['yellow_bin_1']}",
        "each class has one or more bins; the second red bin is a spare.",
      ],
      ["CAPACITY = 40", "parts one bin holds before it counts as full."],
      [
        "counts = {b: 0 for bins in BINS.values() for b in bins}",
        "parts in each bin, all starting at zero.",
      ],
      ["", ""],
      ["def destination(part_class):", "where should this part go?"],
      [
        "    for b in BINS.get(part_class, []):",
        "the bins for this class, in order of preference.",
      ],
      ["        if counts[b] < CAPACITY:", "use the first bin that still has room."],
      ["            return b", "found a bin."],
      [
        "    return 'reject_bin' if part_class not in BINS else 'wait'",
        "an unknown class goes to reject; a known class with all bins full waits.",
      ],
      ["", ""],
      ["def sort_part(part_class):", "handle one part and update the counters."],
      ["    b = destination(part_class)", "decide the destination."],
      ["    if b in counts:", "a normal bin: count the part."],
      ["        counts[b] += 1", "record it for the production report."],
      ["    return b", "the robot moves to this destination."],
    ),
    walk: [
      "The class-to-bin table is the only thing that changes between products.",
      "The order of bins in each list is the fill order, so the spare bin is used only when the first is full.",
      "Returning 'wait' for a full class means the robot does not drop parts on the floor; a person or a spare is needed.",
    ],
    expect: [
      "The first 40 red parts go to red_bin_1 and the 41st goes to red_bin_2.",
      "A class that is not in the table goes to reject_bin and is never mixed with good parts.",
    ],
    fix: [
      [
        "Parts of one colour end up in two bins randomly.",
        "The bin choice depends on a wrong counter or an unsynchronised update. Update the counter in the same function that decides.",
      ],
      [
        "The robot drops parts when a bin is full.",
        "The full-bin rule returned a destination anyway. Return 'wait' and stop feeding that class.",
      ],
    ],
    exercise:
      "Add a 'sorted per minute' counter for every bin and print it once a minute, then find which bin fills fastest.",
    checklist: [
      "Sorting rules are data, not code",
      "Full bins and unknown parts have defined actions",
      "Every bin has a counter",
    ],
    lab: "03-delta-parallel-robot",
  }),
  lesson({
    title: "Vision-based part tracking",
    summary:
      "Validate a stamped detection, predict where the part is now and send a pick goal only for valid targets.",
    goals: [
      "Explain why detections need timestamps and validity checks",
      "Reject stale, unreachable or out-of-limit targets",
      "Send an asynchronous pick goal for accepted detections",
    ],
    concept: [
      "A detection is a stamped point: where the part was at the time the camera took the picture. On a moving conveyor the part has moved since then, so the age of the detection matters. A detection that is too old, or that lies in the future because clocks are wrong, cannot be trusted and must be dropped.",
      "The robot then solves the inverse kinematics for the predicted point and checks the limits. Every rejection is silent for the robot but visible in the logs, and only a fully valid target creates a pick goal. This keeps the robot from reaching for parts it cannot reach in time and gives clean statistics about why parts were missed.",
    ],
    steps: [
      "Use a tested kinematics adapter for the exact robot geometry.",
      "Subscribe to stamped detections and reject stale observations.",
      "Use steady time for local deadlines and ROS time for graph data.",
      "Cancel the pick action when an object leaves the reachable window.",
    ],
    example: cpp(
      [
        "void detection_callback(const geometry_msgs::msg::PointStamped & msg) {",
        "runs every time a stamped object detection arrives; msg is read-only and not copied.",
      ],
      [
        "  const auto stamp = rclcpp::Time(msg.header.stamp);",
        "convert the message's timestamp into a ROS time value.",
      ],
      [
        "  const auto age = now() - stamp;",
        "work out how old the detection is by subtracting its stamp from the current time.",
      ],
      [
        "  if (age < rclcpp::Duration::from_seconds(-0.01) ||",
        "reject a detection from the future (more than 10 ms), which points to a clock problem...",
      ],
      [
        "      age > rclcpp::Duration::from_seconds(0.10)) return;",
        "...or one older than 100 ms, since stale data gives wrong picks.",
      ],
      [
        "  const auto target = kinematics_.solve(msg.point);",
        "ask the kinematics adapter for the joint target that reaches this point; it may return 'no solution'.",
      ],
      [
        "  if (!target || !limits_.contains(*target)) return;",
        "ignore the detection if the point is unreachable or the joint target is outside the allowed limits.",
      ],
      [
        "  pick_action_->async_send_goal(make_pick_goal(*target));",
        "send a pick goal to the action server without blocking the callback.",
      ],
      ["}", "end of the callback."],
    ),
    walk: [
      "The age check comes first, because a stale detection makes every later step meaningless.",
      "solve() may fail; std::optional-style results make unreachable targets an ordinary case.",
      "The action is asynchronous, so the callback returns quickly and the next detection can be handled.",
    ],
    expect: [
      "Detections younger than 100 ms and reachable produce a pick goal; all others are dropped.",
      "The log counts the detections rejected as stale, unreachable or out of limits.",
    ],
    fix: [
      [
        "Every detection is rejected as stale.",
        "The camera and robot clocks differ or the image is timestamped at arrival. Synchronise clocks and use the capture time.",
      ],
      [
        "Picks are late.",
        "The end-to-end delay is longer than the 100 ms window. Measure the pipeline and predict the part position forward.",
      ],
    ],
    exercise:
      "Replay stamped conveyor detections. Count accepted, stale and unreachable targets, then document the tested latency budget.",
    checklist: [
      "Detections include frame and timestamp",
      "Stale data is rejected",
      "Kinematics failure sends no command",
    ],
    source: ["ROS clock and time", "https://design.ros2.org/articles/clock_and_time.html"],
  }),
  lesson({
    title: "Conveyor synchronization",
    summary:
      "Predict the interception point of a moving part and check whether the robot can get there in time.",
    goals: [
      "Explain interception of a moving part",
      "Solve for the earliest pick time with iteration",
      "Reject parts that cannot be caught",
    ],
    concept: [
      "A part on a belt at position x0 at time t0 will be at x0 + v·(t − t0) at time t. The robot needs a certain time to travel from where it is to that point. The earliest possible pick is the time at which the robot's travel time equals the time the part needs to reach that point.",
      "This is a small fixed-point problem: guess the pick time, compute where the part will be, compute the robot's travel time to that point and update the guess until it settles. The solution must lie inside the pick window; otherwise the part cannot be caught and is left for the next robot or the end of the line.",
    ],
    steps: [
      "Predict the part position for a candidate pick time.",
      "Estimate the robot's travel time to that position.",
      "Repeat until the pick time stops changing.",
      "Reject the part if the predicted position is outside the pick window.",
    ],
    example: hash(
      ["import math", "for the distance."],
      ["", ""],
      [
        "def travel_time(a, b, accel=80000.0, vmax=3000.0):",
        "seconds for the platform to move between points a and b (mm).",
      ],
      ["    d = math.dist(a, b)", "distance in mm."],
      ["    ramp = vmax * vmax / accel", "distance used to accelerate and brake."],
      [
        "    return 2 * math.sqrt(d / accel) if d <= ramp else d / vmax + vmax / accel",
        "triangular or trapezoidal move time.",
      ],
      ["", ""],
      [
        "def intercept(robot_pos, part0, belt_v, t_now=0.0, window=(-150.0, 150.0)):",
        "pick time and point, or None if the part cannot be caught.",
      ],
      ["    t = t_now", "start with 'immediately'."],
      ["    for _ in range(20):", "a few iterations are enough."],
      [
        "        p = (part0[0] + belt_v * (t - t_now), part0[1], part0[2])",
        "where the part will be at time t.",
      ],
      ["        t_new = t_now + travel_time(robot_pos, p)", "when the robot could arrive there."],
      ["        if abs(t_new - t) < 1e-4:", "the guess has settled."],
      ["            break", "stop iterating."],
      ["        t = t_new", "use the new guess."],
      [
        "    return (t, p) if window[0] <= p[0] <= window[1] else None",
        "accept only if the pick point is inside the window.",
      ],
      ["", ""],
      [
        "print(intercept((0, 0, -300), (-100.0, 20.0, -300.0), belt_v=400.0))",
        "a part 100 mm upstream on a 400 mm/s belt: prints a pick time of about 0.06 s and a point about 25 mm downstream.",
      ],
    ),
    walk: [
      "The iteration converges quickly because the part's motion is slow compared with the robot's.",
      "The window check is the last step, so a part that would be caught too late is rejected.",
      "The same function can be used to decide which of two robots should take a part.",
    ],
    expect: [
      "The example returns a pick time of about 0.06 s and a point about 25 mm downstream of the detection.",
      "A part detected close to the end of the window returns None.",
    ],
    fix: [
      [
        "The robot arrives after the part.",
        "The travel time model is too optimistic. Measure real move times and add settling time.",
      ],
      [
        "The iteration does not converge.",
        "The belt speed is comparable with the robot speed. Add a maximum iteration count and reject the part.",
      ],
    ],
    exercise:
      "Add the latency of the vision system (60 ms) to the calculation and show how the pick point shifts at 400 mm/s.",
    checklist: [
      "Belt speed comes from the encoder",
      "Latency is included",
      "Parts outside the window are rejected",
    ],
  }),
  lesson({
    title: "Cycle-time optimization",
    summary: "Reduce the total travel of a pick sequence with a nearest-neighbour ordering.",
    goals: [
      "Explain how pick order affects cycle time",
      "Order picks with a nearest-neighbour rule",
      "Compare total travel before and after",
    ],
    concept: [
      "When several parts are in the pick window, the order in which the robot takes them changes the total travel. Picking in the order they were detected can zig-zag across the belt. A simple and fast improvement is a greedy nearest-neighbour rule that always goes to the closest remaining part.",
      "On a moving belt the best order also respects when parts leave the window: parts that are about to leave first should be picked first. A good scheduler combines both: sort by the time left in the window, and use distance to break ties. The improvement is measured as total path length and cycle time over a batch of parts.",
    ],
    steps: [
      "Generate 10 random part positions in the pick window.",
      "Compute the travel length in detection order.",
      "Reorder with nearest-neighbour and compute the new length.",
      "Add the rule that the part closest to leaving the window goes first.",
    ],
    example: hash(
      ["import math", "for distances."],
      ["", ""],
      ["def length(order, start):", "total travel in mm for a pick order starting at start."],
      ["    total, here = 0.0, start", "the running sum and the current position."],
      ["    for p in order:", "visit the parts in this order."],
      ["        total += math.dist(here, p)", "add the distance to the next part."],
      ["        here = p", "move there."],
      ["    return total", "the total distance."],
      ["", ""],
      ["def nearest_first(parts, start):", "order parts by always taking the closest one next."],
      [
        "    remaining, order, here = list(parts), [], start",
        "parts still to pick, the result and the current position.",
      ],
      ["    while remaining:", "until every part has been placed in the order."],
      [
        "        nxt = min(remaining, key=lambda p: math.dist(here, p))",
        "the closest remaining part.",
      ],
      ["        remaining.remove(nxt)", "take it out of the list."],
      ["        order.append(nxt)", "and add it to the pick order."],
      ["        here = nxt", "continue from there."],
      ["    return order", "the improved order."],
      ["", ""],
      [
        "# print(length(parts, home), length(nearest_first(parts, home), home))",
        "compare the two totals: the second is usually 20-40 % shorter.",
      ],
    ),
    walk: [
      "The greedy rule is not optimal but it is instant and usually much better than detection order.",
      "Measuring total length gives a number to compare, so 'faster' is not a feeling.",
      "On a moving belt distances change with time, so the rule should be combined with time left in the window.",
    ],
    expect: [
      "The nearest-first order is shorter than the detection order for most random sets.",
      "Adding the time-left rule lowers the number of parts that leave the window unpicked.",
    ],
    fix: [
      [
        "Parts at the end of the window get missed.",
        "Pick order ignores the deadline. Sort primarily by time left in the window.",
      ],
      [
        "The order changes constantly and causes jerky moves.",
        "Freeze the order for the next two picks, and recompute only after those are done.",
      ],
    ],
    exercise:
      "Simulate a belt with 8 parts arriving per second and compare missed parts between detection order and time-left order.",
    checklist: [
      "Order is chosen by deadline first, distance second",
      "Improvements are measured, not assumed",
      "Order changes do not cause jerky moves",
    ],
  }),
];
