-- BM360 Bharat Mandapam Operations Portal — PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS zones (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  area TEXT DEFAULT '',
  manager TEXT DEFAULT 'Unassigned',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  access_mobiles TEXT DEFAULT '',           -- comma-separated, All Campus only
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  services TEXT[] DEFAULT '{}',
  zones TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  employee_count INT DEFAULT 0,
  joined_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itpo_officials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT,
  employee_id TEXT,
  designation TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  zones TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  agency_id INT REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Field Staff' CHECK (role IN ('Manager','Supervisor','Field Staff')),
  designation TEXT DEFAULT '',
  username TEXT,
  phone TEXT DEFAULT '',
  employee_id TEXT,
  zones TEXT[] DEFAULT '{}',
  reporting_supervisor_id INT REFERENCES staff(id) ON DELETE SET NULL,
  shift TEXT DEFAULT 'No Shift',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Active','Pending','Inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_agency ON staff(agency_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  public_id TEXT UNIQUE,                    -- CMP-0001 for citizen complaints
  title TEXT DEFAULT '',
  complaint_type TEXT DEFAULT 'General',
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','RESOLVED')),
  zone TEXT DEFAULT '',
  sub_area TEXT DEFAULT '',
  description TEXT DEFAULT '',
  service TEXT DEFAULT '',
  agency_id INT REFERENCES agencies(id) ON DELETE SET NULL,
  assigned_official_id INT REFERENCES itpo_officials(id) ON DELETE SET NULL,
  reported_by TEXT DEFAULT 'Citizen',
  reporter_name TEXT DEFAULT '',
  reporter_mobile TEXT DEFAULT '',
  due_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  photo_url TEXT,
  photos JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_zone ON complaints(zone);

CREATE TABLE IF NOT EXISTS complaint_updates (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  role TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cu_complaint ON complaint_updates(complaint_id);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  zone TEXT DEFAULT '',
  marked_at TIMESTAMPTZ DEFAULT now(),
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  photo_url TEXT,
  marked_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(marked_at);

CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'complaint' CHECK (type IN ('complaint','custom')),
  zone TEXT,
  url TEXT,
  fg_color TEXT DEFAULT '#0b3c4a',
  bg_color TEXT DEFAULT '#ffffff',
  size INT DEFAULT 220,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  role TEXT DEFAULT 'System',
  action TEXT NOT NULL,
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);

-- ============ SEED DATA ============
INSERT INTO agencies (name, contact_person, phone, email, address, services, zones, status, employee_count, joined_date) VALUES
('Soni Facility Management', 'Ajender Dhaka', '8585981877', 'ops@sonifacility.in', 'Bharat Mandapam Campus, New Delhi', '{Housekeeping,Electrical,Plumbing,HVAC}', '{Admin Building,Hall 1,Hall 2-4,Hall 5,Hall 6,Hall 2-5 First Floors}', 'Active', 80, '01 Jan 2025'),
('BLUSPRING ENTERPRISES LTD.', 'Rakesh Meena', '9812345678', 'ops@bluspring.in', 'Palika Bazar, New Delhi', '{Housekeeping,Plumbing}', '{Hall 11,Hall 12,Hall 12 A,Hall 14,Grand Canopy}', 'Active', 45, '15 Mar 2025')
ON CONFLICT DO NOTHING;

INSERT INTO staff (agency_id, name, role, designation, username, phone, employee_id, zones, shift, status)
SELECT a.id, v.name, v.role, v.designation, v.username, v.phone, v.emp_id, v.zones::text[], v.shift, v.status
FROM agencies a,
(VALUES
 ('Soni Facility Management','Ajender Dhaka','Supervisor','Operation Head','@soni_ajenderdhaka','8585981877','SFM-OH-01','{All Zones}','General','Active'),
 ('Soni Facility Management','Abhishek','Supervisor','Housekeeping Supervisor','@sup_abhishek_927','9953655078','SFM-5078','{Admin Building}','No Shift','Active'),
 ('Soni Facility Management','Ajay','Supervisor','Housekeeping Supervisor','@sup_ajay_583','9572645765','SFM-5765','{Hall 2-4,Admin Building}','No Shift','Active'),
 ('Soni Facility Management','AKASH KUMAR','Field Staff','Housekeeping Field Staff','@hk_akashkumar_140','8178229001','s-8178229001','{Admin Building}','No Shift','Active'),
 ('Soni Facility Management','Arti','Supervisor','Supervisor','@soni_arti','7042963256','SFM-SUP-03','{Admin Building}','No Shift','Active'),
 ('BLUSPRING ENTERPRISES LTD.','Vikas Rathore','Supervisor','Operations Supervisor','@sup_vikas_221','9000000001','BLU-SUP-01','{Hall 11,Hall 12}','Morning','Active'),
 ('BLUSPRING ENTERPRISES LTD.','Sunil Yadav','Field Staff','Housekeeping Field Staff','@hk_sunily_114','9000000002','BLU-FS-01','{Hall 14}','Morning','Pending')
) AS v(agency,v_name,v_role,v_designation,v_username,v_phone,v_emp_id,v_zones,v_shift,v_status)
JOIN agencies a ON a.name = v.agency
WHERE NOT EXISTS (SELECT 1 FROM staff s WHERE s.username = v.v_username);

INSERT INTO itpo_officials (name, username, employee_id, designation, phone, email, zones, status) VALUES
('Mrs. Sunita Sharma','@itpo_sunita','ITPO-001','ITPO Officer','9811111111','sunita@bm360.in','{Hall 1-5,Admin Building}','Active'),
('Mr. Premjit Lal','@itpo_prem','ITPO-002','Senior ITPO Officer','9822222222','prem@bm360.in','{Hall 6-10,Hall 11-14}','Active')
ON CONFLICT DO NOTHING;
