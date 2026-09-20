import { hash, cpp, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 04 · Cartesian Gantry Robot — lessons 14–25 (Industrial Applications, then ROS 2)
export const module04b: LessonSpec[] = [
  lesson({
    title: "Palletizing",
    summary:
      "Generate the positions of a stacked pallet with alternating layers so the load stays stable.",
    goals: [
      "Describe a palletizing pattern with columns, rows and layers",
      "Generate position lists for each box",
      "Alternate layers to interlock the stack",
    ],
    concept: [
      "Palletizing means stacking boxes on a pallet in a fixed pattern. The gantry is well suited to it: it covers the whole pallet area and carries heavy boxes. The pattern is described by the box size, the number of columns and rows in a layer and the number of layers. From these the program generates the pick or place position of every box.",
      "A stable stack alternates the pattern between layers, for example by rotating it 180 degrees, so that the joints between boxes do not line up. The order matters as well: fill each layer from the back to the front so that the gantry never has to reach over boxes it has already placed. Store the current box index so an interrupted job can resume.",
    ],
    steps: [
      "Write the box dimensions and the pallet pattern.",
      "Generate the centre position of each box in a layer.",
      "Mirror the pattern on every second layer.",
      "Check that the last position is inside the workspace and below the height limit.",
    ],
    example: hash(
      [
        "def positions(box, cols, rows, layers):",
        "centre positions (mm) of every box on the pallet, in placing order.",
      ],
      ["    bx, by, bz = box", "box length, width and height."],
      ["    width, depth = cols * bx, rows * by", "size of one layer."],
      ["    out = []", "the result."],
      ["    for k in range(layers):", "one layer at a time, from the bottom."],
      ["        for j in range(rows):", "fill from the back row to the front."],
      ["            for i in range(cols):", "and from left to right in each row."],
      ["                x, y = (i + 0.5) * bx, (j + 0.5) * by", "the box centre in the layer."],
      ["                if k % 2:", "every second layer..."],
      [
        "                    x, y = width - x, depth - y",
        "...is rotated by 180 degrees so the joints do not line up.",
      ],
      ["                out.append((x, y, k * bz))", "place it on top of the layers below."],
      ["    return out", "the list of positions."],
      ["", ""],
      [
        "p = positions((300, 200, 150), 4, 4, 5)",
        "300 x 200 x 150 mm boxes, 4 x 4 per layer, 5 layers.",
      ],
      ["print(len(p), p[0], p[-1])", "prints 80 (150.0, 100.0, 0.0) (1050.0, 700.0, 600.0)."],
    ),
    walk: [
      "The generator is a pure function of the box size and the pattern, so it is easy to test.",
      "Rotating every second layer by 180 degrees is one line, but it makes the stack much more stable.",
      "The first box is placed at (150, 100, 0) and the last at (1050, 700, 600), which are easy to check against the pallet drawing.",
    ],
    expect: [
      "The script prints 80 boxes, with the first at (150, 100, 0) and the last at (1050, 700, 600).",
      "Boxes of odd layers appear in mirrored positions compared with the even layers.",
    ],
    fix: [
      [
        "The stack leans.",
        "The pattern is not interlocked or the boxes overhang. Check the pattern and reduce overhang to a few millimetres.",
      ],
      [
        "The gantry knocks placed boxes.",
        "The order or the approach height is wrong. Approach from above and place from back to front.",
      ],
    ],
    exercise:
      "Add a gap of 5 mm between boxes and a pallet origin offset, then check that every position is inside the workspace.",
    checklist: [
      "Layers alternate for stability",
      "Placing order avoids collisions with placed boxes",
      "The current index is stored for recovery",
    ],
  }),
  lesson({
    title: "Large-area inspection",
    summary:
      "Plan a raster scan with overlap over a large surface, and complete the interactive gantry lab.",
    goals: [
      "Explain why inspection needs overlapping scan lines",
      "Compute the scan lines from the sensor's field of view",
      "Complete the lab by scanning at the right grid cell",
    ],
    concept: [
      "A gantry can carry a camera, laser scanner or probe over a large surface. The sensor sees a strip as wide as its field of view, so the machine moves in parallel lines (a raster or serpentine pattern) until the surface is covered. Neighbouring lines must overlap, typically by 10 to 30 %, so that no gap appears because of positioning errors and so that images can be stitched.",
      "The number of lines follows from the area width, the field of view and the overlap. The last line is moved inward so it does not leave the area. Each line is traversed in the opposite direction to the previous one, which saves the return move. Every measurement is stamped with the axis position, so results can be mapped back to a place on the surface.",
    ],
    steps: [
      "Open the Robot Code Lab below and read the mission and the notes under every command.",
      "Type the missing command on the marked empty line and press Run program.",
      "Write the scan planner for your own surface: field of view, overlap and area size.",
      "Check that the last line covers the edge of the area.",
    ],
    example: hash(
      ["import math", "for rounding up."],
      ["", ""],
      [
        "def raster(width_mm, length_mm, fov_mm, overlap=0.2):",
        "scan lines (y position, x start, x end) covering a width x length area.",
      ],
      [
        "    step = fov_mm * (1.0 - overlap)",
        "distance between neighbouring lines: the field of view minus the overlap.",
      ],
      [
        "    n = max(1, math.ceil((width_mm - fov_mm) / step) + 1)",
        "how many lines are needed, at least one.",
      ],
      ["    lines = []", "the result."],
      ["    for i in range(n):", "one line at a time."],
      [
        "        y = min(fov_mm / 2 + i * step, width_mm - fov_mm / 2)",
        "the line's centre; the last one is moved inward so it stays on the surface.",
      ],
      [
        "        x0, x1 = (0.0, length_mm) if i % 2 == 0 else (length_mm, 0.0)",
        "every second line runs backward: a serpentine path saves the return move.",
      ],
      ["        lines.append((y, x0, x1))", "record it."],
      ["    return lines", "the scan plan."],
      ["", ""],
      [
        "for line in raster(600.0, 1000.0, 200.0):",
        "a 600 x 1000 mm surface and a 200 mm field of view with 20 % overlap.",
      ],
      ["    print(line)", "prints four lines at y = 100, 260, 420 and 500."],
    ),
    walk: [
      "The step is smaller than the field of view, which is the overlap that hides positioning errors.",
      "The last line is pulled back to y = 500, so it overlaps the previous one more than 20 % but covers the edge.",
      "The alternating direction halves the time spent on return moves.",
    ],
    expect: [
      "The script prints four lines, with centres at 100, 260, 420 and 500 mm.",
      "Every point of the 600 mm width is inside the field of view of at least one line.",
    ],
    fix: [
      [
        "The inspection misses a strip near the edge.",
        "The last line does not reach the edge. Check the clamp of the last line's position against the area.",
      ],
      [
        "Images do not stitch.",
        "The overlap is too small for the positioning error, or the axis timestamps are wrong. Increase the overlap and stamp positions.",
      ],
    ],
    exercise:
      "Home all axes, scan the first fixture, then travel to the next cell. Build the simulated version and show that raising the head before travel avoids the fixture.",
    checklist: [
      "Overlap covers positioning errors",
      "The last line reaches the edge",
      "Every measurement has an axis position stamp",
    ],
    lab: "04-cartesian-gantry",
  }),
  lesson({
    title: "Heavy payload handling",
    summary:
      "Size the drive force and motor torque for a heavy load with friction and acceleration.",
    goals: [
      "Compute the force an axis needs for a payload",
      "Convert axis force to motor torque through the drive",
      "Compare with the motor's rating with a safety factor",
    ],
    concept: [
      "The drive force of a horizontal axis carrying a mass m is F = m·a + μ·m·g, plus any process force. The first term accelerates the load and the second overcomes friction of the guides. A vertical axis must also carry the whole weight, m·g, plus the acceleration term. The heavier the load, the lower the possible acceleration for the same motor.",
      "The motor torque follows from the force at the pinion or pulley radius, divided by the gear ratio and the efficiency of the drive. The result is compared with the motor's continuous torque (for the average load) and peak torque (for acceleration). A safety factor of about 1.5 covers friction that grows with wear and dirt.",
    ],
    steps: [
      "Write the moving mass, acceleration and friction coefficient.",
      "Compute the required force including a safety factor.",
      "Compute the motor torque through the pinion radius and gearbox.",
      "Compare with the motor's rated torque and adjust the acceleration if needed.",
    ],
    example: hash(
      ["G = 9.81", "gravity in m/s^2."],
      ["", ""],
      [
        "def axis_force(mass, accel, mu=0.02, vertical=False):",
        "drive force in newtons for a horizontal or vertical axis.",
      ],
      ["    weight = mass * G", "the load's weight."],
      [
        "    return mass * accel + (weight if vertical else mu * weight)",
        "acceleration force plus friction (horizontal) or the whole weight (vertical).",
      ],
      ["", ""],
      [
        "def motor_torque(force, radius_m, ratio, efficiency=0.9):",
        "motor torque in N*m for a rack-and-pinion or belt drive.",
      ],
      [
        "    return force * radius_m / (ratio * efficiency)",
        "the force acts at the pinion radius; the gearbox divides and the efficiency loses some.",
      ],
      ["", ""],
      ["F = axis_force(200.0, 2.0)", "a 200 kg carriage and payload accelerating at 2 m/s^2."],
      [
        "print(round(F, 1), round(motor_torque(F * 1.5, 0.03, 10.0), 2))",
        "prints 439.2 N and 2.2 N*m with a safety factor of 1.5.",
      ],
    ),
    walk: [
      "The safety factor is applied to the force before the torque is computed, so it carries through the whole chain.",
      "The gearbox ratio trades speed for torque, which is what makes a small motor able to move a heavy load.",
      "A vertical axis needs far more force for the same mass, which is why Z drives are often larger or use brakes.",
    ],
    expect: [
      "The script prints 439.2 N and 2.2 N·m.",
      "Setting vertical=True raises the force to about 2,360 N for the same mass and acceleration.",
    ],
    fix: [
      [
        "The motor overheats.",
        "The continuous torque is exceeded. Check the average torque over the duty cycle, not only the peak.",
      ],
      [
        "The vertical axis drops when the drive is off.",
        "Fit a holding brake and test it. A vertical axis must not rely on the motor alone.",
      ],
    ],
    exercise:
      "Compute the largest acceleration for a 500 kg load with a motor that supplies 4 N·m peak through a 10:1 gearbox and a 30 mm pinion radius.",
    checklist: [
      "Friction and gravity are included",
      "Torque is compared with continuous and peak ratings",
      "Vertical axes have a holding brake",
    ],
  }),
  lesson({
    title: "Conveyor integration",
    summary:
      "Make the gantry follow a moving conveyor so it can pick and place while the belt runs.",
    goals: [
      "Explain the follow (tracking) mode of a linear axis",
      "Compute the follow command with an offset and latency compensation",
      "Release the axis from tracking safely",
    ],
    concept: [
      "A gantry picking from a moving belt runs its X axis in step with the belt: it follows the belt position with a fixed offset. The follow command is the belt encoder position plus the offset plus the distance the belt travels during the control latency, so the axis is where the belt will be when the command takes effect.",
      "Following starts once the axis has caught up and stays inside a small position window, and it ends when the pick is finished or the part leaves the window. While tracking, the Z axis and the gripper work normally and the robot's relative position to the part stays constant. If the encoder signal is lost, tracking must stop and the axis must stop or hold safely.",
    ],
    steps: [
      "Read the belt encoder and convert the counts to millimetres.",
      "Compute the follow command with the offset and the latency term.",
      "Start tracking when the error is inside the window and stop it after the pick.",
      "Stop the axis if the encoder value is stale.",
    ],
    example: hash(
      [
        "def follow(belt_pos, belt_v, latency, offset):",
        "X-axis command (mm) that keeps the gantry in step with the belt.",
      ],
      [
        "    return belt_pos + offset + belt_v * latency",
        "where the belt will be when the command takes effect, plus the desired offset.",
      ],
      ["", ""],
      [
        "def tracking(axis_pos, cmd, window=0.5):",
        "is the axis close enough to the follow command?",
      ],
      ["    return abs(axis_pos - cmd) <= window", "inside the window means synchronised."],
      ["", ""],
      [
        "cmd = follow(belt_pos=500.0, belt_v=200.0, latency=0.05, offset=100.0)",
        "belt at 500 mm moving 200 mm/s, 50 ms latency and a 100 mm offset.",
      ],
      [
        "print(cmd, tracking(610.2, cmd))",
        "prints 610.0 True: the axis is within half a millimetre.",
      ],
    ),
    walk: [
      "The latency term is small in distance (10 mm here) but large compared with the pick accuracy.",
      "The window check prevents the gripper from closing while the axis is still catching up.",
      "belt_v comes from the encoder, so the command also follows speed changes of the belt.",
    ],
    expect: [
      "The follow command is 610.0 mm and the axis at 610.2 mm is inside the 0.5 mm window.",
      "With the latency term removed the axis lags by 10 mm at 200 mm/s.",
    ],
    fix: [
      [
        "The axis oscillates around the belt.",
        "The follow command is noisy. Filter the belt velocity and check the encoder resolution.",
      ],
      [
        "Picks are late by a constant distance.",
        "The latency term is wrong. Measure the delay between a belt movement and the axis reaction.",
      ],
    ],
    exercise:
      "Simulate a belt whose speed changes from 200 to 300 mm/s and compare the tracking error with and without the velocity term.",
    checklist: [
      "The belt encoder gives the position and speed",
      "Latency is compensated",
      "Stale encoder data stops the axis",
    ],
  }),
  lesson({
    title: "SCADA connectivity",
    summary:
      "Publish machine status to a plant SCADA over MQTT with retained state and clear topic names.",
    goals: [
      "Explain why plants use MQTT or OPC UA for machine data",
      "Publish JSON status with a consistent topic structure",
      "Use retained messages so new subscribers see the current state",
    ],
    concept: [
      "A plant's SCADA collects data from all machines. MQTT is a light publish/subscribe protocol that is easy to add to a machine: the machine publishes small messages to a topic on a broker, and any number of dashboards and databases subscribe. OPC UA is the richer standard for structured machine data. Both need a clear naming scheme, such as site/line/machine/kind.",
      "Status messages should be small, contain a timestamp and use stable field names and units. A retained message keeps the last state on the broker, so a dashboard that starts later sees the current status at once. The machine also sets a last-will message, so the broker announces 'offline' when the connection drops. Remote commands from SCADA must be limited to safe requests such as 'pause', never to direct axis motion.",
    ],
    steps: [
      "Agree the topic names with the plant's IT team.",
      "Define the JSON fields: state, position, cycle count and error.",
      "Publish every second and on every state change with the retain flag.",
      "Configure the last will and test it by disconnecting the network.",
    ],
    example: hash(
      ["import json, time", "JSON encoding and timestamps."],
      ["import paho.mqtt.client as mqtt", "a popular MQTT client (version 2 API)."],
      ["", ""],
      ["TOPIC = 'plant/line1/gantry1/status'", "site/line/machine/kind naming."],
      ["client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)", "create the client."],
      [
        "client.will_set(TOPIC, json.dumps({'state': 'offline'}), qos=1, retain=True)",
        "the broker publishes this if the connection is lost unexpectedly.",
      ],
      ["client.connect('broker.local', 1883, keepalive=30)", "connect to the plant broker."],
      ["client.loop_start()", "handle network traffic in a background thread."],
      ["", ""],
      ["def publish(state, xyz, cycles, error=''):", "send the current machine status."],
      [
        "    payload = json.dumps({'t': time.time(), 'state': state, 'x_mm': xyz[0], 'y_mm': xyz[1], 'z_mm': xyz[2], 'cycles': cycles, 'error': error})",
        "a small JSON document with units in the field names.",
      ],
      [
        "    client.publish(TOPIC, payload, qos=1, retain=True)",
        "qos 1 makes delivery reliable, and retain keeps the last value for late subscribers.",
      ],
    ),
    walk: [
      "Units in the field names (x_mm) prevent misunderstandings between the machine builder and the plant.",
      "The last will turns a silent failure into a visible 'offline' message.",
      "Only status flows out here; remote control would need authentication and a strict list of allowed commands.",
    ],
    expect: [
      "A dashboard subscribing to the topic immediately sees the last status.",
      "Unplugging the machine's network cable makes the broker publish 'offline' after the keepalive time.",
    ],
    fix: [
      [
        "Messages arrive but with old data.",
        "The retained message is stale because the machine stopped publishing. Include a timestamp and treat old data as unknown.",
      ],
      [
        "The broker rejects the connection.",
        "Check credentials and encryption. Use TLS and per-machine credentials in a real plant.",
      ],
    ],
    exercise:
      "Add a second topic for alarms with a QoS of 2 and a retained flag off, and publish a message on every error.",
    checklist: [
      "Topic names follow the plant's scheme",
      "Status carries a timestamp and units",
      "A last will reports a lost connection",
    ],
  }),
  lesson({
    title: "Safety zones",
    summary:
      "Choose the allowed speed from the operating mode and the state of the guarding devices.",
    goals: [
      "Describe automatic and setup (manual) modes",
      "Map guard states to an allowed speed",
      "Explain what remains the job of certified safety hardware",
    ],
    concept: [
      "A large gantry is surrounded by fences with interlocked doors, light curtains and area scanners. In automatic mode all guards must be closed and clear before motion is allowed. In setup or teach mode a person may be inside, so the speed is limited (250 mm/s is a common limit for manual reduced speed) and motion is only allowed while the operator holds an enabling switch.",
      "The application can compute the speed limit it should request from the state of these devices, and refuse to start when they do not allow it. But the real enforcement is by certified safety relays or a safety PLC that cut power to the drives; the application only mirrors those states so that it does not command what the safety system will refuse anyway.",
    ],
    steps: [
      "List the safety inputs: emergency stop, door, light curtain, enabling switch.",
      "Write the rule table for each mode.",
      "Return the allowed speed and a reason from one function.",
      "Test all combinations, including the unsafe ones.",
    ],
    example: hash(
      ["SETUP_SPEED = 250.0", "reduced speed limit in setup mode (mm/s)."],
      ["", ""],
      [
        "def allowed_speed(mode, estop, door_closed, curtain_clear, enable_held):",
        "returns (speed limit in mm/s, reason).",
      ],
      ["    if estop:", "an emergency stop is active."],
      ["        return 0.0, 'emergency stop'", "no motion at all."],
      ["    if mode == 'auto':", "automatic operation."],
      ["        if door_closed and curtain_clear:", "the cell is closed and clear."],
      ["            return None, 'ok'", "no limit from the guards: the process limits apply."],
      [
        "        return 0.0, 'guard open or curtain broken'",
        "someone or something is in the guarded zone.",
      ],
      ["    if mode == 'setup':", "a person may be inside for teaching."],
      ["        if enable_held:", "the enabling switch is held."],
      ["            return SETUP_SPEED, 'setup: reduced speed'", "motion is allowed, but slowly."],
      ["        return 0.0, 'enabling switch not held'", "release means stop."],
      ["    return 0.0, 'unknown mode'", "anything unexpected means no motion."],
      ["", ""],
      [
        "print(allowed_speed('auto', False, False, True, False), allowed_speed('setup', False, False, True, True))",
        "prints (0.0, 'guard open or curtain broken') and (250.0, 'setup: reduced speed').",
      ],
    ),
    walk: [
      "Every unsafe or unknown combination returns zero, so mistakes fail towards stopping.",
      "The reason text tells the operator why the machine does not move.",
      "None means 'no limit from the guards': the process speed limits still apply.",
    ],
    expect: [
      "In automatic mode with the door open the speed limit is 0 and the reason names the guard.",
      "In setup mode with the enabling switch held the limit is 250 mm/s.",
    ],
    fix: [
      [
        "The gantry moves although a door is open.",
        "The application is not the protection. Check the safety chain: the drives must lose power by hardware when the door opens.",
      ],
      [
        "Operators bypass the enabling switch.",
        "Never allow a permanent bypass. Use the standard's rules for enabling devices and review the design with a safety expert.",
      ],
    ],
    exercise:
      "Add a 'maintenance' mode that requires a key switch and a lock-out signal, and write tests for every mode and every guard combination.",
    checklist: [
      "Unknown states result in no motion",
      "Reduced speed is defined for setup mode",
      "Certified hardware enforces the stop",
    ],
  }),
  lesson({
    title: "Maintenance routines",
    summary:
      "Track the distance each axis has travelled and schedule lubrication before wear begins.",
    goals: [
      "Explain distance-based maintenance intervals",
      "Accumulate axis travel from position samples",
      "Predict the days left to the next lubrication",
    ],
    concept: [
      "Linear guides, ball screws and racks need lubrication after a certain travelled distance, commonly 50 to 100 km, or after a time limit, whichever comes first. The manufacturer's catalogue gives the interval for the conditions. Counting the distance from the axis position gives a precise schedule rather than a calendar guess.",
      "The controller adds up the absolute change of position of every axis and stores the totals in non-volatile memory. When a total passes a threshold, it raises a maintenance task, and it can predict the date from the daily average. Other routines follow the same pattern: belt tension checks, brake tests and cable chain inspections, all with a recorded date and result.",
    ],
    steps: [
      "Sample the axis position at a fixed rate and add the absolute change to the total.",
      "Store the totals persistently every few minutes.",
      "Compare them with the lubrication interval.",
      "Predict the number of days left from the average daily travel.",
    ],
    example: hash(
      ["LUBE_KM = 100.0", "lubrication interval in kilometres (from the guide's catalogue)."],
      ["", ""],
      ["class Odometer:", "adds up the distance an axis has travelled."],
      ["    def __init__(self):", "start at zero."],
      [
        "        self.last, self.total_m = None, 0.0",
        "the previous position and the running total in metres.",
      ],
      ["", ""],
      ["    def update(self, pos_m):", "call at a fixed rate with the axis position."],
      ["        if self.last is not None:", "we need a previous sample."],
      [
        "            self.total_m += abs(pos_m - self.last)",
        "add the absolute distance moved since the last sample.",
      ],
      ["        self.last = pos_m", "remember the position."],
      ["", ""],
      ["def days_left(total_m, per_day_m):", "days until the axis needs lubrication."],
      [
        "    return max(0.0, (LUBE_KM * 1000.0 - total_m) / per_day_m)",
        "remaining distance divided by the daily average.",
      ],
      ["", ""],
      [
        "print(round(days_left(20_000.0, 500 * 3.0)))",
        "20 km done, 500 cycles a day at 3 m each: prints 53 days.",
      ],
    ),
    walk: [
      "Absolute changes are summed, so travelling back and forth counts twice, as it should for wear.",
      "The total must be stored persistently, or a restart resets the count and the schedule is lost.",
      "The prediction uses the real daily travel, which changes with production, not a fixed calendar.",
    ],
    expect: [
      "The script prints 53 days: 80 km remain at 1.5 km per day.",
      "After lubrication the total for that axis is reset and the interval starts again.",
    ],
    fix: [
      [
        "The count resets after a power cycle.",
        "Store the totals in non-volatile memory or a database and reload them at start-up.",
      ],
      [
        "Two axes have very different totals.",
        "That is normal, since their duties differ. Keep a separate interval and total for each.",
      ],
    ],
    exercise:
      "Add a second interval for the Z axis brake test (every 30 days) and print both tasks with their due dates.",
    checklist: [
      "Distance is counted per axis",
      "Totals survive a restart",
      "Maintenance tasks are recorded when done",
    ],
  }),
  lesson({
    title: "URDF gantry modeling",
    summary:
      "Model a dual-drive gantry with a mimic joint and complete collision, inertia and limit data.",
    goals: [
      "Model the second drive of a bridge as a mimic joint",
      "Add inertia and collision shapes to the moving links",
      "Check the model in RViz and against the machine drawing",
    ],
    concept: [
      "Wide gantries have a drive on each side of the bridge, so both sides move together. In URDF the second drive is a joint with a mimic tag that copies the first: mimic joint=y_axis multiplier=1 offset=0. RViz and the state publisher then keep the two sides identical. The controllers command only the primary joint.",
      "Each moving link needs a mass and inertia for simulation, and collision shapes for planning. A gantry's bridge is long and thin, so its inertia is very different about each axis and using a unit sphere will give wrong behaviour in the simulator. Use box shapes with the real dimensions and masses from the drawing.",
    ],
    steps: [
      "Add the second Y drive as a joint with a mimic tag.",
      "Give the bridge, carriage and Z slide a mass and box inertia.",
      "Add collision boxes with the real dimensions.",
      "Run check_urdf and view the model with the joint publisher.",
    ],
    example: xml(
      ['<joint name="y2_axis" type="prismatic">', "the drive on the other side of the bridge."],
      [
        '  <parent link="base_link"/><child link="bridge_end"/>',
        "it moves the far end of the bridge.",
      ],
      [
        '  <origin xyz="1.2 0 0" rpy="0 0 0"/><axis xyz="0 1 0"/>',
        "1.2 m away in x, sliding along y like the first drive.",
      ],
      [
        '  <limit lower="0.0" upper="2.0" velocity="0.8" effort="400"/>',
        "the same limits as the first drive.",
      ],
      [
        '  <mimic joint="y_axis" multiplier="1.0" offset="0.0"/>',
        "always copies the first drive: no separate command.",
      ],
      ["</joint>", "end of the mimic joint."],
      ['<link name="bridge">', "the long, thin bridge."],
      [
        '  <inertial><mass value="80.0"/><origin xyz="0.6 0 0"/>',
        "80 kg, centre of mass in the middle of the 1.2 m bridge.",
      ],
      [
        '    <inertia ixx="0.22" iyy="9.67" izz="9.75" ixy="0" ixz="0" iyz="0"/></inertial>',
        "small about its own long axis (x), large about the other two: a long thin beam.",
      ],
      [
        '  <collision><origin xyz="0.6 0 0"/><geometry><box size="1.2 0.15 0.10"/></geometry></collision>',
        "a box with the real dimensions for collision checking.",
      ],
      ["</link>", "end of the bridge link."],
    ),
    walk: [
      "The mimic joint removes the need for a second command, and the two sides can never disagree in the model.",
      "The inertia is different about each axis, which a simulator needs to move the bridge realistically.",
      "The collision box uses the real size so planners keep clear of the bridge.",
    ],
    expect: [
      "Moving y_axis in RViz moves both ends of the bridge together.",
      "In the simulator the bridge accelerates realistically without wobbling.",
    ],
    fix: [
      [
        "The simulator shows the bridge twisting.",
        "The two sides are commanded separately or the mimic is missing. Command only the primary joint.",
      ],
      [
        "Simulation is unstable.",
        "Inertia values are too small for the mass. Recompute them from the dimensions with the box formula.",
      ],
    ],
    exercise:
      "Compute the inertia of the bridge from its dimensions with the formula for a box (m/12 × (b² + c²)) and compare it with the values above.",
    checklist: [
      "Both drives are in the model",
      "Inertia fits the shape and mass",
      "Collision shapes have real dimensions",
    ],
  }),
  lesson({
    title: "ROS 2 control for linear actuators",
    summary:
      "Write the read and write functions of a ros2_control hardware interface that drives three linear axes.",
    goals: [
      "Explain the role of the hardware interface",
      "Implement read() and write() for three axes",
      "Clamp commands inside the limits",
    ],
    concept: [
      "The hardware interface is the plugin that connects ros2_control to real drives. It exports state interfaces (position, velocity) and command interfaces (position, velocity or effort) and it exchanges data with the drives in two functions. read() copies the drives' measured values into the state variables, and write() sends the commanded values to the drives. Both are called at the controller manager's update rate.",
      "The hardware interface is the last place where commands can be validated before they reach the drive, so it should clamp them to the axis limits and stop when a drive reports a fault. The functions run in the real-time loop, so they must not block, allocate or log at high rates.",
    ],
    steps: [
      "Define arrays for the position, velocity and command of three axes.",
      "Export them as state and command interfaces (see the ros2_control documentation for your distribution).",
      "Implement read() to fill positions and velocities from the drives.",
      "Implement write() to clamp the commands and send them to the drives.",
    ],
    example: cpp(
      [
        "hardware_interface::return_type GantryHardware::read(const rclcpp::Time &, const rclcpp::Duration &) {",
        "called every control cycle to read the drives.",
      ],
      ["  for (size_t i = 0; i < 3; ++i) {", "the three axes: x, y and z."],
      ["    pos_[i] = drive_[i].position();", "measured axis position in metres."],
      ["    vel_[i] = drive_[i].velocity();", "measured axis speed in m/s."],
      [
        "    if (drive_[i].fault()) return hardware_interface::return_type::ERROR;",
        "a drive fault is reported to the controller manager, which will deactivate the controllers.",
      ],
      ["  }", "all three axes read."],
      ["  return hardware_interface::return_type::OK;", "the read succeeded."],
      ["}", "end of read()."],
      ["", ""],
      [
        "hardware_interface::return_type GantryHardware::write(const rclcpp::Time &, const rclcpp::Duration &) {",
        "called every control cycle to command the drives.",
      ],
      ["  for (size_t i = 0; i < 3; ++i) {", "the three axes."],
      [
        "    const double safe = std::clamp(cmd_[i], low_[i], high_[i]);",
        "never send a target outside the soft limits, whatever the controller asks for.",
      ],
      ["    drive_[i].set_target(safe);", "send the position target to the drive."],
      ["  }", "all commands sent."],
      ["  return hardware_interface::return_type::OK;", "the write succeeded."],
      ["}", "end of write()."],
    ),
    walk: [
      "Returning ERROR from read() is how a drive fault reaches the rest of the system.",
      "The clamp in write() is the final safety net for soft limits; the drive's own limits and hard switches sit behind it.",
      "There are no allocations or blocking calls in either function, which keeps the loop deterministic.",
    ],
    expect: [
      "With the drives simulated, joint states follow the commands and stay inside the limits.",
      "A simulated drive fault makes the controller manager deactivate the controllers.",
    ],
    fix: [
      [
        "The interface does not appear in ros2 control list_hardware_interfaces.",
        "The joint name in the URDF does not match the exported interface name. Compare both.",
      ],
      [
        "The control loop misses its deadline.",
        "The drive communication blocks. Move it to a separate thread and exchange the values through a lock-free buffer.",
      ],
    ],
    exercise:
      "Add a simulated drive class with a first-order response and use it to test the interface without hardware.",
    checklist: [
      "Faults are reported from read()",
      "Commands are clamped in write()",
      "No blocking calls in the real-time functions",
    ],
  }),
  lesson({
    title: "MoveIt Cartesian planning",
    summary:
      "Plan straight-line paths with computeCartesianPath and check that the full path was found.",
    goals: [
      "Describe what a Cartesian path is in MoveIt",
      "Compute a path through waypoints and read the achieved fraction",
      "Refuse to execute an incomplete path",
    ],
    concept: [
      "For a gantry, straight lines in Cartesian space are natural. MoveIt's computeCartesianPath takes a list of waypoints (tool poses) and an end-effector step size and returns a joint trajectory that follows the straight segments. It also returns a fraction, the share of the requested path that could be computed. A fraction of 1.0 means the whole path was found.",
      "An incomplete path (a fraction below 1.0) must not be executed, because the robot would stop somewhere in the middle of a motion that was meant to be continuous. The check on the fraction is therefore the most important line of the program. The step size sets how densely the path is sampled: small steps follow curves and corners more closely but produce more points.",
    ],
    steps: [
      "Create a list of waypoint poses for the path.",
      "Call computeCartesianPath with a 5 mm step.",
      "Check that the returned fraction equals 1.0.",
      "Execute the trajectory only when the path is complete.",
    ],
    example: cpp(
      [
        "std::vector<geometry_msgs::msg::Pose> waypoints;",
        "the tool poses the path must pass through.",
      ],
      ["waypoints.push_back(start_pose);", "begin at the current pose."],
      ["auto p = start_pose; p.position.x += 0.30;", "a copy of the start moved 0.30 m along x."],
      ["waypoints.push_back(p);", "the end of the first segment."],
      ["p.position.y += 0.20;", "then 0.20 m along y from there."],
      ["waypoints.push_back(p);", "the end of the second segment."],
      ["", ""],
      ["moveit_msgs::msg::RobotTrajectory trajectory;", "the result container."],
      [
        "const double fraction = arm.computeCartesianPath(waypoints, 0.005, trajectory);",
        "compute the path with 5 mm steps; the return value is the share (0..1) that was found.",
      ],
      ["if (fraction < 0.999) {", "the path is incomplete."],
      [
        '  RCLCPP_ERROR(node->get_logger(), "only %.0f %% of the path could be planned", fraction * 100.0);',
        "say how much was found.",
      ],
      ["  return;", "never execute part of a path."],
      ["}", "the path is complete."],
      ["arm.execute(trajectory);", "run the complete trajectory."],
    ),
    walk: [
      "The threshold 0.999 allows for rounding in the fraction, which is a floating-point number.",
      "An early return means an incomplete plan is never executed, even by mistake.",
      "The 5 mm step keeps the path straight within a small tolerance for a machine of this size.",
    ],
    expect: [
      "For a path inside the workspace the fraction is 1.0 and the trajectory is executed.",
      "If the second waypoint is outside the workspace, the log reports a partial path and nothing moves.",
    ],
    fix: [
      [
        "The fraction is always below 1.",
        "A waypoint is in collision or outside the limits. Check the waypoint list against the workspace and the planning scene.",
      ],
      [
        "The path has too many points for the controller.",
        "The step is very small. Increase it, or resample the trajectory before sending it.",
      ],
    ],
    exercise:
      "Plan a rectangular path with four segments and print the number of trajectory points and the fraction for step sizes of 1, 5 and 20 mm.",
    checklist: [
      "The fraction is checked before execution",
      "Waypoints are inside the workspace",
      "The step size fits the controller's limits",
    ],
  }),
  lesson({
    title: "Gazebo gantry simulation",
    summary: "Simulate the gantry with damped prismatic joints and initial positions in Gazebo.",
    goals: [
      "Add simulated hardware with initial joint values",
      "Add damping and friction for stable prismatic joints",
      "Verify the response against the command",
    ],
    concept: [
      "In Gazebo the gantry's prismatic joints are driven by the simulated hardware plugin, which applies the commanded position through a controller of its own. Without damping the prismatic joints can oscillate or drift, because the links are heavy and their joints are frictionless. Adding damping and a little friction in the URDF makes the simulation behave like a real, lubricated axis.",
      "Initial values can be given to each state interface, so the simulated gantry starts in a chosen position instead of the joint origin. The most useful test is a step command: send a 0.5 m target and check that the joint arrives without overshoot, then compare the response time with the real drive's specification.",
    ],
    steps: [
      "Add the simulated hardware block with three prismatic joints.",
      "Set the initial position of each joint.",
      "Add damping and friction to the joint dynamics.",
      "Send a step command to X and record the response.",
    ],
    example: xml(
      [
        '<ros2_control name="GazeboSimSystem" type="system">',
        "the simulated hardware description.",
      ],
      [
        "  <hardware><plugin>gz_ros2_control/GazeboSimSystem</plugin></hardware>",
        "use Gazebo's simulated joints.",
      ],
      ['  <joint name="x_axis">', "the X axis."],
      ['    <command_interface name="position"/>', "controllers command positions."],
      [
        '    <state_interface name="position"><param name="initial_value">0.10</param></state_interface>',
        "report position, and start 0.10 m from the origin.",
      ],
      ['    <state_interface name="velocity"/>', "report velocity too."],
      ["  </joint>", "end of the X axis."],
      ["</ros2_control>", "the Y and Z axes are declared in the same way."],
      ['<gazebo reference="x_axis">', "simulator-only settings for a joint."],
      [
        '  <dynamics damping="40.0" friction="5.0"/>',
        "viscous damping (N*s/m) and friction (N): stops the joint from ringing.",
      ],
      ["</gazebo>", "end of the simulator settings."],
    ),
    walk: [
      "The initial value lets tests start at a chosen position without moving the axis first.",
      "Damping and friction stand in for the lubricated guides and the drive's own damping.",
      "The state interfaces expose velocity, which controllers and monitors use for limit checks.",
    ],
    expect: [
      "The simulated X axis starts at 0.10 m and follows a step command without ringing.",
      "Removing the damping makes the joint oscillate visibly.",
    ],
    fix: [
      [
        "The axis is sluggish.",
        "Damping is too high. Reduce it until the response matches the real drive.",
      ],
      [
        "The bridge sways sideways.",
        "The two drives are not synchronised or the mimic joint is missing. Command only the primary joint.",
      ],
    ],
    exercise:
      "Measure the rise time of a 0.5 m step in simulation and compare it with the response you expect from the real drive.",
    checklist: [
      "Initial values are set for tests",
      "Damping is tuned to the real axis",
      "Step responses are compared with the drive's data",
    ],
  }),
  lesson({
    title: "Full warehouse gantry project",
    summary:
      "Schedule a queue of pick and put tasks for an overhead gantry to minimise travel time.",
    goals: [
      "Model the move time of a gantry with simultaneous axes",
      "Order tasks greedily by move time",
      "Track the completion of a task list with a simple state record",
    ],
    concept: [
      "An overhead gantry in a warehouse moves goods between shelf positions, a conveyor and a loading bay. A task list holds a source and a destination for each item. Because X and Y move at the same time, the move time between two points is the larger of the two axis times plus the vertical time for Z, not the sum of distances.",
      "A simple scheduler chooses the next task by the smallest time from the gantry's current position, which is a greedy approach that works well in practice. The scheduler must never reorder a task that has been started, must keep the state of every task (waiting, active, done, failed) and must handle a failed task by reporting it and going on, not by retrying forever.",
    ],
    steps: [
      "Write the move time function for the three axes.",
      "Write the task record with its state.",
      "Choose the next waiting task by the smallest move time to its source.",
      "Run a simulated queue and print the order and the total time.",
    ],
    example: hash(
      ["V = (1.0, 0.8, 0.5)", "axis speeds in m/s for x, y and z."],
      ["", ""],
      ["def move_time(a, b):", "seconds to move between two points (x, y, z) in metres."],
      ["    dx, dy, dz = (abs(b[i] - a[i]) for i in range(3))", "the distance on each axis."],
      [
        "    return max(dx / V[0], dy / V[1]) + dz / V[2]",
        "x and y run together, so the slower one counts; z is added.",
      ],
      ["", ""],
      [
        "def schedule(tasks, start):",
        "order tasks by the smallest move time from the current position.",
      ],
      [
        "    here, total, order = start, 0.0, []",
        "the current position, the elapsed time and the result.",
      ],
      [
        "    waiting = list(tasks)",
        "tasks not yet done: each is a dict with a name, a source and a destination.",
      ],
      ["    while waiting:", "until every task is scheduled."],
      [
        "        nxt = min(waiting, key=lambda t: move_time(here, t['src']))",
        "the task whose source is quickest to reach.",
      ],
      ["        waiting.remove(nxt)", "take it off the waiting list."],
      [
        "        total += move_time(here, nxt['src']) + move_time(nxt['src'], nxt['dst'])",
        "go to the source, then carry to the destination.",
      ],
      ["        here = nxt['dst']", "the gantry is now at the destination."],
      ["        order.append(nxt['name'])", "record the order."],
      ["    return order, round(total, 1)", "the schedule and the total time in seconds."],
    ),
    walk: [
      "Simultaneous axes make the move time the maximum of the two, which the function states explicitly.",
      "The scheduler never changes a task after it has been chosen, which keeps the plan predictable.",
      "The total time gives a simple number to compare schedules and layouts.",
    ],
    expect: [
      "The tasks are ordered so that nearby sources come first and the total time is lower than in list order.",
      "Adding a far-away task moves it to the end of the schedule.",
    ],
    fix: [
      [
        "Tasks starve because the greedy rule always prefers nearby ones.",
        "Add an age term that lowers the effective time of tasks that have waited a long time.",
      ],
      [
        "The real time differs from the estimate.",
        "Accelerations and settling are missing. Use a trapezoidal profile in move_time and add the gripper time per task.",
      ],
    ],
    exercise:
      "Generate 30 random tasks, compare the greedy order with the list order and report the time saved in percent.",
    checklist: [
      "Move time uses simultaneous axes",
      "Task states are tracked",
      "Failed tasks are reported and skipped",
    ],
  }),
];
