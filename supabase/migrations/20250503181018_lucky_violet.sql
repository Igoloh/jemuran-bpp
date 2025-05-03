/*
  # Fix RLS policies for budget codes

  1. Changes
    - Drop existing RLS policies for budget_codes table
    - Create new RLS policies that don't require direct users table access
    - Use auth.uid() for user verification instead of joining with users table

  2. Security
    - Enable RLS on budget_codes table
    - Add policies for CRUD operations based on user ownership
    - Policies use auth.uid() directly for ownership checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for users based on role" ON budget_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable update for users based on role" ON budget_codes;

-- Create new policies that don't require users table access
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