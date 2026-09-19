import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/client";
import { getPracticeProgress } from "@/lib/practice.functions";

export type ProgressState = {
  signedIn: boolean;
  loading: boolean;
  passed: string[];
  attempted: string[];
};

export function usePracticeProgress() {
  const loadProgress = useServerFn(getPracticeProgress);
  const [state, setState] = useState<ProgressState>({
    signedIn: false,
    loading: true,
    passed: [],
    attempted: [],
  });

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        setState({ signedIn: false, loading: false, passed: [], attempted: [] });
        return;
      }
      try {
        const result = await loadProgress();
        if (active)
          setState({
            signedIn: true,
            loading: false,
            passed: result.passed,
            attempted: result.attempted,
          });
      } catch {
        if (active) setState({ signedIn: true, loading: false, passed: [], attempted: [] });
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [loadProgress]);

  return state;
}
