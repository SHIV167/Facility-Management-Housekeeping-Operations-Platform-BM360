'use client'

import { useState } from 'react'
import { ZONE_NAMES } from '@/lib/zones'

export interface SupervisorFormData {
  fullName: string
  mobile: string
  employeeId: string
  designation: string
  allZoneAccess: boolean
  zone: string
  username: string
}

const DESIGNATIONS = [
  'Housekeeping Supervisor',
  'Supervisor',
  'Operation Head',
  'Agency Manager',
]

interface Props {
  open: boolean
  onClose: () => void
  agencyName?: string
  onSubmit: (data: SupervisorFormData) => void
}

export default function AddSupervisorModal({ open, onClose, agencyName = 'Soni Facility Management', onSubmit }: Props) {
  const [fullName, setFullName] = useState('')
  const [mobile, setMobile] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [designation, setDesignation] = useState('Housekeeping Supervisor')
  const [allZoneAccess, setAllZoneAccess] = useState(false)
  const [zone, setZone] = useState('')
  const [username, setUsername] = useState('')

  if (!open) return null

  const autoUsername = username || (fullName.trim() ? `@sup_${fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}_${Math.floor(100 + Math.random() * 900)}` : '')
  const canSubmit = fullName.trim() && mobile.trim() && (allZoneAccess || zone)

  const reset = () => { setFullName(''); setMobile(''); setEmployeeId(''); setDesignation('Housekeeping Supervisor'); setAllZoneAccess(false); setZone(''); setUsername('') }

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ fullName: fullName.trim(), mobile: mobile.trim(), employeeId: employeeId.trim(), designation, allZoneAccess, zone: allZoneAccess ? 'All Zones' : zone, username: autoUsername })
    reset()
    onClose()
  }

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-[#e5e7eb] text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/40 focus:border-[#1b8f84]'
  const labelCls = 'block text-[12px] font-semibold text-[#374151] mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0b1f2a]/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0b3c4a] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#7fd4c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white">Add Agency Supervisor</h2>
              <p className="text-[11px] text-[#9ec3d0]">Register supervisor with oversight, zone management &amp; task verification</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ec3d0] hover:bg-white/10 hover:text-white transition-colors">
            <svg className="w-4.5 h-4.5 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Partner Agency locked */}
          <div>
            <label className={labelCls}>Partner Agency <span className="text-[#dc2626]">*</span></label>
            <div className="h-10 px-3 rounded-lg bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#374151]">{agencyName}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#e6f7f4] text-[10px] font-semibold text-[#0f766e]">Auto-Selected &amp; Locked</span>
            </div>
            <p className="text-[11px] text-[#9ca3af] mt-1">Fixed to your contractor organization ({agencyName}). Staff will automatically be mapped here.</p>
          </div>

          {/* Name + Mobile */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name <span className="text-[#dc2626]">*</span></label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Sunil Sharma" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Mobile Number <span className="text-[#dc2626]">*</span></label>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9876543210" inputMode="numeric" className={inputCls} />
              <p className="text-[10.5px] text-[#9ca3af] mt-1">Used for passwordless OTP login</p>
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <label className={labelCls}>Agency Employee ID</label>
            <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. SFM-8041" className={inputCls} />
            <p className="text-[10.5px] text-[#9ca3af] mt-1">Contractor badge / staff ID</p>
          </div>

          {/* Designation */}
          <div>
            <label className={labelCls}>Designation &amp; Role <span className="text-[#dc2626]">*</span></label>
            <select value={designation} onChange={(e) => setDesignation(e.target.value)} className={inputCls}>
              {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <p className="text-[11px] text-[#0f766e] mt-1.5 bg-[#e6f7f4] rounded-lg px-2.5 py-2">
              Grants Agency Supervisor privileges to oversee duty zones and verify completed tasks.
            </p>
          </div>

          {/* All zone access */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={allZoneAccess} onChange={(e) => setAllZoneAccess(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-[#d1d5db] text-[#0e4c5e] focus:ring-[#1b8f84]" />
            <span>
              <span className="text-[13px] font-semibold text-[#111827]">All Zone Access (Entire Complex)</span>
              <span className="block text-[11px] text-[#6b7280] mt-0.5">Allow this staff member / supervisor to access complaints and activities across all campus zones.</span>
            </span>
          </label>

          {/* Zone */}
          {!allZoneAccess && (
            <div>
              <label className={labelCls}>Supervised Operational Zone <span className="text-[#dc2626]">*</span></label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputCls}>
                <option value="">Select zone...</option>
                {ZONE_NAMES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
              <p className="text-[11px] text-[#9ca3af] mt-1">Assigned campus location across Bharat Mandapam</p>
            </div>
          )}

          {/* Info note */}
          <div className="rounded-lg bg-[#f0fdfa] border border-[#b7e4d4] px-3 py-2.5">
            <p className="text-[11.5px] text-[#0f766e] leading-relaxed">This user will be registered as an <span className="font-semibold">Agency Supervisor</span>. They can log in via OTP, oversee activities in their zone, and verify completed tasks.</p>
          </div>

          {/* Username */}
          <div>
            <label className={labelCls}>Login Username</label>
            <div className="flex items-center">
              <span className="h-10 px-3 inline-flex items-center rounded-l-lg border border-r-0 border-[#e5e7eb] bg-[#f8fafc] text-[13px] text-[#6b7280]">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                placeholder={autoUsername.replace(/^@/, '') || 'auto-generated'}
                className="flex-1 h-10 px-3 rounded-r-lg border border-[#e5e7eb] text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/40 focus:border-[#1b8f84]"
              />
            </div>
            <p className="text-[10.5px] text-[#9ca3af] mt-1">Auto: {autoUsername || '@sup_name_xxx'} — leave blank to auto-generate a unique system username</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#eef1f4] shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Register Supervisor
          </button>
        </div>
      </div>
    </div>
  )
}
