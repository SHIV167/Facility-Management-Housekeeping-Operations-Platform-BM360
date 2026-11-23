'use client'

import { useState, useEffect } from 'react'
import { translations, Language } from '@/lib/translations'
import { logActivity } from '@/lib/activity'
import { useToast } from '@/components/Toast'

type Props = {
  open: boolean
  onClose: () => void
  editing?: any
  onSave?: (data: any) => void
}

const emptyForm = {
  name: '', username: '', employeeId: '', designation: '',
  phone: '', email: '', password: '', zones: '', status: 'Active',
}

export default function ItpoOfficialFormModal({ open, onClose, editing, onSave }: Props) {
  const { toast } = useToast()
  const [language, setLanguage] = useState<Language>('en')
  const t = translations[language]

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      setFormData(editing ? {
        name: editing.name || '', username: editing.username || '', employeeId: editing.employeeId || editing.employee_id || '',
        designation: editing.designation || '', phone: editing.phone || '', email: editing.email || '', password: '',
        zones: editing.zonesList ? editing.zonesList.join(', ') : (editing.zones || ''), status: editing.status || 'Active',
      } : emptyForm)
    }
  }, [open, editing])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast('Official name is required', 'error'); return }
    if (onSave) {
      onSave(formData)
    } else {
      logActivity('System Admin', 'Admin', 'ITPO Official Saved', `${formData.name || 'New official'} · ${formData.designation || ''}`.trim())
      toast(t.successfullySaved)
    }
    onClose()
  }

  const inputCls = "w-full h-10 px-3 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84] transition-colors"
  const labelCls = "block text-[12.5px] font-semibold text-[#374151] mb-1.5"

  return (
    <>
      {/* Popup Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-gray-900/20 border border-[#e8edf2] overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="bg-[#0b3c4a] px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 11-4 0 2 2 0 014 0zm6 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-[16px] font-semibold text-white leading-tight">{t.addNewItpoOfficial}</h1>
                <p className="text-[11.5px] text-[#9ec3d0] mt-0.5">{t.itpoOfficials} • BM360</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full bg-[#082f3b] p-0.5">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${language === 'en' ? 'bg-[#22a35a] text-white' : 'text-[#b7d0d8]'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${language === 'hi' ? 'bg-[#22a35a] text-white' : 'text-[#b7d0d8]'}`}
                >
                  हिंदी
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <form id="itpo-official-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto">
            <p className="text-[12.5px] text-[#6b7280] mb-5">{t.itpoOfficialsDescription}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t.name} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputCls}
                  placeholder={language === 'en' ? 'Enter full name' : 'पूरा नाम दर्ज करें'}
                />
              </div>

              <div>
                <label className={labelCls}>{t.username} *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={inputCls}
                  placeholder={language === 'en' ? '@username' : '@उपयोगकर्ता नाम'}
                />
              </div>

              <div>
                <label className={labelCls}>{t.employeeId} *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className={inputCls}
                  placeholder={language === 'en' ? 'Enter employee ID' : 'कर्मचारी आईडी दर्ज करें'}
                />
              </div>

              <div>
                <label className={labelCls}>{t.designation} *</label>
                <select
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className={inputCls}
                >
                  <option value="">{language === 'en' ? 'Select designation' : 'पद चुनें'}</option>
                  <option value="ED">ED</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Officer">Officer</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>{t.phone} *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputCls}
                  placeholder={language === 'en' ? 'Enter phone number' : 'फोन नंबर दर्ज करें'}
                />
              </div>

              <div>
                <label className={labelCls}>{t.email} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputCls}
                  placeholder={language === 'en' ? 'Enter email address' : 'ईमेल पता दर्ज करें'}
                />
              </div>

              <div>
                <label className={labelCls}>Password {editing ? '(leave blank to keep current)' : '*'}</label>
                <input
                  type="password"
                  required={!editing}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={inputCls}
                  placeholder={language === 'en' ? 'Login password' : 'लॉगिन पासवर्ड'}
                  minLength={6}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelCls}>{t.taggedOperationalZones} *</label>
                <select
                  required
                  value={formData.zones}
                  onChange={(e) => setFormData({ ...formData, zones: e.target.value })}
                  className={inputCls}
                >
                  <option value="">{t.selectZone}</option>
                  <option value="All Zones (Entire Complex)">{t.allZonesEntireComplex}</option>
                  <option value="Hall 1-5">Hall 1-5</option>
                  <option value="Hall 6-10">Hall 6-10</option>
                  <option value="Hall 11-14">Hall 11-14</option>
                  <option value="Parking Area">Parking Area</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>{t.status} *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={inputCls}
                >
                  <option value="Active">{t.active}</option>
                  <option value="Inactive">{t.inactive}</option>
                </select>
              </div>
            </div>
          </form>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#eef1f4] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f3f5f8] transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              form="itpo-official-form"
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] transition-colors shadow-sm"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
