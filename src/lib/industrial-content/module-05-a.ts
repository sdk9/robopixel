import { hash, cpp, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 05 · Humanoid Platform — Section A: Kinematics & Dynamics (lessons 1–10)
export const module05a: LessonSpec[] = [
  lesson({
    title: "Whole-body kinematics",
    summary:
      "Describe a humanoid as a floating base with joints and compute the centre of mass and foot positions.",
    goals: [
      "Explain the floating base and why a humanoid has 6 extra degrees of freedom",
      "Compute forward kinematics for every foot and hand",
      "Compute the centre of mass from the model",
    ],
    concept: [
      "A humanoid is not bolted to the ground. Its pelvis (the base) can translate and rotate freely, so the full state has six extra degrees of freedom on top of the joint angles: a 30-joint humanoid has 36 degrees of freedom. Forward kinematics gives the pose of every link relative to the base, and the base pose gives it in the world.",
      "Two results matter most for balance and walking: where the feet are, and where the centre of mass (CoM) is. Both come from the same model, so a rigid-body library such as Pinocchio computes them from the URDF in microseconds. Whole-body control then uses them to keep the CoM over the feet while the hands work.",
    ],
    steps: [
      "Load the humanoid URDF with a floating base joint.",
      "Set a configuration with the base at 0.9 m height and all joints at zero.",
      "Compute the frame placements and read the position of both feet.",
      "Compute the centre of mass and compare its x and y with the feet.",
    ],
    example: hash(
      ["import pinocchio as pin", "a rigid-body dynamics and kinematics library."],
      ["import numpy as np", "numpy for vectors."],
      ["", ""],
      [
        "model = pin.buildModelFromUrdf('humanoid.urdf', pin.JointModelFreeFlyer())",
        "load the robot and give it a floating base (6 extra degrees of freedom).",
      ],
      ["data = model.createData()", "workspace for the results."],
      ["", ""],
      [
        "q = pin.neutral(model)",
        "the neutral configuration: base at the origin, all joints at zero.",
      ],
      ["q[2] = 0.9", "lift the base to 0.9 m: the third value of the base is its height z."],
      ["pin.forwardKinematics(model, data, q)", "compute the pose of every joint."],
      [
        "pin.updateFramePlacements(model, data)",
        "compute the pose of every named frame, such as the feet.",
      ],
      ["", ""],
      [
        "left = data.oMf[model.getFrameId('left_foot')].translation",
        "position of the left foot in the world.",
      ],
      [
        "right = data.oMf[model.getFrameId('right_foot')].translation",
        "position of the right foot.",
      ],
      [
        "com = pin.centerOfMass(model, data, q)",
        "the centre of mass of the whole body in the world.",
      ],
      [
        "print(model.nq, model.nv, left.round(3), right.round(3), com.round(3))",
        "sizes of the configuration and velocity vectors, both feet and the CoM.",
      ],
    ),
    walk: [
      "JointModelFreeFlyer is what makes the robot a floating body; without it the pelvis would be fixed in the world.",
      "The configuration has one more value than the velocity vector (nq versus nv), because orientation is stored as a quaternion.",
      "The CoM is computed from all link masses, so wrong masses in the URDF give a wrong balance point.",
    ],
    expect: [
      "The CoM x and y lie between the two feet for a symmetric neutral pose.",
      "Moving the base by 0.1 m in x moves the feet and the CoM by the same amount.",
    ],
    fix: [
      [
        "The feet are underground or floating.",
        "The base height is not matched to the leg length. Adjust q[2] until the feet touch z = 0.",
      ],
      [
        "The CoM is far from where you expect.",
        "Some links have zero mass or wrong inertia data in the URDF. Check every <inertial> block.",
      ],
    ],
    exercise:
      "Bend the knees by 0.4 rad, lower the base until the feet touch the ground and print how the CoM height changes.",
    checklist: [
      "The model has a floating base",
      "Masses are realistic",
      "Feet and CoM are checked against the drawing",
    ],
  }),
  lesson({
    title: "Arm/leg coordination",
    summary:
      "Move arms in opposition to the legs so the body's angular momentum stays small during walking.",
    goals: [
      "Explain why arms swing opposite to the legs",
      "Generate arm and leg joint trajectories with a phase offset",
      "Scale the arm swing with walking speed",
    ],
    concept: [
      "When a leg swings forward, the body twists about the vertical axis. Swinging the opposite arm forward cancels most of that twist, so the robot yaws less and the feet need less friction. This is why people swing their arms opposite to their legs, and a humanoid gains the same benefit from the same pattern.",
      "The pattern is easy to generate: both legs and arms follow sine curves at the walking frequency, the right arm in phase with the left leg. The arm amplitude grows with the speed. The phase relation must hold through starts and stops, so both are driven from the same gait phase variable and never from separate timers.",
    ],
    steps: [
      "Define a gait phase that runs from 0 to 1 once per stride.",
      "Compute the hip and shoulder angles as sines of the phase.",
      "Shift the arm phase by half a stride relative to the same-side leg.",
      "Scale the arm amplitude with the walking speed.",
    ],
    example: hash(
      ["import math", "for the sine."],
      ["", ""],
      [
        "def swing(phase, amplitude, offset=0.0):",
        "a joint angle following a sine wave over one stride.",
      ],
      [
        "    return amplitude * math.sin(2 * math.pi * (phase + offset))",
        "offset shifts the wave in time (in strides).",
      ],
      ["", ""],
      [
        "def gait_angles(phase, speed):",
        "hip and shoulder angles (radians) for both sides at a given gait phase.",
      ],
      ["    leg_amp = 0.35", "hip swing amplitude in radians."],
      [
        "    arm_amp = 0.25 * min(1.0, speed / 1.0)",
        "arm swing grows with speed and stops at full speed.",
      ],
      ["    return {", "collect the four angles."],
      ["        'l_hip': swing(phase, leg_amp),", "left hip swings with the phase."],
      ["        'r_hip': swing(phase, leg_amp, 0.5),", "the right hip is half a stride behind."],
      [
        "        'l_shoulder': swing(phase, arm_amp, 0.5),",
        "the left arm moves with the RIGHT leg: opposite to the left leg.",
      ],
      ["        'r_shoulder': swing(phase, arm_amp),", "the right arm moves with the LEFT leg."],
      ["    }", "end of the result."],
      ["", ""],
      ["print(gait_angles(0.25, 0.5))", "a quarter into the stride at half speed."],
    ),
    walk: [
      "A single phase variable drives everything, so legs and arms cannot drift apart.",
      "Each arm is half a stride out of phase with the leg on the same side.",
      "The arm amplitude is limited by min(), so fast walking does not swing the arms wildly.",
    ],
    expect: [
      "When the left hip angle is at its maximum, the left shoulder angle is at its minimum.",
      "At speed 0 the arm swing is zero, so a standing robot keeps its arms still.",
    ],
    fix: [
      [
        "The robot rotates about the vertical axis while walking.",
        "The arm phase is wrong or the amplitude too small. Check that each arm is opposite to the leg on the same side.",
      ],
      [
        "The arms collide with the body.",
        "The amplitude is too large for the shoulder width. Reduce it and add a joint limit check.",
      ],
    ],
    exercise:
      "Add elbow bending that follows the shoulder swing and print the elbow angles over one stride at speed 0.8.",
    checklist: [
      "One gait phase drives all limbs",
      "Arm swing scales with speed",
      "Joint limits are checked",
    ],
  }),
  lesson({
    title: "Balance & stability",
    summary:
      "Compute the support polygon margin: how far the centre of mass projection is from tipping over.",
    goals: [
      "Define the support polygon",
      "Compute the stability margin of the CoM projection",
      "Explain the difference between static and dynamic stability",
    ],
    concept: [
      "The support polygon is the convex shape enclosing all ground contacts: one foot when standing on one leg, both feet and the space between them when standing on two. A body at rest is statically stable when the vertical projection of its centre of mass lies inside the support polygon. The stability margin is the distance from that projection to the nearest polygon edge.",
      "A walking robot is usually not statically stable, because the CoM leaves the support polygon during a step. It stays upright by dynamic balance, which is the subject of the next lessons. The static margin is still valuable: it tells how much a standing robot can be pushed or tilted before it falls, and it is checked before slow movements such as lifting a foot.",
    ],
    steps: [
      "Write the support polygon as corner points of the foot in metres.",
      "Compute the distance from the CoM projection to each edge.",
      "Take the smallest distance as the margin.",
      "Raise the margin limit until a lifted foot is refused.",
    ],
    example: hash(
      ["import math", "for the edge lengths."],
      ["", ""],
      [
        "def margin(point, polygon):",
        "distance from a point to the nearest edge of a convex counter-clockwise polygon (positive inside).",
      ],
      ["    best = float('inf')", "the smallest distance found so far."],
      [
        "    for (x1, y1), (x2, y2) in zip(polygon, polygon[1:] + polygon[:1]):",
        "walk around every edge.",
      ],
      ["        ex, ey = x2 - x1, y2 - y1", "the edge vector."],
      [
        "        d = (ex * (point[1] - y1) - ey * (point[0] - x1)) / math.hypot(ex, ey)",
        "signed distance to the edge line: positive on the inner side.",
      ],
      ["        best = min(best, d)", "keep the smallest."],
      ["    return best", "the stability margin in metres."],
      ["", ""],
      [
        "foot = [(-0.12, -0.07), (0.12, -0.07), (0.12, 0.07), (-0.12, 0.07)]",
        "a 24 x 14 cm foot, counter-clockwise.",
      ],
      [
        "print(round(margin((0.02, 0.01), foot), 3))",
        "the CoM projection is 2 cm forward and 1 cm to the side of the foot centre: prints 0.06.",
      ],
    ),
    walk: [
      "The sign of the distance shows whether the point is inside; a negative result means the robot is tipping.",
      "The smallest distance, not the average, decides stability, so the nearest edge is the limit.",
      "For a foot 14 cm wide the side margin (6 cm here) is smaller than the front margin (10 cm), so sideways pushes are the biggest risk.",
    ],
    expect: [
      "The script prints 0.06 metres.",
      "Moving the CoM projection 6 cm sideways makes the margin 0 and further makes it negative.",
    ],
    fix: [
      [
        "The margin is negative although the robot stands.",
        "The polygon corners are in the wrong order (clockwise) or in the wrong frame. Use counter-clockwise points in the same frame as the CoM.",
      ],
      [
        "The margin ignores a lifted foot.",
        "The support polygon must change with the contacts. Recompute it when a foot leaves the ground.",
      ],
    ],
    exercise:
      "Compute the support polygon of two feet 20 cm apart (the convex hull of both) and compute the margin for the same CoM point.",
    checklist: [
      "The polygon is convex and counter-clockwise",
      "It changes with the ground contacts",
      "The smallest margin is used",
    ],
  }),
  lesson({
    title: "ZMP control",
    summary:
      "Compute the zero moment point from CoM motion and keep it inside the support polygon.",
    goals: [
      "Explain the zero moment point (ZMP)",
      "Compute the ZMP with the cart-table model",
      "Check it against the foot limits",
    ],
    concept: [
      "The zero moment point is the point on the ground where the total horizontal moment of gravity and inertia forces is zero. If the ZMP is inside the support polygon, the foot stays flat on the ground and the robot does not tip. If the ZMP reaches the edge, the foot starts to roll: the robot is about to fall.",
      "With the cart-table model, in which the whole mass is at the centre of mass at constant height zc, the ZMP in one direction is p = x − (zc / g)·ẍ. A body accelerating forward pushes the ZMP backward. The controller plans the CoM so that the ZMP stays inside the foot with a margin, which is the basis of classic bipedal walking.",
    ],
    steps: [
      "Take a CoM height of 0.8 m and a sampled CoM trajectory.",
      "Compute the ZMP for each sample from x and ẍ.",
      "Compare it with the foot limits of ±0.10 m.",
      "Increase the acceleration until the ZMP leaves the foot.",
    ],
    example: hash(
      ["G, ZC = 9.81, 0.8", "gravity and the constant CoM height (metres)."],
      ["", ""],
      [
        "def zmp(x, x_acc):",
        "ZMP position from the CoM position and acceleration (cart-table model).",
      ],
      [
        "    return x - (ZC / G) * x_acc",
        "acceleration forward moves the ZMP backward by (zc/g) times its size.",
      ],
      ["", ""],
      [
        "def inside_foot(p, foot_min=-0.10, foot_max=0.10, margin=0.02):",
        "is the ZMP safely inside the foot with a margin?",
      ],
      ["    return foot_min + margin <= p <= foot_max - margin", "keep 2 cm from the edges."],
      ["", ""],
      ["p = zmp(0.10, 1.5)", "the CoM is 10 cm ahead and accelerating forward at 1.5 m/s^2."],
      [
        "print(round(p, 3), inside_foot(p))",
        "prints -0.022 True: the ZMP is 2.2 cm behind the foot centre, inside the foot.",
      ],
    ),
    walk: [
      "The ZMP is not the CoM: acceleration moves it away, and that is what walking control exploits.",
      "The margin makes the check conservative, since the real ZMP has errors from sensors and modelling.",
      "The formula is for one horizontal direction; the same formula is used for the other direction.",
    ],
    expect: [
      "The script prints -0.022 and True.",
      "An acceleration of 4 m/s² gives a ZMP of about -0.23 m, far outside the foot.",
    ],
    fix: [
      [
        "The measured ZMP does not match the model.",
        "The CoM is not at constant height or the body has significant angular momentum. Use the full model or the force sensors.",
      ],
      [
        "The ZMP jumps at foot contact.",
        "The contact force changes suddenly. Filter the sensor and switch models smoothly during double support.",
      ],
    ],
    exercise:
      "Generate a CoM trajectory that moves 0.2 m in 1 s with a quintic profile and plot the ZMP, then check if it stays inside a 0.20 m long foot.",
    checklist: [
      "The CoM height is realistic",
      "A margin is kept from the foot edge",
      "The ZMP is checked in both directions",
    ],
  }),
  lesson({
    title: "LIPM walking model",
    summary: "Use the linear inverted pendulum to predict CoM motion and find the capture point.",
    goals: [
      "Write the linear inverted pendulum model (LIPM)",
      "Compute the time constant and the capture point",
      "Predict the CoM motion over a step",
    ],
    concept: [
      "The linear inverted pendulum models the robot as a point mass at constant height zc, balancing on a foot at position p: ẍ = ω²(x − p), with ω = √(g / zc). Away from the foot the mass accelerates away exponentially, with a time constant of 1/ω. For a CoM height of 0.8 m, ω ≈ 3.5 1/s and the time constant is about 0.29 s.",
      "The capture point ξ = x + ẋ/ω is the place where the robot must put its foot to come to a complete stop. If the next foot lands at the capture point, the robot stops there; if it lands farther, the robot keeps moving. It is the most useful single number for walking and push recovery, because it combines position and velocity.",
    ],
    steps: [
      "Compute ω for the robot's CoM height.",
      "Compute the capture point for the current CoM state.",
      "Predict the CoM state after a time t with the closed-form solution.",
      "Compare the prediction with a simulation step.",
    ],
    example: hash(
      ["import math", "for the hyperbolic functions."],
      ["", ""],
      ["G, ZC = 9.81, 0.8", "gravity and CoM height."],
      ["W = math.sqrt(G / ZC)", "the natural rate omega, about 3.5 per second."],
      ["", ""],
      ["def capture_point(x, v):", "where the foot must land to stop the robot."],
      ["    return x + v / W", "position plus velocity divided by omega."],
      ["", ""],
      [
        "def predict(x0, v0, p, t):",
        "CoM position and velocity after t seconds with the foot at p.",
      ],
      ["    c, s = math.cosh(W * t), math.sinh(W * t)", "the exponential growth terms."],
      [
        "    x = (x0 - p) * c + (v0 / W) * s + p",
        "position: the offset from the foot grows exponentially.",
      ],
      ["    v = (x0 - p) * W * s + v0 * c", "the matching velocity."],
      ["    return x, v", "the predicted state."],
      ["", ""],
      [
        "print(round(1 / W, 2), round(capture_point(0.05, 0.3), 3))",
        "time constant 0.29 s and a capture point at 0.136 m.",
      ],
    ),
    walk: [
      "The capture point depends only on the state, so it can be computed each control cycle.",
      "cosh and sinh describe the exponential motion: the further from the foot, the faster the fall.",
      "The model ignores leg mass and angular momentum, so it is a starting point that the controller corrects with feedback.",
    ],
    expect: [
      "The script prints 0.29 and 0.136.",
      "With the foot at the capture point, predict() shows the CoM velocity going to zero as the state approaches the foot.",
    ],
    fix: [
      [
        "The predicted motion is too fast.",
        "The CoM height in the model is too small. Use the real CoM height, measured from the ground.",
      ],
      [
        "The robot falls although the capture point is inside the foot.",
        "The capture point must stay inside the reachable foot placement area, and the foot must arrive in time.",
      ],
    ],
    exercise:
      "Plot the capture point over a 1 second simulation of a robot pushed with 0.3 m/s and see how far it moves.",
    checklist: [
      "The CoM height is realistic",
      "The capture point is computed every cycle",
      "Foot placement is checked against the reachable area",
    ],
  }),
  lesson({
    title: "Dynamic gait generation",
    summary:
      "Generate a CoM trajectory from a footstep plan by chaining LIPM steps with the ZMP under each stance foot.",
    goals: [
      "Explain step-to-step CoM motion",
      "Chain LIPM solutions over several steps",
      "Choose footstep timing and check the CoM stays bounded",
    ],
    concept: [
      "In walking, the ZMP jumps from one foot to the next at each step, and between the jumps it stays under the stance foot. With a constant ZMP the LIPM has an exact solution, so the CoM trajectory over a whole walk is a chain of these solutions, each starting from the end state of the previous step. The footstep positions and the step time are the inputs.",
      "The resulting motion is only useful if the CoM stays bounded and does not run away from the feet. A simple rule is to end each step with the CoM slightly beyond the stance foot, so that the capture point sits at the next foot position. The step time trades speed against stability: shorter steps allow faster walking but leave less time to correct errors.",
    ],
    steps: [
      "Write the footstep positions along the walking direction.",
      "Solve the LIPM for each step with the stance foot as the ZMP.",
      "Feed the end state of each step into the next one.",
      "Print the CoM state at the end of each step and check it is bounded.",
    ],
    example: hash(
      ["import math", "for cosh and sinh."],
      ["", ""],
      ["W = math.sqrt(9.81 / 0.8)", "the LIPM natural rate."],
      ["", ""],
      [
        "def step(x0, v0, foot, T):",
        "CoM state at the end of a step of duration T with the ZMP at foot.",
      ],
      ["    c, s = math.cosh(W * T), math.sinh(W * T)", "the exponential terms."],
      [
        "    return (x0 - foot) * c + v0 / W * s + foot, (x0 - foot) * W * s + v0 * c",
        "position and velocity from the LIPM closed form.",
      ],
      ["", ""],
      ["def walk(feet, T=0.5, x0=0.0, v0=0.0):", "chain the steps of a footstep plan."],
      ["    states = []", "the CoM state at the end of each step."],
      ["    for foot in feet:", "one stance foot after the other."],
      ["        x0, v0 = step(x0, v0, foot, T)", "the end of this step is the start of the next."],
      ["        states.append((round(x0, 3), round(v0, 3)))", "record it."],
      ["    return states", "the whole CoM history at the step boundaries."],
      ["", ""],
      [
        "print(walk([0.0, 0.15, 0.30, 0.45, 0.60], x0=-0.075, v0=0.374))",
        "five steps of 15 cm: the start is L/2 behind the first foot with v = (L/2)*omega*coth(omega*T/2), which is about 0.374 m/s, a periodic gait.",
      ],
    ),
    walk: [
      "Each step is one closed-form calculation, so the plan is fast enough to recompute every step.",
      "For a steady walk the CoM must start L/2 behind the stance foot with a matching speed; then every step ends L/2 ahead of its foot with the same speed.",
      "If the footsteps or step time are wrong, the numbers grow quickly, which is the model's warning of an unstable walk.",
    ],
    expect: [
      "The printed states are close to (0.075, 0.374), (0.225, 0.374), (0.375, 0.374), (0.525, 0.374) and (0.675, 0.374).",
      "Choosing a stance foot far behind the CoM makes the velocity grow at every step.",
    ],
    fix: [
      [
        "The CoM runs away from the feet.",
        "The steps are too short for the velocity or too long in time. Adjust the step length and time so that the capture point is at the next foot.",
      ],
      [
        "The real robot cannot follow the plan.",
        "The plan ignores swing-leg dynamics and foot placement limits. Add the limits to the planner and keep the speed low at first.",
      ],
    ],
    exercise:
      "Change the step time to 0.4 s, recompute the periodic initial speed with v = (L/2)·ω·coth(ωT/2) and check that the five-step chain stays periodic.",
    checklist: [
      "Each step starts from the previous end state",
      "The CoM velocity stays bounded",
      "Step time and length respect the robot's limits",
    ],
  }),
  lesson({
    title: "Joint torque control",
    summary:
      "Command joint torques with a PD law and gravity compensation, and limit them for safety.",
    goals: [
      "Write a torque-controlled PD law with a gravity term",
      "Explain why humanoids favour torque or impedance control",
      "Limit torque and rate for safe behaviour",
    ],
    concept: [
      "Many humanoids control their joints by torque, not by position. A torque-controlled joint behaves like a spring and damper: τ = Kp·(q_d − q) − Kd·q̇ + g(q), where g(q) is the gravity torque. The stiffness Kp can be set low, which makes the arm soft, safe to touch and able to absorb impacts, and high when accuracy matters.",
      "Because the command is a torque, safety limits are explicit: a maximum torque, a maximum rate of change (to avoid sudden jerks) and a check that the measured velocity is inside its limit. The gravity term must match the actual mass distribution, or a soft joint sags or drifts.",
    ],
    steps: [
      "Compute the gravity torque for the current pose.",
      "Add the spring and damper terms.",
      "Clamp the torque to the joint's limit.",
      "Limit how fast the torque may change per control cycle.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "def torque(q, qd, q_des, kp, kd, gravity, tau_max, prev, rate):",
        "one control cycle of a torque-controlled joint set.",
      ],
      [
        "    tau = kp * (q_des - q) - kd * qd + gravity(q)",
        "spring toward the target, damper against motion and the gravity torque.",
      ],
      ["    tau = np.clip(tau, -tau_max, tau_max)", "never exceed the actuator's torque limit."],
      ["    step = rate * 0.001", "the largest allowed change in one 1 ms cycle."],
      [
        "    return np.clip(tau, prev - step, prev + step)",
        "limit the torque change per cycle so the command cannot jump.",
      ],
      ["", ""],
      [
        "# gravity(q) can be pinocchio.computeGeneralizedGravity(model, data, q).",
        "use the dynamics library for the gravity torques.",
      ],
      [
        "# prev is the previous cycle's output, stored between calls.",
        "the rate limit needs the last command.",
      ],
    ),
    walk: [
      "Lowering kp makes the joint compliant; the gravity term keeps the arm from sagging.",
      "The rate limit protects gearboxes and people from sudden torque steps, at the cost of a slight delay.",
      "The clip to tau_max is the last line of the software: the drive has its own hardware limit behind it.",
    ],
    expect: [
      "With a correct gravity term the arm holds a pose with only a small position error at low stiffness.",
      "A step in q_des produces a smooth torque ramp limited by the rate value.",
    ],
    fix: [
      [
        "The arm sags at low stiffness.",
        "The gravity model is wrong. Check masses and the payload, and add the tool mass.",
      ],
      [
        "The joint chatters.",
        "kd is too high for the velocity noise. Filter the velocity and lower kd.",
      ],
    ],
    exercise:
      "Simulate a single joint with 0.5 kg·m² inertia, a payload change at t = 1 s and a stiffness of 20 N·m/rad, and plot the position error.",
    checklist: [
      "Gravity compensation matches the payload",
      "Torque and rate are limited",
      "Velocity is filtered before use",
    ],
  }),
  lesson({
    title: "Fall detection",
    summary: "Monitor body tilt from an IMU and cancel motion when the tilt is too large.",
    goals: [
      "Explain why a fall must be detected before it happens",
      "Validate the IMU quaternion and compute roll and pitch",
      "Stop active goals and hold the simulated pose when a tilt limit is exceeded",
    ],
    concept: [
      "A falling humanoid is a hazard to itself and to people around it. The earlier the fall is detected, the more options remain: a step to recover, a controlled crouch, or at least protective posture. The body tilt from the IMU is the simplest signal, and comparing roll and pitch with a limit turns it into a decision.",
      "Sensor data must be validated first. An orientation quaternion should have unit length; if it does not, the message is corrupt and must not be used to decide anything. The detector must be fast and never block in a callback, and its reaction must be simple and safe: cancel the active goals and publish a hold command, so that other software takes over.",
    ],
    steps: [
      "Subscribe to sensor_msgs/Imu and joint_states with sensor QoS.",
      "Validate and convert orientation without blocking a callback.",
      "Cancel active goals and hold the simulated pose after a threshold breach.",
      "Replay recorded IMU data with normal, corrupt and excessive-tilt samples.",
    ],
    example: cpp(
      [
        "void imu_callback(const sensor_msgs::msg::Imu & msg) {",
        "runs for every IMU (orientation sensor) message that arrives.",
      ],
      [
        "  tf2::Quaternion q(msg.orientation.x, msg.orientation.y, msg.orientation.z, msg.orientation.w);",
        "build a quaternion from the four orientation components in the message.",
      ],
      [
        "  if (std::abs(q.length2() - 1.0) > 0.01) return;",
        "a valid orientation quaternion has length 1; skip the sample if its squared length is off by more than 0.01.",
      ],
      [
        "  double roll{}, pitch{}, yaw{};",
        "declare three angles, all starting at zero, to receive the result.",
      ],
      [
        "  tf2::Matrix3x3(q).getRPY(roll, pitch, yaw);",
        "convert the quaternion to roll, pitch and yaw angles in radians.",
      ],
      [
        "  if (std::abs(roll) > max_tilt_ || std::abs(pitch) > max_tilt_) {",
        "if the platform leans further than the allowed tilt in either direction...",
      ],
      [
        "    cancel_active_goal(); publish_training_hold();",
        "...cancel the running motion goal and publish a hold message for the simulated pose.",
      ],
      ["  }", "end of the tilt check."],
      ["}", "end of the callback; nothing here sleeps or blocks."],
    ),
    walk: [
      "The quaternion check discards corrupt samples, so a bad message cannot trigger or hide a fall.",
      "Roll and pitch are compared with a bounded parameter, which can be tuned per robot and per task.",
      "The reaction is deliberately small: stop and hold. This monitor is not a balance controller and must not stabilise hardware.",
    ],
    expect: [
      "Normal samples do nothing, and an invalid quaternion is ignored.",
      "A replayed sample with a tilt above the limit cancels the goal and publishes the hold command once.",
    ],
    fix: [
      [
        "The detector triggers during normal walking.",
        "The limit is too tight for the gait's natural sway. Measure the tilt during normal walking and set the limit with margin.",
      ],
      [
        "The fall is detected too late.",
        "Use the tilt rate as well as the tilt angle, and check the IMU's rate and the callback latency.",
      ],
    ],
    exercise:
      "Replay IMU samples into a simulated posture monitor and verify normal, invalid-quaternion and excessive-tilt cases.",
    checklist: [
      "Quaternion validity is checked",
      "Thresholds are bounded parameters",
      "Callbacks never sleep",
    ],
    source: [
      "ROS 2 QoS settings",
      "https://docs.ros.org/en/lyrical/Concepts/Intermediate/About-Quality-of-Service-Settings.html",
    ],
  }),
  lesson({
    title: "Recovery strategies",
    summary: "Pick an ankle, hip or stepping strategy from the size of the capture point error.",
    goals: [
      "Describe the three classic push-recovery strategies",
      "Choose a strategy from the capture point offset",
      "Add hysteresis so the choice does not flicker",
    ],
    concept: [
      "After a push the robot has three ways to keep its balance. The ankle strategy shifts the centre of pressure inside the foot with the ankle torque, and works for small pushes. The hip strategy rotates the upper body to create a counter-moment, and handles medium pushes. If neither is enough, the robot must take a step to place the foot under the capture point.",
      "The choice can be made from the distance between the capture point and the edge of the support foot. Inside a small threshold the ankle is enough; up to a larger threshold the hip helps; beyond that only a step works. Switching back and forth on small changes of the measurement is harmful, so the strategy is changed only when the value passes a threshold by a margin (hysteresis).",
    ],
    steps: [
      "Compute the capture point and its offset from the foot centre.",
      "Compare the offset with the ankle and hip thresholds.",
      "Add hysteresis so the strategy changes only after a clear crossing.",
      "Test with pushes of increasing size in simulation.",
    ],
    example: hash(
      [
        "ANKLE, HIP = 0.05, 0.09",
        "offset limits in metres: inside 5 cm the ankle is enough, up to 9 cm the hip helps.",
      ],
      ["HYST = 0.01", "hysteresis: a strategy is only changed after a 1 cm crossing."],
      ["", ""],
      [
        "def choose(offset, current):",
        "return 'ankle', 'hip' or 'step' for the capture point offset from the foot centre (metres).",
      ],
      ["    o = abs(offset)", "only the size of the offset matters."],
      ["    order = ['ankle', 'hip', 'step']", "from mildest to strongest."],
      [
        "    limits = {'ankle': ANKLE, 'hip': HIP, 'step': float('inf')}",
        "the largest offset each strategy can handle.",
      ],
      ["    for name in order:", "find the mildest strategy that is enough."],
      [
        "        limit = limits[name] + (HYST if name == current else 0.0)",
        "the current strategy gets a little extra room, which prevents flickering.",
      ],
      ["        if o <= limit:", "does it cover the offset?"],
      ["            return name", "use it."],
      ["    return 'step'", "nothing milder works: take a step."],
      ["", ""],
      [
        "print(choose(0.03, 'ankle'), choose(0.07, 'ankle'), choose(0.12, 'hip'))",
        "prints ankle hip step.",
      ],
    ),
    walk: [
      "The strategies are ordered from least to most disruptive, so the robot only takes a step when it must.",
      "The hysteresis extends the current strategy's range, which removes flicker at the boundaries.",
      "Real controllers also account for the foot's size and the available step area.",
    ],
    expect: [
      "The script prints ankle, hip and step.",
      "A slow increase of the offset changes the strategy once at each threshold, never back and forth.",
    ],
    fix: [
      [
        "The robot steps at small pushes.",
        "The thresholds are too small or the capture point estimate is noisy. Filter the estimate and check the foot geometry.",
      ],
      [
        "The robot falls at medium pushes.",
        "The hip strategy is not effective enough. Increase the step readiness earlier or lower the hip threshold.",
      ],
    ],
    exercise:
      "Simulate pushes of 0.05 to 0.5 m/s in steps and tabulate which strategy is chosen for each.",
    checklist: [
      "Strategies are ordered from mild to strong",
      "Hysteresis prevents flicker",
      "Thresholds come from foot geometry and tests",
    ],
  }),
  lesson({
    title: "Motion blending",
    summary: "Blend smoothly between two motions or poses so transitions do not jerk the robot.",
    goals: [
      "Explain why abrupt switching between motions is dangerous",
      "Blend joint angles with a smooth weight function",
      "Use quaternion interpolation for orientations",
    ],
    concept: [
      "A robot switches between motions all the time: standing to walking, walking to waving, waving to standing. If the new motion starts from a different pose, jumping to it makes a huge acceleration and can knock the robot over. Blending fades from the old motion to the new one over a short time, so every joint moves continuously.",
      "The weight is a smooth function from 0 to 1, such as the smoothstep 3t² − 2t³, which has zero slope at both ends. For joint angles a linear blend with this weight is enough. Orientations stored as quaternions must be blended with spherical linear interpolation (slerp), not by mixing components. The blend time is a compromise between a smooth and a responsive robot.",
    ],
    steps: [
      "Take the last joint vector of the old motion and the first of the new one.",
      "Compute the smoothstep weight over a 0.4 second blend time.",
      "Mix the two joint vectors with that weight.",
      "Check that the joint speeds stay below the limit during the blend.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the joint vectors."],
      ["", ""],
      ["def smoothstep(t):", "a smooth 0-to-1 curve with zero slope at both ends."],
      ["    t = min(1.0, max(0.0, t))", "clamp the input to 0..1."],
      ["    return t * t * (3.0 - 2.0 * t)", "3t^2 - 2t^3."],
      ["", ""],
      [
        "def blend(old, new, elapsed, duration=0.4):",
        "joint angles while fading from one pose to another.",
      ],
      ["    w = smoothstep(elapsed / duration)", "the weight of the new motion."],
      [
        "    return (1.0 - w) * np.asarray(old, float) + w * np.asarray(new, float)",
        "a weighted mix of the two joint vectors.",
      ],
      ["", ""],
      ["old, new = [0.0, 0.5, -1.0], [0.4, 0.0, -0.6]", "three example joint values, old and new."],
      ["for t in (0.0, 0.1, 0.2, 0.4):", "sample the blend at four times."],
      [
        "    print(t, blend(old, new, t).round(3))",
        "starts at the old pose and ends at the new pose, moving slowly at the ends.",
      ],
    ),
    walk: [
      "The weight has zero slope at both ends, so the joints start and stop the blend gently.",
      "The same function works for any number of joints, because the blend is vector arithmetic.",
      "Quaternions need slerp because a linear mix of their four components is not a valid rotation of constant speed.",
    ],
    expect: [
      "At t = 0 the output equals the old pose and at t = 0.4 it equals the new pose.",
      "The change per sample is smallest near the start and the end.",
    ],
    fix: [
      [
        "The robot still jerks at the transition.",
        "The blend is too short or the joints are commanded in position mode with high gains. Lengthen the blend and check the speed limits.",
      ],
      [
        "An arm swings the long way round.",
        "Angles are compared without wrapping. Wrap the difference to the range -pi to pi before blending.",
      ],
    ],
    exercise:
      "Implement slerp for two unit quaternions and use it to blend the orientation of a hand between two poses.",
    checklist: [
      "Blends use a smooth weight",
      "Joint speed limits are checked during the blend",
      "Quaternions are blended with slerp",
    ],
  }),
];
