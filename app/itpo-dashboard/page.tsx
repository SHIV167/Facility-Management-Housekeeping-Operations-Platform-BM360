'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ITPODashboardPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [currentView, setCurrentView] = useState<'overview' | 'officials' | 'performance' | 'assignments' | 'reports'>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    router.push('/')
  }

  const officials = [
    {
      id: 1,
      name: 'Mr. Premjit Lal',
      username: '@mrpremjitlal',
      employeeId: '9123',
      designation: 'ED',
      phone: '9868217057',
      email: 'editpo@itpo.gov.in',
      zones: 'All Zones (Entire Complex)',
      status: 'Active',
      assignedComplaints: 142,
      resolvedComplaints: 128,
      resolutionRate: 90.1,
      avgResponseTime: 7.2,
      ranking: 1
    },
    {
      id: 2,
      name: 'Mrs. Sunita Sharma',
      username: '@sunitasharma',
      employeeId: '9124',
      designation: 'Manager',
      phone: '9868217058',
      email: 'sunita@itpo.gov.in',
      zones: 'Hall 1-5',
      status: 'Active',
      assignedComplaints: 98,
      resolvedComplaints: 89,
      resolutionRate: 90.8,
      avgResponseTime: 6.8,
      ranking: 2
    },
    {
      id: 3,
      name: 'Mr. Rajesh Kumar',
      username: '@rajeshkumar',
      employeeId: '9125',
      designation: 'Supervisor',
      phone: '9868217059',
      email: 'rajesh@itpo.gov.in',
      zones: 'Hall 6-10',
      status: 'Inactive',
      assignedComplaints: 76,
      resolvedComplaints: 65,
      resolutionRate: 85.5,
      avgResponseTime: 9.5,
      ranking: 3
    },
    {
      id: 4,
      name: 'Ms. Priya Verma',
      username: '@priyaverma',
      employeeId: '9126',
      designation: 'Officer',
      phone: '9868217060',
      email: 'priya@itpo.gov.in',
      zones: 'Hall 11-14',
      status: 'Active',
      assignedComplaints: 115,
      resolvedComplaints: 108,
      resolutionRate: 93.9,
      avgResponseTime: 5.5,
      ranking: 4
    },
    {
      id: 5,
      name: 'Mr. Amit Singh',
      username: '@amitsingh',
      employeeId: '9127',
      designation: 'Officer',
      phone: '9868217061',
      email: 'amit@itpo.gov.in',
      zones: 'Parking Area',
      status: 'Active',
      assignedComplaints: 89,
      resolvedComplaints: 82,
      resolutionRate: 92.1,
      avgResponseTime: 6.2,
      ranking: 5
    }
  ]

  const recentActivities = [
    {
      id: 1,
      action: 'Complaint Resolved',
      official: 'Mr. Premjit Lal',
      complaintId: '#156',
      timestamp: '2 minutes ago',
      type: 'success'
    },
    {
      id: 2,
      action: 'New Complaint Assigned',
      official: 'Mrs. Sunita Sharma',
      complaintId: '#157',
      timestamp: '15 minutes ago',
      type: 'info'
    },
    {
      id: 3,
      action: 'Zone Updated',
      official: 'Mr. Rajesh Kumar',
      complaintId: '-',
      timestamp: '1 hour ago',
      type: 'warning'
    },
    {
      id: 4,
      action: 'Complaint Escalated',
      official: 'Ms. Priya Verma',
      complaintId: '#155',
      timestamp: '2 hours ago',
      type: 'error'
    }
  ]

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">TOTAL OFFICIALS</p>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">124</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">ACTIVE ON DUTY</p>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">122</p>
                <p className="text-xs text-gray-500 mt-1">98.4% active rate</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">COMPLAINTS ASSIGNED</p>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">1,247</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">AVG. RESOLUTION</p>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">94.2%</p>
                <p className="text-xs text-green-600 mt-1">↑ 3% improvement</p>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers This Month</h3>
              <div className="space-y-4">
                {officials.slice(0, 3).map((official, index) => (
                  <div key={official.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {official.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{official.name}</p>
                      <p className="text-sm text-gray-500">{official.designation} • {official.zones}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{official.resolutionRate}%</p>
                      <p className="text-xs text-gray-500">Resolution Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'error' ? 'bg-red-500' :
                      activity.type === 'warning' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span>
                        {activity.complaintId !== '-' && ` - ${activity.complaintId}`}
                      </p>
                      <p className="text-xs text-gray-500">{activity.official} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'officials':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">ITPO Officials Directory</h2>
              <button
                onClick={() => window.location.href = '/dashboard/itpo-officials/form'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Official
              </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">OFFICIAL</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">DESIGNATION</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ZONES</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ASSIGNED</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">RESOLVED</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">RATE</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">STATUS</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {officials.map((official) => (
                    <tr key={official.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {official.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{official.name}</p>
                            <p className="text-xs text-gray-500">{official.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{official.designation}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{official.zones}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{official.assignedComplaints}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{official.resolvedComplaints}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {official.resolutionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          official.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {official.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Rate by Official</h3>
                <div className="space-y-4">
                  {officials.map((official) => (
                    <div key={official.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{official.name}</span>
                        <span className="text-sm text-gray-600">{official.resolutionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${official.resolutionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Analysis</h3>
                <div className="space-y-4">
                  {officials.map((official) => (
                    <div key={official.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xs">
                            {official.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{official.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{official.avgResponseTime} min</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Ranking</h3>
              <div className="space-y-3">
                {officials.sort((a, b) => b.resolutionRate - a.resolutionRate).map((official, index) => (
                  <div key={official.id} className={`flex items-center gap-4 p-4 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{official.name}</p>
                      <p className="text-sm text-gray-500">{official.designation} • {official.zones}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{official.resolutionRate}%</p>
                      <p className="text-xs text-gray-500">{official.avgResponseTime}min avg response</p>
                    </div>
                    {index === 0 && (
                      <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">Top Performer</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'assignments':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Zone Assignments</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hall 1-5</h3>
                <p className="text-sm text-gray-500 mb-4">2 officials assigned</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">SS</span>
                    </div>
                    <span className="text-sm text-gray-900">Mrs. Sunita Sharma</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-xs">PV</span>
                    </div>
                    <span className="text-sm text-gray-900">Ms. Priya Verma</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hall 6-10</h3>
                <p className="text-sm text-gray-500 mb-4">1 official assigned</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-xs">RK</span>
                    </div>
                    <span className="text-sm text-gray-900">Mr. Rajesh Kumar</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hall 11-14</h3>
                <p className="text-sm text-gray-500 mb-4">1 official assigned</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-xs">PV</span>
                    </div>
                    <span className="text-sm text-gray-900">Ms. Priya Verma</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Parking Area</h3>
                <p className="text-sm text-gray-500 mb-4">1 official assigned</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-semibold text-xs">AS</span>
                    </div>
                    <span className="text-sm text-gray-900">Mr. Amit Singh</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Zones (Campus-wide)</h3>
                <p className="text-sm text-gray-500 mb-4">1 official assigned</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-semibold text-xs">PL</span>
                    </div>
                    <span className="text-sm text-gray-900">Mr. Premjit Lal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Performance Report</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Comprehensive performance analysis for all officials</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Generate Report →</button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Zone-wise Statistics</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Complaint distribution and resolution by zone</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Generate Report →</button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Response Time Analysis</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Average response time trends and SLA compliance</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Generate Report →</button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Official Workload</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Work distribution and load balancing analysis</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Generate Report →</button>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Page not found</div>
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">BM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">BM360</h1>
              <p className="text-xs text-gray-500">ITPO Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
              currentView === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1H2m10 4a1 1 0 001-1v-4a1 1 0 011-1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1H2" />
            </svg>
            Overview
          </button>
          <button
            onClick={() => setCurrentView('officials')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
              currentView === 'officials' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Officials Directory
          </button>
          <button
            onClick={() => setCurrentView('performance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
              currentView === 'performance' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance Analytics
          </button>
          <button
            onClick={() => setCurrentView('assignments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
              currentView === 'assignments' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Zone Assignments
          </button>
          <button
            onClick={() => setCurrentView('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
              currentView === 'reports' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports
          </button>
        </nav>

        {/* Language Toggle */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                language === 'hi' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">IA</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">ITPO Administrator</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">ITPO Officials Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">IA</span>
                </div>
                <span className="text-sm font-medium text-gray-900">ITPO Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
