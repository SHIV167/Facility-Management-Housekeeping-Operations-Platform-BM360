'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'

export interface StaffEditData {
  id: number
  name: string
  role: string
  designation: string
  phone: string
  zones: string[]
  shift: string
  status: string
  agencyId?: number | null
}

interface Props {
  open: boolean
  staff: StaffEditData | null
  zones?: string[]
  onClose: () => void
  onSaved: () => void
}

const inputCls = 'w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]'
const labelCls = 'block text-[12.5px] font-semibold text-[#374151] mb-1.5'

export default function StaffEditModal({ open, staff, zones = [], onClose, onSaved }: Props) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [role, setRole] = useState('Field Staff')
  const [designation, setDesignation] = useState('')
  const [phone, setPhone] = useState('')
  const [zoneSel, setZoneSel] = useState('')
  const [zonesSel, setZonesSel] = useState<string[]>([])
  const [shift, setShift] = useState('No Shift')
  const [status, setStatus] = useState('Active')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (staff) {
      setName(staff.name); setRole(staff.role); setDesignation(staff.designation || '')
      setPhone(staff.phone || ''); setZonesSel(staff.zones || []); setShift(staff.shift || 'No Shift'); setStatus(staff.status || 'Active')
    }
  }, [staff])

  if (!open || !staff) return null

  const toggleZone = (z: string) => setZonesSel((p) => p.includes(z) ? p.filter((x) => x !== z) : [...p, z])

  const save = async () => {
    if (!name.trim()) { toast('Name is required', 'error'); return }
    if (phone && !/^\d{10}$/.test(phone)) { toast('Mobile must be 10 digits', 'error'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: staff.id, name: name.trim(), role, designation, phone,
          employeeId: '', zones: zonesSel, shift, status,
          agencyId: staff.agencyId ?? null, username: '',
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.ok) { toast(d.error || 'Update failed', 'error'); return }
      toast('Staff updated', 'success'); onSaved(); onClose()
    } catch { toast('Update failed', 'error') } finally { setSaving(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e8edf2] overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
          <div className="bg-[#0b3c4a] px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-[16px] font-semibold text-white">Edit Staff Member</h2>
              <p className="text-[11.5px] text-[#9ec3d0] mt-0.5">{staff.name} • BM360</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Full Name *</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label className={labelCls}>Mobile</label><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Role</label>
                <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                  {['Supervisor', 'Field Staff', 'Manager'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Designation</label><input className={inputCls} value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Housekeeping Supervisor" /></div>
            </div>
            <div>
              <label className={labelCls}>Assigned Zones</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto border border-[#e5e7eb] rounded-lg p-2">
                {zones.map((z) => (
                  <button key={z} type="button" onClick={() => toggleZone(z)} className={`px-2 py-1 rounded-md text-[11.5px] font-medium ${zonesSel.includes(z) ? 'bg-[#0e4c5e] text-white' : 'bg-[#f3f5f8] text-[#374151] hover:bg-[#e8edf2]'}`}>{z}</button>
                ))}
                {!zones.length && <span className="text-[12px] text-[#9ca3af]">No zones available</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Shift</label>
                <select className={inputCls} value={shift} onChange={(e) => setShift(e.target.value)}>
                  {['No Shift', 'Morning', 'General', 'Evening', 'Night'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                  {['Active', 'Pending', 'Inactive'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#eef1f4] flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
            <button onClick={save} disabled={saving} className="px-5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
