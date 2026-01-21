'use client'

import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [show, setShow] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const timer = setTimeout(() => {
      setShow(false)
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose, mounted])

  if (!mounted || !show) return null

  const bgColor = type === 'success' ? '#22c55e' : '#ef4444' // Tailwind green-500 and red-500

  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: bgColor,
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        width: 'fit-content',
        textAlign: 'center',
        pointerEvents: 'auto',
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  )
}

export default Toast
