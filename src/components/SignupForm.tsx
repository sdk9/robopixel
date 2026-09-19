import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { submitSignup, type SignupTrack } from "@/lib/signups.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const trackLabels: Record<SignupTrack, string> = {
  beginner: "C++ Beginner",
  intermediate: "C++ Intermediate",
  advanced: "C++ Advanced",
  ubuntu: "Ubuntu Linux for Robotics",
  ros2: "ROS 2 Lyrical Luth",
};

export function SignupForm({ track }: { track: SignupTrack }) {
  const send = useServerFn(submitSignup);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setStatus("sending");
    try {
      await send({
        data: {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          track,
          goal: String(form.get("goal") ?? ""),
        },
      });
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-primary/30 bg-card p-6">
        <p className="text-xs font-medium uppercase text-primary">Interest saved</p>
        <h3 className="mt-2 font-heading text-2xl">
          Your interest in {trackLabels[track]} is recorded.
        </h3>
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          The course is available now from the course outline above. No email subscription was
          created.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-border bg-card p-5 md:p-6">
      <p className="text-xs font-medium uppercase text-primary">
        Learning interest · {trackLabels[track]}
      </p>
      <h3 className="mt-2 font-heading text-3xl">Start learning</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Optionally tell us what you are learning so we can improve the course. This does not
        subscribe you to marketing email.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase text-muted-foreground">Name</span>
          <Input
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Ada Lovelace"
            className="mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase text-muted-foreground">Email</span>
          <Input
            name="email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-medium uppercase text-muted-foreground">
          What do you want to build? (optional)
        </span>
        <Textarea
          name="goal"
          rows={3}
          maxLength={1000}
          placeholder="I want to program a 6-axis arm for a packaging line."
          className="mt-1 resize-y"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={status === "sending"} className="mt-4 w-full" size="lg">
        {status === "sending" ? "Saving…" : "Save my learning interest"}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Free · no payment details · see our{" "}
        <a href="/privacy" className="underline">
          Privacy Notice
        </a>
      </p>
    </form>
  );
}
