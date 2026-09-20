import { hash, xml, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 05 · Humanoid Platform — Section D: AI & ROS 2 (lessons 31–40)
export const module05d: LessonSpec[] = [
  lesson({
    title: "Reinforcement learning gaits",
    summary:
      "Train a walking policy in simulation with PPO and understand reward design and the sim-to-real gap.",
    goals: [
      "Explain how reinforcement learning produces a gait",
      "Train and evaluate a PPO policy in a simulated humanoid",
      "Name the main causes of the sim-to-real gap",
    ],
    concept: [
      "In reinforcement learning (RL) a policy, a neural network, chooses joint commands from observations, and a reward function scores the result. Training in simulation with millions of trials shapes a policy that walks. The reward carries all the design: forward speed and staying upright are rewarded, falling, high torques and jerky motion are penalised.",
      "A policy trained in simulation often fails on the real robot, because the simulator differs from reality in friction, motor response, delays and sensor noise. Randomising these parameters during training (domain randomisation), adding latency and noise, and limiting the policy's action range make it more robust. A learned gait is never released to a real robot without limits and a stop: the hardware safety chain stays, and the first tests are done with the robot in a harness.",
    ],
    steps: [
      "Create the simulated humanoid environment with a fixed random seed.",
      "Train a PPO policy for a few hundred thousand steps as a first check.",
      "Evaluate it over 20 episodes and record the average reward and the fall rate.",
      "Add domain randomisation of friction and mass and compare the fall rate.",
    ],
    example: hash(
      ["import gymnasium as gym", "the standard environment interface for RL."],
      ["from stable_baselines3 import PPO", "a well-tested implementation of the PPO algorithm."],
      ["", ""],
      [
        "ENV_ID = 'Humanoid-v4'",
        "a MuJoCo humanoid task; use the version installed with your gymnasium.",
      ],
      ["env = gym.make(ENV_ID)", "create the simulated world."],
      [
        "model = PPO('MlpPolicy', env, seed=1, verbose=1)",
        "a neural-network policy trained with PPO; the seed makes runs repeatable.",
      ],
      [
        "model.learn(total_timesteps=300_000)",
        "train for 300k simulation steps: enough to see learning, not a finished gait.",
      ],
      ["model.save('humanoid_ppo')", "store the trained policy."],
      ["", ""],
      [
        "def evaluate(model, env, episodes=20):",
        "average return and the share of episodes that ended by falling.",
      ],
      ["    total, falls = 0.0, 0", "the running totals."],
      ["    for _ in range(episodes):", "one episode at a time."],
      ["        obs, _ = env.reset()", "start a new episode."],
      ["        done, ret = False, 0.0", "not finished, no reward yet."],
      ["        while not done:", "run until the episode ends."],
      [
        "            action, _ = model.predict(obs, deterministic=True)",
        "the policy's best action, without exploration noise.",
      ],
      [
        "            obs, r, terminated, truncated, _ = env.step(action)",
        "apply it in the simulator.",
      ],
      [
        "            ret, done = ret + r, terminated or truncated",
        "collect reward and check for the end.",
      ],
      [
        "        total += ret; falls += int(terminated)",
        "terminated means the robot fell; truncated means the time limit was reached.",
      ],
      ["    return total / episodes, falls / episodes", "the two summary numbers."],
    ),
    walk: [
      "The seed and the deterministic evaluation make results comparable between runs.",
      "The fall rate is a better indicator of quality than the reward alone, since reward can be gamed.",
      "Nothing here is safe for real hardware: a learned policy needs limits, a harness and a hardware stop first.",
    ],
    expect: [
      "After 300k steps the policy usually stands or takes a few steps, with a high fall rate; a good gait needs millions of steps.",
      "With domain randomisation the fall rate on unseen friction values is lower.",
    ],
    fix: [
      [
        "The robot learns to shuffle or dive forward.",
        "The reward has a loophole. Add penalties for low body height, high torque and asymmetric gait.",
      ],
      [
        "The policy works in simulation but not on the robot.",
        "Add latency, noise and parameter randomisation to training, and limit the action range on the real robot.",
      ],
    ],
    exercise:
      "Log the fall rate after 100k, 300k and 1M steps and plot how it changes, then discuss what the reward encourages.",
    checklist: [
      "Seeds and evaluation are fixed",
      "Fall rate is tracked, not only reward",
      "Real tests use limits, a harness and a hardware stop",
    ],
  }),
  lesson({
    title: "Behavior trees",
    summary:
      "Describe robot behaviour as a tree of sequences and fallbacks that can be read and tested.",
    goals: [
      "Explain the sequence, fallback and action nodes",
      "Write a behaviour tree in BehaviorTree.CPP's XML format",
      "Design fallbacks so a failed step has a recovery",
    ],
    concept: [
      "A behaviour tree describes what a robot does as a tree that is ticked repeatedly. A Sequence runs its children in order and stops at the first failure; a Fallback (selector) tries its children in order and stops at the first success. Leaves are actions or conditions that return success, failure or running. The structure shows the whole behaviour at a glance.",
      "Compared with a state machine, a tree scales better: adding a recovery means adding a node, not new transitions from every state. Good trees keep leaves small and testable, express recovery as fallbacks, and put conditions before the actions they protect. Nav2 uses behaviour trees to describe navigation and its recoveries, and the same library can drive a humanoid's task logic.",
    ],
    steps: [
      "List the steps of the task: find the cup, grasp it, deliver it.",
      "Add a recovery for each step that can fail.",
      "Write the tree in XML with a sequence and fallbacks.",
      "Test each leaf alone with simulated success and failure.",
    ],
    example: xml(
      ['<root BTCPP_format="4">', "the file format of BehaviorTree.CPP version 4."],
      ['  <BehaviorTree ID="ServeCup">', "one named tree."],
      ["    <Sequence>", "do the children in order; stop at the first failure."],
      ['      <Action ID="FindCup"/>', "look for a cup; fails if none is seen."],
      ["      <Fallback>", "try the children in order until one succeeds."],
      ['        <Action ID="Grasp"/>', "first attempt to grasp the cup."],
      ["        <Sequence>", "if the grasp fails, run this recovery."],
      ['          <Action ID="BackOff"/>', "move the hand away."],
      ['          <Action ID="Grasp"/>', "and try to grasp again."],
      ["        </Sequence>", "end of the recovery."],
      ["      </Fallback>", "end of the grasp with its recovery."],
      ['      <Action ID="Deliver"/>', "carry the cup to the person."],
      ["    </Sequence>", "end of the main sequence."],
      ["  </BehaviorTree>", "end of the tree."],
      ["</root>", "end of the file."],
    ),
    walk: [
      "The grasp is inside a fallback, so a failure has a defined recovery and does not abort the whole task.",
      "The recovery is itself a sequence, which shows how trees nest behaviours.",
      "The leaves are named actions implemented in code; the tree shape can change without touching them.",
    ],
    expect: [
      "If FindCup fails, the whole tree fails at once and Grasp is never tried.",
      "If Grasp fails once and succeeds after BackOff, the tree still delivers the cup.",
    ],
    fix: [
      [
        "The tree loops forever.",
        "A fallback with no final failure keeps retrying. Add a retry limit with a decorator such as RetryUntilSuccessful with num_attempts.",
      ],
      [
        "Actions block the tree.",
        "Long actions must return RUNNING and be asynchronous; never sleep inside a tick.",
      ],
    ],
    exercise:
      "Add a condition 'IsPersonNearby' before Deliver and a fallback that waits for up to 10 seconds if nobody is there.",
    checklist: [
      "Each fallible step has a recovery",
      "Retries are limited",
      "Leaves are small and non-blocking",
    ],
  }),
  lesson({
    title: "ROS 2 humanoid stack",
    summary:
      "Assemble the humanoid's software from components in one container with clear responsibilities.",
    goals: [
      "Describe the layers of a humanoid software stack",
      "Launch the components in one process with composition",
      "Separate real-time control from perception and planning",
    ],
    concept: [
      "A humanoid stack has layers. At the bottom the hardware interface and the joint controllers run in a real-time loop. Above them a whole-body or walking controller turns footsteps and hand targets into joint commands. Perception (cameras, LiDAR, IMU processing), state estimation, planning and the behaviour layer sit on top, and each publishes results the layer below uses.",
      "ROS 2 composition lets several components run in one process and exchange messages without copying, which suits high-rate data such as images and joint states. The real-time controller should be kept separate from heavy perception in its own process or thread with its own priority, so a slow vision node never delays the control loop.",
    ],
    steps: [
      "List the components and their rates: controller 1 kHz, estimator 200 Hz, vision 30 Hz, planner 10 Hz.",
      "Group the fast, light components into one composable container.",
      "Run the perception in a second container.",
      "Check the message rates with ros2 topic hz.",
    ],
    example: hash(
      ["from launch import LaunchDescription", "the container for the launch description."],
      [
        "from launch_ros.actions import ComposableNodeContainer",
        "starts a container process that loads components.",
      ],
      ["from launch_ros.descriptions import ComposableNode", "describes one component to load."],
      ["", ""],
      ["def generate_launch_description():", "called by ros2 launch."],
      ["    control = ComposableNodeContainer(", "one process for the control-related components."],
      [
        "        name='control_container', namespace='', package='rclcpp_components', executable='component_container_mt',",
        "the multi-threaded container executable.",
      ],
      ["        composable_node_descriptions=[", "the components to load inside it."],
      [
        "            ComposableNode(package='humanoid_control', plugin='humanoid::StateEstimator', name='estimator'),",
        "estimates the base pose and velocity from the IMU and legs.",
      ],
      [
        "            ComposableNode(package='humanoid_control', plugin='humanoid::WalkingController', name='walking'),",
        "turns footsteps into joint commands.",
      ],
      ["        ])", "end of the component list."],
      [
        "    perception = ComposableNodeContainer(",
        "a second process, so heavy vision never blocks control.",
      ],
      [
        "        name='perception_container', namespace='', package='rclcpp_components', executable='component_container_mt',",
        "the same container type.",
      ],
      [
        "        composable_node_descriptions=[ComposableNode(package='humanoid_perception', plugin='humanoid::PersonDetector', name='person_detector')])",
        "the person detector runs here.",
      ],
      ["    return LaunchDescription([control, perception])", "start both containers."],
    ),
    walk: [
      "Two containers mean two processes: a slow perception node cannot delay the walking controller.",
      "Composition removes message copies inside a container, which matters for large images and fast joint states.",
      "The real-time loop itself (the ros2_control update) would run in its own process with real-time priority.",
    ],
    expect: [
      "ros2 component list shows the estimator and walking controller in one container and the detector in the other.",
      "The estimator publishes at 200 Hz and the detector at 30 Hz, regardless of load.",
    ],
    fix: [
      [
        "Control latency increases when the detector runs.",
        "The two share a process or a core. Move perception to its own container and pin the control loop to an isolated core.",
      ],
      [
        "A component fails to load.",
        "The plugin name must match the registration macro exactly. Check the component's source and the package export.",
      ],
    ],
    exercise:
      "Measure the walking controller's loop time with and without the detector running and record the maximum jitter.",
    checklist: [
      "Control and perception are separated",
      "Rates are measured, not assumed",
      "Plugin names match their registration",
    ],
  }),
  lesson({
    title: "TF tree management",
    summary:
      "Keep a clean TF tree with one parent per frame, and check required transforms at start-up.",
    goals: [
      "Explain the rules of a valid TF tree",
      "Distinguish static and dynamic transforms",
      "Check that required frames are available before starting the robot",
    ],
    concept: [
      "TF stores the coordinate frames of the robot as a tree: every frame has exactly one parent, and the transform between any two frames follows the path through the tree. Static transforms (a camera fixed to the head) are published once, and dynamic ones (joints, the odometry from odom to base) are published continuously. Two publishers for the same transform, or a loop, break the tree.",
      "A humanoid has many frames: world or map, odom, base_link, torso, head, cameras, hands and feet. Before the robot starts to act, a check should confirm that the transforms needed by the task exist and are recent. A stale transform, for example a camera frame that stopped updating, would otherwise put the hand in a wrong place without any error message.",
    ],
    steps: [
      "Draw the frame tree and mark which transforms are static and which are dynamic.",
      "Publish static frames with a static transform publisher or from the URDF.",
      "Write a start-up check for the required transforms with a maximum age.",
      "Run the check and view the tree with tf2_tools view_frames.",
    ],
    example: hash(
      ["import rclpy", "the ROS 2 Python client library."],
      ["from rclpy.node import Node", "base class of nodes."],
      ["from rclpy.duration import Duration", "durations for the timeouts."],
      [
        "from tf2_ros import Buffer, TransformListener",
        "the TF buffer and the listener that fills it.",
      ],
      ["", ""],
      [
        "REQUIRED = [('odom', 'base_link'), ('base_link', 'head_camera'), ('base_link', 'left_hand'), ('base_link', 'right_hand')]",
        "the transforms the task needs, as (parent, child).",
      ],
      ["", ""],
      ["class TfCheck(Node):", "verifies the TF tree."],
      ["    def __init__(self):", "start the buffer and the listener."],
      ["        super().__init__('tf_check')", "name the node."],
      ["        self.buffer = Buffer()", "stores the recent transforms."],
      [
        "        self.listener = TransformListener(self.buffer, self)",
        "fills the buffer from the /tf topics.",
      ],
      ["", ""],
      ["    def ready(self):", "are all required transforms available and recent?"],
      ["        missing = []", "the pairs that fail."],
      ["        for parent, child in REQUIRED:", "check each one."],
      [
        "            if not self.buffer.can_transform(parent, child, rclpy.time.Time(), Duration(seconds=0.5)):",
        "is the newest transform available within 0.5 s?",
      ],
      ["                missing.append((parent, child))", "record the failure."],
      ["        return missing", "an empty list means the tree is complete."],
    ),
    walk: [
      "The list of required frames is data, so it can be reviewed and changed for different tasks.",
      "can_transform with a timeout waits briefly for late transforms instead of failing immediately.",
      "The returned list names every missing transform, which is much more helpful than a single failure.",
    ],
    expect: [
      "With the whole robot running, ready() returns an empty list.",
      "Stopping the camera driver makes ready() return the head_camera pair.",
    ],
    fix: [
      [
        "A frame has two parents.",
        "Two nodes publish the same child frame. Remove one, or rename the frame, and check with view_frames.",
      ],
      [
        "Transforms seem to lag.",
        "The clock or the publishing rate is wrong. Check the timestamps and the use_sim_time settings.",
      ],
    ],
    exercise:
      "Extend the check to also require that each transform is younger than 100 ms and report the age of every transform.",
    checklist: [
      "Every frame has exactly one parent",
      "Static and dynamic frames are separated",
      "Required frames are checked before acting",
    ],
  }),
  lesson({
    title: "Gazebo humanoid simulation",
    summary:
      "Simulate the humanoid with an IMU sensor and effort-controlled joints and check its stability first.",
    goals: [
      "Add an IMU sensor to the humanoid model",
      "Run the simulation with an effort interface",
      "Check the robot's basic stability before adding controllers",
    ],
    concept: [
      "The simulation must give the controllers the same inputs as the real robot: joint positions and velocities, an IMU and foot force sensors, at similar rates and with similar noise. In Gazebo an IMU is a sensor attached to a link, with an update rate, publishing to a topic that is bridged into ROS 2. Joints are driven through ros2_control with position, velocity or effort interfaces, matching the real hardware.",
      "The first test of a new model is passive: place it in the world with the joints held by simple position controllers and check that it stands without vibrating or sinking. Problems at this stage (wrong masses, missing inertia, foot contact parameters) will ruin everything built on top. Only when the standing robot is stable are the walking controllers started.",
    ],
    steps: [
      "Add an IMU sensor to the torso link.",
      "Add the IMU system plugin to the world.",
      "Spawn the robot and hold the joints with position controllers.",
      "Watch the IMU topic and check that the body is stable at rest.",
    ],
    example: xml(
      ['<gazebo reference="torso_link">', "simulator settings for the torso link."],
      ['  <sensor name="imu_sensor" type="imu">', "an inertial measurement unit."],
      ["    <always_on>true</always_on>", "publish continuously."],
      ["    <update_rate>200</update_rate>", "at 200 Hz, like the real IMU."],
      ["    <topic>imu</topic>", "the simulator topic, which is bridged into ROS 2."],
      ["    <imu>", "noise settings for the sensor."],
      [
        '      <angular_velocity><x><noise type="gaussian"><stddev>0.002</stddev></noise></x></angular_velocity>',
        "gyroscope noise (rad/s); the y and z axes are set in the same way.",
      ],
      [
        '      <linear_acceleration><z><noise type="gaussian"><stddev>0.05</stddev></noise></z></linear_acceleration>',
        "accelerometer noise (m/s^2).",
      ],
      ["    </imu>", "end of the noise settings."],
      ["  </sensor>", "end of the sensor."],
      ["</gazebo>", "end of the simulator settings."],
      [
        "<!-- in the world file -->",
        "the system plugin below belongs to the SDF world, not to the URDF.",
      ],
      [
        '<plugin filename="gz-sim-imu-system" name="gz::sim::systems::Imu"/>',
        "enables IMU sensors in the world.",
      ],
    ),
    walk: [
      "Noise on the IMU makes the simulation harder in the same way as the real robot, so controllers are tested fairly.",
      "The update rate matches the real sensor; testing at an unrealistic rate would hide timing problems.",
      "The plugin in the world file is easy to forget and its absence gives a silent, empty IMU topic.",
    ],
    expect: [
      "ros2 topic hz /imu shows about 200 Hz, and the z acceleration is about 9.81 at rest.",
      "The robot held by position controllers stands without vibration for 30 seconds.",
    ],
    fix: [
      [
        "The IMU topic is empty.",
        "The system plugin is missing in the world or the topic is not bridged. Check both.",
      ],
      [
        "The robot vibrates while standing.",
        "Inertia, damping or contact parameters are wrong. Reduce the step size and check the foot contact settings.",
      ],
    ],
    exercise:
      "Push the standing robot with a 20 N force for 0.1 s in simulation and record the peak tilt from the IMU.",
    checklist: [
      "Sensors match the real robot's rates",
      "The standing robot is stable before controllers",
      "Noise is included",
    ],
  }),
  lesson({
    title: "Motion capture integration",
    summary:
      "Retarget human joint angles to the robot with scaling, limits, smoothing and rate limits.",
    goals: [
      "Explain retargeting from a human skeleton to a robot",
      "Clamp, smooth and rate-limit the joint targets",
      "Refuse data that is invalid or too fast",
    ],
    concept: [
      "Motion capture records a person's movement, and retargeting maps it onto the robot's joints. The robot has different proportions, joint ranges and speed limits from the person, so the mapping needs scaling and limits. The simplest method copies joint angles from matching human joints and clamps them to the robot's ranges.",
      "The raw data is noisy and the human moves faster than the robot's actuators can follow. Smoothing (a low-pass filter) removes noise, and a rate limit keeps the commanded change per cycle below the robot's speed limit. Invalid samples, for example a lost marker, must be detected and replaced by the last good value, and no data for a while must freeze the robot, never extrapolate.",
    ],
    steps: [
      "Map each human joint to a robot joint with a scale and an offset.",
      "Clamp the result to the robot's joint range.",
      "Low-pass filter the target and limit its change per cycle.",
      "Freeze the robot if the data is stale or invalid.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      ["class Retarget:", "converts human joint angles to safe robot joint targets."],
      [
        "    def __init__(self, low, high, max_rate, alpha=0.2, dt=0.01):",
        "robot joint limits, the maximum speed (rad/s), the filter constant and the cycle time.",
      ],
      [
        "        self.low, self.high, self.max_step = np.array(low), np.array(high), np.array(max_rate) * dt",
        "store the limits; the step limit is the speed limit per cycle.",
      ],
      ["        self.alpha, self.out = alpha, None", "filter constant and the last output."],
      ["", ""],
      [
        "    def update(self, human):",
        "call every cycle with the human joint angles, or None if invalid.",
      ],
      ["        if human is None or not np.all(np.isfinite(human)):", "lost marker or bad data."],
      ["            return self.out", "keep the last good target, never extrapolate."],
      [
        "        target = np.clip(np.asarray(human, float), self.low, self.high)",
        "stay inside the robot's joint range.",
      ],
      ["        if self.out is None:", "the first sample."],
      ["            self.out = target", "start there."],
      ["            return self.out", "no filtering yet."],
      [
        "        filtered = self.out + self.alpha * (target - self.out)",
        "low-pass: move a fraction of the way to the target.",
      ],
      [
        "        step = np.clip(filtered - self.out, -self.max_step, self.max_step)",
        "never change faster than the speed limit.",
      ],
      ["        self.out = self.out + step", "apply the limited step."],
      ["        return self.out", "the safe joint target for this cycle."],
    ),
    walk: [
      "Every stage removes a class of problem: clamp for ranges, filter for noise, step limit for speed.",
      "Returning the last good value on bad data is safer than jumping to zero or guessing.",
      "The step limit is derived from the robot's speed limit, so the mapping cannot demand more than the joints can do.",
    ],
    expect: [
      "A sudden jump in the human angle produces a smooth ramp in the output, limited to the speed limit.",
      "A missing sample keeps the arm still instead of jerking.",
    ],
    fix: [
      [
        "The robot lags far behind the person.",
        "The filter is too slow or the rate limit too low. Increase alpha and check the robot's real speed limit.",
      ],
      [
        "The arm hits its limit and stays there.",
        "The human range is larger than the robot's. Scale the angles before clamping.",
      ],
    ],
    exercise:
      "Add a watchdog that freezes the output if no valid sample arrived for 200 ms and prints a warning once.",
    checklist: [
      "Angles are scaled and clamped",
      "Smoothing and a rate limit are applied",
      "Bad or missing data freezes the robot",
    ],
  }),
  lesson({
    title: "VR teleoperation",
    summary: "Map a VR controller to a robot hand with a clutch, scaling and a dead-man switch.",
    goals: [
      "Explain clutching in teleoperation",
      "Map controller motion to hand targets with a scale and workspace limits",
      "Stop the robot when the dead-man switch is released",
    ],
    concept: [
      "In VR teleoperation an operator moves a controller and the robot's hand follows. The mapping is relative: while the operator holds a clutch button, the hand target moves by the same displacement as the controller, scaled by a factor. Releasing the clutch lets the operator reposition the controller without moving the robot, like lifting a mouse.",
      "Teleoperation needs safety features. A dead-man switch: the robot only follows while a button is held, and stops when it is released or the connection drops. The hand target is limited to the robot's workspace and to a maximum speed. Network delay is unavoidable, so the target is smoothed and the robot never moves faster than it can safely stop.",
    ],
    steps: [
      "Record the controller and hand poses when the clutch is pressed.",
      "Compute the hand target as the start hand pose plus the scaled controller displacement.",
      "Clamp the target to the workspace box.",
      "Stop when the clutch is released or no data arrives for 100 ms.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectors."],
      ["", ""],
      ["class Teleop:", "relative hand control with a clutch."],
      [
        "    def __init__(self, scale=0.7, box=((0.2, -0.4, 0.6), (0.7, 0.4, 1.2))):",
        "motion scale and the allowed hand box (minimum and maximum corner, metres).",
      ],
      [
        "        self.scale, self.lo, self.hi = scale, np.array(box[0]), np.array(box[1])",
        "store the settings.",
      ],
      ["        self.ctrl0 = self.hand0 = None", "poses at the moment the clutch was pressed."],
      ["", ""],
      [
        "    def update(self, clutch, controller, hand, fresh):",
        "returns the hand target or None to hold still.",
      ],
      ["        if not clutch or not fresh:", "clutch released, or the data is stale."],
      [
        "            self.ctrl0 = self.hand0 = None",
        "forget the reference: the next press starts fresh.",
      ],
      ["            return None", "no motion."],
      ["        if self.ctrl0 is None:", "the clutch has just been pressed."],
      [
        "            self.ctrl0, self.hand0 = np.array(controller, float), np.array(hand, float)",
        "remember where both were.",
      ],
      [
        "        delta = (np.array(controller, float) - self.ctrl0) * self.scale",
        "the scaled displacement of the controller since the press.",
      ],
      [
        "        return np.clip(self.hand0 + delta, self.lo, self.hi)",
        "the hand target, always inside the workspace box.",
      ],
    ),
    walk: [
      "Only relative motion since the clutch press is used, so the operator's hand position in the room does not matter.",
      "Stale or missing data acts like a released clutch, which is the dead-man behaviour.",
      "The scale below 1 makes fine work easier, since a 10 cm hand movement gives a 7 cm robot movement.",
    ],
    expect: [
      "While the clutch is held, moving the controller 10 cm moves the target 7 cm in the same direction.",
      "Releasing the clutch or stopping the data returns None and the robot holds still.",
    ],
    fix: [
      [
        "The robot jumps when the clutch is pressed.",
        "The reference was not recorded at the press. Store both poses when the clutch changes to pressed.",
      ],
      [
        "The motion feels laggy.",
        "Network delay adds up. Reduce the smoothing, prioritise the data and limit the speed rather than increasing latency.",
      ],
    ],
    exercise:
      "Add a speed limit that clips the target's change per cycle to 0.5 m/s and test it with a fast controller motion.",
    checklist: [
      "Motion is relative to the clutch press",
      "Stale data behaves like a released switch",
      "The target is limited in range and speed",
    ],
  }),
  lesson({
    title: "Social interaction models",
    summary: "Choose the robot's behaviour from the distance to a person using proxemic zones.",
    goals: [
      "Describe personal space zones",
      "Map the distance to a behaviour",
      "Add hysteresis so behaviour does not flicker",
    ],
    concept: [
      "People feel comfortable at different distances from others. Hall's proxemics describes four zones: intimate (up to 0.45 m), personal (0.45 to 1.2 m), social (1.2 to 3.6 m) and public (beyond 3.6 m). A robot that respects them feels polite and safe; one that enters the intimate zone uninvited feels threatening.",
      "A simple social model maps the zone to a behaviour: in the public zone the robot may greet, in the social zone it can interact, in the personal zone it slows down and asks before moving, and in the intimate zone it stops and steps back unless the task (handing an object) requires it. Distances change all the time, so zone changes need hysteresis; otherwise the robot's behaviour flips at every small movement.",
    ],
    steps: [
      "Compute the distance to the nearest person.",
      "Map it to a zone with the four limits.",
      "Add a 10 cm hysteresis before leaving a zone.",
      "Attach a behaviour to each zone.",
    ],
    example: hash(
      [
        "ZONES = [('intimate', 0.45), ('personal', 1.2), ('social', 3.6)]",
        "zone names with their outer distance limits (metres); beyond the last is 'public'.",
      ],
      [
        "BEHAVIOUR = {'intimate': 'stop and step back', 'personal': 'slow down and ask', 'social': 'interact', 'public': 'greet'}",
        "what the robot does in each zone.",
      ],
      ["", ""],
      [
        "def zone(distance, current=None, hyst=0.10):",
        "the zone for a distance, with hysteresis around the current zone.",
      ],
      ["    limit_prev = 0.0", "the inner boundary of the zone being tested."],
      ["    for name, limit in ZONES:", "from the closest zone outwards."],
      [
        "        upper = limit + (hyst if name == current else 0.0)",
        "the current zone extends a little further, so it is not left too early.",
      ],
      ["        if distance <= upper:", "inside this zone."],
      ["            return name", "found."],
      ["    return 'public'", "farther than all limits."],
      ["", ""],
      [
        "z = zone(1.25, current='personal')",
        "1.25 m is just outside the personal zone (1.2 m), but within the hysteresis.",
      ],
      [
        "print(z, BEHAVIOUR[z], zone(1.25, current='social'))",
        "prints personal, 'slow down and ask' and social.",
      ],
    ),
    walk: [
      "The same distance gives different zones depending on where the robot was, which is exactly what hysteresis does.",
      "Behaviours are data, so they can be adapted to culture, task and setting.",
      "The intimate zone response overrides everything else, except a deliberate task such as handing over an object.",
    ],
    expect: [
      "At 1.25 m, coming from the personal zone, the robot stays in 'personal'; coming from 'social' it stays in 'social'.",
      "Moving away slowly does not cause flicker between two behaviours.",
    ],
    fix: [
      [
        "The robot backs away from people who are handing it something.",
        "The intimate-zone rule ignores the task. Allow an exception for tasks that need close contact and announce them.",
      ],
      [
        "Zones feel wrong for some users.",
        "Preferences vary by culture and person. Make the limits parameters and allow the user to adjust them.",
      ],
    ],
    exercise:
      "Simulate a person walking toward the robot from 4 m at 1 m/s and print the zone and behaviour every 0.5 s.",
    checklist: [
      "Zones have hysteresis",
      "Behaviours are configurable",
      "Task-driven exceptions are explicit",
    ],
  }),
  lesson({
    title: "Safety standards",
    summary:
      "Use a risk matrix to rate hazards of a humanoid and decide which need more protection.",
    goals: [
      "Name the main standards for humanoid and personal-care robots",
      "Score a hazard with severity and likelihood",
      "Decide the action from the risk level",
    ],
    concept: [
      "There is no single standard for humanoids. ISO 13482 covers personal care robots, including mobile servants and physical assistants, ISO 10218 and ISO/TS 15066 cover industrial and collaborative robots, and ISO 13849-1 and IEC 61508 define how safety functions are built and rated. A risk assessment, required by all of them, lists the hazards, rates them and decides on protective measures.",
      "A simple risk matrix multiplies severity (1 to 5) by likelihood (1 to 5). The result decides the action: a low score is acceptable, a medium score needs additional protective measures, and a high score is not acceptable until the design changes. After protection the risk is rated again. The matrix is a tool for structured thinking, not a certification; the real assessment is done with a qualified expert and documented.",
    ],
    steps: [
      "List the hazards: falling on a person, pinching in a joint, a hot actuator, a moving arm hitting someone.",
      "Rate the severity and likelihood of each.",
      "Compute the score and the level.",
      "Write the protective measure for each hazard above the acceptable level and rate it again.",
    ],
    example: hash(
      ["HAZARDS = [", "hazards with severity (1-5) and likelihood (1-5)."],
      [
        "    ('robot falls onto a person', 5, 2),",
        "a severe injury that is unlikely because of the fall detection.",
      ],
      [
        "    ('finger pinched in a joint', 3, 3),",
        "a moderate injury that could happen during handover.",
      ],
      ["    ('arm strikes a bystander', 4, 3),", "a serious injury in a crowded room."],
      ["    ('touching a hot actuator', 2, 2),", "a minor injury, unlikely."],
      ["]", "end of the list."],
      ["", ""],
      ["def level(score):", "the action level for a risk score."],
      ["    if score >= 15:", "high."],
      ["        return 'unacceptable: redesign'", "the design must change."],
      ["    if score >= 8:", "medium."],
      ["        return 'reduce: add protective measures'", "add and rate the protection."],
      ["    return 'acceptable: document'", "low: record and monitor."],
      ["", ""],
      [
        "for name, severity, likelihood in sorted(HAZARDS, key=lambda h: -h[1] * h[2]):",
        "highest risk first.",
      ],
      [
        "    print(name, severity * likelihood, level(severity * likelihood))",
        "prints 12 (arm strike), 10 (fall), 9 (pinch) and 4 (hot actuator).",
      ],
    ),
    walk: [
      "Sorting by score puts the most important hazards at the top of the list.",
      "The fall (score 10) has the highest severity but a lower likelihood, which shows why both matter.",
      "The matrix is a discussion tool; the final decision on measures belongs to the risk assessment team.",
    ],
    expect: [
      "The arm strike scores 12, the fall 10, the pinch 9 and the hot actuator 4.",
      "Three hazards are 'reduce' level and one is acceptable; none is unacceptable before protection.",
    ],
    fix: [
      [
        "Everything scores as low risk.",
        "Likelihood is being underestimated. Rate it without assuming the protection works, then rate again with it.",
      ],
      [
        "Protective measures are software only.",
        "For serious hazards use hardware measures and certified safety functions; software supports but cannot be the only protection.",
      ],
    ],
    exercise:
      "Add a protective measure to the arm strike hazard (force limiting, a 250 mm/s speed limit near people) and recompute its likelihood and score.",
    checklist: [
      "Hazards are listed before solutions are chosen",
      "Risk is rated before and after protection",
      "A qualified expert reviews the assessment",
    ],
  }),
  lesson({
    title: "Full humanoid project",
    summary: "Run a supervised mission with a pre-flight check, a step list and abort conditions.",
    goals: [
      "Design a supervisor that runs a mission step by step",
      "Run a pre-flight check before any motion",
      "Abort safely when a condition fails",
    ],
    concept: [
      "The final project combines everything: perception, walking, manipulation, social behaviour and safety, tied together by a supervisor. The supervisor owns the mission: an ordered list of steps such as 'walk to the station', 'turn to the operator', 'signal ready', 'walk to the panel' and 'press start'. It starts nothing until a pre-flight check has passed and it watches abort conditions all the time.",
      "Every step is a small unit with a precondition, an action and a check that it succeeded. If a check fails or an abort condition becomes true (a person too close, a tilt above the limit, a lost sensor), the supervisor stops the mission, puts the robot in a safe posture and reports the reason. A mission log records every step and its result for later analysis.",
    ],
    steps: [
      "Write the pre-flight checks: TF complete, joint states fresh, battery above 30 %, no fault flags.",
      "Write the mission as a list of steps with a name, an action and a success check.",
      "Run the steps in order, checking the abort conditions between and during steps.",
      "Log every step with its result and the time.",
    ],
    example: hash(
      ["def preflight(robot):", "all checks must pass before the mission starts."],
      [
        "    checks = {'tf complete': robot.tf_ok(), 'joint states fresh': robot.states_fresh(), 'battery above 30%': robot.battery() > 0.30, 'no faults': not robot.faults()}",
        "each check with its result.",
      ],
      [
        "    failed = [name for name, ok in checks.items() if not ok]",
        "the names of the failed checks.",
      ],
      ["    return failed", "an empty list means the robot is ready."],
      ["", ""],
      [
        "MISSION = [('walk to station', 'walk', 'station'), ('turn to operator', 'turn', 90), ('signal ready', 'signal', 'ready'), ('walk to panel', 'walk', 'panel'), ('press start', 'press', 'start')]",
        "the mission: a name, a command and its argument.",
      ],
      ["", ""],
      ["def run(robot, log):", "run the mission; returns 'done' or the reason for stopping."],
      ["    failed = preflight(robot)", "check the robot first."],
      ["    if failed:", "something is not ready."],
      ["        return 'not ready: ' + ', '.join(failed)", "do not move; say why."],
      ["    for name, command, arg in MISSION:", "one step at a time."],
      ["        if robot.abort():", "a person too close, a tilt or a fault."],
      ["            robot.safe_posture()", "put the robot in a safe pose."],
      ["            return 'aborted before ' + name", "stop and report where."],
      [
        "        ok = getattr(robot, command)(arg)",
        "run the step; it returns True when its success check passes.",
      ],
      ["        log.append((name, ok))", "record the result."],
      ["        if not ok:", "the step failed."],
      ["            robot.safe_posture()", "make the robot safe."],
      ["            return 'failed at ' + name", "report the failed step."],
      ["    return 'done'", "the mission finished."],
    ),
    walk: [
      "The pre-flight check stops a mission that should never begin, and it names the failed checks.",
      "The abort condition is checked before every step, so the robot never starts a new motion in a bad state.",
      "The log lets you replay exactly what happened, which is essential for improving a humanoid.",
    ],
    expect: [
      "With everything healthy the mission returns 'done' and the log has five successful steps.",
      "With the battery at 20 % the result is 'not ready: battery above 30%' and nothing moves.",
    ],
    fix: [
      [
        "The mission stops in the middle for no clear reason.",
        "The abort condition triggered. Log the condition, not only the step, so the reason is visible.",
      ],
      [
        "A failed step leaves the robot in an awkward pose.",
        "The safe posture is not reachable from every pose. Design the safe posture as a well-tested motion from anywhere.",
      ],
    ],
    exercise:
      "Simulate the mission with random failures at 5 % per step and report the completion rate and the most common failure step over 200 runs.",
    checklist: [
      "A pre-flight check runs first",
      "Abort conditions are checked between steps",
      "Every step is logged with its result",
    ],
  }),
];
