/*
  # Keepalive Function for Supabase

  1. Purpose
    - Create a function that updates a timestamp every 6 days
    - Keep the Supabase project active and prevent it from sleeping
    - Prevent database hibernation due to inactivity

  2. New Tables
    - `keepalive_log`
      - `id` (bigint, primary key)
      - `last_ping` (timestamp with timezone)
      - `created_at` (timestamp with timezone)

  3. Security
    - Enable RLS on `keepalive_log` table
    - Create policy to allow anonymous access for keepalive pings
*/

CREATE TABLE IF NOT EXISTS keepalive_log (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  last_ping timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE keepalive_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous keepalive pings"
  ON keepalive_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_keepalive()
RETURNS TABLE(status text, last_update timestamptz) AS $$
BEGIN
  DELETE FROM keepalive_log WHERE created_at < now() - interval '6 days';
  
  INSERT INTO keepalive_log (last_ping, created_at)
  VALUES (now(), now())
  ON CONFLICT DO NOTHING;

  RETURN QUERY
  SELECT 
    'success'::text as status,
    MAX(last_ping) as last_update
  FROM keepalive_log;
END;
$$ LANGUAGE plpgsql;
