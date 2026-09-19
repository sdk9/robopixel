export type Lab = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  concept?: string[];
  walkthrough?: string[];
  duration: string;
  prerequisites: string[];
  files: string[];
  setup: string;
  code: string;
  run: string;
  expected: string[];
  recovery: string[];
  sourceLabel: string;
  sourceHref: string;
};

const labCore: Lab[] = [
  {
    slug: "install-lyrical",
    number: "01",
    title: "Install ROS 2 Lyrical",
    summary: "Prepare Ubuntu 26.04 and install the supported ROS 2 desktop packages.",
    duration: "45 min",
    prerequisites: [
      "Ubuntu 26.04 (Resolute), 64-bit",
      "An administrator account",
      "A reliable internet connection",
    ],
    files: ["/opt/ros/lyrical/", "~/.bashrc"],
    setup: `sudo apt install software-properties-common curl\nsudo add-apt-repository universe\nexport ROS_APT_SOURCE_VERSION=$(curl -s https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest | grep -F 'tag_name' | awk -F'"' '{print $4}')\n. /etc/os-release\ncurl -L -o /tmp/ros2-apt-source.deb "https://github.com/ros-infrastructure/ros-apt-source/releases/download/\${ROS_APT_SOURCE_VERSION}/ros2-apt-source_\${ROS_APT_SOURCE_VERSION}.\${UBUNTU_CODENAME:-$VERSION_CODENAME}_all.deb"\nsudo dpkg -i /tmp/ros2-apt-source.deb\nsudo apt update && sudo apt upgrade\nsudo apt install ros-lyrical-desktop ros-dev-tools python3-colcon-common-extensions\nsource /opt/ros/lyrical/setup.bash\necho $ROS_DISTRO`,
    code: `# Add this only after the one-time source command works.\necho 'source /opt/ros/lyrical/setup.bash' >> ~/.bashrc`,
    run: `ros2 run demo_nodes_cpp talker\n# In a second sourced terminal:\nros2 run demo_nodes_py listener`,
    expected: [
      "echo $ROS_DISTRO prints lyrical",
      "The talker publishes numbered messages",
      "The listener receives the same messages",
    ],
    recovery: [
      "If ros2 is not found, source /opt/ros/lyrical/setup.bash in that terminal.",
      "If the package cannot be located, confirm the machine is Ubuntu 26.04 and the ROS apt source is configured from the official installation guide.",
    ],
    sourceLabel: "ROS 2 Lyrical installation",
    sourceHref: "https://docs.ros.org/en/lyrical/Installation.html",
  },
  {
    slug: "workspace",
    number: "02",
    title: "Create the robotics workspace",
    summary: "Build a clean colcon overlay at ~/robot_ws and understand each generated directory.",
    duration: "35 min",
    prerequisites: ["ROS 2 Lyrical sourced", "colcon installed"],
    files: ["~/robot_ws/src/", "~/robot_ws/build/", "~/robot_ws/install/", "~/robot_ws/log/"],
    setup: `source /opt/ros/lyrical/setup.bash\nmkdir -p ~/robot_ws/src\ncd ~/robot_ws\ncolcon build --symlink-install`,
    code: `# Source the overlay after every successful build.\nsource ~/robot_ws/install/setup.bash\nprintenv AMENT_PREFIX_PATH`,
    run: `cd ~/robot_ws\ncolcon list\ncolcon build --symlink-install\nsource install/setup.bash`,
    expected: [
      "The build finishes without failed packages",
      "install/setup.bash exists",
      "The workspace path appears before /opt/ros/lyrical in AMENT_PREFIX_PATH",
    ],
    recovery: [
      "Remove build, install and log only when a clean rebuild is necessary; never remove src.",
      "Build one package with --packages-select PACKAGE_NAME to isolate errors.",
    ],
    sourceLabel: "ROS 2 colcon tutorial",
    sourceHref:
      "https://docs.ros.org/en/lyrical/Tutorials/Beginner-Client-Libraries/Colcon-Tutorial.html",
  },
  {
    slug: "cpp-package",
    number: "03",
    title: "Build an ament C++ package",
    summary: "Create a package with declared dependencies and an installable rclcpp executable.",
    duration: "60 min",
    prerequisites: ["A working ~/robot_ws", "C++ Beginner lesson 1"],
    files: [
      "src/robot_basics/package.xml",
      "src/robot_basics/CMakeLists.txt",
      "src/robot_basics/src/status_node.cpp",
    ],
    setup: `cd ~/robot_ws/src\nros2 pkg create --build-type ament_cmake --license Apache-2.0 robot_basics --dependencies rclcpp std_msgs`,
    code: `#include <memory>\n#include "rclcpp/rclcpp.hpp"\n\nclass StatusNode final : public rclcpp::Node {\npublic:\n  StatusNode() : Node("status_node") {\n    RCLCPP_INFO(get_logger(), "robot basics ready");\n  }\n};\n\nint main(int argc, char ** argv) {\n  rclcpp::init(argc, argv);\n  rclcpp::spin(std::make_shared<StatusNode>());\n  rclcpp::shutdown();\n  return 0;\n}`,
    run: `# Add these exact CMakeLists.txt rules after find_package(rclcpp REQUIRED):\n# add_executable(status_node src/status_node.cpp)\n# ament_target_dependencies(status_node rclcpp std_msgs)\n# install(TARGETS status_node DESTINATION lib/\${PROJECT_NAME})\ncd ~/robot_ws\ncolcon build --packages-select robot_basics --symlink-install --event-handlers console_direct+\nsource install/setup.bash\nros2 run robot_basics status_node`,
    expected: [
      "The package builds without warnings",
      "ros2 run locates status_node",
      "The log prints robot basics ready",
    ],
    recovery: [
      "If the executable is not found, verify install(TARGETS status_node DESTINATION lib/${PROJECT_NAME}).",
      "If a header is missing, add both find_package and ament_target_dependencies entries.",
    ],
    sourceLabel: "Creating a ROS 2 package",
    sourceHref:
      "https://docs.ros.org/en/lyrical/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html",
  },
  {
    slug: "topics-cpp",
    number: "04",
    title: "C++ publisher and subscriber",
    summary: "Exchange typed state over a topic and inspect the graph, rate and QoS.",
    duration: "90 min",
    prerequisites: ["Lab 03 complete", "Basic C++ classes and lambdas"],
    files: ["src/robot_topics/src/joint_publisher.cpp", "src/robot_topics/src/joint_monitor.cpp"],
    setup: `cd ~/robot_ws/src\nros2 pkg create --build-type ament_cmake --license Apache-2.0 robot_topics --dependencies rclcpp std_msgs`,
    code: `// joint_publisher.cpp (add standard and ROS includes plus init/spin main)\nclass JointPublisher : public rclcpp::Node {\npublic:\n  JointPublisher() : Node("joint_publisher") {\n    pub_ = create_publisher<std_msgs::msg::Float64>("joint_target", 10);\n    timer_ = create_wall_timer(std::chrono::milliseconds(100), [this] {\n      std_msgs::msg::Float64 msg; msg.data = target_;\n      pub_->publish(msg); target_ += 0.01;\n    });\n  }\nprivate:\n  double target_{0.0};\n  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr pub_;\n  rclcpp::TimerBase::SharedPtr timer_;\n};\n\n// joint_monitor.cpp\nclass JointMonitor : public rclcpp::Node {\npublic:\n  JointMonitor() : Node("joint_monitor") {\n    sub_ = create_subscription<std_msgs::msg::Float64>(\n      "joint_target", 10, [this](std_msgs::msg::Float64::ConstSharedPtr msg) {\n        RCLCPP_INFO(get_logger(), "target %.3f", msg->data);\n      });\n  }\nprivate:\n  rclcpp::Subscription<std_msgs::msg::Float64>::SharedPtr sub_;\n};`,
    run: `colcon build --packages-select robot_topics --symlink-install\nsource install/setup.bash\nros2 run robot_topics joint_publisher\n# Second terminal:\nros2 topic echo /joint_target\nros2 topic hz /joint_target`,
    expected: [
      "/joint_target has type std_msgs/msg/Float64",
      "The monitor receives increasing values",
      "ros2 topic hz reports approximately 10 Hz",
    ],
    recovery: [
      "Source the same overlay in every terminal.",
      "Use ros2 topic info /joint_target --verbose to compare publisher and subscriber QoS.",
    ],
    sourceLabel: "C++ publisher and subscriber",
    sourceHref:
      "https://docs.ros.org/en/lyrical/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Cpp-Publisher-And-Subscriber.html",
  },
  {
    slug: "services-actions",
    number: "05",
    title: "Services and motion actions",
    summary:
      "Use services for short requests and actions for cancellable, feedback-producing work.",
    duration: "2 hours",
    prerequisites: ["Lab 04 complete", "Callbacks and smart pointers"],
    files: ["src/robot_interfaces/action/MoveJoint.action", "src/robot_motion/src/move_server.cpp"],
    setup: `# MoveJoint.action\nfloat64 target\n---\nbool reached\nstring message\n---\nfloat64 remaining`,
    code: `using MoveJoint = robot_interfaces::action::MoveJoint;\nauto server = rclcpp_action::create_server<MoveJoint>(\n  this, "move_joint",\n  [](const auto &, const auto &) { return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE; },\n  [](const auto) { return rclcpp_action::CancelResponse::ACCEPT; },\n  [this](const auto goal_handle) { execute(goal_handle); });`,
    run: `colcon build --packages-select robot_interfaces robot_motion\nsource install/setup.bash\nros2 action list -t\nros2 action send_goal /move_joint robot_interfaces/action/MoveJoint "{target: 0.5}" --feedback`,
    expected: [
      "The action appears with its custom type",
      "Feedback decreases toward zero",
      "A cancel request stops simulated motion and returns a canceled result",
    ],
    recovery: [
      "Generate interfaces in a dedicated ament_cmake package with rosidl_default_generators.",
      "Never block the executor callback; run accepted goals on controlled worker logic.",
    ],
    sourceLabel: "C++ action server and client",
    sourceHref:
      "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/Writing-an-Action-Server-Client/Cpp.html",
  },
  {
    slug: "launch-parameters",
    number: "06",
    title: "Launch and parameters",
    summary: "Start a repeatable robot system and load reviewed limits from YAML.",
    duration: "75 min",
    prerequisites: ["At least two working nodes", "A package with launch and config directories"],
    files: ["src/robot_bringup/launch/system.launch.py", "src/robot_bringup/config/limits.yaml"],
    setup: `status_node:\n  ros__parameters:\n    max_speed: 0.25\n    publish_rate: 10.0`,
    code: `from pathlib import Path\nfrom ament_index_python.packages import get_package_share_directory\nfrom launch import LaunchDescription\nfrom launch_ros.actions import Node\n\ndef generate_launch_description():\n    config = str(Path(get_package_share_directory('robot_bringup')) / 'config' / 'limits.yaml')\n    return LaunchDescription([\n        Node(package='robot_basics', executable='status_node',\n             parameters=[config], output='screen')\n    ])`,
    run: `ros2 launch robot_bringup system.launch.py\nros2 param get /status_node max_speed\nros2 param set /status_node max_speed 0.2`,
    expected: [
      "The launch file starts every declared node",
      "max_speed loads as 0.25",
      "Runtime changes are accepted only inside the node's declared safe range",
    ],
    recovery: [
      "Install launch and config directories from CMakeLists.txt.",
      "Declare every parameter before reading it and validate safety-critical changes in an on-set callback.",
    ],
    sourceLabel: "ROS 2 launch tutorials",
    sourceHref: "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/Launch/Launch-Main.html",
  },
  {
    slug: "frames-description",
    number: "07",
    title: "tf2, URDF and xacro",
    summary: "Describe a small arm, publish its state and verify every coordinate frame.",
    duration: "2 hours",
    prerequisites: ["Lab 06 complete", "Radians and coordinate frames"],
    files: [
      "src/training_arm_description/urdf/training_arm.urdf.xacro",
      "src/training_arm_description/launch/display.launch.py",
    ],
    setup: `sudo apt install ros-lyrical-tf2-tools ros-lyrical-robot-state-publisher ros-lyrical-joint-state-publisher-gui ros-lyrical-rviz2`,
    code: `<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="training_arm">\n  <link name="base_link">\n    <visual><geometry><box size="0.3 0.3 0.1"/></geometry></visual>\n    <collision><geometry><box size="0.3 0.3 0.1"/></geometry></collision>\n  </link>\n  <link name="tool0">\n    <visual><geometry><cylinder radius="0.03" length="0.4"/></geometry></visual>\n    <collision><geometry><cylinder radius="0.03" length="0.4"/></geometry></collision>\n  </link>\n  <joint name="tool_joint" type="fixed">\n    <parent link="base_link"/><child link="tool0"/>\n    <origin xyz="0 0 0.25" rpy="0 0 0"/>\n  </joint>\n</robot>`,
    run: `ros2 launch training_arm_description display.launch.py\nros2 run tf2_ros tf2_echo base_link tool0\nros2 run tf2_tools view_frames`,
    expected: [
      "RViz shows the model without TF errors",
      "tf2_echo reports the 0.5 m transform",
      "view_frames creates a connected frame tree",
    ],
    recovery: [
      "Every non-root link must have exactly one parent joint.",
      "Use SI units: metres, kilograms, seconds and radians.",
    ],
    sourceLabel: "ROS 2 URDF tutorials",
    sourceHref: "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/URDF/URDF-Main.html",
  },
  {
    slug: "ros2-control",
    number: "08",
    title: "ros2_control and diagnostics",
    summary:
      "Connect a simulated arm to controller_manager, command a trajectory and record evidence.",
    duration: "2–3 hours",
    prerequisites: ["Lab 07 complete", "Industrial Robots access for model-specific work"],
    files: [
      "src/training_arm_description/urdf/training_arm.ros2_control.xacro",
      "src/training_arm_bringup/config/controllers.yaml",
    ],
    setup: `sudo apt install ros-lyrical-ros2-control ros-lyrical-ros2-controllers\nros2 control list_hardware_interfaces\nros2 control list_controllers`,
    code: `<!-- Include this block inside the robot description. -->\n<ros2_control name="TrainingArm" type="system">\n  <hardware><plugin>mock_components/GenericSystem</plugin></hardware>\n  <joint name="joint_1">\n    <command_interface name="position"/>\n    <state_interface name="position"/>\n    <state_interface name="velocity"/>\n  </joint>\n</ros2_control>\n\n# controllers.yaml\ncontroller_manager:\n  ros__parameters:\n    update_rate: 100\n    joint_state_broadcaster:\n      type: joint_state_broadcaster/JointStateBroadcaster\n    arm_controller:\n      type: joint_trajectory_controller/JointTrajectoryController\narm_controller:\n  ros__parameters:\n    joints: [joint_1]\n    command_interfaces: [position]\n    state_interfaces: [position, velocity]`,
    run: `ros2 run controller_manager spawner joint_state_broadcaster\nros2 run controller_manager spawner arm_controller\nros2 control list_controllers\nros2 bag record /joint_states /arm_controller/controller_state`,
    expected: [
      "Both controllers report active",
      "Command and state interfaces are claimed correctly",
      "The bag records joint state and controller state topics",
    ],
    recovery: [
      "Use mock hardware until stop, limit and recovery behavior are proven.",
      "A robot_description change requires restarting controller_manager; live URDF reload is not supported.",
    ],
    sourceLabel: "ros2_control controller manager",
    sourceHref:
      "https://control.ros.org/lyrical/doc/ros2_control/controller_manager/doc/userdoc.html",
  },
];

