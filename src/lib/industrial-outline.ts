// Public outline of the Industrial Robots course: module, section and lesson titles only.
// The paid lesson bodies live in src/lib/industrial-content and are served after purchase.

export type IndustrialModule = {
  number: string;
  robot: string;
  title: string;
  sourceLabel: string;
  sourceHref: string;
  sections: Array<{ title: string; lessons: string[] }>;
};

export const industrialModules: IndustrialModule[] = [
  {
    number: "01",
    robot: "articulated",
    title: "Six-Axis Articulated Arm",
    sourceLabel: "MoveIt 2 documentation",
    sourceHref: "https://moveit.picknik.ai/",
    sections: [
      {
        title: "Foundations",
        lessons: [
          "Robot anatomy & joint types",
          "Coordinate frames (world, base, tool)",
          "DH parameters introduction",
          "Forward kinematics derivation",
          "Inverse kinematics analytical methods",
          "Numerical IK solvers",
          "Workspace & reach analysis",
          "Singularities & avoidance",
          "Joint limits & safety envelopes",
          "Tool center point (TCP) calibration",
        ],
      },
      {
        title: "Motion & Control",
        lessons: [
          "PTP vs LIN vs CIRC motions",
          "Trajectory interpolation",
          "Velocity & acceleration profiles",
          "Dynamic modeling (Newton-Euler)",
          "PID joint control",
          "Feedforward torque control",
          "Collision detection",
          "Gravity compensation",
          "Redundancy resolution",
          "Smooth motion planning",
        ],
      },
      {
        title: "End-Effectors & I/O",
        lessons: [
          "Gripper types & selection",
          "Suction systems",
          "Welding & soldering tools",
          "Force/torque sensors",
          "Tool changers",
          "Digital & analog I/O",
          "Conveyor integration",
          "Vision-guided pick & place",
          "Calibration with fiducials",
          "Quality inspection workflows",
        ],
      },
      {
        title: "Software & ROS 2",
        lessons: [
          "URDF robot modeling",
          "MoveIt motion planning",
          "ROS 2 control setup",
          "Gazebo simulation",
          "Planning pipelines",
          "Collision geometry tuning",
          "Custom IK plugins",
          "Offline programming (RoboDK)",
          "Safety standards ISO 10218",
          "Full industrial cell integration",
        ],
      },
    ],
  },
  {
    number: "02",
    robot: "scara",
    title: "SCARA Robot",
    sourceLabel: "ROS 2 tf2 tutorials",
    sourceHref: "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/Tf2/Tf2-Main.html",
    sections: [
      {
        title: "Geometry & Kinematics",
        lessons: [
          "SCARA architecture (RRP)",
          "DH modeling",
          "FK & IK derivation",
          "Cylindrical workspace",
          "Singularities",
          "Compliance & stiffness",
          "High-speed motion profiles",
          "Repeatability vs accuracy",
          "Joint calibration",
          "Tool frame setup",
        ],
      },
      {
        title: "Assembly & Precision",
        lessons: [
          "Electronics assembly workflows",
          "Press-fit operations",
          "Peg-in-hole strategies",
          "Vision alignment",
          "Conveyor synchronization",
          "Micro-assembly tolerances",
          "Error compensation",
          "High-speed pick & place",
          "Cycle-time optimization",
          "Quality control",
        ],
      },
      {
        title: "ROS 2 & Automation",
        lessons: [
          "URDF SCARA modeling",
          "MoveIt kinematics plugin",
          "Trajectory execution",
          "PLC integration",
          "SCADA monitoring",
          "Gazebo SCARA simulation",
          "Vision pipeline",
          "Calibration routines",
          "Safety zones",
          "Full assembly cell project",
        ],
      },
    ],
  },
  {
    number: "03",
    robot: "delta",
    title: "Delta Parallel Robot",
    sourceLabel: "ROS clock and time",
    sourceHref: "https://design.ros2.org/articles/clock_and_time.html",
    sections: [
      {
        title: "Parallel Kinematics",
        lessons: [
          "Delta robot architecture",
          "FK & IK nonlinear equations",
          "Jacobian derivation",
          "Singularities",
          "Workspace mapping",
          "Platform dynamics",
          "Arm compliance",
          "High-speed motion constraints",
          "Vibration control",
          "Payload effects",
        ],
      },
      {
        title: "High-Speed Applications",
        lessons: [
          "Packaging workflows",
          "Sorting & binning",
          "Vision-based part tracking",
          "Conveyor synchronization",
          "Cycle-time optimization",
          "Error correction",
          "Multi-robot coordination",
          "Quality inspection",
          "Safety guarding",
          "Maintenance & tuning",
        ],
      },
      {
        title: "ROS 2 & Simulation",
        lessons: [
          "URDF/SDF parallel robot modeling",
          "Custom IK solver",
          "MoveIt integration",
          "High-speed trajectory planning",
          "Gazebo conveyor simulation",
          "Vision + tracking nodes",
          "Real-time control loops",
          "ROS 2 control tuning",
          "Safety monitoring",
          "Full packaging line project",
        ],
      },
    ],
  },
  {
    number: "04",
    robot: "cartesian",
    title: "Cartesian Gantry Robot",
    sourceLabel: "Managed node lifecycle",
    sourceHref: "https://design.ros2.org/articles/node_lifecycle.html",
    sections: [
      {
        title: "Linear Kinematics",
        lessons: [
          "Cartesian XYZ architecture",
          "Prismatic joint modeling",
          "FK derivation",
          "Workspace definition",
          "Rail alignment",
          "Backlash & compensation",
          "Payload effects",
          "Soft limits & hard limits",
          "Cable management",
          "Calibration",
        ],
      },
      {
        title: "Industrial Applications",
        lessons: [
          "CNC-style motion planning",
          "G-code concepts",
          "Welding gantry workflows",
          "Palletizing",
          "Large-area inspection",
          "Heavy payload handling",
          "Conveyor integration",
          "SCADA connectivity",
          "Safety zones",
          "Maintenance routines",
        ],
      },
      {
        title: "ROS 2",
        lessons: [
          "URDF gantry modeling",
          "ROS 2 control for linear actuators",
          "MoveIt Cartesian planning",
          "Gazebo gantry simulation",
          "Full warehouse gantry project",
        ],
      },
    ],
  },
  {
    number: "05",
    robot: "humanoid",
    title: "Humanoid Platform",
    sourceLabel: "ROS 2 QoS settings",
    sourceHref:
      "https://docs.ros.org/en/lyrical/Concepts/Intermediate/About-Quality-of-Service-Settings.html",
    sections: [
      {
        title: "Kinematics & Dynamics",
        lessons: [
          "Whole-body kinematics",
          "Arm/leg coordination",
          "Balance & stability",
          "ZMP control",
          "LIPM walking model",
          "Dynamic gait generation",
          "Joint torque control",
          "Fall detection",
          "Recovery strategies",
          "Motion blending",
        ],
      },
      {
        title: "Perception",
        lessons: [
          "Stereo vision",
          "Depth sensing",
          "LiDAR mapping",
          "Human detection",
          "Gesture recognition",
          "Object manipulation",
          "Scene understanding",
          "Voice commands",
          "Sensor fusion",
          "SLAM",
        ],
      },
      {
        title: "Locomotion & Manipulation",
        lessons: [
          "Walking",
          "Turning",
          "Running",
          "Stair climbing",
          "Arm manipulation",
          "Dual-arm coordination",
          "Tool use",
          "Grasp planning",
          "Whole-body planning",
          "Safety & compliance",
        ],
      },
      {
        title: "AI & ROS 2",
        lessons: [
          "Reinforcement learning gaits",
          "Behavior trees",
          "ROS 2 humanoid stack",
          "TF tree management",
          "Gazebo humanoid simulation",
          "Motion capture integration",
          "VR teleoperation",
          "Social interaction models",
          "Safety standards",
          "Full humanoid project",
        ],
      },
    ],
  },
  {
    number: "06",
    robot: "cobot",
    title: "Collaborative Robot (Cobot)",
    sourceLabel: "ROS 2 security",
    sourceHref: "https://docs.ros.org/en/lyrical/Concepts/Intermediate/About-Security.html",
    sections: [
      {
        title: "Safety & Interaction",
        lessons: [
          "ISO 15066",
          "Force limits",
          "Torque sensing",
          "Hand-guiding",
          "Safe zones",
          "Speed & separation monitoring",
          "Human detection",
          "Workspace sharing",
          "Ergonomics",
          "Risk assessment",
        ],
      },
      {
        title: "Control & Applications",
        lessons: [
          "Impedance control",
          "Force control",
          "Assembly tasks",
          "Screwdriving",
          "Inspection",
          "Vision-guided tasks",
          "Tool changers",
          "Calibration",
          "Error recovery",
          "Quality workflows",
        ],
      },
      {
        title: "ROS 2",
        lessons: [
          "URDF cobot modeling",
          "MoveIt planning",
          "Safety plugins",
          "Gazebo cobot simulation",
          "Vision pipeline",
          "Human tracking",
          "Task planning",
          "Multi-cobot coordination",
          "Safety monitoring",
          "Full cobot cell project",
        ],
      },
    ],
  },
  {
    number: "07",
    robot: "amr",
    title: "Autonomous Mobile Robot (AMR)",
    sourceLabel: "Nav2 documentation",
    sourceHref: "https://docs.nav2.org/",
    sections: [
      {
        title: "Kinematics & Perception",
        lessons: [
          "Diff-drive kinematics",
          "Odometry",
          "LiDAR basics",
          "Camera basics",
          "IMU fusion",
          "Sensor calibration",
          "TF tree",
          "Obstacle detection",
          "Floor marking detection",
          "Shelf detection",
        ],
      },
      {
        title: "Mapping & Navigation",
        lessons: [
          "SLAM Toolbox",
          "AMCL localization",
          "Nav2 setup",
          "Global planning",
          "Local planning",
          "Obstacle avoidance",
          "Behavior trees",
          "Docking",
          "Multi-floor navigation",
          "Recovery behaviors",
        ],
      },
      {
        title: "Warehouse Logic",
        lessons: [
          "Pick-deliver missions",
          "Aisle following",
          "Station detection",
          "ArUco docking",
          "Box detection (YOLO)",
          "Task manager",
          "Battery management",
          "Charging station logic",
          "Fleet coordination",
          "Traffic management",
        ],
      },
      {
        title: "ROS 2 & Deployment",
        lessons: [
          "URDF AMR modeling",
          "ROS 2 control",
          "Gazebo warehouse simulation",
          "Sensor fusion",
          "Monitoring dashboard",
          "Logging & metrics",
          "Real hardware integration",
          "Jetson deployment",
          "Safety standards",
          "Full warehouse AMR project",
        ],
      },
    ],
  },
];

export type IndustrialOutlineEntry = {
  slug: string;
  title: string;
  module: IndustrialModule;
  section: string;
  /** Zero-based position inside its module, matching the order of the lesson content file. */
  indexInModule: number;
};

function kebab(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const industrialOutline: IndustrialOutlineEntry[] = industrialModules.flatMap((module) => {
  let index = 0;
  return module.sections.flatMap((section) =>
    section.lessons.map((title) => {
      const entry = {
        slug: `${module.number}-${String(index + 1).padStart(2, "0")}-${kebab(title)}`,
        title,
        module,
        section: section.title,
        indexInModule: index,
      };
      index += 1;
      return entry;
    }),
  );
});
