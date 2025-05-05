/*
  # Round total values based on 500 rule
  
  1. Changes
    - Add function to round values based on 500 rule
    - Update existing data to apply rounding
    - Add trigger to automatically round new entries
  
  2. Notes
    - Rounds last 3 digits:
      - >= 500: round up to next thousand
      - < 500: round down to previous thousand
    - Maintains volume while adjusting value to achieve rounded total
*/

-- Create rounding function
CREATE OR REPLACE FUNCTION round_to_thousand(value numeric)
RETURNS numeric AS $$
BEGIN
  RETURN value - (value % 1000) + 
    CASE 
      WHEN (value % 1000) >= 500 THEN 1000 
      ELSE 0 
    END;
END;
$$ LANGUAGE plpgsql;

-- Update existing data
DO $$ 
BEGIN
  -- Update original values
  UPDATE activity_details
  SET "valueOriginal" = round_to_thousand("volumeOriginal" * "valueOriginal") / NULLIF("volumeOriginal", 0)
  WHERE "volumeOriginal" != 0;

  -- Update revised values
  UPDATE activity_details
  SET "valueRevised" = round_to_thousand("volumeRevised" * "valueRevised") / NULLIF("volumeRevised", 0)
  WHERE "volumeRevised" != 0;
END $$;

-- Create trigger function to round new entries
CREATE OR REPLACE FUNCTION round_activity_values()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."volumeOriginal" != 0 THEN
    NEW."valueOriginal" = round_to_thousand(NEW."volumeOriginal" * NEW."valueOriginal") / NEW."volumeOriginal";
  END IF;
  
  IF NEW."volumeRevised" != 0 THEN
    NEW."valueRevised" = round_to_thousand(NEW."volumeRevised" * NEW."valueRevised") / NEW."volumeRevised";
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS round_values_trigger ON activity_details;
CREATE TRIGGER round_values_trigger
  BEFORE INSERT OR UPDATE
  ON activity_details
  FOR EACH ROW
  EXECUTE FUNCTION round_activity_values();