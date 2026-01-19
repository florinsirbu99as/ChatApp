'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'
import Toast from '@/components/Toast'

// Den Typ für den ToastContext definieren
interface ToastContextType {
  addToast: (message: string) => void
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
  const [toasts, setToasts] = useState<string[]>([])

  const addToast = (message: string) => {
    // Toasts disabled as per request
  }

  const removeToast = () => {
    setToasts((prev) => prev.slice(1))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map((message, index) => (
        <Toast key={index} message={message} onClose={removeToast} />
      ))}
    </ToastContext.Provider>
  )
}
