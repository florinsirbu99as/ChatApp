'use client'
import { useEffect } from 'react'

export default function SWRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => { /* registered */ })
        .catch(err => { /* failed */ })
    }
  }, [])
  return null
}

