/*
  # Create keepalive function for Supabase database

  1. New Tables
    - `keepalive_log`
      - `id` (bigint, primary key)
      - `last_ping` (timestamp with timezone)
      - `created_at` (timestamp with timezone)

  2. Purpose
    - Keep Supabase database active by sending periodic pings
    - Prevent project from sleeping/hibernating
    - Function executes every 6 days to maintain activity

  3. Security
    - Enable RLS on `keepalive_log` table
    - Allow anonymous and authenticated access for keepalive pings
    - Critical for maintaining service availability
*/

CREATE TABLE IF NOT EXISTS keepalive_log (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  last_ping timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keepalive_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow keepalive pings"
  ON keepalive_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_keepalive()
RETURNS TABLE(status text, last_update timestamptz) AS $$
BEGIN
  DELETE FROM keepalive_log WHERE created_at < now() - interval '7 days';
  
  INSERT INTO keepalive_log (last_ping, created_at)
  VALUES (now(), now());

  RETURN QUERY
  SELECT 
    'success'::text as status,
    MAX(last_ping) as last_update
  FROM keepalive_log;
END;
$$ LANGUAGE plpgsql;
