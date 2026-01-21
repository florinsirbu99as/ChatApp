'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'
import Toast from '@/components/Toast'

// Den Typ für den ToastContext definieren
type ToastType = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void
}

// Den Typ für die Props des Providers definieren
interface ToastProviderProps {
  children: ReactNode  // Definiert, dass der Provider Kinder enthalten wird
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// ToastProvider als funktionale Komponente
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          message={toast.message} 
          type={toast.type}
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </ToastContext.Provider>
  )
}
