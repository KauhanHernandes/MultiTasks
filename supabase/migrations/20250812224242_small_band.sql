/*
  # Create market items table

  1. New Tables
    - `market_items`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Name of the market item
      - `price` (numeric, not null, default 0) - Price per unit
      - `quantity` (integer, not null, default 1) - Quantity to buy
      - `completed` (boolean, not null, default false) - Whether item was purchased
      - `month` (text, not null) - Month in YYYY-MM format
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `market_items` table
    - Add policy for all users to manage their market items
*/

CREATE TABLE IF NOT EXISTS market_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  completed boolean NOT NULL DEFAULT false,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on market_items"
  ON market_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_market_items_updated_at
  BEFORE UPDATE ON market_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();