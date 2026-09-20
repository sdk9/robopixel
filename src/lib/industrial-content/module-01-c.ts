import { hash, cpp, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 01 · Section C — End-Effectors & I/O (lessons 21–30)
export const module01c: LessonSpec[] = [
  lesson({
    title: "Gripper types & selection",
    summary:
      "Choose a gripper by part, payload and cycle time and compute the grip force it needs.",
    goals: [
      "Compare parallel, angular, vacuum, magnetic and soft grippers",
      "Compute the grip force needed to hold a part while accelerating",
      "Apply a safety factor and check the gripper's rated force",
    ],
    concept: [
      "Grippers hold parts by clamping (parallel or angular fingers), by suction, by magnetism or by conforming soft fingers. The right choice depends on part shape and material, surface, weight, the needed accuracy, the cycle time and what happens if power fails. A mismatch causes dropped or damaged parts long before any control problem appears.",
      "A clamp gripper holds a part by friction. With n contact fingers, friction coefficient μ, part mass m and the peak acceleration a of the robot, the grip force per finger must be F = m·(g + a)·S / (μ·n), where S is a safety factor (typically 2 or more). Forgetting the acceleration is the most common reason parts slip during fast moves.",
    ],
    steps: [
      "Write down the part's mass, material and surface and the robot's peak acceleration.",
      "Estimate the friction coefficient between the finger pads and the part.",
      "Compute the required grip force with a safety factor of at least 2.",
      "Compare it with the gripper's rated force and decide whether the gripper is suitable.",
    ],
    example: hash(
      ["G = 9.81", "gravity in m/s^2."],
      ["", ""],
      [
        "def grip_force(mass, accel, mu, fingers=2, safety=2.0):",
        "force in newtons each finger must apply.",
      ],
      [
        "    return mass * (G + accel) * safety / (mu * fingers)",
        "friction must carry the weight plus the acceleration load, with a margin.",
      ],
      ["", ""],
      [
        "def choose(part_mass, part_is_flat, porous, needed_force, rated_force):",
        "very small rule-based selector.",
      ],
      ["    if part_is_flat and not porous:", "smooth flat parts are good for suction."],
      ["        return 'vacuum'", "suction is fast and needs no finger clearance."],
      [
        "    if needed_force <= rated_force:",
        "otherwise a clamp gripper is fine if it is strong enough.",
      ],
      ["        return 'parallel fingers'", "the standard choice for many solid parts."],
      [
        "    return 'larger gripper or form-fit fingers'",
        "the force is not enough: change the gripper or add a shape that locks the part.",
      ],
      ["", ""],
      [
        "f = grip_force(mass=0.8, accel=5.0, mu=0.3)",
        "0.8 kg part, 5 m/s^2 peak acceleration, rubber pads on metal (mu about 0.3).",
      ],
      [
        "print(round(f, 1), 'N per finger', choose(0.8, False, False, f, 60.0))",
        "prints about 39.5 N per finger, so a 60 N gripper has a comfortable reserve.",
      ],
    ),
    walk: [
      "The safety factor is part of the formula, so nobody has to remember to add it later.",
      "Acceleration appears next to gravity because a fast robot loads the part like a heavier weight.",
      "The selector returns the reason to change the gripper, which is more useful than a bare yes or no.",
    ],
    expect: [
      "The printed force is about 39.5 N per finger for the 0.8 kg part.",
      "Doubling the acceleration raises the required force, which shows why speed is limited when a part is only lightly gripped.",
    ],
    fix: [
      [
        "Parts slip during fast moves.",
        "Recalculate with the real peak acceleration, use pads with more friction, or slow the move near release.",
      ],
      [
        "Parts are marked or crushed.",
        "The grip force is far above the requirement. Reduce the force setting or use soft pads.",
      ],
    ],
    exercise:
      "Add a check for maximum allowed force on delicate parts (for example 20 N) and make choose() return a soft gripper if the required force exceeds it.",
    checklist: [
      "Acceleration is part of the force calculation",
      "A safety factor of at least 2 is used",
      "The gripper's rated force is compared with the requirement",
    ],
  }),
  lesson({
    title: "Suction systems",
    summary: "Size vacuum cups from pressure, area and safety factor and detect a lost part.",
    goals: [
      "Compute the holding force of a suction cup",
      "Apply the safety factor for orientation and acceleration",
      "Detect a lost or missing part with the vacuum level",
    ],
    concept: [
      "A suction cup holds because the air pressure outside is higher than inside. The holding force is F = ΔP · A, where ΔP is the vacuum level (for example 60 kPa) and A is the seal area, π·d²/4 for a round cup. Porous or rough surfaces leak, which lowers the achieved vacuum.",
      "The load must be lifted with a large margin: at least 2 for a vertical lift and 4 or more if the part is pulled sideways or accelerated hard. The vacuum sensor is also a part detector: when the part is on the cup the vacuum rises and stays; when it is lost the vacuum drops. That reading should stop the motion.",
    ],
    steps: [
      "Compute the area of one 30 mm cup and the holding force at 60 kPa.",
      "Divide by the weight-plus-acceleration load to get the safety factor.",
      "Add the check that requires a minimum vacuum before the arm may lift.",
      "Add a monitor that stops the motion if the vacuum drops during transport.",
    ],
    example: hash(
      ["import math", "for the cup area."],
      ["", ""],
      ["def cup_force(diameter_m, vacuum_pa, cups=1):", "holding force of the cups in newtons."],
      ["    area = math.pi * diameter_m**2 / 4", "seal area of one round cup."],
      [
        "    return vacuum_pa * area * cups",
        "force = pressure difference x area x number of cups.",
      ],
      ["", ""],
      [
        "def safe_to_lift(mass, accel, diameter_m, vacuum_pa, cups=1, factor=4.0):",
        "does the suction hold the part with enough margin?",
      ],
      ["    load = mass * (9.81 + accel)", "weight plus the load from the robot's acceleration."],
      [
        "    return cup_force(diameter_m, vacuum_pa, cups) >= factor * load",
        "require a margin of 4 for sideways and accelerated loads.",
      ],
      ["", ""],
      [
        "def vacuum_ok(reading_kpa, min_kpa=40.0):",
        "part-present check used before and during the lift.",
      ],
      [
        "    return reading_kpa >= min_kpa",
        "below the limit means a leak or a lost part: stop the arm.",
      ],
      ["", ""],
      [
        "print(round(cup_force(0.03, 60000), 1), safe_to_lift(1.5, 3.0, 0.03, 60000))",
        "42.4 N for one cup, but a 1.5 kg part needs 4 x 19.2 N = 76.9 N, so this prints False.",
      ],
    ),
    walk: [
      "The area grows with the square of the diameter, so a slightly bigger cup gives much more force.",
      "The factor of 4 is written as a default so it is applied every time, not remembered.",
      "vacuum_ok() is the safety net: calculations can be wrong, but a measured vacuum tells the truth.",
    ],
    expect: [
      "One 30 mm cup prints about 42.4 N and the safety check returns False for a 1.5 kg part.",
      "Using two cups (84.8 N) makes the check return True.",
    ],
    fix: [
      [
        "Parts fall during transport.",
        "The surface leaks or the safety factor is too small. Use larger or more cups, a softer seal and a vacuum check that stops motion.",
      ],
      [
        "Vacuum never reaches the setpoint.",
        "Check hoses, the generator's supply pressure and the seal on rough or porous parts.",
      ],
    ],
    exercise:
      "Design a four-cup layout for a 2 kg flat sheet at 5 m/s² acceleration and show the safety factor for each cup count from one to six.",
    checklist: [
      "The safety factor is at least 2, and 4 for sideways loads",
      "The vacuum level is monitored during transport",
      "A lost part stops the motion",
    ],
  }),
  lesson({
    title: "Welding & soldering tools",
    summary: "Generate a straight weld seam with torch angle, travel speed and arc timing.",
    goals: [
      "Describe the process parameters of arc welding and soldering",
      "Generate seam waypoints along a line with a torch offset",
      "Sequence arc on, travel and arc off safely",
    ],
    concept: [
      "Welding and soldering robots hold a tool at a controlled angle and move it along a seam at a constant speed. The main parameters are travel speed, torch angle (work angle and travel angle), stick-out (distance to the work) and the electrical settings, which belong to the power source. A constant speed and stick-out give a constant bead.",
      "The robot program orders events: approach, arc start with a short delay, travel along the seam, arc end (with a crater fill) and retreat. Gas flow and arc signals are digital outputs and inputs, and the arc must never be started while the robot is moving fast or off the seam. Welding cells also need fume extraction, screens and certified safety devices, which this lesson does not replace.",
    ],
    steps: [
      "Define the seam start and end points in the work frame.",
      "Generate waypoints along the line at a fixed spacing.",
      "Add the torch angle and stick-out as a fixed offset from the seam.",
      "Write the sequence: approach, arc on, travel, arc off, retreat.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vector maths."],
      ["", ""],
      [
        "def seam(start, end, spacing=0.005, stick_out=0.012):",
        "waypoints (metres) along a straight seam.",
      ],
      [
        "    start, end = np.array(start, float), np.array(end, float)",
        "convert the endpoints to vectors.",
      ],
      ["    length = np.linalg.norm(end - start)", "total seam length."],
      [
        "    n = max(2, round(length / spacing) + 1)",
        "number of points at the chosen spacing (at least two).",
      ],
      ["    direction = (end - start) / length", "unit vector along the seam."],
      ["    up = np.array([0.0, 0.0, 1.0])", "torch offset direction: away from the work surface."],
      [
        "    return [start + direction * s + up * stick_out for s in np.linspace(0, length, n)]",
        "points along the seam lifted by the stick-out distance.",
      ],
      ["", ""],
      [
        "def weld_program(points, speed=0.008):",
        "ordered steps for the robot and the welding power source.",
      ],
      [
        "    return [('move_fast', points[0]), ('arc_on', None), ('move_line', points[-1], speed), ('arc_off', None), ('retreat', None)]",
        "arc on only at the start point, travel at the weld speed, arc off at the end.",
      ],
      ["", ""],
      [
        "print(len(seam([0.4, 0.0, 0.2], [0.6, 0.0, 0.2])))",
        "a 20 cm seam at 5 mm spacing gives 41 waypoints.",
      ],
    ),
    walk: [
      "A constant spacing with a constant speed gives a constant weld speed, which controls bead quality.",
      "The stick-out offset is applied along a fixed direction; a real program also tilts the torch by the work angle.",
      "The arc is only switched inside the sequence, never in the middle of a fast move.",
    ],
    expect: [
      "The seam function returns 41 waypoints for a 20 cm seam at 5 mm spacing.",
      "The program list starts with a fast approach and ends with the arc off and a retreat.",
    ],
    fix: [
      [
        "The bead is uneven.",
        "The speed or stick-out changes along the path. Check the path spacing, speed limits at corners and the fixture position.",
      ],
      [
        "The arc fails to start.",
        "Check gas, wire feed and the arc-start delay; the robot should wait for the arc-established signal before moving.",
      ],
    ],
    exercise:
      "Add a work angle of 10 degrees to the torch offset and produce the pose (position and orientation) for each waypoint.",
    checklist: [
      "Speed and stick-out stay constant along the seam",
      "The arc is switched only at the start and end points",
      "Fume extraction and welding safety devices are part of the cell design",
    ],
  }),
  lesson({
    title: "Force/torque sensors",
    summary: "Read a six-axis force/torque sensor, remove its bias and subtract the tool's weight.",
    goals: [
      "Explain what a six-axis F/T sensor measures",
      "Zero (tare) the sensor and compensate the tool weight",
      "Read the wrench in a ROS 2 node",
    ],
    concept: [
      "A force/torque (F/T) sensor mounted between the flange and the tool measures three forces and three torques, called a wrench. It shows how hard the tool pushes on a part, which is essential for polishing, insertion and safe contact. The raw reading includes an electrical bias and the weight of the tool, and both must be removed.",
      "Taring means averaging a few hundred samples while nothing touches the tool and storing that average as the bias. Weight compensation then rotates the known tool weight into the sensor frame and subtracts it, because the weight's direction changes with the arm pose. In ROS 2 the wrench arrives as a geometry_msgs/WrenchStamped message.",
    ],
    steps: [
      "Start the driver of the sensor (or a simulated one) and confirm that the wrench topic is publishing.",
      "Average 200 samples with a free tool to get the bias.",
      "Subtract the bias from every new reading.",
      "Press on the tool by hand and confirm that the force reading changes in the right direction.",
    ],
    example: cpp(
      [
        "class ForceMonitor : public rclcpp::Node {",
        "a node that tares and reports the force on the tool.",
      ],
      ["public:", "the constructor starts the subscription."],
      ['  ForceMonitor() : Node("force_monitor") {', "give the node a name."],
      [
        "    sub_ = create_subscription<geometry_msgs::msg::WrenchStamped>(",
        "listen to the sensor's wrench topic.",
      ],
      [
        '      "wrench", rclcpp::SensorDataQoS(), [this](geometry_msgs::msg::WrenchStamped::SharedPtr msg) { on_wrench(*msg); });',
        "sensor QoS drops old data instead of queueing it; each message goes to on_wrench.",
      ],
      ["  }", "end of the constructor."],
      ["private:", "internal state and callback."],
      [
        "  void on_wrench(const geometry_msgs::msg::WrenchStamped & msg) {",
        "called for every new reading.",
      ],
      ["    if (samples_ < 200) {", "the first 200 samples are used to find the bias."],
      [
        "      bias_x_ += msg.wrench.force.x / 200.0; bias_y_ += msg.wrench.force.y / 200.0; bias_z_ += msg.wrench.force.z / 200.0;",
        "add each sample's share of the average.",
      ],
      ["      ++samples_; return;", "count the sample and wait for the next one."],
      ["    }", "the bias is now known."],
      [
        "    const double fz = msg.wrench.force.z - bias_z_;",
        "vertical force with the bias removed.",
      ],
      [
        '    if (fz < -20.0) RCLCPP_WARN(get_logger(), "pressing with %.1f N: above the 20 N limit", -fz);',
        "warn when the tool pushes harder than allowed, so a controller can back off.",
      ],
      ["  }", "end of the callback."],
      [
        "  rclcpp::Subscription<geometry_msgs::msg::WrenchStamped>::SharedPtr sub_;",
        "keep the subscription alive.",
      ],
      [
        "  double bias_x_{0}, bias_y_{0}, bias_z_{0}; int samples_{0};",
        "bias sums and the sample count.",
      ],
      ["};", "end of the class."],
    ),
    walk: [
      "Averaging 200 samples cuts noise so the bias is stable, but the tool must be free of contact during that time.",
      "The QoS profile is for sensor data: the newest reading is more useful than a queue of old ones.",
      "This code removes the bias only. A complete version also subtracts the tool weight rotated into the sensor frame.",
    ],
    expect: [
      "With no contact, the corrected force stays near zero.",
      "Pressing down produces a negative fz and a warning above 20 N.",
    ],
    fix: [
      [
        "The force reading drifts slowly.",
        "Temperature and cable movement cause drift. Tare again before each task and keep the cable strain-relieved.",
      ],
      [
        "The force changes when the arm rotates.",
        "The tool weight is not compensated. Rotate the tool weight into the sensor frame and subtract it.",
      ],
    ],
    exercise:
      "Estimate the tool mass from readings taken in two orientations, then subtract the compensated weight from live readings.",
    checklist: [
      "The sensor is tared with a free tool",
      "Tool weight is compensated per pose",
      "A force limit stops or backs off the robot",
    ],
  }),
  lesson({
    title: "Tool changers",
    summary: "Sequence a safe tool change with lock confirmation and an updated TCP.",
    goals: [
      "Describe the parts of a robot tool changer",
      "Write the change sequence with sensor confirmation",
      "Switch the tool frame only after a verified lock",
    ],
    concept: [
      "A tool changer has a master plate on the robot and a tool plate on each tool. It locks with a pneumatic piston and passes air, electrical signals and sometimes force sensing through the coupling. A change takes the tool to its stand, unlocks, backs away, moves to the next tool, locks and checks.",
      "The dangerous mistakes are moving while a tool is unlocked and using the wrong TCP after the change. The sequence therefore uses sensors: 'tool present', 'locked' and 'unlocked' signals must agree before the next step. Only after a verified lock is the tool frame (TCP and mass) switched in the controller.",
    ],
    steps: [
      "List the sensors: tool-in-stand, master locked, master unlocked.",
      "Write the states of the change as a state machine with a timeout for each.",
      "Add the tool frame and payload update as the last step, after the lock check.",
      "Test a forced fault: keep the locked sensor false and confirm the sequence stops.",
    ],
    example: hash(
      ["import time", "for timeouts."],
      ["", ""],
      [
        "TOOLS = {'gripper': {'tcp': (0, 0, 0.14), 'mass': 0.9}, 'welder': {'tcp': (0, 0, 0.22), 'mass': 2.4}}",
        "each tool has its own TCP offset (m) and mass (kg).",
      ],
      ["", ""],
      [
        "def wait_for(condition, timeout=3.0):",
        "poll a sensor until it becomes true or the time runs out.",
      ],
      ["    end = time.time() + timeout", "deadline for this step."],
      ["    while time.time() < end:", "keep checking."],
      ["        if condition():", "sensor confirms the state."],
      ["            return True", "step succeeded."],
      ["        time.sleep(0.01)", "check every 10 ms without using all of the CPU."],
      ["    return False", "timeout: report failure, never assume success."],
      ["", ""],
      ["def pick_tool(robot, name):", "attach the named tool safely."],
      ["    robot.move_to(f'stand_{name}_above')", "approach the tool stand from above."],
      ["    robot.move_linear(f'stand_{name}')", "go straight into the tool plate."],
      ["    robot.io.lock()", "command the changer to lock."],
      ["    if not wait_for(robot.io.locked):", "did the locked sensor confirm it?"],
      [
        "        robot.stop(); raise RuntimeError('tool not locked, motion stopped')",
        "no lock means no motion: stop and report.",
      ],
      [
        "    robot.set_tool(TOOLS[name]['tcp'], TOOLS[name]['mass'])",
        "only now update the TCP and payload.",
      ],
      ["    robot.move_linear(f'stand_{name}_above')", "lift the tool out of the stand."],
    ),
    walk: [
      "Every physical action has a sensor check, so software never assumes the coupling did what it was told.",
      "The TCP and mass change happens after the lock is verified, never before.",
      "A timeout with a clear exception makes a stuck sensor a visible fault rather than a hang.",
    ],
    expect: [
      "With a working lock signal the sequence ends with the new tool set and lifted from the stand.",
      "With the locked sensor forced false the robot stops and the exception message names the problem.",
    ],
    fix: [
      [
        "The robot moves with a wrong TCP after a change.",
        "The tool frame was set before the lock check or not updated. Move the update to the end of the sequence and log it.",
      ],
      [
        "The lock signal flickers.",
        "Filter the input for 50–100 ms and require a stable value before continuing.",
      ],
    ],
    exercise:
      "Write the matching drop_tool(name) sequence, including a check that the tool is present in the stand before unlocking.",
    checklist: [
      "Each step has a sensor confirmation",
      "TCP and mass update only after a verified lock",
      "Timeouts stop the robot with a clear message",
    ],
  }),
  lesson({
    title: "Digital & analog I/O",
    summary: "Expose digital and analog signals to ros2_control and scale a 4–20 mA sensor value.",
    goals: [
      "Explain digital, analog and fieldbus I/O in a robot cell",
      "Declare GPIO interfaces in a ros2_control description",
      "Scale a 4–20 mA signal into engineering units",
    ],
    concept: [
      "Digital I/O carries on/off signals such as valve commands, door switches and part sensors. Analog I/O carries continuous values: 0–10 V or 4–20 mA from pressure, distance or force sensors. In ros2_control, extra signals that are not joints are described as GPIO interfaces on the hardware, so controllers and nodes can read and command them like any other interface.",
      "A 4–20 mA loop encodes the value in the current, with 4 mA meaning zero and 20 mA meaning full scale. A reading below about 3.6 mA usually means a broken wire, which is a fault, not a low value. Scaling must include that fault check, and outputs that drive actuators need a safe default state on start-up and on communication loss.",
    ],
    steps: [
      "List the cell signals with names, direction, type and safe default.",
      "Declare the digital output and input as GPIO interfaces in the ros2_control block.",
      "Write the scaling function for a 4–20 mA pressure sensor with a wire-break check.",
      "Test the scaling at 4, 12 and 20 mA and at 2 mA.",
    ],
    example: xml(
      ['<ros2_control name="tool_io" type="system">', "a hardware block for the tool's signals."],
      ["  <hardware>", "which driver provides the signals."],
      [
        "    <plugin>mock_components/GenericSystem</plugin>",
        "a mock driver for simulation; replace it with the real fieldbus driver later.",
      ],
      ["  </hardware>", "end of the driver section."],
      ['  <gpio name="flange_io">', "a group of general-purpose signals."],
      [
        '    <command_interface name="digital_output_1"/>',
        "an output controllers may write, for example the gripper valve.",
      ],
      [
        '    <state_interface name="digital_input_1"/>',
        "an input controllers may read, for example the part sensor.",
      ],
      [
        '    <state_interface name="analog_input_1"/>',
        "an analog reading, for example the pressure sensor.",
      ],
      ["  </gpio>", "end of the signal group."],
      ["</ros2_control>", "end of the hardware block."],
    ),
    walk: [
      "Command interfaces are written, state interfaces are read; that split keeps outputs and inputs from being confused.",
      "The mock driver lets you develop and test the whole cell logic before any real hardware exists.",
      "The scaling function for the analog value belongs in the node that uses it and is shown in the exercise below.",
    ],
    expect: [
      "After launching, the new interfaces appear in ros2 control list_hardware_interfaces.",
      "A scaling check returns 0 % at 4 mA, 50 % at 12 mA, 100 % at 20 mA and a fault at 2 mA.",
    ],
    fix: [
      [
        "The interface is not listed.",
        "The name in the controller configuration must match the gpio name and the interface name exactly.",
      ],
      [
        "The output changes on start-up.",
        "Define a safe initial state in the driver and do not enable controllers that write outputs until the cell is ready.",
      ],
    ],
    exercise:
      "Write scale_4_20(ma, low, high) that returns the value in engineering units and raises an error below 3.6 mA or above 21 mA. Test it with the four values in the steps.",
    checklist: [
      "Every signal has a safe default",
      "Analog input has a wire-break check",
      "Interface names match the controller configuration",
    ],
  }),
  lesson({
    title: "Conveyor integration",
    summary:
      "Track parts on a moving conveyor from encoder counts and predict when they reach the pick window.",
    goals: [
      "Convert encoder counts to conveyor speed and position",
      "Predict a part's position at a future time",
      "Compensate for camera and control latency",
    ],
    concept: [
      "A conveyor encoder counts pulses as the belt moves. Dividing the count change by the time and the counts per metre gives belt speed, and multiplying the total counts gives the distance moved. When a camera or sensor sees a part at time t0 and position x0, the part will be at x0 + v·(t − t0) at any later time t, which lets the robot meet it.",
      "Latency matters: the image is old by the time it is processed, and the robot needs time to move. Use the timestamp of the sensor reading, not the time the message arrived, and predict to the time the gripper will arrive. Tracking loses accuracy if the belt speed changes, so speed should be read continuously, not assumed constant.",
    ],
    steps: [
      "Read the encoder counts and convert them to metres with the counts-per-metre constant.",
      "Compute belt speed from counts and time.",
      "Store the position and timestamp when a part is detected.",
      "Predict the arrival time at the pick window and check that the robot can reach it in time.",
    ],
    example: hash(
      ["COUNTS_PER_M = 40000.0", "encoder counts for one metre of belt travel (from calibration)."],
      ["", ""],
      ["class Conveyor:", "tracks the belt from encoder readings."],
      ["    def __init__(self):", "start with an empty state."],
      ["        self.last_count = None", "the previous reading."],
      ["        self.last_time = None", "the timestamp of the previous reading."],
      ["        self.speed = 0.0", "belt speed in m/s."],
      ["        self.position = 0.0", "belt travel in metres since start."],
      ["", ""],
      [
        "    def update(self, count, t):",
        "call with each new encoder reading and its timestamp (seconds).",
      ],
      [
        "        if self.last_count is not None and t > self.last_time:",
        "we need a previous reading to compute a speed.",
      ],
      [
        "            self.speed = (count - self.last_count) / COUNTS_PER_M / (t - self.last_time)",
        "counts to metres, divided by the elapsed time.",
      ],
      [
        "            self.position += (count - self.last_count) / COUNTS_PER_M",
        "add the distance moved in this step.",
      ],
      [
        "        self.last_count, self.last_time = count, t",
        "remember this reading for the next update.",
      ],
      ["", ""],
      [
        "    def time_until(self, part_pos_at_detect, detect_pos, target_pos):",
        "seconds until a part reaches a target position on the belt.",
      ],
      [
        "        part_now = part_pos_at_detect + (self.position - detect_pos)",
        "how far the part has travelled since it was detected.",
      ],
      [
        "        return (target_pos - part_now) / self.speed if self.speed > 0 else None",
        "distance to go divided by the speed; no answer if the belt is stopped.",
      ],
    ),
    walk: [
      "Position comes from counts, not from integrating a guessed speed, so it does not drift when the speed changes.",
      "time_until() works from the position at detection, so the delay between camera and robot is handled by design.",
      "Returning None for a stopped belt forces the caller to handle that case explicitly.",
    ],
    expect: [
      "At a constant belt speed the computed speed equals the real speed within the encoder resolution.",
      "A part detected 0.3 m before the pick window on a 0.2 m/s belt reports 1.5 seconds until it arrives.",
    ],
    fix: [
      [
        "Parts are picked a few centimetres too early or late.",
        "Check COUNTS_PER_M with a tape measure, and include the camera latency using timestamps.",
      ],
      [
        "The speed estimate is noisy.",
        "Average or filter the speed over several updates, but keep the position from raw counts.",
      ],
    ],
    exercise:
      "Simulate a belt whose speed changes by 10 % and compare the pick-position error of a constant-speed prediction against your position-based one.",
    checklist: [
      "Position comes from encoder counts",
      "Timestamps are used, not arrival times",
      "A stopped belt is handled explicitly",
    ],
  }),
  lesson({
    title: "Vision-guided pick & place",
    summary:
      "Convert a pixel and a depth into a point in the robot base frame using camera intrinsics and hand–eye calibration.",
    goals: [
      "Deproject a pixel to a 3D point with the pinhole model",
      "Transform the point from the camera frame into the robot base frame",
      "Add an approach offset and check the point is reachable",
    ],
    concept: [
      "A camera sees pixels; the robot needs metres in its base frame. With intrinsics (focal lengths fx, fy and centre cx, cy) and a depth Z, a pixel (u, v) becomes the camera-frame point X = (u − cx)·Z/fx, Y = (v − cy)·Z/fy. Then the hand–eye transform T_base_camera moves that point into the robot's base frame.",
      "The hand–eye transform comes from calibration (next lesson). After conversion, add an approach offset above the part, check that the point is in the reachable workspace and inside the safety envelope, and only then command the move. Any error in intrinsics, depth or calibration shows up as a consistent offset at the gripper.",
    ],
    steps: [
      "Read the camera intrinsics from the camera info topic.",
      "Deproject the pixel and depth of a detected part into the camera frame.",
      "Transform the point with T_base_camera into the base frame.",
      "Create the approach point 10 cm above and verify it is reachable before planning.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the transform."],
      ["", ""],
      [
        "def deproject(u, v, z, fx, fy, cx, cy):",
        "pixel plus depth to a 3D point in the camera frame (metres).",
      ],
      [
        "    return np.array([(u - cx) * z / fx, (v - cy) * z / fy, z])",
        "pinhole model: the further away the point, the more one pixel is worth.",
      ],
      ["", ""],
      ["def to_base(p_cam, T_base_cam):", "express a camera-frame point in the robot base frame."],
      [
        "    return (T_base_cam @ np.append(p_cam, 1.0))[:3]",
        "append 1 to make it homogeneous, apply the 4x4 transform, drop the extra element.",
      ],
      ["", ""],
      [
        "def pick_targets(u, v, z, K, T_base_cam, approach=0.10):",
        "the two points the robot must visit.",
      ],
      [
        "    p_cam = deproject(u, v, z, K['fx'], K['fy'], K['cx'], K['cy'])",
        "part position in the camera frame.",
      ],
      ["    grasp = to_base(p_cam, T_base_cam)", "the same point in the base frame."],
      [
        "    above = grasp + np.array([0.0, 0.0, approach])",
        "a point straight above the grasp, so the tool approaches vertically.",
      ],
      ["    return above, grasp", "visit 'above' first, then 'grasp'."],
    ),
    walk: [
      "Each step is a small pure function, so the camera model and the calibration can be tested separately.",
      "Approaching from above avoids sweeping the gripper sideways through neighbouring parts.",
      "The returned points still need the reach and safety-envelope checks from the earlier lessons.",
    ],
    expect: [
      "A pixel at the image centre with depth 0.5 m gives a camera point of (0, 0, 0.5).",
      "The base-frame point matches the position you measure by hand within the calibration accuracy.",
    ],
    fix: [
      [
        "The gripper always misses by a fixed offset.",
        "The hand-eye calibration or the depth reference is off. Recalibrate and check that depth is measured to the object's top surface.",
      ],
      [
        "The error grows toward the image edges.",
        "Lens distortion is not corrected. Undistort the pixel with the camera's distortion coefficients before deprojection.",
      ],
    ],
    exercise:
      "Detect the same part from two camera poses and compare the two base-frame results; the difference is a direct measure of your calibration error.",
    checklist: [
      "Intrinsics and distortion are applied",
      "The hand-eye transform is calibrated",
      "Reach and safety checks run before planning",
    ],
  }),
  lesson({
    title: "Calibration with fiducials",
    summary:
      "Find a marker's pose with OpenCV ArUco detection and use it for hand–eye calibration.",
    goals: [
      "Detect an ArUco marker and estimate its pose in the camera frame",
      "Explain the hand–eye calibration setup (eye-in-hand or eye-to-hand)",
      "Judge calibration quality with a reprojection or repeat error",
    ],
    concept: [
      "A fiducial is a printed marker with a known size and pattern, such as an ArUco square. Detecting its four corners gives the marker's pose relative to the camera through a perspective-n-point solution (solvePnP). Because the marker's real size is known, the pose has a true metric scale.",
      "For hand–eye calibration the robot moves through 10–20 varied poses while the camera records the marker. Comparing how the marker moves in the camera with how the flange moves in the base gives the fixed camera–flange (eye-in-hand) or camera–base (eye-to-hand) transform. OpenCV's calibrateHandEye solves it, and the residual error after calibration tells you whether it can be trusted.",
    ],
    steps: [
      "Print a marker and measure its side length precisely.",
      "Detect the marker and compute its pose with solvePnP.",
      "Record the marker pose and the flange pose for at least 12 varied robot poses.",
      "Run the hand-eye solver and check the consistency of the result.",
    ],
    example: hash(
      ["import cv2, numpy as np", "OpenCV for detection and pose, numpy for arrays."],
      ["", ""],
      ["SIDE = 0.05", "the marker's printed side length in metres (measure it!)."],
      [
        "OBJ = np.array([[-SIDE/2, SIDE/2, 0], [SIDE/2, SIDE/2, 0], [SIDE/2, -SIDE/2, 0], [-SIDE/2, -SIDE/2, 0]], np.float32)",
        "the four marker corners in the marker's own frame.",
      ],
      [
        "detector = cv2.aruco.ArucoDetector(cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50), cv2.aruco.DetectorParameters())",
        "a detector for a common 4x4 marker dictionary.",
      ],
      ["", ""],
      [
        "def marker_pose(image, K, dist):",
        "returns (rotation vector, translation vector) or None.",
      ],
      ["    corners, ids, _ = detector.detectMarkers(image)", "find all markers in the image."],
      ["    if ids is None:", "no marker visible."],
      ["        return None", "the caller must skip this pose."],
      [
        "    ok, rvec, tvec = cv2.solvePnP(OBJ, corners[0][0], K, dist)",
        "pose of the first marker from its four image corners and the camera model.",
      ],
      [
        "    return (rvec, tvec) if ok else None",
        "give the pose back only if the solver succeeded.",
      ],
      ["", ""],
      [
        "# After 12+ poses: R_g2b, t_g2b (flange in base) and R_t2c, t_t2c (marker in camera)",
        "collect the two pose lists at the same instants.",
      ],
      [
        "# R, t = cv2.calibrateHandEye(R_g2b, t_g2b, R_t2c, t_t2c)",
        "solve the fixed camera-to-flange transform (eye-in-hand).",
      ],
    ),
    walk: [
      "The corner order in OBJ must match the detector's corner order, or the pose will be mirrored.",
      "Returning None for a missing marker lets the calibration loop skip bad frames instead of crashing.",
      "Calibration quality depends on pose variety: include large rotations about several axes, not just translations.",
    ],
    expect: [
      "At 0.5 m distance the marker's translation vector has a z value near 0.5 within a few millimetres.",
      "After calibration, marker positions transformed into the base frame agree within about a millimetre or two.",
    ],
    fix: [
      [
        "Poses jump between frames.",
        "The marker is small or blurry in the image. Use a larger marker, better lighting and a camera focus that fits the working distance.",
      ],
      [
        "Hand-eye result varies between runs.",
        "The robot poses are too similar. Add poses with large rotations and make sure the marker is fixed and flat.",
      ],
    ],
    exercise:
      "Perform the calibration twice with different pose sets and compute the difference between the two camera-to-flange transforms in millimetres and degrees.",
    checklist: [
      "The marker size is measured, not assumed",
      "At least 12 varied robot poses are used",
      "The result is validated with an independent check",
    ],
  }),
  lesson({
    title: "Quality inspection workflows",
    summary:
      "Turn measurements into pass or fail decisions with tolerances and a process-capability check.",
    goals: [
      "Define tolerance limits and a pass/fail rule",
      "Compute the mean, standard deviation and Cpk of a measurement series",
      "Route parts to accept, rework or reject bins",
    ],
    concept: [
      "An inspection compares a measured value with a specification: a nominal size and a tolerance band with a lower and an upper limit. A robot workflow repeats measure, decide, act: bring the part to the camera or gauge, evaluate, and move it to the accept or reject location. Every measurement should be recorded with time, part ID and result.",
      "Individual pass/fail results hide drift. Process capability, Cpk = min(USL − mean, mean − LSL) / (3σ), shows whether the whole process is comfortably inside the limits: values above about 1.33 are usually considered good, and below 1.0 means parts will fail. The measurement system itself must also be capable, or the numbers are noise.",
    ],
    steps: [
      "Define the nominal value and the lower and upper specification limits.",
      "Measure 30 parts and store the values.",
      "Compute the mean, standard deviation and Cpk.",
      "Write the routing rule: accept, rework or reject.",
    ],
    example: hash(
      ["import statistics", "mean and standard deviation."],
      ["", ""],
      ["LSL, USL = 9.95, 10.05", "specification limits in millimetres: 10.00 mm +/- 0.05 mm."],
      ["", ""],
      ["def decide(value):", "one part's route."],
      ["    if LSL <= value <= USL:", "inside the tolerance band."],
      ["        return 'accept'", "goes to the good bin."],
      [
        "    if LSL - 0.03 <= value < LSL or USL < value <= USL + 0.03:",
        "just outside the band: might be fixed.",
      ],
      ["        return 'rework'", "goes to the rework station."],
      ["    return 'reject'", "clearly out of tolerance: scrap."],
      ["", ""],
      ["def cpk(values):", "how comfortably the process fits inside the limits."],
      [
        "    mean, sd = statistics.mean(values), statistics.stdev(values)",
        "centre and spread of the measurements.",
      ],
      [
        "    return min(USL - mean, mean - LSL) / (3 * sd)",
        "the smaller distance from the mean to a limit, in units of three standard deviations.",
      ],
      ["", ""],
      [
        "values = [10.00, 10.01, 9.99, 10.00, 10.01, 9.99, 10.00, 10.01, 10.00, 9.99]",
        "example measurements in mm.",
      ],
      [
        "print([decide(v) for v in values[:3]], round(cpk(values), 2))",
        "all accepted, and a Cpk of about 2.0 (a very capable process).",
      ],
    ),
    walk: [
      "The rework band gives a third outcome, which avoids scrapping parts that could be corrected.",
      "Cpk uses the closest limit, so it also penalises an off-centre process, not just a wide one.",
      "Ten samples are only a demonstration; use at least 30 measurements for a meaningful Cpk.",
    ],
    expect: [
      "The three sample parts are accepted and Cpk is about 2.0.",
      "Shifting all values up by 0.03 mm lowers Cpk to about 0.8, showing that the process is off-centre.",
    ],
    fix: [
      [
        "Good parts are rejected.",
        "The measurement system may be biased. Check with a certified reference piece and recalibrate the camera or gauge.",
      ],
      [
        "Cpk looks fine but customers complain.",
        "The sample is too small or not representative. Sample over several shifts and materials.",
      ],
    ],
    exercise:
      "Log every measurement with a timestamp and part ID to a CSV file, then compute a rolling Cpk over the last 30 parts and raise a warning when it falls below 1.33.",
    checklist: [
      "Limits come from the drawing or specification",
      "Every result is recorded with an ID and time",
      "Capability is monitored, not only single results",
    ],
  }),
];
