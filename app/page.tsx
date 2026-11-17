'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [step, setStep] = useState(1)
  const [mobileNumber, setMobileNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const STATIC_OTP = '123456'

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mobileNumber.length < 10) {
      setError('Please enter a valid mobile number')
      return
    }

    setLoading(true)
    // Simulate sending OTP
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
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false)
      if (otp === STATIC_OTP) {
        // Store session (in real app, this would be a token)
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('mobileNumber', mobileNumber)
        // Navigate to dashboard
        window.location.href = '/dashboard'
      } else {
        setError('Invalid OTP. Please try again.')
      }
    }, 1000)
  }

  const handleResendOtp = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('OTP resent successfully!')
    }, 1000)
  }

  const handleBack = () => {
    setStep(1)
    setOtp('')
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold">BM</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">BM360</h1>
              <p className="text-blue-200 text-sm">Bharat Mandapam</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Bharat Mandapam<br />Operations Portal
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-md">
              One shared workspace for Bharat Mandapam operations, teamwork, and
              continuous improvement.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">Role-Based Jurisdiction</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">Zone & Area Mapping</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium">Audit-Sealed Verification</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-blue-200">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">SYSTEM STATUS: OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 relative">
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Mobile Logo (visible on small screens) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">BM</span>
          </div>
          <span className="text-lg font-bold text-gray-900">BM360</span>
        </div>

        {/* Login Form Card */}
        <div className="relative z-10 w-full max-w-md mx-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Step Indicator */}
            <div className="mb-8">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step === 1 ? 'bg-blue-600 text-white' : step === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step === 2 ? '✓' : '1'}
                  </div>
                  <span className={`font-medium ${step === 1 ? 'text-gray-900' : 'text-gray-400'}`}>Account Credentials</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <span className={`font-medium ${step === 2 ? 'text-gray-900' : 'text-gray-400'}`}>Verification Code</span>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 1 ? 'Sign in to BM360' : 'Verify your number'}
              </h1>
              <p className="text-gray-600">
                {step === 1
                  ? 'Use your authorized Bharat Mandapam account to continue.'
                  : `Enter the 6-digit code sent to +91 ${mobileNumber}`
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            {step === 1 ? (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                {/* Mobile Number Input */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="mobile"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter your mobile number"
                      className="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 bg-white placeholder-gray-400"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue to workspace
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-widest text-gray-900 bg-white placeholder-gray-400"
                    required
                    maxLength={6}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Demo OTP: <span className="font-bold text-blue-600">{STATIC_OTP}</span>
                  </p>
                </div>

                {/* Resend OTP Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resending...' : "Didn't receive code? Resend"}
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    'Verify & Continue'
                  )}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full py-4 px-6 border border-gray-300 rounded-lg font-semibold text-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </form>
            )}

            {/* Help Link */}
            <div className="mt-8 text-center">
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Contact ITPO Platform Administrator
              </a>
            </div>

            {/* Copyright */}
            <div className="mt-12 text-center text-sm text-gray-500">
              <p>© 2026 Bharat Mandapam. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
