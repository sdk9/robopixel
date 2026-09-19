# Complete the robotics curriculum and paid access

## Course content
- Replace the seven Industrial Robots placeholders with complete, model-specific modules built around real ROS 2 Lyrical Luth and modern C++ examples.
- Each module will include safety boundaries, setup, ROS interfaces, compilable C++ package files, build/run commands, observable checks, troubleshooting, and a practical assignment.
- Keep physical motion simulation-first and clearly separate generic ROS examples from manufacturer-specific hardware procedures.
- Verify ROS 2 commands and APIs against official Lyrical documentation and link the primary sources from each lesson.

## ROS 2 labs and workspace
- Add dedicated, shareable lab pages for installation, workspace creation, ament_cmake C++ packages, publisher/subscriber, services/actions, launch and parameters, tf2/URDF, ros2_control, and diagnostics.
- Give each lab a repeatable setup guide, file tree, copyable source files, terminal commands, expected output, validation checklist, and recovery notes.
- Add a central lab workspace page so learners can move through labs in order and see the exact `~/robot_ws` structure they are building.
- Link the workspace and relevant labs from both Ubuntu Linux and ROS 2 course pages.

## Pricing and navigation
- Use the shared catalogue as the single source of truth: Ubuntu Linux, every C++ level, and ROS 2 are **Free**; Industrial Robots is **$30 one-time**.
- Replace any remaining placeholder price text on course pages.
- Make the home-page price badges clear links to the corresponding course pages, while keeping each full course card accessible.

## Checkout and lesson access
- Keep sign-in required before checkout and preserve Paddle metadata linking the purchase to the signed-in account.
- Harden the checkout return flow so it waits for the verified Paddle webhook, then offers a direct link into the first unlocked robot lesson.
- Confirm completed transactions grant permanent access and approved refunds revoke it in the correct test/live environment.
- Validate the signed-out gate, checkout launch, success state, entitlement lookup, lesson unlock, and refund path.
- Because Paddle’s secure card form is cross-domain, automated testing can verify checkout opening and all app-side behavior; completing the test-card step may require one user interaction before the final unlock can be observed.

## Release checks
- Check all new pages and links on desktop and mobile, keyboard focus, reduced motion, missing-page behavior, and browser errors.
- Run the project checks, review security scan results, configure the live webhook when the payment account permits it, and publish the current version.
- Use the legal seller name you provide on Terms, Privacy, and Refund pages before publishing; otherwise keep “RobotHub” explicitly marked as provisional.
