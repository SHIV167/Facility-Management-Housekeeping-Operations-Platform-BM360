'use client'

import { useState, useRef } from 'react'
import { ZONE_NAMES } from '@/lib/zones'

export interface ImportedEmployee {
  name: string
  role: string
  phone: string
  zone: string
  shift: string
}

interface ImportEmployeesModalProps {
  open: boolean
  onClose: () => void
  onImport: (employees: ImportedEmployee[]) => void
}

const inputCls = 'w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]'
const labelCls = 'block text-[12.5px] font-semibold text-[#374151] mb-1.5'
const SHIFTS = ['Morning (6AM - 2PM)', 'Evening (2PM - 10PM)', 'Night (10PM - 6AM)']
const ROLES = ['Supervisor', 'Cleaner', 'Electrician', 'Plumber', 'HVAC Technician', 'Security']

export default function ImportEmployeesModal({ open, onClose, onImport }: ImportEmployeesModalProps) {
  const [tab, setTab] = useState<'csv' | 'manual'>('csv')
  const [parsed, setParsed] = useState<ImportedEmployee[]>([])
  const [parseError, setParseError] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState(ROLES[0])
  const [phone, setPhone] = useState('')
  const [zone, setZone] = useState(ZONE_NAMES[0])
  const [shift, setShift] = useState(SHIFTS[0])
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const parseCsv = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    const rows: ImportedEmployee[] = []
    const errors: string[] = []
    lines.forEach((line, idx) => {
      // skip header row
      if (idx === 0 && /name/i.test(line) && /role|phone|zone/i.test(line)) return
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
      if (cols.length < 4 || !cols[0]) { errors.push(`Row ${idx + 1}: incomplete`); return }
      rows.push({
        name: cols[0],
        role: cols[1] || 'Cleaner',
        phone: cols[2] || '—',
        zone: cols[3] || ZONE_NAMES[0],
        shift: cols[4] || SHIFTS[0],
      })
    })
    setParsed(rows)
    setParseError(errors.length ? `${errors.length} row(s) skipped — need at least name, role, phone, zone` : '')
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => parseCsv(String(reader.result ?? ''))
    reader.readAsText(file)
  }

  const handleManual = () => {
    if (!name.trim()) return
    onImport([{ name: name.trim(), role, phone: phone.trim() || '—', zone, shift }])
    setName(''); setPhone('')
    onClose()
  }

  const handleCsvImport = () => {
    if (!parsed.length) return
    onImport(parsed)
    setParsed([])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#0b3c4a] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </span>
            <div>
              <h2 className="text-[15px] font-bold leading-tight">Import Employees</h2>
              <p className="text-[11px] text-[#9ec3d0] mt-0.5">Agency Management • BM360</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex gap-1 bg-[#f1f5f9] rounded-lg p-1">
            {(['csv', 'manual'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors ${tab === t ? 'bg-white text-[#0b3c4a] shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'}`}>
                {t === 'csv' ? 'CSV / Bulk Import' : 'Add Single Employee'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'csv' ? (
            <div className="space-y-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#cbd5e1] hover:border-[#1b8f84] rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <svg className="w-8 h-8 text-[#9ca3af] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-[13px] font-medium text-[#374151]">Click to upload CSV file</p>
                <p className="text-[11.5px] text-[#9ca3af] mt-1">Columns: name, role, phone, zone, shift</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
              </div>
              {parsed.length > 0 && (
                <div className="bg-[#e8f8ef] border border-[#b7e4c7] rounded-xl p-3">
                  <p className="text-[12.5px] font-semibold text-[#15803d]">{parsed.length} employee(s) ready to import</p>
                  <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                    {parsed.slice(0, 20).map((e, i) => (
                      <p key={i} className="text-[12px] text-[#374151]">• {e.name} — {e.role} ({e.zone})</p>
                    ))}
                    {parsed.length > 20 && <p className="text-[11px] text-[#6b7280]">…and {parsed.length - 20} more</p>}
                  </div>
                </div>
              )}
              {parseError && <p className="text-[12px] text-[#dc2626]">{parseError}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ramesh Singh" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Zone</label>
                  <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputCls}>
                    {ZONE_NAMES.map((z) => <option key={z}>{z}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Shift</label>
                  <select value={shift} onChange={(e) => setShift(e.target.value)} className={inputCls}>
                    {SHIFTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] border-t border-[#e8edf2] px-5 py-3.5 flex items-center justify-between shrink-0">
          <p className="text-[12px] text-[#9ca3af]">BM360 • Bharat Mandapam</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-[#e5e7eb] bg-white text-[#374151] rounded-lg text-[13px] font-medium hover:bg-[#f3f5f8] transition-colors">Cancel</button>
            {tab === 'csv' ? (
              <button onClick={handleCsvImport} disabled={!parsed.length} className="px-4 py-2 bg-[#0e4c5e] hover:bg-[#0b3c4a] disabled:bg-[#9ca3af] disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold transition-colors">
                Import {parsed.length || ''} Employees
              </button>
            ) : (
              <button onClick={handleManual} disabled={!name.trim()} className="px-4 py-2 bg-[#0e4c5e] hover:bg-[#0b3c4a] disabled:bg-[#9ca3af] disabled:cursor-not-allowed text-white rounded-lg text-[13px] font-semibold transition-colors">
                Add Employee
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}