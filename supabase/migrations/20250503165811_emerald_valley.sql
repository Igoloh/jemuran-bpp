/*
  # Fix user authentication and RLS policies

  1. Changes
    - Ensure user_id column exists and is properly configured
    - Update RLS policies to properly handle user authentication
    - Clean up any duplicate or conflicting policies
  
  2. Security
    - Enforce user_id checks on all write operations
    - Allow read access to all authenticated users
    - Restrict write operations to record owners only
*/

-- First clean up any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users with user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON budget_codes;

-- Ensure user_id column exists and is properly configured
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'budget_codes' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE budget_codes ADD COLUMN user_id UUID REFERENCES auth.users(id);
    ALTER TABLE budget_codes ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Create new policies with proper user authentication checks
CREATE POLICY "Enable read access for authenticated users"
ON budget_codes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users with user_id"
ON budget_codes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Enable update for users based on user_id"
ON budget_codes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
ON budget_codes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);