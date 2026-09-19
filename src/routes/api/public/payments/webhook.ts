import { createHmac, timingSafeEqual } from "crypto";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import type { Json } from "@/integrations/supabase/types";
import { containsOnlyExpectedCoursePrice } from "@/lib/payment-validation";

const webhookSchema = z.object({
  event_id: z.string().min(1),
  event_type: z.string().min(1),
  data: z.record(z.unknown()),
});

function verifySignature(rawBody: string, signatureHeader: string, secret: string) {
  const parts = signatureHeader.split(";").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "ts")?.[1];
  const signatures = parts.filter(([key]) => key === "h1").map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}:${rawBody}`).digest("hex");
  const expectedBytes = Buffer.from(expected, "hex");
  return signatures.some((signature) => {
    if (!signature || !/^[0-9a-f]+$/i.test(signature)) return false;
    const actualBytes = Buffer.from(signature, "hex");
    return (
      actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes)
    );
  });
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestedEnvironment = new URL(request.url).searchParams.get("env");
        if (requestedEnvironment !== "sandbox" && requestedEnvironment !== "live") {
          return new Response("Missing or invalid payment environment", { status: 400 });
        }
        const environment = requestedEnvironment;
        const secret =
          environment === "live"
            ? process.env["PAYMENTS_LIVE_WEBHOOK_SECRET"]
            : process.env["PAYMENTS_SANDBOX_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook is not configured", { status: 503 });

        const rawBody = await request.text();
        const signature = request.headers.get("Paddle-Signature") ?? "";
        if (!verifySignature(rawBody, signature, secret))
          return new Response("Invalid signature", { status: 401 });

        let payload: unknown;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }
        const parsed = webhookSchema.safeParse(payload);
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });
        const event = parsed.data;
        const transactionId =
          typeof event.data["transaction_id"] === "string"
            ? event.data["transaction_id"]
            : typeof event.data["id"] === "string"
              ? event.data["id"]
              : null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: claimed, error: claimError } = await supabaseAdmin.rpc(
          "claim_payment_event",
          {
            p_event_id: event.event_id,
            p_event_type: event.event_type,
            p_environment: environment,
            p_transaction_id: transactionId,
            p_payload: event.data as Json,
          },
        );
        if (claimError) {
          console.error("payment event could not be claimed", claimError);
          return new Response("Payment event storage failed", { status: 500 });
        }
        if (!claimed) return Response.json({ ok: true, duplicate: true });

        try {
          let note = "ignored event";

          if (event.event_type === "transaction.completed") {
            const transaction = z
              .object({
                id: z.string().min(1),
                customer_id: z.string().nullable().optional(),
                custom_data: z
                  .object({ purchaseIntentId: z.string().uuid().optional() })
                  .passthrough()
                  .nullable()
                  .optional(),
                items: z
                  .array(
                    z.object({
                      quantity: z.number().int().positive(),
                      price: z.object({ id: z.string().min(1) }),
                    }),
                  )
                  .min(1),
              })
              .parse(event.data);

            const intentId = transaction.custom_data?.purchaseIntentId;
            if (!intentId) {
              note = "ignored transaction without a RobotCodeHub purchase intent";
            } else {
              const { getIndustrialPriceId } = await import("@/lib/paddle.server");
              const expectedPriceId = await getIndustrialPriceId(environment);
              if (!containsOnlyExpectedCoursePrice(transaction.items, expectedPriceId)) {
                note = "rejected transaction with an unexpected price or quantity";
              } else {
                const { error } = await supabaseAdmin.rpc("complete_course_purchase", {
                  p_intent_id: intentId,
                  p_transaction_id: transaction.id,
                  p_customer_id: transaction.customer_id ?? null,
                  p_environment: environment,
                });
                if (error) throw error;
                note = "verified purchase; access granted";
              }
            }
          }

          if (
            event.event_type === "adjustment.created" ||
            event.event_type === "adjustment.updated"
          ) {
            const adjustment = z
              .object({
                action: z.enum([
                  "refund",
                  "credit",
                  "chargeback",
                  "chargeback_reverse",
                  "chargeback_warning",
                  "chargeback_warning_reverse",
                  "credit_reverse",
                ]),
                status: z.enum(["pending_approval", "approved", "rejected", "reversed"]),
                type: z.enum(["full", "partial"]),
                transaction_id: z.string().min(1),
              })
              .parse(event.data);

            const fullRefund =
              adjustment.action === "refund" &&
              adjustment.status === "approved" &&
              adjustment.type === "full";
            const dispute =
              (adjustment.action === "chargeback" || adjustment.action === "chargeback_warning") &&
              adjustment.status !== "rejected" &&
              adjustment.status !== "reversed";
            const disputeReversed =
              adjustment.action === "chargeback_reverse" ||
              adjustment.action === "chargeback_warning_reverse";

            if (fullRefund || dispute) {
              const { error } = await supabaseAdmin
                .from("course_entitlements")
                .update({
                  status: fullRefund ? "refunded" : "revoked",
                  refunded_at: fullRefund ? new Date().toISOString() : null,
                })
                .eq("paddle_transaction_id", adjustment.transaction_id)
                .eq("environment", environment);
              if (error) throw error;
              note = fullRefund
                ? "access removed after full refund"
                : "access removed after dispute";
            } else if (disputeReversed) {
              const { error } = await supabaseAdmin
                .from("course_entitlements")
                .update({
                  status: "active",
                  refunded_at: null,
                })
                .eq("paddle_transaction_id", adjustment.transaction_id)
                .eq("environment", environment)
                .eq("status", "revoked");
              if (error) throw error;
              note = "access restored after dispute reversal";
            } else if (adjustment.action === "refund" && adjustment.status === "approved") {
              note = "partial refund recorded; course access retained";
            }
          }

          if (event.event_type === "transaction.payment_failed") note = "payment failed";

          const { error: completionError } = await supabaseAdmin
            .from("payment_events")
            .update({
              handled: true,
              status: "completed",
              processing_started_at: null,
              last_error: null,
              note,
            })
            .eq("event_id", event.event_id)
            .eq("environment", environment);
          if (completionError) throw completionError;
          return Response.json({ ok: true, note });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown payment processing error";
          console.error("payment event processing failed", { eventId: event.event_id, message });
          await supabaseAdmin
            .from("payment_events")
            .update({
              handled: false,
              status: "failed",
              processing_started_at: null,
              last_error: message.slice(0, 1000),
              note: "processing failed; retry allowed",
            })
            .eq("event_id", event.event_id)
            .eq("environment", environment);
          return new Response("Payment event processing failed", { status: 500 });
        }
      },
    },
  },
});
