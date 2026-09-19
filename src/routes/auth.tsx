import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { safeInternalRedirect } from "@/lib/safe-redirect";

const title = "Sign in to RobotCodeHub";
const description =
  "Sign in or create a RobotCodeHub account to save your practice progress and open your purchased course.";

const searchSchema = z.object({
  redirect: z.string().optional().transform(safeInternalRedirect),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
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
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const destination = redirect ?? "/account";

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) window.location.replace(destination);
    });
    return () => {
      active = false;
    };
  }, [destination]);

  async function google() {
    setError(null);
    try {
      const callback = new URL("/auth", window.location.origin);
      callback.searchParams.set("redirect", destination);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: callback.toString(),
      });
      if (result.error) {
        setError(result.error.message);
        return;
      }
      if (result.redirected) return;
      window.location.replace(destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetError) throw resetError;
        setNotice("Check your email for a link to choose a new password.");
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (signUpError) throw signUpError;
        if (data.session) navigate({ to: destination });
        else setNotice("Account created. Check your email and confirm the address, then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate({ to: destination });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
      <div className="w-full max-w-md border border-border bg-card p-7">
        <Link to="/" className="font-heading text-xl">
          RobotCodeHub
        </Link>
        <h1 className="mt-5 font-heading text-4xl leading-tight">
          {mode === "signup"
            ? "Create your account"
            : mode === "forgot"
              ? "Reset your password"
              : "Sign in"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {mode === "forgot"
            ? "We will email you a link to choose a new password."
            : "An account saves your practice progress and keeps a purchased course connected to you permanently."}
        </p>

        {mode !== "forgot" && (
          <>
            <Button className="mt-6 w-full" variant="outline" onClick={google} disabled={busy}>
              Continue with Google
            </Button>
            <div className="my-5 flex items-center gap-3 text-xs uppercase text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5"
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5"
              />
              {mode === "signup" && (
                <p className="mt-1.5 text-xs text-muted-foreground">At least 8 characters.</p>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <LoaderCircle className="animate-spin" />}
            {mode === "signup"
              ? "Create account"
              : mode === "forgot"
                ? "Send reset link"
                : "Sign in"}
          </Button>
        </form>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" aria-live="polite" className="mt-4 text-sm text-primary">
            {notice}
          </p>
        )}

        <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
          {mode !== "signup" && (
            <p>
              No account yet?{" "}
              <button
                type="button"
                className="text-foreground underline"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setNotice(null);
                }}
              >
                Create one
              </button>
            </p>
          )}
          {mode !== "signin" && (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="text-foreground underline"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setNotice(null);
                }}
              >
                Sign in
              </button>
            </p>
          )}
          {mode === "signin" && (
            <p>
              <button
                type="button"
                className="text-foreground underline"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                  setNotice(null);
                }}
              >
                Forgot your password?
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
