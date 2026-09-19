const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

declare global {
  interface Window {
    Paddle: {
      Environment: { set: (environment: "sandbox" | "production") => void };
      Initialize: (options: { token: string }) => void;
      Checkout: { open: (options: Record<string, unknown>) => void };
    };
  }
}

export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let paddleInitialized = false;

export async function initializePaddle() {
  if (paddleInitialized) return;
  if (!clientToken) throw new Error("Checkout is not configured.");

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-paddle="billing"]');
    const script = existing ?? document.createElement("script");
    const onLoad = () => {
      window.Paddle.Environment.set(
        getPaddleEnvironment() === "sandbox" ? "sandbox" : "production",
      );
      window.Paddle.Initialize({ token: clientToken });
      paddleInitialized = true;
      resolve();
    };
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", () => reject(new Error("Checkout could not load.")), {
      once: true,
    });
    if (!existing) {
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.dataset["paddle"] = "billing";
      document.head.appendChild(script);
    }
  });
}
