/*
  # Fix RLS policies for budget_codes table

  1. Changes
    - Drop existing RLS policies for budget_codes table
    - Create new policies that properly handle user_id field
    - Ensure authenticated users can only:
      - Insert records with their own user_id
      - Read all records
      - Update/delete only their own records
  
  2. Security
    - Maintains RLS enabled on budget_codes table
    - Enforces user_id matching for insert/update/delete operations
    - Allows read access to all authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users with auto-set user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON budget_codes;

-- Create new policies
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