import { hash, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 07 · Autonomous Mobile Robot (AMR) — Section B: Mapping & Navigation (lessons 11–20)
export const module07b: LessonSpec[] = [
  lesson({
    title: "SLAM Toolbox",
    summary:
      "Build a warehouse map with SLAM Toolbox in asynchronous mode and save it for navigation.",
    goals: [
      "Configure SLAM Toolbox for online mapping",
      "Explain scan matching and loop closure in the settings",
      "Save the finished map with a service call",
    ],
    concept: [
      "SLAM Toolbox builds a 2D map from LiDAR scans and odometry. It matches every new scan against the map to correct the pose (scan matching) and, when the robot returns to a known place, it adds a loop closure that removes the accumulated drift from the whole trajectory. Online asynchronous mode processes the newest scan and skips old ones if the computer is too slow, which keeps the map live.",
      "Good maps need good driving: move slowly, close loops, avoid rapid rotations and keep people out of the aisle if you can. The parameters that matter most are the map resolution, the laser range, how far the robot must move before a new scan is used, and whether loop closing is on. When the map looks right in RViz, it is saved to a file and loaded later by the navigation stack in localisation mode.",
    ],
    steps: [
      "Drive the robot manually at low speed while SLAM Toolbox runs.",
      "Cover every aisle and return to the start to close a loop.",
      "Check the map in RViz for doubled walls and gaps.",
      "Save the map with the save_map service.",
    ],
    example: hash(
      ["slam_toolbox:", "the node's parameter section."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ["    mode: mapping", "build a new map."],
      ["    odom_frame: odom", "frame of the odometry."],
      ["    map_frame: map", "frame of the map."],
      ["    base_frame: base_link", "the robot's frame."],
      ["    scan_topic: /scan", "the LiDAR topic."],
      ["    resolution: 0.05", "5 cm cells."],
      ["    max_laser_range: 15.0", "use returns up to 15 m."],
      ["    minimum_travel_distance: 0.2", "add a scan only after moving 20 cm..."],
      ["    minimum_travel_heading: 0.2", "...or turning 0.2 rad."],
      ["    do_loop_closing: true", "correct drift when a known place is revisited."],
      ["", ""],
      [
        '# ros2 service call /slam_toolbox/save_map slam_toolbox/srv/SaveMap "{name: {data: warehouse}}"',
        "saves warehouse.yaml and warehouse.pgm, which Nav2 loads later.",
      ],
    ),
    walk: [
      "The travel thresholds prevent redundant scans when the robot stands still, which keeps the map small and clean.",
      "Loop closing is what makes the final map consistent; without it drift shows as doubled walls.",
      "The saved pair of files (a YAML description and an image) is the map that navigation uses.",
    ],
    expect: [
      "After a loop through the aisles the map has single walls and closed loops.",
      "The save_map call creates warehouse.yaml and warehouse.pgm.",
    ],
    fix: [
      [
        "Walls appear twice.",
        "Loop closure failed or the odometry is poor. Drive slower, add more overlap and check the wheel calibration.",
      ],
      [
        "The map has holes.",
        "The robot did not see those areas. Drive through them, or lower the range limit if far returns are noisy.",
      ],
    ],
    exercise:
      "Map the same area twice at 0.3 m/s and at 1.0 m/s and compare the quality of the maps.",
    checklist: [
      "The robot drives slowly during mapping",
      "At least one loop is closed",
      "The map is checked before it is saved",
    ],
  }),
  lesson({
    title: "AMCL localization",
    summary: "Localise the robot in a saved map with a particle filter and set its initial pose.",
    goals: [
      "Explain how a particle filter localises a robot",
      "Configure the motion model noise and the particle count",
      "Set the initial pose and check the convergence",
    ],
    concept: [
      "AMCL (adaptive Monte Carlo localisation) keeps a cloud of particles, each a hypothesis of the robot's pose. When the robot moves, every particle moves with a little random noise (the motion model). When a scan arrives, each particle is weighted by how well the scan matches the map from that pose, and the particles are resampled, so the good ones multiply and the bad ones disappear. The cloud converges on the true pose.",
      "The parameters set the motion noise (alpha1 to alpha5), the number of particles and how much the robot must move before an update. Too few particles lose the robot in ambiguous places; too many use CPU. AMCL needs a starting guess: the initial pose. In a warehouse the robot usually starts at a known docking station, so the initial pose is set from that.",
    ],
    steps: [
      "Load the saved map with the map server.",
      "Set the AMCL frames, the scan topic and the particle limits.",
      "Give the initial pose at the charging dock.",
      "Drive a short distance and watch the particle cloud shrink in RViz.",
    ],
    example: hash(
      ["amcl:", "the AMCL node's parameter section."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ["    base_frame_id: base_link", "the robot's frame."],
      ["    odom_frame_id: odom", "the odometry frame."],
      ["    global_frame_id: map", "the map frame it corrects."],
      ["    scan_topic: scan", "the LiDAR topic."],
      [
        '    robot_model_type: "nav2_amcl::DifferentialMotionModel"',
        "the motion model for a differential-drive robot.",
      ],
      ['    laser_model_type: "likelihood_field"', "a fast and robust way to weight particles."],
      ["    min_particles: 500", "never fewer than 500 hypotheses."],
      ["    max_particles: 2000", "at most 2000, to limit the CPU load."],
      ["    update_min_d: 0.25", "update after moving 25 cm..."],
      ["    update_min_a: 0.2", "...or turning 0.2 rad."],
      ["    set_initial_pose: true", "use the pose below when starting."],
      [
        "    initial_pose: {x: 1.0, y: 2.0, z: 0.0, yaw: 0.0}",
        "the charging dock's position in the map.",
      ],
    ),
    walk: [
      "The adaptive part means the particle count falls when the cloud is confident and rises when the robot is lost.",
      "Update thresholds keep the filter from running on a standing robot, which would collapse the cloud.",
      "The initial pose is data about the real world, so it must be measured and checked, not guessed.",
    ],
    expect: [
      "After starting at the dock the particle cloud is small and stays around the robot.",
      "Pushing the robot away without telling AMCL makes it lose track, which shows why the initial pose is needed.",
    ],
    fix: [
      [
        "The robot jumps around in the map.",
        "The map has few features (long corridors) or the odometry is poor. Add reflectors, improve odometry or reduce the speed.",
      ],
      [
        "Localisation is slow to converge.",
        "The initial pose is far off. Give a better estimate or use global localisation with a spin.",
      ],
    ],
    exercise:
      "Start the robot with a 1 m error in the initial pose and count how many metres it must drive before the cloud converges.",
    checklist: [
      "The initial pose is measured",
      "Particle limits fit the CPU",
      "Convergence is checked before missions",
    ],
  }),
  lesson({
    title: "Nav2 setup",
    summary: "Start the navigation stack with a map and a parameter file from one launch file.",
    goals: [
      "List the main Nav2 servers",
      "Launch Nav2 with a map and parameters",
      "Send a first goal and check that the stack is active",
    ],
    concept: [
      "Nav2 is a set of servers that work together: the map server provides the map, AMCL localises, the planner server computes global paths, the controller server follows them locally, the behaviour server runs recoveries and the BT navigator coordinates everything with a behaviour tree. A lifecycle manager brings all of them up in the right order, and shuts them down cleanly.",
      "The nav2_bringup package has a launch file that starts them all from one parameter file. You pass the map, the parameter file and whether to use simulated time. All later lessons of this module are settings in that parameter file. After launch, the first checks are that every server is active, that the transforms are complete and that a goal sent from RViz makes the robot move.",
    ],
    steps: [
      "Prepare the parameter file with the configuration of every server.",
      "Write a launch file that includes nav2_bringup with the map and parameters.",
      "Start it and check that the lifecycle nodes become active.",
      "Send a goal with the RViz Nav2 Goal tool.",
    ],
    example: hash(
      ["import os", "to build file paths."],
      [
        "from ament_index_python.packages import get_package_share_directory as share",
        "find installed packages.",
      ],
      ["from launch import LaunchDescription", "the launch container."],
      ["from launch.actions import IncludeLaunchDescription", "include another launch file."],
      [
        "from launch.launch_description_sources import PythonLaunchDescriptionSource",
        "a Python launch file.",
      ],
      ["", ""],
      ["def generate_launch_description():", "called by ros2 launch."],
      [
        "    bringup = os.path.join(share('nav2_bringup'), 'launch', 'bringup_launch.py')",
        "the standard Nav2 launch file.",
      ],
      [
        "    args = {'map': '/maps/warehouse.yaml', 'params_file': os.path.join(share('amr_nav'), 'config', 'nav2.yaml'), 'use_sim_time': 'false', 'autostart': 'true'}",
        "the map, our parameters, real time and automatic start-up.",
      ],
      [
        "    return LaunchDescription([IncludeLaunchDescription(PythonLaunchDescriptionSource(bringup), launch_arguments=args.items())])",
        "start the stack with those arguments.",
      ],
      ["", ""],
      ["# ros2 lifecycle get /planner_server", "should print 'active [3]' once the stack is up."],
    ),
    walk: [
      "Everything site-specific is in the arguments and the parameter file, so the launch file is the same for every site.",
      "autostart lets the lifecycle manager activate the servers in the right order without a manual step.",
      "Checking the lifecycle state is the quickest way to see whether a server failed to start.",
    ],
    expect: [
      "All Nav2 servers report 'active' and RViz shows the map, the robot and costmaps.",
      "A goal set in RViz produces a path and the robot follows it.",
    ],
    fix: [
      [
        "A server stays 'unconfigured'.",
        "Its parameters have an error or a plugin is missing. Read the log of that node.",
      ],
      [
        "The stack starts but goals are rejected.",
        "The transform from map to base_link is missing. Check localisation and the TF tree.",
      ],
    ],
    exercise:
      "Write a script that calls the lifecycle get_state service of each Nav2 server and prints a green or red line for each.",
    checklist: [
      "The map and parameters are arguments",
      "All servers are active",
      "The TF tree is complete before goals",
    ],
  }),
  lesson({
    title: "Global planning",
    summary:
      "Configure the global planner, choose between grid-based algorithms and set the goal tolerance.",
    goals: [
      "Explain what the global planner produces",
      "Configure a planner plugin in Nav2",
      "Choose the goal tolerance and unknown-space policy",
    ],
    concept: [
      "The global planner finds a path from the robot's pose to the goal on the global costmap: a complete route through the map that avoids known obstacles and their inflated zones. Grid-based planners such as NavFn (Dijkstra or A*) find shortest paths on the grid; the Smac planners produce smoother paths that respect the robot's turning limits. The planner runs at the start of a mission and again when the path is blocked.",
      "Two settings matter for a warehouse. The goal tolerance says how close to the goal a path may end if the exact cell is blocked. And allow_unknown decides whether the planner may route through unmapped space; for a static warehouse this should normally be off, so the robot only uses places it has seen. The plugin names differ between ROS 2 releases, so check the documentation of your version.",
    ],
    steps: [
      "Choose the planner plugin and its parameters.",
      "Set the goal tolerance to 0.25 m.",
      "Disallow planning through unknown space.",
      "Plan a route in RViz and compare the A* and Dijkstra paths.",
    ],
    example: hash(
      ["planner_server:", "the planner server's parameter section."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ["    expected_planner_frequency: 20.0", "the rate the planner should be able to run at."],
      [
        '    planner_plugins: ["GridBased"]',
        "the list of available planners; here one, named GridBased.",
      ],
      ["    GridBased:", "the settings of that planner."],
      [
        '      plugin: "nav2_navfn_planner/NavfnPlanner"',
        "the NavFn planner (check the plugin name syntax of your release).",
      ],
      [
        "      tolerance: 0.25",
        "a path may end up to 25 cm from the goal if the exact cell is blocked.",
      ],
      ["      use_astar: true", "A* is faster than Dijkstra for a single goal."],
      ["      allow_unknown: false", "never route through space that was not mapped."],
    ),
    walk: [
      "The planner list makes it possible to have several planners and choose one per goal.",
      "A tolerance of 25 cm keeps missions from failing when a pallet stands on the exact goal cell.",
      "Not allowing unknown space is a safety choice: the robot never enters places nobody has checked.",
    ],
    expect: [
      "The path avoids obstacles and stays away from walls by at least the inflation radius.",
      "A goal inside an obstacle produces a path to the nearest free point within the tolerance, or a clear failure.",
    ],
    fix: [
      [
        "The path hugs the walls.",
        "The inflation is too small. Increase the inflation radius in the costmap.",
      ],
      [
        "Plugin fails to load.",
        "The plugin name syntax changed between releases. Use the form of your installed version.",
      ],
    ],
    exercise:
      "Compare NavFn and a Smac planner on the same 30 m route and record the path length and the planning time of each.",
    checklist: [
      "The plugin name matches the release",
      "Unknown space is disallowed for static sites",
      "Tolerances suit the task",
    ],
  }),
  lesson({
    title: "Local planning",
    summary:
      "Configure the local controller that follows the global path and slows down for curves and obstacles.",
    goals: [
      "Explain the role of the local controller",
      "Configure a regulated pure pursuit controller",
      "Set speeds, look-ahead and slow-down behaviour",
    ],
    concept: [
      "The controller server follows the global path at the control rate, typically 20 Hz. It picks a look-ahead point on the path and steers toward it (pure pursuit), while checking the costmap for collisions ahead. The regulated pure pursuit controller adds sensible behaviours: it slows down in tight curves and near obstacles, and it stops before a collision.",
      "The main parameters are the desired speed, the look-ahead distance (longer is smoother but cuts corners), the rotation limits and the collision checking time. In a warehouse the safe speed near shelves and people is lower than in a wide open lane, so speed limits are often set per zone. These settings change how the robot feels: too short a look-ahead makes it wobble, too long makes it cut corners.",
    ],
    steps: [
      "Set the desired linear speed and the look-ahead distance.",
      "Enable the regulation for curvature and proximity.",
      "Set the collision detection time.",
      "Drive a route with curves and check the speed profile.",
    ],
    example: hash(
      ["controller_server:", "the controller server's parameter section."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ["    controller_frequency: 20.0", "run the control loop at 20 Hz."],
      ['    controller_plugins: ["FollowPath"]', "one controller named FollowPath."],
      ["    FollowPath:", "its settings."],
      [
        '      plugin: "nav2_regulated_pure_pursuit_controller::RegulatedPurePursuitController"',
        "the regulated pure pursuit controller.",
      ],
      ["      desired_linear_vel: 0.8", "cruise at 0.8 m/s."],
      ["      lookahead_dist: 0.6", "steer toward a point 0.6 m ahead on the path."],
      ["      use_regulated_linear_velocity_scaling: true", "slow down in tight curves."],
      [
        "      regulated_linear_scaling_min_radius: 0.9",
        "start slowing for curves tighter than 0.9 m.",
      ],
      [
        "      use_cost_regulated_linear_velocity_scaling: true",
        "slow down near obstacles, based on the costmap.",
      ],
      ["      use_collision_detection: true", "check the path ahead for collisions."],
      [
        "      max_allowed_time_to_collision_up_to_carrot: 1.0",
        "stop if a collision is predicted within one second.",
      ],
    ),
    walk: [
      "The scaling options let one setting file give fast travel in open lanes and slow travel in tight places.",
      "The collision time of one second is the space the controller uses to stop before it hits something.",
      "The look-ahead is the main 'feel' parameter and should be tuned on the real robot.",
    ],
    expect: [
      "The robot slows down before a tight corner and speeds up again on a straight lane.",
      "An obstacle placed on the path makes the controller stop with a collision warning.",
    ],
    fix: [
      [
        "The robot wobbles along straight lanes.",
        "The look-ahead is too short or the localisation is noisy. Increase the look-ahead and check AMCL.",
      ],
      [
        "The robot cuts corners in shelves.",
        "The look-ahead is too long. Reduce it, or add inflation so the path keeps away from shelves.",
      ],
    ],
    exercise:
      "Drive the same route with look-ahead values of 0.4, 0.6 and 1.0 m and record the maximum distance from the planned path.",
    checklist: [
      "The speed limits fit the site",
      "Collision checking is on",
      "The look-ahead is tuned on the real robot",
    ],
  }),
  lesson({
    title: "Obstacle avoidance",
    summary:
      "Set up the obstacle and inflation layers of the costmap so the planner keeps a safe clearance.",
    goals: [
      "Explain costmap layers",
      "Configure the obstacle layer with the LiDAR",
      "Tune the inflation radius and the cost scaling",
    ],
    concept: [
      "The costmap is a grid with a cost in every cell: free, occupied or somewhere in between. It is built from layers: the static layer (the saved map), the obstacle layer (live sensor data, marking obstacles and clearing free space) and the inflation layer, which spreads a decreasing cost around obstacles so the planner keeps its distance. The robot's footprint decides which cells are lethal.",
      "The inflation radius should be at least the robot's radius plus a margin; the cost scaling factor sets how quickly the cost falls away. A higher factor lets the robot go closer to walls; a lower one keeps it in the middle of aisles. The obstacle layer also needs raytracing so that objects that leave are cleared from the map, otherwise ghost obstacles stay for ever.",
    ],
    steps: [
      "Add the obstacle layer with the scan as an observation source.",
      "Enable marking and clearing.",
      "Set the inflation radius to the robot radius plus 0.25 m.",
      "Drive past a moving person and check that the cost appears and disappears.",
    ],
    example: hash(
      ["local_costmap:", "the costmap around the robot."],
      ["  local_costmap:", "nested section used by Nav2."],
      ["    ros__parameters:", "ROS 2 parameters follow."],
      ['      plugins: ["obstacle_layer", "inflation_layer"]', "the layers, from bottom to top."],
      ["      robot_radius: 0.35", "the robot's footprint radius in metres."],
      ["      obstacle_layer:", "live obstacles from the LiDAR."],
      ['        plugin: "nav2_costmap_2d::ObstacleLayer"', "the layer type."],
      ["        observation_sources: scan", "one source called scan."],
      [
        "        scan: {topic: /scan, data_type: LaserScan, marking: true, clearing: true, obstacle_max_range: 6.0, raytrace_max_range: 8.0}",
        "mark obstacles up to 6 m and clear free space up to 8 m.",
      ],
      ["      inflation_layer:", "the safety margin around obstacles."],
      ['        plugin: "nav2_costmap_2d::InflationLayer"', "the layer type."],
      ["        inflation_radius: 0.60", "spread cost up to 60 cm from an obstacle."],
      [
        "        cost_scaling_factor: 3.0",
        "how fast the cost falls with distance: higher means the robot may get closer.",
      ],
    ),
    walk: [
      "Marking adds obstacles, clearing removes them by raytracing; both are needed for a map that follows the world.",
      "The inflation radius of 0.6 m is 0.25 m more than the robot radius, which is the safety clearance.",
      "The two ranges differ: clear farther than you mark, so a moved object disappears reliably.",
    ],
    expect: [
      "A pallet in the aisle appears in the costmap with a halo of decreasing cost.",
      "When the pallet is removed the obstacle disappears within a few scans.",
    ],
    fix: [
      [
        "Ghost obstacles stay in the map.",
        "Clearing is off or the raytrace range is too short. Enable clearing and increase raytrace_max_range.",
      ],
      [
        "The robot refuses to enter narrow aisles.",
        "The inflation is too large for the aisle. Reduce the radius, or raise cost_scaling_factor.",
      ],
    ],
    exercise:
      "Find the narrowest aisle width the robot can pass with an inflation radius of 0.6 m and with 0.45 m.",
    checklist: [
      "Marking and clearing are both on",
      "Inflation is larger than the robot radius",
      "Aisle widths are checked against the settings",
    ],
  }),
  lesson({
    title: "Behavior trees",
    summary:
      "Read and edit the Nav2 navigation tree that combines planning, following and recovery.",
    goals: [
      "Read the structure of the default navigation tree",
      "Explain the replan and recovery parts",
      "Adjust the number of retries and recovery order",
    ],
    concept: [
      "Nav2 decides what to do with a behaviour tree. The main tree repeatedly computes a path and follows it; if that fails, it clears the costmaps, spins, waits or backs up and tries again, up to a number of retries. Because the logic is a tree in an XML file, you can change it without changing code: for a warehouse you may remove spinning (dangerous in tight aisles) and wait longer for a person to move away.",
      "The important nodes are the PipelineSequence (run a child and keep the previous ones running), the RateController (limit the replanning rate), the RecoveryNode (retry with recovery on failure) and the RoundRobin of recovery actions. Reading the tree top to bottom explains the robot's behaviour when it gets stuck, which is the most useful thing to know when debugging.",
    ],
    steps: [
      "Open the default navigate_to_pose tree and read it top to bottom.",
      "Remove the spin recovery and add a longer wait.",
      "Set the retry count to 3.",
      "Block the aisle in simulation and watch the recovery sequence in the log.",
    ],
    example: xml(
      ['<BehaviorTree ID="NavigateWithRecovery">', "the navigation tree."],
      [
        '  <RecoveryNode number_of_retries="3" name="NavigateRecovery">',
        "run the child; on failure run the recovery and try again, up to three times.",
      ],
      ['    <PipelineSequence name="NavigateWithReplanning">', "plan and follow at the same time."],
      ['      <RateController hz="1.0">', "replan once per second."],
      [
        '        <ComputePathToPose goal="{goal}" path="{path}" planner_id="GridBased"/>',
        "compute the global path to the goal.",
      ],
      ["      </RateController>", "end of the replanning rate limit."],
      [
        '      <FollowPath path="{path}" controller_id="FollowPath"/>',
        "follow the latest path with the local controller.",
      ],
      ["    </PipelineSequence>", "end of the pipeline."],
      ['    <RoundRobin name="RecoveryActions">', "the recovery; take the actions in turn."],
      [
        '      <ClearEntireCostmap name="ClearLocal" service_name="local_costmap/clear_entirely_local_costmap"/>',
        "first try: clear stale obstacles from the local costmap.",
      ],
      ['      <Wait wait_duration="10"/>', "second try: wait 10 seconds for the aisle to clear."],
      [
        '      <BackUp backup_dist="0.30" backup_speed="0.05"/>',
        "third try: back up 30 cm slowly.",
      ],
      ["    </RoundRobin>", "end of the recovery list."],
      ["  </RecoveryNode>", "end of the retry node."],
      ["</BehaviorTree>", "end of the tree."],
    ),
    walk: [
      "The recovery runs only when the pipeline fails, and it runs one action per failure.",
      "Waiting 10 seconds is often more useful than spinning: it lets a person or a truck pass.",
      "The retry count limits the total effort, after which the mission fails and can be handled by the task manager.",
    ],
    expect: [
      "With the aisle blocked, the robot tries to clear the costmap, then waits, then backs up, and finally reports failure after three rounds.",
      "Removing the blockage during the wait lets the robot continue at once.",
    ],
    fix: [
      [
        "The robot keeps retrying and never fails.",
        "The retry count is missing or too high. Set a limit so the task manager can react.",
      ],
      [
        "The tree file is not found.",
        "The path in the BT navigator parameters is wrong. Check default_nav_to_pose_bt_xml.",
      ],
    ],
    exercise:
      "Add a 'call operator' action at the end of the recovery list that publishes a message when all recoveries fail.",
    checklist: [
      "Recovery actions suit the site",
      "Retries are limited",
      "Failures are reported to the task manager",
    ],
  }),
  lesson({
    title: "Docking",
    summary:
      "Drive the last metre into a charging dock with a simple pose controller and a stop condition.",
    goals: [
      "Explain why docking needs a dedicated controller",
      "Compute velocities from the dock pose in the robot frame",
      "Stop on contact and back off on a bad approach",
    ],
    concept: [
      "The general navigation stack stops a few centimetres from a goal, which is not enough for a charging contact or a conveyor hand-over. Docking is a separate, slow and precise controller that uses the dock's pose from a marker or a reflector detection. It steers to reduce the lateral offset and the angle, then drives straight in.",
      "The controller works in the robot frame. If the lateral offset is larger than a tolerance, the robot must not enter the dock: it backs out and tries again. The stop condition is contact, detected by the charging voltage or a bumper, or a distance reading. Every docking attempt has a timeout and a retry limit, and the outcome is reported to the task manager.",
    ],
    steps: [
      "Get the dock pose in the robot frame (dx forward, dy left, yaw error).",
      "Compute a steering command from the lateral offset and the angle.",
      "Drive slowly and stop when contact is detected.",
      "Back off and retry if the offset is too large or the time is exceeded.",
    ],
    example: hash(
      ["import math", "for atan2."],
      ["", ""],
      [
        "def dock_command(dx, dy, dyaw, contact, v_max=0.08, tol=0.02):",
        "velocity (v, w) for the final approach; dx, dy in metres, dyaw in radians.",
      ],
      ["    if contact:", "the charging contacts touch."],
      ["        return 0.0, 0.0", "stop."],
      [
        "    if abs(dy) > 0.06 and dx < 0.4:",
        "too far to the side when already close to the dock.",
      ],
      ["        return -0.05, 0.0", "back off and align again."],
      ["    heading = math.atan2(dy, max(dx, 0.05))", "the angle toward the dock point."],
      ["    w = 1.5 * heading + 1.0 * dyaw", "steer toward the dock and remove the yaw error."],
      ["    v = min(v_max, 0.5 * dx)", "slow down as the distance shrinks."],
      [
        "    return (v if abs(dy) < tol * 4 else 0.02), max(-0.5, min(0.5, w))",
        "creep when the lateral error is large, and limit the turn rate.",
      ],
      ["", ""],
      [
        "print(dock_command(0.6, 0.02, 0.05, False), dock_command(0.2, 0.1, 0.0, False), dock_command(0.0, 0.0, 0.0, True))",
        "approach, back off and stop.",
      ],
    ),
    walk: [
      "The order of the checks matters: contact first, then the unsafe offset, then the normal approach.",
      "The speed shrinks with the distance and the turn rate is limited, so the approach is gentle and repeatable.",
      "The back-off rule prevents the robot from driving into the dock with a bad alignment.",
    ],
    expect: [
      "At 0.6 m with a 2 cm offset the robot approaches slowly and steers slightly.",
      "At 0.2 m with a 10 cm offset it backs off; on contact it stops.",
    ],
    fix: [
      [
        "The robot oscillates in front of the dock.",
        "The steering gain is too high or the marker pose is noisy. Lower the gains and filter the pose.",
      ],
      [
        "It never makes contact.",
        "The stop distance or the dock pose is off. Check the calibration between the marker and the contacts.",
      ],
    ],
    exercise:
      "Simulate the docking from a 0.5 m lateral offset and count how many retries are needed to succeed.",
    checklist: [
      "Contact is a stop condition",
      "A bad approach is backed out of",
      "Attempts have a timeout and a retry limit",
    ],
  }),
  lesson({
    title: "Multi-floor navigation",
    summary:
      "Keep one map per floor and switch maps and the initial pose when the robot changes floor.",
    goals: [
      "Explain the one-map-per-floor approach",
      "Switch the map with the map server's service",
      "Set the initial pose on the new floor",
    ],
    concept: [
      "A 2D map covers one floor. A robot that uses an elevator needs one map per floor and a way to change between them. The task manager knows which floor each destination is on. To go to another floor, the robot navigates to the elevator, waits for the door, enters, and after the ride loads the map of the new floor and sets its pose at the elevator exit.",
      "The nav2 map server can load a new map at run time with the load_map service. After loading, the localisation must be told where the robot is: the elevator exit position of that floor is known, so it is used as the initial pose. Elevator control itself (calling the car, holding the door) is done through the building's system and must be safe and certified for robots; the code here only handles the map switch.",
    ],
    steps: [
      "Save a map for each floor and note the elevator exit pose on each.",
      "Load the target floor's map with the service after the ride.",
      "Publish the exit pose as the initial pose.",
      "Check that localisation converged before the next mission step.",
    ],
    example: hash(
      ["import rclpy", "the ROS 2 Python client library."],
      ["from nav2_msgs.srv import LoadMap", "the map server's load service."],
      [
        "from geometry_msgs.msg import PoseWithCovarianceStamped",
        "the message used to set the initial pose.",
      ],
      ["", ""],
      [
        "FLOORS = {1: ('/maps/floor1.yaml', (2.0, 1.0, 0.0)), 2: ('/maps/floor2.yaml', (2.0, 1.0, 1.57))}",
        "for each floor: its map and the elevator exit pose (x, y, yaw).",
      ],
      ["", ""],
      [
        "def switch_floor(node, floor):",
        "load the map of a floor and set the robot's pose at the elevator exit.",
      ],
      ["    path, (x, y, yaw) = FLOORS[floor]", "the data of the target floor."],
      [
        "    client = node.create_client(LoadMap, '/map_server/load_map')",
        "a client of the map server's service.",
      ],
      ["    client.wait_for_service(timeout_sec=5.0)", "wait for the map server to be ready."],
      [
        "    future = client.call_async(LoadMap.Request(map_url=path))",
        "ask it to load the new map.",
      ],
      [
        "    rclpy.spin_until_future_complete(node, future, timeout_sec=10.0)",
        "wait for the answer.",
      ],
      [
        "    if future.result() is None or future.result().result != LoadMap.Response.RESULT_SUCCESS:",
        "did the load fail?",
      ],
      [
        "        raise RuntimeError(f'could not load the map of floor {floor}')",
        "stop the mission: never navigate on the wrong map.",
      ],
      ["    pose = PoseWithCovarianceStamped()", "the initial pose message."],
      ["    pose.header.frame_id = 'map'", "expressed in the map frame."],
      [
        "    pose.pose.pose.position.x, pose.pose.pose.position.y = x, y",
        "the elevator exit position.",
      ],
      [
        "    return pose",
        "the caller publishes it on /initialpose and waits for AMCL to converge.",
      ],
    ),
    walk: [
      "The floor table is data: the map path and the exit pose sit together, so they cannot get out of step.",
      "A failed map load stops the mission, because navigating on the wrong floor's map is dangerous.",
      "The function returns the pose instead of publishing it, so the caller can wait until localisation is stable.",
    ],
    expect: [
      "After the switch, RViz shows the map of floor 2 and the robot at the elevator exit.",
      "A wrong map path raises an error and the robot stays put.",
    ],
    fix: [
      [
        "The robot is lost after the switch.",
        "The exit pose is inaccurate or the elevator stops at a different position. Measure the exit pose on every floor and allow a search.",
      ],
      [
        "Costmaps still show the old floor.",
        "The global costmap must be reloaded or cleared after the map change. Call the clear service.",
      ],
    ],
    exercise:
      "Add a check that compares the first scan on the new floor with the map and refuses to continue if the match is poor.",
    checklist: [
      "There is one map and exit pose per floor",
      "A failed map load stops the mission",
      "Localisation is checked before moving on",
    ],
  }),
  lesson({
    title: "Recovery behaviors",
    summary: "Configure the spin, back-up and wait recoveries of the Nav2 behaviour server.",
    goals: [
      "List the standard recovery behaviours",
      "Set their limits so they are safe in narrow aisles",
      "Decide which recoveries a warehouse should allow",
    ],
    concept: [
      "When the robot is stuck, the recovery behaviours try simple actions: spin to look around, back up to free itself, wait for an obstacle to move, or clear the costmap. They are servers in the behaviour server, configured in its parameter file, and called by the navigation tree. Each has limits for speed and acceleration, and checks that the action is collision-free while it runs.",
      "In a warehouse the rules are strict. Spinning in a narrow aisle can hit shelves, so spin may be off or limited. Backing up needs a free area behind the robot, which the behaviour checks with the costmap, and it must be slow. Waiting is usually the best first choice. Which recoveries are allowed belongs to the risk assessment of the site.",
    ],
    steps: [
      "List the plugins the behaviour server should load.",
      "Set conservative speed and acceleration limits.",
      "Turn off spin where aisles are narrow (by removing it from the tree).",
      "Test each recovery in simulation with a blocked aisle.",
    ],
    example: hash(
      ["behavior_server:", "the behaviour server's parameter section."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ['    behavior_plugins: ["spin", "backup", "wait"]', "the recoveries that are available."],
      ["    spin:", "settings of the spin recovery."],
      ['      plugin: "nav2_behaviors/Spin"', "rotate on the spot."],
      ["    backup:", "settings of the back-up recovery."],
      ['      plugin: "nav2_behaviors/BackUp"', "drive backwards."],
      ["    wait:", "settings of the wait recovery."],
      ['      plugin: "nav2_behaviors/Wait"', "do nothing for a while."],
      [
        "    simulate_ahead_time: 2.0",
        "check two seconds of the motion for collisions before and during it.",
      ],
      ["    max_rotational_vel: 0.6", "spin no faster than 0.6 rad/s."],
      ["    min_rotational_vel: 0.2", "and no slower than 0.2 rad/s, so it can overcome friction."],
      ["    rotational_acc_lim: 1.0", "accelerate gently."],
    ),
    walk: [
      "simulate_ahead_time makes each recovery check its own motion in the costmap, so it stops before a collision.",
      "The low rotational limits keep a spinning robot from swinging its load or hitting a shelf edge.",
      "The plugin list is the menu; the tree decides which of them are used and in which order.",
    ],
    expect: [
      "With a blocked aisle the robot runs the allowed recoveries one after another and then fails the mission.",
      "A recovery that would collide is aborted by the behaviour server.",
    ],
    fix: [
      [
        "The robot spins into a shelf.",
        "Spin is not safe in this aisle. Remove it from the tree, or increase the footprint and inflation.",
      ],
      [
        "Recoveries do nothing.",
        "The behaviour server is not active or the tree does not call them. Check the lifecycle state and the tree.",
      ],
    ],
    exercise:
      "Record how often each recovery is used during a shift and decide which ones to keep or remove.",
    checklist: [
      "Recovery limits are conservative",
      "Unsafe recoveries are removed from the tree",
      "Usage of recoveries is monitored",
    ],
  }),
];
