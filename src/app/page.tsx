'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8">
            <div className="text-center">
              <img src="/logo.png" alt="ChatApp Logo" className="h-32 w-32 mx-auto mb-2 object-contain" />
              <p className="text-sm text-slate-600">
                Connect with friends and start chatting
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-md px-4 sm:px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-96"></div>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              By Florin Sirbu & Charlotte Brückner
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <img src="/logo.png" alt="ChatApp Logo" className="h-32 w-32 mx-auto mb-2 object-contain" />
            <p className="text-sm text-slate-600">
              Connect with friends and start chatting
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-md px-4 sm:px-6 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            By Florin Sirbu & Charlotte Brückner
          </p>
        </div>
      </div>
    </main>
  )
}
