"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function useAuthUser() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) setUser(data?.user ?? null);
      } catch {
        if (mounted) setUser(null);
      }
    }

    load();

    const listener = supabase.auth?.onAuthStateChange?.((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.data?.subscription?.unsubscribe?.();
      listener?.unsubscribe?.();
    };
  }, []);

  return {
    user,
    isLoading: user === undefined,
    isAuthenticated: !!user,
  };
}
