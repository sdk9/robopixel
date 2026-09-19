import { createHash } from "crypto";
import { getRequest } from "@tanstack/react-start/server";

type RateLimitOptions = {
  action: string;
  maxRequests: number;
  windowSeconds: number;
  subject?: string;
};

function requestSubject() {
  const request = getRequest();
  const forwarded =
    request?.headers.get("cf-connecting-ip") ??
    request?.headers.get("x-real-ip") ??
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "unknown";
}

export async function enforceRateLimit(options: RateLimitOptions) {
  const secret = process.env["RATE_LIMIT_SALT"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!secret && process.env["NODE_ENV"] === "production") {
    throw new Error("RATE_LIMIT_SALT is required in production.");
  }

  const subjectHash = createHash("sha256")
    .update(`${secret ?? "local-development"}:${options.subject ?? requestSubject()}`)
    .digest("hex");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
    p_action: options.action,
    p_subject_hash: subjectHash,
    p_max_requests: options.maxRequests,
    p_window_seconds: options.windowSeconds,
  });

  if (error) {
    console.error("rate limit check failed", error);
    throw new Error("This service is temporarily unavailable.");
  }
  if (!data) throw new Error("Too many requests. Please wait and try again.");
}
