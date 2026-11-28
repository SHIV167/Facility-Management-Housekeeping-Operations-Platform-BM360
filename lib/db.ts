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
// Drop it once per process so manager staff rows can be created/updated.
let staffRoleConstraintDropped = false
export async function ensureStaffRoleConstraint() {
  if (staffRoleConstraintDropped) return
  try {
    await query(`ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check`)
    staffRoleConstraintDropped = true
  } catch {}
}

export default pool
