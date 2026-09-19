import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { containsOnlyExpectedCoursePrice } from "@/lib/payment-validation";

const INDUSTRIAL_COURSE_ID = "industrial_robots_course";

export const prepareIndustrialCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { enforceRateLimit } = await import("@/lib/rate-limit.server");
    await enforceRateLimit({
      action: "prepare-checkout",
      maxRequests: 10,
      windowSeconds: 600,
      subject: context.userId,
    });

    const { getConfiguredPaddleEnvironment, getIndustrialPriceId } =
      await import("@/lib/paddle.server");
    const environment = getConfiguredPaddleEnvironment();
    if (environment === "live") {
      const missingLegalConfiguration = [
        "VITE_LEGAL_BUSINESS_NAME",
        "VITE_LEGAL_POSTAL_ADDRESS",
        "VITE_LEGAL_GOVERNING_LAW",
      ].filter((name) => !process.env[name]);
      if (missingLegalConfiguration.length > 0) {
        console.error(`Live checkout blocked: missing ${missingLegalConfiguration.join(", ")}`);
        throw new Error("Checkout is not available until seller details are configured.");
      }
    }
    const priceId = await getIndustrialPriceId(environment);
    const intentId = globalThis.crypto.randomUUID();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("purchase_intents").insert({
      id: intentId,
      user_id: context.userId,
      course_id: INDUSTRIAL_COURSE_ID,
      environment,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
    if (error) throw new Error("Checkout could not be prepared.");
    return { priceId, intentId, environment };
  });

export const getIndustrialRobotsAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { hasFullAccess } = await import("@/lib/full-access.server");
    if (hasFullAccess(context.claims)) return { active: true, entitlement: null };
    const { getConfiguredPaddleEnvironment } = await import("@/lib/paddle.server");
    const environment = getConfiguredPaddleEnvironment();
    const { data: entitlement, error } = await context.supabase
      .from("course_entitlements")
      .select("status, purchased_at")
      .eq("user_id", context.userId)
      .eq("course_id", INDUSTRIAL_COURSE_ID)
      .eq("environment", environment)
      .maybeSingle();
    if (error) throw new Error("Course access could not be checked.");
    return { active: entitlement?.status === "active", entitlement };
  });

export const getAccountOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConfiguredPaddleEnvironment } = await import("@/lib/paddle.server");
    const environment = getConfiguredPaddleEnvironment();
    const [entitlementResult, submissionResult, lessonResult] = await Promise.all([
      context.supabase
        .from("course_entitlements")
        .select("course_id, status, purchased_at, refunded_at, paddle_transaction_id")
        .eq("user_id", context.userId)
        .eq("environment", environment)
        .order("purchased_at", { ascending: false }),
      context.supabase
        .from("practice_submissions")
        .select("exercise_id, passed")
        .eq("user_id", context.userId),
      context.supabase
        .from("lesson_progress")
        .select("course_slug, lesson_slug, completed_at")
        .eq("user_id", context.userId)
        .order("completed_at", { ascending: false }),
    ]);
    if (entitlementResult.error) throw new Error("Your purchases could not be loaded.");
    if (submissionResult.error) throw new Error("Your practice progress could not be loaded.");
    if (lessonResult.error) throw new Error("Your lesson progress could not be loaded.");

    const passed = new Set(
      (submissionResult.data ?? []).filter((row) => row.passed).map((row) => row.exercise_id),
    );
    const { hasFullAccess } = await import("@/lib/full-access.server");
    const entitlements = entitlementResult.data ?? [];
    if (
      hasFullAccess(context.claims) &&
      !entitlements.some((row) => row.course_id === INDUSTRIAL_COURSE_ID && row.status === "active")
    ) {
      entitlements.unshift({
        course_id: INDUSTRIAL_COURSE_ID,
        status: "active",
        purchased_at: new Date().toISOString(),
        refunded_at: null,
        paddle_transaction_id: "full-access",
      } as (typeof entitlements)[number]);
    }
    return {
      email: (context.claims as { email?: string }).email ?? null,
      entitlements,
      practice: {
        attempted: new Set((submissionResult.data ?? []).map((row) => row.exercise_id)).size,
        passed: passed.size,
      },
      lessons: {
        completed: lessonResult.data?.length ?? 0,
        latest: lessonResult.data?.[0] ?? null,
      },
    };
  });

