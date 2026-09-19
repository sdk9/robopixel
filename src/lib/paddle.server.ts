export type PaddleEnv = "sandbox" | "live";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/paddle";

export function gatewayFetch(environment: PaddleEnv, path: string, init?: RequestInit) {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const connectionKey =
    environment === "sandbox"
      ? process.env["PADDLE_SANDBOX_API_KEY"]
      : process.env["PADDLE_LIVE_API_KEY"];

  if (!lovableApiKey || !connectionKey) {
    throw new Error("Payments are not configured for this environment.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Lovable-API-Key", lovableApiKey);
  headers.set("X-Connection-Api-Key", connectionKey);
  headers.set("Content-Type", "application/json");

  return fetch(`${GATEWAY_URL}${path}`, { ...init, headers });
}

export function getConfiguredPaddleEnvironment(): PaddleEnv {
  const configured = process.env["PAYMENTS_ENVIRONMENT"];
  if (configured === "sandbox" || configured === "live") return configured;
  return process.env["VITE_PAYMENTS_CLIENT_TOKEN"]?.startsWith("test_") ? "sandbox" : "live";
}

const priceCache = new Map<PaddleEnv, Promise<string>>();

export function getIndustrialPriceId(environment: PaddleEnv) {
  const cached = priceCache.get(environment);
  if (cached) return cached;

  const request = gatewayFetch(environment, "/prices?external_id=industrial_robots_one_time")
    .then(async (response) => {
      if (!response.ok)
        throw new Error(`Paddle price lookup failed with status ${response.status}.`);
      const result = (await response.json()) as { data?: Array<{ id: string; status?: string }> };
      const price = result.data?.find((candidate) => candidate.status !== "archived");
      if (!price) throw new Error("The Industrial Robots checkout price is unavailable.");
      return price.id;
    })
    .catch((error) => {
      priceCache.delete(environment);
      throw error;
    });
  priceCache.set(environment, request);
  return request;
}
