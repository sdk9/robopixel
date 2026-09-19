import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div>
        <h1 className="font-heading text-5xl">This page did not load.</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button className="mt-5 underline underline-offset-4" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultErrorComponent: DefaultError,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
