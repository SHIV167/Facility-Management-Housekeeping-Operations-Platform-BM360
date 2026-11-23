'use client'

import { useState } from 'react'
import DocumentTitle from '@/components/DocumentTitle'
import { logActivity } from '@/lib/activity'
import { useToast } from '@/components/Toast'

export default function LoginPage() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const STATIC_OTP = '123456'

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mobileNumber.length < 10) {
      setError('Please enter a valid mobile number')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(2)
    }, 1000)
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (otp === STATIC_OTP) {
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: mobileNumber, otp }),
        }).catch(() => {})
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('mobileNumber', mobileNumber)
        logActivity(mobileNumber, 'User', 'Login', 'OTP verified — logged into portal')
        try {
          const zones = JSON.parse(localStorage.getItem('bm360_zones') || '[]')
          const allArea = zones.find((z: { id?: number; name?: string }) => z.id === 0 || z.name === 'All Campus Zones (Entire Complex)')
          const allowed = (allArea?.accessMobile || '').split(',').map((m: string) => m.trim()).filter(Boolean)
          const matched = allowed.includes(mobileNumber) ? allArea : null
          if (matched) {
            localStorage.setItem('bm360_assigned_zone', matched.name)
            logActivity(mobileNumber, 'User', 'Zone Access Granted', `Mapped to zone: ${matched.name}`)
          } else {
            localStorage.removeItem('bm360_assigned_zone')
          }
        } catch {}
        window.location.href = '/dashboard'
      } else {
        setError('Invalid OTP. Please try again.')
      }
    }, 1000)
  }

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (username.trim().toLowerCase() === 'admin' && password === 'BM360@123') {
      setLoading(true)
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      }).then((r) => r.json()).then((d) => {
        setLoading(false)
        if (d.ok) {
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('userRole', d.role || 'Admin')
          localStorage.setItem('mobileNumber', username.trim())
          localStorage.removeItem('bm360_assigned_zone')
          window.location.href = d.role === 'ITPO Official' ? `/official-dashboard?id=${d.officialId}` : '/dashboard'
        } else {
          setError(d.error || 'Invalid username or password')
        }
      }).catch(() => {
        setLoading(false)
        setError('Login service unavailable')
      })
    } else {
      setError('Invalid username or password')
    }
  }

  const handleResendOtp = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast('OTP resent successfully!')
    }, 1000)
  }

  const handleBack = () => {
    setStep(1)
    setOtp('')
    setError('')
  }

  return (
    
      <div className="min-h-screen flex">
      <DocumentTitle title="BM360 Login" />
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b3c4a] via-[#0e4c5e] to-[#0f766e]"></div>

        {/* Background image */}
        <div className="absolute inset-0 opacity-[0.22]" style={{ backgroundImage: 'url(https://vigpl.com/bharat-mandapam.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-20 w-[30rem] h-[30rem] bg-emerald-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">BM360</h1>
              <p className="text-teal-200 text-sm">Bharat Mandapam</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-4 inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm text-teal-100">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              SYSTEM STATUS: OPERATIONAL
            </div>

            <h2 className="text-5xl xl:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
              Bharat Mandapam<br />
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Operations Portal
              </span>
            </h2>

            <p className="text-lg text-teal-100/90 mb-10 leading-relaxed max-w-lg">
              One shared workspace for Bharat Mandapam operations, teamwork, and
              continuous improvement.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4 max-w-md">
              <div className="group bg-white/[0.08] backdrop-blur-md rounded-xl p-5 border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Role-Based Jurisdiction</p>
                    <p className="text-sm text-teal-200/80">Access tailored to your responsibilities</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/[0.08] backdrop-blur-md rounded-xl p-5 border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Zone & Area Mapping</p>
                    <p className="text-sm text-teal-200/80">Precise location-based assignments</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/[0.08] backdrop-blur-md rounded-xl p-5 border border-white/15 hover:bg-white/[0.12] hover:border-white/25 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Audit-Sealed Verification</p>
                    <p className="text-sm text-teal-200/80">Complete transparency and accountability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <p className="text-sm text-teal-100">© 2026 Bharat Mandapam. All rights reserved.</p>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <p className="text-sm font-medium text-teal-100">ITPO Platform v2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Card */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#eef5f4] via-[#f4f8f7] to-[#e4efee]">
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-100/50 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>

        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">BM360</span>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md mx-6">
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/60 p-8 sm:p-10 border border-gray-100 border-t-4 border-t-green-500">
            {/* Step Indicator */}
            <div className="mb-10">
              <div className="flex items-center gap-3">
                {/* Step 1 */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === 1 ? 'bg-[#1b8f84] text-white shadow-lg shadow-teal-500/30' :
                    step === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step === 2 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : '1'}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${step === 1 ? 'text-gray-900' : 'text-gray-400'}`}>Account</p>
                    <p className={`text-xs ${step === 1 ? 'text-gray-500' : 'text-gray-400'}`}>Credentials</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex-1 h-0.5 bg-gray-200 mx-1 relative">
                  <div className={`absolute inset-0 bg-[#1b8f84] transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`}></div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === 2 ? 'bg-[#1b8f84] text-white shadow-lg shadow-teal-500/30' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${step === 2 ? 'text-gray-900' : 'text-gray-400'}`}>Verification</p>
                    <p className={`text-xs ${step === 2 ? 'text-gray-500' : 'text-gray-400'}`}>Code</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                {step === 1 ? 'Welcome back' : 'Check your phone'}
              </h1>
              <p className="text-gray-500 leading-relaxed">
                {step === 1
                  ? 'Sign in to access your Bharat Mandapam workspace.'
                  : `We sent a 6-digit code to +91 ${mobileNumber || 'your number'}.`
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            {step === 1 && adminMode ? (
              <form onSubmit={handleAdminSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2.5">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#1b8f84] text-lg text-gray-900 bg-gray-50/50 placeholder-gray-400 transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2.5">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#1b8f84] text-lg text-gray-900 bg-gray-50/50 placeholder-gray-400 transition-all duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0e4c5e] to-[#14586a] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-[#14586a] hover:to-[#0b3c4a] focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/25"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <button type="button" onClick={() => { setAdminMode(false); setError('') }} className="w-full text-sm text-[#0f766e] font-semibold hover:underline">
                  ← Back to mobile login
                </button>
              </form>
            ) : step === 1 ? (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Mobile Number
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg border-r border-gray-200 pr-4">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="mobile"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className="w-full pl-20 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#1b8f84] text-lg text-gray-900 bg-gray-50/50 placeholder-gray-400 transition-all duration-200"
                      required
                      maxLength={10}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Enter your 10-digit mobile number</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0e4c5e] to-[#14586a] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-[#14586a] hover:to-[#0b3c4a] focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/25"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending code...
                    </>
                  ) : (
                    <>
                      Continue
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <button type="button" onClick={() => { setAdminMode(true); setError('') }} className="w-full text-sm text-[#0f766e] font-semibold hover:underline">
                  Staff login (username &amp; password)
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2.5">
                    Verification Code
                  </label>
                  <div className="flex justify-center gap-3" onPaste={(e) => {
                    e.preventDefault()
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                    setOtp(pasted)
                    const next = Math.min(pasted.length, 5)
                    document.getElementById(`otp-${next}`)?.focus()
                  }}>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i] || ''}
                        autoFocus={i === 0}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(-1)
                          const chars = otp.split('')
                          chars[i] = val
                          const joined = chars.join('').slice(0, 6)
                          setOtp(joined)
                          if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otp[i] && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus()
                          }
                        }}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#1b8f84] bg-gray-50/50 text-gray-900 transition-all duration-200"
                      />
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-lg text-center">
                    <p className="text-sm text-teal-700">
                      Demo OTP: <span className="font-bold text-teal-900 text-base tracking-widest">{STATIC_OTP}</span>
                    </p>
                  </div>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resending...' : "Didn't receive the code? Resend"}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0e4c5e] to-[#14586a] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-[#14586a] hover:to-[#0b3c4a] focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-900/25"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-3.5 px-6 border-2 border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </form>
            )}

            {/* Help Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium text-sm inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Need help? Contact ITPO Platform Administrator
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
