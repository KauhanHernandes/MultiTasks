/*
  # Create inventory items table

  1. New Tables
    - `inventory_items`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `quantity` (integer, default 1)
      - `expiry_date` (date, optional)
      - `month` (text, required, YYYY-MM format)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `inventory_items` table
    - Add policy for public access to all operations

  3. Features
    - Automatic updated_at trigger
*/

-- Create the inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity integer DEFAULT 1,
  expiry_date date,
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on inventory_items"
  ON inventory_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();