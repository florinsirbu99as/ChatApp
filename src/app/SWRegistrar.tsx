// app/SWRegistrar.tsx
'use client'
import { useEffect } from 'react'

export default function SWRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])
  return null
}
