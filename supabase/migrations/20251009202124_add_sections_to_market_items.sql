/*
  # Add Sections/Stores Support to Market Items
  
  1. Changes
    - Add `section_name` column to market_items table to support grouping by store/section
    - Add `is_finalized` column to track if items are finalized
    - Create default value empty string for section_name
    
  2. Purpose
    - Allow users to organize shopping lists by different stores (e.g., "Atacadão", "Frigorífico")
    - Enable grouping items by store/section
    - Track finalized status for items
*/

-- Add section_name column to market_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_items' AND column_name = 'section_name'
  ) THEN
    ALTER TABLE market_items ADD COLUMN section_name text DEFAULT '' NOT NULL;
  END IF;
END $$;

-- Add is_finalized column to market_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_items' AND column_name = 'is_finalized'
  ) THEN
    ALTER TABLE market_items ADD COLUMN is_finalized boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_market_items_section_name ON market_items(section_name);
CREATE INDEX IF NOT EXISTS idx_market_items_finalized ON market_items(is_finalized);