const labConcepts: Record<string, string[]> = {
  "install-lyrical": [
    "The ROS distribution and Ubuntu release are a tested pair. Using the matching package repository avoids mixing incompatible libraries.",
    "Sourcing changes only the current terminal's search paths. Test it once before adding it to your shell startup file.",
  ],
  workspace: [
    "A colcon workspace separates source files from generated build, install, and log data. Only src is authored by you.",
    "The installed ROS distribution is the underlay; your workspace is an overlay. Sourcing the overlay makes your newly built packages discoverable.",
  ],
  "cpp-package": [
    "A ROS 2 package is the smallest buildable, shareable unit. package.xml declares metadata and dependencies; CMakeLists.txt explains how C++ targets are built and installed.",
    "A node joins the ROS graph after rclcpp is initialized. spin keeps processing callbacks until shutdown is requested.",
  ],
  "topics-cpp": [
    "Topics carry ongoing streams without a direct request. Publishers and subscribers agree on a message type and compatible Quality of Service settings.",
    "The timer callback publishes every 100 ms, so a healthy graph should show about 10 messages per second.",
  ],
  "services-actions": [
    "Services fit short request-response work. Actions add goal acceptance, feedback, results, and cancellation for work that takes time.",
    "Motion belongs in an action because an operator must be able to observe progress and request cancellation.",
  ],
  "launch-parameters": [
    "Launch files describe how a complete system starts. Parameters move reviewed configuration out of source code while keeping each node responsible for validation.",
    "A loaded value is not automatically safe: the node must declare its expected type and reject values outside its operating range.",
  ],
  "frames-description": [
    "URDF describes links and joints; tf2 tracks how coordinate frames relate over time. A connected tree lets data be transformed into the frame where a decision is made.",
    "Origins use metres and radians. A plausible-looking model can still be wrong, so inspect numeric transforms as well as RViz.",
  ],
  "ros2-control": [
    "ros2_control separates application commands, controllers, and hardware interfaces. controller_manager coordinates lifecycle and update execution.",
    "A controller must be configured, active, and connected to the correct claimed interfaces before a trajectory can affect simulated state.",
  ],
};

