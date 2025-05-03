/*
  # Add Component Code Column to Budget Codes Table

  1. Changes
    - Add `component_code` column to `budget_codes` table
    - Add `component_title` column to `budget_codes` table
    - Both columns are required (NOT NULL) as they are mandatory fields in the form

  2. Notes
    - Using text type to match existing column types in the table
    - Adding both columns together since they are related and both used in the form
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'component_code'
  ) THEN
    ALTER TABLE budget_codes 
    ADD COLUMN component_code text NOT NULL,
    ADD COLUMN component_title text NOT NULL;
  END IF;
END $$;