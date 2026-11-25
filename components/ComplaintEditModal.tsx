'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'

type Props = {
  open: boolean
  onClose: () => void
  complaint: any
  zones?: string[]
  agencies?: { id: number; name: string }[]
  onSaved?: () => void
}

const inputCls = 'w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84]'
const labelCls = 'block text-[12.5px] font-semibold text-[#374151] mb-1.5'

export default function ComplaintEditModal({ open, onClose, complaint, zones = [], agencies = [], onSaved }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [zone, setZone] = useState('')
  const [subArea, setSubArea] = useState('')
  const [description, setDescription] = useState('')
  const [service, setService] = useState('')
  const [status, setStatus] = useState('PENDING')
  const [dueDate, setDueDate] = useState('')
  const [agencyId, setAgencyId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (complaint) {
      setTitle(complaint.title || '')
      setZone(complaint.zone || complaint.location || '')
      setSubArea(complaint.subArea || '')
      setDescription(complaint.description || '')
      setService(complaint.service || complaint.serviceType || '')
      setStatus(complaint.status || 'PENDING')
      setDueDate(complaint.dueDate || '')
      setAgencyId(complaint.agencyId || complaint.agency_id || '')
    }
  }, [complaint])

  if (!open || !complaint) return null

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: complaint.dbId || complaint.id,
          edit: true,
          title, zone, subArea, description,
          complaintType: complaint.type || complaint.service || service,
          service, status, dueDate,
          agencyId: agencyId || null,
          agencyName: agencies.find((a) => a.id === agencyId)?.name || '',
          actor: 'Admin', role: 'Admin',
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.ok) { toast(d.error || 'Update failed', 'error'); return }
      toast('Complaint updated', 'success')
      onSaved?.()
      onClose()
    } catch { toast('Update failed', 'error') } finally { setSaving(false) }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#e8edf2] overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
          <div className="bg-[#0b3c4a] px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-[16px] font-semibold text-white">Edit Complaint</h2>
              <p className="text-[11.5px] text-[#9ec3d0] mt-0.5">{complaint.publicId || complaint.id} • BM360</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto space-y-4">
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Zone</label>
                <select className={inputCls} value={zone} onChange={(e) => setZone(e.target.value)}>
                  <option value="">Select zone</option>
                  {zones.map((z) => <option key={z} value={z}>{z}</option>)}
                  {!zones.includes(zone) && zone && <option value={zone}>{zone}</option>}
                </select>
              </div>
              <div>
                <label className={labelCls}>Sub-Area</label>
                <input className={inputCls} value={subArea} onChange={(e) => setSubArea(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Service</label>
              <input className={inputCls} value={service} onChange={(e) => setService(e.target.value)} placeholder="Housekeeping, Plumbing..." />
            </div>
            <div>
              <label className={labelCls}>Assigned Agency</label>
              <select className={inputCls} value={agencyId} onChange={(e) => setAgencyId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Unassigned / Select Agency...</option>
                {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Description / Work Details</label>
              <textarea className={`${inputCls} h-20 py-2 resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Status</label>
                <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                  {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'RESOLVED'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Due Date</label>
                <input className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="e.g. 24 Nov 2026, 12:49 pm" />
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
