'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterComplaintPage() {
  const router = useRouter()
  const [allZones, setAllZones] = useState(true)
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('urgent')
  const [complaintDetails, setComplaintDetails] = useState('')
  const [selectedService, setSelectedService] = useState('housekeeping')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert('Complaint registered successfully!')
    router.push('/agency-dashboard')
  }

  const handleTakePhoto = () => {
    alert('Camera functionality - will be implemented with device camera API')
  }

  const handleAttachPhoto = () => {
    alert('Photo upload functionality')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/agency-dashboard')}
                className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold">Register Operational Complaint</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Section 1: Operational Scope */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                1. OPERATIONAL SCOPE
              </h2>

              {/* Service Catalog */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Catalog
                </label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none"
                  >
                    <option value="housekeeping">Housekeeping Operations</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                  </select>
                  <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute right-10 top-1/2 transform -translate-y-1/2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    FIXED
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      disabled={allZones}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white appearance-none ${
                        allZones ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose Zone... (89)</option>
                      <option value="hall1-5">Hall 1-5</option>
                      <option value="hall6-10">Hall 6-10</option>
                      <option value="hall11-14">Hall 11-14</option>
                      <option value="parking">Parking Area</option>
                      <option value="admin">Admin Building</option>
                    </select>
                    <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* All Zones Toggle */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAllZones(!allZones)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          allZones ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            allZones ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm font-medium text-gray-900">All Zones</span>
                    </div>
                  </div>

                  {allZones && (
                    <p className="text-sm text-gray-600">
                      All campus zones active (89) - select any zone to create complaint.
                    </p>
                  )}

                  {/* Sub-Area / Specific Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-Area / Specific Location
                    </label>
                    <input
                      type="text"
                  value={allZones ? '' : selectedZone}
                  disabled={allZones}
                  placeholder={allZones ? "Select a Target Location / Zone first.." : "Enter specific location"}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                    allZones ? 'border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-300'
                  }`}
                />
              </div>
                </div>
              </div>

              {/* Attach Photo (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Photo (Optional)
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAttachPhoto}
                    className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Attach Photo (Optional)
                  </button>
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Take Photo
                  </button>
                </div>
              </div>

              {/* Location and Direction */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location and Direction <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Enter complaint details or work instructions here...."
                  rows={4}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 resize-none"
                />
              </div>

              {/* Operational Priority */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Operational Priority
                </label>
                <div className="space-y-3">
                  {/* High Priority */}
                  <div
                    onClick={() => setSelectedPriority('high')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPriority === 'high'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPriority === 'high'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedPriority === 'high' && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">High Priority</p>
                          <p className="text-sm text-gray-500">P2-STANDARD</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Standard Shift Complaint</p>
                        <p className="text-lg font-bold text-gray-900">1 Hour</p>
                      </div>
                    </div>
                  </div>

                  {/* Urgent Priority */}
                  <div
                    onClick={() => setSelectedPriority('urgent')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPriority === 'urgent'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedPriority === 'urgent'
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedPriority === 'urgent' && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Urgent Priority</p>
                          <p className="text-sm text-gray-500">P1-IMMEDIATE</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Critical Escalation</p>
                        <p className="text-lg font-bold text-gray-900">30 Minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Response window is set automatically</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/agency-dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Register Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
