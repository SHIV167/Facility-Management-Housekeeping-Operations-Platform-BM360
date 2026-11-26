'use client'

import { useState, useEffect } from 'react'
import type { AgencyRecord } from '@/lib/agencies'
import { SERVICE_OPTIONS } from '@/lib/agencies'
import { ZONE_NAMES } from '@/lib/zones'

interface StaffEntry { name: string; phone: string }

interface AgencyFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (agency: Omit<AgencyRecord, 'id'> & { id?: number; staff?: { name: string; role: string; designation: string; phone: string }[] }) => void
  agency: AgencyRecord | null
}

const inputCls = 'w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]'
const labelCls = 'block text-[12.5px] font-semibold text-[#374151] mb-1.5'

export default function AgencyFormModal({ open, onClose, onSave, agency }: AgencyFormModalProps) {
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [zones, setZones] = useState<string[]>([])
  const [services, setServices] = useState<string[]>([])
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')
  const [managerName, setManagerName] = useState('')
  const [managerPhone, setManagerPhone] = useState('')
  const [supervisors, setSupervisors] = useState<StaffEntry[]>([{ name: '', phone: '' }])
  const [fieldStaff, setFieldStaff] = useState<StaffEntry[]>([{ name: '', phone: '' }])
  const [errors, setErrors] = useState<string[]>([])
  const [takenPhones, setTakenPhones] = useState<Set<string>>(new Set())

  const phoneOk = (p: string) => p === '' || /^\d{10}$/.test(p)

  useEffect(() => {
    if (open) {
      setName(agency?.name ?? '')
      setContactPerson(agency?.contactPerson ?? '')
      setPhone(agency?.phone ?? '')
      setEmail(agency?.email ?? '')
      setAddress(agency?.address ?? '')
      setZones(agency?.zones ?? [])
      setServices(agency?.services ?? [])
      setStatus(agency?.status ?? 'Active')
      setManagerName('')
      setManagerPhone('')
      setSupervisors([{ name: '', phone: '' }])
      setFieldStaff([{ name: '', phone: '' }])
      setErrors([])
      setTakenPhones(new Set())
      fetch('/api/staff').then((r) => r.json()).then((d) => {
        if (d.ok && d.staff) {
          const set = new Set<string>()
          d.staff.forEach((s: any) => {
            if (agency?.id && s.agency_id === agency.id) return // own agency staff allowed
            const p = String(s.phone || '').replace(/\D/g, '')
            if (p.length >= 10) set.add(p.slice(-10))
          })
          setTakenPhones(set)
        }
      }).catch(() => {})
    }
  }, [open, agency])

  if (!open) return null

  const toggleService = (svc: string) => {
    setServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (managerName.trim() && !phoneOk(managerPhone)) errs.push('Manager phone must be 10 digits')
    if (managerPhone.trim() && !managerName.trim()) errs.push('Manager name required when phone is set')
    supervisors.forEach((s, i) => {
      if (s.name.trim() && !phoneOk(s.phone)) errs.push(`Supervisor ${i + 1} phone must be 10 digits`)
      if (!s.name.trim() && s.phone.trim()) errs.push(`Supervisor ${i + 1} name required`)
    })
    fieldStaff.forEach((s, i) => {
      if (s.name.trim() && !phoneOk(s.phone)) errs.push(`Field staff ${i + 1} phone must be 10 digits`)
      if (!s.name.trim() && s.phone.trim()) errs.push(`Field staff ${i + 1} name required`)
    })
    if (phone.trim() && !phoneOk(phone)) errs.push('Agency phone must be 10 digits')
    // Duplicate mobile checks — within form and against existing staff
    const seen = new Map<string, string>()
    const checkDup = (p: string, label: string) => {
      const digits = p.replace(/\D/g, '')
      if (!digits) return
      const key = digits.slice(-10)
      if (seen.has(key)) errs.push(`${label} mobile ${digits} is already used by ${seen.get(key)}`)
      else seen.set(key, label)
      if (takenPhones.has(key)) errs.push(`${label} mobile ${digits} is already registered to existing staff`)
    }
    checkDup(managerPhone, 'Manager')
    supervisors.forEach((s, i) => s.name.trim() && checkDup(s.phone, `Supervisor ${i + 1}`))
    fieldStaff.forEach((s, i) => s.name.trim() && checkDup(s.phone, `Field staff ${i + 1}`))
    if (errs.length) { setErrors(errs); return }
    setErrors([])

    const staff = [
      ...((managerName.trim() || managerPhone.trim()) ? [{ name: managerName.trim() || 'Agency Manager', role: 'Manager', designation: 'Agency Manager', phone: managerPhone.trim() }] : []),
      ...supervisors.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), role: 'Supervisor', designation: 'Housekeeping Supervisor', phone: s.phone.trim() })),
      ...fieldStaff.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), role: 'Field Staff', designation: 'Housekeeping Field Staff', phone: s.phone.trim() })),
    ]
    onSave({
      id: agency?.id,
      name: name.trim() || 'Unnamed Agency',
      contactPerson: contactPerson.trim() || '—',
      phone: phone.trim() || '—',
      email: email.trim() || '—',
      address: address.trim() || '—',
            zones: zones.length ? zones : [],
            employeeCount: agency?.employeeCount ?? 0,
            joinedDate: agency?.joinedDate ?? '—',
            services: services.length ? services : ['Housekeeping'],
      status,
      staff,
    })
    onClose()
  }

  const staffRow = (label: string, list: StaffEntry[], setList: (v: StaffEntry[]) => void, placeholder: string) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-2">
        {list.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={s.name} onChange={(e) => setList(list.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={placeholder} className={inputCls} />
            <input type="tel" value={s.phone} onChange={(e) => setList(list.map((x, j) => j === i ? { ...x, phone: e.target.value.replace(/\D/g, '').slice(0, 10) } : x))} placeholder="10-digit mobile" className={`${inputCls} w-36`} />
            {list.length > 1 && (
              <button type="button" onClick={() => setList(list.filter((_, j) => j !== i))} className="px-2 text-[#dc2626] hover:bg-[#fef2f2] rounded-lg text-[16px] font-bold">×</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setList([...list, { name: '', phone: '' }])} className="text-[12px] font-semibold text-[#0f766e] hover:underline">+ Add {label.toLowerCase()}</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0b3c4a] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <div>
              <h2 className="text-[15px] font-bold leading-tight">{agency ? 'Edit Agency' : 'Add New Agency'}</h2>
              <p className="text-[11px] text-[#9ec3d0] mt-0.5">Agency Management • BM360</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className={labelCls}>Agency Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Soni Facility Management" className={inputCls} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Contact Person</label>
              <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Full name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agency@example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Services</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((svc) => {
                const active = services.includes(svc)
                return (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => toggleService(svc)}
                    className={`px-3 py-1.5 rounded-full border text-[12.5px] font-semibold transition-colors ${
                      active
                        ? 'bg-[#e6f7f4] border-[#1b8f84] text-[#0f766e]'
                        : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#f8fafc]'
                    }`}
                  >
                    {svc}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Agency address" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Operational Zones</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {ZONE_NAMES.map((z) => {
                const active = zones.includes(z)
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZones((prev) => (active ? prev.filter((x) => x !== z) : [...prev, z]))}
                    className={`px-2.5 py-1 rounded-full border text-[11.5px] font-semibold transition-colors ${active ? 'bg-[#e6f7f4] border-[#1b8f84] text-[#0f766e]' : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#f8fafc]'}`}
                  >
                    {z}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="border-t border-[#eef1f4] pt-4">
            <p className="text-[12px] font-bold tracking-[0.05em] text-[#9ca3af] uppercase mb-3">Agency Team (login via mobile OTP)</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Manager Name</label>
                  <input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Agency manager" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Manager Mobile</label>
                  <input type="tel" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" className={inputCls} />
                </div>
              </div>
              {staffRow('Supervisors', supervisors, setSupervisors, 'Supervisor name')}
              {staffRow('Field Staff', fieldStaff, setFieldStaff, 'Staff name')}
            </div>
          </div>
          {errors.length > 0 && (
            <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2.5 space-y-1">
              {errors.map((er) => <p key={er} className="text-[12px] text-[#dc2626]">• {er}</p>)}
            </div>
          )}
          <div>
            <label className={labelCls}>Status</label>
            <div className="flex gap-2">
              {(['Active', 'Inactive'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 h-10 rounded-lg border text-[13px] font-semibold transition-colors ${
                    status === s
                      ? s === 'Active'
                        ? 'bg-[#e8f8ef] border-[#16a34a] text-[#16a34a]'
                        : 'bg-[#f3f4f6] border-[#9ca3af] text-[#6b7280]'
                      : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:bg-[#f8fafc]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="bg-[#f8fafc] border-t border-[#e8edf2] px-5 py-3.5 flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[13px] font-medium hover:bg-[#f3f5f8] transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-[#0e4c5e] hover:bg-[#0b3c4a] text-white rounded-lg text-[13px] font-semibold transition-colors">
            {agency ? 'Save Changes' : 'Add Agency'}
          </button>
        </div>
      </div>
    </div>
  )
}
