import { hash, cpp, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 04 · Cartesian Gantry Robot — lessons 1–13 (Linear Kinematics, then Industrial Applications)
export const module04a: LessonSpec[] = [
  lesson({
    title: "Cartesian XYZ architecture",
    summary:
      "Understand the three orthogonal linear axes, drive types and how motor speed becomes tool speed.",
    goals: [
      "Describe a gantry with three perpendicular linear axes",
      "Compare belt, ball-screw and rack-and-pinion drives",
      "Convert motor speed into linear speed",
    ],
    concept: [
      "A Cartesian robot moves along three perpendicular linear axes, X, Y and Z. A gantry has two supports that carry a bridge (the Y axis) and a carriage on it (X), with Z hanging from the carriage. Because every axis is independent and linear, the kinematics are trivial, the position is easy to think about and the payload and stroke can be very large.",
      "The drive decides the properties. Toothed belts are fast and cheap but stretch, ball screws are accurate and stiff but limited in length and speed, and rack-and-pinion drives handle long travel and heavy loads with moderate accuracy. Linear speed is the motor speed divided by the gear ratio times the travel per revolution of the drive.",
    ],
    steps: [
      "List the three axes with their drive types and travel lengths.",
      "Find the travel per motor revolution for each drive.",
      "Compute the maximum linear speed from the motor's maximum speed.",
      "Compare the result with the required cycle time.",
    ],
    example: hash(
      ["def linear_speed(motor_rpm, gear_ratio, mm_per_rev):", "tool speed in mm/s for one axis."],
      [
        "    return motor_rpm / gear_ratio / 60.0 * mm_per_rev",
        "revolutions per second at the drive shaft, times the travel per revolution.",
      ],
      ["", ""],
      ["AXES = {", "three axes with different drives."],
      [
        "    'x': ('belt', 3000, 10.0, 60.0),",
        "a toothed belt: 60 mm of travel per pulley turn, 10:1 gearbox.",
      ],
      [
        "    'y': ('rack', 3000, 20.0, 60.0),",
        "rack and pinion for the long bridge axis: 60 mm per pinion turn, 20:1 gearbox.",
      ],
      ["    'z': ('ball screw', 3000, 1.0, 10.0),", "a ball screw with a 10 mm pitch, no gearbox."],
      ["}", "end of the table."],
      ["", ""],
      ["for name, (kind, rpm, ratio, mm_rev) in AXES.items():", "go through every axis."],
      [
        "    print(name, kind, round(linear_speed(rpm, ratio, mm_rev)), 'mm/s')",
        "prints x 300, y 150 and z 500 mm/s.",
      ],
    ),
    walk: [
      "The same formula covers all three drive types; only the travel per revolution changes.",
      "The gearbox lowers the speed and raises the force, which is why heavy axes use a higher ratio.",
      "The slowest axis often decides the cycle time of a move that uses all three.",
    ],
    expect: [
      "The script prints x 300 mm/s, y 150 mm/s and z 500 mm/s for the example values.",
      "You can explain why the Z axis with the ball screw is the fastest here although its motor is the same.",
    ],
    fix: [
      [
        "The measured speed is lower than calculated.",
        "Acceleration limits and the motor's torque curve reduce the average speed. Check the peak speed and the profile separately.",
      ],
      [
        "The axis position drifts over time.",
        "A belt stretches and a rack can slip. Add a linear encoder for the axes that need absolute accuracy.",
      ],
    ],
    exercise:
      "Add a maximum acceleration for each axis and compute the time of a 500 mm move in X, Y and Z with a trapezoidal profile.",
    checklist: [
      "Each axis has a drive type and its travel per revolution",
      "Speeds are computed from motor speed and gear ratio",
      "The drive choice fits the accuracy and length required",
    ],
  }),
  lesson({
    title: "Prismatic joint modeling",
    summary:
      "Describe the three sliding axes in URDF with limits and connect them to ros2_control.",
    goals: [
      "Write a prismatic joint with axis, limits and units",
      "Explain the differences from revolute joints in units and limits",
      "Check the model with tf2 and RViz",
    ],
    concept: [
      "A prismatic joint slides along an axis instead of rotating. In URDF its position is measured in metres, its velocity in metres per second and its effort in newtons. The limit tag carries the travel range, and the axis tag gives the direction of sliding in the joint's own frame. A gantry is three prismatic joints in series, X then Y then Z.",
      "The order of the joints in the tree is the order of the mechanical construction: the bridge carries the carriage and the carriage carries the Z axis. Getting the order wrong gives a model that looks right when one axis moves but is wrong when two move at once, because a joint moves everything below it in the tree.",
    ],
    steps: [
      "Write the link chain: base, bridge, carriage, z_slide, tool.",
      "Connect the links with prismatic joints along y, x and z.",
      "Set limits from the machine drawing.",
      "Move each joint in RViz and check that the tool moves only along the expected axis.",
    ],
    example: xml(
      [
        '<joint name="y_axis" type="prismatic">',
        "the bridge slides along the machine's long axis (Y).",
      ],
      ['  <parent link="base_link"/><child link="bridge"/>', "the frame carries the bridge."],
      [
        '  <origin xyz="0 0 0" rpy="0 0 0"/><axis xyz="0 1 0"/>',
        "slide along y; the joint frame starts at the base origin.",
      ],
      [
        '  <limit lower="0.0" upper="2.0" velocity="0.8" effort="400"/>',
        "0 to 2 m of travel, 0.8 m/s and 400 N of force.",
      ],
      ["</joint>", "end of the Y axis."],
      ['<joint name="x_axis" type="prismatic">', "the carriage slides along the bridge (X)."],
      ['  <parent link="bridge"/><child link="carriage"/>', "the bridge carries the carriage."],
      [
        '  <origin xyz="0 0 0.4" rpy="0 0 0"/><axis xyz="1 0 0"/>',
        "0.4 m above the base, sliding along x.",
      ],
      ['  <limit lower="0.0" upper="1.2" velocity="1.0" effort="200"/>', "1.2 m of travel."],
      ["</joint>", "end of the X axis."],
      ['<joint name="z_axis" type="prismatic">', "the vertical slide on the carriage (Z)."],
      ['  <parent link="carriage"/><child link="tool0"/>', "the carriage carries the tool."],
      [
        '  <origin xyz="0 0 0" rpy="0 0 0"/><axis xyz="0 0 -1"/>',
        "slide downward: a larger value means a lower tool.",
      ],
      ['  <limit lower="0.0" upper="0.5" velocity="0.5" effort="150"/>', "0.5 m of stroke."],
      ["</joint>", "end of the Z axis."],
    ),
    walk: [
      "Effort is a force in newtons here, not a torque, which is a common source of unit mistakes.",
      "The parent and child links define the construction order and therefore which axis moves which parts.",
      "The Z axis points down so that positive values mean 'lower', which matches how machine operators think.",
    ],
    expect: [
      "Moving y_axis in RViz moves the bridge, the carriage and the tool together.",
      "tf2_echo base_link tool0 shows x, y and z changing independently when each joint is moved.",
    ],
    fix: [
      [
        "Moving one axis moves the wrong parts.",
        "The parent and child links are in the wrong order. Check which link carries which.",
      ],
      [
        "The tool moves in the opposite direction.",
        "The axis sign is reversed. Flip the axis vector, or the controller's scaling.",
      ],
    ],
    exercise:
      "Add collision shapes and inertia to each link, then check with check_urdf and compare the tool position at three joint sets with a hand calculation.",
    checklist: [
      "Each joint has its axis, limits and units",
      "The construction order matches the machine",
      "The tool moves only along the expected axis",
    ],
  }),
  lesson({
    title: "FK derivation",
    summary:
      "Write the forward kinematics of a gantry and see why inverse kinematics is just the same equations reversed.",
    goals: [
      "Write the tool position from three joint values and offsets",
      "Include a tool offset and a frame offset",
      "Show that inverse kinematics is a subtraction",
    ],
    concept: [
      "Because the axes are orthogonal and prismatic, the forward kinematics of a gantry is a sum: tool position = axis values + a constant offset from the machine origin + the tool offset. There are no angles, no trigonometry and no multiple solutions. The transform from base to tool is a pure translation.",
      "Inverse kinematics follows by subtracting the same offsets: axis value = target − offsets. That makes gantries easy to program, but it means that every error in the offsets goes straight into the tool position. Checking the offsets with a touch on a known point is the most important calibration for a gantry.",
    ],
    steps: [
      "Write the axis values as a vector q = (x, y, z).",
      "Add the machine origin offset and the tool offset.",
      "Write the inverse by subtracting the offsets.",
      "Test that forward then inverse returns the original values.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "ORIGIN = np.array([0.150, 0.100, 0.800])",
        "position of the axis zero point in the machine frame (metres).",
      ],
      [
        "TOOL = np.array([0.020, 0.000, -0.120])",
        "tool tip relative to the carriage: 20 mm sideways and 120 mm below.",
      ],
      ["", ""],
      ["def forward(q):", "tool position in the machine frame for axis values q = (x, y, z)."],
      [
        "    return ORIGIN + np.asarray(q, float) * np.array([1.0, 1.0, -1.0]) + TOOL",
        "z is reversed because the Z axis moves downward.",
      ],
      ["", ""],
      ["def inverse(p):", "axis values that put the tool at position p."],
      [
        "    return (np.asarray(p, float) - ORIGIN - TOOL) * np.array([1.0, 1.0, -1.0])",
        "subtract the offsets and undo the sign.",
      ],
      ["", ""],
      ["q = np.array([0.5, 0.3, 0.1])", "a set of axis values."],
      [
        "print(forward(q), inverse(forward(q)))",
        "the second vector equals q: prints [0.5 0.3 0.1].",
      ],
    ),
    walk: [
      "The whole kinematics is two short functions and a table of offsets.",
      "The sign flip for Z is explicit, so nobody has to guess the direction of the axis.",
      "The round trip forward then inverse is the simplest test that a model is consistent.",
    ],
    expect: [
      "The printed forward position is [0.67 0.4 0.58] and the inverse recovers [0.5 0.3 0.1].",
      "Changing TOOL shifts the position by exactly the change.",
    ],
    fix: [
      [
        "The tool lands at a constant offset from the target.",
        "The origin or tool offset is wrong. Touch a known point and correct the offsets.",
      ],
      [
        "The Z direction is reversed.",
        "The axis sign is different on your machine. Set the sign in one place and use it everywhere.",
      ],
    ],
    exercise:
      "Add a rotation of the machine frame by 1 degree about z (for a slightly skewed installation) and update both functions.",
    checklist: [
      "Offsets and signs are in one place",
      "The forward and inverse functions round-trip",
      "Offsets are checked with a touch on a known point",
    ],
  }),
  lesson({
    title: "Workspace definition",
    summary: "Define the usable work area as a box with keep-out zones and margins.",
    goals: [
      "Describe the workspace as axis ranges minus margins",
      "Add keep-out boxes for fixtures and posts",
      "Check a target and a straight path against the workspace",
    ],
    concept: [
      "The workspace of a gantry is a box given by the travel of the three axes. The usable workspace is smaller: a margin near each end keeps the axes away from the mechanical stops, and fixtures, clamps, posts and cables create keep-out boxes that the tool must not enter. Defining all of it as data makes checking simple and reviewable.",
      "A straight-line move between two allowed points can still cross a keep-out box, so checking only the end points is not enough. The path should be sampled or tested against each box, and moves that fail are rejected before they start.",
    ],
    steps: [
      "Write the axis ranges and the end-of-travel margin.",
      "Write each keep-out box with its minimum and maximum corner.",
      "Check that the target is inside the workspace and outside all keep-out boxes.",
      "Sample the straight path between two points and check every sample.",
    ],
    example: hash(
      ["RANGE = {'x': (0.0, 1.2), 'y': (0.0, 2.0), 'z': (0.0, 0.5)}", "axis travel in metres."],
      ["MARGIN = 0.010", "stay 10 mm away from the mechanical ends."],
      [
        "KEEP_OUT = [((0.4, 0.8, 0.0), (0.6, 1.0, 0.3))]",
        "one fixture block: minimum corner and maximum corner.",
      ],
      ["", ""],
      ["def allowed(p):", "is this position inside the usable workspace?"],
      ["    for v, (lo, hi) in zip(p, RANGE.values()):", "check each axis."],
      ["        if not (lo + MARGIN <= v <= hi - MARGIN):", "inside the travel with the margin?"],
      ["            return False", "no: outside the workspace."],
      ["    for lo, hi in KEEP_OUT:", "check each keep-out box."],
      [
        "        if all(l <= v <= h for v, l, h in zip(p, lo, hi)):",
        "is the point inside the box on all three axes?",
      ],
      ["            return False", "yes: in a forbidden zone."],
      ["    return True", "allowed."],
      ["", ""],
      ["def path_ok(a, b, samples=50):", "is the straight line from a to b free?"],
      [
        "    return all(allowed([a[i] + (b[i] - a[i]) * k / samples for i in range(3)]) for k in range(samples + 1))",
        "test 51 points along the line.",
      ],
      ["", ""],
      [
        "print(allowed((0.5, 0.9, 0.1)), path_ok((0.1, 0.9, 0.1), (1.1, 0.9, 0.1)))",
        "prints False False: the first point is in the fixture and the path crosses it.",
      ],
    ),
    walk: [
      "The margin is applied on both ends of each axis, so commanded positions never touch the stops.",
      "path_ok() catches the case where both end points are fine but the line between them is not.",
      "With 50 samples over 1 m the spacing is 2 cm, so keep-out boxes should be larger than that.",
    ],
    expect: [
      "The example prints False for the point inside the fixture and False for the path through it.",
      "Moving the path above the fixture (z = 0.4) makes path_ok return True.",
    ],
    fix: [
      [
        "A path passes through a thin obstacle.",
        "The sample spacing is larger than the obstacle. Use more samples, or do an exact segment-box intersection test.",
      ],
      [
        "Valid positions are rejected.",
        "The margin is larger than the clearance you need, or the box coordinates use a different frame.",
      ],
    ],
    exercise:
      "Replace the sampled path check with an exact segment-box intersection test and compare the results with the sampled version on 1,000 random paths.",
    checklist: [
      "Margins keep the axes off the stops",
      "Keep-out boxes are data",
      "Paths, not only end points, are checked",
    ],
  }),
  lesson({
    title: "Rail alignment",
    summary:
      "Measure axis squareness and correct the small errors that make X and Y not perpendicular.",
    goals: [
      "Explain squareness and parallelism errors",
      "Compute the position error caused by a squareness error",
      "Apply a software correction",
    ],
    concept: [
      "Two rails are never perfectly perpendicular or parallel. A squareness error θ between the X and Y axes makes a move along Y also shift the tool in X by y·tan θ. Over a 1 m axis, an error of 0.05 degrees is about 0.9 mm, which is much more than the repeatability of the drives.",
      "Mechanical alignment removes most of the error, and the rest can be corrected in software once measured. The measurement is made by moving along one axis and reading the deviation on the other with a dial gauge or a laser, or by measuring a precision square. The correction subtracts the known error from the X command in proportion to Y.",
    ],
    steps: [
      "Move the Y axis along a straight edge or a precision square and record the X deviation at both ends.",
      "Compute the angle from the deviation and the length.",
      "Add the correction to the X command as a function of Y.",
      "Repeat the measurement to confirm the error is gone.",
    ],
    example: hash(
      ["import math", "for the angle and tangent."],
      ["", ""],
      [
        "def squareness_deg(deviation_mm, length_mm):",
        "the squareness error in degrees from a measured deviation.",
      ],
      [
        "    return math.degrees(math.atan2(deviation_mm, length_mm))",
        "the angle whose tangent is deviation over length.",
      ],
      ["", ""],
      ["def corrected_x(x, y, theta_deg):", "the X command that cancels the squareness error."],
      [
        "    return x - y * math.tan(math.radians(theta_deg))",
        "subtract the shift caused by moving along Y.",
      ],
      ["", ""],
      ["theta = squareness_deg(0.873, 1000.0)", "0.873 mm of deviation over a 1000 mm Y move."],
      [
        "print(round(theta, 3), round(corrected_x(500.0, 1000.0, theta), 3))",
        "prints 0.05 and 499.127: the command is corrected by 0.873 mm at y = 1000.",
      ],
    ),
    walk: [
      "The correction grows linearly with Y, so it is zero at the origin and largest at the far end.",
      "Using atan2 avoids problems when the length is small or zero.",
      "The correction is only valid for the measured direction of the error; the sign must be checked with a test move.",
    ],
    expect: [
      "The script prints 0.05 degrees and a corrected X of 499.127 mm.",
      "A second measurement after the correction shows a deviation close to zero.",
    ],
    fix: [
      [
        "The error changes with the load.",
        "The gantry flexes. Measure with the typical payload and consider a mechanical fix such as a stiffer bridge.",
      ],
      [
        "The correction makes it worse.",
        "The sign is wrong. Check with a small move and flip the sign of the correction.",
      ],
    ],
    exercise:
      "Measure X, Y and Z pairwise squareness errors in simulation with added synthetic errors and build a 3 x 3 correction matrix.",
    checklist: [
      "The measurement uses a precision reference",
      "The correction sign is verified",
      "The result is re-measured after correction",
    ],
  }),
  lesson({
    title: "Backlash & compensation",
    summary: "Compensate the dead zone that appears when an axis reverses direction.",
    goals: [
      "Explain backlash in gears, screws and belts",
      "Add a compensation that depends on the movement direction",
      "Verify the compensation with a reversal test",
    ],
    concept: [
      "Backlash is the small gap between mating parts, in a gearbox, a rack and pinion or a ball screw nut. When the axis reverses, the motor turns through the gap before the load moves, so the tool position lags by the size of the gap. It is a source of position error that depends on the direction of the last move.",
      "Compensation adds the backlash value to the command when the direction reverses and keeps it while the direction stays the same. It works well if the backlash is constant and measured; it cannot fix wear that changes over time. The best cure is mechanical: preloaded nuts and anti-backlash gears; software compensation is the second line.",
    ],
    steps: [
      "Measure the backlash with a dial gauge: move forward, then reverse, and read the difference.",
      "Store the backlash in millimetres for each axis.",
      "Track the direction of the last move and add the compensation on reversal.",
      "Test by approaching the same target from both directions.",
    ],
    example: hash(
      ["class Backlash:", "adds a direction-dependent compensation to axis commands."],
      ["    def __init__(self, backlash_mm):", "the measured gap for this axis."],
      [
        "        self.b, self.direction, self.last = backlash_mm, 0, 0.0",
        "the gap, the last direction (+1/-1) and the last target.",
      ],
      ["", ""],
      ["    def command(self, target_mm):", "the motor command for a desired tool position."],
      ["        if target_mm > self.last:", "moving in the positive direction."],
      ["            self.direction = 1", "remember it."],
      ["        elif target_mm < self.last:", "moving in the negative direction."],
      ["            self.direction = -1", "remember it."],
      ["        self.last = target_mm", "store the target for the next call."],
      [
        "        return target_mm + (self.b / 2.0) * self.direction",
        "shift the command by half the gap in the direction of travel.",
      ],
      ["", ""],
      ["axis = Backlash(0.06)", "an axis with 0.06 mm of backlash."],
      [
        "print(axis.command(100.0), axis.command(50.0), axis.command(50.0))",
        "prints 100.03, 49.97 and 49.97: the offset flips when the direction reverses.",
      ],
    ),
    walk: [
      "Half the gap is used on each side, so the command is centred on the middle of the gap.",
      "An unchanged target keeps the last direction, so a repeat of the same command does not flip the offset.",
      "The compensation is applied in the command, so it works with any controller that accepts positions.",
    ],
    expect: [
      "The output flips from +0.03 to -0.03 mm when the axis reverses.",
      "In a reversal test the difference between approaching from both sides drops close to zero.",
    ],
    fix: [
      [
        "The error is worse after compensation.",
        "The backlash value is too large or has the wrong sign. Re-measure with a dial gauge.",
      ],
      [
        "The error varies along the axis.",
        "Wear is uneven. Measure at several positions and use a table.",
      ],
    ],
    exercise:
      "Simulate a system with 0.05 mm of backlash and measure the reversal error with and without compensation over 100 random moves.",
    checklist: [
      "Backlash is measured, not assumed",
      "Compensation depends on direction",
      "The result is verified by approaching from both sides",
    ],
  }),
  lesson({
    title: "Payload effects",
    summary: "Estimate how the bridge deflects under load and what that does to accuracy.",
    goals: [
      "Compute the deflection of a beam under a central load",
      "Relate payload and span to accuracy",
      "Choose a stiffer profile from the numbers",
    ],
    concept: [
      "A gantry's bridge is a beam. Under a load P at the middle of a beam of length L, supported at both ends, the deflection is δ = P·L³ / (48·E·I), where E is the material's stiffness (Young's modulus) and I is the section's second moment of area. The deflection grows with the cube of the span, so doubling the span multiplies it by eight.",
      "This deflection changes the Z position by a fraction of a millimetre when the carriage is in the middle, and less at the ends. It is predictable, so it can be partly compensated, but the best fix is a stiffer profile or a shorter span. The same formula tells how much the accuracy will change when the payload is doubled.",
    ],
    steps: [
      "Write the span, the payload and the beam's E and I.",
      "Compute the deflection at the middle of the beam.",
      "Repeat for double the payload and for a shorter span.",
      "Choose the profile that keeps the deflection below the accuracy target.",
    ],
    example: hash(
      [
        "def deflection_mm(load_n, span_m, E=70e9, I=2.0e-6):",
        "middle deflection of a simply supported beam under a central load.",
      ],
      [
        "    return load_n * span_m**3 / (48.0 * E * I) * 1000.0",
        "P*L^3 / (48*E*I) in metres, converted to millimetres.",
      ],
      ["", ""],
      [
        "print(round(deflection_mm(500.0, 2.0), 3))",
        "500 N on a 2 m aluminium beam: prints 0.595 mm.",
      ],
      [
        "print(round(deflection_mm(1000.0, 2.0), 3))",
        "double the load doubles the deflection: prints 1.19 mm.",
      ],
      [
        "print(round(deflection_mm(500.0, 1.0), 3))",
        "half the span cuts it to one eighth: prints 0.074 mm.",
      ],
    ),
    walk: [
      "The three prints show the two levers: load enters linearly, span enters as the cube.",
      "E is the material's stiffness (aluminium about 70 GPa, steel about 200 GPa).",
      "The model ignores the beam's own weight and the carriage's moving position, so treat it as an estimate.",
    ],
    expect: [
      "The script prints 0.595, 1.19 and 0.074 (mm).",
      "You can name two changes that reduce deflection by a factor of four.",
    ],
    fix: [
      [
        "The measured deflection is larger.",
        "Joints and clamps add compliance. Measure with a dial gauge and add the difference as a stiffness loss.",
      ],
      [
        "Accuracy differs between the middle and the ends.",
        "That is expected: deflection is largest at the middle. Use a position-dependent correction.",
      ],
    ],
    exercise:
      "Recompute the deflection with a steel beam of the same size (E = 200 GPa) and with a beam of twice the I, and tabulate the results.",
    checklist: [
      "The span and load are in consistent units",
      "The deflection is compared with the accuracy target",
      "The stiffest affordable profile is chosen",
    ],
  }),
  lesson({
    title: "Soft limits & hard limits",
    summary:
      "Combine software limits, hard limit switches and a state machine so the gantry homes safely and refuses bad moves.",
    goals: [
      "Explain the difference between soft limits, hard limits and mechanical stops",
      "Model the gantry's states: unconfigured, homing, ready, moving and fault",
      "Refuse moves outside the limits or in the wrong state",
    ],
    concept: [
      "There are three lines of defence at the end of an axis. Soft limits are the software travel range; they should stop the axis first. Hard limits are switches wired to the drive or safety controller; they cut motion if the soft limit fails. Mechanical stops are the last resort that must never be touched at speed. Soft limits sit inside the hard limits with enough distance to brake.",
      "A gantry uses incremental encoders and does not know its position at power-up. It must home first: move slowly to a home switch, then define the position. Until then the software limits are meaningless, so moves must be refused. A small state machine (unconfigured, homing, ready, moving, fault) makes this explicit and makes the fault state a place that only an operator can leave.",
    ],
    steps: [
      "Define the states and the transitions between them.",
      "Allow a move request only in the ready state and only inside the limits.",
      "Update the state from the goal response and the result callbacks.",
      "Test a request before homing and one outside the limits.",
    ],
    example: cpp(
      [
        "enum class GantryState { unconfigured, homing, ready, moving, fault };",
        "the states the gantry can be in; enum class keeps the names from mixing with others.",
      ],
      [
        "bool request_move(const std::array<double, 3> & xyz) {",
        "try to start a move to an X, Y, Z position in metres; returns true only if the request was accepted.",
      ],
      [
        "  if (state_ != GantryState::ready || !limits_.contains(xyz)) return false;",
        "refuse if the gantry is not homed and ready, or if the target is outside the soft limits.",
      ],
      [
        "  auto options = GoalOptions{};",
        "create the options object that holds callbacks for this goal.",
      ],
      [
        "  options.goal_response_callback = [this](const auto & handle) {",
        "runs when the server accepts or rejects the goal; this captures the current object so it can change state_.",
      ],
      [
        "    state_ = handle ? GantryState::moving : GantryState::ready;",
        "if the goal was accepted (handle is valid), we are moving; otherwise go back to ready.",
      ],
      ["  };", "end of the response callback."],
      [
        "  options.result_callback = [this](const auto & result) {",
        "runs when the motion finishes, and gives the outcome in result.",
      ],
      [
        "    state_ = result.code == ResultCode::SUCCEEDED ? GantryState::ready : GantryState::fault;",
        "success returns to ready; any other outcome puts the gantry in fault so recovery must be explicit.",
      ],
      ["  };", "end of the result callback."],
      [
        "  trajectory_client_->async_send_goal(make_goal(xyz), options);",
        "build the goal from the position and send it without blocking, with the callbacks attached.",
      ],
      ["  return true;", "tell the caller the request was accepted."],
      ["}", "end of the function."],
    ),
    walk: [
      "The state is only changed in callbacks, which keeps a single source of truth about what the gantry is doing.",
      "A rejected goal returns to ready without moving, and a failed motion goes to fault.",
      "Soft limits are enforced here, and hard limits are enforced by hardware that this code cannot switch off.",
    ],
    expect: [
      "A request before homing returns false and nothing moves.",
      "A request beyond the soft limits returns false; a valid request returns true and the state becomes moving, then ready.",
    ],
    fix: [
      [
        "The gantry stays in moving forever.",
        "The result callback never fires because the goal was lost. Add a timeout that moves to fault.",
      ],
      [
        "The axis hits the hard limit switch.",
        "The soft limit is too close to the switch for the braking distance. Move it inward by the stopping distance plus a margin.",
      ],
    ],
    exercise:
      "Implement simulated homing and a motion request. Prove that pre-home and beyond-limit moves are refused.",
    checklist: [
      "Linear values use metres",
      "Motion is impossible before homing",
      "Soft limits are conservative",
    ],
    source: ["Managed node lifecycle", "https://design.ros2.org/articles/node_lifecycle.html"],
  }),
  lesson({
    title: "Cable management",
    summary: "Size a cable chain from the travel length and bend radius and avoid cable fatigue.",
    goals: [
      "Explain why cable chains are used on moving axes",
      "Estimate chain length from travel and bend radius",
      "List the rules that make cables last",
    ],
    concept: [
      "Cables on a moving axis are flexed millions of times. Ordinary cables break, so energy chains (drag chains) with flexible cables guide them and limit the bend radius. The chain length follows from the travel S: half the travel plus the length of the bend and some reserve, L ≈ S/2 + π·R + reserve, where R is the bend radius of the chain.",
      "Cables must be rated for continuous flexing, kept free inside the chain with spare room, separated by function (power and signal apart) and supported so they do not rub. Ignoring the minimum bend radius is the most common cause of early failure. Pneumatic hoses and encoder cables have their own limits, which the chain must respect.",
    ],
    steps: [
      "Take the axis travel and the chain's minimum bend radius from the catalogue.",
      "Compute the chain length with the formula and round up to a whole number of links.",
      "Check that the cable's bend radius is not larger than the chain's.",
      "Plan separate compartments for power, signal and air.",
    ],
    example: hash(
      ["import math", "for pi."],
      ["", ""],
      [
        "def chain_length(travel_mm, bend_radius_mm, reserve_mm=100.0):",
        "chain length in mm; an estimate, check the manufacturer's tool.",
      ],
      [
        "    return travel_mm / 2.0 + math.pi * bend_radius_mm + reserve_mm",
        "half the travel, the curved part and some spare length.",
      ],
      ["", ""],
      [
        "def links(length_mm, pitch_mm=50.0):",
        "number of chain links (each link has a fixed pitch).",
      ],
      ["    return math.ceil(length_mm / pitch_mm)", "always round up."],
      ["", ""],
      ["L = chain_length(1500.0, 100.0)", "a 1.5 m axis with a chain of 100 mm bend radius."],
      ["print(round(L, 1), links(L))", "prints 1164.2 mm and 24 links."],
    ),
    walk: [
      "Half the travel appears because the chain folds back on itself, so it only moves half as far as the carriage.",
      "The bend radius enters through π·R, the length of the half circle at the fold.",
      "Rounding up to whole links avoids a chain that is a fraction too short.",
    ],
    expect: [
      "The script prints 1164.2 mm and 24 links.",
      "A tighter chain (R = 75 mm) shortens the chain by about 79 mm.",
    ],
    fix: [
      [
        "Cables fail after a few months.",
        "The cable is not rated for continuous flexing, or the bend radius is smaller than allowed. Use the correct cable type.",
      ],
      [
        "The chain vibrates or slaps.",
        "It is too long or unsupported. Add a guide channel or a support and reduce the acceleration at the ends.",
      ],
    ],
    exercise:
      "Compute the chains for the three axes of a gantry with 2.0 m, 1.2 m and 0.5 m of travel and list the number of links for each.",
    checklist: [
      "The cable's bend radius fits the chain",
      "Power and signal are separated",
      "Chain length and supports are checked",
    ],
  }),
  lesson({
    title: "Calibration",
    summary: "Correct axis scale errors by fitting measured positions against commanded ones.",
    goals: [
      "Explain scale error and offset in a linear axis",
      "Fit a line to commanded versus measured positions",
      "Apply the inverse of the fit as a correction",
    ],
    concept: [
      "If the belt pulley diameter or the screw pitch is slightly different from the nominal value, every move is proportionally too long or too short. That is a scale error, and it grows with distance. A constant shift of the zero position is an offset. Both are found by moving to several commanded positions, measuring where the axis really is with a laser or a gauge block, and fitting a straight line.",
      "The slope of the fit is the scale factor and the intercept is the offset. The correction divides by the slope and subtracts the offset, so that the commanded position becomes the real position. Residuals from the line show non-linear errors such as screw pitch error, which need a lookup table.",
    ],
    steps: [
      "Command six positions from 0 to 1000 mm.",
      "Measure the real position at each one.",
      "Fit a line and read the slope and the offset.",
      "Apply the correction and measure again.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the line fit."],
      ["", ""],
      [
        "commanded = np.array([0, 200, 400, 600, 800, 1000], float)",
        "positions sent to the axis (mm).",
      ],
      [
        "measured = np.array([0.00, 200.08, 400.19, 600.27, 800.35, 1000.44])",
        "positions measured with a laser (mm).",
      ],
      ["", ""],
      [
        "slope, offset = np.polyfit(commanded, measured, 1)",
        "the best straight line: measured = slope * commanded + offset.",
      ],
      [
        "print(round(slope, 5), round(offset, 3))",
        "prints about 1.00044 and 0.001: the axis is 0.044 % too long and the zero is right.",
      ],
      ["", ""],
      ["def corrected(target_mm):", "command that makes the axis reach the target."],
      ["    return (target_mm - offset) / slope", "invert the line."],
      ["", ""],
      [
        "print(round(corrected(500.0), 2))",
        "prints about 499.78: ask for slightly less to end up at 500.",
      ],
    ),
    walk: [
      "The fit uses all six points, so one bad measurement has little effect.",
      "Inverting the line turns a measured error into a correction that needs no change in the drive.",
      "The residuals (measured minus the fit) are worth printing: large ones point to a non-linear error.",
    ],
    expect: [
      "The script prints a slope of about 1.00044 and a correction of about 499.78 mm for a 500 mm target.",
      "After applying it, the residual error at the six points is below 0.03 mm.",
    ],
    fix: [
      [
        "Residuals show a repeating pattern.",
        "That is the screw's pitch error. Measure at smaller intervals and build a correction table.",
      ],
      [
        "The calibration is lost after a restart.",
        "Store the slope and offset in the controller's configuration and load them at start-up.",
      ],
    ],
    exercise:
      "Add the residuals to the output, then extend the correction to a lookup table with linear interpolation between the measured points.",
    checklist: [
      "Measurements use a traceable reference",
      "Slope and offset are stored in configuration",
      "Residuals are checked for non-linear errors",
    ],
  }),
  lesson({
    title: "CNC-style motion planning",
    summary:
      "Blend path corners with a tolerance so the gantry keeps speed without cutting corners too much.",
    goals: [
      "Explain why full stops at every corner are slow",
      "Relate a blend tolerance to a corner radius",
      "Compute the corner speed from the axis acceleration",
    ],
    concept: [
      "A path made of straight segments has sharp corners. Stopping at every corner is slow, and taking them at full speed is impossible because the axes cannot change direction instantly. CNC controllers blend the corner with a small arc: the tool cuts the corner by at most a chosen tolerance δ and passes through it at a speed limited by the axis acceleration.",
      "For a corner with interior angle φ, the arc of radius r cuts a distance δ = r·(1/sin(φ/2) − 1) from the sharp corner, so r = δ / (1/sin(φ/2) − 1). The speed through an arc is limited by the acceleration, v = √(a·r). A tighter tolerance means a smaller radius and a lower corner speed, so the tolerance is a trade between accuracy and speed.",
    ],
    steps: [
      "Choose the tolerance δ and the acceleration limit.",
      "For every corner compute the blend radius from the angle.",
      "Compute the corner speed with v = √(a·r).",
      "Compare the total time with and without blending.",
    ],
    example: hash(
      ["import math", "for sine and square root."],
      ["", ""],
      [
        "def corner_speed(interior_deg, tolerance_mm, accel_mm_s2):",
        "highest speed (mm/s) through a blended corner.",
      ],
      ["    half = math.radians(interior_deg) / 2.0", "half of the corner's interior angle."],
      [
        "    r = tolerance_mm / (1.0 / math.sin(half) - 1.0)",
        "radius of the blend arc that cuts the corner by exactly the tolerance.",
      ],
      [
        "    return math.sqrt(accel_mm_s2 * r)",
        "centripetal limit: v squared over r equals the acceleration.",
      ],
      ["", ""],
      [
        "print(round(corner_speed(90, 0.05, 2000.0), 1))",
        "a right-angle corner: prints 15.5 mm/s.",
      ],
      [
        "print(round(corner_speed(150, 0.05, 2000.0), 1))",
        "a gentle bend (150 degrees inside): prints 53.2 mm/s, more than three times faster.",
      ],
    ),
    walk: [
      "A right-angle corner with a 0.05 mm tolerance is slow, but a gentle bend allows more than three times the speed.",
      "The tolerance appears in the radius, so halving it lowers the corner speed by about 30 %.",
      "Real controllers look ahead over many segments so that the speed profile stays smooth.",
    ],
    expect: [
      "The script prints 15.5 mm/s for the 90 degree corner and 53.2 mm/s for the 150 degree corner.",
      "Doubling the acceleration increases the corner speed by about 41 %.",
    ],
    fix: [
      [
        "The tool cuts corners more than expected.",
        "The blend tolerance is larger than the process allows. Reduce it or turn blending off for precision paths.",
      ],
      [
        "The motion is slow on paths with many small segments.",
        "Corner speeds are limited by each tiny corner. Merge nearly collinear segments before planning.",
      ],
    ],
    exercise:
      "Take a square path of 100 mm sides and compute the total time with a full stop at every corner and with a blended corner speed.",
    checklist: [
      "The tolerance is a deliberate choice",
      "Corner speeds come from the acceleration limit",
      "Very short segments are merged before planning",
    ],
  }),
  lesson({
    title: "G-code concepts",
    summary: "Read a small subset of G-code and turn it into a list of axis moves.",
    goals: [
      "Describe the meaning of G0, G1, G90, G21 and F",
      "Parse lines into target positions and feed rates",
      "Reject commands the machine does not support",
    ],
    concept: [
      "G-code is the classic language of CNC machines. G0 is a rapid move and G1 a controlled linear move at feed rate F. G90 selects absolute coordinates and G91 relative ones, and G21 selects millimetres. Each line holds words such as X100.0 Y50.0 F1200. Although a robot cell usually uses ROS 2 instead, G-code is still common as an input format from CAM software.",
      "A safe parser handles only the commands it understands and rejects everything else with the line number, so a program cannot do something unexpected. It keeps the modal state (units, absolute or relative, current feed rate and position), because in G-code a word applies until it is changed.",
    ],
    steps: [
      "Split each line into words and strip comments.",
      "Update the modal state for G90, G91 and F.",
      "Compute the target position from X, Y and Z words.",
      "Reject unknown G or M codes with the line number.",
    ],
    example: hash(
      ["import re", "regular expressions for splitting words."],
      ["", ""],
      ["def parse(program):", "turn G-code text into a list of moves (x, y, z, feed)."],
      [
        "    pos, feed, absolute, moves = [0.0, 0.0, 0.0], 1000.0, True, []",
        "modal state: position, feed rate, absolute mode and the result.",
      ],
      [
        "    for n, line in enumerate(program.splitlines(), 1):",
        "process each line; n is the line number for messages.",
      ],
      [
        "        moved = False",
        "does this line contain an axis word? Only those lines create a move.",
      ],
      [
        "        words = re.findall(r'([A-Z])(-?\\d+\\.?\\d*)', line.split(';')[0].upper())",
        "split into letter-number words after removing comments.",
      ],
      ["        for letter, value in words:", "handle each word."],
      ["            v = float(value)", "the number as a float."],
      [
        "            if letter == 'G' and v in (0, 1, 21):",
        "supported motion codes and millimetre mode.",
      ],
      ["                continue", "nothing to change in this simple parser."],
      ["            if letter == 'G' and v in (90, 91):", "absolute or relative coordinates."],
      ["                absolute = (v == 90)", "remember the mode."],
      ["            elif letter == 'F':", "a feed rate word."],
      ["                feed = v", "remember the feed rate."],
      ["            elif letter in 'XYZ':", "an axis word."],
      ["                i = 'XYZ'.index(letter)", "which axis it is."],
      [
        "                pos[i] = v if absolute else pos[i] + v",
        "absolute target, or a relative move.",
      ],
      ["                moved = True", "remember that this line moves the tool."],
      ["            else:", "anything else is not supported."],
      [
        "                raise ValueError(f'line {n}: unsupported word {letter}{value}')",
        "reject with the line number, never guess.",
      ],
      ["        if moved:", "a line with an axis word produces a move."],
      ["            moves.append((*pos, feed))", "record the target and the feed."],
      ["    return moves", "the list of moves for the motion planner."],
    ),
    walk: [
      "The parser keeps the modal state, exactly like a real controller, so short programs stay short.",
      "An unsupported code raises an error with a line number instead of silently skipping it.",
      "The returned moves are plain numbers, so they can be checked against the workspace before execution.",
    ],
    expect: [
      "'G90\\nG1 X10 Y20 F600' returns one move to (10, 20, 0) at feed 600; the G90 line creates no move.",
      "A line with 'M3' raises 'line 1: unsupported word M3'.",
    ],
    fix: [
      [
        "The tool goes to the wrong place.",
        "The program is in relative mode (G91) when you expect absolute. Print the modal state at the start of each move.",
      ],
      [
        "A valid program is rejected.",
        "It uses codes the parser does not support. Add them deliberately, and only after deciding what they should do on your machine.",
      ],
    ],
    exercise:
      "Add G2 and G3 arcs by converting them into short straight segments with the blend tolerance from the previous lesson.",
    checklist: [
      "Modal state is tracked",
      "Unsupported words are rejected with a line number",
      "Moves are checked against the workspace",
    ],
  }),
  lesson({
    title: "Welding gantry workflows",
    summary:
      "Plan multi-pass welds on thick plates with offsets per pass and controlled travel speed.",
    goals: [
      "Describe a multi-pass weld on a groove",
      "Generate the offsets and speeds of each pass",
      "Add a safe start and stop sequence",
    ],
    concept: [
      "Gantry welders are used for long straight seams such as plates, beams and tanks. A thick plate is welded in several passes: a root pass, filler passes and a cap. Each pass lies at a different offset in the groove, at a specific height and speed, and the heat between passes (interpass temperature) must stay within limits.",
      "The path of each pass is the same line displaced by a pass-specific offset. The program lists the passes as data: lateral offset, height offset, travel speed and wait time. A safe sequence moves to the start above the seam, starts the arc, travels, ends the arc with a crater fill and lifts away. Fume extraction, screens and the welding power source's own protections are outside the robot program.",
    ],
    steps: [
      "Write the pass table for a five-pass weld.",
      "Generate the start and end points of each pass from the seam line.",
      "Insert the wait times for interpass cooling.",
      "Simulate the sequence and print the list of moves.",
    ],
    example: hash(
      [
        "PASSES = [",
        "one row per pass: name, lateral offset (mm), height offset (mm), speed (mm/s), wait before (s).",
      ],
      ["    ('root', 0.0, 0.0, 6.0, 0),", "the first pass in the bottom of the groove."],
      [
        "    ('fill 1', -2.5, 3.0, 7.0, 60),",
        "a filler pass beside it, after a one-minute cooling wait.",
      ],
      ["    ('fill 2', 2.5, 3.0, 7.0, 60),", "the mirrored filler pass."],
      ["    ('fill 3', 0.0, 6.0, 8.0, 60),", "a filler pass higher up."],
      ["    ('cap', 0.0, 9.0, 8.0, 90),", "the final cap pass, after a longer cooling wait."],
      ["]", "end of the table."],
      ["", ""],
      ["def plan(start, end):", "the list of moves for a seam from start to end (x, y, z in mm)."],
      ["    steps = []", "collected steps."],
      ["    for name, dy, dz, speed, wait in PASSES:", "one pass at a time."],
      ["        a = (start[0], start[1] + dy, start[2] + dz)", "start point of this pass."],
      ["        b = (end[0], end[1] + dy, end[2] + dz)", "end point of this pass."],
      [
        "        steps += [('wait', wait), ('move_fast', a), ('arc_on', name), ('move_line', b, speed), ('arc_off', name)]",
        "wait, travel to the start, weld along the seam, stop the arc.",
      ],
      ["    return steps", "the whole program as data."],
      ["", ""],
      ["for s in plan((0, 0, 50), (1000, 0, 50))[:5]:", "the first pass's steps."],
      ["    print(s)", "prints wait, move_fast, arc_on, move_line and arc_off."],
    ),
    walk: [
      "The pass table holds all process choices, so a welding engineer can change them without touching code.",
      "The wait step is part of the plan, which enforces interpass cooling instead of relying on the operator.",
      "The arc is switched on only at the start of a pass and off at its end, never during fast moves.",
    ],
    expect: [
      "The plan has 25 steps (five per pass) and starts with the root pass.",
      "Changing a pass's speed changes only its move_line entry.",
    ],
    fix: [
      [
        "The weld is uneven along the seam.",
        "The plate is not flat or the seam is not straight. Add seam tracking or measure the seam before welding.",
      ],
      [
        "Heat builds up between passes.",
        "Interpass wait is too short. Measure the plate temperature and wait until it is below the limit.",
      ],
    ],
    exercise:
      "Add a check that reads a plate temperature signal and waits until it is below 200 degrees Celsius before starting each pass.",
    checklist: [
      "Pass parameters are data",
      "Interpass cooling is enforced",
      "The arc is only switched at pass start and end",
    ],
  }),
];
