export type PaddleEnv = "sandbox" | "live";

const API_ORIGINS: Record<PaddleEnv, string> = {
  sandbox: "https://sandbox-api.paddle.com",
  live: "https://api.paddle.com",
};

export function paddleApiFetch(environment: PaddleEnv, path: string, init?: RequestInit) {
  const apiKey =
    environment === "sandbox"
      ? process.env["PADDLE_SANDBOX_API_KEY"]
      : process.env["PADDLE_LIVE_API_KEY"];

  if (!apiKey) {
    throw new Error("Payments are not configured for this environment.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  headers.set("Paddle-Version", "1");
  headers.set("Content-Type", "application/json");

  return fetch(`${API_ORIGINS[environment]}${path}`, { ...init, headers });
}

export function getConfiguredPaddleEnvironment(): PaddleEnv {
  const configured = process.env["PAYMENTS_ENVIRONMENT"];
  if (configured === "sandbox" || configured === "live") return configured;
  return process.env["VITE_PAYMENTS_CLIENT_TOKEN"]?.startsWith("test_") ? "sandbox" : "live";
}

export function getIndustrialPriceId(environment: PaddleEnv) {
  const variable = environment === "sandbox" ? "PADDLE_SANDBOX_PRICE_ID" : "PADDLE_LIVE_PRICE_ID";
  const priceId = process.env[variable]?.trim();
  if (!priceId || !/^pri_[a-z\d]{26}$/.test(priceId)) {
    throw new Error(`Payments are not configured: ${variable} must be a valid Paddle price ID.`);
  }
  return priceId;
}
