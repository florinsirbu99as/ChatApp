'use client'

import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
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

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        fontSize: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
      }}
    >
      {message}
    </div>
  )
}

export default Toast