const labWalkthroughs: Record<string, string[]> = {
  "install-lyrical": [
    "apt refreshes package information, then installs the Lyrical desktop and development tools.",
    "source loads ROS paths into this shell; echo verifies the distribution before a demo starts.",
  ],
  workspace: [
    "mkdir creates the conventional source directory without failing if it exists.",
    "colcon builds discovered packages and creates setup files; sourcing install/setup.bash activates the overlay.",
  ],
  "cpp-package": [
    "The class derives from rclcpp::Node and assigns the graph name status_node.",
    "rclcpp::spin processes callbacks; shutdown releases ROS resources after spin ends.",
  ],
  "topics-cpp": [
    "create_publisher fixes the topic name, message type, and queue depth.",
    "The wall timer creates a message every 100 ms, publishes it, then changes the next value.",
  ],
  "services-actions": [
    "The action type defines goal, result, and feedback sections separated by `---`.",
    "The server has callbacks for accepting goals, accepting cancellation, and starting controlled execution.",
  ],
  "launch-parameters": [
    "The YAML nests values under the node name and ros__parameters.",
    "The launch description starts the executable and supplies the reviewed configuration file.",
  ],
  "frames-description": [
    "Two links are connected by one fixed joint, making base_link the parent of tool0.",
    "The origin places tool0 half a metre above the base with no rotation.",
  ],
  "ros2-control": [
    "controller_manager runs at the configured update rate and loads two controller plugins.",
    "The broadcaster publishes state; the trajectory controller claims command interfaces for motion.",
  ],
};

export const labs: Lab[] = labCore.map((lab) => ({
  ...lab,
  concept: labConcepts[lab.slug] ?? [],
  walkthrough: labWalkthroughs[lab.slug] ?? [],
}));

export function getLab(slug: string) {
  return labs.find((lab) => lab.slug === slug);
}
