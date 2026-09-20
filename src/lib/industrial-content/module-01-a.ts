import { hash, cpp, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 01 · Section A — Foundations (lessons 1–10)
export const module01a: LessonSpec[] = [
  lesson({
    title: "Robot anatomy & joint types",
    summary:
      "Name the links, joints, wrist and flange of a six-axis arm and know what each joint type does.",
    goals: [
      "Name the base, shoulder, elbow, wrist and flange of a six-axis arm",
      "Tell revolute from prismatic joints and count degrees of freedom",
      "Explain why six axes are needed to reach any position and orientation",
    ],
    concept: [
      "A six-axis articulated arm is a serial chain: a fixed base, six rigid links and six revolute joints, each with its own motor and gearbox. Joints 1–3 (waist, shoulder, elbow) mostly place the wrist in space; joints 4–6 (wrist roll, pitch, roll) orient the tool mounted on the flange.",
      "Six independent joints give six degrees of freedom (DOF): three for position and three for orientation, the minimum needed to put a tool at any reachable pose. A revolute joint rotates about an axis and is measured in radians; a prismatic joint slides and is measured in metres. Never mix the two units in one calculation.",
    ],
    steps: [
      "Sketch the robot and label the base, joints 1 to 6, the links between them and the tool flange.",
      "For every joint write its type, its rotation axis in the parent frame and its allowed range.",
      "Count degrees of freedom, then mark which joints mostly move position and which orient the tool.",
      "Compare your sketch with a manufacturer datasheet and check that joint names and ranges agree.",
    ],
    example: hash(
      [
        "from dataclasses import dataclass",
        "load a helper that turns a class into a simple record, so the robot description stays short and readable.",
      ],
      ["", ""],
      ["@dataclass", "generate the constructor for the class below automatically."],
      ["class Joint:", "one joint of the arm."],
      ["    name: str", "label used in the URDF and the controllers, for example joint_1."],
      [
        "    kind: str",
        "'revolute' rotates (radians), 'prismatic' slides (metres); it decides the unit.",
      ],
      [
        "    axis: str",
        "axis of motion in the parent frame; a wrong axis makes the arm move the wrong way.",
      ],
      ["    low: float", "lower limit in radians or metres."],
      ["    high: float", "upper limit; the controller must never command outside low..high."],
      ["", ""],
      [
        "arm = [Joint(f'joint_{i}', 'revolute', 'z' if i in (1, 4, 6) else 'y', -3.14, 3.14) for i in range(1, 7)]",
        "build six revolute joints; the axes alternate the way a typical arm is built.",
      ],
      [
        "print(len(arm), 'joints ->', len(arm), 'degrees of freedom')",
        "one independent joint per DOF, so a six-joint serial arm has 6 DOF.",
      ],
    ),
    walk: [
      "The record stores exactly what a controller needs per joint: a name, a type, an axis and limits.",
      "The unit follows from the joint kind, which is why kind is stored explicitly.",
      "The printed count is a quick sanity check that the model really has six degrees of freedom.",
    ],
    expect: [
      "The script prints 6 joints -> 6 degrees of freedom.",
      "You can point at each joint on a photo of a real arm and say what it does.",
    ],
    fix: [
      [
        "A joint moves about the wrong axis in simulation.",
        "Compare the axis in your table with the datasheet and the URDF <axis> tag; axes are given in the parent frame.",
      ],
      [
        "The arm reaches a point but the tool faces the wrong way.",
        "You probably counted only positioning joints. Check that joints 4–6 (the wrist) are present and in the right order.",
      ],
    ],
    exercise:
      "Pick a real six-axis robot datasheet (any manufacturer). Fill the Joint table with its axes and limits, then add a check that every limit is inside a mechanical range you supply.",
    checklist: [
      "Every joint has a type, axis and limits",
      "Units are radians for revolute joints",
      "You can explain the role of joints 1–3 versus 4–6",
    ],
  }),
  lesson({
    title: "Coordinate frames (world, base, tool)",
    summary:
      "Use homogeneous transforms to move a point between the world, robot base and tool frames.",
    goals: [
      "Name the world, base, flange and tool frames and what each is attached to",
      "Build a 4×4 homogeneous transform from a rotation and a translation",
      "Chain transforms to express a tool position in the world frame",
    ],
    concept: [
      "A frame is an origin plus three perpendicular axes. The world frame is fixed in the cell, the base frame is fixed to the robot's foot, the flange frame moves with joint 6 and the tool frame sits at the tool tip. Every position only has meaning relative to a named frame.",
      "A 4×4 homogeneous transform stores a 3×3 rotation and a 3×1 translation. Multiplying transforms chains frames: T_world_tool = T_world_base · T_base_flange · T_flange_tool. Order matters, because rotating then moving is not the same as moving then rotating.",
    ],
    steps: [
      "Measure or read the base position in the cell and write it as T_world_base.",
      "Write the current tool pose in the base frame as T_base_tool (from the robot controller).",
      "Multiply the two transforms and print the tool position in the world frame.",
      "Swap the multiplication order on purpose and note how the answer changes.",
    ],
    example: hash(
      ["import numpy as np", "numpy handles the matrix maths."],
      ["", ""],
      ["def rot_z(a):", "rotation about the z axis by angle a (radians)."],
      ["    c, s = np.cos(a), np.sin(a)", "cosine and sine are reused in the matrix."],
      ["    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])", "standard z-rotation matrix."],
      ["", ""],
      ["def transform(R, p):", "combine a rotation R and a position p into one 4x4 transform."],
      ["    T = np.eye(4)", "start from the identity (no rotation, no move)."],
      ["    T[:3, :3] = R", "top-left 3x3 block holds the rotation."],
      ["    T[:3, 3] = p", "right-hand column holds the position in metres."],
      ["    return T", "hand the finished matrix back."],
      ["", ""],
      [
        "T_world_base = transform(np.eye(3), [1.0, 0.5, 0.0])",
        "the base stands 1.0 m in x and 0.5 m in y from the world origin, without rotation.",
      ],
      [
        "T_base_tool = transform(rot_z(np.pi / 2), [0.4, 0.0, 0.6])",
        "in the base frame the tool is 0.4 m forward, 0.6 m up and turned 90 degrees.",
      ],
      [
        "T_world_tool = T_world_base @ T_base_tool",
        "chain the frames left to right: world<-base, then base<-tool.",
      ],
      [
        "print(T_world_tool[:3, 3])",
        "prints [1.4 0.5 0.6]: the tool position expressed in the world frame.",
      ],
    ),
    walk: [
      "transform() is the only place a rotation and translation are combined, so frame bugs are easy to isolate.",
      "The @ operator is matrix multiplication; * would multiply element by element and give a wrong answer.",
      "The result is only correct in the world frame because the base rotation is the identity in this example.",
    ],
    expect: [
      "The printed tool position is [1.4 0.5 0.6].",
      "Swapping the order (T_base_tool @ T_world_base) gives a different, wrong position, which proves that order matters.",
    ],
    fix: [
      [
        "The position comes out mirrored or rotated.",
        "Check the multiplication order and whether your transform is parent<-child or child<-parent; name every matrix T_parent_child.",
      ],
      [
        "Small errors grow when you chain many frames.",
        "Use consistent units (metres, radians) and re-orthonormalise rotation matrices if you multiply hundreds of times.",
      ],
    ],
    exercise:
      "Add a second robot whose base is rotated 90 degrees about z at (2, 0, 0) in the world. Compute where the same tool point appears in the world frame for both robots.",
    checklist: [
      "Every matrix name says parent and child",
      "Units are metres and radians",
      "You can explain why order matters",
    ],
  }),
  lesson({
    title: "DH parameters introduction",
    summary:
      "Describe each joint with four Denavit–Hartenberg numbers and turn them into a transform.",
    goals: [
      "Name the four DH parameters and what each one measures",
      "Build the standard DH transform for one joint",
      "Read a DH table from a datasheet",
    ],
    concept: [
      "The Denavit–Hartenberg (DH) convention describes each joint with four numbers: the link length a, the link twist alpha, the link offset d and the joint angle theta. For a revolute joint theta is the variable; for a prismatic joint d is the variable. The other three are fixed by the geometry.",
      "Placing frames by the DH rules (z axis along the joint axis, x axis along the common normal) makes every joint transform the same formula. This is why manufacturers publish DH tables and why kinematics libraries accept them. Several DH variants exist (standard and modified), so always confirm which one a table uses.",
    ],
    steps: [
      "Find the DH table of a robot you use (for example a 6-axis arm datasheet) and note which variant it is.",
      "Write the four parameters of one joint and mark which one is the joint variable.",
      "Implement the standard DH transform in code.",
      "Check the result for theta = 0 by hand, then compare with the code.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the matrix."],
      ["", ""],
      [
        "def dh(theta, d, a, alpha):",
        "standard DH: rotate theta about z, move d along z, move a along x, rotate alpha about x.",
      ],
      ["    ct, st = np.cos(theta), np.sin(theta)", "cosine and sine of the joint angle."],
      ["    ca, sa = np.cos(alpha), np.sin(alpha)", "cosine and sine of the link twist."],
      ["    return np.array([", "build the 4x4 transform from this joint's frame to the next."],
      [
        "        [ct, -st * ca,  st * sa, a * ct],",
        "first row: x axis of the new frame plus the x offset.",
      ],
      ["        [st,  ct * ca, -ct * sa, a * st],", "second row: y components and the y offset."],
      [
        "        [0.0,      sa,       ca,      d],",
        "third row: z components and the offset d along the joint axis.",
      ],
      ["        [0.0,     0.0,      0.0,    1.0],", "bottom row of every homogeneous transform."],
      ["    ])", "close the matrix."],
      ["", ""],
      [
        "print(dh(0.0, 0.1625, 0.0, np.pi / 2).round(3))",
        "joint with theta=0, offset 0.1625 m and 90 degree twist (the shoulder of a common 6-axis arm).",
      ],
    ),
    walk: [
      "The matrix is written once, so every joint of every robot reuses the same tested code.",
      "Only theta changes while the robot moves for a revolute joint; d, a and alpha never change.",
      "Printing at theta = 0 lets you verify the zero pose against the datasheet drawing.",
    ],
    expect: [
      "The printed matrix has the vector [0, 0, 0.1625] as its translation part.",
      "Changing theta rotates the frame but leaves the translation along z unchanged for this joint.",
    ],
    fix: [
      [
        "Results do not match the manufacturer's data.",
        "The table may use modified DH (parameters attached to the previous link). Check the variant before debugging code.",
      ],
      [
        "The arm's zero pose looks bent.",
        "Many robots add a fixed offset to theta. Add the offset from the datasheet to every joint angle.",
      ],
    ],
    exercise:
      "Implement the DH function for a prismatic joint (d variable) and print the transform for d = 0.2 m and d = 0.4 m.",
    checklist: [
      "You know which DH variant the table uses",
      "You can name the variable for each joint type",
      "The zero pose matches the drawing",
    ],
  }),
  lesson({
    title: "Forward kinematics derivation",
    summary:
      "Multiply six joint transforms to find where the tool is for a given set of joint angles.",
    goals: [
      "Chain six DH transforms into one tool pose",
      "Extract position and orientation from the final matrix",
      "Verify forward kinematics with a known pose",
    ],
    concept: [
      "Forward kinematics (FK) answers: given the six joint angles, where is the tool? Multiply the joint transforms in order, T = A1·A2·A3·A4·A5·A6. The top-left 3×3 block of T is the tool orientation and the right-hand column is the tool position in the base frame.",
      "FK always has exactly one answer, which makes it the safest tool for checking a model. Controllers, planners and visualisers all depend on it, so test it with a pose you can verify by eye before trusting anything built on top of it.",
    ],
    steps: [
      "Write the DH table of the arm (d, a, alpha per joint) in code.",
      "Loop over the joints and multiply the transforms in order.",
      "Print the tool position for the zero pose and for a pose you can check against a simulator.",
      "Compare your result with ros2 run tf2_ros tf2_echo base_link tool0 in simulation.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the matrices."],
      ["", ""],
      ["def dh(theta, d, a, alpha):", "one-joint transform (see the previous lesson)."],
      [
        "    ct, st, ca, sa = np.cos(theta), np.sin(theta), np.cos(alpha), np.sin(alpha)",
        "the four trigonometric terms in one line.",
      ],
      [
        "    return np.array([[ct, -st*ca, st*sa, a*ct], [st, ct*ca, -ct*sa, a*st], [0, sa, ca, d], [0, 0, 0, 1]])",
        "the standard DH matrix.",
      ],
      ["", ""],
      [
        "D = [0.1625, 0, 0, 0.1333, 0.0997, 0.0996]",
        "link offsets d in metres (values of a common 6-axis arm).",
      ],
      ["A = [0, -0.425, -0.3922, 0, 0, 0]", "link lengths a in metres."],
      ["ALPHA = [np.pi/2, 0, 0, np.pi/2, -np.pi/2, 0]", "link twists in radians."],
      ["", ""],
      ["def forward(q):", "tool pose for six joint angles q."],
      ["    T = np.eye(4)", "start at the base frame."],
      ["    for i in range(6):", "walk down the chain from joint 1 to joint 6."],
      [
        "        T = T @ dh(q[i], D[i], A[i], ALPHA[i])",
        "append this joint's transform on the right (order matters).",
      ],
      ["    return T", "the tool pose in the base frame."],
      ["", ""],
      [
        "print(forward([0, -np.pi/2, 0, -np.pi/2, 0, 0])[:3, 3].round(4))",
        "position of the tool for a typical 'ready' pose.",
      ],
    ),
    walk: [
      "Only the joint angles change between calls; the geometry lives in the constant tables.",
      "The loop is the whole derivation: FK is just an ordered product of six matrices.",
      "The printed vector is in the base frame, so it must be moved with T_world_base before comparing with cell coordinates.",
    ],
    expect: [
      "The function returns a 4x4 matrix whose last row is [0, 0, 0, 1].",
      "The position agrees with the simulator's tf2_echo output within a millimetre.",
    ],
    fix: [
      [
        "Position differs from the simulator by a constant offset.",
        "Add the tool or flange offset and check whether the simulator reports the flange or the tool frame.",
      ],
      [
        "Position is right for q = 0 but wrong elsewhere.",
        "Check the sign and order of the alpha values and whether your angles are in radians, not degrees.",
      ],
    ],
    exercise:
      "Sample 5,000 random joint vectors inside the limits, run forward(), and report the largest reach from the base. Compare it with the datasheet reach.",
    checklist: [
      "Joint angles are in radians",
      "FK is verified against a simulator",
      "Base-frame results are converted before use in the cell",
    ],
  }),
  lesson({
    title: "Inverse kinematics analytical methods",
    summary:
      "Solve joint angles in closed form for a planar two-link arm and see why six-axis wrists decouple.",
    goals: [
      "Derive the two-link inverse kinematics with the law of cosines",
      "Explain why the same target has an elbow-up and an elbow-down solution",
      "Describe how a spherical wrist splits a six-axis problem in two",
    ],
    concept: [
      "Inverse kinematics (IK) answers the opposite question: which joint angles put the tool at this pose? For a planar two-link arm the law of cosines gives the elbow angle directly, then the shoulder follows from geometry. There are two solutions (elbow up and elbow down), and none if the target is out of reach.",
      "Most industrial six-axis arms have a spherical wrist: three axes that intersect at one point. That lets the problem split. The first three joints place the wrist centre, and the last three orient the tool. This gives a closed-form answer with up to eight solutions, which controllers pick between using the current pose.",
    ],
    steps: [
      "Write the two-link forward kinematics on paper: x = l1 cos q1 + l2 cos(q1+q2), y similarly.",
      "Derive cos q2 = (x² + y² − l1² − l2²) / (2 l1 l2) and solve for q2.",
      "Find q1 from atan2(y, x) minus the angle contributed by the second link.",
      "Test both solutions with forward kinematics and confirm they reach the same point.",
    ],
    example: hash(
      ["import math", "standard maths functions."],
      ["", ""],
      [
        "def ik_2link(x, y, l1, l2, elbow_up=True):",
        "joint angles (radians) that put a two-link arm's tip at (x, y).",
      ],
      ["    c2 = (x*x + y*y - l1*l1 - l2*l2) / (2*l1*l2)", "law of cosines gives cos(q2)."],
      [
        "    if abs(c2) > 1:",
        "if cos is outside -1..1 the target is out of reach or inside the dead zone.",
      ],
      ["        return None", "report 'no solution' instead of inventing angles."],
      [
        "    s2 = math.sqrt(1 - c2*c2) * (1 if elbow_up else -1)",
        "sin(q2); the sign chooses which of the two solutions you get.",
      ],
      ["    q2 = math.atan2(s2, c2)", "elbow angle."],
      [
        "    q1 = math.atan2(y, x) - math.atan2(l2*s2, l1 + l2*c2)",
        "shoulder angle: direction to the target minus the offset caused by link 2.",
      ],
      ["    return q1, q2", "return both angles."],
      ["", ""],
      ["print(ik_2link(0.4, 0.3, 0.3, 0.3))", "a reachable target: prints one solution."],
      ["print(ik_2link(1.0, 0.0, 0.3, 0.3))", "farther than l1 + l2 = 0.6 m: prints None."],
    ),
    walk: [
      "Returning None makes an unreachable target impossible to ignore, which is safer than clamping.",
      "Changing the sign of s2 flips between the two mirror-image arm postures.",
      "A real six-axis solver repeats this idea for the arm and then solves the wrist orientation separately.",
    ],
    expect: [
      "The reachable target returns two angles; running FK on them returns (0.4, 0.3).",
      "The unreachable target returns None.",
    ],
    fix: [
      [
        "A math domain error appears.",
        "cos(q2) was slightly beyond 1 from rounding. Test abs(c2) > 1 first, or clamp values that are within 1e-9.",
      ],
      [
        "The robot reaches the point in the wrong posture.",
        "You chose the other elbow solution. Pick the solution closest to the current joint angles.",
      ],
    ],
    exercise:
      "Add a function that tries both elbow solutions and returns the one closest to a given current joint pair. Test it along a straight line of targets and confirm the posture never flips.",
    checklist: [
      "Both solutions are verified with forward kinematics",
      "Unreachable targets return no solution",
      "You can explain the spherical wrist split",
    ],
  }),
  lesson({
    title: "Numerical IK solvers",
    summary: "Use the Jacobian and damped least squares to solve inverse kinematics iteratively.",
    goals: [
      "Explain how the Jacobian links joint speeds to tool speed",
      "Run an iterative IK solver with damping",
      "Detect a solver that failed to converge",
    ],
    concept: [
      "When no closed form exists, IK is solved numerically. Start from a guess, compute the tool error, then use the Jacobian J (how the tool moves for a small joint change) to step the joints toward the target, and repeat until the error is small.",
      "Near a singularity J becomes nearly non-invertible and plain steps explode. Damped least squares (Levenberg–Marquardt) adds a small term, dq = Jᵀ (J Jᵀ + λ² I)⁻¹ e, that trades a little accuracy for stability. Libraries such as KDL, TRAC-IK and IKFast use the same ideas.",
    ],
    steps: [
      "Write forward kinematics and the Jacobian of a two-link arm.",
      "Loop: compute the error, stop below 1e-6 m, otherwise take a damped step.",
      "Give the solver a target close to a singularity and see that damping keeps it stable.",
      "Return failure after a maximum number of iterations instead of looping forever.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the matrices."],
      ["", ""],
      ["L1, L2 = 0.3, 0.3", "link lengths in metres."],
      ["", ""],
      ["def fk(q):", "tip position of the two-link arm."],
      [
        "    return np.array([L1*np.cos(q[0]) + L2*np.cos(q[0]+q[1]), L1*np.sin(q[0]) + L2*np.sin(q[0]+q[1])])",
        "planar forward kinematics.",
      ],
      ["", ""],
      ["def jac(q):", "Jacobian: how the tip moves per radian of each joint."],
      [
        "    s1, c1, s12, c12 = np.sin(q[0]), np.cos(q[0]), np.sin(q[0]+q[1]), np.cos(q[0]+q[1])",
        "reused sine/cosine terms.",
      ],
      [
        "    return np.array([[-L1*s1 - L2*s12, -L2*s12], [L1*c1 + L2*c12, L2*c12]])",
        "partial derivatives of the tip position.",
      ],
      ["", ""],
      [
        "def solve(target, q, lam=0.05, tol=1e-6, iters=200):",
        "iterate until the tip is within tol of the target.",
      ],
      ["    for _ in range(iters):", "never loop forever; the cap makes failure detectable."],
      ["        e = target - fk(q)", "position error."],
      ["        if np.linalg.norm(e) < tol:", "close enough?"],
      ["            return q", "yes: this is the answer."],
      ["        J = jac(q)", "linearise the arm around the current angles."],
      [
        "        q = q + J.T @ np.linalg.solve(J @ J.T + lam**2 * np.eye(2), e)",
        "damped least-squares step: stable even near a singularity.",
      ],
      ["    return None", "no convergence within the iteration limit: report failure."],
      ["", ""],
      [
        "print(solve(np.array([0.4, 0.3]), np.array([0.3, 0.3])))",
        "solve for a reachable point starting from a guess.",
      ],
    ),
    walk: [
      "The solver only needs fk() and jac(), so the same loop works for any robot once those exist.",
      "The damping term lam controls the trade-off: bigger is safer but slower to converge.",
      "Returning None lets the caller stop the motion instead of using a half-solved pose.",
    ],
    expect: [
      "The solver converges in a few dozen iterations and fk(result) matches the target.",
      "A target beyond the reach returns None after the iteration cap.",
    ],
    fix: [
      [
        "The solver oscillates and never converges.",
        "Increase the damping lam, limit the step size, or start from the current joint angles instead of zeros.",
      ],
      [
        "Different starts give different answers.",
        "That is normal: IK has several solutions. Always seed with the robot's current pose to get the nearest one.",
      ],
    ],
    exercise:
      "Add joint limits to the solver by clamping q each step, then test a target that needs an angle outside the limits and confirm it fails cleanly.",
    checklist: [
      "The solver seeds from the current pose",
      "Failure returns an explicit result",
      "Damping is tuned near singularities",
    ],
  }),
  lesson({
    title: "Workspace & reach analysis",
    summary:
      "Sample the joint limits to map the reachable workspace and check a target before moving.",
    goals: [
      "Explain reachable versus dexterous workspace",
      "Estimate a workspace by sampling joint limits with forward kinematics",
      "Reject targets outside the reachable envelope before planning",
    ],
    concept: [
      "The reachable workspace is every point the tool can touch; the dexterous workspace is the smaller region where it can also take any orientation. For an arm of link lengths l1 and l2 the planar reach is a ring between |l1 − l2| and l1 + l2, further shaped by joint limits and by collisions with the robot itself and the cell.",
      "Sampling is the practical way to map it: draw many random joint vectors inside the limits, run forward kinematics and look at the cloud of tool positions. Checking a target against that map, or against the reach ring, before planning avoids wasted planning time and confusing 'no solution' errors.",
    ],
    steps: [
      "Set the joint limits of a two-link arm and sample 20,000 random joint pairs.",
      "Compute the tip position for each sample and store the distances from the base.",
      "Report the minimum and maximum reach and count samples in a target area.",
      "Add a quick reach check that a planner calls before doing any expensive work.",
    ],
    example: hash(
      ["import numpy as np", "numpy for random sampling and vector maths."],
      ["", ""],
      ["L1, L2 = 0.4, 0.3", "link lengths in metres."],
      ["LIMITS = [(-2.5, 2.5), (-2.0, 2.0)]", "joint limits (radians) for the shoulder and elbow."],
      ["rng = np.random.default_rng(1)", "a seeded random generator, so results are repeatable."],
      ["", ""],
      ["q1 = rng.uniform(*LIMITS[0], 20000)", "20,000 random shoulder angles inside the limit."],
      ["q2 = rng.uniform(*LIMITS[1], 20000)", "20,000 random elbow angles inside the limit."],
      [
        "x = L1*np.cos(q1) + L2*np.cos(q1 + q2)",
        "tip x for every sample (vectorised forward kinematics).",
      ],
      ["y = L1*np.sin(q1) + L2*np.sin(q1 + q2)", "tip y for every sample."],
      ["r = np.hypot(x, y)", "distance from the base for every sample."],
      [
        "print('reach', r.min().round(3), 'to', r.max().round(3), 'm')",
        "smallest and largest distance actually reachable.",
      ],
      ["", ""],
      ["def reachable(px, py):", "quick check a planner can call before planning."],
      [
        "    return abs(L1 - L2) <= np.hypot(px, py) <= L1 + L2",
        "inside the ring between |l1-l2| and l1+l2.",
      ],
      [
        "print(reachable(0.5, 0.2), reachable(1.0, 0.0))",
        "prints True False: the second point is too far away.",
      ],
    ),
    walk: [
      "Vectorised numpy code evaluates forward kinematics for 20,000 poses in one line each, which is fast enough to run at start-up.",
      "The sampled minimum and maximum reach can be shorter than the geometric ring because of the joint limits.",
      "reachable() is deliberately cheap so it can reject bad targets before any motion planning starts.",
    ],
    expect: [
      "The printed reach is inside the ring |l1−l2| to l1+l2, and matches it when limits are wide.",
      "reachable(1.0, 0.0) is False.",
    ],
    fix: [
      [
        "A target inside the ring is still unreachable.",
        "Joint limits or the arm's own body block it. Check the sampled cloud, not only the ring formula.",
      ],
      [
        "Sampling looks patchy.",
        "Use more samples or a fixed grid; 20,000 points is a minimum for a smooth two-joint map.",
      ],
    ],
    exercise:
      "Plot (or print a coarse text map of) the sampled points and mark where a work table must be placed so every pick position is reachable with 10 cm margin.",
    checklist: [
      "Reach is checked before planning",
      "Joint limits are included in the map",
      "Margins are kept from the reach boundary",
    ],
  }),
  lesson({
    title: "Singularities & avoidance",
    summary:
      "Detect configurations where the arm loses a direction of motion and keep away from them.",
    goals: [
      "Explain why velocities blow up near a singularity",
      "Compute a manipulability measure from the Jacobian",
      "Slow or stop motion before entering a singular region",
    ],
    concept: [
      "At a singularity the Jacobian loses rank: the tool cannot move in some direction however the joints move, and asking for that motion needs enormous joint speeds. A six-axis arm has three classic cases: wrist singularity (joint 5 near zero), elbow singularity (arm fully stretched) and shoulder singularity (wrist centre above joint 1).",
      "A useful warning number is manipulability, w = |det J| for a square Jacobian (or sqrt(det(J Jᵀ)) in general). It shrinks toward zero at a singularity. A practical controller reduces speed when w drops below a threshold, or blocks the motion and reports the reason.",
    ],
    steps: [
      "Compute the Jacobian of a two-link arm and its determinant l1·l2·sin(q2).",
      "Print w for elbow angles from 0 to 3.14 rad and find where it reaches zero.",
      "Add a speed scale that falls linearly to zero as w approaches the threshold.",
      "Use the scale to slow a Cartesian motion that crosses a stretched-arm pose.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the Jacobian maths."],
      ["", ""],
      ["L1, L2 = 0.3, 0.3", "link lengths in metres."],
      ["W_MIN = 0.01", "manipulability below this is treated as 'too close to a singularity'."],
      ["", ""],
      ["def manipulability(q):", "how well the arm can move the tip in every direction."],
      [
        "    s1, c1, s12, c12 = np.sin(q[0]), np.cos(q[0]), np.sin(q[0]+q[1]), np.cos(q[0]+q[1])",
        "reused trigonometric terms.",
      ],
      [
        "    J = np.array([[-L1*s1 - L2*s12, -L2*s12], [L1*c1 + L2*c12, L2*c12]])",
        "the arm's Jacobian.",
      ],
      [
        "    return abs(np.linalg.det(J))",
        "equals l1*l2*|sin(q2)|; zero when the arm is straight or folded.",
      ],
      ["", ""],
      [
        "def speed_scale(q):",
        "factor 0..1 that a motion controller multiplies the requested speed by.",
      ],
      [
        "    return float(np.clip(manipulability(q) / (4 * W_MIN), 0.0, 1.0))",
        "full speed far from a singularity, falling to zero near it.",
      ],
      ["", ""],
      ["for q2 in (1.5, 0.3, 0.05, 0.0):", "elbow angles from bent to fully stretched."],
      [
        "    print(q2, round(speed_scale([0.4, q2]), 2))",
        "the allowed speed shrinks as the elbow straightens.",
      ],
    ),
    walk: [
      "det J equals l1·l2·sin(q2), so the arm is singular exactly when the elbow is straight (0) or folded (π).",
      "The scale reduces speed smoothly rather than stopping suddenly, which avoids jerky motion.",
      "The last angle prints 0.0, which tells the caller to refuse the motion or choose a different path.",
    ],
    expect: [
      "The printed scale is 1.0 for a bent elbow and 0.0 when the arm is straight.",
      "You can name the three singularity types of a six-axis arm.",
    ],
    fix: [
      [
        "Joint speeds spike during a straight-line move.",
        "The line passes near a singularity. Re-plan with a slightly different path, slow down, or use a joint-space move around it.",
      ],
      [
        "The controller reports the arm as singular at a normal pose.",
        "Check the threshold and the units of the Jacobian; a threshold chosen for metres will not fit millimetres.",
      ],
    ],
    exercise:
      "Extend the code to a six-joint arm by computing the Jacobian numerically, then find the joint 5 value where wrist manipulability drops below the threshold.",
    checklist: [
      "Manipulability is monitored in Cartesian moves",
      "Speed falls before the singularity, not after",
      "Unsafe paths are rejected with a clear message",
    ],
  }),
  lesson({
    title: "Joint limits & safety envelopes",
    summary:
      "Enforce position, velocity and Cartesian limits with margins before any command reaches the robot.",
    goals: [
      "Distinguish hard limits, soft limits and Cartesian safety zones",
      "Validate a target against joint and workspace limits with a margin",
      "Return a clear rejection reason instead of clamping silently",
    ],
    concept: [
      "Every joint has a mechanical stop (hard limit) and a smaller software range (soft limit) placed inside it with a safety margin. A Cartesian safety envelope, a box or zone the tool must stay inside, protects fixtures, people and other machines. Limits are checked on commands before they are sent, not after the arm has moved.",
      "Rejecting an invalid target with a specific message is better than silently clamping it. A clamped target moves the robot somewhere the programmer did not ask for. Checks should cover position, velocity and, for the tool, the allowed region, and the limits themselves must come from one shared configuration.",
    ],
    steps: [
      "Write the soft joint limits as the mechanical range minus a 3-degree margin.",
      "Add a Cartesian box that the tool centre must stay inside.",
      "Validate a target in joint space and in Cartesian space and return the first failure reason.",
      "Test a valid target, one joint violation and one envelope violation.",
    ],
    example: cpp(
      ["#include <array>", "fixed-size arrays for the six joints."],
      ["#include <cmath>", "std::abs for the velocity check."],
      ["#include <optional>", "an optional error message: no value means the target is valid."],
      ["#include <string>", "text for the rejection reason."],
      ["", ""],
      [
        "struct Limits {",
        "everything the checker needs, kept in one place so it is never duplicated.",
      ],
      [
        "  std::array<double, 6> low, high, max_speed;",
        "soft position limits and speed limits per joint (rad, rad/s).",
      ],
      [
        "  double x_min, x_max, y_min, y_max, z_min, z_max;",
        "Cartesian safety box for the tool centre point in metres.",
      ],
      ["};", "end of the settings."],
      ["", ""],
      [
        "std::optional<std::string> check(const Limits & l, const std::array<double, 6> & q,",
        "returns why a target is rejected, or nothing if it is fine.",
      ],
      [
        "                                 const std::array<double, 6> & qd, double x, double y, double z) {",
        "q = joint angles, qd = joint speeds, (x, y, z) = tool position.",
      ],
      ["  for (size_t i = 0; i < 6; ++i) {", "check every joint."],
      [
        '    if (q[i] < l.low[i] || q[i] > l.high[i]) return "joint " + std::to_string(i + 1) + " outside its soft limit";',
        "reject a position beyond the soft range and say which joint.",
      ],
      [
        '    if (std::abs(qd[i]) > l.max_speed[i]) return "joint " + std::to_string(i + 1) + " too fast";',
        "reject a speed above the joint's limit.",
      ],
      ["  }", "all six joints are inside their limits."],
      [
        "  if (x < l.x_min || x > l.x_max || y < l.y_min || y > l.y_max || z < l.z_min || z > l.z_max)",
        "is the tool inside the safety box?",
      ],
      ['    return "tool outside the safety envelope";', "reject with a specific reason."],
      ["  return std::nullopt;", "no reason to reject: the command may continue."],
      ["}", "end of the check."],
    ),
    walk: [
      "The function returns the reason as text, so an operator or log can see exactly what was wrong.",
      "Soft limits sit inside the hard stops, which leaves room to brake before hitting the mechanical end.",
      "Cartesian limits use the tool centre point, so the TCP calibration in a later lesson directly affects their accuracy.",
    ],
    expect: [
      "A target inside all limits returns no message.",
      "A target beyond joint 3's soft limit returns 'joint 3 outside its soft limit' and no motion is sent.",
    ],
    fix: [
      [
        "Valid poses are rejected.",
        "Limits may be in degrees while commands are radians. Convert once, in one place, and label every field with its unit.",
      ],
      [
        "The arm stops at the boundary with a jolt.",
        "The margin is too small for the braking distance at that speed. Increase the margin or reduce the speed near the boundary.",
      ],
    ],
    exercise:
      "Load the limits from a YAML file with a schema check, and add a test that fails if any soft limit is outside the hard limit.",
    checklist: [
      "Limits live in one shared configuration",
      "Soft limits are inside the hard stops",
      "Every rejection has a specific reason",
    ],
  }),
  lesson({
    title: "Tool center point (TCP) calibration",
    summary: "Find the tool tip offset by touching one fixed point from several orientations.",
    goals: [
      "Explain what the TCP is and why an error in it shifts every move",
      "Solve the tool offset with least squares from touched poses",
      "Check the result with a residual error",
    ],
    concept: [
      "The tool centre point (TCP) is the point the program wants to place, usually the tip of a gripper finger, welding wire or needle. It is defined as an offset from the flange frame. A wrong TCP means every position is off by the same offset, and the error changes with orientation, so it cannot be fixed by shifting the program.",
      "The four-point method touches the same fixed point with the tool from different orientations. For each pose i, R_i·t + p_i is the same world point, so (R_i − R_0)·t = p_0 − p_i. Stacking these equations and solving them by least squares gives the offset t, and the size of the residual tells you how good the measurement was.",
    ],
    steps: [
      "Fix a sharp reference point in the cell (a pointer or cone).",
      "Jog the tool tip to the point from four clearly different orientations and record each flange pose (R_i, p_i).",
      "Solve for the tool offset with least squares and print the residual.",
      "Enter the offset in the tool definition and check by rotating the tool around the point: the tip must stay still.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the linear least squares."],
      ["", ""],
      [
        "def tcp_offset(R, p):",
        "R = list of 3x3 flange rotations, p = list of flange positions (m) at the same touched point.",
      ],
      [
        "    A = np.vstack([R[i] - R[0] for i in range(1, len(R))])",
        "each extra pose gives three equations (R_i - R_0) t = p_0 - p_i.",
      ],
      [
        "    b = np.hstack([p[0] - p[i] for i in range(1, len(R))])",
        "the matching right-hand sides, stacked into one vector.",
      ],
      [
        "    t, *_ = np.linalg.lstsq(A, b, rcond=None)",
        "solve for the tool offset t that fits all poses best.",
      ],
      [
        "    residual = np.linalg.norm(A @ t - b)",
        "how well the offset explains the measurements (metres).",
      ],
      ["    return t, residual", "give back the offset and its quality."],
      ["", ""],
      [
        "# R and p come from the robot controller: one entry per touch of the same point.",
        "collect at least four poses with clearly different tool orientations.",
      ],
      ["# t, err = tcp_offset(R, p)", "run the solver once the poses are recorded."],
      [
        "# print(t.round(4), err)",
        "a good calibration has a residual of about a millimetre or less.",
      ],
    ),
    walk: [
      "Stacking equations from several poses makes the noisy measurements average out through least squares.",
      "Using different orientations is essential: identical orientations give identical equations and no answer.",
      "The residual is a built-in quality check, so a bad touch is visible before the tool is used.",
    ],
    expect: [
      "The residual is small (about a millimetre) and consistent when you add or remove one pose.",
      "After entering the offset, the tip stays on the reference point while you reorient the tool.",
    ],
    fix: [
      [
        "The residual is large.",
        "One touch was inaccurate or the orientations were too similar. Repeat with orientations at least 30 degrees apart and touch more slowly.",
      ],
      [
        "The tool tip drifts when reorienting.",
        "The offset was entered in the wrong units (mm versus m) or the wrong frame. Check the controller's tool convention.",
      ],
    ],
    exercise:
      "Generate synthetic poses for a known offset t = (0, 0, 0.15) with 0.5 mm of noise and measure how the calibration error changes with 4, 6 and 10 poses.",
    checklist: [
      "At least four well-spread orientations are used",
      "The residual is checked and recorded",
      "The offset is verified by reorienting around the point",
    ],
  }),
];
