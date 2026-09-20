import { practice, type Practice } from "./practice-types";

// Phase 7: ROS 2 C++. These need a sourced ROS 2 Lyrical workspace (colcon build), so they are not compiled by the site tests.
export const practicePhase7: Record<string, Practice> = {
  "ROS 2 nodes in C++": practice(
    "ros",
    "[INFO] [hello_node]: hello from C++17",
    String.raw`
// src/hello_node.cpp   build: colcon build --packages-select robot_nodes   run: ros2 run robot_nodes hello_node
#include "rclcpp/rclcpp.hpp"

class HelloNode : public rclcpp::Node {
 public:
  //>> call Node("hello_node") in the constructor and log "hello from C++17" with RCLCPP_INFO
  HelloNode() : Node("hello_node") { RCLCPP_INFO(get_logger(), "hello from C++17"); }
  //<<
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  //>> spin a HelloNode created with std::make_shared, then shut ROS down
  rclcpp::spin(std::make_shared<HelloNode>());
  rclcpp::shutdown();
  //<<
  return 0;
}
`,
  ),
  Publishers: practice(
    "ros",
    "ros2 topic echo /chatter  ->  data: count 1, data: count 2, ...",
    String.raw`
// src/talker.cpp
#include <chrono>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

class Talker : public rclcpp::Node {
 public:
  Talker() : Node("talker") {
    //>> create a publisher on "chatter" (depth 10) and a 500 ms wall timer that publishes "count N"
    pub_ = create_publisher<std_msgs::msg::String>("chatter", 10);
    timer_ = create_wall_timer(500ms, [this] {
      std_msgs::msg::String msg;
      msg.data = "count " + std::to_string(++n_);
      pub_->publish(msg);
    });
    //<<
  }

 private:
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr pub_;
  rclcpp::TimerBase::SharedPtr timer_;
  int n_{0};
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Talker>());
  rclcpp::shutdown();
  return 0;
}
`,
  ),
  Subscribers: practice(
    "ros",
    "[INFO] [listener]: heard: count 1",
    String.raw`
// src/listener.cpp
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

class Listener : public rclcpp::Node {
 public:
  Listener() : Node("listener") {
    //>> subscribe to "chatter" (depth 10) and log "heard: <data>" in the callback
    sub_ = create_subscription<std_msgs::msg::String>(
        "chatter", 10, [this](const std_msgs::msg::String::SharedPtr msg) {
          RCLCPP_INFO(get_logger(), "heard: %s", msg->data.c_str());
        });
    //<<
  }

 private:
  rclcpp::Subscription<std_msgs::msg::String>::SharedPtr sub_;
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Listener>());
  rclcpp::shutdown();
  return 0;
}
`,
  ),
  Services: practice(
    "ros",
    "ros2 service call /add example_interfaces/srv/AddTwoInts '{a: 2, b: 3}'  ->  sum=5",
    String.raw`
// src/add_server.cpp
#include "example_interfaces/srv/add_two_ints.hpp"
#include "rclcpp/rclcpp.hpp"

using AddTwoInts = example_interfaces::srv::AddTwoInts;

class AddServer : public rclcpp::Node {
 public:
  AddServer() : Node("add_server") {
    //>> create the "add" service: put req->a + req->b into res->sum
    srv_ = create_service<AddTwoInts>(
        "add", [](const std::shared_ptr<AddTwoInts::Request> req,
                  std::shared_ptr<AddTwoInts::Response> res) { res->sum = req->a + req->b; });
    //<<
  }

 private:
  rclcpp::Service<AddTwoInts>::SharedPtr srv_;
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<AddServer>());
  rclcpp::shutdown();
  return 0;
}
`,
  ),
  Actions: practice(
    "ros",
    "ros2 action send_goal /fibonacci example_interfaces/action/Fibonacci '{order: 5}' --feedback  ->  feedback lines, then a result",
    String.raw`
// Fragment for the constructor of a node class (see the lesson for the full package layout)
#include <thread>

#include "example_interfaces/action/fibonacci.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

using Fib = example_interfaces::action::Fibonacci;
using GoalHandle = rclcpp_action::ServerGoalHandle<Fib>;

class FibServer : public rclcpp::Node {
 public:
  FibServer() : Node("fib_server") {
    //>> create the server with three callbacks: accept every goal, accept cancels, and run the goal on a worker thread
    server_ = rclcpp_action::create_server<Fib>(
        this, "fibonacci",
        [](const rclcpp_action::GoalUUID&, std::shared_ptr<const Fib::Goal>) {
          return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
        },
        [](std::shared_ptr<GoalHandle>) { return rclcpp_action::CancelResponse::ACCEPT; },
        [](std::shared_ptr<GoalHandle> h) {
          std::thread{[h] { h->succeed(std::make_shared<Fib::Result>()); }}.detach();
        });
    //<<
  }

 private:
  rclcpp_action::Server<Fib>::SharedPtr server_;
};
`,
  ),
  Parameters: practice(
    "ros",
    "ros2 param get /arm_node max_speed  ->  Double value is: 1.2",
    String.raw`
// src/arm_node.cpp
#include "rclcpp/rclcpp.hpp"

class ArmNode : public rclcpp::Node {
 public:
  ArmNode() : Node("arm_node") {
    //>> declare max_speed (double, default 1.2) and frame (string, default "base_link"), then read max_speed
    declare_parameter<double>("max_speed", 1.2);
    declare_parameter<std::string>("frame", "base_link");
    max_speed_ = get_parameter("max_speed").as_double();
    //<<
    RCLCPP_INFO(get_logger(), "max_speed = %.2f", max_speed_);
  }

 private:
  double max_speed_{0.0};
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<ArmNode>());
  rclcpp::shutdown();
  return 0;
}
`,
  ),
  "Launch files": practice(
    "ros",
    "ros2 launch robot_nodes bringup.launch.py  ->  talker and listener both start",
    String.raw`
# launch/bringup.launch.py
from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    #>> start the talker with a rate_hz parameter and the listener with chatter remapped to robot/chatter
    talker = Node(package='robot_nodes', executable='talker', name='talker',
                  parameters=[{'rate_hz': 5.0}], remappings=[('chatter', 'robot/chatter')])
    listener = Node(package='robot_nodes', executable='listener',
                    remappings=[('chatter', 'robot/chatter')])
    #<<
    return LaunchDescription([talker, listener])
`,
  ),
  "TF2 transforms": practice(
    "ros",
    "ros2 run tf2_ros tf2_echo base_link camera_link  ->  Translation: [0.100, 0.000, 0.000]",
    String.raw`
// Inside a node with a member  std::unique_ptr<tf2_ros::TransformBroadcaster> broadcaster_;
#include "geometry_msgs/msg/transform_stamped.hpp"
#include "tf2_ros/transform_broadcaster.h"

void publish_camera_frame() {
  geometry_msgs::msg::TransformStamped t;
  //>> fill the transform: stamp = now(), parent base_link, child camera_link, x = 0.10, rotation w = 1.0
  t.header.stamp = now();
  t.header.frame_id = "base_link";
  t.child_frame_id = "camera_link";
  t.transform.translation.x = 0.10;
  t.transform.rotation.w = 1.0;
  //<<
  broadcaster_->sendTransform(t);
}
`,
  ),
  "URDF and robot_state_publisher": practice(
    "ros",
    "check_urdf mini_arm.urdf  ->  robot name is: mini_arm",
    String.raw`
<!-- mini_arm.urdf -->
<robot name="mini_arm">
  <link name="base_link"/>
  <link name="upper_arm"/>
  <!-->> add a revolute joint "shoulder" from base_link to upper_arm, rotating about Z, limited to +-1.57 rad -->
  <joint name="shoulder" type="revolute">
    <parent link="base_link"/>
    <child link="upper_arm"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1.0"/>
  </joint>
  <!--<< -->
</robot>
`,
  ),
  "Gazebo simulation": practice(
    "ros",
    "ros2 topic echo /odom  ->  the pose x grows by about 0.2 m every second",
    String.raw`
# Run each line in its own sourced terminal
ros2 launch ros_gz_sim gz_sim.launch.py gz_args:='-r empty.sdf'
#>> bridge /cmd_vel into Gazebo, then publish a forward velocity of 0.2 m/s at 10 Hz
ros2 run ros_gz_bridge parameter_bridge /cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist
ros2 topic pub -r 10 /cmd_vel geometry_msgs/msg/Twist '{linear: {x: 0.2}}'
#<<
`,
  ),
  "Navigation stack basics (Nav2)": practice(
    "ros",
    "The robot drives to x = 2.0 m in the map frame",
    String.raw`
// Inside a node that owns  rclcpp_action::Client<Nav>::SharedPtr client_;
#include "nav2_msgs/action/navigate_to_pose.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

using Nav = nav2_msgs::action::NavigateToPose;

void go_to_two_metres() {
  Nav::Goal goal;
  //>> set the goal pose: frame "map", x = 2.0, orientation w = 1.0, then send it asynchronously
  goal.pose.header.frame_id = "map";
  goal.pose.pose.position.x = 2.0;
  goal.pose.pose.orientation.w = 1.0;
  client_->async_send_goal(goal);
  //<<
}
`,
  ),
  "Writing your own ROS 2 packages": practice(
    "ros",
    "ros2 pkg executables robot_nodes  ->  robot_nodes talker",
    String.raw`
# CMakeLists.txt of the robot_nodes package
cmake_minimum_required(VERSION 3.16)
project(robot_nodes)
set(CMAKE_CXX_STANDARD 17)
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
add_executable(talker src/talker.cpp)
#>> add the dependencies to talker, install it to lib/robot_nodes, and finish with ament_package()
ament_target_dependencies(talker rclcpp std_msgs)
install(TARGETS talker DESTINATION lib/robot_nodes)
ament_package()
#<<
`,
  ),
  "Multi-threaded executors and callback groups": practice(
    "ros",
    "The 10 ms timer keeps running while the slow callback sleeps",
    String.raw`
// main() of a node that has a slow timer and a fast timer in different callback groups
#include "rclcpp/rclcpp.hpp"

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  auto node = std::make_shared<ArmNode>();
  //>> use a MultiThreadedExecutor with 4 threads, add the node, and spin
  rclcpp::executors::MultiThreadedExecutor exec{rclcpp::ExecutorOptions(), 4};
  exec.add_node(node);
  exec.spin();
  //<<
  rclcpp::shutdown();
  return 0;
}
`,
  ),
  "Lifecycle nodes": practice(
    "ros",
    "ros2 lifecycle set /driver configure  ->  Transitioning successful",
    String.raw`
// src/driver.cpp
#include "rclcpp_lifecycle/lifecycle_node.hpp"
#include "std_msgs/msg/string.hpp"

using CallbackReturn = rclcpp_lifecycle::node_interfaces::LifecycleNodeInterface::CallbackReturn;

class Driver : public rclcpp_lifecycle::LifecycleNode {
 public:
  Driver() : LifecycleNode("driver") {}
  //>> on_configure creates the publisher; on_activate activates it; both return SUCCESS
  CallbackReturn on_configure(const rclcpp_lifecycle::State&) override {
    pub_ = create_publisher<std_msgs::msg::String>("status", 10);
    return CallbackReturn::SUCCESS;
  }
  CallbackReturn on_activate(const rclcpp_lifecycle::State&) override {
    pub_->on_activate();
    return CallbackReturn::SUCCESS;
  }
  //<<

 private:
  rclcpp_lifecycle::LifecyclePublisher<std_msgs::msg::String>::SharedPtr pub_;
};
`,
  ),
};
