'use client'

import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!show) return null

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
      }}
    >
      {message}
    </div>
  )
}

export default Toast
