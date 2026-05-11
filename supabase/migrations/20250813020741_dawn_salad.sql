/*
  # Create inventory and budget tables

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `quantity` (integer)
      - `expiry_date` (date, optional)
      - `month` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `monthly_budgets`
      - `id` (uuid, primary key)
      - `month` (text, unique)
      - `budget_amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access
*/

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity integer DEFAULT 1,
  expiry_date date,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create monthly_budgets table
CREATE TABLE IF NOT EXISTS monthly_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text UNIQUE NOT NULL,
  budget_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory_items
CREATE POLICY "Allow all operations on inventory_items"
  ON inventory_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for monthly_budgets
CREATE POLICY "Allow all operations on monthly_budgets"
  ON monthly_budgets
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_budgets_updated_at
  BEFORE UPDATE ON monthly_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();