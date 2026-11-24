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
