import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="mx-auto flex max-w-4xl items-center justify-end px-5 py-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            All courses
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <p className="text-xs uppercase text-primary">Legal</p>
        <h1 className="mt-2 font-heading text-5xl md:text-6xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="legal-copy mt-10 space-y-8 text-sm leading-7 text-muted-foreground">
          {children}
        </div>
      </main>
      <footer className="border-t border-border">
        <nav className="mx-auto flex max-w-4xl flex-wrap gap-5 px-5 py-6 text-xs text-muted-foreground">
          <Link to="/terms">Terms</Link>
          <Link to="/refunds">Refunds</Link>
          <Link to="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-heading text-2xl text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