type PaddleTransaction = {
  id: string;
  status: string;
  customer_id?: string | null;
  custom_data?: { purchaseIntentId?: string; userId?: string; courseId?: string } | null;
  items?: Array<{ price?: { id?: string }; quantity?: number }>;
};

export const restorePurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims as { email?: string }).email;
    if (!email)
      return { restored: false, message: "Your account has no email address to match a payment." };

    const { enforceRateLimit } = await import("@/lib/rate-limit.server");
    await enforceRateLimit({
      action: "restore-purchase",
      maxRequests: 5,
      windowSeconds: 3600,
      subject: context.userId,
    });
    const { gatewayFetch, getConfiguredPaddleEnvironment, getIndustrialPriceId } =
      await import("@/lib/paddle.server");
    const environment = getConfiguredPaddleEnvironment();
    const expectedPriceId = await getIndustrialPriceId(environment);

    const customerResponse = await gatewayFetch(
      environment,
      `/customers?email=${encodeURIComponent(email)}`,
    );
    if (!customerResponse.ok)
      throw new Error("We could not reach the payment provider. Please try again shortly.");
    const customers = (await customerResponse.json()) as { data?: Array<{ id: string }> };
    const customerIds = (customers.data ?? []).map((customer) => customer.id);
    if (customerIds.length === 0)
      return { restored: false, message: "No payment was found for your email address." };

    const transactions: PaddleTransaction[] = [];
    for (const customerId of customerIds) {
      const response = await gatewayFetch(
        environment,
        `/transactions?customer_id=${encodeURIComponent(customerId)}&status=completed&per_page=50`,
      );
      if (!response.ok) continue;
      const body = (await response.json()) as { data?: PaddleTransaction[] };
      transactions.push(...(body.data ?? []));
    }

    const match = transactions.find(
      (transaction) =>
        containsOnlyExpectedCoursePrice(transaction.items, expectedPriceId) &&
        Boolean(
          transaction.custom_data?.purchaseIntentId ||
          (transaction.custom_data?.courseId === INDUSTRIAL_COURSE_ID &&
            transaction.custom_data?.userId === context.userId),
        ),
    );
    if (!match)
      return {
        restored: false,
        message: "No completed purchase of the Industrial Robots course was found.",
      };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("course_entitlements")
      .select("status")
      .eq("paddle_transaction_id", match.id)
      .eq("environment", environment)
      .maybeSingle();
    if (existing && existing.status !== "active") {
      return {
        restored: false,
        message:
          existing.status === "refunded"
            ? "This purchase was refunded, so access cannot be restored."
            : "Access for this purchase was removed after a payment dispute.",
      };
    }

    const intentId = match.custom_data?.purchaseIntentId;
    if (intentId) {
      const { data: ownedIntent } = await supabaseAdmin
        .from("purchase_intents")
        .select("id")
        .eq("id", intentId)
        .eq("user_id", context.userId)
        .eq("environment", environment)
        .maybeSingle();
      if (!ownedIntent) {
        return { restored: false, message: "The purchase belongs to a different account." };
      }
      const { error } = await supabaseAdmin.rpc("complete_course_purchase", {
        p_intent_id: intentId,
        p_transaction_id: match.id,
        p_customer_id: match.customer_id ?? null,
        p_environment: environment,
      });
      if (error) throw new Error("Access could not be restored automatically.");
    } else {
      const { error } = await supabaseAdmin.from("course_entitlements").upsert(
        {
          user_id: context.userId,
          course_id: INDUSTRIAL_COURSE_ID,
          paddle_transaction_id: match.id,
          paddle_customer_id: match.customer_id ?? null,
          status: "active",
          environment,
          purchased_at: new Date().toISOString(),
          refunded_at: null,
        },
        { onConflict: "user_id,course_id,environment" },
      );
      if (error) throw new Error("Access could not be restored automatically.");
    }
    return {
      restored: true,
      message: "Your purchase was found and your course access is active again.",
    };
  });
