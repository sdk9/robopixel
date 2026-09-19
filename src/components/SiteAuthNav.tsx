import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Small header affordance that always reflects the current session, so signing
 * in visibly changes the site and signed-out learners always have a way in.
 */
export function SiteAuthNav() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.user));
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "USER_UPDATED" ||
        event === "INITIAL_SESSION"
      ) {
        setSignedIn(Boolean(session?.user));
      }
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (signedIn === null) return <span className="text-sm text-muted-foreground">…</span>;

  return signedIn ? (
    <Link
      to="/account"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <UserRound className="size-4" aria-hidden="true" />
      My account
    </Link>
  ) : (
    <Link
      to="/auth"
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <UserRound className="size-4" aria-hidden="true" />
      Sign in
    </Link>
  );
}
