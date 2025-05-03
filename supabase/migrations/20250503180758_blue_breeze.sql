/*
  # Update policies for budget management system
  
  1. Changes
    - Update policies to allow both admin and regular users to perform operations
    - Admin (ppk.8104) can perform all operations
    - Regular users can perform operations on their own data
  
  2. Security
    - Maintains RLS security while allowing proper access
    - Ensures data integrity and proper authorization
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON budget_codes;
DROP POLICY IF EXISTS "Enable insert for authenticated users with user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON budget_codes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON budget_codes;

-- Create new policies that check for admin role or user ownership
CREATE POLICY "Enable read access for authenticated users"
ON budget_codes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON budget_codes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE 'ppk.8104@%'
  )
);

CREATE POLICY "Enable update for users based on role"
ON budget_codes FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE 'ppk.8104@%'
  )
)
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE 'ppk.8104@%'
  )
);

CREATE POLICY "Enable delete for users based on role"
ON budget_codes FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE 'ppk.8104@%'
  )
);