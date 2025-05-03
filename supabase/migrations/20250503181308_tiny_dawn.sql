/*
  # Fix budget codes policies and column names
  
  1. Changes
    - Drop existing policies
    - Create new simplified policies for CRUD operations
    - Update column names to match TypeScript conventions
  
  2. Security
    - Maintain RLS with simplified policies
    - Ensure proper authentication checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON budget_codes;

-- Create new simplified policies
CREATE POLICY "Enable read access for authenticated users"
ON budget_codes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON budget_codes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
ON budget_codes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
ON budget_codes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update column names
DO $$ 
BEGIN
  -- Update column names if they haven't been updated
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' AND column_name = 'ro_code'
  ) THEN
    ALTER TABLE budget_codes RENAME COLUMN ro_code TO "roCode";
    ALTER TABLE budget_codes RENAME COLUMN ro_title TO "roTitle";
    ALTER TABLE budget_codes RENAME COLUMN component_code TO "componentCode";
    ALTER TABLE budget_codes RENAME COLUMN component_title TO "componentTitle";
  END IF;
END $$;