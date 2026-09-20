import { lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";

const SiteAuthNav = lazy(() =>
  import("@/components/SiteAuthNav").then((module) => ({ default: module.SiteAuthNav })),
);

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="pixel-wordmark" aria-label="Code The Robot home">
          <span className="pixel-wordmark-robot">Code</span>
          <span className="pixel-wordmark-code">The</span>
          <span className="pixel-wordmark-hub">Robot</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link to="/" hash="courses" className="text-muted-foreground hover:text-foreground">
            Courses
          </Link>
          <Link to="/practice" className="text-muted-foreground hover:text-foreground">
            Practice
          </Link>
          <Link to="/labs" className="text-muted-foreground hover:text-foreground">
            ROS labs
          </Link>
          <Suspense fallback={<span className="text-sm text-muted-foreground">Account</span>}>
            <SiteAuthNav />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
