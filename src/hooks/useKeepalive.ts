import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Client-side keepalive - runs only when tab is visible
 * Server-side (GitHub Actions) handles the main 6-day schedule
 * This is a lightweight backup for when users have the app open
 */
export const useKeepalive = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPingRef = useRef<number>(0);

  useEffect(() => {
    // Check if we should ping (at least 5.5 days since last ping)
    const shouldPing = () => {
      const now = Date.now();
      const fiveAndHalfDays = 5.5 * 24 * 60 * 60 * 1000;
      return now - lastPingRef.current > fiveAndHalfDays;
    };

    const pingSupabase = async () => {
      // Only ping if tab is visible and enough time has passed
      if (document.visibilityState !== 'visible' || !shouldPing()) {
        return;
      }

      try {
        const { data, error } = await supabase.rpc('update_keepalive');

        if (error) {
          console.debug('[Keepalive] RPC error:', error.message);
        } else {
          console.debug('[Keepalive] Success:', data);
          lastPingRef.current = Date.now();
        }
      } catch (err) {
        console.debug('[Keepalive] Network error:', err);
      }
    };

    // Initial check
    pingSupabase();

    // Check every hour (lightweight, only pings if needed)
    intervalRef.current = setInterval(pingSupabase, 60 * 60 * 1000);

    // Also ping when tab becomes visible (user returns)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pingSupabase();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
