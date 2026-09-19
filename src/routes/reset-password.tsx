import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const title = "Choose a new password";
const description = "Set a new password for your RobotCodeHub account.";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `${title} | RobotCodeHub` },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    window.setTimeout(() => navigate({ to: "/account" }), 1200);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-md border border-border bg-card p-7">
        <Link to="/" className="font-heading text-xl">
          RobotCodeHub
        </Link>
        <h1 className="mt-5 font-heading text-4xl leading-tight">{title}</h1>
        {done ? (
          <p role="status" aria-live="polite" className="mt-4 text-sm text-primary">
            Password updated. Taking you to your account…
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Open this page from the link in your reset email, then choose a new password.
            </p>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <LoaderCircle className="animate-spin" />}Save new password
            </Button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
