"use client";

import { useEffect, useState } from "react";

type NavbarAuthStatus = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function useDeferredNavbarAuth(): NavbarAuthStatus {
  const [status, setStatus] = useState<NavbarAuthStatus>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function connect() {
      const { supabase } = await import("../../lib/supabaseClient");
      if (!active) return;

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setStatus({ isAuthenticated: Boolean(session?.user), isLoading: false });
      });
      unsubscribe = () => listener.subscription.unsubscribe();

      const { data } = await supabase.auth.getSession();
      if (active) {
        setStatus({
          isAuthenticated: Boolean(data.session?.user),
          isLoading: false,
        });
      }
    }

    const timeoutId = window.setTimeout((): void => {
      void connect();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, []);

  return status;
}
