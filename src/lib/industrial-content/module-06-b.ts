import { hash, cpp, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 06 · Collaborative Robot (Cobot) — lessons 16–30 (Control & Applications, then ROS 2)
export const module06b: LessonSpec[] = [
  lesson({
    title: "Screwdriving",
    summary:
      "Monitor torque and angle during a screw run-down and detect cross-threading, missing screws and correct tightening.",
    goals: [
      "Describe the phases of a screw fastening",
      "Detect a cross-threaded or stripped screw from the torque signature",
      "Accept a screw only if angle and final torque are inside their windows",
    ],
    concept: [
      "A screw fastening has phases: the bit finds the screw head, the screw runs down with low torque (the thread engages), the head seats and the torque climbs steeply, and the tool stops at the target torque. Each phase leaves a signature in the torque and angle curve, so a screwdriving cobot can judge every screw, not only the last value.",
      "A cross-threaded screw shows a high torque very early, before enough turns have been made. A stripped thread shows a torque that rises and then falls. A missing screw shows a run-down with almost no torque and far too many turns. A good fastening reaches the target torque within a window of angles. All rules must be based on measured curves of good and bad screws.",
    ],
    steps: [
      "Record torque against angle for 20 good screws.",
      "Find the normal run-down torque, the number of turns and the final angle.",
      "Write the rules for early torque, final torque and the angle window.",
      "Test with simulated cross-threaded, missing and good screws.",
    ],
    example: hash(
      [
        "def judge(samples, target=1.2, tol=0.1, turns_ok=(2.0, 5.0)):",
        "samples are (angle in turns, torque in N*m); returns 'ok' or the reason for rejection.",
      ],
      ["    if not samples:", "no data at all."],
      ["        return 'no data'", "reject."],
      ["    early = [t for a, t in samples if a < 1.0]", "torque during the first turn."],
      ["    if early and max(early) > 0.4 * target:", "high torque right at the start."],
      ["        return 'cross-threaded'", "the screw is jammed before it should be tight."],
      ["    turns, final = samples[-1]", "where the run ended, and the last torque."],
      ["    if final < target * (1 - tol):", "the tool did not reach the target torque."],
      ["        return 'missing or stripped'", "reject."],
      [
        "    if not turns_ok[0] <= turns <= turns_ok[1]:",
        "the number of turns is outside the expected window.",
      ],
      [
        "        return 'wrong angle'",
        "too few turns can mean a short screw; too many, a stripped thread.",
      ],
      ["    return 'ok'", "the fastening is good."],
      ["", ""],
      [
        "good = [(0.5, 0.05), (1.5, 0.08), (2.5, 0.12), (3.0, 0.5), (3.2, 1.25)]",
        "low torque during the run-down and a steep rise at the end.",
      ],
      ["print(judge(good), judge([(0.5, 0.7), (0.8, 1.2)]))", "prints ok and cross-threaded."],
    ),
    walk: [
      "The rules are ordered so the most specific fault (cross-threading) is reported first.",
      "Angle and torque are both used, because a correct torque with the wrong angle still means a wrong fastening.",
      "The numbers here are examples; each fastener type needs its own thresholds from measured data.",
    ],
    expect: [
      "A normal curve returns 'ok' and a curve with high torque in the first turn returns 'cross-threaded'.",
      "A run-down that never reaches 1.08 N·m returns 'missing or stripped'.",
    ],
    fix: [
      [
        "Good screws are rejected.",
        "The windows are tighter than the natural variation. Collect more good screws and widen the limits.",
      ],
      [
        "Cross-threaded screws are missed.",
        "The early-torque limit is too high. Check the curves of bad screws and set the limit from them.",
      ],
    ],
    exercise:
      "Simulate 200 screws with 5 % cross-threaded and 3 % missing and count how many the rules classify correctly.",
    checklist: [
      "Every screw is judged from its curve",
      "Limits come from measured curves",
      "Failures are recorded with their reason",
    ],
  }),
  lesson({
    title: "Inspection",
    summary:
      "Plan camera viewpoints on a ring around a part so a cobot can inspect it from several sides.",
    goals: [
      "Explain viewpoint planning for inspection",
      "Generate viewpoints on a ring that look at the part's centre",
      "Order them to minimise travel",
    ],
    concept: [
      "A cobot with a camera on its wrist can inspect a part from many directions, which a fixed camera cannot do. Each view is a camera pose: a position and an orientation that points at the part. A simple and robust way to choose views is to place them on a ring (or several rings) at a fixed distance and elevation around the part's centre.",
      "The orientation of every viewpoint is computed by 'look at': the camera's z axis points from the position to the target. The order of the views matters for cycle time: going around the ring in one direction avoids long moves. Lighting must be part of the plan too, since the same surface looks different from different angles, so each viewpoint may also set the light.",
    ],
    steps: [
      "Choose the ring radius, elevation and number of views.",
      "Compute the position of each viewpoint on the ring.",
      "Compute the look-at direction toward the part centre.",
      "Visit the viewpoints in ring order and capture an image at each.",
    ],
    example: hash(
      ["import math", "for the trigonometry."],
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "def viewpoints(centre, radius, elevation_deg, n):",
        "camera positions and viewing directions on a ring around a centre (metres).",
      ],
      ["    el = math.radians(elevation_deg)", "elevation angle above the horizontal."],
      ["    out = []", "the list of views."],
      ["    for k in range(n):", "evenly spaced around the ring."],
      ["        az = 2 * math.pi * k / n", "the azimuth angle of this view."],
      [
        "        offset = radius * np.array([math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)])",
        "the camera position relative to the part.",
      ],
      ["        pos = np.asarray(centre, float) + offset", "the position in the world."],
      [
        "        look = -offset / np.linalg.norm(offset)",
        "the unit vector from the camera toward the part centre: the camera's z axis.",
      ],
      ["        out.append((pos.round(3), look.round(3)))", "record the pose."],
      ["    return out", "the viewpoints in ring order."],
      ["", ""],
      [
        "views = viewpoints((0.5, 0.0, 0.2), 0.3, 45, 8)",
        "eight views at 45 degrees elevation and 0.3 m distance.",
      ],
      [
        "print(views[0])",
        "the first view: camera at (0.712, 0, 0.412), looking down and back toward the part.",
      ],
    ),
    walk: [
      "All views share the same distance from the part, which keeps the image scale and focus constant.",
      "The look-at vector is just the negated offset, normalised, so it always points at the centre.",
      "The list is already in ring order, so the arm moves smoothly from one view to the next.",
    ],
    expect: [
      "The first camera position is (0.712, 0.0, 0.412), 0.212 m from the part centre horizontally and 0.212 m above it.",
      "The eight positions form a ring, and all viewing directions have a downward z component.",
    ],
    fix: [
      [
        "The part is cut off in some views.",
        "The radius is too small for the part's size or the field of view. Increase the distance or use a wider lens.",
      ],
      [
        "Some views are unreachable.",
        "The ring goes behind the cobot's reach. Limit the azimuth range or move the part.",
      ],
    ],
    exercise:
      "Add a second ring at 20 degrees elevation and check that all views are reachable for your cobot's workspace.",
    checklist: [
      "Views keep a constant distance",
      "The camera always looks at the part",
      "Reachability is checked for every view",
    ],
  }),
  lesson({
    title: "Vision-guided tasks",
    summary:
      "Move the hand toward a target in the image with a simple visual servoing law and a speed limit.",
    goals: [
      "Explain visual servoing",
      "Convert a pixel error into a velocity command",
      "Stop when the error is small and limit the speed",
    ],
    concept: [
      "Visual servoing uses the image directly to drive the robot. A camera on the hand sees the target at pixel (u, v). If the target should appear at (u*, v*), the pixel error tells which way to move: for a camera looking down, moving the hand sideways shifts the target in the image. A proportional law turns the pixel error into a velocity, scaled by the target's depth Z and the focal length f, so the same gain works at different distances.",
      "Compared with 'measure once, then move', visual servoing corrects the motion continuously, which makes it robust against calibration errors. It needs the target to stay in the field of view, a limited speed (the image may be old by the time the command arrives) and a stop condition, both for the error and for the number of iterations.",
    ],
    steps: [
      "Detect the target and read its pixel position.",
      "Compute the pixel error to the goal position.",
      "Convert it to a hand velocity with the depth and the focal length.",
      "Stop when the error is under 2 pixels, and give up after 200 iterations.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "def servo(pixel, goal, depth, fx, fy, gain=1.0, v_max=0.05):",
        "hand velocity (m/s, camera frame) that moves the target toward the goal pixel.",
      ],
      [
        "    e = np.asarray(goal, float) - np.asarray(pixel, float)",
        "pixel error: where we want the target minus where it is.",
      ],
      [
        "    v = gain * np.array([e[0] / fx, e[1] / fy]) * depth",
        "convert pixels to metres at the target's depth, then scale by the gain.",
      ],
      ["    n = np.linalg.norm(v)", "the size of the velocity."],
      ["    return v * (v_max / n) if n > v_max else v", "limit the speed: the image may be old."],
      ["", ""],
      ["def done(pixel, goal, tol=2.0):", "is the target close enough to the goal?"],
      [
        "    return float(np.linalg.norm(np.asarray(goal, float) - np.asarray(pixel, float))) < tol",
        "an error below 2 pixels counts as arrived.",
      ],
      ["", ""],
      [
        "v = servo(pixel=(400, 260), goal=(320, 240), depth=0.4, fx=600, fy=600)",
        "the target is 80 px right and 20 px below the image centre, 0.4 m away.",
      ],
      [
        "print(v.round(4), done((320.5, 240.2), (320, 240)))",
        "prints [-0.0485 -0.0121]: left and up in the camera frame at the 0.05 m/s limit; the second call is True.",
      ],
    ),
    walk: [
      "Multiplying by the depth turns a pixel error into a metric error, so the loop behaves the same at any distance.",
      "The speed limit protects against old images and calibration mistakes.",
      "The completion test uses a tolerance, because a pixel-perfect result is never reached.",
    ],
    expect: [
      "The velocity is directed toward the goal and has the size 0.05 m/s (limited).",
      "Repeated updates reduce the pixel error until done() becomes True.",
    ],
    fix: [
      [
        "The hand oscillates around the target.",
        "The gain is too high for the image delay. Lower the gain and the speed limit.",
      ],
      [
        "The hand moves in the wrong direction.",
        "The camera frame axes are not aligned with the velocity command frame. Check the signs and the hand-eye calibration.",
      ],
    ],
    exercise:
      "Simulate the loop with a 100 ms image delay and find the largest gain that does not oscillate.",
    checklist: [
      "The velocity is limited",
      "A tolerance and an iteration limit are set",
      "The target stays in the field of view",
    ],
  }),
  lesson({
    title: "Tool changers",
    summary:
      "Verify the tool identity after a change and load its payload, tip and safety limits before any motion.",
    goals: [
      "Read and verify the tool identity",
      "Load the payload, tool frame and limits for that tool",
      "Apply the more restrictive limits first",
    ],
    concept: [
      "A cobot's safety depends on its tool: a soft gripper and a sharp screwdriver need different speed and force limits, and each has its own weight and tip position. After every tool change the robot must know which tool it holds. The tool identifies itself, for example through an RFID tag or coded pins, and the program looks up the tool's data in a table.",
      "The order matters. The new payload and the new limits are loaded before any motion, and if the new tool is more hazardous than the old one, the restrictive limits are applied first. A tool that the table does not know, or an ID that does not match the expected tool for the step, stops the program. The table is part of the risk assessment and must be under version control.",
    ],
    steps: [
      "Write the tool table with mass, tip offset and limits for each tool.",
      "Read the ID from the tool and compare it with the expected tool.",
      "Load payload, tip and limits before any motion.",
      "Refuse any tool that is not in the table.",
    ],
    example: hash(
      [
        "TOOLS = {",
        "the tool table: identity, mass (kg), tip offset (m), speed limit (m/s) and force limit (N).",
      ],
      [
        "    'grip-01': {'mass': 0.9, 'tip': (0, 0, 0.14), 'v_max': 0.50, 'f_max': 40.0},",
        "a soft parallel gripper: moderate limits.",
      ],
      [
        "    'screw-02': {'mass': 1.6, 'tip': (0, 0, 0.22), 'v_max': 0.25, 'f_max': 20.0},",
        "a screwdriver with a sharp bit: slower and gentler.",
      ],
      ["}", "end of the table."],
      ["", ""],
      [
        "def equip(robot, tool_id, expected):",
        "load the data of the tool that was just picked up.",
      ],
      ["    if tool_id != expected:", "the wrong tool for this step."],
      [
        "        raise RuntimeError(f'expected {expected}, found {tool_id}')",
        "stop: never carry on with an unexpected tool.",
      ],
      ["    data = TOOLS.get(tool_id)", "look the tool up."],
      ["    if data is None:", "an unknown tool."],
      [
        "        raise RuntimeError(f'unknown tool {tool_id}')",
        "not in the risk assessment: refuse it.",
      ],
      [
        "    robot.set_speed_limit(min(robot.speed_limit(), data['v_max']))",
        "apply the restrictive speed limit first (never raise it here).",
      ],
      [
        "    robot.set_force_limit(min(robot.force_limit(), data['f_max']))",
        "the same for the force limit.",
      ],
      ["    robot.set_payload(data['mass'])", "tell the dynamics about the new mass."],
      ["    robot.set_tcp(data['tip'])", "and about the new tip position."],
      ["    robot.set_speed_limit(data['v_max'])", "only now set the tool's own limits exactly."],
      ["    robot.set_force_limit(data['f_max'])", "the tool's force limit."],
    ),
    walk: [
      "Taking the minimum with the current limits first means the robot is never faster than either tool allows during the change.",
      "The unknown-tool and wrong-tool checks stop the program before any motion uses wrong data.",
      "The table is data under version control, so any change to a limit can be reviewed and traced.",
    ],
    expect: [
      "With the correct screwdriver, the payload is 1.6 kg, the speed limit 0.25 m/s and the force limit 20 N.",
      "An unknown tool ID raises an error and the robot does not move.",
    ],
    fix: [
      [
        "The robot moves with the old tool's payload.",
        "The payload was set after the first motion. Load all tool data before any motion in the next step.",
      ],
      [
        "The wrong limits stay after a tool change.",
        "The tool's own limits were only ever lowered. Set them exactly after the restrictive step, as shown.",
      ],
    ],
    exercise:
      "Add a third tool (a suction cup, 0.5 kg, limit 0.5 m/s and 40 N) and test all tool-to-tool changes for the limit order.",
    checklist: [
      "Tool identity is verified",
      "Payload and tip are loaded before motion",
      "The tool table is versioned and reviewed",
    ],
  }),
  lesson({
    title: "Calibration",
    summary:
      "Identify the payload mass and centre of mass from force and torque readings in several orientations.",
    goals: [
      "Explain why the payload must be identified",
      "Compute the mass from force magnitudes",
      "Compute the centre of mass from the torques by least squares",
    ],
    concept: [
      "A cobot's collision detection and hand guiding depend on knowing what it holds. If the payload data are wrong, the model torque is wrong, and the robot either feels a false collision or misses a real one. The mass and centre of mass (COM) of the tool and the part can be identified by moving the robot to several orientations and reading the wrist force and torque sensor.",
      "The gravity force measured in the sensor frame has a size m·g in every orientation, so the mass is the average magnitude divided by g. The torque is τ = r × F, where r is the COM position, and −[F]× · r = τ is a linear equation in r for each orientation. Stacking the equations of at least two different orientations and solving by least squares gives r. The sensor bias must be removed first.",
    ],
    steps: [
      "Tare the sensor with no tool attached, or subtract the known bias.",
      "Move to three or more different orientations and record force and torque.",
      "Compute the mass from the mean force magnitude.",
      "Solve for the COM with least squares and compare with the tool's drawing.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the linear algebra."],
      ["", ""],
      ["def skew(v):", "the matrix that turns a cross product into a multiplication."],
      [
        "    return np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])",
        "skew(a) @ b equals a x b.",
      ],
      ["", ""],
      [
        "def identify(forces, torques, g=9.81):",
        "mass (kg) and centre of mass (m, sensor frame) from several poses.",
      ],
      [
        "    F = [np.asarray(f, float) for f in forces]",
        "measured force vectors in the sensor frame.",
      ],
      ["    T = [np.asarray(t, float) for t in torques]", "measured torque vectors."],
      [
        "    mass = float(np.mean([np.linalg.norm(f) for f in F]) / g)",
        "the size of the gravity force is m * g in every pose.",
      ],
      [
        "    A = np.vstack([-skew(f) for f in F])",
        "torque = r x F = -skew(F) r, so this is a linear equation for r.",
      ],
      ["    b = np.hstack(T)", "the measured torques, stacked."],
      [
        "    r, *_ = np.linalg.lstsq(A, b, rcond=None)",
        "solve for the centre of mass by least squares.",
      ],
      ["    return round(mass, 3), r.round(4)", "the identified payload."],
      ["", ""],
      [
        "F = [(0, 0, -19.62), (19.62, 0, 0)]",
        "a 2 kg payload measured with the sensor pointing up, then turned sideways.",
      ],
      [
        "T = [(0, 0, 0), (0, 0.981, 0)]",
        "the matching torques for a centre of mass 5 cm out along z.",
      ],
      ["print(identify(F, T))", "prints 2.0 and [0. 0. 0.05]."],
    ),
    walk: [
      "Two poses with different force directions are the minimum: one pose alone cannot tell the COM's component along the force.",
      "Least squares averages measurement noise when more poses are used, which is why real calibrations use five or more.",
      "The result is only valid in the sensor frame, so it must be transformed if the robot expects it in the flange frame.",
    ],
    expect: [
      "The script prints a mass of 2.0 kg and a centre of mass of [0, 0, 0.05].",
      "Using a single pose returns an underdetermined solution, which shows why several poses are needed.",
    ],
    fix: [
      [
        "The mass is off by a constant.",
        "The sensor has a bias or the tool's own weight was not removed. Tare with the empty tool changer.",
      ],
      [
        "The COM changes between runs.",
        "The payload moves in the gripper or the poses are too similar. Fix the part and use poses with large orientation differences.",
      ],
    ],
    exercise:
      "Add 0.2 N and 0.01 N·m of noise to a simulated data set with five poses and report the error of mass and COM.",
    checklist: [
      "The sensor bias is removed",
      "At least three different orientations are used",
      "Results are compared with the drawing",
    ],
  }),
  lesson({
    title: "Error recovery",
    summary: "Escalate failed steps through retries, variations and finally an operator request.",
    goals: [
      "Design a recovery ladder for a failing step",
      "Limit each rung so the robot cannot loop forever",
      "Ask the operator with a clear message when automatic recovery fails",
    ],
    concept: [
      "Every step of a cell can fail: a part is not where it should be, a grasp slips, a screw does not start. Good cells have a ladder of recoveries, from the cheapest to the most disruptive: retry the same action, retry with a small variation (a new offset or a slower approach), go back to a known safe state and start the step again, and finally ask an operator for help.",
      "Each rung has a limit, and the ladder has an end. An endless retry hides a real problem and wastes cycle time; an early call for help wastes the operator's time. Counting failures per step and per rung shows where the process needs improvement. The request to the operator must say what failed and what to do, and the robot waits in a safe state.",
    ],
    steps: [
      "List the rungs: retry, retry with offset, restart the step, ask the operator.",
      "Give each rung a maximum number of tries.",
      "Count every failure by step and rung.",
      "Write the operator message with the cause and the action needed.",
    ],
    example: hash(
      [
        "LADDER = [('retry', 2), ('retry with offset', 2), ('restart step', 1)]",
        "each rung with the number of attempts it may use.",
      ],
      ["", ""],
      [
        "def recover(action, counters, name):",
        "run an action with the recovery ladder; returns 'ok' or 'operator'.",
      ],
      ["    if action():", "the first attempt."],
      ["        return 'ok'", "no recovery needed."],
      ["    counters[name] = counters.get(name, 0) + 1", "count the failure of this step."],
      ["    for rung, tries in LADDER:", "climb the ladder."],
      ["        for attempt in range(tries):", "the attempts allowed at this rung."],
      ["            if action(variant=rung):", "try again in the way this rung describes."],
      ["                return 'ok'", "recovered."],
      [
        "            counters[f'{name}:{rung}'] = counters.get(f'{name}:{rung}', 0) + 1",
        "count the failed attempt per rung.",
      ],
      ["    return 'operator'", "the ladder is used up: ask for help and wait in a safe state."],
      ["", ""],
      ["def operator_message(step, counters):", "a clear request for the operator."],
      [
        "    return f\"Step '{step}' failed {counters.get(step, 0)} time(s) and could not be recovered. Check the part position, then press Continue.\"",
        "say what failed and what to do.",
      ],
    ),
    walk: [
      "Every rung has a fixed number of tries, so the ladder always ends.",
      "The counters per step and rung are the data for process improvement, not only for debugging.",
      "The operator message contains the step name and the action, so the person does not need to look up an error code.",
    ],
    expect: [
      "A step that succeeds at the second retry returns 'ok' and the counters show one failure.",
      "A step that always fails uses five recovery attempts and returns 'operator'.",
    ],
    fix: [
      [
        "The robot retries forever.",
        "A rung has no limit or the ladder repeats. Check the loop bounds and the end of the ladder.",
      ],
      [
        "Operators are called for trivial problems.",
        "Add a cheaper rung, such as a re-scan or an offset search, before the operator request.",
      ],
    ],
    exercise:
      "Run 1,000 simulated steps with a 10 % failure rate and report how many were recovered at each rung.",
    checklist: [
      "Every rung has a limit",
      "Failures are counted",
      "The operator request is specific",
    ],
  }),
  lesson({
    title: "Quality workflows",
    summary:
      "Record every part's measurements with its serial number in a database for traceability.",
    goals: [
      "Explain traceability in a cobot cell",
      "Store per-part results in a SQLite database",
      "Query the data for a serial number and for failure statistics",
    ],
    concept: [
      "Customers and regulators often require traceability: for any finished product you must be able to say what was done to it, with which values, when and by which machine. A cobot cell produces the data naturally: the tightening torque and angle, the measured dimension, the vision result and the tool used. Storing them with the part's serial number turns a production run into a searchable record.",
      "A small embedded database such as SQLite is enough for a cell. Every row has a timestamp, the serial number, the step, the measured values and the result. Writes must not block the robot and must not be lost on a power cut: use transactions and write in a separate thread or process. The same data feeds quality charts and a recall search.",
    ],
    steps: [
      "Create a table with serial number, step, value, result and time.",
      "Insert a row for every measured step.",
      "Query all steps of one serial number.",
      "Query the failure rate per step over the last shift.",
    ],
    example: hash(
      ["import sqlite3, time", "the standard SQLite module and time stamps."],
      ["", ""],
      ["db = sqlite3.connect('cell_quality.db')", "open (or create) the database file."],
      [
        "db.execute('CREATE TABLE IF NOT EXISTS results (t REAL, serial TEXT, step TEXT, value REAL, ok INTEGER)')",
        "one row per measured step of each part.",
      ],
      ["", ""],
      ["def record(serial, step, value, ok):", "store one result."],
      ["    with db:", "a transaction: the row is either fully written or not at all."],
      [
        "        db.execute('INSERT INTO results VALUES (?, ?, ?, ?, ?)', (time.time(), serial, step, value, int(ok)))",
        "use placeholders, never string formatting, for the values.",
      ],
      ["", ""],
      ["def history(serial):", "every recorded step of one part."],
      [
        "    return db.execute('SELECT step, value, ok FROM results WHERE serial = ? ORDER BY t', (serial,)).fetchall()",
        "the trace for a serial number.",
      ],
      ["", ""],
      ["def failure_rate(step):", "the share of failed results for a step."],
      [
        "    return db.execute('SELECT AVG(1 - ok) FROM results WHERE step = ?', (step,)).fetchone()[0]",
        "the average of 'not ok' over all rows of the step.",
      ],
      ["", ""],
      ["record('A1001', 'screw 1', 1.21, True)", "the torque of the first screw of part A1001."],
      ["record('A1001', 'screw 2', 0.60, False)", "the second screw failed."],
      [
        "print(history('A1001'), failure_rate('screw 2'))",
        "prints both rows and a failure rate of 1.0 for 'screw 2'.",
      ],
    ),
    walk: [
      "The transaction makes every result atomic, so a power failure cannot leave half a row.",
      "Placeholders (?) prevent SQL injection, which matters even for data that comes from your own machines.",
      "One table with a step column is flexible: adding a new measurement needs no schema change.",
    ],
    expect: [
      "history('A1001') returns the two rows in time order.",
      "The failure rate for 'screw 2' is 1.0 and for 'screw 1' 0.0.",
    ],
    fix: [
      [
        "The database grows too large.",
        "Archive old data regularly and keep only what regulations require in the cell.",
      ],
      [
        "The robot pauses during a write.",
        "Writes block on a slow disk. Write from a separate thread or queue the rows.",
      ],
    ],
    exercise:
      "Add a query that lists the ten serial numbers with the most failed steps in the last 24 hours.",
    checklist: [
      "Every part has a serial number and timestamped results",
      "Writes are transactional and do not block the robot",
      "Queries answer traceability and failure questions",
    ],
  }),
  lesson({
    title: "URDF cobot modeling",
    summary:
      "Model a six-joint cobot with realistic limits, damping and a soft-limit safety controller.",
    goals: [
      "Write a joint with limits, damping and a safety controller block",
      "Give each link realistic inertia",
      "Check that the soft limits lie inside the hard limits",
    ],
    concept: [
      "A cobot's URDF has the same elements as any arm, but the details matter more because the model feeds the safety-related estimates: the mass and inertia of every link determine the model torque used for collision detection, and the joint limits and speeds define what the controller may command. Data can be taken from the manufacturer's model, but the dynamic parameters often need to be checked.",
      "The safety_controller element declares soft limits inside the hard limits. Controllers that honour it slow the joint smoothly when it approaches the soft limit, so it never reaches the hard stop. Damping and friction in the dynamics element describe joint losses, which the simulator uses to behave more realistically.",
    ],
    steps: [
      "Write the six joints with limits from the datasheet.",
      "Add damping and friction to each joint.",
      "Add the soft limits with the safety controller element.",
      "Check that each soft limit lies inside the hard limit with a margin.",
    ],
    example: xml(
      ['<joint name="shoulder_pan" type="revolute">', "the base joint of the cobot."],
      [
        '  <parent link="base_link"/><child link="shoulder_link"/>',
        "connects the base and the shoulder.",
      ],
      [
        '  <origin xyz="0 0 0.1625" rpy="0 0 0"/><axis xyz="0 0 1"/>',
        "0.1625 m above the base, turning about the vertical axis.",
      ],
      [
        '  <limit lower="-6.28" upper="6.28" velocity="3.14" effort="150"/>',
        "hard limits: about two full turns, 3.14 rad/s and 150 N*m.",
      ],
      [
        '  <dynamics damping="0.5" friction="1.0"/>',
        "viscous damping and Coulomb friction for the simulator.",
      ],
      [
        '  <safety_controller soft_lower_limit="-6.0" soft_upper_limit="6.0" k_position="100" k_velocity="40"/>',
        "soft limits 0.28 rad inside the hard limits, with the gains that pull the joint back.",
      ],
      ["</joint>", "end of the joint."],
    ),
    walk: [
      "The soft limits are inside the hard ones with a margin large enough to brake, which prevents a hard-stop impact.",
      "Friction and damping make the simulated joint behave like the real one, which changes the collision estimates.",
      "Every value comes from the datasheet, so a review can compare the model with the source line by line.",
    ],
    expect: [
      "check_urdf succeeds and RViz shows the joint moving between its limits.",
      "A simulated joint driven toward its hard limit is slowed by the safety controller before it reaches it.",
    ],
    fix: [
      [
        "The simulated robot drifts or sags.",
        "The inertia or damping is too small. Use the manufacturer's dynamic parameters.",
      ],
      [
        "Soft limits are ignored.",
        "Not every controller supports the safety_controller element. Enforce the soft limits in the hardware interface or controller as well.",
      ],
    ],
    exercise:
      "Write a script that parses the URDF and prints every joint whose soft limits are outside the hard limits or closer to them than 0.1 rad.",
    checklist: [
      "Limits come from the datasheet",
      "Soft limits are inside the hard limits",
      "Dynamic parameters are realistic",
    ],
  }),
  lesson({
    title: "MoveIt planning",
    summary:
      "Scale the planned velocity from the safe speed limit and plan and execute only successful plans.",
    goals: [
      "Set the velocity scaling from a safety-derived limit",
      "Plan with a limited planning time",
      "Execute only if planning succeeded and log the result",
    ],
    concept: [
      "In a collaborative cell the allowed speed changes with the situation: a person nearby means a lower speed, an empty cell allows the full speed. MoveIt plans trajectories at a fraction of the robot's maximum speed, set by the velocity scaling factor. The program computes the scale from the current speed limit (from the separation monitoring or the tool table) and sets it before every plan.",
      "The scaling only affects planning; a plan that was made at full speed and executed later, when a person has arrived, is still fast. So the plan should be made right before execution, and the safety system must still limit the speed on the robot itself. As always, the result of planning is checked before execute, and a timeout on the planning keeps the cell responsive.",
    ],
    steps: [
      "Read the current speed limit from the safety layer.",
      "Convert it to a scaling factor between 0.05 and 1.0.",
      "Set the scaling factors and the planning time, then plan.",
      "Execute only on success and log the plan and its scale.",
    ],
    example: cpp(
      [
        "const double robot_max = 1.0;",
        "the robot's maximum tool speed in m/s (from the datasheet).",
      ],
      [
        "const double limit = safety_speed_limit();",
        "the current allowed speed, in m/s, from the separation monitor or the tool table.",
      ],
      [
        "const double scale = std::clamp(limit / robot_max, 0.05, 1.0);",
        "convert it to a fraction, never below 5 % and never above 100 %.",
      ],
      ["", ""],
      [
        "arm.setMaxVelocityScalingFactor(scale);",
        "plan at this fraction of the maximum joint speed.",
      ],
      ["arm.setMaxAccelerationScalingFactor(scale * 0.5);", "and gentler accelerations."],
      ["arm.setPlanningTime(1.0);", "give the planner at most one second."],
      ['arm.setNamedTarget("handover");', "the goal is the named handover pose."],
      ["", ""],
      [
        "moveit::planning_interface::MoveGroupInterface::Plan plan;",
        "a container for the trajectory.",
      ],
      [
        "const bool ok = arm.plan(plan) == moveit::core::MoveItErrorCode::SUCCESS;",
        "true only if a collision-free trajectory was found.",
      ],
      [
        'RCLCPP_INFO(node->get_logger(), "plan %s at scale %.2f", ok ? "found" : "failed", scale);',
        "log the result and the scale, for the audit trail.",
      ],
      [
        "if (ok && safety_speed_limit() >= limit) arm.execute(plan);",
        "execute only if planning worked and the safe speed has not dropped in the meantime.",
      ],
    ),
    walk: [
      "The clamp keeps the scale in a sensible range: never zero, never above the robot's rating.",
      "The last condition re-reads the speed limit, so a plan made for a higher limit is not executed after the limit fell.",
      "Logging the scale makes it possible to show later how fast the robot was allowed to move at that moment.",
    ],
    expect: [
      "With a limit of 0.25 m/s the plan is made at a scale of 0.25 and executes slowly.",
      "If the limit falls between planning and execution, the plan is not executed.",
    ],
    fix: [
      [
        "The robot is slower than the limit.",
        "Scaling applies to joint limits, not to the tool speed. Check the resulting Cartesian speed of the trajectory.",
      ],
      [
        "The plan is executed at an outdated speed.",
        "Plan and execute close together, and let the safety layer enforce the limit on the robot too.",
      ],
    ],
    exercise:
      "Compute the Cartesian tool speed along a planned trajectory and warn if it is higher than the safety limit at any point.",
    checklist: [
      "The scale comes from the current safe limit",
      "Plans are executed right after planning",
      "The safety layer enforces the limit independently",
    ],
  }),
  lesson({
    title: "Safety plugins",
    summary:
      "Filter motion commands with a node that scales them by a safety factor and stops on stale data.",
    goals: [
      "Explain the command filter pattern",
      "Scale and rate-limit commands passing through the filter",
      "Stop safely when the safety information is stale",
    ],
    concept: [
      "A common pattern is a filter node between the planner and the controller. Commands arrive on one topic, and the filter forwards them on another after applying the current safety scale, a speed limit and a change-rate limit. Anything that can produce commands (MoveIt, teleoperation, hand guiding) goes through the same filter, so the limits are applied in one place.",
      "The filter must also monitor its own inputs. If the safety scale has not been updated within a short time, the filter assumes the worst and outputs zero. If commands stop, it does not repeat the last command but reduces the output to zero. A filter is application-level; the certified safety chain still acts independently on the robot.",
    ],
    steps: [
      "Subscribe to the command topic and to the safety scale topic.",
      "Multiply each command by the scale and limit its change per cycle.",
      "Publish zero if the scale is older than 200 ms.",
      "Test with a stopped scale publisher and check that the output goes to zero.",
    ],
    example: hash(
      ["import rclpy", "the ROS 2 Python client library."],
      ["from rclpy.node import Node", "base class of nodes."],
      [
        "from std_msgs.msg import Float64, Float64MultiArray",
        "the scale and the command messages.",
      ],
      ["", ""],
      ["class SafetyFilter(Node):", "scales and limits joint velocity commands."],
      ["    def __init__(self):", "set up topics."],
      ["        super().__init__('safety_filter')", "name the node."],
      [
        "        self.scale, self.stamp, self.last = 0.0, 0.0, None",
        "the safety scale (0..1), when it was last received and the last output.",
      ],
      [
        "        self.create_subscription(Float64, 'safety_scale', self.on_scale, 10)",
        "the current safe speed factor.",
      ],
      [
        "        self.create_subscription(Float64MultiArray, 'cmd_in', self.on_cmd, 10)",
        "the unfiltered commands.",
      ],
      [
        "        self.pub = self.create_publisher(Float64MultiArray, 'cmd_out', 10)",
        "the filtered commands for the controller.",
      ],
      ["", ""],
      ["    def on_scale(self, msg):", "a new safety scale arrived."],
      ["        self.scale = min(1.0, max(0.0, msg.data))", "keep it between 0 and 1."],
      [
        "        self.stamp = self.get_clock().now().nanoseconds * 1e-9",
        "remember when it arrived.",
      ],
      ["", ""],
      ["    def on_cmd(self, msg):", "a command arrived."],
      ["        now = self.get_clock().now().nanoseconds * 1e-9", "the current time in seconds."],
      [
        "        scale = self.scale if now - self.stamp < 0.2 else 0.0",
        "stale safety information means zero.",
      ],
      ["        out = [v * scale for v in msg.data]", "apply the safety factor to every joint."],
      ["        if self.last is not None:", "limit how fast the output may change."],
      [
        "            out = [l + max(-0.05, min(0.05, o - l)) for o, l in zip(out, self.last)]",
        "at most 0.05 rad/s change per message.",
      ],
      ["        self.last = out", "remember the output."],
      ["        self.pub.publish(Float64MultiArray(data=out))", "send the filtered command on."],
    ),
    walk: [
      "Every command source passes through the same code, so the limits cannot be forgotten in one of them.",
      "The default scale is 0.0, so nothing moves until the safety layer has reported a value.",
      "The rate limit on the output avoids sudden changes when the scale changes abruptly.",
    ],
    expect: [
      "With a scale of 0.5, a command of 0.4 rad/s is forwarded as 0.2 rad/s (after the ramp).",
      "Stopping the scale publisher makes the output go to zero within about 0.2 seconds.",
    ],
    fix: [
      [
        "The robot stutters.",
        "The scale flips quickly between values. Filter the scale or add hysteresis in the source.",
      ],
      [
        "Someone bypasses the filter.",
        "A controller listens to cmd_in directly. Remove that connection so only cmd_out reaches the controller.",
      ],
    ],
    exercise:
      "Add a second input, an emergency 'freeze' message, that sets the output to zero at once and requires a reset message to resume.",
    checklist: [
      "All commands pass through the filter",
      "Stale safety data means zero output",
      "Certified hardware remains the protective layer",
    ],
  }),
  lesson({
    title: "Gazebo cobot simulation",
    summary:
      "Add a walking worker to the simulated cell so speed and separation logic can be tested repeatably.",
    goals: [
      "Add an actor with a trajectory to a Gazebo world",
      "Publish the person's position for the safety logic",
      "Repeat the same test runs to compare settings",
    ],
    concept: [
      "The safety behaviour of a cobot cell depends on people, and people are hard to use for repeated tests. In simulation an 'actor' walks a defined path at a defined speed, so the same approach can be replayed with different settings of the separation monitor and the results compared. It is much safer to find an error with a simulated person than with a real one.",
      "A Gazebo actor follows a trajectory of timed waypoints and is not affected by physics, so it is a reliable test signal. Its position must be made available to the safety logic, for instance by a bridged pose topic or by a simulated sensor. Simulated humans do not replace tests with real safety devices; they help develop and regression-test the logic before commissioning.",
    ],
    steps: [
      "Add an actor with a box-shaped body to the world file.",
      "Give it a trajectory that walks toward the robot and back.",
      "Bridge its pose into ROS 2 and feed it to the separation logic.",
      "Replay the walk with different separation settings and compare the stops.",
    ],
    example: xml(
      ['<actor name="worker">', "a scripted moving object that stands in for a person."],
      ['  <link name="body">', "the body of the actor."],
      [
        '    <visual name="shape"><geometry><box><size>0.4 0.3 1.7</size></box></geometry></visual>',
        "a simple box the size of a standing person.",
      ],
      ["  </link>", "end of the body."],
      ["  <script>", "the walking definition."],
      [
        "    <loop>true</loop><auto_start>true</auto_start>",
        "repeat the walk and start immediately.",
      ],
      ['    <trajectory id="0" type="walk">', "one path made of timed waypoints."],
      [
        "      <waypoint><time>0</time><pose>3.0 0 0.85 0 0 3.14</pose></waypoint>",
        "at time 0 the person is 3 m from the robot, facing it.",
      ],
      [
        "      <waypoint><time>3</time><pose>0.8 0 0.85 0 0 3.14</pose></waypoint>",
        "after 3 s they have walked 2.2 m closer (about 0.73 m/s).",
      ],
      [
        "      <waypoint><time>6</time><pose>3.0 0 0.85 0 0 0</pose></waypoint>",
        "and after 6 s they walk away again.",
      ],
      ["    </trajectory>", "end of the trajectory."],
      ["  </script>", "end of the script."],
      ["</actor>", "end of the actor."],
    ),
    walk: [
      "The waypoint times set the walking speed, so the test speed is exactly known.",
      "The person approaches to 0.8 m, which is inside a typical separation distance and must cause a stop.",
      "Because the walk is scripted, every run is identical and settings can be compared fairly.",
    ],
    expect: [
      "The actor walks toward the robot and back every 6 seconds in an endless loop.",
      "The safety logic reduces the speed as the person approaches and stops the robot before 0.9 m.",
    ],
    fix: [
      [
        "The actor does not appear.",
        "The actor is defined outside the world element or has no visual. Check the SDF structure.",
      ],
      [
        "The robot never reacts.",
        "The pose does not reach the ROS 2 node. Check the bridge and topic names.",
      ],
    ],
    exercise:
      "Run the walk at three speeds (0.5, 1.0 and 1.6 m/s) and record the closest distance the robot allows in each case.",
    checklist: [
      "The walk is scripted and repeatable",
      "The position reaches the safety logic",
      "Real devices are still tested at commissioning",
    ],
  }),
  lesson({
    title: "Vision pipeline",
    summary:
      "Find parts on a table from a depth point cloud by removing the table plane and clustering the rest.",
    goals: [
      "Remove the table plane from a point cloud",
      "Cluster the remaining points into objects",
      "Compute the centre and size of each object",
    ],
    concept: [
      "For parts of unknown shape on a table, a depth camera gives a point cloud. A reliable classical pipeline is: crop to the region of interest, remove the points on the table (everything below a small height above it), and group the remaining points that are close to each other into clusters. Each cluster is an object, described by its centre, its height and its size.",
      "DBSCAN is a clustering method that needs no number of objects in advance: points within a distance eps of at least min_samples others form a cluster, and stray points are noise. Its parameters come from the point density: eps a little larger than the point spacing on the object, min_samples large enough to reject noise. The result is only a candidate list; a grasp planner then decides how to pick each object.",
    ],
    steps: [
      "Transform the cloud to the table frame so that z is the height above the table.",
      "Keep points between 1 cm and 20 cm above the table.",
      "Cluster the remaining points with DBSCAN.",
      "Compute the centre and height of each cluster.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the arrays."],
      ["from sklearn.cluster import DBSCAN", "a density-based clustering method."],
      ["", ""],
      [
        "def find_objects(points, zmin=0.01, zmax=0.20, eps=0.02, min_samples=30):",
        "points is an N x 3 array in the table frame (z up, metres).",
      ],
      [
        "    keep = points[(points[:, 2] > zmin) & (points[:, 2] < zmax)]",
        "remove the table itself and everything too high.",
      ],
      ["    if len(keep) < min_samples:", "not enough points for any object."],
      ["        return []", "nothing found."],
      [
        "    labels = DBSCAN(eps=eps, min_samples=min_samples).fit_predict(keep)",
        "cluster the points; noise points get the label -1.",
      ],
      ["    objects = []", "the result."],
      ["    for label in set(labels) - {-1}:", "each cluster except the noise."],
      ["        cluster = keep[labels == label]", "the points of one object."],
      [
        "        objects.append({'centre': cluster.mean(axis=0).round(3), 'height': round(float(cluster[:, 2].max()), 3), 'points': len(cluster)})",
        "its centre, its height above the table and its point count.",
      ],
      ["    return objects", "the list of candidate objects."],
    ),
    walk: [
      "Removing the table first is what makes the clustering easy: the objects are then separate islands of points.",
      "The noise label -1 is dropped, so stray points from reflections do not become objects.",
      "The point count of each cluster helps to reject tiny clusters that are probably noise.",
    ],
    expect: [
      "Two boxes on the table give two clusters with plausible heights and centres.",
      "Objects that touch each other merge into one cluster, which the caller must handle.",
    ],
    fix: [
      [
        "Objects are split into several clusters.",
        "eps is too small for the point spacing. Increase eps or downsample the cloud first.",
      ],
      [
        "The table appears as an object.",
        "The table plane is tilted in the frame. Fit the plane and transform the cloud so that the table is horizontal.",
      ],
    ],
    exercise:
      "Generate a synthetic cloud with three boxes and noise, run the function and compare the found centres with the true ones.",
    checklist: [
      "The table plane is removed",
      "Clustering parameters match the point density",
      "Touching objects are handled",
    ],
  }),
  lesson({
    title: "Human tracking",
    summary: "Track a person's position and velocity with a constant-velocity Kalman filter.",
    goals: [
      "Explain why raw detections are not enough",
      "Implement a Kalman filter with a constant-velocity model",
      "Use the predicted position to look ahead",
    ],
    concept: [
      "Detections of a person are noisy and appear at each frame without any notion of speed. A Kalman filter combines a motion model (people move at nearly constant velocity for a short time) with the measurements to give a smooth estimate of position and velocity, and can predict where the person will be in the next fraction of a second, which helps safety logic look ahead.",
      "The state is (x, y, vx, vy). The prediction step advances the position by velocity times dt and increases the uncertainty. The update step corrects the state with a measurement, weighted by the relative uncertainty of the model (process noise Q) and the sensor (measurement noise R). Larger Q trusts the measurements, larger R trusts the model. If detections stop, the filter keeps predicting for a while and then discards the track.",
    ],
    steps: [
      "Define the state and the matrices F, H, Q and R.",
      "Predict at every cycle and update whenever a detection arrives.",
      "Feed a simulated walk with noise and compare the estimate with the truth.",
      "Use the velocity to predict the position 0.5 s ahead.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the matrices."],
      ["", ""],
      ["class Track:", "a constant-velocity Kalman filter for one person."],
      [
        "    def __init__(self, x, y, dt=0.1):",
        "start at the first detection; dt is the time between cycles.",
      ],
      ["        self.s = np.array([x, y, 0.0, 0.0])", "state: position and velocity."],
      [
        "        self.P = np.diag([0.1, 0.1, 1.0, 1.0])",
        "uncertainty: sure about the position, unsure about the velocity.",
      ],
      [
        "        self.F = np.array([[1, 0, dt, 0], [0, 1, 0, dt], [0, 0, 1, 0], [0, 0, 0, 1]], float)",
        "motion model: position advances by velocity times dt.",
      ],
      [
        "        self.H = np.array([[1, 0, 0, 0], [0, 1, 0, 0]], float)",
        "we only measure the position.",
      ],
      [
        "        self.Q = np.diag([0.01, 0.01, 0.5, 0.5])",
        "process noise: people can change speed a little.",
      ],
      ["        self.R = np.diag([0.05**2, 0.05**2])", "measurement noise: about 5 cm."],
      ["", ""],
      ["    def predict(self):", "advance the state by one cycle."],
      ["        self.s = self.F @ self.s", "move the estimate."],
      ["        self.P = self.F @ self.P @ self.F.T + self.Q", "the uncertainty grows."],
      ["", ""],
      ["    def update(self, zx, zy):", "correct the state with a detection."],
      ["        z = np.array([zx, zy])", "the measurement."],
      [
        "        S = self.H @ self.P @ self.H.T + self.R",
        "the uncertainty of the predicted measurement.",
      ],
      [
        "        K = self.P @ self.H.T @ np.linalg.inv(S)",
        "the Kalman gain: how much to trust the measurement.",
      ],
      [
        "        self.s = self.s + K @ (z - self.H @ self.s)",
        "correct the state by the weighted error.",
      ],
      ["        self.P = (np.eye(4) - K @ self.H) @ self.P", "the uncertainty shrinks."],
      ["", ""],
      ["    def ahead(self, t):", "where the person will be after t seconds."],
      ["        return self.s[:2] + self.s[2:] * t", "position plus velocity times time."],
    ),
    walk: [
      "Predict is called every cycle and update only when a detection arrives, so gaps are bridged by prediction.",
      "The velocity is never measured; the filter infers it from how the position changes.",
      "ahead() turns the estimate into a look-ahead position, which the separation logic can use.",
    ],
    expect: [
      "For a person walking at 1 m/s along x, the estimated vx approaches 1.0 within about 10 cycles.",
      "With no detection for 5 cycles the position keeps moving along the last velocity, and the uncertainty grows.",
    ],
    fix: [
      [
        "The estimate lags behind the person.",
        "Q is too small for the person's acceleration. Increase the velocity process noise.",
      ],
      [
        "The estimate jumps with every measurement.",
        "R is too small or the detections are poor. Increase R or improve the detector.",
      ],
    ],
    exercise:
      "Simulate a walk with a sudden stop and measure how many cycles the filter needs for its velocity to fall below 0.2 m/s.",
    checklist: [
      "Process and measurement noise are tuned on data",
      "Predictions bridge missing detections",
      "Old tracks are discarded",
    ],
  }),
  lesson({
    title: "Task planning",
    summary:
      "Order a product's tasks by dependencies and split them between the person and the cobot.",
    goals: [
      "Describe a task graph with dependencies",
      "Get a valid order with a topological sort",
      "Assign each task to the person or the cobot by rules",
    ],
    concept: [
      "An assembly is a set of tasks with dependencies: the housing must be placed before the board, the board before the screws. A task graph records them, and any topological order of the graph is a valid sequence. Planning then decides who does each task: the cobot takes the repetitive, precise and heavy ones, the person the tasks that need dexterity, judgement or inspection.",
      "Assignment rules can be simple and explicit: tasks marked 'needs judgement' go to the person, tasks marked 'heavy' or 'repetitive' to the cobot, and the rest to whoever is free. The plan must also keep the two apart in time and space where they would otherwise collide. Python's graphlib.TopologicalSorter gives the valid order and can also reveal tasks that could run in parallel.",
    ],
    steps: [
      "List the tasks with their dependencies.",
      "Compute a valid order with the sorter.",
      "Mark each task with the skills it needs.",
      "Assign tasks by the rules and print the plan.",
    ],
    example: hash(
      [
        "from graphlib import TopologicalSorter",
        "Python's standard tool for ordering tasks with dependencies.",
      ],
      ["", ""],
      [
        "DEPS = {'place board': {'place housing'}, 'fit clip': {'place board'}, 'screw 1': {'place board'}, 'screw 2': {'place board'}, 'inspect': {'fit clip', 'screw 1', 'screw 2'}}",
        "each task and the tasks that must be done before it.",
      ],
      [
        "TAGS = {'place housing': 'heavy', 'place board': 'precise', 'fit clip': 'dexterous', 'screw 1': 'repetitive', 'screw 2': 'repetitive', 'inspect': 'judgement'}",
        "what each task needs.",
      ],
      ["", ""],
      ["def who(tag):", "the assignment rule."],
      [
        "    return 'person' if tag in ('dexterous', 'judgement') else 'cobot'",
        "dexterity and judgement go to the person, everything else to the cobot.",
      ],
      ["", ""],
      ["def plan():", "the ordered plan with assignments."],
      [
        "    order = list(TopologicalSorter(DEPS).static_order())",
        "a valid order: every task after its dependencies.",
      ],
      ["    return [(t, who(TAGS[t])) for t in order]", "attach an executor to every task."],
      ["", ""],
      ["for step in plan():", "print the plan."],
      [
        "    print(step)",
        "for example place housing (cobot), place board (cobot), then the screws (cobot), the clip (person) and the inspection (person).",
      ],
    ),
    walk: [
      "The dependencies are data, so a change in the product changes the plan without changing any code.",
      "static_order() guarantees that no task comes before its prerequisites.",
      "The assignment rule is deliberately simple and readable, so a process engineer can review it.",
    ],
    expect: [
      "The plan begins with 'place housing' and ends with 'inspect' assigned to the person.",
      "The two screws can appear in either order, as neither depends on the other.",
    ],
    fix: [
      [
        "The sorter raises a CycleError.",
        "The dependencies contain a loop. Find it and correct the data.",
      ],
      [
        "The person and the cobot work in the same place at the same time.",
        "The plan does not consider space. Add a workspace tag and a rule that forbids overlapping tasks.",
      ],
    ],
    exercise:
      "Add a time estimate to each task and compute the total cycle time for the sequential plan and for a plan where independent tasks run in parallel.",
    checklist: [
      "Dependencies are data",
      "Assignment rules are explicit",
      "Shared space is considered in the plan",
    ],
  }),
  lesson({
    title: "Multi-cobot coordination",
    summary:
      "Prevent two cobots from entering the same region at the same time with a reservation manager.",
    goals: [
      "Explain why shared regions need reservations",
      "Grant regions with a timeout",
      "Avoid deadlock by requesting regions in a fixed order",
    ],
    concept: [
      "Two cobots at one table share regions: a tray, a fixture, a handover point. If both enter the same region at once, they collide, or at least each stops the other with its safety system. A reservation manager grants a region to one robot at a time: a robot requests it, uses it and releases it; others wait.",
      "Two rules prevent trouble. Each grant has a timeout, so a robot that fails while holding a region does not block the other for ever. And robots request regions in a fixed global order (for example alphabetical): if both need two regions, they ask for the first before the second, which makes a deadlock, where each waits for the region the other holds, impossible.",
    ],
    steps: [
      "List the shared regions and give them a fixed order.",
      "Write the request and release operations.",
      "Add a timeout to every reservation.",
      "Simulate two robots that need the same two regions.",
    ],
    example: hash(
      ["import time", "for the timeouts."],
      ["", ""],
      ["class Regions:", "grants regions to one robot at a time."],
      ["    def __init__(self, lease=5.0):", "how long a reservation is valid without renewal."],
      [
        "        self.owner, self.until, self.lease = {}, {}, lease",
        "who holds each region and until when.",
      ],
      ["", ""],
      [
        "    def request(self, robot, names):",
        "try to reserve several regions at once; returns True if all were granted.",
      ],
      [
        "        names = sorted(names)",
        "always in the same global order, which prevents deadlocks.",
      ],
      ["        now = time.time()", "the current time."],
      ["        for n in names:", "check every region first."],
      [
        "            if self.owner.get(n) not in (None, robot) and self.until.get(n, 0) > now:",
        "held by someone else and not yet expired?",
      ],
      ["                return False", "then none is granted."],
      ["        for n in names:", "all are free: take them."],
      [
        "            self.owner[n], self.until[n] = robot, now + self.lease",
        "record the owner and the expiry time.",
      ],
      ["        return True", "granted."],
      ["", ""],
      ["    def release(self, robot, names):", "give the regions back."],
      ["        for n in names:", "each region."],
      ["            if self.owner.get(n) == robot:", "only the owner may release it."],
      ["                del self.owner[n]", "free it."],
    ),
    walk: [
      "Granting all regions at once, or none, means a robot never holds one region while waiting for another.",
      "Expiry makes a crashed robot's reservation disappear, so the other robot can continue.",
      "The sorted order is an extra guard: even a program that requests one at a time cannot form a cycle.",
    ],
    expect: [
      "Robot A gets 'tray' and 'fixture'; robot B's request for 'fixture' is refused until A releases or the lease expires.",
      "After the release, B's request is granted.",
    ],
    fix: [
      [
        "A robot waits for ever.",
        "A reservation was not released after an error. Release in a finally block and rely on the lease as the last safety net.",
      ],
      [
        "Robots wait too often.",
        "Regions are too large. Split them so that the robots only reserve what they really use.",
      ],
    ],
    exercise:
      "Simulate two robots that each need 'tray' then 'fixture' for 2 seconds each and measure the total waiting time.",
    checklist: [
      "Regions are reserved as a set",
      "Reservations expire",
      "The order of requests is fixed",
    ],
  }),
  lesson({
    title: "Safety monitoring",
    summary:
      "Compare two independent measurements of the same quantity and raise a fault when they disagree.",
    goals: [
      "Explain redundancy and plausibility checks",
      "Compare two speed estimates with a tolerance",
      "Latch a fault and require an operator reset",
    ],
    concept: [
      "Safety functions use redundancy: two independent channels measure the same thing, for example the speed of a joint from two encoders, or the position of a door from two switches. If they disagree beyond a tolerance, one of them has failed, and the system cannot know which, so it goes to a safe state. The same idea works at application level for plausibility checks: a commanded speed that the joint does not follow is suspicious.",
      "The tolerance must allow for normal differences and delays, but not more; a tolerance that is too wide hides faults. A short persistence time (a few consecutive samples) prevents a single glitch from tripping the system. Once tripped, the fault latches: the system stays stopped until an operator resets it after checking the cause.",
    ],
    steps: [
      "Take two independent speed estimates of the same joint.",
      "Compute their difference every cycle.",
      "Count the consecutive cycles where the difference exceeds the tolerance.",
      "Latch a fault after five bad cycles and require a reset.",
    ],
    example: hash(
      ["class DualChannel:", "compares two measurements of one quantity."],
      [
        "    def __init__(self, tol=0.05, persist=5):",
        "allowed difference and the number of consecutive bad cycles that trips the fault.",
      ],
      [
        "        self.tol, self.persist, self.bad, self.fault = tol, persist, 0, False",
        "counters and the latched fault flag.",
      ],
      ["", ""],
      ["    def update(self, a, b):", "call every cycle with the two measurements."],
      ["        if self.fault:", "already tripped."],
      ["            return 'fault'", "stay in the fault state until reset."],
      [
        "        self.bad = self.bad + 1 if abs(a - b) > self.tol else 0",
        "count consecutive disagreements; one good cycle resets the count.",
      ],
      ["        if self.bad >= self.persist:", "the channels have disagreed for long enough."],
      ["            self.fault = True", "latch the fault."],
      ["            return 'fault'", "the caller must stop the robot."],
      ["        return 'ok'", "the channels agree."],
      ["", ""],
      [
        "    def reset(self, operator_ack):",
        "leave the fault state only on an operator's acknowledgement.",
      ],
      ["        if operator_ack:", "an explicit human decision."],
      ["            self.fault, self.bad = False, 0", "clear the fault and the counter."],
    ),
    walk: [
      "The persistence count filters glitches without hiding a real, lasting disagreement.",
      "The fault is latched, so a channel that recovers by itself cannot make the problem disappear silently.",
      "The application-level check is a supplement; the certified safety functions do their own dual-channel monitoring.",
    ],
    expect: [
      "Two channels within 0.05 of each other always return 'ok'.",
      "Five consecutive cycles with a difference of 0.2 return 'fault' and it stays until reset(True).",
    ],
    fix: [
      [
        "Faults appear for no reason.",
        "The two channels are sampled at different times. Sample them together or compensate for the delay.",
      ],
      [
        "A real fault is not caught.",
        "The tolerance is too wide or the persistence too long. Tighten them and test with an injected error.",
      ],
    ],
    exercise:
      "Inject a stuck sensor (one channel constant) and a noisy sensor into a simulation and check that both are detected.",
    checklist: [
      "Two independent channels are compared",
      "Persistence filters single glitches",
      "Faults latch and need an operator reset",
    ],
  }),
  lesson({
    title: "Full cobot cell project",
    summary:
      "Validate a cobot cell at commissioning: measured contact forces against limits, with a report.",
    goals: [
      "Describe the commissioning tests of a collaborative cell",
      "Compare measured contact forces with their limits",
      "Produce a report that can be signed and archived",
    ],
    concept: [
      "Before a collaborative cell goes into production, the risk assessment's claims must be verified by measurement. For power and force limiting the contact force and pressure are measured with a calibrated device at the points where a person could be hit, at the speeds used in production. The measured values must be below the limits for the body region, with a margin for the device's uncertainty.",
      "The result of commissioning is a record: which test, which point, which body region, the measured value, the limit and the outcome. A script that compares the values with the limits and prints a report makes the result reproducible and reviewable. Any change to the cell (speed, tool, layout) needs the affected tests to be repeated.",
    ],
    steps: [
      "List the test points, their body regions and limits.",
      "Measure the peak contact force at each point at the production speed.",
      "Compare each measurement with its limit including the measuring margin.",
      "Print the report and sign it with the responsible person.",
    ],
    example: hash(
      ["import json, time", "for the report."],
      ["", ""],
      [
        "MARGIN = 0.9",
        "measurements must be below 90 % of the limit to allow for measuring uncertainty.",
      ],
      [
        "TESTS = [",
        "the test plan: point, body region, limit in newtons and the measured peak force.",
      ],
      [
        "    {'point': 'gripper edge', 'region': 'hand', 'limit': 140.0, 'measured': 96.0},",
        "example values only; real limits come from the standard and the risk assessment.",
      ],
      [
        "    {'point': 'elbow joint', 'region': 'upper arm', 'limit': 150.0, 'measured': 141.0},",
        "close to the limit: it will fail the margin.",
      ],
      ["]", "end of the test plan."],
      ["", ""],
      ["def report(tests):", "evaluate the tests and build the report."],
      ["    rows = []", "one row per test."],
      ["    for t in tests:", "each test."],
      [
        "        passed = t['measured'] <= MARGIN * t['limit']",
        "below the limit with the safety margin?",
      ],
      ["        rows.append({**t, 'passed': passed})", "add the outcome to the record."],
      [
        "    return {'date': time.strftime('%Y-%m-%d'), 'all_passed': all(r['passed'] for r in rows), 'tests': rows}",
        "the complete report.",
      ],
      ["", ""],
      [
        "print(json.dumps(report(TESTS), indent=1))",
        "prints the report: the gripper edge passes and the elbow fails.",
      ],
    ),
    walk: [
      "The margin is part of the code, so it is applied to every test in the same way.",
      "The elbow test is at 94 % of its limit, which passes the raw limit but fails the margin: the speed there must be lowered.",
      "The report is machine-readable JSON, so it can be archived with the cell's configuration and compared between releases.",
    ],
    expect: [
      "The report shows the gripper edge passed and the elbow joint failed, with all_passed false.",
      "After lowering the speed near the elbow and re-measuring, all tests pass.",
    ],
    fix: [
      [
        "A test fails and nobody knows why.",
        "Record the speed, tool and pose at each measurement, so a failure can be reproduced.",
      ],
      [
        "The cell was changed after commissioning.",
        "Any change of speed, tool or layout invalidates the affected tests. Repeat them and update the report.",
      ],
    ],
    exercise:
      "Add the speed and tool used to each test record and refuse to produce a report if any field is missing.",
    checklist: [
      "Measurements use a calibrated device",
      "Limits come from the standard and the risk assessment",
      "Changes trigger new tests and a new report",
    ],
  }),
];
