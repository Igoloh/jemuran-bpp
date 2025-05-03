/*
  # Fix column names in budget_codes table
  
  1. Changes
    - Rename columns to match frontend naming convention
    - Ensure all required columns exist
  
  2. Security
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Rename columns if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'ro_code'
  ) THEN
    ALTER TABLE budget_codes 
    RENAME COLUMN ro_code TO "roCode";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'ro_title'
  ) THEN
    ALTER TABLE budget_codes 
    RENAME COLUMN ro_title TO "roTitle";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'component_code'
  ) THEN
    ALTER TABLE budget_codes 
    RENAME COLUMN component_code TO "componentCode";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'component_title'
  ) THEN
    ALTER TABLE budget_codes 
    RENAME COLUMN component_title TO "componentTitle";
  END IF;

  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'roCode'
  ) THEN
    ALTER TABLE budget_codes ADD COLUMN "roCode" text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'roTitle'
  ) THEN
    ALTER TABLE budget_codes ADD COLUMN "roTitle" text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'componentCode'
  ) THEN
    ALTER TABLE budget_codes ADD COLUMN "componentCode" text NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'componentTitle'
  ) THEN
    ALTER TABLE budget_codes ADD COLUMN "componentTitle" text NOT NULL;
  END IF;
END $$;