/*
  # Create simple_market_items table

  1. New Tables
    - `simple_market_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, item name)
      - `quantity` (integer, item quantity)
      - `completed` (boolean, default false)
      - `month` (text, YYYY-MM format)
      - `category_id` (text, optional category reference)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `simple_market_items` table
    - Add policy for users to manage their own items
*/

CREATE TABLE IF NOT EXISTS simple_market_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  completed boolean NOT NULL DEFAULT false,
  month text NOT NULL,
  category_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE simple_market_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own simple market items"
  ON simple_market_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_simple_market_items_user_id ON simple_market_items(user_id);
CREATE INDEX idx_simple_market_items_month ON simple_market_items(month);
CREATE INDEX idx_simple_market_items_user_month ON simple_market_items(user_id, month);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_simple_market_items_updated_at
  BEFORE UPDATE ON simple_market_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();