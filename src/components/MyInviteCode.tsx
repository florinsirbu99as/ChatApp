'use client'
import { useEffect, useState } from 'react'

export default function MyInviteCode() {
  const [userhash, setUserhash] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  
  useEffect(() => { 
    setIsMounted(true)
    // Only read from cookies on client side after hydration
    if (typeof document !== 'undefined') {
      const hit = document.cookie.split('; ').find(c => c.startsWith('userhash='))
      if (hit) {
        setUserhash(decodeURIComponent(hit.split('=')[1]))
      }
    }
  }, [])

  const handleCopy = () => {
    if (userhash) {
      navigator.clipboard.writeText(userhash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-5" suppressHydrationWarning>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">Your Invite Code</p>
          <div className="font-mono text-sm sm:text-base font-bold text-blue-700 break-all min-h-6">
            {isMounted ? (
              userhash ? userhash : <span className="text-slate-500 italic">(no code available)</span>
            ) : (
              <span className="text-slate-500 italic">loading...</span>
            )}
          </div>
        </div>
        {isMounted && userhash && (
          <button
            onClick={handleCopy}
            className="ml-3 p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-shrink-0"
            title="Copy invite code"
          >
            {copied ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-slate-600 mt-3">Share this code to invite friends to your chats</p>
    </div>
  )
}