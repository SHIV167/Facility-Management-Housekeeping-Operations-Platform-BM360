-- Migration for existing bm360 databases (e.g. Render Postgres)
-- Run once: psql "$DATABASE_URL" -f db/migrations.sql

ALTER TABLE complaints ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS access_mobiles TEXT DEFAULT '';
ALTER TABLE itpo_officials ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS mobile TEXT DEFAULT '';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS agency TEXT DEFAULT '';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS accuracy TEXT DEFAULT '';
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS remarks TEXT DEFAULT '';
CREATE TABLE IF NOT EXISTS media_files (
  name TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  mime TEXT DEFAULT 'image/jpeg',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT '';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS username TEXT DEFAULT '';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS employee_id TEXT DEFAULT '';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS zones TEXT[] DEFAULT '{}';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS reporting_supervisor_id INT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS shift TEXT DEFAULT 'No Shift';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
-- Add priority and sla_minutes to complaints table for proper SLA tracking
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'MEDIUM';
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS sla_minutes INT DEFAULT 60;
-- Convert existing due_date from text to timestamptz if needed
ALTER TABLE complaints ALTER COLUMN due_date TYPE TIMESTAMPTZ USING NULLIF(due_date, '')::TIMESTAMPTZ;
ALTER TABLE complaints ALTER COLUMN due_date SET DEFAULT now();
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS agency_name TEXT DEFAULT '';
