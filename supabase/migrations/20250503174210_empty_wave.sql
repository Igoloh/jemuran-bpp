-- Update activity_details policies to restrict updates based on role
DROP POLICY IF EXISTS "Enable update for users based on budget code ownership" ON activity_details;

CREATE POLICY "Enable update for users based on budget code ownership and role"
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
  (
    -- Admin can update all fields
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email LIKE 'ppk.8104@%'
    )
  ) OR (
    -- Regular users can only update valueRevised
    (
      SELECT COUNT(*)
      FROM jsonb_each(to_jsonb(NEW) - to_jsonb(OLD))
    ) = 1
    AND (to_jsonb(NEW) - to_jsonb(OLD)) ? 'valueRevised'
  )
);