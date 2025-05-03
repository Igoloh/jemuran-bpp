/*
  # Fix RLS policies for budget_codes table

  1. Changes
    - Drop existing RLS policies for budget_codes table
    - Create new policies that properly handle the user_id field
    - Ensure INSERT policy sets user_id to the authenticated user's ID
  
  2. Security
    - Maintain RLS enabled on budget_codes table
    - Add policies for all CRUD operations
    - Ensure user_id is properly set and validated
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON budget_codes;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON budget_codes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users with auto-set user_id"
ON budget_codes FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure user_id is set to the authenticated user's ID
  user_id = auth.uid()
);

CREATE POLICY "Enable update for users based on user_id"
ON budget_codes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
ON budget_codes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);