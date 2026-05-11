/*
  # Enable RLS for user-specific data

  1. Security Updates
    - Update RLS policies to be user-specific
    - Ensure users can only access their own data
    - Add user_id columns where needed

  2. Policy Updates
    - Replace public policies with authenticated user policies
    - Add user_id filtering to all policies
*/

-- Add user_id columns to existing tables
DO $$
BEGIN
  -- Add user_id to market_items if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE market_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to home_items if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'home_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE home_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to inventory_items if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to monthly_budgets if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monthly_budgets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE monthly_budgets ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to simple_market_items if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'simple_market_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE simple_market_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on market_items" ON market_items;
DROP POLICY IF EXISTS "Allow all operations on home_items" ON home_items;
DROP POLICY IF EXISTS "Allow all operations on inventory_items" ON inventory_items;
DROP POLICY IF EXISTS "Allow all operations on monthly_budgets" ON monthly_budgets;
DROP POLICY IF EXISTS "Allow all operations on simple_market_items" ON simple_market_items;

-- Create user-specific policies for market_items
CREATE POLICY "Users can manage their own market items"
  ON market_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for home_items
CREATE POLICY "Users can manage their own home items"
  ON home_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for inventory_items
CREATE POLICY "Users can manage their own inventory items"
  ON inventory_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for monthly_budgets
CREATE POLICY "Users can manage their own budgets"
  ON monthly_budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user-specific policies for simple_market_items
CREATE POLICY "Users can manage their own simple market items"
  ON simple_market_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);