import { createServerFn } from "@tanstack/react-start";

export type SignupTrack = "beginner" | "intermediate" | "advanced" | "ubuntu" | "ros2";

export type SignupInput = {
  name: string;
  email: string;
  track: SignupTrack;
  goal?: string;
};

const TRACKS: SignupTrack[] = ["beginner", "intermediate", "advanced", "ubuntu", "ros2"];

function validate(input: SignupInput): SignupInput {
  const name = String(input?.name ?? "").trim();
  const email = String(input?.email ?? "").trim();
  const goal = String(input?.goal ?? "").trim();
  const track = input?.track;

  if (name.length < 2 || name.length > 100) throw new Error("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 255)
    throw new Error("Please enter a valid email address.");
  if (!TRACKS.includes(track)) throw new Error("Please choose a track.");
  if (goal.length > 1000) throw new Error("Please keep your note under 1000 characters.");

  return { name, email, track, ...(goal ? { goal } : {}) };
}

export const submitSignup = createServerFn({ method: "POST" })
  .validator(validate)
  .handler(async ({ data }) => {
    const { enforceRateLimit } = await import("@/lib/rate-limit.server");
    await enforceRateLimit({ action: "course-signup", maxRequests: 5, windowSeconds: 3600 });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("course_signups").insert({
      name: data.name,
      email: data.email,
      track: data.track,
      goal: data.goal ?? null,
    });

    if (error) {
      console.error("signup insert failed", error);
      throw new Error("We couldn't save your sign-up. Please try again.");
    }

    return { ok: true as const };
  });
