/*
  # Fix Activity Details RLS Policies

  1. Changes
    - Drop existing RLS policies for activity_details table
    - Add new RLS policies that properly handle all operations based on budget code ownership
    
  2. Security
    - Enable RLS on activity_details table
    - Add policies for all CRUD operations
    - Policies check budget code ownership through user_id
*/

-- First remove existing policies
DROP POLICY IF EXISTS "Enable insert for users based on budget code ownership" ON activity_details;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON activity_details;
DROP POLICY IF EXISTS "Enable update for users based on budget code ownership" ON activity_details;
DROP POLICY IF EXISTS "Enable delete for users based on budget code ownership" ON activity_details;
DROP POLICY IF EXISTS "Users can delete activity details for owned budget codes" ON activity_details;
DROP POLICY IF EXISTS "Users can insert activity details for owned budget codes" ON activity_details;
DROP POLICY IF EXISTS "Users can read all activity details" ON activity_details;
DROP POLICY IF EXISTS "Users can update activity details for owned budget codes" ON activity_details;

-- Create new comprehensive policies
CREATE POLICY "Enable insert for authenticated users with budget code ownership"
ON activity_details
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE budget_codes.id = activity_details."budgetCodeId"
    AND budget_codes.user_id = auth.uid()
  )
);

CREATE POLICY "Enable select for authenticated users"
ON activity_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE budget_codes.id = activity_details."budgetCodeId"
    AND budget_codes.user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for authenticated users with budget code ownership"
ON activity_details
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE budget_codes.id = activity_details."budgetCodeId"
    AND budget_codes.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE budget_codes.id = activity_details."budgetCodeId"
    AND budget_codes.user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for authenticated users with budget code ownership"
ON activity_details
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE budget_codes.id = activity_details."budgetCodeId"
    AND budget_codes.user_id = auth.uid()
  )
);