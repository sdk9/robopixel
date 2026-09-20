import { hash, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 05 · Humanoid Platform — Section C: Locomotion & Manipulation (lessons 21–30)
export const module05c: LessonSpec[] = [
  lesson({
    title: "Walking",
    summary:
      "Generate alternating footsteps for straight walking, and complete the interactive humanoid lab.",
    goals: [
      "Describe a footstep plan with step length and stance width",
      "Generate alternating left and right footsteps",
      "Complete the lab by adding the missing command in a safe walking route",
    ],
    concept: [
      "Walking is planned as a sequence of footsteps: where each foot will land, and when. The planner chooses a step length, a stance width and a step time. The feet alternate left and right, each landing on its own side of the walking line. From the footsteps the balance controller computes the centre of mass motion (see the LIPM lessons), and the swing leg is moved to the next foothold.",
      "A good plan starts and ends in a standing pose: the first step is shorter, and a final step brings the feet together. Step length is limited by the leg length and the robot's balance, and step width by the hip width. Keeping the plan as data makes it easy to check against limits before the robot moves, and to draw on a map.",
    ],
    steps: [
      "Open the Robot Code Lab below and read the mission and the notes under each command.",
      "Type the missing command on the marked empty line, then press Run program and watch the humanoid.",
      "Generate a footstep list for six steps with a 20 cm step length and an 18 cm stance width.",
      "Check that every step is within the limits and that the plan ends with the feet together.",
    ],
    example: hash(
      [
        "def footsteps(n, length=0.20, width=0.18):",
        "landing positions (x, y, foot) for n steps in a straight line, in metres.",
      ],
      ["    steps = []", "the plan."],
      ["    for i in range(n):", "one step at a time."],
      [
        "        side = 1 if i % 2 == 0 else -1",
        "the left foot (+1) and the right foot (-1) alternate.",
      ],
      [
        "        steps.append((round((i + 1) * length, 3), side * width / 2, 'L' if side > 0 else 'R'))",
        "each foot lands one step further on, on its own side of the line.",
      ],
      ["    last_x = steps[-1][0]", "where the final step ended."],
      [
        "    steps.append((last_x, -steps[-1][1], 'L' if steps[-1][2] == 'R' else 'R'))",
        "a closing step puts the other foot beside it, so the robot ends standing.",
      ],
      ["    return steps", "the complete footstep plan."],
      ["", ""],
      ["def within_limits(steps, max_step=0.30):", "reject plans with steps that are too long."],
      ["    xs = [0.0] + [s[0] for s in steps]", "the positions, starting from the origin."],
      [
        "    return all(b - a <= max_step for a, b in zip(xs, xs[1:]))",
        "every step must be shorter than the limit.",
      ],
      ["", ""],
      ["plan = footsteps(4)", "four steps plus the closing step."],
      ["print(plan, within_limits(plan))", "prints five steps ending beside each other and True."],
    ),
    walk: [
      "The side value alternates, so left and right feet always land on their own side of the walking line.",
      "The closing step lands at the same x as the last one, bringing the feet together in a standing pose.",
      "within_limits() is separate from generation, which lets the same check run on plans from any source.",
    ],
    expect: [
      "The plan is [(0.2, 0.09, 'L'), (0.4, -0.09, 'R'), (0.6, 0.09, 'L'), (0.8, -0.09, 'R'), (0.8, 0.09, 'L')].",
      "within_limits() returns True for 20 cm steps and False if the length is 40 cm.",
    ],
    fix: [
      [
        "The robot loses balance at the first step.",
        "The first step is as long as the others. Use a shorter first step to build speed gradually.",
      ],
      [
        "The feet collide during the swing.",
        "The stance width is too small for the foot size. Increase the width or make the swing foot pass wider.",
      ],
    ],
    exercise:
      "Walk to the station, acknowledge the operator, then start the training panel. Build the simulated route and check that each command reaches its named location.",
    checklist: [
      "Feet alternate on their own sides",
      "The plan starts and ends standing",
      "Step lengths are within the limits",
    ],
    lab: "05-humanoid-platform",
  }),
  lesson({
    title: "Turning",
    summary: "Plan a turn on the spot with limited yaw per step and a closing step.",
    goals: [
      "Explain why a large turn is split into several steps",
      "Compute the number of steps and yaw for each foot",
      "End the turn with both feet aligned",
    ],
    concept: [
      "A humanoid turns by rotating its feet, one after the other. Each step can only change the heading by a limited amount, because the hip joints have a yaw range and the swing foot must not hit the stance foot. A common value is 10 to 20 degrees per step, so a 90 degree turn takes about six steps plus a closing step.",
      "In the plan, every step gets the yaw the foot should have on landing, increasing by the maximum step angle until the target heading is reached. The last step must place the second foot at the final heading, so both feet end aligned and the robot stands in a stable pose. The direction (left or right) decides which foot moves first.",
    ],
    steps: [
      "Set the maximum yaw per step (for example 15 degrees).",
      "Compute the number of steps for the requested angle.",
      "Assign a yaw to each step, capped at the target.",
      "Add the closing step and check the last two yaws are equal.",
    ],
    example: hash(
      ["import math", "for rounding up."],
      ["", ""],
      [
        "def turn_steps(angle_deg, max_step=15.0):",
        "(foot, yaw) for each step of a turn in place.",
      ],
      ["    n = math.ceil(abs(angle_deg) / max_step)", "steps needed to reach the angle."],
      ["    sign = 1 if angle_deg >= 0 else -1", "left turn (+) or right turn (-)."],
      [
        "    yaws = [sign * min((k + 1) * max_step, abs(angle_deg)) for k in range(n)]",
        "the yaw grows by max_step per step and stops at the target.",
      ],
      ["    yaws.append(yaws[-1])", "the closing step brings the second foot to the final yaw."],
      [
        "    first = 'R' if sign > 0 else 'L'",
        "start with the outer foot: the right foot for a left turn.",
      ],
      ["    other = 'L' if first == 'R' else 'R'", "the other foot."],
      [
        "    return [(first if k % 2 == 0 else other, y) for k, y in enumerate(yaws)]",
        "alternate the feet and attach the yaws.",
      ],
      ["", ""],
      ["plan = turn_steps(90)", "a 90 degree left turn."],
      ["print(len(plan), plan)", "7 steps: yaws 15, 30, 45, 60, 75, 90 and a closing 90."],
    ),
    walk: [
      "The cap with min() keeps the last real step from overshooting the target angle.",
      "The closing step repeats the final yaw, so the two feet end parallel.",
      "The result grows only with the angle: 180 degrees needs 13 steps, which shows why turning while walking is preferred.",
    ],
    expect: [
      "The script prints 7 steps for a 90 degree turn, ending with two steps at 90 degrees.",
      "A 30 degree turn needs 3 steps.",
    ],
    fix: [
      [
        "The swing foot hits the stance foot.",
        "The yaw per step is too large for the foot geometry. Reduce max_step or widen the stance for turning.",
      ],
      [
        "The robot drifts sideways while turning.",
        "The feet are rotated about their own centres instead of about the body centre. Turn the foot positions about the body axis.",
      ],
    ],
    exercise:
      "Combine a turn and a forward walk: generate footsteps along an arc of 1 m radius and check the yaw increase per step.",
    checklist: [
      "Yaw per step is limited",
      "A closing step aligns the feet",
      "Turns are combined with walking for big angles",
    ],
  }),
  lesson({
    title: "Running",
    summary:
      "Model the flight phase of running and compute step length and flight time from speed and stance time.",
    goals: [
      "Explain the difference between walking and running",
      "Compute the flight time from the vertical take-off speed",
      "Compute the step length and duty factor",
    ],
    concept: [
      "In walking, at least one foot is always on the ground. In running there is a flight phase where both feet are in the air, so the robot is a projectile for a short time: it cannot correct its path until it lands. Flight time depends on the vertical velocity at take-off: t_f = 2·v_z / g.",
      "Each step has a stance phase (the foot on the ground, pushing) and a flight phase. The step length is the forward speed times the sum of both, and the duty factor is the fraction of the step spent on the ground. A duty factor below 0.5 means running. The actuators must deliver a large impulse in a short stance time, and the landing must absorb the impact, so running needs strong, fast joints.",
    ],
    steps: [
      "Choose the vertical take-off speed and the stance time.",
      "Compute the flight time from the take-off speed.",
      "Compute the step length at a given forward speed.",
      "Compute the duty factor and check that it is below 0.5 for running.",
    ],
    example: hash(
      ["G = 9.81", "gravity in m/s^2."],
      ["", ""],
      ["def flight_time(vz):", "seconds in the air for a vertical take-off speed vz (m/s)."],
      ["    return 2.0 * vz / G", "up and down again."],
      ["", ""],
      [
        "def run_step(speed, vz, stance):",
        "step length (m), flight time (s) and duty factor for a running step.",
      ],
      ["    tf = flight_time(vz)", "time in the air."],
      [
        "    length = speed * (stance + tf)",
        "distance covered during one full step (stance plus flight).",
      ],
      ["    duty = stance / (stance + tf)", "share of the step spent on the ground."],
      ["    return round(length, 3), round(tf, 3), round(duty, 2)", "the three numbers."],
      ["", ""],
      [
        "print(run_step(speed=2.0, vz=0.8, stance=0.20))",
        "2 m/s, 0.8 m/s take-off and 0.2 s stance: prints (0.726, 0.163, 0.55).",
      ],
      [
        "print(run_step(speed=2.0, vz=1.5, stance=0.15))",
        "a harder push: prints (0.912, 0.306, 0.33), clearly a running gait.",
      ],
    ),
    walk: [
      "The first example has a duty factor of 0.55, which is still a walking-like gait with a very short flight.",
      "The second has 0.33, so the robot spends most of the step in the air and lands on one foot at a time.",
      "Flight time grows linearly with the take-off speed, but the height reached grows with its square.",
    ],
    expect: [
      "The script prints (0.726, 0.163, 0.55) and (0.912, 0.306, 0.33).",
      "You can explain why a shorter stance time needs a larger joint torque for the same take-off speed.",
    ],
    fix: [
      [
        "The robot falls after landing.",
        "Landing speed or foot placement is wrong. Land with the foot under the capture point and bend the knee to absorb the impact.",
      ],
      [
        "Joints overheat during running.",
        "Peak torques and speeds exceed the actuators' limits. Check the required impulse against the motor's torque-speed curve.",
      ],
    ],
    exercise:
      "Find the take-off speed that gives a duty factor of 0.4 at 0.2 s stance time and check the flight time.",
    checklist: [
      "Flight time is computed from the take-off speed",
      "Duty factor is below 0.5 for running",
      "Actuator limits are checked for the impact",
    ],
  }),
  lesson({
    title: "Stair climbing",
    summary:
      "Plan a swing-foot trajectory that clears the step edge and check stair dimensions against the leg's reach.",
    goals: [
      "Describe the phases of climbing a step",
      "Generate a swing height profile that lifts before crossing the edge",
      "Check the clearance above the stair edge",
    ],
    concept: [
      "Climbing stairs needs the swing foot to rise by the step height before it moves over the edge of the next step, and to clear the edge with a margin. A profile that rises smoothly in the first part of the swing and then adds a small arch, z(t) = rise·smoothstep(t / t_r) + clearance·sin(πt), does this. If the rise is finished only late in the swing, the toe hits the edge.",
      "The stairs must also be inside the robot's capabilities: the step height is limited by the leg length and the knee range (about a third of the leg length is a practical maximum), and the tread depth must be long enough for the foot. Perception has to find the stair edges precisely, because a few centimetres of error decide whether the foot lands on the tread or on the edge.",
    ],
    steps: [
      "Measure the stair height and tread depth.",
      "Generate the swing-foot height profile with the rise completed in the first 40 % of the swing.",
      "Compute the clearance above the edge at the moment the foot crosses it.",
      "Check the step height against the leg length.",
    ],
    example: hash(
      ["import math", "for the sine."],
      ["", ""],
      ["def smoothstep(t):", "a smooth 0-to-1 curve."],
      ["    t = min(1.0, max(0.0, t))", "clamp to 0..1."],
      ["    return t * t * (3 - 2 * t)", "3t^2 - 2t^3."],
      ["", ""],
      [
        "def foot_height(t, rise, clearance=0.05, t_rise=0.4):",
        "foot height at swing fraction t (0..1).",
      ],
      [
        "    return rise * smoothstep(t / t_rise) + clearance * math.sin(math.pi * t)",
        "the lift is finished after 40 % of the swing; the arch adds the clearance.",
      ],
      ["", ""],
      [
        "def edge_clearance(rise, edge_at, **kw):",
        "how far the foot is above the stair edge when it crosses it.",
      ],
      ["    return foot_height(edge_at, rise, **kw) - rise", "foot height minus the step height."],
      ["", ""],
      [
        "print(round(edge_clearance(0.18, 0.4), 3), round(edge_clearance(0.18, 0.3), 3))",
        "an edge crossed at 40 % of the swing has 0.048 m of clearance; at 30 % only 0.012 m.",
      ],
    ),
    walk: [
      "The rise finishes at 40 % of the swing, so the foot is already above the stair when it crosses at that moment.",
      "Crossing the edge earlier leaves only 1.2 cm of clearance, so the foot placement must be planned with the edge position.",
      "Stair height and edge position both come from perception, so their errors reduce the real clearance.",
    ],
    expect: [
      "The script prints 0.048 and 0.012 (metres).",
      "A step height of 0.18 m on a leg of 0.9 m is one fifth, well below the one third guideline.",
    ],
    fix: [
      [
        "The toe catches the stair edge.",
        "The foot rises too late or the edge position is wrong. Lift earlier and add more clearance.",
      ],
      [
        "The robot cannot reach the next step.",
        "The step is too high or too deep for the leg. Check the step against the leg length and the knee range.",
      ],
    ],
    exercise:
      "Plan a full staircase of five steps with a 0.28 m tread and a 0.18 m rise, and print the target foot positions for each step.",
    checklist: [
      "The foot rises before crossing the edge",
      "Clearance is computed and checked",
      "Step height is within the leg's reach",
    ],
  }),
  lesson({
    title: "Arm manipulation",
    summary: "Move a hand to a target with resolved-rate control using a damped Jacobian.",
    goals: [
      "Explain resolved-rate control of an arm",
      "Compute the joint step with a damped pseudo-inverse",
      "Limit the step size and check joint limits",
    ],
    concept: [
      "To move a hand to a target, a humanoid arm uses its Jacobian: the tool moves by J·dq when the joints move by dq, so the joint step for a desired hand motion is dq = J⁺·e. The damped version, dq = Jᵀ (J Jᵀ + λ² I)⁻¹ e, stays well behaved near singularities. Repeating it every control cycle moves the hand toward the target.",
      "Limits must be added: a maximum step per cycle so the arm cannot jump, joint limits so no joint leaves its range, and a check that the hand error is decreasing. In a humanoid the base can move, so the reference for the target must be the world or the torso, chosen according to the task.",
    ],
    steps: [
      "Compute the frame placement and the Jacobian of the hand.",
      "Compute the position error to the target.",
      "Take a damped step, limited in size.",
      "Clip the joints to their limits and stop when the error is small.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the linear algebra."],
      ["import pinocchio as pin", "for the kinematics and the Jacobian."],
      ["", ""],
      [
        "def step(model, data, q, frame_id, target, lam=0.05, max_dq=0.05):",
        "one control cycle of a position-only hand controller.",
      ],
      [
        "    pin.forwardKinematics(model, data, q)",
        "update the joint poses for the current joints.",
      ],
      ["    pin.updateFramePlacements(model, data)", "update the frame poses."],
      [
        "    err = target - data.oMf[frame_id].translation",
        "how far the hand is from the target (metres).",
      ],
      [
        "    J = pin.computeFrameJacobian(model, data, q, frame_id, pin.ReferenceFrame.LOCAL_WORLD_ALIGNED)[:3, :]",
        "the 3 x N position part of the Jacobian in world axes.",
      ],
      [
        "    dq = J.T @ np.linalg.solve(J @ J.T + lam**2 * np.eye(3), err)",
        "damped least-squares step: stable near singularities.",
      ],
      ["    n = np.linalg.norm(dq)", "how large the step is."],
      ["    if n > max_dq:", "too big for one cycle?"],
      ["        dq *= max_dq / n", "scale it down to the limit."],
      [
        "    return np.clip(q + dq, model.lowerPositionLimit, model.upperPositionLimit), np.linalg.norm(err)",
        "apply the step inside the joint limits and report the remaining error.",
      ],
    ),
    walk: [
      "The damping term lam trades accuracy for stability; it is what prevents joint speeds from blowing up near singularities.",
      "Limiting the step size keeps the arm smooth even if the target changes suddenly.",
      "The returned error tells the caller when the target is reached and lets it detect a stuck arm.",
    ],
    expect: [
      "Repeated calls move the hand toward the target and the error decreases each time.",
      "A target beyond the arm's reach leaves a constant non-zero error, which the caller must handle.",
    ],
    fix: [
      [
        "The hand oscillates around the target.",
        "The step is too large or lam too small. Reduce max_dq or increase the damping.",
      ],
      [
        "The arm moves in an unexpected direction.",
        "The Jacobian frame is wrong (local versus world). Use the world-aligned reference or transform the error.",
      ],
    ],
    exercise:
      "Add a secondary task that pulls the elbow toward its mid-range using the null space of the Jacobian, and verify the hand path is unchanged.",
    checklist: [
      "The step is damped and limited",
      "Joint limits are enforced",
      "An unreachable target is detected",
    ],
  }),
  lesson({
    title: "Dual-arm coordination",
    summary: "Move both hands relative to an object frame so they hold and carry a box together.",
    goals: [
      "Explain object-centred control of two hands",
      "Compute the hand poses from the object pose and fixed offsets",
      "Check that the distance between the hands stays constant",
    ],
    concept: [
      "To carry a box with two hands, the hands must move together. Controlling each hand on its own would make the distance between them drift and squeeze or drop the box. The solution is object-centred control: the object has a pose, each hand has a fixed offset from the object, and both hand targets are computed from the object pose: T_hand = T_obj · T_offset.",
      "Only the object pose is planned; the hand poses follow, and the distance between the hands is constant by construction. A small internal force is needed to hold the object: the hands are commanded slightly inside the object's surface (a squeeze offset), and the force sensors check that it stays within a safe range. If one arm cannot reach its target, both must stop, not just one.",
    ],
    steps: [
      "Define the box pose and the two hand offsets in the box frame.",
      "Compute both hand targets from the box pose.",
      "Check that the distance between the two targets equals the box width minus the squeeze.",
      "Stop both arms if either target is not reachable.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the transforms."],
      ["", ""],
      [
        "WIDTH, SQUEEZE = 0.30, 0.005",
        "box width and how far inside the surface the hands press (metres).",
      ],
      ["", ""],
      ["def offset(side):", "hand pose in the box frame: on the left (+1) or right (-1) face."],
      ["    T = np.eye(4)", "no rotation in this simple example."],
      [
        "    T[1, 3] = side * (WIDTH / 2 - SQUEEZE)",
        "each hand touches its face, pressing 5 mm inward.",
      ],
      ["    return T", "the fixed offset."],
      ["", ""],
      ["def hand_targets(T_box):", "world poses of both hands for a given box pose."],
      [
        "    return T_box @ offset(+1), T_box @ offset(-1)",
        "left and right hand targets from the same box pose.",
      ],
      ["", ""],
      ["def carry(T_box, reachable):", "hand targets or None when either hand cannot reach."],
      ["    left, right = hand_targets(T_box)", "compute both targets."],
      [
        "    return (left, right) if reachable(left) and reachable(right) else None",
        "both or neither: never move only one arm.",
      ],
      ["", ""],
      ["T = np.eye(4); T[:3, 3] = [0.5, 0.0, 1.0]", "a box 0.5 m ahead and 1.0 m high."],
      ["l, r = hand_targets(T)", "the two hand targets."],
      [
        "print(round(float(np.linalg.norm(l[:3, 3] - r[:3, 3])), 3))",
        "prints 0.29: the width minus twice the squeeze.",
      ],
    ),
    walk: [
      "Both hand poses come from one matrix product, so they cannot drift apart when the box moves.",
      "The squeeze offset makes the hands grip slightly; its size should follow from the force sensors.",
      "The reachability check covers both hands together, which avoids a one-handed drop.",
    ],
    expect: [
      "The distance between the hand targets prints as 0.29 m for a 0.30 m box with a 5 mm squeeze.",
      "Moving or rotating the box moves both hands rigidly with it.",
    ],
    fix: [
      [
        "The box slips or is crushed.",
        "The squeeze offset is wrong. Set it from the measured force and use compliance in the hands.",
      ],
      [
        "One arm lags behind the other.",
        "Their controllers have different gains or delays. Use the same controller settings and check the timing.",
      ],
    ],
    exercise:
      "Rotate the box by 20 degrees about z and verify that the two hand targets stay 0.29 m apart and remain symmetric about the box centre.",
    checklist: [
      "Both hands are computed from one object pose",
      "Both arms stop together",
      "The grip force is monitored",
    ],
  }),
  lesson({
    title: "Tool use",
    summary:
      "Treat a held tool as an extension of the hand and compute the hand pose that puts the tool tip on a target.",
    goals: [
      "Explain the tool frame relative to the hand",
      "Compute the hand pose for a desired tool tip pose",
      "Update the model when a tool is picked up or dropped",
    ],
    concept: [
      "When a humanoid holds a tool, for example a screwdriver, the tool tip is what must reach the work. The hand-to-tool transform T_hand_tool describes where the tip is relative to the hand. To place the tip at a target pose T_target the hand needs the pose T_hand = T_target · T_tool_hand, where T_tool_hand is the inverse of T_hand_tool.",
      "The transform has to be known accurately, from calibration or from the grasp. A grasp is never perfect, so after picking up a tool the transform should be re-measured by touching a reference. The tool's mass and centre of mass also change the arm's dynamics, so the model must be updated when the tool is picked up or put down, and reset when it is dropped.",
    ],
    steps: [
      "Define the hand-to-tool transform for a screwdriver.",
      "Compute the hand pose for a target tip pose.",
      "Check the round trip: the hand pose times the tool transform equals the target.",
      "Update the payload mass in the model on pick-up.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the transforms."],
      ["", ""],
      ["T_hand_tool = np.eye(4)", "the tool tip relative to the hand."],
      ["T_hand_tool[:3, 3] = [0.0, 0.0, 0.18]", "the tip is 18 cm out along the hand's z axis."],
      ["", ""],
      ["def hand_for_tip(T_target):", "the hand pose that puts the tool tip at T_target."],
      ["    return T_target @ np.linalg.inv(T_hand_tool)", "undo the tool offset."],
      ["", ""],
      ["T_target = np.eye(4)", "the tip target pose."],
      [
        "T_target[:3, 3] = [0.6, 0.1, 0.9]",
        "at 0.6 m forward, 0.1 m left and 0.9 m up, in the world.",
      ],
      ["T_hand = hand_for_tip(T_target)", "solve for the hand."],
      [
        "print((T_hand @ T_hand_tool)[:3, 3].round(3), T_hand[:3, 3].round(3))",
        "the tip lands on the target [0.6 0.1 0.9]; the hand is 18 cm back at [0.6 0.1 0.72].",
      ],
    ),
    walk: [
      "One matrix inverse turns 'where should the tip go' into 'where should the hand go'.",
      "The round trip check proves that the transform and its inverse are consistent.",
      "For a hand pointing down, the tool offset moves the hand above the target, exactly as expected.",
    ],
    expect: [
      "The tip position prints [0.6 0.1 0.9] and the hand position [0.6 0.1 0.72] for a tool along +z with an identity orientation.",
      "Changing the tool length to 0.25 m moves the hand 7 cm further back.",
    ],
    fix: [
      [
        "The tip misses the target by a few millimetres.",
        "The tool transform is wrong or the tool slipped in the hand. Re-measure by touching a reference point.",
      ],
      [
        "The arm sags with a heavy tool.",
        "The payload is not in the dynamics model. Add the tool mass and centre of mass on pick-up.",
      ],
    ],
    exercise:
      "Calibrate a tool transform by touching one fixed point from four hand orientations, with the method from the TCP calibration lesson.",
    checklist: [
      "The tool transform is calibrated",
      "Payload is updated on pick-up and drop",
      "The round trip is tested",
    ],
  }),
  lesson({
    title: "Grasp planning",
    summary:
      "Score antipodal grasps with the friction cone condition and choose the best contact pair.",
    goals: [
      "Explain the friction cone and antipodal grasps",
      "Check a contact pair against the cone",
      "Rank candidate grasps by quality",
    ],
    concept: [
      "A two-finger grasp holds an object by friction. At each contact the finger can push along the surface normal and resist sliding up to μ times the normal force. This means the contact force must lie inside the friction cone, whose half angle is atan(μ). A pair of contacts is antipodal when the line joining them lies inside both cones: the two forces can then balance each other.",
      "Given a set of surface points with normals from perception, candidate pairs are checked against the cone, and the surviving pairs are ranked, for example by how close the line is to the normals and by how close the grasp is to the object's centre of mass. Grasps near the centre are better because they produce less torque when the object is lifted.",
    ],
    steps: [
      "Take two surface points with their outward normals.",
      "Compute the angle between the line joining them and each inward normal.",
      "Accept the pair if both angles are below atan(μ).",
      "Rank accepted pairs by their worst angle and by the distance to the centre of mass.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      ["MU = 0.5", "friction coefficient between the finger pads and the object."],
      ["CONE = np.arctan(MU)", "half angle of the friction cone: 26.6 degrees."],
      ["", ""],
      ["def angle(a, b):", "angle in radians between two vectors."],
      ["    a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)", "make them unit vectors."],
      [
        "    return float(np.arccos(np.clip(a @ b, -1.0, 1.0)))",
        "the arccosine of the dot product, clipped for rounding.",
      ],
      ["", ""],
      [
        "def antipodal(p1, n1, p2, n2):",
        "worst cone angle of a contact pair, or None if not a valid grasp.",
      ],
      [
        "    d = np.asarray(p2, float) - np.asarray(p1, float)",
        "the line from contact 1 to contact 2.",
      ],
      [
        "    a1 = angle(d, -np.asarray(n1, float))",
        "how far the line is from the inward normal at contact 1.",
      ],
      [
        "    a2 = angle(-d, -np.asarray(n2, float))",
        "the same at contact 2, looking back along the line.",
      ],
      ["    worst = max(a1, a2)", "the pair is only as good as its worse contact."],
      ["    return worst if worst <= CONE else None", "inside the friction cone at both contacts."],
      ["", ""],
      [
        "# parallel faces of a box: normals opposite, the line is along them",
        "a perfect antipodal pair.",
      ],
      [
        "print(antipodal((0, 0, 0), (-1, 0, 0), (0.1, 0, 0), (1, 0, 0)))",
        "prints 0.0: the best possible grasp.",
      ],
      [
        "print(antipodal((0, 0, 0), (-1, 0, 0), (0.1, 0.1, 0), (1, 0, 0)))",
        "a 45 degree line: prints None because it is outside the cone.",
      ],
    ),
    walk: [
      "Using the inward normals (the negatives of the outward ones) means a good grasp has a line pointing along them.",
      "The worst angle is returned so pairs can be sorted, and None makes rejected pairs explicit.",
      "A higher friction coefficient widens the cone and accepts more grasps, but only if the pads really have that friction.",
    ],
    expect: [
      "The first pair prints 0.0 and the second prints None.",
      "With μ = 1.2 the cone half angle is about 50 degrees, so the 45 degree pair is accepted.",
    ],
    fix: [
      [
        "Grasps that pass the test still slip.",
        "The friction coefficient is too optimistic or the object is wet or oily. Use a lower μ and add a safety margin.",
      ],
      [
        "Too few candidates survive.",
        "The normals from perception are noisy. Smooth the surface and estimate normals from more points.",
      ],
    ],
    exercise:
      "Generate 500 random point pairs on a cylinder, count how many are antipodal and rank the best ten by distance to the axis.",
    checklist: [
      "The friction coefficient is measured",
      "Both contacts are checked",
      "Candidates are ranked, not only accepted",
    ],
  }),
  lesson({
    title: "Whole-body planning",
    summary: "Combine balance and reaching with task priorities using null-space projection.",
    goals: [
      "Explain task priorities in whole-body control",
      "Compute a velocity that satisfies the first task exactly and the second as well as possible",
      "Verify that the second task does not disturb the first",
    ],
    concept: [
      "A humanoid has many joints, and several jobs at once: keep the centre of mass over the feet, keep the feet planted, reach with a hand and look at a target. Some jobs are more important than others; balance must never be sacrificed for reaching. Task priorities express this: the first task is solved exactly, and the second only in the space of motions that leaves the first unchanged, the null space of the first.",
      "For two tasks with Jacobians J1 and J2 and errors e1 and e2, dq = J1⁺·e1 + N1·J2⁺·e2, where N1 = I − J1⁺J1 is the null-space projector of task 1. Whatever the second task asks, it cannot change task 1. If the second task is not reachable within the null space, it is only partly achieved, which is the right behaviour for a lower priority.",
    ],
    steps: [
      "Compute the Jacobian and error of the balance task (priority 1).",
      "Compute the Jacobian and error of the reaching task (priority 2).",
      "Combine them with the null-space projector.",
      "Check that the balance task's velocity is unchanged by the second task.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the linear algebra."],
      ["", ""],
      [
        "def prioritised(J1, e1, J2, e2, lam=1e-3):",
        "joint velocity for two tasks; task 1 has priority.",
      ],
      ["    def pinv(J):", "a damped pseudo-inverse."],
      [
        "        return J.T @ np.linalg.inv(J @ J.T + lam * np.eye(J.shape[0]))",
        "stable even near singular configurations.",
      ],
      ["    P1 = pinv(J1)", "pseudo-inverse of the first task."],
      [
        "    N1 = np.eye(J1.shape[1]) - P1 @ J1",
        "null-space projector: motions that leave task 1 unchanged.",
      ],
      ["    dq1 = P1 @ e1", "the motion that corrects the first task."],
      [
        "    dq2 = np.linalg.pinv(J2 @ N1) @ (e2 - J2 @ dq1)",
        "the second task's correction, restricted to the null space of the first.",
      ],
      ["    return dq1 + N1 @ dq2", "both together: the second cannot disturb the first."],
      ["", ""],
      ["J1 = np.array([[1.0, 0.5, 0.0, 0.0]])", "a balance task: one equation on four joints."],
      ["J2 = np.array([[0.0, 0.3, 1.0, 0.5]])", "a reaching task: another equation."],
      ["dq = prioritised(J1, np.array([0.02]), J2, np.array([0.05]))", "solve with balance first."],
      [
        "print((J1 @ dq).round(3), (J2 @ dq).round(3))",
        "task 1 is met (about 0.02) and task 2 is met as well because the null space is large enough.",
      ],
    ),
    walk: [
      "The null-space projector removes every part of the second motion that would move the first task.",
      "With four joints and two tasks there is enough freedom to reach both, which is typical for humanoids.",
      "When freedom runs out, the second error stays non-zero and the first stays satisfied.",
    ],
    expect: [
      "The printed task velocities are about 0.02 and 0.05, matching the requested errors.",
      "Making the two Jacobians parallel leaves the second task unsatisfied but the first still exact.",
    ],
    fix: [
      [
        "The balance task is disturbed by reaching.",
        "The projector is wrong or the tasks were solved together. Recompute N1 and verify J1 @ (N1 @ x) is zero.",
      ],
      [
        "Joint velocities are huge.",
        "The tasks conflict near a singularity. Increase the damping and limit the velocity.",
      ],
    ],
    exercise:
      "Add a third, lowest priority task that keeps the head looking at a target and verify that it never disturbs the first two.",
    checklist: [
      "Balance has the highest priority",
      "Lower tasks work in the null space",
      "Damping and velocity limits are set",
    ],
  }),
  lesson({
    title: "Safety & compliance",
    summary:
      "Limit contact forces with a guard that reduces stiffness or stops the arm when a limit is exceeded.",
    goals: [
      "Explain why compliance and force limits are needed near people",
      "Write a contact guard with warning and stop levels",
      "Reset the guard only after the contact is gone",
    ],
    concept: [
      "A humanoid works in spaces shared with people, so contact must be gentle. Compliance means the arm gives way: with low stiffness or an impedance controller, a push moves the arm instead of pushing back hard. A soft arm is safer, but cannot hold a position against a load, so the stiffness is a trade-off that depends on the task.",
      "A contact guard watches the measured force or torque. Below a warning level everything is normal; above it the robot lowers its stiffness and speed; above the stop level it stops and holds. The guard must latch: after a stop it does not restart on its own when the force drops, because the person may still be trapped, and a human must acknowledge it. Force limits for contact with people come from standards and risk assessment, and the sensors and reaction are part of the certified safety design.",
    ],
    steps: [
      "Define warning and stop force levels for the arm.",
      "Write the guard as a small state machine: normal, reduced and stopped.",
      "Make the stopped state latch until an operator resets it.",
      "Test with a simulated force ramp.",
    ],
    example: hash(
      ["class ContactGuard:", "monitors the contact force on an arm."],
      [
        "    def __init__(self, warn=20.0, stop=40.0):",
        "warning and stop levels in newtons (example values, set from the risk assessment).",
      ],
      [
        "        self.warn, self.stop, self.state = warn, stop, 'normal'",
        "start in the normal state.",
      ],
      ["", ""],
      [
        "    def update(self, force):",
        "call every control cycle with the measured force magnitude.",
      ],
      ["        if self.state == 'stopped':", "the guard latches after a stop."],
      ["            return self.state", "stay stopped until reset() is called."],
      ["        if force >= self.stop:", "force above the stop level."],
      ["            self.state = 'stopped'", "stop and hold."],
      ["        elif force >= self.warn:", "force above the warning level."],
      ["            self.state = 'reduced'", "lower the stiffness and speed."],
      ["        else:", "force below the warning level."],
      ["            self.state = 'normal'", "back to full performance."],
      ["        return self.state", "the state the controller must obey."],
      ["", ""],
      [
        "    def reset(self, operator_ack):",
        "leave the stopped state, only on an operator's acknowledgement.",
      ],
      [
        "        if operator_ack and self.state == 'stopped':",
        "an explicit human action is required.",
      ],
      ["            self.state = 'normal'", "resume."],
    ),
    walk: [
      "Three states give a graceful response: reduced performance first, a full stop only if the force keeps rising.",
      "The latch makes the stop sticky, so a falling force reading cannot restart the arm by itself.",
      "The reset requires an operator acknowledgement, which puts a person in the loop after every stop.",
    ],
    expect: [
      "A force ramp from 0 to 50 N gives normal, reduced and then stopped, and it stays stopped when the force drops.",
      "reset(True) returns the guard to normal; reset(False) does nothing.",
    ],
    fix: [
      [
        "The arm stops too often.",
        "The warning and stop levels are too low for normal tasks. Measure typical contact forces and adjust the thresholds with the safety expert.",
      ],
      [
        "The guard does not react in time.",
        "Filtering adds delay. Use a lightly filtered force signal and check the total reaction time.",
      ],
    ],
    exercise:
      "Add a rate-of-change check that switches to reduced when the force rises faster than 100 N/s, even below the warning level.",
    checklist: [
      "Warning and stop levels come from a risk assessment",
      "The stopped state latches",
      "Reset needs an operator acknowledgement",
    ],
  }),
];
