import { hash, lesson, type LessonSpec } from "@/lib/industrial-content/types";

// Module 05 · Humanoid Platform — Section B: Perception (lessons 11–20)
export const module05b: LessonSpec[] = [
  lesson({
    title: "Stereo vision",
    summary:
      "Compute depth from the disparity between two cameras and understand its accuracy limits.",
    goals: [
      "Explain the relation between disparity and depth",
      "Compute a disparity map with OpenCV's semi-global matching",
      "Estimate the depth error at a given distance",
    ],
    concept: [
      "Two cameras a known distance B apart (the baseline) see the same point at slightly different image positions. The difference is the disparity d in pixels, and the depth is Z = f·B / d, where f is the focal length in pixels. Near objects have a large disparity and far ones a small disparity, so depth accuracy falls quickly with distance.",
      "A disparity error of one pixel produces a depth error of ΔZ ≈ Z²·Δd / (f·B), so it grows with the square of the distance. A humanoid head with a 6 cm baseline sees well within about 3 m and poorly beyond 6 m. The cameras must be calibrated and rectified first, so that matching points lie on the same image row.",
    ],
    steps: [
      "Calibrate and rectify the two cameras (intrinsics and extrinsics).",
      "Compute the disparity map with StereoSGBM.",
      "Convert disparity to depth with Z = f·B / d, ignoring invalid pixels.",
      "Estimate the depth error at 1, 3 and 6 metres.",
    ],
    example: hash(
      ["import cv2, numpy as np", "OpenCV for the matching and numpy for the arrays."],
      ["", ""],
      ["F_PX, BASELINE = 600.0, 0.06", "focal length in pixels and baseline in metres."],
      [
        "stereo = cv2.StereoSGBM_create(minDisparity=0, numDisparities=128, blockSize=5)",
        "semi-global block matching; the disparity range must cover the nearest object.",
      ],
      ["", ""],
      ["def depth_map(left, right):", "depth in metres for a rectified grey stereo pair."],
      [
        "    disp = stereo.compute(left, right).astype(np.float32) / 16.0",
        "OpenCV returns the disparity as fixed point with 4 fractional bits.",
      ],
      ["    depth = np.zeros_like(disp)", "start with 'no depth' everywhere."],
      ["    ok = disp > 1.0", "ignore pixels without a valid match."],
      ["    depth[ok] = F_PX * BASELINE / disp[ok]", "Z = f * B / d."],
      ["    return depth", "the depth image in metres."],
      ["", ""],
      [
        "def depth_error(z, disp_err=0.5):",
        "depth uncertainty (m) at distance z for a half-pixel disparity error.",
      ],
      [
        "    return z * z * disp_err / (F_PX * BASELINE)",
        "the error grows with the square of the distance.",
      ],
      ["", ""],
      [
        "print(round(F_PX * BASELINE / 12.0, 2), [round(depth_error(z), 3) for z in (1.0, 3.0, 6.0)])",
        "12 px disparity is 3.0 m; errors are 0.014, 0.125 and 0.5 m.",
      ],
    ),
    walk: [
      "Dividing by 16 undoes OpenCV's fixed-point format, which is the most common mistake with SGBM.",
      "Invalid pixels are set to zero instead of a huge depth, which later stages can filter easily.",
      "The error function shows why a manipulation task at arm's length is far more accurate than navigation at 6 m.",
    ],
    expect: [
      "The script prints 3.0 and errors of 0.014, 0.125 and 0.5 metres.",
      "Doubling the baseline halves the error at every distance.",
    ],
    fix: [
      [
        "The depth image is full of holes.",
        "Textureless surfaces cannot be matched. Add texture with a projector, or use a depth camera for those scenes.",
      ],
      [
        "All depths are wrong by a constant factor.",
        "The focal length or baseline is wrong, or the disparity was not divided by 16. Check the calibration.",
      ],
    ],
    exercise:
      "Compute the disparity error needed to keep the depth error below 2 cm at 1 m and decide whether the camera can do it.",
    checklist: [
      "Cameras are calibrated and rectified",
      "Disparity is scaled correctly",
      "Depth accuracy is checked for the working distance",
    ],
  }),
  lesson({
    title: "Depth sensing",
    summary: "Turn a depth image into a 3D point cloud, remove invalid points and filter noise.",
    goals: [
      "Deproject a whole depth image with numpy",
      "Limit the valid depth range",
      "Reduce noise with a median filter",
    ],
    concept: [
      "Depth cameras (structured light, time of flight or active stereo) return a depth value for every pixel. With the intrinsics fx, fy, cx and cy, each pixel becomes a 3D point in the camera frame: X = (u − cx)·Z / fx, Y = (v − cy)·Z / fy. Doing this for the whole image with vectorised numpy code takes milliseconds.",
      "Depth data are never perfect. Some pixels have no value (zero), some are noise, and some belong to edges where the depth jumps between the object and the background (flying pixels). Limiting the range, filtering with a small median and removing isolated points give a clean cloud. The valid range depends on the camera, for example 0.3 to 4 m.",
    ],
    steps: [
      "Read a depth image in metres and the camera intrinsics.",
      "Compute X, Y and Z for every pixel in one vectorised expression.",
      "Keep only points between 0.3 and 4.0 m.",
      "Apply a 5×5 median filter before deprojection and compare the noise.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the vectorised maths."],
      ["import cv2", "for the median filter."],
      ["", ""],
      [
        "def to_points(depth, fx, fy, cx, cy, zmin=0.3, zmax=4.0):",
        "point cloud (N x 3, metres) from a depth image in metres.",
      ],
      [
        "    depth = cv2.medianBlur(depth.astype(np.float32), 5)",
        "a 5x5 median removes salt-and-pepper noise without blurring edges much.",
      ],
      ["    h, w = depth.shape", "image size."],
      [
        "    u, v = np.meshgrid(np.arange(w), np.arange(h))",
        "the pixel coordinates of every pixel.",
      ],
      [
        "    ok = (depth > zmin) & (depth < zmax)",
        "valid depth range: zero means 'no measurement'.",
      ],
      ["    z = depth[ok]", "depths of the valid pixels."],
      ["    x = (u[ok] - cx) * z / fx", "camera-frame X from the pinhole model."],
      ["    y = (v[ok] - cy) * z / fy", "camera-frame Y."],
      ["    return np.stack([x, y, z], axis=1)", "one row per 3D point."],
      ["", ""],
      [
        "# cloud = to_points(depth_image, 615.0, 615.0, 320.0, 240.0)",
        "typical intrinsics for a 640 x 480 depth camera.",
      ],
      [
        "# print(cloud.shape, cloud[:, 2].min(), cloud[:, 2].max())",
        "number of points and the nearest and farthest depth.",
      ],
    ),
    walk: [
      "Everything is done for all pixels at once, which is much faster than a Python loop.",
      "The range limit removes both the 'no measurement' zeros and the far, unreliable values.",
      "The median filter is applied to the depth image, before deprojection, so isolated bad pixels never become points.",
    ],
    expect: [
      "The cloud has fewer points than pixels, because invalid pixels are dropped.",
      "The nearest and farthest depths are inside 0.3 to 4.0 m.",
    ],
    fix: [
      [
        "Objects look stretched or flat.",
        "The intrinsics do not match the depth image (for example a different resolution). Use the camera_info of the depth stream.",
      ],
      [
        "Flying points appear at edges.",
        "Add an edge filter that removes points whose depth differs strongly from their neighbours.",
      ],
    ],
    exercise:
      "Add an edge filter that drops pixels whose depth differs from a neighbour by more than 5 cm and count how many points it removes.",
    checklist: [
      "Intrinsics match the depth stream",
      "Range and noise filters are applied",
      "Point cloud density is checked",
    ],
  }),
  lesson({
    title: "LiDAR mapping",
    summary: "Build an occupancy grid from LiDAR scans with a log-odds update along each ray.",
    goals: [
      "Explain the occupancy grid and log-odds representation",
      "Update the grid along each laser ray",
      "Read the map to decide if a cell is free, occupied or unknown",
    ],
    concept: [
      "An occupancy grid divides the floor into small cells and stores how likely each cell is to be occupied. A LiDAR ray tells two things: all the cells it passes through are free, and the cell where it ends is (probably) occupied. Storing the evidence as log-odds lets the map be updated by simple addition and repeated scans build confidence.",
      "Cells start at 0 (unknown). Every ray adds a small negative value to the free cells and a larger positive value to the end cell, and the values are clamped to avoid over-confidence. Reading the grid, a strongly negative value means free, a strongly positive one means occupied, and values near zero mean unknown. For a humanoid the sensor moves with the swaying body, so the pose of the sensor must be known at each scan.",
    ],
    steps: [
      "Create a grid of 5 cm cells with all cells at zero.",
      "For each ray, step along it and add a free value to each visited cell.",
      "Add the occupied value to the cell where the ray ends.",
      "Clamp the values and threshold them to free, occupied and unknown.",
    ],
    example: hash(
      ["import math", "for the ray direction."],
      ["import numpy as np", "numpy for the grid."],
      ["", ""],
      [
        "RES, L_FREE, L_OCC, L_MAX = 0.05, -0.4, 0.85, 5.0",
        "cell size in metres, log-odds for free and occupied evidence and the clamp value.",
      ],
      ["grid = np.zeros((200, 200))", "a 10 x 10 m map, all cells unknown."],
      ["", ""],
      ["def cell(x, y):", "grid index of a world point (the map centre is the origin)."],
      [
        "    return int(round(x / RES)) + 100, int(round(y / RES)) + 100",
        "shift by half the grid size and convert to cells.",
      ],
      ["", ""],
      [
        "def update(pose, ranges, angles, max_range=8.0):",
        "add one scan to the map; pose = (x, y, heading).",
      ],
      ["    px, py, th = pose", "the sensor position and heading."],
      ["    for r, a in zip(ranges, angles):", "one ray at a time."],
      ["        if not math.isfinite(r) or r > max_range:", "no return or out of range."],
      ["            continue", "skip it: no information."],
      ["        for k in range(int(r / RES)):", "walk along the ray in cell-sized steps."],
      [
        "            i, j = cell(px + k * RES * math.cos(th + a), py + k * RES * math.sin(th + a))",
        "the cell at this distance.",
      ],
      [
        "            grid[j, i] = max(-L_MAX, grid[j, i] + L_FREE)",
        "evidence that the cell is free, clamped.",
      ],
      [
        "        i, j = cell(px + r * math.cos(th + a), py + r * math.sin(th + a))",
        "the cell where the ray hit something.",
      ],
      [
        "        grid[j, i] = min(L_MAX, grid[j, i] + L_OCC)",
        "evidence that it is occupied, clamped.",
      ],
    ),
    walk: [
      "Adding log-odds is the whole probability update, which is why occupancy grids are so fast.",
      "The occupied value is larger than the free value in size, because one hit is stronger evidence than a pass-through.",
      "The heading is part of the pose: a small heading error at long range moves the hit by many cells.",
    ],
    expect: [
      "After a few scans of a wall, the cells along the wall are strongly positive and the cells in front of it are negative.",
      "Cells behind the wall stay at zero (unknown), which is correct.",
    ],
    fix: [
      [
        "Walls look thick and smeared.",
        "The pose is inaccurate, so the same wall is hit at different cells. Improve the localisation or filter scans while the robot steps.",
      ],
      [
        "Moving people leave trails.",
        "Dynamic objects are stored as occupied. Decay old evidence or use a faster free-space update.",
      ],
    ],
    exercise:
      "Write a function that converts the grid into a picture: white for free, black for occupied and grey for unknown, and save it as a PNG.",
    checklist: [
      "The sensor pose is known for each scan",
      "Values are clamped",
      "Unknown space is distinguished from free space",
    ],
  }),
  lesson({
    title: "Human detection",
    summary:
      "Detect people in an image, estimate their distance and slow the robot as they approach.",
    goals: [
      "Detect people with a classical HOG detector",
      "Estimate the distance from the depth image",
      "Map the distance to a speed limit",
    ],
    concept: [
      "A robot working near people must find them first. Modern robots use neural network detectors, but a classical HOG plus linear SVM detector, included in OpenCV, is a small and readable starting point that runs on a CPU. It returns rectangles around people and a confidence for each.",
      "Combined with a depth image, the median depth inside the rectangle gives the distance to the person. A speed rule then reduces the robot's speed as people get closer, and stops motion when someone is inside the stop distance. This improves the process, but it does not replace certified safety sensors.",
    ],
    steps: [
      "Create the HOG detector with OpenCV's default people model.",
      "Detect people in the image and keep those above a confidence threshold.",
      "Read the median depth in each rectangle.",
      "Map the nearest distance to a speed limit.",
    ],
    example: hash(
      ["import cv2, numpy as np", "OpenCV for the detector and numpy for the depth statistics."],
      ["", ""],
      ["hog = cv2.HOGDescriptor()", "the histogram-of-oriented-gradients descriptor."],
      [
        "hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())",
        "load the built-in pedestrian classifier.",
      ],
      ["", ""],
      [
        "def people(image, depth_m, min_conf=0.5):",
        "list of (distance in metres, rectangle) for detected people.",
      ],
      [
        "    rects, weights = hog.detectMultiScale(image, winStride=(8, 8))",
        "search the image at several scales; weights are confidences.",
      ],
      ["    found = []", "the result."],
      [
        "    for (x, y, w, h), conf in zip(rects, np.ravel(weights)):",
        "each detection with its confidence.",
      ],
      ["        if conf < min_conf:", "too uncertain."],
      ["            continue", "skip weak detections."],
      ["        patch = depth_m[y:y + h, x:x + w]", "the depth values inside the rectangle."],
      ["        valid = patch[patch > 0.1]", "ignore pixels without depth."],
      ["        if valid.size:", "we need some depth to measure a distance."],
      [
        "            found.append((float(np.median(valid)), (x, y, w, h)))",
        "the median is robust against background pixels.",
      ],
      ["    return found", "detected people with their distances."],
      ["", ""],
      [
        "def speed_limit(distance_m, stop=0.8, slow=2.0):",
        "allowed speed factor (0..1) for the nearest person.",
      ],
      [
        "    return 0.0 if distance_m < stop else min(1.0, (distance_m - stop) / (slow - stop))",
        "stop inside 0.8 m, full speed beyond 2.0 m, a linear ramp in between.",
      ],
    ),
    walk: [
      "The median depth is much less sensitive to the background pixels in the rectangle than the mean.",
      "The speed function is continuous, so the robot slows smoothly instead of switching between two speeds.",
      "This is process-level awareness: certified sensors, not this code, must protect people in the robot's path.",
    ],
    expect: [
      "A person at 3 m gives a speed factor of 1.0, at 1.4 m gives 0.5 and at 0.7 m gives 0.",
      "Rectangles around posters or mannequins may appear; the confidence threshold is used to reduce them.",
    ],
    fix: [
      [
        "Many false detections appear.",
        "Raise the confidence threshold, restrict the search area and consider a neural network detector for cluttered scenes.",
      ],
      [
        "People are missed when seated or turned.",
        "The HOG model is trained for standing pedestrians. Use a more capable model for these cases.",
      ],
    ],
    exercise:
      "Record ten short images with and without a person and measure the detection rate and false alarm rate at three confidence thresholds.",
    checklist: [
      "Detections are confirmed with depth",
      "Speed falls smoothly with distance",
      "Certified sensors remain the safety layer",
    ],
  }),
  lesson({
    title: "Gesture recognition",
    summary:
      "Recognise simple hand gestures from hand landmarks and map them to safe robot actions.",
    goals: [
      "Detect hand landmarks with MediaPipe",
      "Count raised fingers from landmark positions",
      "Map only a small, safe set of gestures to actions and require a hold time",
    ],
    concept: [
      "Gesture recognition lets a person control a humanoid without touching it. A landmark model finds 21 points on the hand in each camera image. Rules on those points recognise gestures: for example, a finger is raised if its tip is above its middle joint in the image. Counting raised fingers gives a small vocabulary such as an open palm (stop) and a closed fist (wait).",
      "A gesture interface is easy to trigger by accident, so it must be conservative. Use only a few clearly different gestures, require that the gesture is held for about half a second, and map them to harmless actions such as pause or greet. Anything that moves the robot needs a second, explicit confirmation.",
    ],
    steps: [
      "Run the hand landmark detector on the camera image.",
      "Count the raised fingers from the tip and joint positions.",
      "Turn the count into a gesture name.",
      "Require the same gesture for 15 consecutive frames before acting.",
    ],
    example: hash(
      ["import mediapipe as mp", "Google's MediaPipe library with a hand landmark model."],
      ["", ""],
      [
        "hands = mp.solutions.hands.Hands(max_num_hands=1, min_detection_confidence=0.6)",
        "track a single hand with a confidence threshold.",
      ],
      [
        "TIPS, JOINTS = [8, 12, 16, 20], [6, 10, 14, 18]",
        "landmark numbers of the four fingertips and of their middle joints.",
      ],
      ["", ""],
      ["def gesture(rgb_image):", "name the gesture in a colour image."],
      ["    result = hands.process(rgb_image)", "run the landmark model."],
      ["    if not result.multi_hand_landmarks:", "no hand in the image."],
      ["        return 'none'", "nothing to recognise."],
      ["    lm = result.multi_hand_landmarks[0].landmark", "the 21 landmarks of the first hand."],
      [
        "    up = sum(lm[t].y < lm[j].y for t, j in zip(TIPS, JOINTS))",
        "a finger is raised when its tip is higher (smaller y) than its middle joint.",
      ],
      [
        "    return {0: 'fist', 4: 'open palm'}.get(up, 'other')",
        "four raised fingers is an open palm, none is a fist.",
      ],
      ["", ""],
      ["def confirmed(history, name, frames=15):", "was the gesture held for the last N frames?"],
      [
        "    return len(history) >= frames and all(g == name for g in history[-frames:])",
        "only act on a steady gesture.",
      ],
    ),
    walk: [
      "The rules use only relative positions of landmarks, so they work for different hand sizes and distances.",
      "The vocabulary is small on purpose: 'other' catches everything ambiguous.",
      "confirmed() adds the hold time, which removes accidental triggers from a hand passing through the image.",
    ],
    expect: [
      "An open hand in front of the camera returns 'open palm' and a closed fist returns 'fist'.",
      "A hand that moves through the image quickly never triggers an action.",
    ],
    fix: [
      [
        "Gestures flicker between two names.",
        "The hand is at an angle where the rule is unreliable. Add hysteresis, or require the gesture to be clearly held.",
      ],
      [
        "The robot reacts to other people's hands.",
        "Limit recognition to the person who is being served, using the detected person's position and distance.",
      ],
    ],
    exercise:
      "Add a 'thumbs up' gesture and a confirmation rule that requires the thumb to be held for one second before the robot replies.",
    checklist: [
      "The gesture vocabulary is small and distinct",
      "A hold time is required",
      "Gestures trigger only harmless actions",
    ],
  }),
  lesson({
    title: "Object manipulation",
    summary:
      "Build a pre-grasp pose above an object along the grasp approach direction and check it before moving.",
    goals: [
      "Explain the pre-grasp, grasp and lift phases",
      "Compute a pre-grasp pose along the approach axis",
      "Check reachability before starting the sequence",
    ],
    concept: [
      "A reliable grasp is a sequence: move to a pre-grasp pose a few centimetres before the object along the approach direction, move straight in, close the hand, and lift straight away. The straight approach avoids knocking the object, and the pre-grasp pose is where a planner can find a collision-free path.",
      "The pre-grasp pose is computed from the grasp pose: the same orientation, moved back along the hand's approach axis (usually its local z axis). Because the axis comes from the rotation matrix, the offset is right for any grasp orientation. If the pre-grasp or the grasp pose is not reachable, the sequence must be rejected before any motion begins.",
    ],
    steps: [
      "Take the grasp pose from the perception (position and orientation).",
      "Move the position back by 10 cm along the hand's z axis to get the pre-grasp.",
      "Check that both poses are reachable and collision-free.",
      "Execute pre-grasp, straight approach, grasp and lift.",
    ],
    example: hash(
      ["import numpy as np", "numpy for the rotation matrices."],
      ["", ""],
      [
        "def pregrasp(T_grasp, distance=0.10):",
        "the pre-grasp pose: the grasp pose moved back along the approach axis.",
      ],
      ["    T = T_grasp.copy()", "keep the orientation of the grasp."],
      [
        "    approach = T_grasp[:3, 2]",
        "the hand's z axis in the world: the direction the fingers point.",
      ],
      [
        "    T[:3, 3] = T_grasp[:3, 3] - distance * approach",
        "move the position back along that axis.",
      ],
      ["    return T", "the pre-grasp pose."],
      ["", ""],
      ["def lift(T_grasp, height=0.10):", "the pose after lifting straight up."],
      ["    T = T_grasp.copy()", "the same orientation."],
      ["    T[2, 3] += height", "raise the hand vertically in the world."],
      ["    return T", "the lift pose."],
      ["", ""],
      [
        "def sequence(T_grasp, reachable):",
        "the ordered poses, or None if the object cannot be grasped.",
      ],
      ["    poses = [pregrasp(T_grasp), T_grasp, lift(T_grasp)]", "pre-grasp, grasp, lift."],
      [
        "    return poses if all(reachable(p) for p in poses) else None",
        "reject the whole sequence if any pose is not reachable.",
      ],
    ),
    walk: [
      "The approach axis comes from the rotation matrix, so the same code works for top-down and side grasps.",
      "The whole sequence is validated before the first motion, which avoids a robot stopping halfway with an object in the hand.",
      "The lift is vertical in the world, not along the hand axis, so the object moves away from a table surface.",
    ],
    expect: [
      "For a top-down grasp the pre-grasp is 10 cm above the object.",
      "A grasp whose pre-grasp is outside the reach returns None and nothing moves.",
    ],
    fix: [
      [
        "The hand collides with the object on approach.",
        "The approach axis is wrong. Verify which hand axis points along the fingers and correct the axis index.",
      ],
      [
        "The object is knocked over during the lift.",
        "The lift height or speed is too high. Lift slowly for the first few centimetres.",
      ],
    ],
    exercise:
      "Add a retreat pose after the lift that moves the hand 20 cm back toward the body and validate the whole four-pose sequence.",
    checklist: [
      "Pre-grasp is along the approach axis",
      "The whole sequence is validated first",
      "The lift is slow at the start",
    ],
  }),
  lesson({
    title: "Scene understanding",
    summary:
      "Keep a memory of detected objects with class, pose and confidence and answer simple questions about the scene.",
    goals: [
      "Store objects with confidence and a last-seen time",
      "Update and age the memory as detections arrive",
      "Answer queries such as 'nearest cup'",
    ],
    concept: [
      "Detections are momentary: an object is visible in one frame and hidden in the next. A scene memory turns them into a stable description: each object has a class, a position, a confidence and the time it was last seen. New detections are matched with existing objects or added, and objects not seen for a while lose confidence and are eventually removed.",
      "With such a memory the robot can answer questions such as 'where is the nearest cup?' without looking at it right now. The memory must be honest about uncertainty: a cup last seen ten seconds ago at the table may be gone. Returning the confidence and the age with every answer lets the caller decide whether to look again first.",
    ],
    steps: [
      "Define an object record with class, position, confidence and last seen time.",
      "Update: match new detections to stored objects of the same class within 20 cm.",
      "Age: reduce confidence with time and remove objects below a threshold.",
      "Query: return the nearest object of a class with its confidence.",
    ],
    example: hash(
      ["import math", "for distances."],
      ["", ""],
      ["class Scene:", "a memory of the objects the robot has seen."],
      [
        "    def __init__(self, gate=0.20, half_life=20.0):",
        "matching distance in metres and the time in seconds after which confidence halves.",
      ],
      [
        "        self.objects, self.gate, self.half_life = [], gate, half_life",
        "the list of remembered objects and the settings.",
      ],
      ["", ""],
      [
        "    def see(self, cls, pos, conf, t):",
        "a detection of class cls at position pos (x, y, z) with confidence conf at time t.",
      ],
      ["        for o in self.objects:", "look for an object we already know."],
      [
        "            if o['cls'] == cls and math.dist(o['pos'], pos) < self.gate:",
        "same class and close enough: it is the same object.",
      ],
      [
        "                o.update(pos=pos, conf=max(o['conf'], conf), t=t)",
        "refresh its position, confidence and time.",
      ],
      ["                return", "done."],
      [
        "        self.objects.append({'cls': cls, 'pos': pos, 'conf': conf, 't': t})",
        "a new object.",
      ],
      ["", ""],
      [
        "    def age(self, now, min_conf=0.1):",
        "reduce confidence over time and forget stale objects.",
      ],
      ["        for o in self.objects:", "every remembered object."],
      [
        "            o['conf'] *= 0.5 ** ((now - o['t']) / self.half_life)",
        "confidence halves every half_life seconds since the last sighting.",
      ],
      ["            o['t'] = now", "aged up to now."],
      [
        "        self.objects = [o for o in self.objects if o['conf'] >= min_conf]",
        "drop objects that are probably gone.",
      ],
      ["", ""],
      [
        "    def nearest(self, cls, here):",
        "the nearest remembered object of a class, with its confidence.",
      ],
      [
        "        found = [o for o in self.objects if o['cls'] == cls]",
        "candidates of the requested class.",
      ],
      [
        "        return min(found, key=lambda o: math.dist(o['pos'], here), default=None)",
        "the closest one, or None if there is none.",
      ],
    ),
    walk: [
      "Matching by class and distance keeps one entry per real object instead of one per frame.",
      "The half-life makes uncertainty visible: an old sighting has a low confidence and will be re-checked.",
      "nearest() returns the whole record, so the caller sees the age and confidence, not only the position.",
    ],
    expect: [
      "Seeing the same cup ten times at nearly the same place gives one object in memory.",
      "After 60 seconds without a sighting its confidence falls to one eighth and it is later removed.",
    ],
    fix: [
      [
        "The same object appears twice.",
        "The gate distance is too small for the position noise. Increase it or track the object over time.",
      ],
      [
        "The robot reaches for an object that is not there.",
        "Confidence and age were ignored. Look again before acting on old sightings.",
      ],
    ],
    exercise:
      "Add a 'seen from' viewpoint to each object and prefer the sighting that has the best viewpoint when updating the position.",
    checklist: [
      "Objects have confidence and age",
      "Old objects fade and are removed",
      "Queries return confidence with the answer",
    ],
  }),
  lesson({
    title: "Voice commands",
    summary:
      "Turn recognised speech into a small set of safe commands with confirmation for risky ones.",
    goals: [
      "Explain the pipeline from microphone to command",
      "Match text to a fixed list of intents",
      "Require confirmation for commands that move the robot",
    ],
    concept: [
      "A voice interface is a chain: microphone, noise reduction, speech recognition (speech to text), intent matching and the action. Recognition runs offline with a small model for privacy and reliability, or in the cloud for accuracy. The text it returns is never trusted directly; it is matched against a closed list of allowed commands.",
      "A closed list is a safety feature. Anything that does not match is ignored, so a misheard word cannot start an unknown action. Commands that make the robot move need a confirmation ('walk to the kitchen, confirm?'), and a stop word such as 'stop' must work immediately in any state. The robot should always answer what it understood, so the user can correct it.",
    ],
    steps: [
      "Write the list of intents with the phrases that trigger them.",
      "Normalise the recognised text (lower case, no punctuation).",
      "Match it to an intent, and ask for confirmation if the intent moves the robot.",
      "Make 'stop' work at once in every state.",
    ],
    example: hash(
      ["import re", "for cleaning the text."],
      ["", ""],
      [
        "INTENTS = {'stop': ['stop', 'halt'], 'greet': ['hello', 'hi robot'], 'walk_kitchen': ['go to the kitchen', 'walk to the kitchen']}",
        "the closed list of commands and the phrases for each.",
      ],
      [
        "MOVING = {'walk_kitchen'}",
        "commands that move the robot and therefore need confirmation.",
      ],
      ["", ""],
      ["def understand(text):", "the intent name for a recognised sentence, or None."],
      [
        "    text = re.sub(r'[^a-z ]', '', text.lower()).strip()",
        "lower case and remove punctuation.",
      ],
      ["    for name, phrases in INTENTS.items():", "check every intent."],
      ["        if any(p in text for p in phrases):", "does the text contain one of its phrases?"],
      ["            return name", "found."],
      ["    return None", "unknown: ignore it."],
      ["", ""],
      [
        "def act(text, pending):",
        "handle one sentence; pending is a command waiting for confirmation.",
      ],
      ["    intent = understand(text)", "what was said."],
      ["    if intent == 'stop':", "the stop word beats everything else."],
      ["        return 'stopped', None", "act immediately and cancel any pending command."],
      [
        "    if pending and 'confirm' in text.lower():",
        "the user confirmed the command that was asked about.",
      ],
      ["        return f'executing {pending}', None", "now it may run."],
      ["    if intent in MOVING:", "a command that moves the robot."],
      ["        return f'confirm {intent}?', intent", "ask first and remember it."],
      [
        "    return (f'ok {intent}' if intent else 'ignored'), None",
        "harmless commands run directly; unknown text is ignored.",
      ],
    ),
    walk: [
      "The closed list means that no recognised text can start something that was never intended.",
      "Stopping is handled before all other logic, so it works in every state.",
      "Confirmation for moving commands prevents a misheard sentence from sending the robot across the room.",
    ],
    expect: [
      "'Go to the kitchen' returns a confirmation question and 'confirm' then executes it.",
      "'Dance like a robot' returns 'ignored'.",
    ],
    fix: [
      [
        "Commands are often misrecognised.",
        "Use a wake word, a directional microphone and a speech model tuned for your vocabulary.",
      ],
      [
        "The robot reacts to TV or other people.",
        "Only accept commands after a wake word from the person in front of the robot.",
      ],
    ],
    exercise:
      "Add a 10-second timeout on the pending confirmation and test that an old 'confirm' does not start a command.",
    checklist: [
      "Only a closed list of intents is accepted",
      "Moving commands require confirmation",
      "Stop always works",
    ],
  }),
  lesson({
    title: "Sensor fusion",
    summary:
      "Combine gyroscope and accelerometer readings with a complementary filter to estimate body tilt.",
    goals: [
      "Explain the strengths and weaknesses of a gyroscope and an accelerometer",
      "Implement a complementary filter",
      "Choose the filter constant from the time constant",
    ],
    concept: [
      "A gyroscope measures rotation rate. Integrating it gives a smooth angle, but small errors add up and the angle drifts. An accelerometer measures the direction of gravity, which gives an absolute tilt but is disturbed by every acceleration of the robot, so it is noisy in motion. Each sensor is good where the other is bad.",
      "A complementary filter trusts the gyroscope for short times and the accelerometer for long times: angle = α·(angle + gyro·dt) + (1 − α)·accel_angle. With α = 0.98 at 100 Hz the crossover time constant is τ = α·dt / (1 − α) ≈ 0.49 s. More advanced fusion (Kalman or Madgwick filters) follows the same idea with better weighting.",
    ],
    steps: [
      "Compute the tilt from the accelerometer with atan2.",
      "Integrate the gyroscope rate over one time step.",
      "Blend them with the filter constant.",
      "Test with a constant gyro bias and see how the accelerometer holds the estimate.",
    ],
    example: hash(
      ["import math", "for atan2."],
      ["", ""],
      ["def accel_pitch(ax, az):", "pitch angle (radians) from the gravity direction."],
      ["    return math.atan2(ax, az)", "angle of gravity in the x-z plane."],
      ["", ""],
      [
        "def fuse(angle, gyro, ax, az, dt=0.01, alpha=0.98):",
        "one filter step: previous angle, gyro rate (rad/s), accelerometer x and z (m/s^2).",
      ],
      [
        "    return alpha * (angle + gyro * dt) + (1.0 - alpha) * accel_pitch(ax, az)",
        "mostly the integrated gyro, slowly pulled toward the accelerometer.",
      ],
      ["", ""],
      ["angle = 0.0", "start level."],
      ["for _ in range(500):", "five seconds at 100 Hz."],
      [
        "    angle = fuse(angle, gyro=0.02, ax=0.0, az=9.81)",
        "the gyro has a bias of 0.02 rad/s while the robot really is level.",
      ],
      [
        "print(round(angle, 4))",
        "prints about 0.0098 rad: the drift is limited to a small constant instead of growing.",
      ],
    ),
    walk: [
      "Without the accelerometer term the bias would add up to 0.1 rad (5.7 degrees) after five seconds and keep growing.",
      "The filter holds the error at about bias × τ = 0.02 × 0.49 rad, a small constant offset.",
      "The constant alpha is a trade-off: closer to 1 trusts the gyro more and reacts smoothly, but corrects drift more slowly.",
    ],
    expect: [
      "The script prints about 0.0098 radians and the value stays there if you run longer.",
      "With alpha = 1.0 (gyro only) the angle reaches 0.1 after five seconds.",
    ],
    fix: [
      [
        "The tilt estimate wobbles when the robot steps.",
        "The accelerometer sees step accelerations. Lower its weight during foot impacts or use a Kalman filter with a model.",
      ],
      [
        "The estimate settles at a wrong angle.",
        "The IMU is mounted with an offset. Calibrate the mounting angle when the robot stands level.",
      ],
    ],
    exercise:
      "Simulate a 2 Hz oscillation of the body with accelerometer noise and compare the error for alpha values of 0.9, 0.98 and 0.995.",
    checklist: [
      "Gyro bias is understood",
      "The time constant is chosen on purpose",
      "IMU mounting is calibrated",
    ],
  }),
  lesson({
    title: "SLAM",
    summary:
      "Configure SLAM Toolbox for a walking robot and understand how odometry drift is corrected.",
    goals: [
      "Explain simultaneous localisation and mapping",
      "Set the main SLAM Toolbox parameters",
      "Recognise the special problems of a walking robot",
    ],
    concept: [
      "SLAM builds a map of an unknown space while working out where the robot is inside it. Odometry (from joint encoders and the IMU) drifts, so the robot's estimate slowly departs from reality. SLAM matches each new LiDAR scan with the map and corrects the pose; when the robot returns to a known place, loop closure removes the accumulated error for the whole trajectory.",
      "A walking humanoid makes this harder than a wheeled robot: the sensor sways and tilts with every step, odometry from legs is noisy and the scan is not always horizontal. Good practice is to place the LiDAR on a stable part of the body, filter scans while the body tilts a lot and give the SLAM node a generous minimum travel distance so that it only adds scans after real movement.",
    ],
    steps: [
      "Publish odometry and the TF tree odom → base_footprint.",
      "Start SLAM Toolbox in mapping mode with the parameter file.",
      "Walk the robot around a loop in the room and watch the map in RViz.",
      "Save the map and check that the loop closed without doubled walls.",
    ],
    example: hash(
      ["slam_toolbox:", "the node's parameter section."],
      ["  ros__parameters:", "ROS 2 parameters follow."],
      ["    odom_frame: odom", "the frame of the odometry."],
      ["    map_frame: map", "the frame of the map that SLAM publishes."],
      ["    base_frame: base_footprint", "the robot frame on the floor below the body."],
      ["    scan_topic: /scan", "where the LiDAR scans arrive."],
      ["    mode: mapping", "build a new map (localisation mode uses an existing one)."],
      ["    resolution: 0.05", "5 cm map cells."],
      ["    max_laser_range: 12.0", "ignore returns beyond 12 m, where they are noisy."],
      ["    minimum_travel_distance: 0.3", "only add a scan after the robot moved 30 cm..."],
      ["    minimum_travel_heading: 0.3", "...or turned 0.3 rad, so body sway does not add scans."],
      ["    do_loop_closing: true", "correct accumulated drift when a known place is seen again."],
    ),
    walk: [
      "The two minimum travel values are the most important settings for a swaying humanoid, since they reject sway.",
      "base_footprint is on the ground below the body, which is stable, unlike the swaying sensor frame.",
      "Loop closing is what makes the map consistent after walking a long loop.",
    ],
    expect: [
      "Walking a closed loop produces a map with a single set of walls and a visible jump when the loop closes.",
      "Setting the travel distances to zero makes the map blurred, because sway adds many inconsistent scans.",
    ],
    fix: [
      [
        "The map drifts and walls appear twice.",
        "Odometry is poor or the scans are taken while the body tilts. Filter tilted scans and check the leg odometry.",
      ],
      [
        "SLAM is slow on the robot's computer.",
        "Use a larger resolution or a smaller range, and reduce the scan rate.",
      ],
    ],
    exercise:
      "Record a bag of a walk around a room and replay it with three values of minimum_travel_distance, comparing the maps.",
    checklist: [
      "The TF tree is correct and stable",
      "Travel thresholds reject body sway",
      "Loop closure is checked after a loop",
    ],
  }),
];
