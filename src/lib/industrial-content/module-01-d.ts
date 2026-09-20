import { hash, cpp, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 01 · Section D — Software & ROS 2 (lessons 31–40)
export const module01d: LessonSpec[] = [
  lesson({
    title: "URDF robot modeling",
    summary:
      "Describe links, joints, limits, inertia and collision shapes in a URDF that ROS 2 tools can use.",
    goals: [
      "Write a link with visual, collision and inertial blocks",
      "Write a revolute joint with axis, limits and units",
      "Check a URDF with the standard ROS 2 tools",
    ],
    concept: [
      "A URDF (Unified Robot Description Format) file describes the robot as a tree of links connected by joints. A link has a visual shape for display, a collision shape for planners and an inertial block (mass, centre of mass, inertia) for dynamics. A joint says how a child link moves relative to its parent: its type, origin, axis and limits.",
      "Units are always metres, radians, kilograms and seconds. The joint origin places the child frame, and the axis is expressed in the child frame. Small mistakes here (a wrong axis sign, degrees instead of radians, a missing inertia) silently break planning and simulation, so check the model with check_urdf and view it in RViz before using it.",
    ],
    steps: [
      "Write the base link and the first joint with limits taken from the datasheet.",
      "Add collision geometry that is simpler than the visual mesh.",
      "Add mass and inertia to every link.",
      "Run check_urdf and view the robot in RViz with the joint state publisher GUI.",
    ],
    example: xml(
      ['<robot name="arm">', "the root element with the robot's name."],
      ['  <link name="base_link">', "a rigid body: the robot's base."],
      [
        '    <visual><geometry><cylinder radius="0.08" length="0.10"/></geometry></visual>',
        "what RViz draws; use a light mesh or a simple shape.",
      ],
      [
        '    <collision><geometry><cylinder radius="0.08" length="0.10"/></geometry></collision>',
        "what planners test against: keep it simple so planning stays fast.",
      ],
      [
        '    <inertial><mass value="4.0"/><inertia ixx="0.01" iyy="0.01" izz="0.01" ixy="0" ixz="0" iyz="0"/></inertial>',
        "mass in kg and inertia in kg*m^2, needed by the dynamics lessons.",
      ],
      ["  </link>", "end of the base link."],
      [
        '  <link name="shoulder_link"/>',
        "the next link (shape and inertia omitted here for brevity).",
      ],
      ['  <joint name="joint_1" type="revolute">', "a joint that rotates about an axis."],
      ['    <parent link="base_link"/>', "the joint is attached to the base."],
      ['    <child link="shoulder_link"/>', "and moves the shoulder."],
      [
        '    <origin xyz="0 0 0.10" rpy="0 0 0"/>',
        "where the joint sits relative to the parent (metres, radians).",
      ],
      ['    <axis xyz="0 0 1"/>', "rotation about the z axis of the joint frame."],
      [
        '    <limit lower="-3.14" upper="3.14" velocity="2.0" effort="150"/>',
        "position limits in rad, speed in rad/s and torque in N*m.",
      ],
      ["  </joint>", "end of joint 1."],
      ["</robot>", "end of the robot."],
    ),
    walk: [
      "The visual and collision shapes are separate on purpose: the drawing can be detailed while planning stays fast.",
      "The limit element is required for revolute joints; velocity and effort are what controllers use for scaling.",
      "Every value has a unit, and they are always SI units, so a bare number can be checked against the datasheet.",
    ],
    expect: [
      "check_urdf arm.urdf prints the link tree and finishes without an error.",
      "In RViz, moving the joint slider rotates the shoulder about the vertical axis.",
    ],
    fix: [
      [
        "The robot appears twisted or upside down.",
        "Check the rpy values and the axis of each joint; angles are in radians, not degrees.",
      ],
      [
        "Gazebo or planners ignore a link.",
        "The link has no <inertial> or <collision> block. Add both.",
      ],
    ],
    exercise:
      "Model all six joints of a real robot from its datasheet and compare the tool position from tf2_echo with the manufacturer's forward kinematics.",
    checklist: [
      "Units are SI everywhere",
      "Every link has collision and inertial data",
      "The model passes check_urdf and looks right in RViz",
    ],
  }),
  lesson({
    title: "MoveIt motion planning",
    summary:
      "Plan and execute a collision-free move with MoveGroupInterface after adding an obstacle to the scene.",
    goals: [
      "Explain the roles of the planning scene, planner and controller",
      "Add a collision object to the planning scene",
      "Plan to a named pose and execute only when planning succeeds",
    ],
    concept: [
      "MoveIt is the ROS 2 motion planning framework. It combines the robot model (URDF and SRDF), a planning scene with the obstacles it knows about, a planner (OMPL, Pilz, CHOMP) and a trajectory execution layer that talks to the controllers. A plan is a joint trajectory that avoids collisions with everything in the scene.",
      "The plan is only as safe as the scene: anything missing from the scene, such as a fixture or a person's reach zone, is invisible to the planner. Add collision objects for fixtures and check the return value of every plan call, because a failed plan means no trajectory exists and nothing must move.",
    ],
    steps: [
      "Run the MoveIt Setup Assistant once to create the SRDF, planning groups and named poses.",
      "Launch the move_group node with mock or simulated hardware.",
      "Add a box collision object for the work table.",
      "Plan to the named pose 'ready', check the result, then execute.",
    ],
    example: cpp(
      [
        'moveit::planning_interface::MoveGroupInterface arm(node, "manipulator");',
        "the interface to the arm's planning group.",
      ],
      [
        "moveit::planning_interface::PlanningSceneInterface scene;",
        "lets us add and remove obstacles in the planning scene.",
      ],
      ["", ""],
      ["moveit_msgs::msg::CollisionObject table;", "an obstacle definition."],
      [
        "table.header.frame_id = arm.getPlanningFrame();",
        "positions are given in the planning frame.",
      ],
      ['table.id = "work_table";', "a unique name, so the object can be removed later."],
      [
        "shape_msgs::msg::SolidPrimitive box; box.type = box.BOX; box.dimensions = {1.0, 0.8, 0.05};",
        "a 1.0 x 0.8 x 0.05 m slab.",
      ],
      [
        "geometry_msgs::msg::Pose pose; pose.orientation.w = 1.0; pose.position.z = -0.03;",
        "no rotation; the table surface sits just below the robot base.",
      ],
      [
        "table.primitives.push_back(box); table.primitive_poses.push_back(pose); table.operation = table.ADD;",
        "attach the shape and pose to the object and mark it as 'add'.",
      ],
      ["scene.applyCollisionObject(table);", "the planner now knows the table exists."],
      ["", ""],
      ['arm.setNamedTarget("ready");', "goal: the named pose defined in the SRDF."],
      [
        "moveit::planning_interface::MoveGroupInterface::Plan plan;",
        "container for the trajectory.",
      ],
      [
        "bool ok = (arm.plan(plan) == moveit::core::MoveItErrorCode::SUCCESS);",
        "true only if a collision-free path was found.",
      ],
      [
        'if (ok) arm.execute(plan); else RCLCPP_ERROR(node->get_logger(), "no plan: not moving");',
        "execute a valid plan; otherwise stay put and say why.",
      ],
    ),
    walk: [
      "The collision object is added before planning, so the planner can avoid the table from the start.",
      "The plan call and the execute call are separate steps, which is what makes 'plan, inspect, then move' possible.",
      "A failed plan logs an error and does nothing, which is the safe default.",
    ],
    expect: [
      "In RViz the table appears and the planned path stays above it.",
      "If you move the goal below the table, planning fails and the log prints 'no plan: not moving'.",
    ],
    fix: [
      [
        "Planning always fails.",
        "The start state may be in collision or outside the limits. Check the robot's current state and the collision objects near the base.",
      ],
      [
        "The arm moves through an obstacle.",
        "The obstacle is missing from the planning scene. Add it, or use a sensor such as a depth camera to update the scene.",
      ],
    ],
    exercise:
      "Add a vertical fixture next to the part and plan a pick and a place move that passes around it. Print the number of trajectory points for each plan.",
    checklist: [
      "Fixtures are in the planning scene",
      "Plan results are checked before execute",
      "Named poses come from the SRDF",
    ],
  }),
  lesson({
    title: "ROS 2 control setup",
    summary:
      "Connect a joint trajectory controller to the robot and send a guarded trajectory through the action interface.",
    goals: [
      "Explain the roles of the controller manager, hardware interface and controllers",
      "Send a joint trajectory with the FollowJointTrajectory action",
      "Reject targets outside the joint limits before sending",
    ],
    concept: [
      "ros2_control separates hardware from control. A hardware interface exposes joint states and commands, the controller manager loads and switches controllers, and controllers such as joint_state_broadcaster and joint_trajectory_controller do the work. Applications send goals to the controller's action interface and never touch hardware directly.",
      "Start with mock hardware and confirm that both controllers are active before sending anything. Always check joint names, units (radians), the time_from_start of each point and the limits before creating a goal. The result of the action must also be read: acceptance, feedback, success and cancellation are all outcomes that production code handles.",
    ],
    steps: [
      "Use mock hardware and confirm every URDF joint limit before enabling a controller.",
      "Start robot_state_publisher, controller_manager, joint_state_broadcaster and joint_trajectory_controller.",
      "Inspect claimed interfaces with ros2 control list_hardware_interfaces and confirm both controllers are active.",
      "Compile the C++ client, send a reduced-range goal and inspect the action result.",
    ],
    example: cpp(
      [
        "using Follow = control_msgs::action::FollowJointTrajectory;",
        "give the long action type a short alias named Follow.",
      ],
      [
        "const std::array<double, 6> target{0.0, -0.35, 0.55, 0.0, 0.25, 0.0};",
        "a fixed-size, read-only target: one angle in radians for each of the six joints.",
      ],
      [
        "if (!limits_.contains(target) || !client_->wait_for_action_server(2s)) {",
        "stop if the target is outside the joint limits, or the controller's action server is not available within 2 seconds.",
      ],
      [
        '  RCLCPP_WARN(get_logger(), "target rejected or controller unavailable");',
        "log a warning that explains why nothing will be sent.",
      ],
      ["  return;", "leave the function so no command reaches the robot."],
      ["}", "end of the guard; from here on the target is valid and the server is ready."],
      ["trajectory_msgs::msg::JointTrajectory trajectory;", "create an empty trajectory message."],
      [
        'trajectory.joint_names = {"joint_1", "joint_2", "joint_3", "joint_4", "joint_5", "joint_6"};',
        "name the joints, in the same order as the target values and as the controller expects.",
      ],
      [
        "trajectory_msgs::msg::JointTrajectoryPoint point;",
        "create one waypoint of the trajectory.",
      ],
      [
        "point.positions.assign(target.begin(), target.end());",
        "copy the six target angles into the waypoint.",
      ],
      [
        "point.time_from_start.sec = 4;",
        "allow 4 seconds to reach this waypoint, which keeps the motion slow and gentle.",
      ],
      ["trajectory.points.push_back(point);", "add the waypoint to the trajectory."],
      [
        "Follow::Goal goal; goal.trajectory = trajectory;",
        "create the action goal and attach the trajectory to it.",
      ],
      [
        "client_->async_send_goal(goal, result_aware_options());",
        "send the goal without blocking; the options object handles the response and result later.",
      ],
    ),
    walk: [
      "The guard at the top runs first, so a bad target or a missing controller never produces a command.",
      "Joint names in the message must match the controller's list and order exactly.",
      "The goal is sent asynchronously; the options object is where acceptance, feedback and the final result are handled.",
    ],
    expect: [
      "ros2 control list_controllers shows both controllers as active.",
      "A valid goal ends with a successful result and the joint states reach the target; an out-of-range goal is rejected before sending.",
    ],
    fix: [
      [
        "The action server or controller is unavailable.",
        "List controllers and actions, confirm the expected controller is active, and compare the configured action name with the client.",
      ],
      [
        "The model moves in the wrong direction or to the wrong pose.",
        "Stop the simulation. Check joint order, radians versus metres, frame transforms, and URDF joint origins before changing gains or limits.",
      ],
    ],
    exercise:
      "Create an ament_cmake package named arm_trajectory_client. Reject targets outside the URDF limits before creating the goal, then run three valid simulated poses and one rejected pose.",
    checklist: [
      "Joint names match the controller",
      "Targets use radians and stay inside URDF limits",
      "The controller is active before a goal is sent",
    ],
    source: [
      "Joint trajectory controller",
      "https://control.ros.org/lyrical/doc/ros2_controllers/joint_trajectory_controller/doc/userdoc.html",
    ],
  }),
  lesson({
    title: "Gazebo simulation",
    summary:
      "Launch the arm in Gazebo with a simulated clock and controllers, then test motions without hardware.",
    goals: [
      "Start Gazebo and spawn the robot from its description",
      "Bridge the simulation clock into ROS 2",
      "Explain how simulated and real hardware share the same controllers",
    ],
    concept: [
      "A simulator lets you test control, planning and safety logic before any real robot moves. Gazebo runs the physics; the gz_ros2_control plugin gives the robot a simulated hardware interface, so the same controllers and MoveIt configuration work in simulation and on the real machine. Only the hardware plugin differs.",
      "In simulation the clock comes from Gazebo, not from the computer, so ROS nodes must use simulated time and the clock must be bridged. Simulation is never proof of safety: friction, cable forces, sensor noise and timing differ from the real world, so every result needs a real-hardware check at low speed.",
    ],
    steps: [
      "Add the gz_ros2_control plugin to the URDF and choose the controllers file.",
      "Write a launch file that starts Gazebo, spawns the robot and bridges the clock.",
      "Set use_sim_time to true on every node.",
      "Start the controllers and send a small motion from the previous lesson.",
    ],
    example: hash(
      ["import os", "to build file paths."],
      [
        "from ament_index_python.packages import get_package_share_directory",
        "find installed package folders.",
      ],
      [
        "from launch import LaunchDescription",
        "the container for everything the launch file starts.",
      ],
      [
        "from launch.actions import IncludeLaunchDescription",
        "lets a launch file include another one.",
      ],
      [
        "from launch.launch_description_sources import PythonLaunchDescriptionSource",
        "tells it to read a Python launch file.",
      ],
      ["from launch_ros.actions import Node", "starts a ROS 2 node."],
      ["", ""],
      [
        "def generate_launch_description():",
        "the function ROS 2 calls to get the launch description.",
      ],
      [
        "    gz = IncludeLaunchDescription(PythonLaunchDescriptionSource(os.path.join(get_package_share_directory('ros_gz_sim'), 'launch', 'gz_sim.launch.py')), launch_arguments={'gz_args': '-r empty.sdf'}.items())",
        "start Gazebo with an empty world and run it immediately (-r).",
      ],
      [
        "    spawn = Node(package='ros_gz_sim', executable='create', arguments=['-topic', 'robot_description', '-name', 'arm'])",
        "create the robot in the world from the robot_description topic.",
      ],
      [
        "    clock = Node(package='ros_gz_bridge', executable='parameter_bridge', arguments=['/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock'])",
        "forward Gazebo's clock to ROS 2, so all nodes use simulated time.",
      ],
      ["    return LaunchDescription([gz, spawn, clock])", "everything that starts together."],
    ),
    walk: [
      "The robot is spawned from the same robot_description used on the real machine, so the model does not drift.",
      "Without the clock bridge, nodes that use simulated time wait forever, which is a very common first error.",
      "Real-robot launch files use the same controllers; only the hardware plugin in the URDF changes.",
    ],
    expect: [
      "The robot appears in Gazebo and ros2 topic echo /clock shows increasing time.",
      "The controllers from the previous lesson become active and accept a trajectory goal.",
    ],
    fix: [
      [
        "The robot falls over or explodes on spawn.",
        "Check the inertia and mass values and that the base link is fixed to the world, then reduce the physics step size.",
      ],
      [
        "Controllers never activate.",
        "Nodes are not using simulated time or the clock is not bridged. Set use_sim_time on every node and check /clock.",
      ],
    ],
    exercise:
      "Add a table and a box to the world file and verify that the arm's simulated contact with the table stops a slow downward move.",
    checklist: [
      "The clock is bridged and use_sim_time is set",
      "The same controllers run in simulation and on hardware",
      "Simulation results are re-checked on hardware at low speed",
    ],
  }),
  lesson({
    title: "Planning pipelines",
    summary: "Configure OMPL planners and choose between OMPL, Pilz and CHOMP for different tasks.",
    goals: [
      "Explain what each MoveIt planning pipeline is good at",
      "Read and edit a planner configuration file",
      "Select a planner per task and set a planning time",
    ],
    concept: [
      "A planning pipeline turns a goal into a trajectory. OMPL provides sampling-based planners such as RRTConnect that find a collision-free path in cluttered spaces but produce random-looking paths. Pilz gives deterministic PTP, LIN and CIRC motions with no obstacle avoidance beyond a collision check. CHOMP and STOMP optimise a path for smoothness.",
      "A practical cell uses several: OMPL for free travel around obstacles, Pilz for exact approach and process moves, and time parametrisation to add speeds. The configuration lists the planner algorithms and their parameters. Planning time and the number of attempts limit how long the robot may wait for an answer, which is a cycle-time decision.",
    ],
    steps: [
      "Open the OMPL planning configuration for the arm's planning group.",
      "List RRTConnect as the default planner and add a second planner for comparison.",
      "Set the planning time to 1 second and 5 attempts in the MoveGroup interface.",
      "Compare path length and planning time for both planners.",
    ],
    example: hash(
      ["planner_configs:", "the planner algorithms available to OMPL."],
      ["  RRTConnectkConfigDefault:", "a name for this configuration."],
      [
        "    type: geometric::RRTConnect",
        "grows two trees, one from the start and one from the goal, and connects them; fast and reliable.",
      ],
      ["    range: 0.0", "0.0 lets OMPL choose the step size automatically."],
      ["  PRMstarkConfigDefault:", "a second configuration for comparison."],
      ["    type: geometric::PRMstar", "builds a roadmap: slower to plan, better paths."],
      ["", ""],
      ["manipulator:", "the planning group these settings apply to."],
      [
        "  default_planner_config: RRTConnectkConfigDefault",
        "used when the program does not choose a planner.",
      ],
      ["  planner_configs:", "the choices offered to programs."],
      ["    - RRTConnectkConfigDefault", "fast planning for free travel."],
      ["    - PRMstarkConfigDefault", "better paths where planning time is not critical."],
    ),
    walk: [
      "Naming the configurations lets a program pick one by name in a single line.",
      "RRTConnect is the default because reliability and speed matter more than path beauty for travel moves.",
      "Everything here is configuration, not code, so tuning does not require a rebuild.",
    ],
    expect: [
      "RRTConnect finds paths quickly but they look jagged before smoothing.",
      "PRMstar takes longer and returns shorter paths in the same scene.",
    ],
    fix: [
      [
        "Planning times out in tight spaces.",
        "Increase the planning time and attempts, simplify collision geometry and check that the start and goal are not in collision.",
      ],
      [
        "Paths are long and wandering.",
        "Enable path simplification and smoothing, or use an optimising planner for tasks where path length matters.",
      ],
    ],
    exercise:
      "Run each planner 20 times on the same start and goal and record the median planning time and path length in a table.",
    checklist: [
      "Each task uses a suitable pipeline",
      "Planning time is set on purpose",
      "Planner choices are compared with measurements",
    ],
  }),
  lesson({
    title: "Collision geometry tuning",
    summary:
      "Simplify collision shapes and disable adjacent-link checks so planning is fast and still safe.",
    goals: [
      "Explain why collision shapes should be simple",
      "Disable collision checks only for link pairs that can never collide",
      "Add safety margins to fixtures and the tool",
    ],
    concept: [
      "Planning checks the robot's collision shapes against the scene thousands of times. Detailed meshes are slow, so collision geometry uses boxes, cylinders and spheres slightly larger than the real shape. Too tight and a small model error causes a crash; too loose and the planner refuses valid moves near fixtures.",
      "Pairs of links that are always touching, such as neighbouring links, would report a permanent collision, so the SRDF disables checking for them. Disable only pairs that truly cannot collide (adjacent links, or links that never come near each other), and never disable a pair just to make an error go away.",
    ],
    steps: [
      "Replace the collision meshes with simple shapes 5–10 mm larger than the real links.",
      "Add the tool and gripper as collision shapes attached to the flange.",
      "Generate the allowed collision matrix in the Setup Assistant and review it.",
      "Test moves near a fixture and note that no valid move is wrongly rejected.",
    ],
    example: xml(
      ['<link name="forearm_link">', "a link in the URDF."],
      ["  <collision>", "the shape used for collision checking only."],
      ['    <origin xyz="0 0 0.2" rpy="0 0 0"/>', "centred halfway along a 0.4 m long link."],
      [
        '    <geometry><cylinder radius="0.055" length="0.40"/></geometry>',
        "a cylinder slightly thicker than the real 0.05 m radius: a small safety margin.",
      ],
      ["  </collision>", "end of the collision shape."],
      ["</link>", "end of the link."],
      ["", ""],
      [
        '<disable_collisions link1="base_link" link2="shoulder_link" reason="Adjacent"/>',
        "SRDF: neighbouring links always touch, so ignore that pair.",
      ],
      [
        '<disable_collisions link1="shoulder_link" link2="forearm_link" reason="Never"/>',
        "SRDF: these two can never collide in the allowed joint range, which the Setup Assistant proved by sampling.",
      ],
    ),
    walk: [
      "A cylinder is far cheaper to test than a mesh with thousands of triangles.",
      "The margin (0.055 versus 0.05) protects against small errors without blocking real moves.",
      "Each disabled pair carries a reason, which makes the collision matrix reviewable.",
    ],
    expect: [
      "Planning time drops noticeably compared with mesh collision shapes.",
      "The robot no longer reports a self-collision at the home pose, and still refuses a move that folds the arm into itself.",
    ],
    fix: [
      [
        "The planner reports a collision at the start pose.",
        "A pair that always touches is not in the collision matrix. Regenerate it, or shrink the overlapping shapes.",
      ],
      [
        "The arm hits the fixture in reality.",
        "The margin is too small or the fixture position is wrong. Recheck the calibration and add margin.",
      ],
    ],
    exercise:
      "Measure planning time for the same move with a mesh collision model and with primitive shapes, and report the speed-up.",
    checklist: [
      "Collision shapes are simple and slightly larger",
      "Disabled pairs are justified",
      "Tools are included in collision checking",
    ],
  }),
  lesson({
    title: "Custom IK plugins",
    summary:
      "Plug a closed-form or vendor IK solver into MoveIt through the kinematics plugin interface.",
    goals: [
      "Explain why a custom IK solver can beat the default one",
      "Configure MoveIt to load a kinematics plugin",
      "Outline the class that implements the plugin",
    ],
    concept: [
      "MoveIt asks a kinematics plugin to solve IK many times per plan. The default numerical solvers are general but slower and can miss solutions. An analytic solver written for your arm's geometry (or generated by IKFast) is fast, returns all solutions and is deterministic, which suits high-rate applications.",
      "A plugin is a C++ class that derives from kinematics::KinematicsBase and is exported with pluginlib. It receives a pose and a seed and returns joint values, with the joint names and limits taken from the robot model. MoveIt loads it by name from the kinematics configuration, so no MoveIt code has to change.",
    ],
    steps: [
      "Create a package that depends on moveit_core and pluginlib.",
      "Derive a class from kinematics::KinematicsBase and implement initialize and the IK functions.",
      "Export the class and add a plugin description file.",
      "Set the solver name in kinematics.yaml and compare it with the default.",
    ],
    example: cpp(
      [
        "class ArmIK : public kinematics::KinematicsBase {",
        "our solver, following MoveIt's plugin interface.",
      ],
      ["public:", "the functions MoveIt calls."],
      [
        "  bool initialize(const rclcpp::Node::SharedPtr & node, const moveit::core::RobotModel & model,",
        "called once: receive the robot model and the planning group.",
      ],
      [
        "                  const std::string & group, const std::string & base_frame,",
        "the group and the frame that poses are given in.",
      ],
      [
        "                  const std::vector<std::string> & tip_frames, double discretization) override {",
        "the tip frame(s) the solver must reach.",
      ],
      [
        "    storeValues(model, group, base_frame, tip_frames, discretization);",
        "save the settings in the base class so the helper functions work.",
      ],
      ["    return true;", "initialisation succeeded."],
      ["  }", "end of initialize."],
      [
        "  bool getPositionIK(const geometry_msgs::msg::Pose & pose, const std::vector<double> & seed,",
        "solve one IK problem from a target pose and a starting guess.",
      ],
      [
        "                     std::vector<double> & solution, moveit_msgs::msg::MoveItErrorCodes & error,",
        "output: the joint angles and a result code.",
      ],
      [
        "                     const kinematics::KinematicsQueryOptions & options) const override {",
        "extra options such as whether collisions matter.",
      ],
      [
        "    const auto candidates = analytic_solutions(pose);",
        "closed-form solver: up to 8 joint sets for a spherical-wrist arm.",
      ],
      [
        "    if (candidates.empty()) { error.val = error.NO_IK_SOLUTION; return false; }",
        "no solution: say so with the standard error code.",
      ],
      [
        "    solution = closest_to_seed(candidates, seed);",
        "choose the solution nearest to the current joints, so the arm does not flip posture.",
      ],
      ["    error.val = error.SUCCESS; return true;", "report success."],
      ["  }", "end of getPositionIK (the remaining virtual functions are implemented similarly)."],
      ["};", "end of the class."],
      [
        "PLUGINLIB_EXPORT_CLASS(ArmIK, kinematics::KinematicsBase)",
        "make the class loadable by name at runtime.",
      ],
    ),
    walk: [
      "Only the solver logic is custom; joint limits, frames and group names come from the robot model through initialize().",
      "Choosing the candidate closest to the seed prevents sudden elbow or wrist flips during a Cartesian move.",
      "The kinematics.yaml entry kinematics_solver: arm_ik/ArmIK is all MoveIt needs to use it.",
    ],
    expect: [
      "MoveIt logs that the custom kinematics plugin was loaded for the manipulator group.",
      "IK success rate stays at 100 % for reachable poses and solve time drops to microseconds.",
    ],
    fix: [
      [
        "MoveIt cannot find the plugin.",
        "Check the plugin description XML, the export macro and that the package is built and sourced in the same terminal.",
      ],
      [
        "The solver returns poses the robot cannot reach.",
        "Filter the candidates by the joint limits from the robot model before choosing one.",
      ],
    ],
    exercise:
      "Write a unit test that checks every solution of your solver with forward kinematics and asserts that the tool pose error is below 1e-6 m.",
    checklist: [
      "Solutions are verified with forward kinematics",
      "Joint limits are applied to candidates",
      "The plugin is configured in kinematics.yaml",
    ],
  }),
  lesson({
    title: "Offline programming (RoboDK)",
    summary:
      "Program and simulate a robot path in RoboDK's Python API before it runs on the real cell.",
    goals: [
      "Explain the benefits and limits of offline programming",
      "Create a target-based program with the RoboDK Python API",
      "Check reachability and collisions before generating a program",
    ],
    concept: [
      "Offline programming (OLP) builds and tests the robot program on a computer model of the cell instead of on the real robot. It saves production downtime, allows collision and reach checking in advance and lets you generate vendor-specific programs from one description. RoboDK is a widely used tool with libraries for many robot brands and a Python API.",
      "The simulated cell is only as accurate as its data. Positions of fixtures, tool geometry and the robot's calibration must be brought from the real cell with a calibration step (a reference frame on the real table), or the program will be shifted. Always test at low speed the first time on the real robot.",
    ],
    steps: [
      "Model the cell in RoboDK: robot, tool, table and part.",
      "Create a reference frame for the part with the measured position.",
      "Write the Python script that creates targets and moves between them.",
      "Run the simulation, look for reach and collision warnings and generate the robot program.",
    ],
    example: hash(
      [
        "from robodk import robolink, robomath",
        "the RoboDK Python API (check the package name in your RoboDK version).",
      ],
      ["", ""],
      ["RDK = robolink.Robolink()", "connect to the running RoboDK station."],
      [
        "robot = RDK.Item('UR5e', robolink.ITEM_TYPE_ROBOT)",
        "find the robot model by its name in the station tree.",
      ],
      [
        "frame = RDK.Item('PartFrame', robolink.ITEM_TYPE_FRAME)",
        "the reference frame that holds the part's measured position.",
      ],
      ["robot.setPoseFrame(frame)", "make all following targets relative to the part."],
      ["", ""],
      ["robot.setSpeed(200)", "linear speed 200 mm/s in the simulation."],
      [
        "above = robomath.transl(0, 0, 100) * robomath.rotx(robomath.pi)",
        "a pose 100 mm above the part with the tool pointing down.",
      ],
      [
        "robot.MoveJ(above)",
        "joint-space move to the approach pose: fastest and safest for travel.",
      ],
      [
        "robot.MoveL(robomath.transl(0, 0, 0) * robomath.rotx(robomath.pi))",
        "straight-line move down to the part.",
      ],
      ["robot.MoveL(above)", "retreat in a straight line."],
    ),
    walk: [
      "Working in the part's frame means the program stays valid if the part moves; only the frame changes.",
      "MoveJ for travel and MoveL for approach follow the motion-type rules from the PTP, LIN and CIRC lesson.",
      "RoboDK warns about singularities, reach and collisions during simulation, before any real motion happens.",
    ],
    expect: [
      "The simulation runs the approach, descent and retreat without warnings.",
      "Generating the program creates a file in the robot's own language for the real controller.",
    ],
    fix: [
      [
        "The real robot is shifted from the simulation.",
        "The reference frame or tool frame was not calibrated. Measure the part frame with the robot and update it in the station.",
      ],
      [
        "A move is unreachable in simulation.",
        "Move the part, change the tool orientation or split the move; the warning tells you which target failed.",
      ],
    ],
    exercise:
      "Add four parts on the table, loop over their frames and generate one program that picks and places all of them.",
    checklist: [
      "Frames are calibrated on the real cell",
      "Reach and collision warnings are resolved",
      "The first real run is at low speed",
    ],
  }),
  lesson({
    title: "Safety standards ISO 10218",
    summary:
      "Understand what ISO 10218-1 and -2 require of robots and robot systems and turn the cell's safety facts into a reviewable checklist.",
    goals: [
      "Explain the split between robot (part 1) and system integration (part 2)",
      "Name the main protective measures around an industrial robot",
      "Record the safety facts of a cell in a checklist that can be reviewed",
    ],
    concept: [
      "ISO 10218-1 covers the design of the industrial robot itself, and ISO 10218-2 covers the robot system and its integration into a cell. Together they require a risk assessment and protective measures: guarding and interlocks, emergency stops, restricted space limits, safe speed in manual mode and validated safety functions. Related standards such as ISO 13849-1 define the required performance level (PL) of each safety function.",
      "Software written with ROS 2 is not a safety function. Stops, guarding and speed limits must be implemented by certified hardware or safety controllers, and the application only sits on top. A useful habit is to keep the safety facts of a cell as data (which stop, which PL, which fence interlock, what test date) so a reviewer can check them, and so an application can refuse to start when a fact is missing.",
    ],
    steps: [
      "List every hazard of the cell in a risk assessment: crushing, impact, tool hazards, ejected parts.",
      "For each hazard write the protective measure and the safety function that implements it.",
      "Write the facts as a checklist file and add a script that fails when an item is missing.",
      "Review the checklist with a qualified safety person before real operation.",
    ],
    example: hash(
      [
        "REQUIRED = ['emergency_stop', 'fence_interlock', 'safe_speed_manual', 'restricted_space', 'risk_assessment']",
        "the safety facts every cell record must contain.",
      ],
      ["", ""],
      [
        "cell = {",
        "the cell's safety record (example values only; real ones come from the validated system).",
      ],
      [
        "    'emergency_stop': {'category': 1, 'pl': 'd', 'tested': '2026-08-14'},",
        "emergency stop: stop category, required performance level and the last test date.",
      ],
      [
        "    'fence_interlock': {'pl': 'd', 'tested': '2026-08-14'},",
        "guard door interlock with its performance level.",
      ],
      [
        "    'safe_speed_manual': {'limit_mm_s': 250},",
        "reduced speed limit for manual (teach) mode.",
      ],
      [
        "    'risk_assessment': {'document': 'RA-2026-04', 'approved_by': 'safety officer'},",
        "reference to the signed risk assessment.",
      ],
      ["}", "end of the record."],
      ["", ""],
      ["def missing(record):", "which required safety facts are absent?"],
      [
        "    return [name for name in REQUIRED if name not in record]",
        "list every required item that is not in the record.",
      ],
      ["", ""],
      ["gaps = missing(cell)", "run the check."],
      ["print('missing:', gaps)", "prints ['restricted_space']: that fact is not documented yet."],
      [
        "assert not gaps, 'cell record incomplete: do not start production'",
        "an incomplete record blocks start-up instead of being ignored.",
      ],
    ),
    walk: [
      "The record is data, so reviewers can read it, version it and compare it with the validated system.",
      "The check finds a missing fact automatically, which is easy to overlook in a document.",
      "This script never replaces the safety controller: it only refuses to start the application when documentation is incomplete.",
    ],
    expect: [
      "The script prints ['restricted_space'] and the assertion fails until that fact is added.",
      "After you add the missing item the script passes silently.",
    ],
    fix: [
      [
        "The team assumes ROS 2 handles the stop.",
        "State clearly that stopping is done by the certified safety chain. The application only reacts to it.",
      ],
      [
        "Test dates are missing or old.",
        "Add a maximum age to each check, so an out-of-date test also blocks start-up.",
      ],
    ],
    exercise:
      "Add a rule that fails when any safety-function test is older than 12 months and prints the item name and its date.",
    checklist: [
      "Safety functions are hardware or certified, not ROS code",
      "The risk assessment is documented and approved",
      "The cell record blocks start-up when incomplete",
    ],
  }),
  lesson({
    title: "Full industrial cell integration",
    summary:
      "Bring the robot, controllers, planning, vision, I/O and safety record together in one launch file.",
    goals: [
      "Start the complete cell with a single launch file",
      "Order start-up so hardware and safety come before motion",
      "Verify the cell with a checklist after launch",
    ],
    concept: [
      "A finished cell is many pieces working together: the robot description and state publisher, the controller manager and controllers, MoveIt, the vision and conveyor nodes, the I/O drivers and a supervisor that owns the cell's state. A launch file describes all of it in one place so the cell starts the same way every time.",
      "Start-up order matters. First the hardware and the safety record, then the controllers, then planning, and only then the application that commands motion. The supervisor should refuse motion until every part reports ready, and it should stop everything cleanly when any part fails. A post-launch checklist proves the cell is healthy before production.",
    ],
    steps: [
      "Create one launch package for the cell and include the robot, controller and MoveIt launch files.",
      "Add the vision, conveyor and I/O nodes with their configuration files.",
      "Add the supervisor node and start it last.",
      "After launch, run the checklist: controllers active, planning scene loaded, cameras publishing, safety record valid.",
    ],
    example: hash(
      ["from launch import LaunchDescription", "the container for everything the cell starts."],
      [
        "from launch.actions import IncludeLaunchDescription, TimerAction",
        "include other launch files and delay start-up steps.",
      ],
      [
        "from launch.launch_description_sources import PythonLaunchDescriptionSource",
        "read Python launch files.",
      ],
      ["from launch_ros.actions import Node", "start ROS 2 nodes."],
      [
        "from ament_index_python.packages import get_package_share_directory as share",
        "short helper to find installed package folders.",
      ],
      ["import os", "build file paths."],
      ["", ""],
      ["def generate_launch_description():", "called by ros2 launch."],
      [
        "    robot = IncludeLaunchDescription(PythonLaunchDescriptionSource(os.path.join(share('arm_bringup'), 'launch', 'robot.launch.py')))",
        "step 1: robot description, state publisher and the controller manager.",
      ],
      [
        "    moveit = IncludeLaunchDescription(PythonLaunchDescriptionSource(os.path.join(share('arm_moveit'), 'launch', 'move_group.launch.py')))",
        "step 2: motion planning (needs the robot description).",
      ],
      [
        "    vision = Node(package='cell_vision', executable='detector', parameters=[os.path.join(share('cell_config'), 'vision.yaml')])",
        "step 3: camera detection with its configuration file.",
      ],
      [
        "    supervisor = Node(package='cell_supervisor', executable='supervisor', parameters=[{'require_safety_record': True}])",
        "the node that owns the cell state and refuses motion until everything is ready.",
      ],
      [
        "    delayed = TimerAction(period=5.0, actions=[supervisor])",
        "start the supervisor after the others, so it finds them running.",
      ],
      [
        "    return LaunchDescription([robot, moveit, vision, delayed])",
        "the whole cell in one command: ros2 launch cell_bringup cell.launch.py.",
      ],
    ),
    walk: [
      "Each piece is its own launch file or node, so it can be tested alone and reused in another cell.",
      "The supervisor starts last and checks for the others, which enforces the safe start-up order.",
      "The parameter file for vision keeps site-specific settings out of the code.",
    ],
    expect: [
      "One command starts the whole cell, and ros2 node list shows every expected node.",
      "The supervisor reports 'ready' only after controllers, planning and the safety record pass their checks.",
    ],
    fix: [
      [
        "Some nodes start before their dependencies.",
        "Use the supervisor's ready checks or a delay only as a last resort; prefer lifecycle nodes that report when they are active.",
      ],
      [
        "The cell works on one PC but not another.",
        "Pin package versions, list every parameter file in the launch package and record the environment in the deployment notes.",
      ],
    ],
    exercise:
      "Write a post-launch check script that reads controller state, planning scene and camera topics, and prints a green or red line for each item.",
    checklist: [
      "One launch file starts the whole cell",
      "Safety and hardware start before motion",
      "A post-launch check confirms the cell is healthy",
    ],
  }),
];
