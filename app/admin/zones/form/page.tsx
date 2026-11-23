'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { translations, Language } from '@/lib/translations'
import { logActivity } from '@/lib/activity'
import { useToast } from '@/components/Toast'

export default function ZoneFormPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('en')
  const t = translations[language]

  const [formData, setFormData] = useState({
    name: '',
    area: '',
    manager: '',
    status: 'Active'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    logActivity('System Admin', 'Admin', 'Zone Saved', 'Master data form submitted')
    toast(language === 'en' ? t.successfullySaved : t.successfullySaved)
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-700">
              {t.bm360}
            </button>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{t.zones}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{t.addNewZone}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>EN</button>
              <button onClick={() => setLanguage('hi')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${language === 'hi' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>हिन्दी</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.addNewZone}</h1>
          <p className="text-gray-600 mb-6">{t.zonesDescription}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.zoneName} *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={language === 'en' ? 'Enter zone name' : 'क्षेत्र का नाम दर्ज करें'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.area} *</label>
                <input type="text" required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={t.enterArea} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.manager} *</label>
                <input type="text" required value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={language === 'en' ? 'Enter manager name' : 'प्रबंधक का नाम दर्ज करें'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.status} *</label>
                <select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Active">{t.active}</option>
                  <option value="Inactive">{t.inactive}</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">{t.save}</button>
              <button type="button" onClick={() => router.push('/admin')} className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">{t.cancel}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
