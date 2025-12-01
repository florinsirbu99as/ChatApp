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
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
              ChatApp
            </h1>
            <p className="text-sm text-slate-600">
              Connect with friends and start chatting
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-md px-4 sm:px-6 py-8">
        {/* Toggle Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 border border-slate-200">
          <div className="flex gap-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all ${
                isLogin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all ${
                !isLogin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          {/* Forms */}
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            By Florin Sirbu & Charlotte Brückner
          </p>
        </div>
      </div>
    </main>
  )
}