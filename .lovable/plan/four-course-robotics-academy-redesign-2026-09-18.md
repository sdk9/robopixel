# Four-course robotics academy redesign

## Goal
Rebuild the site as a calm, credible course catalogue with four sequential courses:

1. **Ubuntu Linux for Robotics — Free**
2. **C++ Beginner through Advanced — Free**
3. **ROS 2 Lyrical Luth — Free**
4. **Industrial Robots — $30 one-time**

## Visual direction
- Match the selected **Workshop catalogue grid** composition.
- Use the locked cream and dusty-blue palette: `#FCFAF4`, `#EEE9DD`, `#9AAEB8`, and `#2F3436` through semantic color tokens.
- Use **Instrument Serif** for headings and **Work Sans** for body copy.
- Replace the dark terminal, glass effects, gradients, fake statistics, and futuristic copy with generous white/cream space, thin rules, modest corners, and restrained interaction.
- Replace glossy robot renders with a cohesive set of documentary-style workshop photographs showing seven visibly different robot types in practical surroundings.
- Carry the same visual system through the home page, all course pages, signup forms, and error states, with careful mobile layouts.

## Course catalogue and pages
- Make every catalogue item a real route with clear pricing and a direct action.
- Keep the three C++ levels as detailed pages, change each to **Free**, and link them correctly from the catalogue.
- Add a complete **Ubuntu Linux for Robotics** page covering installation, terminal use, files and permissions, packages, processes, networking, developer tools, and a ROS-ready environment.
- Add a complete **ROS 2 Lyrical Luth** page based on the official tutorial order: environment, CLI tools, nodes, topics, services, parameters, actions, launch, rosbag, workspaces, packages, publishers/subscribers, services/clients, interfaces, diagnostics, and C++ plugins.
- Add a complete **Industrial Robots** page with the seven distinct models, safety, kinematics, planning, simulation, controllers, and C++/ROS 2 integration; label access as **$30 once**, never a subscription.
- Give every page lesson outlines, practical project examples, outcomes, prerequisites, duration, accurate metadata, and a clear next step.

## Documentation accuracy
- Standardize ROS naming as **ROS 2** and the distribution as **Lyrical Luth**.
- Teach the Tier 1 pairing **Ubuntu 26.04 + ROS 2 Lyrical Luth**, installed through the official apt packages; clearly mark Ubuntu 24.04 as source-build/Tier 3 rather than promising unsupported binary packages.
- Base technical steps on current official Ubuntu, ROS 2 Lyrical, CMake, and C++ reference material, and show source links plus a “verified against” date on course pages.
- Check commands, package names, links, snippets, lesson order, and mobile reading flow before completion. Avoid claims that cannot be supported by documentation.

## Enrollment and payment
- Extend course signup validation and database rules to accept Ubuntu, ROS 2, and Industrial Robots while preserving secure anonymous enrollment.
- Use the existing signup flow for the three free course areas, with wording that makes the zero cost explicit.
- Add a **Paddle** one-time checkout for the $30 Industrial Robots course; Paddle is the recommended fit for this digital course and handles merchant-of-record tax/compliance duties.
- Keep pricing in one shared source so the homepage and course pages cannot disagree.
- Update success, error, and confirmation copy for free enrollment versus paid access.

## Validation
- Apply the database migration with grants and row-level rules intact.
- Test all four catalogue links, all C++ level links, free signup submissions, the paid checkout entry point, and form error states.
- Verify desktop and mobile rendering, text fit, image variety, keyboard focus, reduced-motion behavior, route metadata, console output, and broken network requests.

## Content note
The current invented instructor identity, placement percentage, graduate count, cohort number, and “live rigs” claims will be removed rather than presented as facts.
