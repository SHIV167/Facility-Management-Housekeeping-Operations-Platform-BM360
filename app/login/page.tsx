'use client'

import { useState } from 'react'
import DocumentTitle from '@/components/DocumentTitle'

const STATIC_OTP = '123456'

export default function AgencyLoginPage() {
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const otpValue = otp.join('')

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const digits = mobileNumber.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setMobileNumber(digits)
    setStep('otp')
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      const el = document.getElementById(`otp-${index + 1}`)
      el?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobileNumber, otp: otpValue }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!data.ok) {
      setError(data.error || 'Invalid OTP. Please try again.')
      return
    }
    const role = data.role || 'User'
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userRole', role)
    localStorage.setItem('mobileNumber', mobileNumber)
    window.location.href = (role === 'Agency Supervisor' || role === 'Field Staff') ? '/agency-dashboard' : '/itpo-dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b3c4a] via-[#0e4c5e] to-[#115e69] p-4">
      <DocumentTitle title="Agency Login • BM360" />
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Agency Portal</h1>
          <p className="text-[#9ec3d0] text-sm mt-1">Bharat Mandapam • BM360 Housekeeping</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {step === 'mobile' ? (
            <form onSubmit={handleMobileSubmit}>
              <h2 className="text-lg font-semibold text-[#111827] mb-1">Sign in with mobile</h2>
              <p className="text-[13px] text-[#6b7280] mb-5">Enter the mobile number registered for your agency account.</p>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Mobile Number</label>
              <div className="flex items-center border border-[#e5e7eb] rounded-lg overflow-hidden mb-2">
                <span className="px-3 py-2.5 bg-[#f8fafc] text-[13px] font-semibold text-[#374151] border-r border-[#e5e7eb]">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="flex-1 px-3 py-2.5 text-[14px] outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-[12.5px] text-[#dc2626] mb-3">{error}</p>}
              <button type="submit" className="w-full py-2.5 bg-[#0e4c5e] hover:bg-[#0b3c4a] text-white rounded-lg text-[14px] font-semibold transition-colors">
                Send OTP
              </button>
              <p className="text-center text-[12px] text-[#9ca3af] mt-4">
                Admin? <a href="/" className="text-[#0f766e] font-semibold hover:underline">Go to admin login</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <h2 className="text-lg font-semibold text-[#111827] mb-1">Verify OTP</h2>
              <p className="text-[13px] text-[#6b7280] mb-5">Enter the 6-digit code sent to +91 {mobileNumber}</p>
              <div className="flex gap-2 justify-center mb-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold border border-[#e5e7eb] rounded-lg focus:border-[#1b8f84] focus:ring-2 focus:ring-[#1b8f84]/20 outline-none"
                  />
                ))}
              </div>
              {error && <p className="text-[12.5px] text-[#dc2626] mb-3 text-center">{error}</p>}
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#0e4c5e] hover:bg-[#0b3c4a] disabled:opacity-60 text-white rounded-lg text-[14px] font-semibold transition-colors">
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
              <div className="flex justify-between mt-4 text-[12px]">
                <button type="button" onClick={() => { setStep('mobile'); setOtp(['', '', '', '', '', '']); setError('') }} className="text-[#6b7280] hover:text-[#111827]">← Change number</button>
                <button type="button" onClick={() => { setOtp([STATIC_OTP[0], STATIC_OTP[1], STATIC_OTP[2], STATIC_OTP[3], STATIC_OTP[4], STATIC_OTP[5]]); setError('') }} className="text-[#0f766e] font-semibold hover:underline">Use demo code</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
