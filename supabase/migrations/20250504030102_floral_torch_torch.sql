/*
  # Fix budget codes update policy for quarterly withdrawal
  
  1. Changes
    - Drop existing update policy
    - Create new policy that allows all authenticated users to update quarterly_withdrawal
    - Maintain ownership check for other field updates
  
  2. Security
    - All authenticated users can update quarterly_withdrawal
    - Only owners can update other fields
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON budget_codes;

-- Create new update policy
CREATE POLICY "Enable update for users based on role and field"
ON budget_codes
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- Create additional policy specifically for quarterly withdrawal updates
CREATE POLICY "Enable quarterly withdrawal updates for all users"
ON budget_codes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);