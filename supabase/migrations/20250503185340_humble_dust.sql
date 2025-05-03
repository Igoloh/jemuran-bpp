/*
  # Add RLS policies for activity_details table

  1. Security Changes
    - Enable RLS on activity_details table
    - Add policy for authenticated users to insert based on budget code ownership
    - Add policy for authenticated users to update based on budget code ownership
    - Add policy for authenticated users to delete based on budget code ownership
    - Add policy for authenticated users to read all activity details
*/

-- Enable RLS
ALTER TABLE activity_details ENABLE ROW LEVEL SECURITY;

-- Policy for inserting activity details
CREATE POLICY "Users can insert activity details for owned budget codes"
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

-- Policy for updating activity details
CREATE POLICY "Users can update activity details for owned budget codes"
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

-- Policy for deleting activity details
CREATE POLICY "Users can delete activity details for owned budget codes"
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

-- Policy for reading activity details
CREATE POLICY "Users can read all activity details"
  ON activity_details
  FOR SELECT
  TO authenticated
  USING (true);