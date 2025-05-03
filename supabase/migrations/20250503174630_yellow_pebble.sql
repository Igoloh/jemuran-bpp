/*
  # Fix activity_details RLS policies

  1. Changes
    - Drop and recreate the insert policy for activity_details table
    - Simplify the policy condition to ensure it works correctly with the budgetCodeId foreign key

  2. Security
    - Maintains RLS enabled on activity_details table
    - Updates insert policy to properly check budget code ownership
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Enable insert for users based on budget code ownership" ON activity_details;

-- Create new insert policy with corrected condition
CREATE POLICY "Enable insert for users based on budget code ownership"
ON activity_details
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE 
      budget_codes.id = "budgetCodeId"
      AND budget_codes.user_id = auth.uid()
  )
);