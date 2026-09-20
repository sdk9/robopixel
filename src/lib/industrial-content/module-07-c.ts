import { hash, cpp, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 07 · Autonomous Mobile Robot (AMR) — Section C: Warehouse Logic (lessons 21–30)
export const module07c: LessonSpec[] = [
  lesson({
    title: "Pick-deliver missions",
    summary:
      "Validate a stamped goal, transform it into the map frame and send it to Nav2, and complete the interactive AMR lab.",
    goals: [
      "Break a pick-and-deliver mission into validated navigation goals",
      "Transform stamped goals into the map frame with a timeout",
      "Complete the lab by routing through the safety checkpoint",
    ],
    concept: [
      "A pick-and-deliver mission is a sequence: go to the rack, pick the tote, pass the safety checkpoint, go to the dock, drop the tote. Each navigation goal is a stamped pose in some frame, and it must be transformed into the map frame before it is checked and sent. A goal from the future, from an unknown frame or from outside the workspace is rejected, and nothing moves.",
      "The checkpoint keeps the route out of the human aisle. It is part of the mission, not a suggestion, so it is a goal in its own right and the dock goal is only sent after the checkpoint has succeeded. Every goal is sent asynchronously and the mission logic reacts to the result: success starts the next step; failure or timeout cancels and reports.",
    ],
    steps: [
      "Confirm map, odom and base_link form one TF tree.",
      "Transform PoseStamped goals into map before validation.",
      "Send valid goals through an action client and publish mission state.",
      "Cancel on timeout, then record odometry and scan topics. Then open the Robot Code Lab below and finish the mission.",
    ],
    example: cpp(
      [
        "geometry_msgs::msg::PoseStamped map_goal;",
        "create a variable that will hold the goal expressed in the map frame.",
      ],
      [
        "if (rclcpp::Time(input_goal.header.stamp) > now() + rclcpp::Duration::from_seconds(0.1)) return;",
        "reject goals stamped more than 0.1 s in the future, because such timestamps are not trustworthy.",
      ],
      ["try {", "start a block where a transform lookup may throw an error."],
      [
        '  map_goal = tf_buffer_->transform(input_goal, "map", tf2::durationFromSec(0.2));',
        "convert the goal into the map frame, waiting up to 0.2 s for the needed transform data.",
      ],
      [
        "} catch (const tf2::TransformException & error) {",
        "runs if the frame is unknown or no transform is available in time.",
      ],
      [
        '  RCLCPP_WARN(get_logger(), "goal rejected: %s", error.what()); return;',
        "log the reason for the failure and stop; nothing moves.",
      ],
      ["}", "end of the try/catch."],
      [
        "if (!valid_orientation(map_goal.pose.orientation) ||",
        "reject the goal unless its orientation is valid...",
      ],
      [
        "    !workspace_.contains(map_goal.pose.position) ||",
        "...it lies inside the allowed workspace...",
      ],
      [
        "    !costmap_.is_free(map_goal.pose.position)) return;",
        "...and the costmap says the spot is free.",
      ],
      [
        "navigate_client_->async_send_goal(make_goal(map_goal));",
        "the goal passed every check: build the navigation goal and send it without blocking.",
      ],
    ),
    walk: [
      "Each check happens before the goal is sent, so a bad goal can never cause motion.",
      "The transform has a 0.2 s timeout, so a missing transform fails quickly instead of blocking the node.",
      "Sending the goal is asynchronous, which keeps the mission node responsive to cancel requests and state queries.",
    ],
    expect: [
      "A valid goal is transformed, checked and sent, and the robot starts moving.",
      "An unknown frame, an out-of-bounds goal and a goal on an occupied cell are all rejected with a log message.",
    ],
    fix: [
      [
        "All goals are rejected as being in the future.",
        "The clocks of the goal sender and the robot differ. Synchronise them, or stamp goals with the robot's own clock.",
      ],
      [
        "The transform fails.",
        "The map to base_link chain is incomplete. Check localisation and the TF tree.",
      ],
    ],
    exercise:
      "Build a simulated mission dispatcher. Test a valid goal, unknown frame, out-of-bounds goal and cancellation.",
    checklist: [
      "The map to base frame chain exists",
      "Unknown frames fail without motion",
      "The action supports cancellation",
    ],
    lab: "07-autonomous-mobile-robot",
    source: [
      "C++ tf2 listener",
      "https://docs.ros.org/en/lyrical/Tutorials/Intermediate/Tf2/Writing-A-Tf2-Listener-Cpp.html",
    ],
  }),
  lesson({
    title: "Aisle following",
    summary:
      "Keep the robot centred in an aisle with a controller that uses the distances to the walls on both sides.",
    goals: [
      "Explain wall-based aisle following",
      "Compute the lateral offset from the left and right distances",
      "Steer with a limited proportional law and stop when a wall disappears",
    ],
    concept: [
      "In a narrow aisle between shelves the robot can steer from the distances to the two sides instead of following a planned path: if it is closer to the left shelf than to the right, it should move right. The lateral offset is half the difference of the two distances, and a proportional controller turns it into a steering command, together with the heading error relative to the aisle.",
      "This is simple and robust when the walls are continuous, but there are gaps: end of the aisle, an open bay, a pallet sticking out. When one side's distance jumps, the controller must not steer wildly toward the gap. It should hold the heading and the last good estimate for a short time, then slow down. Aisle width and the required clearances come from the site and the safety rules.",
    ],
    steps: [
      "Measure the distance to the left and right shelves from the scan.",
      "Compute the offset from the aisle centre.",
      "Compute a steering command from the offset and the heading error.",
      "Ignore a side whose distance jumps by more than 0.5 m in one cycle.",
    ],
    example: hash(
      [
        "def steer(left, right, heading_err, k_y=1.2, k_th=1.5, w_max=0.4):",
        "angular velocity (rad/s) that centres the robot in the aisle.",
      ],
      [
        "    offset = (left - right) / 2.0",
        "positive means the robot is nearer the right wall, so it should move left.",
      ],
      [
        "    w = k_y * offset - k_th * heading_err",
        "steer toward the centre and remove the heading error (positive w turns left).",
      ],
      ["    return max(-w_max, min(w_max, w))", "limit the turn rate."],
      ["", ""],
      ["class Aisle:", "keeps the last good distances and rejects sudden jumps."],
      ["    def __init__(self):", "start with no history."],
      ["        self.left = self.right = None", "the last accepted distances."],
      ["", ""],
      [
        "    def update(self, left, right, jump=0.5):",
        "returns (left, right, ok); ok is False if a side is not trusted.",
      ],
      ["        ok = True", "assume the readings are good."],
      [
        "        if self.left is not None and abs(left - self.left) > jump:",
        "the left distance jumped: a gap or a pallet.",
      ],
      [
        "            left, ok = self.left, False",
        "keep the last good value and mark the reading as doubtful.",
      ],
      [
        "        if self.right is not None and abs(right - self.right) > jump:",
        "the same check for the right side.",
      ],
      ["            right, ok = self.right, False", "keep the last good value."],
      ["        self.left, self.right = left, right", "remember the accepted values."],
      ["        return left, right, ok", "the caller slows down when ok is False."],
    ),
    walk: [
      "The offset is half the difference, so a robot 10 cm closer to one wall has an offset of 5 cm.",
      "The controller has both a position term and a heading term, which stops it from swinging from wall to wall.",
      "The jump check stops the robot from being pulled into a bay or a gap in the shelves.",
    ],
    expect: [
      "A robot centred and parallel to the aisle gives a steering command of 0.",
      "A sudden increase of the left distance from 0.7 to 2.0 m is ignored and the reading is marked doubtful.",
    ],
    fix: [
      [
        "The robot zigzags along the aisle.",
        "The gains are too high. Lower k_y and k_th, or filter the distance measurements.",
      ],
      [
        "The robot turns into a bay.",
        "The jump check is missing or too loose. Reject sudden distance changes and slow down.",
      ],
    ],
    exercise:
      "Simulate an aisle with a 1.5 m gap on one side and check that the robot passes it without swerving.",
    checklist: ["Both walls are used", "Sudden jumps are rejected", "The turn rate is limited"],
  }),
  lesson({
    title: "Station detection",
    summary:
      "Recognise a station from its marker ID and confirm it over several frames before acting.",
    goals: [
      "Map marker IDs to stations",
      "Confirm a detection over several frames",
      "Handle a missing or wrong station safely",
    ],
    concept: [
      "The navigation stack brings the robot near a station. Which station it actually is, and where exactly, comes from a marker: a printed tag with an ID that the camera reads. A table maps each ID to a station name and the actions that belong to it (pick up, drop off, charge). The robot compares the ID it sees with the ID it expects for the current mission step.",
      "A single frame can contain a false or partly read tag, so the detection must be confirmed: the same ID in a number of consecutive frames. A mismatch (a different ID than expected) stops the step and reports it, because acting at the wrong station could mean loading a wrong pallet. No detection within a timeout is also an error, not a reason to proceed.",
    ],
    steps: [
      "Write the ID-to-station table.",
      "Read marker IDs from each camera frame.",
      "Count consecutive frames with the same ID.",
      "Return the station only after five confirmations, and report a mismatch.",
    ],
    example: hash(
      [
        "STATIONS = {11: 'rack_a', 12: 'rack_b', 21: 'dock', 31: 'charger'}",
        "the marker ID of each station.",
      ],
      ["", ""],
      ["class StationDetector:", "confirms the station's identity over several frames."],
      [
        "    def __init__(self, expected, need=5):",
        "the station the mission expects and the number of consecutive frames required.",
      ],
      [
        "        self.expected, self.need, self.last, self.count = expected, need, None, 0",
        "state: the last ID and how many times in a row it was seen.",
      ],
      ["", ""],
      ["    def update(self, marker_id):", "call for every frame with the ID seen, or None."],
      ["        if marker_id is not None and marker_id == self.last:", "the same ID again."],
      ["            self.count += 1", "one more confirmation."],
      ["        else:", "a different ID or no ID."],
      [
        "            self.last, self.count = marker_id, 1 if marker_id is not None else 0",
        "start counting again.",
      ],
      ["        if self.count >= self.need:", "confirmed."],
      ["            name = STATIONS.get(self.last, 'unknown')", "look up the station's name."],
      [
        "            return ('ok', name) if name == self.expected else ('mismatch', name)",
        "the right station, or a wrong one that must be reported.",
      ],
      ["        return 'searching', None", "not confirmed yet."],
    ),
    walk: [
      "The counter resets whenever the ID changes, so flicker between two IDs never confirms anything.",
      "A mismatch is a defined result, so the mission logic can stop the step instead of carrying on.",
      "The expected station comes from the mission, not from what the robot sees, which prevents self-confirmation.",
    ],
    expect: [
      "Five frames of ID 11 with expected 'rack_a' return ('ok', 'rack_a').",
      "Five frames of ID 12 with expected 'rack_a' return ('mismatch', 'rack_b').",
    ],
    fix: [
      [
        "The detection never confirms.",
        "The marker is partly out of view or badly lit. Check the camera position, the marker size and the lighting.",
      ],
      [
        "The robot works at the wrong station.",
        "Expected and seen IDs were not compared. Always compare and stop on a mismatch.",
      ],
    ],
    exercise:
      "Add a timeout of 10 seconds that returns ('timeout', None) when nothing has been confirmed.",
    checklist: [
      "IDs are confirmed over several frames",
      "A mismatch stops the step",
      "There is a timeout for a missing marker",
    ],
  }),
  lesson({
    title: "ArUco docking",
    summary:
      "Compute a docking goal in front of an ArUco marker in the map frame from its detected pose.",
    goals: [
      "Explain how a marker pose gives a docking goal",
      "Compute the goal pose 0.5 m in front of the marker",
      "Hand the goal to the navigation stack and the final approach to the dock controller",
    ],
    concept: [
      "An ArUco marker on the dock gives a precise reference: its pose in the camera frame is found with solvePnP, and with the camera's pose on the robot and the robot's pose in the map, the marker's pose in the map follows by multiplying transforms. The docking goal is a pose in front of the marker, facing it, at a distance where the final approach controller can take over, for example 0.5 m.",
      "The goal is computed by multiplying the marker's pose in the map with a fixed transform 'goal in marker frame': 0.5 m along the marker's normal and turned by 180 degrees so that the robot faces the marker. Nav2 drives the robot to that goal, and the docking controller from the earlier lesson does the last 0.5 m. If the marker is seen only from a steep angle, the pose is less accurate, so the robot should first approach from the front.",
    ],
    steps: [
      "Detect the marker and get its pose in the camera frame.",
      "Transform it into the map with the TF tree.",
      "Multiply by the fixed goal offset in the marker frame.",
      "Send the resulting goal to Nav2, then start the docking controller.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the transforms."],
      ["", ""],
      ["def transform(x, y, z, yaw):", "a 4x4 transform from a position and a yaw angle."],
      ["    c, s = np.cos(yaw), np.sin(yaw)", "cosine and sine of the yaw."],
      [
        "    T = np.array([[c, -s, 0, x], [s, c, 0, y], [0, 0, 1, z], [0, 0, 0, 1]])",
        "rotation about z plus the position.",
      ],
      ["    return T", "the transform."],
      ["", ""],
      [
        "def dock_goal(T_map_marker, distance=0.5):",
        "the pose 0.5 m in front of the marker, facing it, in the map frame.",
      ],
      [
        "    T_marker_goal = transform(distance, 0.0, 0.0, np.pi)",
        "0.5 m along the marker's x axis (its normal here), turned by 180 degrees.",
      ],
      [
        "    return T_map_marker @ T_marker_goal",
        "chain the transforms: map to marker, then marker to goal.",
      ],
      ["", ""],
      [
        "T = transform(5.0, 2.0, 0.0, 0.0)",
        "a marker at (5, 2) in the map, its normal pointing along +x.",
      ],
      ["G = dock_goal(T)", "the docking goal."],
      [
        "print(G[:2, 3].round(2), round(float(np.degrees(np.arctan2(G[1, 0], G[0, 0]))), 1))",
        "prints [5.5 2.0] and 180.0: half a metre in front of the marker, facing it.",
      ],
    ),
    walk: [
      "The goal offset is a constant in the marker frame, so it is correct for any position and rotation of the dock.",
      "The 180 degree turn makes the robot look at the marker, which is what the final approach needs.",
      "The accuracy of the goal depends on the marker pose, which improves when the marker is seen from the front.",
    ],
    expect: [
      "The script prints [5.5 2.0] and 180.0.",
      "Rotating the marker by 90 degrees rotates the goal around it, and the robot still faces the marker.",
    ],
    fix: [
      [
        "The robot parks beside the dock.",
        "The marker frame axes differ from your assumption. Draw the marker and check which axis is its normal.",
      ],
      [
        "The goal jumps between detections.",
        "The marker pose is noisy at long range. Average the pose over several frames and use the marker only when it is close.",
      ],
    ],
    exercise:
      "Add the robot's camera offset and compute the goal from a detection made while the robot stands 2 m away at an angle.",
    checklist: [
      "The marker axes are checked",
      "The goal is computed from data, not fixed",
      "The final approach uses the dock controller",
    ],
  }),
  lesson({
    title: "Box detection (YOLO)",
    summary:
      "Detect boxes and pallets with a YOLO model and keep only confident, plausible detections.",
    goals: [
      "Run a YOLO model on a camera image",
      "Filter detections by confidence and size",
      "Convert detections into a list for the task logic",
    ],
    concept: [
      "Boxes, pallets and totes come in many sizes, colours and states, so a learned detector such as YOLO is a natural choice. It returns a bounding box, a class and a confidence for every object it finds in an image. A model trained on your warehouse images works far better than a general one, so collecting and labelling images from the real site is the real effort.",
      "Raw detections need filtering. A minimum confidence removes weak guesses, a size filter removes boxes that are too small or too large to be real, and non-maximum suppression (done inside the model) removes duplicates. The result feeds decisions such as 'is the pallet position free?' or 'is there a box on the shelf?'. Wrong decisions cost more than missed ones in some tasks, so the thresholds depend on the task.",
    ],
    steps: [
      "Collect and label images from the warehouse and train the model.",
      "Load the model and run it on a camera image.",
      "Keep detections above 0.6 confidence and inside a plausible size range.",
      "Test on images with no boxes, partly hidden boxes and unusual lighting.",
    ],
    example: hash(
      ["from ultralytics import YOLO", "the YOLO library."],
      ["", ""],
      [
        "model = YOLO('warehouse_boxes.pt')",
        "load a model trained on images from your own warehouse.",
      ],
      ["", ""],
      [
        "def find_boxes(image, min_conf=0.6, min_area=2500, max_area=200000):",
        "list of (class name, confidence, (x1, y1, x2, y2)) for plausible detections.",
      ],
      [
        "    result = model(image, conf=min_conf, verbose=False)[0]",
        "run the detector, dropping detections below the confidence threshold.",
      ],
      ["    found = []", "the filtered list."],
      ["    for b in result.boxes:", "each detection."],
      [
        "        x1, y1, x2, y2 = (float(v) for v in b.xyxy[0])",
        "the bounding box corners in pixels.",
      ],
      ["        area = (x2 - x1) * (y2 - y1)", "the box's size in pixels."],
      [
        "        if not min_area <= area <= max_area:",
        "too small or too large to be a real box at this distance.",
      ],
      ["            continue", "skip it."],
      [
        "        found.append((model.names[int(b.cls[0])], float(b.conf[0]), (x1, y1, x2, y2)))",
        "keep the class name, the confidence and the box.",
      ],
      ["    return found", "detections for the task logic."],
    ),
    walk: [
      "The size limits depend on the camera's distance to the shelf, so they must be tuned for the actual viewing distance.",
      "The class names come from the model, so the same code serves boxes, pallets and totes.",
      "Confidence is passed on with each detection, so later logic can treat weak detections carefully.",
    ],
    expect: [
      "An image of a stack of boxes returns one entry per box with confidences above 0.6.",
      "An empty shelf returns an empty list.",
    ],
    fix: [
      [
        "Boxes are missed in poor light.",
        "The training images lack such conditions. Add images from the dark parts of the warehouse and retrain.",
      ],
      [
        "Many false detections appear.",
        "Raise the confidence and check the training labels for errors. Add negative images without boxes.",
      ],
    ],
    exercise:
      "Measure precision and recall of your filter on 100 labelled images at three confidence thresholds.",
    checklist: [
      "The model is trained on site images",
      "Confidence and size filters are set from data",
      "Precision and recall are measured",
    ],
  }),
  lesson({
    title: "Task manager",
    summary: "Queue missions by priority and time and give them to robots in a defined order.",
    goals: [
      "Explain the role of the task manager",
      "Implement a priority queue with first-in-first-out order inside a priority",
      "Handle cancelled and failed missions",
    ],
    concept: [
      "The task manager receives missions from the warehouse system, such as 'move tote 4711 from rack A to the dock', and decides which robot does what and when. A queue keeps them in order: urgent missions first, and within the same priority the oldest first, so nothing waits for ever. Each mission has a state: waiting, active, done, failed or cancelled.",
      "The manager must handle the awkward cases. A cancelled mission is removed or aborted, a failed mission is reported and, if allowed, retried a limited number of times, and a mission that has waited too long has its priority raised (ageing). Everything is logged with times, so throughput and delays can be measured. The manager does not drive robots itself; it sends goals to the robots' navigation systems.",
    ],
    steps: [
      "Define the mission record with an ID, a priority and a state.",
      "Write add, next and cancel operations on a priority queue.",
      "Add a retry count and a limit for failed missions.",
      "Test the order with missions of different priority.",
    ],
    example: hash(
      ["import heapq, itertools", "a priority queue and a counter for the order of arrival."],
      ["", ""],
      ["class Tasks:", "a queue of missions: lower priority number means more urgent."],
      ["    def __init__(self, max_retries=2):", "how often a failed mission may be retried."],
      [
        "        self.heap, self.count, self.state, self.tries, self.max = [], itertools.count(), {}, {}, max_retries",
        "the queue, an arrival counter, and the states and retries by mission ID.",
      ],
      ["", ""],
      ["    def add(self, mission_id, priority=5):", "put a mission in the queue."],
      [
        "        heapq.heappush(self.heap, (priority, next(self.count), mission_id))",
        "sorted by priority, then by arrival order.",
      ],
      ["        self.state[mission_id] = 'waiting'", "record its state."],
      ["", ""],
      ["    def next(self):", "the next mission to run, or None."],
      ["        while self.heap:", "skip cancelled entries."],
      ["            _, _, mid = heapq.heappop(self.heap)", "the most urgent, oldest mission."],
      ["            if self.state.get(mid) == 'waiting':", "still valid?"],
      ["                self.state[mid] = 'active'", "hand it to a robot."],
      ["                return mid", "the mission to start."],
      ["        return None", "the queue is empty."],
      ["", ""],
      ["    def failed(self, mid, priority=5):", "a robot reports a failed mission."],
      ["        self.tries[mid] = self.tries.get(mid, 0) + 1", "count the failure."],
      ["        if self.tries[mid] <= self.max:", "retries left?"],
      [
        "            self.add(mid, max(1, priority - 1))",
        "queue it again with a slightly higher priority.",
      ],
      ["        else:", "no retries left."],
      ["            self.state[mid] = 'failed'", "report it for a person to handle."],
    ),
    walk: [
      "The arrival counter keeps missions of equal priority in the order they were received.",
      "Cancelled missions simply change their state and are skipped when they reach the front, which keeps cancel cheap.",
      "A limited number of retries prevents a broken mission from blocking the queue for ever.",
    ],
    expect: [
      "A priority 1 mission added last is started before priority 5 missions added earlier.",
      "A mission that fails three times ends in the 'failed' state.",
    ],
    fix: [
      [
        "Low-priority missions never run.",
        "Urgent missions keep arriving. Add ageing that raises the priority of old missions.",
      ],
      [
        "A mission runs twice.",
        "It was added again without checking its state. Use the mission ID to detect duplicates.",
      ],
    ],
    exercise:
      "Add a cancel(mission_id) method and a test that cancels a waiting mission and an active mission.",
    checklist: [
      "Order is by priority, then arrival",
      "Failures are limited and reported",
      "Every state change is logged",
    ],
  }),
  lesson({
    title: "Battery management",
    summary:
      "Decide when a robot must go to charge from its state of charge, the distance to the dock and a reserve.",
    goals: [
      "Estimate the energy needed for a mission",
      "Decide whether to accept a mission or go to charge",
      "Keep a reserve so the robot never runs empty",
    ],
    concept: [
      "A robot that runs out of battery in an aisle blocks traffic and needs to be rescued. The battery management rules must therefore be conservative. The state of charge (SoC) comes from the battery management system; the energy needed for a mission is estimated from the distance, the speed and the average power draw. A mission is only accepted if the SoC after it, including the trip to the charger, is above a reserve.",
      "Two thresholds work well: a 'go charge' level (for example 25 %) at which the robot finishes its current step and returns to the charger, and a critical level (for example 15 %) below which it only drives to the charger and takes no new mission. The thresholds depend on the battery's age, temperature and the site's charger layout, and should be set from measured consumption, not from the datasheet alone.",
    ],
    steps: [
      "Measure the average power draw while driving and while idle.",
      "Estimate the energy of a mission from its distance and speed.",
      "Include the energy for the way to the nearest charger.",
      "Accept the mission only if the SoC after both is above the reserve.",
    ],
    example: hash(
      [
        "CAPACITY_WH, POWER_W, SPEED = 500.0, 60.0, 1.0",
        "battery capacity, average driving power and average speed (m/s).",
      ],
      [
        "RESERVE, GO_CHARGE = 15.0, 25.0",
        "critical reserve and the level at which the robot goes to charge, in percent.",
      ],
      ["", ""],
      ["def soc_needed(distance_m):", "percent of the battery used to drive a distance."],
      [
        "    return POWER_W * (distance_m / SPEED) / 3600.0 / CAPACITY_WH * 100.0",
        "power times time gives watt-hours, converted to percent of the capacity.",
      ],
      ["", ""],
      ["def decide(soc, mission_m, to_charger_m):", "what should the robot do?"],
      ["    if soc <= RESERVE:", "at or below the critical level."],
      ["        return 'charge now'", "drive to the charger and accept nothing."],
      [
        "    after = soc - soc_needed(mission_m) - soc_needed(to_charger_m)",
        "the SoC after the mission and the way to the charger.",
      ],
      ["    if after < RESERVE:", "the mission would leave too little."],
      ["        return 'charge first'", "charge before accepting it."],
      [
        "    return 'accept' if soc > GO_CHARGE else 'charge first'",
        "accept only above the go-charge level.",
      ],
      ["", ""],
      [
        "print(round(soc_needed(300), 1), decide(60.0, 300, 100), decide(28.0, 4000, 100), decide(12.0, 50, 50))",
        "prints 1.0, then accept, charge first and charge now.",
      ],
    ),
    walk: [
      "Energy is power times time, and time is distance over speed; every number can be checked with real measurements.",
      "The estimate always includes the return to the charger, so the robot cannot commit to a one-way trip.",
      "Three outcomes are possible and all are safe: accept, charge first and charge now.",
    ],
    expect: [
      "The script prints 1.0 (percent for 300 m), then accept, charge first and charge now.",
      "Raising the average power to 120 W doubles the energy estimates and makes more missions wait for a charge.",
    ],
    fix: [
      [
        "Robots run empty although the logic says they are fine.",
        "The power estimate is too low or the battery has aged. Measure real consumption and derate the capacity.",
      ],
      [
        "Robots charge too often.",
        "Thresholds are too high. Adjust them from data, but keep the reserve.",
      ],
    ],
    exercise:
      "Log the SoC before and after 50 missions and compute the real percentage per 100 m to replace the estimate.",
    checklist: [
      "The trip to the charger is always included",
      "Thresholds come from measured consumption",
      "The critical reserve is never used for missions",
    ],
  }),
  lesson({
    title: "Charging station logic",
    summary:
      "Run the charging sequence as a state machine with contact checks, retries and a stop at 95 %.",
    goals: [
      "Describe the phases of docking, charging and undocking",
      "Verify charging contact with a voltage reading",
      "Retry a failed contact a limited number of times",
    ],
    concept: [
      "Charging is a small sequence: approach and dock, check that the charging contacts are really connected, start the charger, wait until the battery is full enough, stop the charger and undock. Each step is confirmed by a sensor: contact by a voltage on the contacts, charging by the current, and completion by the SoC. Nothing is assumed.",
      "Contacts fail: dirt, a slightly wrong docking pose or a bent spring. So a contact failure is retried after re-docking a limited number of times, and then reported for maintenance. Charging to 95 % instead of 100 % is common practice because the last part is slow and hard on the battery. The robot must not undock while the charger is delivering current.",
    ],
    steps: [
      "Write the states: docking, contact check, charging, done, undocking, fault.",
      "Confirm each transition with a sensor reading.",
      "Retry the contact check twice by re-docking.",
      "Stop charging at 95 % SoC and undock only after the current is zero.",
    ],
    example: hash(
      ["class Charging:", "the charging sequence of one robot."],
      [
        "    def __init__(self, robot, retries=2, stop_soc=95.0):",
        "the robot interface, the allowed contact retries and the SoC at which to stop.",
      ],
      [
        "        self.r, self.retries, self.stop, self.state, self.tries = robot, retries, stop_soc, 'docking', 0",
        "the initial state.",
      ],
      ["", ""],
      ["    def step(self):", "advance the sequence; call repeatedly."],
      ["        r = self.r", "shorter name."],
      [
        "        if self.state == 'docking' and r.docked():",
        "the dock controller reports that the robot is in position.",
      ],
      ["            self.state = 'contact'", "check the contacts next."],
      ["        elif self.state == 'contact':", "verify the electrical contact."],
      [
        "            if r.contact_voltage() > 20.0:",
        "a voltage on the contacts means a connection.",
      ],
      ["                r.charger_on(); self.state = 'charging'", "start charging."],
      ["            else:", "no contact."],
      ["                self.tries += 1", "count the failure."],
      ["                if self.tries > self.retries:", "too many failures."],
      ["                    self.state = 'fault'", "report it for maintenance."],
      ["                else:", "try again."],
      ["                    r.redock(); self.state = 'docking'", "back out and dock again."],
      [
        "        elif self.state == 'charging' and r.soc() >= self.stop:",
        "the battery is full enough.",
      ],
      ["            r.charger_off(); self.state = 'done'", "stop the charger."],
      [
        "        elif self.state == 'done' and r.charge_current() < 0.5:",
        "the current has fallen to zero.",
      ],
      ["            r.undock(); self.state = 'finished'", "only now leave the dock."],
      ["        return self.state", "the caller logs the state."],
    ),
    walk: [
      "Every transition is triggered by a sensor reading, never by a timer alone.",
      "The undock step waits for the current to drop, which protects the contacts from arcing.",
      "The retry limit turns a dirty contact into a maintenance report instead of an endless loop.",
    ],
    expect: [
      "A healthy dock goes through docking, contact, charging, done and finished.",
      "Three failed contact checks end in the 'fault' state.",
    ],
    fix: [
      [
        "The robot undocks while charging.",
        "The undock waited for a timer, not the current. Wait for the current to fall below the limit.",
      ],
      [
        "The contact often fails.",
        "Dirt or a docking misalignment. Clean the contacts and check the dock's pose and the springs.",
      ],
    ],
    exercise:
      "Add a temperature check that stops charging if the battery exceeds 45 degrees Celsius and reports a fault.",
    checklist: [
      "Each step is confirmed by a sensor",
      "Contact retries are limited",
      "The robot never undocks under charge",
    ],
  }),
  lesson({
    title: "Fleet coordination",
    summary: "Assign each new mission to the best available robot by distance and battery state.",
    goals: [
      "Explain the fleet manager's role",
      "Score robots for a mission by distance and battery",
      "Avoid assigning a mission to a robot that cannot finish it",
    ],
    concept: [
      "A fleet manager sees all robots and all missions. For each new mission it decides who takes it. A simple, robust rule is to choose, among the idle robots that can finish the mission with enough battery, the one that can reach the start of the mission first. More elaborate systems also plan several missions together, but this greedy rule already works well in many warehouses.",
      "The manager must know the state of every robot: position, current task, battery and whether it is healthy. A robot that is offline or in a fault state is never chosen. If no robot qualifies, the mission waits, and the manager can send a robot to charge or free a blocked one. The decision and the reasons are logged, which makes the fleet's behaviour explainable when something goes wrong.",
    ],
    steps: [
      "Keep a table of robots with position, state and battery.",
      "Filter the idle, healthy robots with enough battery.",
      "Score them by distance to the mission start.",
      "Assign the best one and record the reasons.",
    ],
    example: hash(
      ["import math", "for the distance."],
      ["", ""],
      [
        "def choose(robots, mission_start, mission_m, min_soc=25.0):",
        "pick a robot for a mission; returns (robot name, reason) or (None, reason).",
      ],
      ["    best = None", "the best candidate so far."],
      ["    for r in robots:", "look at every robot."],
      ["        if r['state'] != 'idle' or r['fault']:", "busy, or not healthy."],
      ["            continue", "skip it."],
      [
        "        to_start = math.dist(r['pos'], mission_start)",
        "how far the robot is from the pick-up point.",
      ],
      [
        "        need = 0.02 * (to_start + mission_m)",
        "a rough battery estimate: 0.02 percent per metre.",
      ],
      [
        "        if r['soc'] - need < min_soc:",
        "it would arrive at the end with too little battery.",
      ],
      ["            continue", "skip it."],
      ["        if best is None or to_start < best[0]:", "closer than the best so far."],
      ["            best = (to_start, r['name'])", "remember it."],
      ["    if best is None:", "nobody qualifies."],
      ["        return None, 'no idle robot with enough battery'", "the mission waits."],
      [
        "    return best[1], f'nearest suitable robot, {best[0]:.1f} m away'",
        "the winner and the reason.",
      ],
    ),
    walk: [
      "Health, state and battery are checked before distance, so a nearby but unfit robot is never chosen.",
      "The reason string makes the decision explainable when a supervisor asks why robot 3 was picked.",
      "The battery estimate is rough on purpose; the robot itself makes the final decision with its own energy model.",
    ],
    expect: [
      "With three idle robots the nearest one with enough battery is chosen and the reason is logged.",
      "If all robots are busy or low on battery the function returns (None, ...) and the mission waits.",
    ],
    fix: [
      [
        "One robot gets all the work.",
        "The nearest-robot rule always picks the same robot. Add a balancing term based on completed missions.",
      ],
      [
        "Robots collide in the same aisle.",
        "The assignment ignores traffic. Add reservations along the route (see the traffic management lesson).",
      ],
    ],
    exercise:
      "Add a balancing term that prefers robots with fewer completed missions when two robots are within 3 m of each other.",
    checklist: [
      "Only healthy, idle and charged robots are candidates",
      "Decisions are logged with reasons",
      "Fleet load is balanced",
    ],
  }),
  lesson({
    title: "Traffic management",
    summary:
      "Reserve route segments in time windows so robots never meet head-on in a narrow aisle.",
    goals: [
      "Explain traffic conflicts in a shared aisle graph",
      "Reserve an edge for a time window and detect overlaps",
      "Detect head-on conflicts on a one-lane edge",
    ],
    concept: [
      "Robots share aisles and crossings, and two robots meeting head-on in a one-lane aisle block each other. Traffic management prevents it by reserving the segments of a route in advance. The warehouse is modelled as a graph of nodes (crossings and stations) and edges (aisle segments). A robot asks for every edge of its route with the time window in which it will use it, and gets it only if the window does not overlap with another robot's reservation on that edge.",
      "On a one-lane edge robots travelling in opposite directions conflict even if their windows do not seem to overlap exactly, so a head-on check treats both directions as the same resource. Reservations have a margin in time, and a robot that is late or stuck must renew or release its reservation, or others are stuck behind it. Waiting robots pull into a bay, or stay at the last crossing, before the conflicting edge.",
    ],
    steps: [
      "Model the aisles as edges between nodes.",
      "For each edge of a route compute the entry and exit time.",
      "Check the windows against existing reservations on the same edge, in both directions.",
      "Reserve all edges or none, and release them when the robot has passed.",
    ],
    example: hash(
      ["class Traffic:", "reservations of aisle edges in time."],
      ["    def __init__(self, margin=2.0):", "extra time (s) before and after each reservation."],
      ["        self.booked, self.margin = {}, margin", "edge to a list of (start, end, robot)."],
      ["", ""],
      ["    @staticmethod", "the edge key does not depend on an instance."],
      ["    def key(a, b):", "one key for both directions of an edge."],
      ["        return tuple(sorted((a, b)))", "(A, B) and (B, A) are the same one-lane resource."],
      ["", ""],
      [
        "    def free(self, edge, t0, t1, robot):",
        "is the edge free for this robot in the window?",
      ],
      [
        "        for s, e, who in self.booked.get(self.key(*edge), []):",
        "look at the existing bookings of the edge.",
      ],
      [
        "            if who != robot and t0 < e + self.margin and t1 > s - self.margin:",
        "another robot's window overlaps this one, including the margin.",
      ],
      ["                return False", "conflict."],
      ["        return True", "no conflict."],
      ["", ""],
      [
        "    def reserve(self, robot, route):",
        "route is a list of (edge, t0, t1); all edges are reserved or none.",
      ],
      [
        "        if not all(self.free(edge, t0, t1, robot) for edge, t0, t1 in route):",
        "check every edge first.",
      ],
      ["            return False", "the robot must wait."],
      ["        for edge, t0, t1 in route:", "now book them."],
      [
        "            self.booked.setdefault(self.key(*edge), []).append((t0, t1, robot))",
        "record the reservation.",
      ],
      ["        return True", "granted."],
    ),
    walk: [
      "Sorting the two node names gives one key for both directions, which is what makes head-on conflicts visible.",
      "All-or-nothing booking means a robot never holds part of a route and blocks others while waiting for the rest.",
      "The time margin covers timing errors, so two robots do not arrive at the same moment.",
    ],
    expect: [
      "Robot A booking A→B from t = 10 to 20 makes a booking of B→A from t = 15 to 25 by robot B fail.",
      "The same booking at t = 30 to 40 succeeds.",
    ],
    fix: [
      [
        "Robots wait far too long.",
        "Margins or windows are too large, or reservations are not released. Release edges as soon as the robot has passed.",
      ],
      [
        "Two robots deadlock at a crossing.",
        "Each holds one edge and waits for the other. Reserve whole routes at once, or give priorities.",
      ],
    ],
    exercise:
      "Simulate 10 robots on a ring of 8 nodes with random missions and count the deadlocks and the mean waiting time.",
    checklist: [
      "Both directions of an edge are one resource",
      "Reservations are all-or-nothing",
      "Reservations are released after use",
    ],
  }),
];
