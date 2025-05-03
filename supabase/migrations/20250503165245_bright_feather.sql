/*
  # Fix RLS policies for budget_codes table

  1. Changes
    - Drop existing RLS policies for budget_codes table
    - Create new, properly configured RLS policies that:
      - Allow authenticated users to insert new budget codes
      - Allow authenticated users to read all budget codes
      - Allow authenticated users to update their own budget codes
      - Allow authenticated users to delete their own budget codes
  
  2. Security
    - Maintains RLS enabled on budget_codes table
    - Adds user_id column to track ownership
    - Sets up proper policies with security definer functions
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE budget_codes ADD COLUMN user_id UUID REFERENCES auth.users(id);
    
    -- Set existing rows to the current user
    UPDATE budget_codes SET user_id = auth.uid();
    
    -- Make it non-nullable for future rows
    ALTER TABLE budget_codes ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON budget_codes;

-- Create new policies
CREATE POLICY "Enable insert for authenticated users" 
ON budget_codes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read for authenticated users" 
ON budget_codes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable update for users based on user_id" 
ON budget_codes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" 
ON budget_codes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);