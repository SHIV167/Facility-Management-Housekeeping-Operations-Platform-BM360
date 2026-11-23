'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { translations, Language } from '@/lib/translations'
import { logActivity } from '@/lib/activity'
import { useToast } from '@/components/Toast'

export default function ComplaintFormPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('en')
  const t = translations[language]

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    location: '',
    zone: '',
    category: '',
    agency: '',
    assignedTo: '',
    dueDate: '',
    status: 'PENDING'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    logActivity('System Admin', 'Admin', 'Complaint Saved', 'Master data form submitted')
    toast(language === 'en' ? t.successfullySaved : t.successfullySaved)
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-700">
              {t.bm360}
            </button>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{t.complaintRegisterTitle}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{t.addNewComplaint}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  language === 'hi' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.addNewComplaint}</h1>
          <p className="text-gray-600 mb-6">{t.complaintRegisterDescription}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.title} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'en' ? 'Enter complaint title' : 'शिकायत का शीर्षक दर्ज करें'}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.description} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.enterDescription}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.priority} *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">{t.high}</option>
                  <option value="URGENT">{t.urgent}</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.location} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'en' ? 'Enter location' : 'स्थान दर्ज करें'}
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.zone} *
                </label>
                <select
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectZone}</option>
                  <option value="Hall 1-5">Hall 1-5</option>
                  <option value="Hall 6-10">Hall 6-10</option>
                  <option value="Hall 11-14">Hall 11-14</option>
                  <option value="Parking Area">Parking Area</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.categoryName} *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectCategory}</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                </select>
              </div>

              {/* Agency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.agency} *
                </label>
                <select
                  required
                  value={formData.agency}
                  onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t.selectAgency}</option>
                  <option value="Soni Facility Management">Soni Facility Management</option>
                  <option value="BLUSPRING ENTERPRISES LTD.">BLUSPRING ENTERPRISES LTD.</option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.assignedTo} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'en' ? 'Assign to official' : 'अधिकारी को सौंपें'}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dueDate} *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.status} *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">{t.pendingStatus}</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">{t.resolvedStatus}</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {t.save}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
