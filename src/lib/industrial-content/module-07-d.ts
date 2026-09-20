import { hash, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 07 · Autonomous Mobile Robot (AMR) — Section D: ROS 2 & Deployment (lessons 31–40)
export const module07d: LessonSpec[] = [
  lesson({
    title: "URDF AMR modeling",
    summary:
      "Describe the chassis, two drive wheels, a caster and the LiDAR in a URDF with realistic dimensions.",
    goals: [
      "Model the base, the wheels and the sensor mounts",
      "Use continuous joints for the drive wheels",
      "Verify the geometry against the kinematics constants",
    ],
    concept: [
      "The URDF of an AMR is simple, but its numbers matter because the navigation stack and the controllers read them: the wheel radius and the separation of the drive wheels (the track) define the odometry, the footprint defines what fits in an aisle and the sensor positions define every map. The wheels are continuous joints: they rotate without limits about a horizontal axis.",
      "A caster wheel only keeps the chassis level; it is often modelled as a low-friction sphere in the simulator and does not need a joint. The robot's base_link is usually placed at the centre of the drive axle, on the floor or at axle height, and every other frame is measured from it. Keep the values in one place (xacro properties) so the URDF, the controller configuration and the odometry use the same numbers.",
    ],
    steps: [
      "Write the base link with the chassis box and its mass.",
      "Add the two drive wheels as continuous joints at the track distance.",
      "Add the LiDAR link on the top of the chassis.",
      "Check the wheel separation and radius against the controller configuration.",
    ],
    example: xml(
      ['<link name="base_link">', "the chassis, with its origin at the centre of the drive axle."],
      [
        '  <visual><origin xyz="0 0 0.10"/><geometry><box size="0.70 0.50 0.20"/></geometry></visual>',
        "a 70 x 50 x 20 cm box, raised so it clears the floor.",
      ],
      [
        '  <collision><origin xyz="0 0 0.10"/><geometry><box size="0.70 0.50 0.20"/></geometry></collision>',
        "the same shape for collision, which is also the footprint.",
      ],
      [
        '  <inertial><mass value="60.0"/><origin xyz="0 0 0.10"/><inertia ixx="1.5" iyy="2.5" izz="3.5" ixy="0" ixz="0" iyz="0"/></inertial>',
        "mass in kg and inertia in kg*m^2 for the simulator.",
      ],
      ["</link>", "end of the base link."],
      [
        '<joint name="left_wheel_joint" type="continuous">',
        "the left drive wheel rotates without limits.",
      ],
      ['  <parent link="base_link"/><child link="left_wheel"/>', "attached to the chassis."],
      [
        '  <origin xyz="0 0.25 0.075" rpy="-1.5708 0 0"/><axis xyz="0 0 1"/>',
        "25 cm to the left (half the 0.50 m track), at the wheel radius height, rotated so the axle is horizontal.",
      ],
      ["</joint>", "end of the left wheel joint (the right wheel is the same with y = -0.25)."],
      ['<joint name="lidar_joint" type="fixed">', "the LiDAR is fixed to the chassis."],
      ['  <parent link="base_link"/><child link="base_scan"/>', "attached to the base."],
      [
        '  <origin xyz="0.20 0 0.25" rpy="0 0 0"/>',
        "20 cm forward and 25 cm above the axle centre.",
      ],
      ["</joint>", "end of the LiDAR joint."],
    ),
    walk: [
      "The wheel joints are 0.25 m either side of the centre, so the track is 0.50 m, the same value the odometry uses.",
      "The wheel origin's height equals the wheel radius (0.075 m), so the wheel touches the floor.",
      "The collision box is the footprint used by Nav2, so it must be as large as the real robot.",
    ],
    expect: [
      "In RViz the wheels sit on the floor and rotate about the y axis when driven.",
      "tf2_echo base_link base_scan prints (0.2, 0, 0.25).",
    ],
    fix: [
      [
        "The robot drives in circles in simulation.",
        "The wheel radius or track in the controller differs from the URDF. Read both from the same source.",
      ],
      [
        "The simulated robot tips over.",
        "The centre of mass is too high or the caster is missing. Lower the mass and add a support.",
      ],
    ],
    exercise:
      "Add the caster wheel and a camera link, and check the footprint against the aisle width of your warehouse.",
    checklist: [
      "Track and wheel radius match the controller",
      "The footprint is the real size",
      "Sensor positions are measured on the robot",
    ],
  }),
  lesson({
    title: "ROS 2 control",
    summary:
      "Configure the diff_drive_controller with the wheel geometry, limits and a command timeout.",
    goals: [
      "Explain how the diff_drive_controller turns Twist commands into wheel commands",
      "Set the wheel geometry and the velocity and acceleration limits",
      "Use the command timeout as a safety feature",
    ],
    concept: [
      "The diff_drive_controller from ros2_control subscribes to velocity commands, converts them into wheel velocities with the kinematics of a differential drive, and publishes the wheel odometry and the odom to base_link transform from the wheel encoders. The hardware interface below it exposes the wheel joints; the controller only needs their names and the geometry.",
      "The command timeout is a simple safety feature: if no velocity command arrives for, say, half a second, the controller sets the velocity to zero, so a crashed navigation node stops the robot rather than leaving it driving. Velocity and acceleration limits protect the drive and the load. All numbers must be the same as in the URDF and the calibration.",
    ],
    steps: [
      "List the wheel joint names and the geometry.",
      "Set the limits for speed and acceleration.",
      "Set the command timeout to 0.5 s.",
      "Publish a Twist and check the wheel commands and the odometry.",
    ],
    example: hash(
      ["controller_manager:", "the controller manager's parameters."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ["    update_rate: 100", "run the control loop at 100 Hz."],
      ["    diff_drive_controller:", "declare the controller by name."],
      ["      type: diff_drive_controller/DiffDriveController", "the plugin that implements it."],
      ["", ""],
      ["diff_drive_controller:", "the controller's own parameters."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ['    left_wheel_names: ["left_wheel_joint"]', "the joint that drives the left side."],
      ['    right_wheel_names: ["right_wheel_joint"]', "the joint that drives the right side."],
      ["    wheel_separation: 0.50", "the track in metres, the same as in the URDF."],
      ["    wheel_radius: 0.075", "the wheel radius in metres."],
      ["    base_frame_id: base_link", "the robot frame."],
      ["    odom_frame_id: odom", "the odometry frame."],
      ["    enable_odom_tf: true", "publish the odom to base_link transform."],
      ["    cmd_vel_timeout: 0.5", "stop if no command arrives for half a second."],
      ["    linear.x.max_velocity: 1.0", "at most 1.0 m/s forward."],
      ["    linear.x.max_acceleration: 0.5", "accelerate gently: 0.5 m/s^2."],
      ["    angular.z.max_velocity: 1.5", "at most 1.5 rad/s of turning."],
    ),
    walk: [
      "The geometry values are the same numbers as in the URDF and the kinematics lesson, which is why they should come from one file.",
      "cmd_vel_timeout makes a lost command source stop the robot within half a second.",
      "The acceleration limit is what makes starts and stops smooth enough for a load on top.",
    ],
    expect: [
      "ros2 control list_controllers shows diff_drive_controller as active.",
      "Stopping the command publisher makes the robot stop within about half a second.",
    ],
    fix: [
      [
        "The robot turns too much or too little.",
        "The wheel separation is wrong. Spin the robot ten times and correct the value from the measured angle.",
      ],
      [
        "The robot keeps moving after the planner stops.",
        "The timeout is missing or very large. Set cmd_vel_timeout to a short time.",
      ],
    ],
    exercise:
      "Send a Twist of 0.3 m/s and 0.5 rad/s, print the wheel commands and check them against the diff-drive formulas.",
    checklist: [
      "Geometry is shared with the URDF",
      "A command timeout is set",
      "Limits protect the drive and the load",
    ],
  }),
  lesson({
    title: "Gazebo warehouse simulation",
    summary:
      "Build a warehouse world with shelves and floor from ready-made models and physics settings.",
    goals: [
      "Create a world with a ground plane and shelves",
      "Reuse models from Gazebo Fuel",
      "Set the physics step size for stable driving",
    ],
    concept: [
      "A simulated warehouse lets you test navigation, docking and traffic before the real robots arrive. The world is an SDF file with a ground plane, lighting and models placed at poses. Instead of modelling everything yourself, include ready-made models from Gazebo Fuel, an online library of models: shelves, pallets, boxes and even whole warehouse scenes.",
      "The physics settings decide how realistic and how fast the simulation is. A step size of 1 ms with real-time factor 1 is a good start for a wheeled robot. Make the layout match the real warehouse where it matters: aisle widths, shelf positions and floor friction. A simulated warehouse that is too clean makes tests too easy, so add clutter and moving objects later.",
    ],
    steps: [
      "Create the world file with physics and lighting.",
      "Include the shelf model at several poses to form aisles.",
      "Add pallets and boxes to some shelves.",
      "Launch the world, spawn the robot and drive along an aisle.",
    ],
    example: xml(
      ['<sdf version="1.9">', "the SDF format version."],
      ['  <world name="warehouse">', "the world's name."],
      [
        '    <physics name="1ms" type="ignored">',
        "physics settings (the type is ignored by Gazebo Sim).",
      ],
      ["      <max_step_size>0.001</max_step_size>", "simulate in steps of 1 ms."],
      ["      <real_time_factor>1.0</real_time_factor>", "try to run in real time."],
      ["    </physics>", "end of the physics settings."],
      [
        "    <include><uri>model://ground_plane</uri></include>",
        "a flat floor from the default model library.",
      ],
      ["    <include>", "a shelf from Gazebo Fuel."],
      [
        "      <uri>https://fuel.gazebosim.org/1.0/OpenRobotics/models/Shelf</uri>",
        "the online model's address.",
      ],
      [
        "      <name>shelf_1</name><pose>3 2 0 0 0 0</pose>",
        "a name for this copy and its position in the world.",
      ],
      ["    </include>", "end of the first shelf."],
      ["    <include>", "a second copy makes an aisle."],
      [
        "      <uri>https://fuel.gazebosim.org/1.0/OpenRobotics/models/Shelf</uri>",
        "the same model.",
      ],
      [
        "      <name>shelf_2</name><pose>3 -2 0 0 0 0</pose>",
        "4 m from the first, leaving a 3 m aisle between them (the shelves are about 1 m deep).",
      ],
      ["    </include>", "end of the second shelf."],
      ["  </world>", "end of the world."],
      ["</sdf>", "end of the file."],
    ),
    walk: [
      "Including models by address saves the modelling work and keeps the world file short.",
      "Two shelves at different y positions form an aisle whose width you can set exactly.",
      "The 1 ms step is small enough for stable wheel contact with a robot of this size.",
    ],
    expect: [
      "Gazebo shows the ground, two shelves and an aisle between them.",
      "The robot driven along the aisle produces a LiDAR scan with two clear lines on the sides.",
    ],
    fix: [
      [
        "Models do not load.",
        "The computer has no network access to Fuel, or the model name is wrong. Download the models first, or check the address.",
      ],
      [
        "The simulation runs slowly.",
        "The world is too complex for the computer. Reduce the visual detail or use simpler collision shapes.",
      ],
    ],
    exercise:
      "Build an aisle that is only 1.2 m wide and check whether the robot can pass with the inflation settings from the costmap lesson.",
    checklist: [
      "Aisle widths match the real site",
      "Physics settings are stable",
      "Models are downloaded and versioned",
    ],
  }),
  lesson({
    title: "Sensor fusion",
    summary:
      "Combine two position estimates with different uncertainty by weighting them with their inverse variance.",
    goals: [
      "Explain why fusion beats a single sensor",
      "Combine two estimates with inverse-variance weighting",
      "Compute the uncertainty of the fused result",
    ],
    concept: [
      "Every sensor has an error. Combining two independent estimates of the same quantity gives a result that is better than either: the more certain estimate gets the larger weight. With variances σ₁² and σ₂², the fused value is x = (x₁/σ₁² + x₂/σ₂²) / (1/σ₁² + 1/σ₂²) and its variance is 1 / (1/σ₁² + 1/σ₂²), which is always smaller than both. This is what a Kalman filter does in one dimension.",
      "For an AMR the typical pair is odometry (very precise over short distances but drifting) and LiDAR localisation (absolute but noisier and slower). The fusion result is only valid if the errors are independent and the variances are honest. Overconfident variances make the filter ignore the other sensor, and correlated errors make the result overconfident. Real systems use the EKF or a factor graph for the full state; the principle is the same.",
    ],
    steps: [
      "Write the two estimates with their standard deviations.",
      "Compute the weights from the inverse variances.",
      "Compute the fused value and its standard deviation.",
      "Change one standard deviation and see how the weights shift.",
    ],
    example: hash(
      ["import math", "for the square root."],
      ["", ""],
      [
        "def fuse(x1, s1, x2, s2):",
        "fuse two independent estimates x1 and x2 with standard deviations s1 and s2.",
      ],
      [
        "    w1, w2 = 1.0 / (s1 * s1), 1.0 / (s2 * s2)",
        "the weights are the inverse variances: certain estimates count more.",
      ],
      ["    x = (w1 * x1 + w2 * x2) / (w1 + w2)", "the weighted average."],
      [
        "    s = math.sqrt(1.0 / (w1 + w2))",
        "the standard deviation of the result: smaller than both inputs.",
      ],
      ["    return round(x, 3), round(s, 3)", "the fused estimate."],
      ["", ""],
      [
        "print(fuse(10.00, 0.05, 10.10, 0.10))",
        "odometry says 10.00 m (5 cm), LiDAR says 10.10 m (10 cm): prints (10.02, 0.045).",
      ],
      [
        "print(fuse(10.00, 0.05, 10.10, 0.50))",
        "a much worse second sensor barely changes the result: prints (10.001, 0.05).",
      ],
    ),
    walk: [
      "The fused value lies closer to the more certain sensor, at 10.02 m in the first example.",
      "The fused standard deviation of 4.5 cm is smaller than both 5 cm and 10 cm.",
      "A very uncertain second sensor has almost no effect, which is what you want from good fusion.",
    ],
    expect: [
      "The first call prints (10.02, 0.045) and the second prints (10.001, 0.05).",
      "Setting both standard deviations equal returns the plain average.",
    ],
    fix: [
      [
        "The fused pose is overconfident and wrong.",
        "The variances are too small or the errors are correlated. Increase the variances and check for shared error sources.",
      ],
      [
        "The result follows one sensor only.",
        "That sensor's variance is much smaller than reality. Estimate variances from real data.",
      ],
    ],
    exercise:
      "Simulate 1,000 measurements of a fixed position with the two error levels and check that the fused error has a standard deviation of about 4.5 cm.",
    checklist: [
      "Variances are estimated from data",
      "Errors are independent or handled",
      "The fused uncertainty is used, not ignored",
    ],
  }),
  lesson({
    title: "Monitoring dashboard",
    summary:
      "Expose robot metrics in the Prometheus format so a dashboard can show battery, missions and errors.",
    goals: [
      "Explain the metric types gauge and counter",
      "Expose metrics with an HTTP endpoint",
      "Choose metrics that show the fleet's health",
    ],
    concept: [
      "A dashboard shows the health of the fleet at a glance and alerts people when something is wrong. A common approach is to expose metrics in the Prometheus format: a small HTTP endpoint that returns names and values. A Prometheus server collects them regularly and a tool such as Grafana draws them. A gauge is a value that goes up and down (battery percentage), a counter only increases (completed missions).",
      "Good metrics answer questions: Are robots working? How many missions were completed? What is the battery? Is any robot in a fault state? Labels such as the robot name allow one metric for the whole fleet. Alerts (battery below 20 %, no heartbeat for one minute) are defined on the server, not in the robot code. Keep the number of metrics small and stable, so the dashboards stay readable.",
    ],
    steps: [
      "Define the metrics: battery, missions done, missions failed and state.",
      "Start the HTTP endpoint on the robot.",
      "Update the metrics from the mission and battery code.",
      "Open the endpoint in a browser and check the values.",
    ],
    example: hash(
      [
        "from prometheus_client import Gauge, Counter, start_http_server",
        "the standard client library for the Prometheus format.",
      ],
      ["", ""],
      [
        "battery = Gauge('amr_battery_percent', 'Battery state of charge', ['robot'])",
        "a value that goes up and down, one per robot.",
      ],
      [
        "missions = Counter('amr_missions_total', 'Missions by result', ['robot', 'result'])",
        "a count that only increases, split by robot and result.",
      ],
      [
        "state = Gauge('amr_state', '1 for the current state', ['robot', 'state'])",
        "which state the robot is in.",
      ],
      ["", ""],
      [
        "def report(robot, soc, mission_result=None, current='idle'):",
        "update the metrics from the robot's data.",
      ],
      ["    battery.labels(robot).set(soc)", "set the battery gauge."],
      ["    if mission_result:", "a mission has just ended."],
      ["        missions.labels(robot, mission_result).inc()", "count it as 'done' or 'failed'."],
      ["    for s in ('idle', 'moving', 'charging', 'fault'):", "one gauge per possible state."],
      [
        "        state.labels(robot, s).set(1 if s == current else 0)",
        "1 for the current state, 0 for the others.",
      ],
      ["", ""],
      ["start_http_server(8000)", "serve the metrics at http://robot:8000/metrics."],
      [
        "report('amr1', 78.5, 'done', 'moving')",
        "example update: 78.5 % battery, a mission just finished, robot is moving.",
      ],
    ),
    walk: [
      "Labels let one metric name cover every robot, which keeps dashboards simple.",
      "Counters only go up, and the server computes rates from them, so resets after a restart are handled correctly.",
      "Alert rules live on the server, so thresholds can change without touching the robots.",
    ],
    expect: [
      'Opening http://localhost:8000/metrics shows lines such as amr_battery_percent{robot="amr1"} 78.5.',
      'amr_missions_total{result="done",robot="amr1"} increases by one for each finished mission.',
    ],
    fix: [
      [
        "The dashboard shows gaps.",
        "The robot's endpoint is not reachable at times. Check the network and the scrape interval.",
      ],
      [
        "There are too many metrics.",
        "Remove those nobody uses and avoid labels with unlimited values (such as a mission ID).",
      ],
    ],
    exercise:
      "Add a gauge for the time since the last heartbeat message from the navigation stack and define an alert after 60 seconds.",
    checklist: [
      "Metric names and labels are stable",
      "Alerts are defined on the server",
      "Only useful metrics are exposed",
    ],
  }),
  lesson({
    title: "Logging & metrics",
    summary:
      "Compute throughput, success rate and cycle time from mission records to see how the fleet performs.",
    goals: [
      "Record mission events with timestamps",
      "Compute success rate, cycle time and throughput",
      "Find the slowest missions for improvement",
    ],
    concept: [
      "Logs tell what happened; metrics tell how well. For a warehouse fleet the key indicators are throughput (missions per hour), success rate (missions completed without help), average and worst-case cycle time and the time robots spend waiting or charging. They are computed from mission records: start, end, result and the reason for a failure.",
      "Record events in a structured form (one row per mission) rather than free text, so the numbers can be calculated and compared over weeks. Percentiles are more useful than averages for cycle times, because a few very slow missions show up in the 95th percentile. Use the indicators to decide where to improve: a low success rate points to navigation problems, long waits to traffic or charging.",
    ],
    steps: [
      "Store one record per mission with start, end and result.",
      "Compute the throughput and the success rate.",
      "Compute the median and the 95th percentile of the cycle time.",
      "List the five slowest missions and their reasons.",
    ],
    example: hash(
      ["import math, statistics", "for rounding up and for the median."],
      ["", ""],
      [
        "def metrics(records, window_h):",
        "records are dicts with start, end (seconds) and result; window_h is the observation time in hours.",
      ],
      ["    done = [r for r in records if r['result'] == 'done']", "the successful missions."],
      [
        "    times = sorted(r['end'] - r['start'] for r in done)",
        "their cycle times in ascending order.",
      ],
      ["    return {", "the summary."],
      [
        "        'throughput_per_h': round(len(done) / window_h, 1),",
        "completed missions per hour.",
      ],
      [
        "        'success_rate': round(len(done) / len(records), 3) if records else None,",
        "share of missions that completed.",
      ],
      [
        "        'median_s': round(statistics.median(times), 1) if times else None,",
        "the typical cycle time.",
      ],
      [
        "        'p95_s': round(times[max(0, math.ceil(0.95 * len(times)) - 1)], 1) if times else None,",
        "the slow tail (nearest-rank 95th percentile): almost all missions were faster than this.",
      ],
      ["    }", "end of the summary."],
      ["", ""],
      [
        "recs = [{'start': 0, 'end': 120, 'result': 'done'}, {'start': 130, 'end': 260, 'result': 'done'}, {'start': 300, 'end': 330, 'result': 'failed'}, {'start': 340, 'end': 520, 'result': 'done'}]",
        "four example missions of one hour's sample.",
      ],
      [
        "print(metrics(recs, window_h=0.25))",
        "prints 12.0 per hour, a success rate of 0.75 and a median of 130 s.",
      ],
    ),
    walk: [
      "The success rate uses all missions as the denominator, so failures show up in the number.",
      "The 95th percentile is the value that a few very slow missions raise, which the median hides.",
      "Records are plain numbers, so the same function can process a day, a week or a year of data.",
    ],
    expect: [
      "The script prints a throughput of 12.0 per hour, a success rate of 0.75, a median of 130.0 s and a 95th percentile of 180.0 s.",
      "Adding a slow mission of 900 s raises the 95th percentile a lot but the median only a little.",
    ],
    fix: [
      [
        "Metrics look better than what the staff sees.",
        "Failed missions are missing from the records. Log every mission at its start, not only the completed ones.",
      ],
      [
        "The numbers cannot be compared over time.",
        "The definition of a mission changed. Version the metric definitions with the software.",
      ],
    ],
    exercise: "Group the failed missions by their reason and print the reasons sorted by count.",
    checklist: [
      "Every mission is recorded at its start",
      "Percentiles are reported, not only averages",
      "Metric definitions are versioned",
    ],
  }),
  lesson({
    title: "Real hardware integration",
    summary:
      "Check that every sensor and drive is alive at the expected rate before the robot is allowed to move.",
    goals: [
      "List the checks of a hardware bring-up",
      "Measure the rate of a topic over a time window",
      "Refuse to start motion if a check fails",
    ],
    concept: [
      "Moving from simulation to the real robot exposes everything the simulator hid: cables come loose, drivers start late, rates are lower than promised, and clocks differ. A bring-up procedure checks the hardware in a fixed order before any motion: power, communication, sensors, then drives. Each check has a pass criterion, such as a topic arriving at its expected rate.",
      "A start-up script measures the rate of every important topic over a couple of seconds and compares it with the expected value and a tolerance. It reports each result and does not enable the drives if a required check fails. The same script is useful for daily start-up checks and for troubleshooting, because it shows at once which device is missing.",
    ],
    steps: [
      "List the required topics and their expected rates: scan 10 Hz, odom 50 Hz, imu 100 Hz.",
      "Subscribe to each and count messages for two seconds.",
      "Compare the measured rate with the expected one, with a 20 % tolerance.",
      "Enable the drives only if all checks pass.",
    ],
    example: hash(
      ["import time", "for the measuring window."],
      ["import rclpy", "the ROS 2 Python client library."],
      ["from rclpy.node import Node", "the base class of nodes."],
      [
        "from rosidl_runtime_py.utilities import get_message",
        "find a message class from its type name.",
      ],
      ["", ""],
      [
        "EXPECTED = {'/scan': ('sensor_msgs/msg/LaserScan', 10.0), '/imu/data': ('sensor_msgs/msg/Imu', 100.0), '/wheel/odom': ('nav_msgs/msg/Odometry', 50.0)}",
        "topic: (message type, expected rate in Hz).",
      ],
      ["", ""],
      [
        "def check_rates(node, seconds=2.0, tol=0.2):",
        "measure the rate of each topic; returns {topic: (measured, ok)}.",
      ],
      ["    counts = {t: 0 for t in EXPECTED}", "message counts per topic."],
      ["    for topic, (typ, _) in EXPECTED.items():", "subscribe to each topic."],
      [
        "        node.create_subscription(get_message(typ), topic, lambda m, t=topic: counts.__setitem__(t, counts[t] + 1), 10)",
        "count every message that arrives.",
      ],
      ["    end = time.time() + seconds", "the end of the measuring window."],
      ["    while time.time() < end:", "spin the node during the window."],
      ["        rclpy.spin_once(node, timeout_sec=0.05)", "process incoming messages."],
      ["    result = {}", "the results."],
      ["    for topic, (_, hz) in EXPECTED.items():", "compare with the expectation."],
      ["        measured = counts[topic] / seconds", "messages per second."],
      [
        "        result[topic] = (round(measured, 1), abs(measured - hz) <= tol * hz)",
        "within 20 % of the expected rate?",
      ],
      ["    return result", "if any is False, do not enable the drives."],
    ),
    walk: [
      "The expected rates are data, so the same script serves different robots with different sensors.",
      "A measured rate of zero shows immediately that a driver did not start or a cable is loose.",
      "The result is a value, not just a printout, so the start-up sequence can act on it automatically.",
    ],
    expect: [
      "On a healthy robot every topic is within 20 % of its expected rate and the check returns all True.",
      "Unplugging the LiDAR makes /scan report 0.0 and False.",
    ],
    fix: [
      [
        "A rate is half of what is expected.",
        "The driver is limited by the USB bandwidth or the CPU. Check the load and the device settings.",
      ],
      [
        "Rates fluctuate.",
        "A longer measurement window and the QoS settings may help; also check the network and the cable.",
      ],
    ],
    exercise:
      "Add a check that the timestamps of /scan are within 50 ms of the computer's clock and report the offset.",
    checklist: [
      "Every required topic has an expected rate",
      "Drives are not enabled if a check fails",
      "The bring-up check is run every day",
    ],
  }),
  lesson({
    title: "Jetson deployment",
    summary:
      "Run the robot software in a container on a Jetson with maximum performance and automatic start.",
    goals: [
      "Explain why containers help deployment",
      "Run a ROS 2 container with GPU access on a Jetson",
      "Start it automatically at boot with a systemd service",
    ],
    concept: [
      "An NVIDIA Jetson is a small computer with a GPU that runs vision models and navigation on the robot. Installing ROS 2 and all libraries directly on it is fragile: versions drift and a re-install takes a day. A container image holds the exact software and dependencies, so every robot runs the same, updates are a new image and a rollback is the previous one.",
      "On a Jetson the container needs the NVIDIA runtime for GPU access, host networking for ROS 2 discovery and access to the devices (LiDAR, cameras, CAN). Power mode and clocks must be set to maximum performance for predictable timing. A systemd service starts the container at boot and restarts it on failure, so a power cycle brings the robot back to work without a person at the keyboard.",
    ],
    steps: [
      "Build the image on a development machine for the Jetson's architecture.",
      "Set the Jetson to maximum performance mode.",
      "Run the container with the NVIDIA runtime, host networking and the devices.",
      "Create a systemd service that starts and restarts the container.",
    ],
    example: hash(
      ["#!/bin/bash", "a shell script that starts the robot software."],
      ["sudo nvpmodel -m 0", "select the maximum performance power mode of the Jetson."],
      [
        "sudo jetson_clocks",
        "fix the CPU, GPU and memory clocks at their maximum, for predictable timing.",
      ],
      [
        "docker run --rm --name amr --runtime nvidia --network host --privileged -v /dev:/dev -v /opt/amr/maps:/maps -v /opt/amr/config:/config registry.example.com/amr/robot:1.4.2 ros2 launch amr_bringup robot.launch.py",
        "one command: GPU access, host networking and devices, the maps and configuration shared from the host, and a versioned image that starts the robot's launch file.",
      ],
      ["", ""],
      [
        "# /etc/systemd/system/amr.service: [Service] ExecStart=/opt/amr/start.sh  Restart=always  RestartSec=5",
        "the service runs the script at boot and restarts it five seconds after any failure.",
      ],
      ["# sudo systemctl enable --now amr.service", "enable it at boot and start it now."],
    ),
    walk: [
      "The image tag is a fixed version (1.4.2), so every robot runs exactly the same software and a rollback is a tag change.",
      "Maps and configuration are mounted from the host, so they survive image updates and can be changed on site.",
      "--privileged and /dev are convenient, but a hardened deployment lists only the devices that are needed.",
    ],
    expect: [
      "After a reboot the robot software starts by itself and the robot reports ready within a minute.",
      "Killing the container makes systemd start it again after five seconds.",
    ],
    fix: [
      [
        "The GPU is not available in the container.",
        "The NVIDIA runtime or the image is not built for the Jetson. Use the matching base image and the correct --runtime setting.",
      ],
      [
        "Timing is inconsistent.",
        "The power mode is not fixed. Set nvpmodel and jetson_clocks at every boot, before the container starts.",
      ],
    ],
    exercise:
      "Write the complete systemd unit file and test that a power cycle brings the robot up without any manual step.",
    checklist: [
      "Images are versioned and reproducible",
      "Maps and config are outside the image",
      "The service restarts on failure",
    ],
  }),
  lesson({
    title: "Safety standards",
    summary:
      "Compute the protective field length of a safety scanner from speed, reaction time and braking deceleration.",
    goals: [
      "Name the standards that apply to industrial mobile robots",
      "Compute the protective field length from stopping data",
      "Explain what remains the job of the certified safety scanner",
    ],
    concept: [
      "Mobile robots in industry are covered by ISO 3691-4 (driverless industrial trucks and their systems), ANSI/RIA R15.08 for industrial mobile robots in North America, and the general machine standards for safety functions (ISO 13849-1). They require a risk assessment, a protective system that detects people in the path and stops the vehicle, defined stopping distances and marked areas.",
      "The protective system is normally a safety laser scanner with configurable fields: a protective field in front of the robot that stops it when something enters, and warning fields that slow it down earlier. The protective field must be long enough for the robot to stop before reaching a person: s = v·t + v²/(2a) + margin, with the total response time t (scanner, safety controller and drives), the braking deceleration a and a margin for the sensor's tolerances. The field changes with the speed of the vehicle, so the safety system switches fields with the speed.",
    ],
    steps: [
      "Measure the response time of the scanner, the safety controller and the drive.",
      "Measure the real braking deceleration on the worst floor and load.",
      "Compute the protective field length for each speed.",
      "Configure the scanner fields with the results and verify them by test.",
    ],
    example: hash(
      [
        "def field_length(v, t_response=0.15, decel=1.0, margin=0.20):",
        "protective field length in metres for speed v (m/s); illustrative, verify by measurement.",
      ],
      [
        "    return v * t_response + v * v / (2.0 * decel) + margin",
        "distance travelled during the response, the braking distance and a margin.",
      ],
      ["", ""],
      [
        "FIELDS = {v: round(field_length(v), 2) for v in (0.5, 1.0, 1.5)}",
        "field lengths for three speed steps.",
      ],
      ["print(FIELDS)", "prints {0.5: 0.4, 1.0: 0.85, 1.5: 1.55}."],
    ),
    walk: [
      "The braking term grows with the square of the speed, so the field is almost four times longer at 1.5 m/s than at 0.5 m/s.",
      "The deceleration must be measured with the real load on the worst floor, because a loaded robot on a wet floor brakes worse.",
      "The safety scanner, its fields and the switching between them are certified equipment; this calculation only shows how the numbers arise.",
    ],
    expect: [
      "The script prints {0.5: 0.4, 1.0: 0.85, 1.5: 1.55}.",
      "Halving the deceleration to 0.5 m/s² lengthens the field at 1.5 m/s to 2.7 m.",
    ],
    fix: [
      [
        "The robot stops too late in tests.",
        "The measured deceleration or response time is worse than assumed. Re-measure and lengthen the field.",
      ],
      [
        "The robot stops for objects that are far away.",
        "The field is too long or too wide. Match it to the speed and use warning fields for slowing down.",
      ],
    ],
    exercise:
      "Compute the fields for a loaded and an unloaded robot with different braking deceleration and explain what should switch them.",
    checklist: [
      "Stopping data is measured, not assumed",
      "Fields switch with speed and load",
      "Certified safety equipment does the protection",
    ],
  }),
  lesson({
    title: "Full warehouse AMR project",
    summary:
      "Accept a warehouse AMR system by comparing measured performance with acceptance criteria.",
    goals: [
      "Define acceptance criteria for docking, localisation and missions",
      "Compare measured results with the criteria",
      "Produce a report that shows what passed and what did not",
    ],
    concept: [
      "The final step of a project is the acceptance test: the customer and the supplier agree in advance on numbers that the system must reach, and measure them on site. For a warehouse AMR typical criteria are the docking success rate, the localisation accuracy at stations, the mission success rate, the average cycle time and the number of safety stops per hour. Each has a threshold and a measurement method.",
      "Writing the criteria as data and evaluating them with a script makes the result objective and repeatable. Every criterion has a measured value, a limit and a direction (at least or at most). The report lists each with its result and an overall verdict, and is archived with the software version and the configuration. Any failed criterion has an action: analyse, fix and repeat the affected test.",
    ],
    steps: [
      "Agree the criteria and limits with the customer.",
      "Run the test period and record the raw data.",
      "Compute the measured values from the data.",
      "Evaluate the criteria and produce the report.",
    ],
    example: hash(
      [
        "CRITERIA = [",
        "the agreed acceptance criteria: name, limit and direction ('min' = at least, 'max' = at most).",
      ],
      [
        "    ('docking success rate', 0.99, 'min'),",
        "at least 99 % of docking attempts must succeed.",
      ],
      ["    ('localisation error at stations (m)', 0.05, 'max'),", "at most 5 cm at the stations."],
      [
        "    ('mission success rate', 0.98, 'min'),",
        "at least 98 % of missions completed without help.",
      ],
      ["    ('safety stops per hour', 2.0, 'max'),", "at most two protective stops per hour."],
      ["]", "end of the list."],
      ["", ""],
      ["def evaluate(measured):", "compare measured values (a dict by name) with the criteria."],
      ["    rows = []", "one row per criterion."],
      ["    for name, limit, kind in CRITERIA:", "each criterion."],
      [
        "        value = measured[name]",
        "the measured value (a missing value is an error, not a pass).",
      ],
      [
        "        ok = value >= limit if kind == 'min' else value <= limit",
        "compare in the required direction.",
      ],
      [
        "        rows.append((name, value, limit, 'PASS' if ok else 'FAIL'))",
        "record the outcome.",
      ],
      [
        "    verdict = 'ACCEPTED' if all(r[3] == 'PASS' for r in rows) else 'NOT ACCEPTED'",
        "the system is accepted only if every criterion passes.",
      ],
      ["    return rows, verdict", "the report data."],
      ["", ""],
      [
        "m = {'docking success rate': 0.995, 'localisation error at stations (m)': 0.031, 'mission success rate': 0.975, 'safety stops per hour': 1.2}",
        "example measurements from a test week.",
      ],
      [
        "print(evaluate(m)[1])",
        "prints NOT ACCEPTED: the mission success rate of 97.5 % is below the 98 % limit.",
      ],
    ),
    walk: [
      "Every criterion has a direction, so 'higher is better' and 'lower is better' cannot be confused.",
      "A missing measurement raises an error, so incomplete tests cannot pass by accident.",
      "One failed criterion is enough to reject the system, which forces a proper analysis of the cause.",
    ],
    expect: [
      "The script prints NOT ACCEPTED, and the report shows three passes and one failure.",
      "After improving the mission success rate to 98.4 % the verdict changes to ACCEPTED.",
    ],
    fix: [
      [
        "Criteria are argued about after the test.",
        "They were not agreed in advance. Write them into the contract with the measurement method.",
      ],
      [
        "A criterion passes but operations are unhappy.",
        "The criteria miss something important. Add a criterion (for example waiting time) for the next release.",
      ],
    ],
    exercise:
      "Add the measured value, the software version and the date to the report and save it as JSON alongside the configuration.",
    checklist: [
      "Criteria are agreed before testing",
      "Every criterion has a measurement method",
      "The report is archived with the software version",
    ],
  }),
];
