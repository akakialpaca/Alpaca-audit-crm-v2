-- =============================================
-- CRM Migration — Run in Supabase SQL Editor
-- =============================================

-- 1. Companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  pipeline_stage TEXT NOT NULL DEFAULT 'Lead'
    CHECK (pipeline_stage IN ('Lead', 'Meeting', 'Proposal', 'Negotiation', 'Won', 'Lost')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 2. Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  position TEXT,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  linkedin_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 3. Contact activities table
CREATE TABLE IF NOT EXISTS contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 4. Add contact_id to audits
ALTER TABLE audits ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

-- Companies: admin only
CREATE POLICY "admins full access companies"
  ON companies FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Contacts: admin only
CREATE POLICY "admins full access contacts"
  ON contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Activities: admin only
CREATE POLICY "admins full access activities"
  ON contact_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS contacts_company_idx ON contacts(company_id);
CREATE INDEX IF NOT EXISTS activities_contact_idx ON contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS companies_stage_idx ON companies(pipeline_stage);
CREATE INDEX IF NOT EXISTS audits_contact_idx ON audits(contact_id);
