/*
  # Add missing columns to inventory_items table

  1. Changes
    - Add `expiry_date` column (date, nullable)
    - Add `category_id` column (text, nullable)
    - Add indexes for better query performance
*/

-- Add expiry_date column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'expiry_date'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN expiry_date date;
  END IF;
END $$;

-- Add category_id column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN category_id text;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_month ON inventory_items(user_id, month);