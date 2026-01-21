'use client'

import { useState } from 'react'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-md px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <img src="/logo.png" alt="SendIt Logo" className="h-20 w-20 mx-auto mb-1 object-contain" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">SendIt</h1>
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
