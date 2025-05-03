/*
  # Initial schema setup for budget management system
  
  1. Tables
    - budget_codes: Stores budget code information and quarterly withdrawal plans
    - activity_details: Stores activity details and their revisions
    - activity_logs: Tracks changes to activities
  
  2. Security
    - Enables RLS on all tables
    - Creates policies for authenticated users
  
  3. Features
    - Automatic timestamp updates
    - Realtime enabled for all tables
*/

-- Create budget_codes table
CREATE TABLE IF NOT EXISTS budget_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ro_code text NOT NULL,
    ro_title text NOT NULL,
    component_code text NOT NULL,
    component_title text NOT NULL,
    program text NOT NULL,
    quarterly_withdrawal jsonb DEFAULT '{"q1": 0, "q2": 0, "q3": 0, "q4": 0}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create activity_details table
CREATE TABLE IF NOT EXISTS activity_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_code_id uuid REFERENCES budget_codes(id) ON DELETE CASCADE,
    activity_code text NOT NULL,
    activity_title text NOT NULL,
    details text,
    unit text NOT NULL,
    volume_original numeric NOT NULL DEFAULT 0,
    volume_revised numeric NOT NULL DEFAULT 0,
    value_original numeric NOT NULL DEFAULT 0,
    value_revised numeric NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    activity_id uuid,
    budget_code_id uuid REFERENCES budget_codes(id) ON DELETE CASCADE,
    details jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE budget_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for budget_codes
CREATE POLICY "Enable read access for authenticated users" ON budget_codes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON budget_codes
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON budget_codes
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON budget_codes
    FOR DELETE TO authenticated USING (true);

-- Create policies for activity_details
CREATE POLICY "Enable read access for authenticated users" ON activity_details
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON activity_details
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON activity_details
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON activity_details
    FOR DELETE TO authenticated USING (true);

-- Create policies for activity_logs
CREATE POLICY "Enable read access for authenticated users" ON activity_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON activity_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_budget_codes_updated_at
    BEFORE UPDATE ON budget_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_details_updated_at
    BEFORE UPDATE ON activity_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE budget_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_details;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;