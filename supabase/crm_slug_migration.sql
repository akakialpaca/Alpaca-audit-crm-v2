-- Add slug column to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS companies_slug_idx ON companies(slug);
