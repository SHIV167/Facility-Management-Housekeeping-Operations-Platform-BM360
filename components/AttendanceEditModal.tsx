'use client'

import { useState, useEffect } from 'react'

export interface AttendanceRow {
  id: number
  staffId: string
  staffName: string
  zone: string
  dateTime: string
  gps: string
  photoFile: string
  mobile?: string
  agency?: string
  accuracy?: string
  remarks?: string
  markedBy?: string
}

interface Props {
  open: boolean
  record: AttendanceRow | null
  onClose: () => void
  onSave: (id: number, data: { staffName: string; zone: string; dateTime: string; gps: string }) => void
}

export default function AttendanceEditModal({ open, record, onClose, onSave }: Props) {
  const [staffName, setStaffName] = useState('')
  const [zone, setZone] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [gps, setGps] = useState('')

  useEffect(() => {
    if (record) {
      setStaffName(record.staffName)
      setZone(record.zone)
      setDateTime(record.dateTime)
      setGps(record.gps)
    }
  }, [record])

  if (!open || !record) return null

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-[#e5e7eb] text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/40 focus:border-[#1b8f84]'
  const labelCls = 'block text-[12px] font-semibold text-[#374151] mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0b1f2a]/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 bg-[#0b3c4a] rounded-t-2xl">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Edit Attendance Record</h2>
            <p className="text-[11px] text-[#9ec3d0]">Record #{record.id} · Staff ID {record.staffId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ec3d0] hover:bg-white/10 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {record.photoFile && (
            <img src={`/api/photo?f=${encodeURIComponent(record.photoFile)}`} alt="Attendance" className="w-full h-36 object-cover rounded-xl border border-[#e8edf2]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <div>
            <label className={labelCls}>Staff Name</label>
            <input value={staffName} onChange={(e) => setStaffName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Zone</label>
            <input value={zone} onChange={(e) => setZone(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date & Time</label>
            <input value={dateTime} onChange={(e) => setDateTime(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>GPS Coordinates</label>
            <input value={gps} onChange={(e) => setGps(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#eef1f4]">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
          <button onClick={() => onSave(record.id, { staffName, zone, dateTime, gps })} className="px-4 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a]">Save Changes</button>
        </div>
      </div>
    </div>
  )
}
