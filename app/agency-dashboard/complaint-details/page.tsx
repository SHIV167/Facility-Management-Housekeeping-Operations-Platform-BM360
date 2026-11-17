'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ComplaintDetailsPage() {
  const router = useRouter()
  const [selectedPhoto, setSelectedPhoto] = useState('itpo')
  const [zoomedImage, setZoomedImage] = useState(false)

  const complaint = {
    id: 24,
    priority: 'HIGH',
    title: 'Housekeeping Work During Fair',
    status: 'Completed',
    priorityLabel: 'Urgent Priority (30 Minutes SLA)',
    instructions: 'Type, not cleaned. Room number 11.',
    agency: 'BLUSPRING ENTERPRISES LTD.',
    reportedBy: 'Brij Lal',
    reportedByRole: 'ITPO Official',
    serviceClassification: 'Housekeeping Operations',
    facility: 'Bharat Mandapam',
    building: 'Admin Building',
    subArea: '1st Floor',
    activityCatalog: 'Housekeeping Work During Fair',
    createdAt: '14 Nov 2026, 01:55 pm',
    targetDueTime: '14 Nov 2026, 02:55 pm',
    resolvedAt: '14 Nov 2026, 02:37 pm',
    photos: [
      {
        id: 1,
        type: 'ITPO',
        label: 'ITPO Official (Before)',
        filename: 'complaint_1794644710495.jpg',
        uploadedBy: 'Brij Lal (ITPO Official)',
        uploadedAt: '14 Nov 2026, 01:55 pm',
        size: '24.7 KB'
      },
      {
        id: 2,
        type: 'AGENCY',
        label: 'Agency (After)',
        filename: 'complaint_1794644720500.jpg',
        uploadedBy: 'Field Staff',
        uploadedAt: '14 Nov 2026, 02:30 pm',
        size: '28.3 KB'
      }
    ],
    history: [
      {
        id: 1,
        action: 'Complaint Created',
        timestamp: '14 Nov 2028, 01:55 pm',
        by: 'Brij Lal (ITPO)',
        status: 'green'
      },
      {
        id: 2,
        action: 'Work Completed',
        timestamp: '14 Nov 2028, 02:37 pm',
        by: 'Field Staff',
        status: 'green'
      }
    ]
  }

  const handleClose = () => {
    router.push('/agency-dashboard')
  }

  const handleDownloadPhoto = () => {
    alert('Photo download functionality')
  }

  const handleUploadPhoto = () => {
    alert('Photo upload functionality')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">OPERATIONAL WORK DETAILS</h1>
            <span className="text-lg">#{complaint.id}</span>
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded">
              {complaint.priority}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{complaint.title}</h2>
          </div>

          {/* Current Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-lg font-semibold text-green-800">WORK FULLY COMPLETED</span>
            </div>
            <div className="mt-2 ml-6">
              <span className="text-sm text-gray-600">Current Workflow State: </span>
              <span className="text-sm font-medium text-green-700">Completed</span>
            </div>
          </div>

          {/* Operational Priority & SLA */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" />
              </svg>
              <span className="text-lg font-semibold text-orange-800">{complaint.priorityLabel}</span>
            </div>
          </div>

          {/* Work Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">WORK INSTRUCTIONS & DETAILS</h3>
            <p className="text-gray-900">{complaint.instructions}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">ASSIGNED AGENCY</h3>
              <p className="text-gray-900 font-medium">{complaint.agency}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">REPORTED / CREATED BY</h3>
              <p className="text-gray-900 font-medium">{complaint.reportedBy}</p>
              <p className="text-sm text-gray-500">{complaint.reportedByRole}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">SERVICE CLASSIFICATION</h3>
              <p className="text-gray-900 font-medium">{complaint.serviceClassification}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">FACILITY / CAMPUS</h3>
              <p className="text-gray-900 font-medium">{complaint.facility}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">OPERATIONAL LOCATION</h3>
              <p className="text-gray-900 font-medium">{complaint.building}</p>
              <p className="text-sm text-gray-500">Sub Area: {complaint.subArea}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">ACTIVITY CATALOG ITEM</h3>
              <p className="text-gray-900 font-medium">{complaint.activityCatalog}</p>
            </div>
          </div>

          {/* Operational Schedule & SLA Targets */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 uppercase mb-4">OPERATIONAL SCHEDULE & SLA TARGETS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">CREATED AT</p>
                <p className="text-gray-900 font-medium">{complaint.createdAt}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">TARGET DUE TIME</p>
                <p className="text-gray-900 font-medium">{complaint.targetDueTime}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">RESOLVED AT</p>
                <p className="text-gray-900 font-medium">{complaint.resolvedAt}</p>
              </div>
            </div>
          </div>

          {/* Site Evidence Photos */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">SITE EVIDENCE PHOTOS ({complaint.photos.length} photos)</h3>
            
            {/* Main Photo Viewer */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedPhoto === 'itpo' ? complaint.photos[0].label : complaint.photos[1].label}
                  </span>
                  <span className="text-sm text-gray-500">1/2</span>
                </div>
                <button
                  onClick={() => setZoomedImage(!zoomedImage)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {zoomedImage ? 'Close Zoom' : 'Click to zoom'}
                </button>
              </div>
              
              <div className={`${zoomedImage ? 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center' : 'relative'} mb-4`}>
                <div className={`${zoomedImage ? 'max-w-4xl' : 'w-full'} bg-gray-200 rounded-lg overflow-hidden`}>
                  <div className="aspect-video flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {zoomedImage && (
                  <button
                    onClick={() => setZoomedImage(false)}
                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500">
                  Filename: {selectedPhoto === 'itpo' ? complaint.photos[0].filename : complaint.photos[1].filename}
                </p>
                <p className="text-xs text-gray-500">
                  Uploaded by {selectedPhoto === 'itpo' ? complaint.photos[0].uploadedBy : complaint.photos[1].uploadedBy} {selectedPhoto === 'itpo' ? complaint.photos[0].uploadedAt : complaint.photos[1].uploadedAt}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {selectedPhoto === 'itpo' ? complaint.photos[0].size : complaint.photos[1].size}
                </p>
              </div>
            </div>

            {/* Photo Previews */}
            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm font-medium text-gray-700">SELECT PHOTO PREVIEW</p>
              <div className="flex gap-2">
                {complaint.photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo.type.toLowerCase())}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedPhoto === photo.type.toLowerCase()
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {photo.type}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUploadPhoto}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Additional Photo
            </button>
          </div>

          {/* Execution History & Audit Trail */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">EXECUTION HISTORY & AUDIT TRAIL</h3>
            <div className="space-y-3">
              {complaint.history.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${item.status === 'green' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{item.action}</span>
                      {item.by && ` - by ${item.by}`}
                    </p>
                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Tenant: Bharat Mandapam 360</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPhoto}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Download Photo
            </button>
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
