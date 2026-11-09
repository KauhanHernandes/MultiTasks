/*
  # Create home_items table

  1. New Tables
    - `home_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, task name)
      - `completed` (boolean, default false)
      - `month` (text, YYYY-MM format)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `home_items` table
    - Add policy for users to manage their own items
*/

CREATE TABLE IF NOT EXISTS home_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE home_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own home items"
  ON home_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_home_items_user_id ON home_items(user_id);
CREATE INDEX idx_home_items_month ON home_items(month);
CREATE INDEX idx_home_items_user_month ON home_items(user_id, month);

-- Updated_at trigger (uses existing function from other migrations)
CREATE TRIGGER update_home_items_updated_at
  BEFORE UPDATE ON home_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();