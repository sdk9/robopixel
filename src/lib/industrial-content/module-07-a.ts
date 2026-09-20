import { hash, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 07 · Autonomous Mobile Robot (AMR) — Section A: Kinematics & Perception (lessons 1–10)
export const module07a: LessonSpec[] = [
  lesson({
    title: "Diff-drive kinematics",
    summary:
      "Convert between body velocity and wheel speeds for a two-wheeled differential-drive robot.",
    goals: [
      "Write the forward and inverse kinematics of a differential drive",
      "Convert a Twist command to left and right wheel speeds",
      "Limit wheel speeds while keeping the turning radius",
    ],
    concept: [
      "A differential-drive robot has two driven wheels on one axle, separated by a distance L (the track), and a caster for balance. If the wheels turn at linear speeds v_l and v_r, the body moves forward at v = (v_r + v_l)/2 and turns at ω = (v_r − v_l)/L. Equal speeds drive straight, opposite speeds spin the robot on the spot.",
      "The inverse relation converts a velocity command (v, ω), as in a ROS 2 Twist message, into wheel speeds: v_l = v − ω·L/2 and v_r = v + ω·L/2. A robot cannot slip sideways, which is the non-holonomic constraint that path planners must respect. If one wheel exceeds its speed limit, both wheel speeds must be scaled by the same factor, so the turning radius stays the same.",
    ],
    steps: [
      "Measure the track and the wheel radius of the robot.",
      "Write the inverse kinematics from (v, ω) to wheel speeds.",
      "Add a scale factor that keeps both wheels inside their maximum speed.",
      "Test with straight, curved and spin-on-the-spot commands.",
    ],
    example: hash(
      [
        "TRACK, RADIUS, WHEEL_MAX = 0.50, 0.075, 8.0",
        "wheel separation (m), wheel radius (m) and maximum wheel speed (rad/s).",
      ],
      ["", ""],
      [
        "def wheel_speeds(v, w):",
        "wheel angular speeds (left, right) in rad/s for a body velocity.",
      ],
      ["    vl = v - w * TRACK / 2.0", "the left wheel's linear speed."],
      ["    vr = v + w * TRACK / 2.0", "the right wheel's linear speed."],
      ["    wl, wr = vl / RADIUS, vr / RADIUS", "convert linear speeds to angular speeds."],
      [
        "    scale = min(1.0, WHEEL_MAX / max(abs(wl), abs(wr), 1e-9))",
        "if one wheel is too fast, shrink both by the same factor.",
      ],
      [
        "    return wl * scale, wr * scale",
        "same ratio: the robot follows the same curve, only slower.",
      ],
      ["", ""],
      ["def body_velocity(wl, wr):", "the forward direction: wheel speeds back to (v, w)."],
      ["    vl, vr = wl * RADIUS, wr * RADIUS", "linear wheel speeds."],
      [
        "    return (vr + vl) / 2.0, (vr - vl) / TRACK",
        "average for forward speed, difference over the track for turning.",
      ],
      ["", ""],
      [
        "print(body_velocity(*wheel_speeds(0.5, 0.4)))",
        "a round trip returns (0.5, 0.4): the two functions agree.",
      ],
    ),
    walk: [
      "The two functions are inverses of each other, which is the simplest test of a kinematic model.",
      "Scaling both wheels together keeps the turning radius, so limiting speed never changes the path.",
      "A speed of 0.5 m/s and a turn of 0.4 rad/s give wheel speeds of 0.4 and 0.6 m/s (5.3 and 8.0 rad/s), so the outer wheel is at its limit.",
    ],
    expect: [
      "The round trip prints (0.5, 0.4) or a slightly lower speed if the limit scaled the command.",
      "A spin on the spot (v = 0, w = 1) gives equal and opposite wheel speeds.",
    ],
    fix: [
      [
        "The robot drives in a curve when told to go straight.",
        "The wheels have different radii or the track is wrong. Calibrate both, and compare the encoder counts on a straight run.",
      ],
      [
        "The robot turns by the wrong angle.",
        "The track value is too large or too small. Spin the robot 10 turns and correct the track from the measured angle.",
      ],
    ],
    exercise:
      "Command a circle of 1 m radius at 0.4 m/s, compute the wheel speeds and check that the ratio equals (R − L/2) / (R + L/2).",
    checklist: [
      "Track and wheel radius are measured",
      "Both wheels are scaled together at the limit",
      "Forward and inverse functions agree",
    ],
  }),
  lesson({
    title: "Odometry",
    summary: "Integrate encoder counts into a pose and understand how the error grows.",
    goals: [
      "Convert encoder ticks into distance",
      "Update the pose with the midpoint formula",
      "Explain why odometry drifts",
    ],
    concept: [
      "Odometry estimates the robot's pose by adding up small movements measured by the wheel encoders. The distance per tick is 2πr divided by the ticks per wheel revolution. Each cycle gives the distance driven by both wheels; their average is the forward step and their difference divided by the track is the change of heading.",
      "The pose is updated by moving along the average heading during the step: x += d·cos(θ + Δθ/2) and y += d·sin(θ + Δθ/2). Errors accumulate: a wheel radius error makes every distance wrong by a constant factor, a track error makes every turn wrong, and slipping adds random errors. Heading errors are the worst, because they bend the whole path. Odometry is accurate for seconds and drifts over minutes, which is why it is combined with LiDAR localisation.",
    ],
    steps: [
      "Compute the distance per encoder tick.",
      "Convert the tick counts of a cycle into wheel distances.",
      "Update x, y and heading with the midpoint formula.",
      "Drive a 5 m square in simulation and measure the closing error.",
    ],
    example: hash(
      ["import math", "for the trigonometric functions."],
      ["", ""],
      [
        "TICKS, RADIUS, TRACK = 4096, 0.075, 0.50",
        "encoder ticks per wheel revolution, wheel radius (m) and track (m).",
      ],
      [
        "M_PER_TICK = 2 * math.pi * RADIUS / TICKS",
        "the distance one tick represents: about 0.115 mm.",
      ],
      ["", ""],
      [
        "def update(pose, dl_ticks, dr_ticks):",
        "new pose (x, y, heading) after the wheels advanced by the given ticks.",
      ],
      ["    x, y, th = pose", "the current pose."],
      [
        "    dl, dr = dl_ticks * M_PER_TICK, dr_ticks * M_PER_TICK",
        "the distance each wheel travelled.",
      ],
      ["    d = (dl + dr) / 2.0", "the forward distance of the body centre."],
      ["    dth = (dr - dl) / TRACK", "the change of heading."],
      ["    x += d * math.cos(th + dth / 2.0)", "move along the average heading of the step."],
      ["    y += d * math.sin(th + dth / 2.0)", "and the same for y."],
      ["    return x, y, th + dth", "the new pose."],
      ["", ""],
      ["pose = (0.0, 0.0, 0.0)", "start at the origin facing forward."],
      ["for _ in range(100):", "100 cycles of 100 ticks on both wheels."],
      ["    pose = update(pose, 100, 100)", "drive straight."],
      [
        "print(tuple(round(v, 3) for v in pose))",
        "prints about (1.15, 0.0, 0.0): 10,000 ticks are 1.15 m.",
      ],
    ),
    walk: [
      "The distance per tick is the only place where the wheel radius enters, so a radius error scales the whole path.",
      "Using the average heading of the step removes most of the error of a simple 'old heading' update.",
      "A 1 % error in the wheel radius means 1 cm of error per metre; a 1 degree error in heading means 1.7 cm per metre.",
    ],
    expect: [
      "The script prints about (1.15, 0.0, 0.0).",
      "Driving the same number of ticks on one wheel only turns the robot on an arc and changes the heading.",
    ],
    fix: [
      [
        "The robot does not close a square path.",
        "Wheel radius or track are wrong. Calibrate them with a straight run and a spin test.",
      ],
      [
        "Odometry jumps.",
        "Encoder counts wrapped around or were read at inconsistent times. Handle counter overflow and timestamp the readings.",
      ],
    ],
    exercise:
      "Simulate a 1 % wheel radius error on the right wheel and print the position error after driving a 10 m square.",
    checklist: [
      "Distance per tick is computed from calibrated values",
      "Counter overflow is handled",
      "Odometry is combined with other sources for long distances",
    ],
  }),
  lesson({
    title: "LiDAR basics",
    summary: "Convert a 2D laser scan into points and filter invalid or out-of-range readings.",
    goals: [
      "Explain the fields of a LaserScan message",
      "Convert ranges and angles to x-y points",
      "Filter invalid readings and limit the range",
    ],
    concept: [
      "A 2D LiDAR spins and measures the distance to the nearest object at many angles. A ROS 2 LaserScan message contains the ranges, the angle of the first beam (angle_min), the angle step (angle_increment) and the valid range limits. Beam i points at angle_min + i·angle_increment.",
      "Each range r at angle a becomes a point x = r·cos a, y = r·sin a in the sensor frame. Invalid readings are common: infinity (nothing returned), NaN and values outside the sensor's range. They must be removed before further processing, and they do not mean 'free space' unless the sensor documentation says so. The scan is also taken over some milliseconds while the robot moves, which matters at high speed.",
    ],
    steps: [
      "Read the angle and range fields from a LaserScan message.",
      "Compute the angle of each beam.",
      "Keep only finite readings inside the valid range.",
      "Convert them to x and y and print the number of valid points.",
    ],
    example: hash(
      ["import math", "for cosine, sine and the finite check."],
      ["", ""],
      [
        "def scan_to_points(ranges, angle_min, angle_inc, r_min=0.15, r_max=12.0):",
        "list of (x, y) points in metres from LaserScan fields.",
      ],
      ["    pts = []", "the result."],
      ["    for i, r in enumerate(ranges):", "one beam at a time."],
      [
        "        if not math.isfinite(r) or r < r_min or r > r_max:",
        "invalid, too close or too far.",
      ],
      ["            continue", "skip the reading."],
      ["        a = angle_min + i * angle_inc", "the beam's angle in radians."],
      ["        pts.append((r * math.cos(a), r * math.sin(a)))", "polar to Cartesian coordinates."],
      ["    return pts", "the valid points."],
      ["", ""],
      [
        "ranges = [2.0, float('inf'), 1.5, 0.05]",
        "four beams: valid, no return, valid and too close.",
      ],
      [
        "print(scan_to_points(ranges, angle_min=0.0, angle_inc=math.pi / 2))",
        "prints two points: (2.0, 0.0) and about (-1.5, 0.0).",
      ],
    ),
    walk: [
      "Beam 0 points straight ahead, so its point is (2.0, 0.0) and beam 2 points backward at 180 degrees.",
      "The range limits come from the sensor's datasheet, and the scan message carries them too.",
      "Only the valid points survive, so later stages never see an infinite or NaN value.",
    ],
    expect: [
      "The script prints two points.",
      "An empty room with only infinite readings returns an empty list.",
    ],
    fix: [
      [
        "Points appear in the wrong direction.",
        "The sensor frame's x axis is not forward. Check the frame in the TF tree and the sensor's mounting.",
      ],
      [
        "The map has shadows behind the robot.",
        "The robot's own body is in the scan. Filter beams that hit the robot chassis by their angle and range.",
      ],
    ],
    exercise:
      "Filter out the beams that hit a 40 cm wide mast behind the sensor and show that the remaining points do not contain it.",
    checklist: [
      "Invalid readings are removed",
      "Range limits come from the sensor",
      "The sensor frame is correct",
    ],
  }),
  lesson({
    title: "Camera basics",
    summary:
      "Use the pinhole model to project points, compute the field of view and understand distortion.",
    goals: [
      "Explain the intrinsic parameters fx, fy, cx and cy",
      "Project a 3D point to pixel coordinates",
      "Compute the horizontal field of view",
    ],
    concept: [
      "A camera turns 3D points into pixels. The pinhole model needs four numbers, the intrinsics: the focal lengths fx and fy in pixels and the principal point (cx, cy), roughly the image centre. A point (X, Y, Z) in the camera frame appears at u = fx·X/Z + cx and v = fy·Y/Z + cy. The camera looks along its z axis, x to the right, y down.",
      "The focal length in pixels sets the field of view: FOV = 2·atan(width / (2·fx)). Real lenses also distort the image (straight lines bend near the edges), described by distortion coefficients; the image must be undistorted before the pinhole formulas are exact. In ROS 2 the intrinsics are published in the camera_info topic and come from a calibration with a checkerboard.",
    ],
    steps: [
      "Read fx, fy, cx, cy and the image size from camera_info.",
      "Project a point 2 m ahead and 0.5 m to the right.",
      "Compute the horizontal field of view.",
      "Check the result against the camera's datasheet.",
    ],
    example: hash(
      ["import math", "for atan."],
      ["", ""],
      [
        "FX, FY, CX, CY, W = 525.0, 525.0, 320.0, 240.0, 640",
        "intrinsics of a typical 640 x 480 camera, and the image width in pixels.",
      ],
      ["", ""],
      ["def project(X, Y, Z):", "pixel (u, v) of a point in the camera frame (metres)."],
      ["    return FX * X / Z + CX, FY * Y / Z + CY", "the pinhole formulas."],
      ["", ""],
      ["def fov_deg():", "the horizontal field of view in degrees."],
      [
        "    return math.degrees(2.0 * math.atan(W / (2.0 * FX)))",
        "wider images or shorter focal lengths give a wider view.",
      ],
      ["", ""],
      [
        "print(project(0.5, 0.0, 2.0), round(fov_deg(), 1))",
        "prints (451.25, 240.0) and 62.7 degrees.",
      ],
    ),
    walk: [
      "A point 0.5 m to the right at 2 m distance is 131 pixels right of the centre, which is 0.25 × 525.",
      "The v coordinate stays at the image centre, because the point is at the camera's height.",
      "Doubling the distance halves the offset in pixels, which is why far objects look small.",
    ],
    expect: [
      "The script prints (451.25, 240.0) and 62.7.",
      "A point on the optical axis projects to (320, 240).",
    ],
    fix: [
      [
        "Projected points are off toward the image edges.",
        "Lens distortion is not corrected. Calibrate the camera and undistort the image.",
      ],
      [
        "Objects appear at the wrong scale.",
        "The intrinsics belong to a different resolution. Scale fx, fy, cx and cy with the image size.",
      ],
    ],
    exercise:
      "Compute the width of the area visible at a distance of 3 m and use it to choose the mounting height for seeing pallet labels.",
    checklist: [
      "Intrinsics match the image resolution",
      "Distortion is corrected before geometry",
      "The field of view fits the task",
    ],
  }),
  lesson({
    title: "IMU fusion",
    summary:
      "Fuse wheel odometry and a gyroscope with robot_localization's EKF for a better heading.",
    goals: [
      "Explain why odometry and an IMU complement each other",
      "Configure the EKF inputs with the 15-element selection arrays",
      "Fuse only the quantities each sensor measures well",
    ],
    concept: [
      "Wheel odometry gives good forward distance but poor heading, because wheel slip during turns corrupts the heading. A gyroscope gives a good heading change over short times but drifts slowly. An extended Kalman filter (EKF) fuses them: forward speed from the wheels and yaw rate from the gyro, giving a pose better than either.",
      "The robot_localization package's ekf_node does this from a parameter file. For each input you choose which of the 15 quantities to use (x, y, z, roll, pitch, yaw, their velocities and the accelerations). A 2D robot sets two_d_mode. The rule is: fuse only what a sensor measures well, and never the same quantity from two sources that share errors.",
    ],
    steps: [
      "Set the frequency, the frames and two_d_mode.",
      "Add the wheel odometry and use only forward speed and yaw rate.",
      "Add the IMU and use only its yaw rate.",
      "Compare the fused heading with the odometry alone on a 360 degree spin.",
    ],
    example: hash(
      ["ekf_filter_node:", "the fusion node's parameter section."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ["    frequency: 30.0", "run the filter at 30 Hz."],
      ["    two_d_mode: true", "the robot moves on a plane: ignore z, roll and pitch."],
      ["    odom_frame: odom", "the frame that the fused pose is expressed in."],
      ["    base_link_frame: base_link", "the robot's frame."],
      ["    world_frame: odom", "publish the odom to base_link transform."],
      ["    odom0: /wheel/odom", "the first input: wheel odometry."],
      [
        "    odom0_config: [false, false, false, false, false, false, true, false, false, false, false, true, false, false, false]",
        "use only vx and the yaw rate (vyaw) from the wheels.",
      ],
      ["    imu0: /imu/data", "the second input: the IMU."],
      [
        "    imu0_config: [false, false, false, false, false, false, false, false, false, false, false, true, false, false, false]",
        "use only the yaw rate from the gyroscope.",
      ],
      [
        "    imu0_remove_gravitational_acceleration: true",
        "not used here, but it is needed if accelerations are ever enabled.",
      ],
    ),
    walk: [
      "Each array has 15 entries, in the order x, y, z, roll, pitch, yaw, vx, vy, vz, vroll, vpitch, vyaw, ax, ay, az.",
      "Both sensors supply the yaw rate, but the gyroscope's is far more accurate during slip, so the filter learns to trust it.",
      "Accelerations are not used, because they are noisy and would add drift in the velocity.",
    ],
    expect: [
      "During a spin on the spot the fused heading follows the gyroscope, while the odometry alone under- or over-shoots.",
      "ros2 topic hz /odometry/filtered shows about 30 Hz.",
    ],
    fix: [
      [
        "The fused pose jumps.",
        "Two sources supply the same absolute quantity with different errors. Use velocities from the wheels and only a rate from the IMU.",
      ],
      [
        "The heading drifts while standing still.",
        "The gyroscope has a bias. Calibrate it at start-up while the robot is stationary.",
      ],
    ],
    exercise:
      "Record a bag with a 10-turn spin and compare the heading error of the raw odometry and the fused output.",
    checklist: [
      "Each sensor contributes only what it measures well",
      "The gyroscope bias is calibrated",
      "The fused output is compared with a reference",
    ],
  }),
  lesson({
    title: "Sensor calibration",
    summary: "Estimate the yaw offset of a LiDAR by scanning a straight wall and fitting a line.",
    goals: [
      "Explain extrinsic calibration of a sensor",
      "Fit a line to wall points with a singular value decomposition",
      "Compute the mounting yaw error from the line angle",
    ],
    concept: [
      "Extrinsic calibration finds where a sensor sits on the robot: its position and orientation relative to the base frame. A small yaw error of the LiDAR bends every wall in the map: 1 degree gives 17 cm of error at 10 m. The position error of the sensor is easy to measure with a ruler; the yaw error is not, so it is estimated from data.",
      "A simple method uses a long straight wall. Drive the robot so that it faces the wall squarely (or line it up with a known reference), record a scan, fit a straight line through the wall points and measure the angle of the line. The difference from the expected angle is the mounting yaw error, which is entered in the static transform. A singular value decomposition (SVD) of the centred points gives the line direction robustly.",
    ],
    steps: [
      "Place the robot square to a straight wall 2–4 m away.",
      "Record a scan and keep only the points on the wall.",
      "Fit a line and compute its angle.",
      "Enter the negative of the error as the yaw of the sensor's static transform.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the SVD."],
      ["", ""],
      [
        "def wall_angle_deg(points):",
        "angle (degrees) of the best-fit line through a set of wall points.",
      ],
      ["    p = np.asarray(points, float)", "the points as an N x 2 array."],
      ["    p = p - p.mean(axis=0)", "centre them on their average."],
      ["    _, _, vt = np.linalg.svd(p)", "singular value decomposition of the centred points."],
      ["    d = vt[0]", "the first right singular vector is the direction of the line."],
      ["    a = np.degrees(np.arctan2(d[1], d[0]))", "the angle of that direction."],
      [
        "    return float((a + 90.0) % 180.0 - 90.0)",
        "reduce to the range -90 to +90 degrees, since a line has no arrow.",
      ],
      ["", ""],
      ["t = np.linspace(-2.0, 2.0, 100)", "100 points along a 4 m wall."],
      ["rot = np.radians(3.0)", "simulate a sensor mounted with a 3 degree yaw error."],
      [
        "wall = np.stack([t * np.cos(rot), t * np.sin(rot)], axis=1)",
        "the wall as the tilted sensor sees it (a wall along the x axis).",
      ],
      [
        "print(round(wall_angle_deg(wall), 2))",
        "prints 3.0: the wall should be at 0 degrees, so the sensor is yawed by 3 degrees.",
      ],
    ),
    walk: [
      "Centring the points removes the offset, so only the direction of the wall matters.",
      "The SVD finds the direction of largest spread, which is along the wall for any distance or position.",
      "The result is only as good as the reference: the robot must really face the wall squarely, or use two different wall angles.",
    ],
    expect: [
      "The script prints 3.0 degrees for the simulated error.",
      "After correcting the static transform by −3 degrees the same wall measures 0 degrees.",
    ],
    fix: [
      [
        "The angle changes between scans.",
        "The robot was not stationary or the wall points include other objects. Keep only points close to the fitted line.",
      ],
      [
        "Corrections make the map worse.",
        "The sign is wrong. Test by applying the correction and measuring again.",
      ],
    ],
    exercise:
      "Add noise of 1 cm to the wall points and measure how the angle estimate spreads over 100 runs.",
    checklist: [
      "The reference wall is straight and the robot faces it",
      "Only wall points are used",
      "The correction is verified by a second measurement",
    ],
  }),
  lesson({
    title: "TF tree",
    summary:
      "Build the AMR's frame tree and publish the fixed transform of the LiDAR with a launch file.",
    goals: [
      "Name the standard frames map, odom, base_link and the sensor frames",
      "Explain who publishes each transform",
      "Publish a static sensor transform from a launch file",
    ],
    concept: [
      "An AMR's TF tree follows a convention (REP 105): map → odom → base_link → sensor frames. The odom frame is continuous but drifts; the map frame is globally correct but can jump when the localisation corrects itself. The localisation (AMCL or SLAM) publishes map → odom, the odometry or EKF publishes odom → base_link, and the robot description publishes the fixed frames of the sensors under base_link.",
      "Every frame has one parent. Sensors are fixed to the chassis, so their transforms are static. They are published once by robot_state_publisher from the URDF, or by a static_transform_publisher when there is no URDF yet. Getting one of these wrong (a wrong offset or two publishers for one frame) causes maps to smear or planners to reject goals.",
    ],
    steps: [
      "Draw the tree: map, odom, base_link, base_scan, camera_link.",
      "List who publishes each transform.",
      "Publish the LiDAR transform with a static publisher.",
      "Check the tree with tf2_tools view_frames and tf2_echo.",
    ],
    example: hash(
      ["from launch import LaunchDescription", "the container for what the launch file starts."],
      ["from launch_ros.actions import Node", "starts a ROS 2 node."],
      ["", ""],
      ["def generate_launch_description():", "called by ros2 launch."],
      [
        "    lidar = Node(package='tf2_ros', executable='static_transform_publisher',",
        "a node that publishes one fixed transform.",
      ],
      [
        "                 arguments=['--x', '0.20', '--y', '0.0', '--z', '0.25', '--yaw', '0.0',",
        "the LiDAR is 20 cm forward and 25 cm above the base, without rotation.",
      ],
      [
        "                            '--frame-id', 'base_link', '--child-frame-id', 'base_scan'])",
        "the parent and the child frame of the transform.",
      ],
      [
        "    camera = Node(package='tf2_ros', executable='static_transform_publisher',",
        "a second fixed transform.",
      ],
      [
        "                  arguments=['--x', '0.25', '--y', '0.0', '--z', '0.60', '--pitch', '0.35',",
        "the camera is 60 cm high and tilted down by 0.35 rad.",
      ],
      [
        "                             '--frame-id', 'base_link', '--child-frame-id', 'camera_link'])",
        "its parent and child frames.",
      ],
      ["    return LaunchDescription([lidar, camera])", "start both publishers."],
    ),
    walk: [
      "Both sensors hang off base_link, so the whole tree has one root and no loops.",
      "The values are measured on the real robot with a ruler; a 1 cm error here is a 1 cm error in every map.",
      "In a full system these transforms come from the URDF and robot_state_publisher instead of separate nodes.",
    ],
    expect: [
      "tf2_echo base_link base_scan prints a translation of (0.2, 0, 0.25).",
      "view_frames shows map → odom → base_link with base_scan and camera_link below it.",
    ],
    fix: [
      [
        "Frames are missing or disconnected.",
        "One link of the chain is not published. Look at view_frames and find the frame without a parent.",
      ],
      [
        "The map is smeared.",
        "The sensor transform or the odometry is wrong, or two nodes publish the same transform.",
      ],
    ],
    exercise:
      "Print the transform from map to base_scan with a small script and check that it changes when the robot moves.",
    checklist: [
      "Every frame has exactly one parent",
      "Sensor offsets are measured",
      "Nothing publishes the same transform twice",
    ],
  }),
  lesson({
    title: "Obstacle detection",
    summary:
      "Check whether scan points block the robot's path using its width and stopping distance.",
    goals: [
      "Compute the stopping distance from speed and deceleration",
      "Check points inside a swept corridor",
      "Choose the stop or slow reaction",
    ],
    concept: [
      "To avoid collisions the robot needs to know if something lies in the space it is about to sweep. That space is a corridor as wide as the robot plus a margin and as long as the distance needed to stop: v²/(2a) plus the distance travelled during the reaction time and a safety margin. Any scan point inside the corridor is an obstacle for that speed.",
      "The corridor length grows with the square of the speed, so the robot must slow down when the space ahead is tight. A common design has two limits: a slow zone (inside it the speed is reduced) and a stop zone (inside it the robot stops). The checks use the laser points in the robot frame, which is why the TF tree and the scan conversion must be right first. For people the certified safety scanner has the last word.",
    ],
    steps: [
      "Compute the stopping distance at the current speed.",
      "Define the corridor from the robot width and the margin.",
      "Test every scan point against the corridor.",
      "Choose stop, slow or go from the nearest point inside.",
    ],
    example: hash(
      [
        "def corridor_length(v, decel=0.5, reaction=0.2, margin=0.1):",
        "distance (m) the robot needs to stop safely at speed v.",
      ],
      [
        "    return v * reaction + v * v / (2.0 * decel) + margin",
        "reaction distance, braking distance and a margin.",
      ],
      ["", ""],
      [
        "def nearest_in_corridor(points, v, width=0.6):",
        "distance to the closest point inside the swept corridor, or None.",
      ],
      ["    length = corridor_length(v)", "how far ahead we must look."],
      [
        "    hits = [x for x, y in points if 0.0 < x < length and abs(y) < width / 2.0]",
        "points ahead of the robot and inside its width.",
      ],
      ["    return min(hits) if hits else None", "the closest one."],
      ["", ""],
      ["def decide(points, v):", "the reaction for the current speed."],
      ["    d = nearest_in_corridor(points, v)", "look for an obstacle."],
      ["    if d is None:", "the corridor is free."],
      ["        return 'go'", "no reaction needed."],
      [
        "    return 'stop' if d < corridor_length(v) * 0.6 else 'slow'",
        "very close: stop; farther inside the corridor: slow down.",
      ],
      ["", ""],
      [
        "print(round(corridor_length(0.5), 2), decide([(0.2, 0.0)], 0.5), decide([(0.4, 0.1)], 0.5), decide([(0.6, 0.0)], 0.5))",
        "prints 0.45, stop, slow and go.",
      ],
    ),
    walk: [
      "At 0.5 m/s the corridor is 0.45 m long: 0.1 m of reaction, 0.25 m of braking and 0.1 m of margin.",
      "Doubling the speed to 1.0 m/s makes the corridor 1.3 m long, almost three times as much.",
      "Points beside the robot (large y) are ignored, so narrow passages are allowed if the robot really fits.",
    ],
    expect: [
      "The script prints 0.45, stop, slow and go.",
      "At 1.0 m/s the obstacle at 0.6 m is a stop instead of a go, which shows why speed must fall in tight spaces.",
    ],
    fix: [
      [
        "The robot stops in narrow aisles.",
        "The margin or the width is too large. Measure the real robot and use the smallest safe values.",
      ],
      [
        "The robot hits low obstacles.",
        "A 2D scan at one height misses them. Add a second sensor, such as a depth camera or bumper.",
      ],
    ],
    exercise:
      "Plot the corridor length against speed from 0 to 1.5 m/s and mark the speed at which it exceeds the scanner's range.",
    checklist: [
      "Stopping distance is computed from real deceleration",
      "Width includes a margin",
      "Blind spots are covered by other sensors",
    ],
  }),
  lesson({
    title: "Floor marking detection",
    summary:
      "Find a coloured floor line with a colour threshold and compute the lateral offset for line following.",
    goals: [
      "Threshold a coloured line in HSV colour space",
      "Compute the line's centre and the lateral offset",
      "Reject frames with too little line visible",
    ],
    concept: [
      "Many warehouses mark lanes on the floor with coloured tape. A camera looking at the floor can follow it. In the HSV colour space the hue separates colour from brightness, so a yellow line is found with a hue range around 20–35 (OpenCV scale 0–179) and a minimum saturation, even when the light changes.",
      "The mask of line pixels is reduced to its centre with image moments, and the offset from the image centre is the lateral error the controller must remove. If only a few pixels are found (the line is hidden or absent) the result is not trusted and the robot slows down or stops. The offset in pixels is converted into metres with the camera geometry.",
    ],
    steps: [
      "Convert the image to HSV.",
      "Threshold the yellow range and count the pixels.",
      "Compute the centroid with moments and the offset from the centre.",
      "Return nothing if fewer than 500 pixels are found.",
    ],
    example: hash(
      ["import cv2, numpy as np", "OpenCV for the image work and numpy for the range arrays."],
      ["", ""],
      [
        "LOW, HIGH = np.array([20, 100, 100]), np.array([35, 255, 255])",
        "the HSV range of yellow tape (hue, saturation, value).",
      ],
      ["", ""],
      [
        "def line_offset(bgr, min_pixels=500):",
        "lateral offset of the line in pixels (positive = to the right), or None.",
      ],
      [
        "    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)",
        "convert to a colour space that separates hue from brightness.",
      ],
      ["    mask = cv2.inRange(hsv, LOW, HIGH)", "white where the pixel is yellow."],
      ["    if cv2.countNonZero(mask) < min_pixels:", "too little line visible."],
      ["        return None", "the caller must slow down or stop."],
      ["    m = cv2.moments(mask, binaryImage=True)", "image moments of the mask."],
      ["    cx = m['m10'] / m['m00']", "the horizontal centre of the line pixels."],
      ["    return cx - bgr.shape[1] / 2.0", "the offset from the image centre, in pixels."],
    ),
    walk: [
      "Working in HSV makes the threshold much less sensitive to shadows than a threshold on raw colours.",
      "The pixel count is a confidence measure: a tiny mask is more likely a reflection than a line.",
      "The offset is the input of a steering controller, like the aisle-following controller later in this module.",
    ],
    expect: [
      "A line in the centre gives an offset near 0, a line on the right a positive value.",
      "An image without tape returns None.",
    ],
    fix: [
      [
        "Reflections are detected as tape.",
        "Restrict the region of interest, raise the saturation limit and use an exposure that does not saturate glossy floors.",
      ],
      [
        "The line is lost in shadows.",
        "Add lighting under the robot or use a camera with a wider dynamic range.",
      ],
    ],
    exercise:
      "Convert the pixel offset into metres for a camera 0.4 m above the floor with fx = 525, and print the offset for 20, 50 and 100 pixels.",
    checklist: [
      "The colour range is tuned on real floor images",
      "A minimum pixel count is required",
      "Lighting is controlled",
    ],
  }),
  lesson({
    title: "Shelf detection",
    summary:
      "Find the shelf front in a scan with RANSAC and compute the robot's distance and angle to it.",
    goals: [
      "Explain why RANSAC handles outliers",
      "Fit a line to the shelf face and ignore boxes and people",
      "Compute distance and yaw to the shelf",
    ],
    concept: [
      "To pick from or place at a shelf, the robot must know its pose relative to the shelf face. A 2D scan shows the shelf front as a roughly straight line of points, but boxes sticking out and people in the aisle add outliers. A least-squares fit is pulled away by them. RANSAC (random sample consensus) repeatedly picks two random points, makes a line and counts the points close to it; the line with the most inliers wins.",
      "The inliers are then used for a clean final fit. From the line, the distance is the perpendicular distance from the robot to the line, and the yaw is the angle between the robot's forward axis and the line's normal. The robot rotates and moves until both are inside their tolerances before starting to load or unload.",
    ],
    steps: [
      "Convert the scan to points in the robot frame.",
      "Run RANSAC to find the dominant line.",
      "Compute the distance and the yaw error.",
      "Command the robot to reduce both until they are inside tolerance.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      [
        "def ransac_line(pts, iters=100, tol=0.02, seed=0):",
        "best line as (point, unit direction, inlier count) through the points.",
      ],
      [
        "    rng, best = np.random.default_rng(seed), (None, None, 0)",
        "a seeded generator and the best result so far.",
      ],
      ["    pts = np.asarray(pts, float)", "the points as an array."],
      ["    for _ in range(iters):", "try many random lines."],
      ["        a, b = pts[rng.choice(len(pts), 2, replace=False)]", "pick two different points."],
      ["        d = (b - a) / (np.linalg.norm(b - a) + 1e-9)", "the unit direction between them."],
      [
        "        dist = np.abs((pts - a) @ np.array([-d[1], d[0]]))",
        "each point's perpendicular distance from that line.",
      ],
      ["        n = int((dist < tol).sum())", "how many points lie within 2 cm of the line."],
      ["        if n > best[2]:", "more inliers than the best line so far."],
      ["            best = (a, d, n)", "keep it."],
      ["    return best", "the line with the most support."],
      ["", ""],
      [
        "def distance_and_yaw(a, d):",
        "distance (m) to the line and yaw error (degrees) of the robot to its normal.",
      ],
      ["    normal = np.array([-d[1], d[0]])", "the line's normal."],
      [
        "    dist = abs(float(a @ normal))",
        "the perpendicular distance from the origin (the robot) to the line.",
      ],
      [
        "    yaw = np.degrees(np.arctan2(d[1], d[0]))",
        "the angle of the line direction against the robot's x axis.",
      ],
      [
        "    return round(dist, 3), round(float((yaw + 90.0) % 180.0 - 90.0), 2)",
        "reduce to the range -90..90; a yaw of 0 means the robot is exactly parallel to the shelf.",
      ],
    ),
    walk: [
      "Outliers such as a person in the aisle do not change the result, because they do not support the winning line.",
      "The random seed makes the result repeatable in tests.",
      "The inlier count doubles as a confidence: a low count means there is no clear shelf face.",
    ],
    expect: [
      "For a straight shelf at 0.8 m with 30 % outliers, the function returns a distance near 0.8 and a small yaw.",
      "With only outliers the inlier count is small and the caller must not trust the result.",
    ],
    fix: [
      [
        "The line jumps between scans.",
        "The shelf face has gaps or protrusions. Use more iterations and a larger tolerance, and filter the result over time.",
      ],
      [
        "Distance is wrong by a constant.",
        "The sensor is not at the robot's centre. Transform the points to the frame in which the distance is required.",
      ],
    ],
    exercise:
      "Add 30 random outlier points to a synthetic shelf line and measure the distance error over 200 runs.",
    checklist: [
      "RANSAC has enough iterations",
      "The inlier count is used as a confidence",
      "Distance and yaw have tolerances before loading",
    ],
  }),
];
