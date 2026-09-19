import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, LoaderCircle, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment, initializePaddle } from "@/lib/paddle";
import { courseCatalog } from "@/lib/course-catalog";
import { getIndustrialRobotsAccess, prepareIndustrialCheckout } from "@/lib/payments.functions";

type Status = "loading" | "signed-out" | "owned" | "idle" | "preparing";

export function IndustrialCheckout() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const checkAccess = useServerFn(getIndustrialRobotsAccess);
  const prepareCheckout = useServerFn(prepareIndustrialCheckout);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setStatus("signed-out");
        return;
      }
      try {
        const access = await checkAccess();
        if (active) setStatus(access.active ? "owned" : "idle");
      } catch {
        if (active) setStatus("idle");
      }
    })();
    return () => {
      active = false;
    };
  }, [checkAccess]);

  async function purchase() {
    setError(null);
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setStatus("signed-out");
      return;
    }
    try {
      setStatus("preparing");
      await initializePaddle();
      const checkout = await prepareCheckout();
      if (checkout.environment !== getPaddleEnvironment()) {
        throw new Error("Checkout environment configuration does not match.");
      }
      window.Paddle.Checkout.open({
        items: [{ priceId: checkout.priceId, quantity: 1 }],
        customer: data.user.email ? { email: data.user.email } : undefined,
        customData: { purchaseIntentId: checkout.intentId },
        settings: {
          displayMode: "overlay",
          successUrl: `${window.location.origin}/checkout/success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
      setStatus("idle");
    } catch (cause) {
      setStatus("idle");
      setError(cause instanceof Error ? cause.message : "Checkout could not be opened.");
    }
  }

  return (
    <div className="border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Complete course access</p>
          <p className="font-heading text-3xl">
            {status === "owned" ? "Yours" : courseCatalog.industrial.price}
          </p>
        </div>
        <LockKeyhole className="size-5 text-primary" aria-hidden="true" />
      </div>
      <ul className="mt-5 space-y-2 text-sm">
        {[
          "All seven robot models",
          "Permanent account access",
          "C++ and ROS 2 integration labs",
        ].map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 text-primary" />
            {item}
          </li>
        ))}
      </ul>

      {status === "loading" && (
        <p role="status" aria-live="polite" className="mt-5 text-sm text-muted-foreground">
          Checking your access…
        </p>
      )}

      {status === "owned" && (
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            You already own this course — every lesson below is unlocked.
          </p>
          <Link
            to="/account"
            className="mt-3 inline-flex w-full items-center justify-center border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/70"
          >
            View my account
          </Link>
        </div>
      )}

      {status === "signed-out" && (
        <div className="mt-5 border-t border-border pt-5">
          <p className="mb-3 text-sm text-muted-foreground">
            Sign in first so this purchase stays connected to your account.
          </p>
          <Link
            to="/auth"
            search={{ redirect: courseCatalog.industrial.href }}
            className="inline-flex w-full items-center justify-center bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign in to buy
          </Link>
        </div>
      )}

      {(status === "idle" || status === "preparing") && (
        <Button
          className="mt-5 w-full"
          size="lg"
          onClick={purchase}
          disabled={status === "preparing"}
        >
          {status === "preparing" && <LoaderCircle className="animate-spin" />}
          {status === "preparing"
            ? "Preparing checkout"
            : `Buy course — ${courseCatalog.industrial.price}`}
        </Button>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Secure checkout by Paddle. By purchasing, you agree to the{" "}
        <Link to="/terms" className="underline">
          Terms
        </Link>
        ,{" "}
        <Link to="/refunds" className="underline">
          30-day refund policy
        </Link>
        , and{" "}
        <Link to="/privacy" className="underline">
          Privacy Notice
        </Link>
        .
      </p>
    </div>
  );
}
