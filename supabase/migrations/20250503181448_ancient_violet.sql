/*
  # Fix column names in activity_details table
  
  1. Changes
    - Rename budget_code_id to budgetCodeId to match camelCase convention
  
  2. Notes
    - Uses conditional check to prevent errors if column was already renamed
*/

DO $$ 
BEGIN
  -- Update column name if it hasn't been updated yet
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activity_details' AND column_name = 'budget_code_id'
  ) THEN
    ALTER TABLE activity_details 
    RENAME COLUMN budget_code_id TO "budgetCodeId";
  END IF;
END $$;