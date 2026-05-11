/*
  # Create market items table

  1. New Tables
    - `market_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, product name)
      - `price` (numeric, product price)
      - `quantity` (integer, item quantity)
      - `completed` (boolean, purchase status)
      - `month` (text, YYYY-MM format)
      - `section_name` (text, section/store name)
      - `is_finalized` (boolean, finalized status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `market_items` table
    - Add policy for users to manage their own items
*/

CREATE TABLE IF NOT EXISTS market_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  completed boolean DEFAULT false,
  month text NOT NULL,
  section_name text,
  is_finalized boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE market_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own items"
  ON market_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON market_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON market_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON market_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_market_items_user_id ON market_items(user_id);
CREATE INDEX idx_market_items_month ON market_items(month);
CREATE INDEX idx_market_items_user_month ON market_items(user_id, month);
