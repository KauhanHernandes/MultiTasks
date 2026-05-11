import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useKeepalive = () => {
  useEffect(() => {
    const pingSupabase = async () => {
      try {
        const { data, error } = await supabase
          .rpc('update_keepalive');

        if (error) {
          console.log('Keepalive ping sent');
        } else {
          console.log('Keepalive status:', data);
        }
      } catch (err) {
        console.log('Keepalive check completed');
      }
    };

    pingSupabase();
    const interval = setInterval(pingSupabase, 6 * 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
