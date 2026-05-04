-- =============================================
-- Alpaca Audit CRM — Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'specialist')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Audits table
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT NOT NULL,
  language TEXT NOT NULL,
  keyword_languages TEXT[] NOT NULL DEFAULT '{}',
  target_market TEXT NOT NULL,
  importance TEXT NOT NULL CHECK (importance IN ('High', 'Medium', 'Low')),
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'In Progress', 'Review', 'In Correction', 'Completed')),
  assigned_specialist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  audit_result_url TEXT,
  audit_password TEXT,
  admin_comments TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Audits policies
CREATE POLICY "admins have full access to audits"
  ON audits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "specialists can view assigned audits"
  ON audits FOR SELECT
  USING (assigned_specialist_id = auth.uid());

CREATE POLICY "specialists can update assigned audits"
  ON audits FOR UPDATE
  USING (assigned_specialist_id = auth.uid())
  WITH CHECK (
    assigned_specialist_id = auth.uid()
    AND status IN ('In Progress', 'Review')
  );

-- =============================================
-- Trigger: auto-create profile on user signup
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'specialist')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS audits_status_idx ON audits(status);
CREATE INDEX IF NOT EXISTS audits_specialist_idx ON audits(assigned_specialist_id);
CREATE INDEX IF NOT EXISTS audits_deadline_idx ON audits(deadline);
CREATE INDEX IF NOT EXISTS audits_importance_idx ON audits(importance);
