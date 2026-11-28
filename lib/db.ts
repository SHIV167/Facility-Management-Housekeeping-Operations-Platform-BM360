import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'bm360',
  max: 10,
})

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params)
  return res.rows as T[]
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

// Legacy DBs have CHECK (role IN ('Supervisor','Field Staff')) which rejects 'Manager'.
// Drop any CHECK constraint on staff.role once per process so manager rows can be written.
let staffRoleConstraintDropped = false
export async function ensureStaffRoleConstraint() {
  if (staffRoleConstraintDropped) return
  try {
    const cons = await query<{ conname: string; def: string }>(
      `SELECT c.conname, pg_get_constraintdef(c.oid) AS def
       FROM pg_constraint c
       WHERE c.conrelid = 'staff'::regclass AND c.contype = 'c'`
    )
    for (const con of cons) {
      if (/\brole\b/i.test(con.def || '')) {
        await query(`ALTER TABLE staff DROP CONSTRAINT IF EXISTS "${con.conname}"`)
      }
    }
    staffRoleConstraintDropped = true
  } catch {}
}

export default pool
