/*
  # Create home items table

  1. New Tables
    - `home_items`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Name of the home task/item
      - `completed` (boolean, not null, default false) - Whether task was completed
      - `month` (text, not null) - Month in YYYY-MM format
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `home_items` table
    - Add policy for all users to manage their home items
*/

CREATE TABLE IF NOT EXISTS home_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE home_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on home_items"
  ON home_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_home_items_updated_at
  BEFORE UPDATE ON home_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();