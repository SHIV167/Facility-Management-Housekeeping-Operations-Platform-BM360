'use client'

import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function RegisterComplaintModal({ open, onClose, onSuccess }: Props) {
  const [allZones, setAllZones] = useState(true)
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('urgent')
  const [complaintDetails, setComplaintDetails] = useState('')
  const [selectedService, setSelectedService] = useState('housekeeping')

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Complaint registered successfully!')
    onClose()
    onSuccess?.()
  }

  const handleTakePhoto = () => {
    alert('Camera functionality - will be implemented with device camera API')
  }

  const handleAttachPhoto = () => {
    alert('Photo upload functionality')
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-[16px] font-semibold text-white leading-tight">Register Operational Complaint</h1>
                <p className="text-[11.5px] text-[#9ec3d0] mt-0.5">Complaint Register • BM360</p>
              </div>
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

          {/* Modal Body */}
          <form id="register-complaint-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto">
            {/* Section 1: Operational Scope */}
            <div>
              <h2 className="text-[13px] font-semibold text-[#111827] mb-4 pb-2 border-b border-[#eef1f4] tracking-wide">
                1. OPERATIONAL SCOPE
              </h2>

              {/* Service Catalog */}
              <div className="mb-4">
                <label className={labelCls}>Service Catalog</label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className={`${inputCls} appearance-none pr-16`}
                  >
                    <option value="housekeeping">Housekeeping Operations</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                  </select>
                  <svg className="w-4 h-4 text-[#9ca3af] absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#e6f7f4] text-[#0f766e] text-[10px] font-semibold rounded">
                    FIXED
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className={labelCls}>Location</label>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      disabled={allZones}
                      className={`${inputCls} appearance-none ${allZones ? 'bg-[#f8fafc] text-[#9ca3af] cursor-not-allowed' : ''}`}
                    >
                      <option value="">Choose Zone... (89)</option>
                      <option value="hall1-5">Hall 1-5</option>
                      <option value="hall6-10">Hall 6-10</option>
                      <option value="hall11-14">Hall 11-14</option>
                      <option value="parking">Parking Area</option>
                      <option value="admin">Admin Building</option>
                    </select>
                    <svg className="w-4 h-4 text-[#9ca3af] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* All Zones Toggle */}
                  <div className="flex items-center justify-between p-3 bg-[#e6f7f4] border border-[#bfe8e0] rounded-lg">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAllZones(!allZones)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          allZones ? 'bg-[#1b8f84]' : 'bg-[#cbd5e1]'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            allZones ? 'translate-x-[18px]' : 'translate-x-[3px]'
                          }`}
                        />
                      </button>
                      <span className="text-[13px] font-medium text-[#111827]">All Zones</span>
                    </div>
                    {allZones && (
                      <span className="text-[11px] text-[#0f766e] font-medium">89 zones active</span>
                    )}
                  </div>

                  {allZones && (
                    <p className="text-[12px] text-[#6b7280]">
                      All campus zones active (89) - select any zone to create complaint.
                    </p>
                  )}

                  {/* Sub-Area / Specific Location */}
                  <div>
                    <label className={labelCls}>Sub-Area / Specific Location</label>
                    <input
                      type="text"
                      value={allZones ? '' : selectedZone}
                      disabled={allZones}
                      placeholder={allZones ? "Select a Target Location / Zone first.." : "Enter specific location"}
                      className={`${inputCls} ${allZones ? 'bg-[#f8fafc] text-[#9ca3af] cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              </div>

              {/* Attach Photo (Optional) */}
              <div className="mb-4">
                <label className={labelCls}>Attach Photo (Optional)</label>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleAttachPhoto}
                    className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Attach Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Take Photo
                  </button>
                </div>
              </div>

              {/* Location and Direction */}
              <div className="mb-4">
                <label className={labelCls}>
                  Location and Direction <span className="text-[#e11d48]">*</span>
                </label>
                <textarea
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Enter complaint details or work instructions here...."
                  rows={4}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-[#e5e7eb] rounded-lg text-[13px] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1b8f84]/20 focus:border-[#1b8f84] transition-colors resize-none"
                />
              </div>

              {/* Operational Priority */}
              <div className="mb-2">
                <label className={`${labelCls} mb-2.5`}>Operational Priority</label>
                <div className="space-y-2.5">
                  {/* High Priority */}
                  <div
                    onClick={() => setSelectedPriority('high')}
                    className={`p-3.5 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPriority === 'high'
                        ? 'border-[#f59e0b] bg-[#fffbeb]'
                        : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPriority === 'high'
                            ? 'border-[#f59e0b] bg-[#f59e0b]'
                            : 'border-[#cbd5e1]'
                        }`}>
                          {selectedPriority === 'high' && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#111827]">High Priority</p>
                          <p className="text-[11.5px] text-[#9ca3af]">P2-STANDARD</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[#6b7280]">Standard Shift Complaint</p>
                        <p className="text-[16px] font-bold text-[#111827]">1 Hour</p>
                      </div>
                    </div>
                  </div>

                  {/* Urgent Priority */}
                  <div
                    onClick={() => setSelectedPriority('urgent')}
                    className={`p-3.5 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPriority === 'urgent'
                        ? 'border-[#f59e0b] bg-[#fffbeb]'
                        : 'border-[#e5e7eb] bg-white hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPriority === 'urgent'
                            ? 'border-[#f59e0b] bg-[#f59e0b]'
                            : 'border-[#cbd5e1]'
                        }`}>
                          {selectedPriority === 'urgent' && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold text-[#111827]">Urgent Priority</p>
                          <p className="text-[11.5px] text-[#9ca3af]">P1-IMMEDIATE</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[#6b7280]">Critical Escalation</p>
                        <p className="text-[16px] font-bold text-[#111827]">30 Minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11.5px] text-[#9ca3af] mt-2">Response window is set automatically</p>
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
              Cancel
            </button>
            <button
              type="submit"
              form="register-complaint-form"
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#0e4c5e] rounded-lg hover:bg-[#0b3c4a] transition-colors shadow-sm"
            >
              Register Complaint
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
