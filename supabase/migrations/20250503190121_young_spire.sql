/*
  # Update RLS policies for activity details
  
  1. Changes
    - Drop existing restrictive policies
    - Create new policies that allow all authenticated users to perform all operations
    - Maintain basic authentication check
  
  2. Security
    - Still requires authentication
    - Allows all authenticated users to perform all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users with budget code ownership" ON activity_details;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON activity_details;
DROP POLICY IF EXISTS "Enable update for authenticated users with budget code ownership" ON activity_details;
DROP POLICY IF EXISTS "Enable delete for authenticated users with budget code ownership" ON activity_details;

-- Create new permissive policies
CREATE POLICY "Enable insert for all authenticated users"
ON activity_details
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable select for all authenticated users"
ON activity_details
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable update for all authenticated users"
ON activity_details
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all authenticated users"
ON activity_details
FOR DELETE
TO authenticated
USING (true);