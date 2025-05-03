/*
  # Fix column names in activity_details table
  
  1. Changes
    - Rename columns to match frontend naming convention (camelCase)
    - Maintain all existing relationships and constraints
  
  2. Security
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  -- Rename columns if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'activity_code'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN activity_code TO "activityCode";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'activity_title'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN activity_title TO "activityTitle";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'budget_code_id'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN budget_code_id TO "budgetCodeId";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'volume_original'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN volume_original TO "volumeOriginal";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'volume_revised'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN volume_revised TO "volumeRevised";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'value_original'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN value_original TO "valueOriginal";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'value_revised'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN value_revised TO "valueRevised";
  END IF;

  -- Update foreign key constraint to use new column name
  ALTER TABLE activity_details 
  DROP CONSTRAINT IF EXISTS activity_details_budget_code_id_fkey;

  ALTER TABLE activity_details
  ADD CONSTRAINT activity_details_budget_code_id_fkey 
  FOREIGN KEY ("budgetCodeId") 
  REFERENCES budget_codes(id) 
  ON DELETE CASCADE;
END $$;