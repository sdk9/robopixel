import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/labs")({
  component: () => <Outlet />,
});
