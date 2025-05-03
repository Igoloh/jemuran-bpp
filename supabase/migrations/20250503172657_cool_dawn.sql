/*
  # Update RLS policies for shared data visibility
  
  1. Changes
    - Modify RLS policies to allow all authenticated users to view all data
    - Maintain write restrictions based on user ownership
    - Update activity_details and activity_logs policies
  
  2. Security
    - All authenticated users can read all data
    - Write operations still restricted to data owners
*/

-- Update activity_details policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON activity_details;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON activity_details;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON activity_details;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON activity_details;

CREATE POLICY "Enable read access for authenticated users"
ON activity_details FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for users based on budget code ownership"
ON activity_details FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE id = "budgetCodeId"
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable update for users based on budget code ownership"
ON activity_details FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE id = "budgetCodeId"
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE id = "budgetCodeId"
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for users based on budget code ownership"
ON activity_details FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE id = "budgetCodeId"
    AND user_id = auth.uid()
  )
);

-- Update activity_logs policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON activity_logs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON activity_logs;

CREATE POLICY "Enable read access for authenticated users"
ON activity_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for users based on budget code ownership"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM budget_codes
    WHERE id = budget_code_id
    AND user_id = auth.uid()
  )
);