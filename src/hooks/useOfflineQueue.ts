'use client'

import { useState, useEffect, useCallback } from 'react'

export interface QueuedMessage {
  id: string //temporäre ID
  chatid: string
  text: string
  photo?: string
  position?: string
  timestamp: number
  status: 'pending' | 'sending' | 'sent' | 'error'
  error?: string
}

const QUEUE_KEY = 'offline_message_queue'

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedMessage[]>([])
  const [isOnline, setIsOnline] = useState(true)

  //Queue aus localStorage
  useEffect(() => {
    const stored = localStorage.getItem(QUEUE_KEY)
    if (stored) {
      try {
        setQueue(JSON.parse(stored))
      } catch (err) {
        console.error('Failed to load queue:', err)
      }
    }

    // Online/Offline Status überwachen
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      console.log('[Queue] Back online!')
      setIsOnline(true)
    }
    
    const handleOffline = () => {
      console.log('[Queue] Gone offline!')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  //Queue in localStorage speichern wenn sie sich ändert
  useEffect(() => {
    if (queue.length > 0) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    } else {
      localStorage.removeItem(QUEUE_KEY)
    }
  }, [queue])

  // Nachricht zur Queue hinzufügen
  const addToQueue = useCallback((message: Omit<QueuedMessage, 'id' | 'status' | 'timestamp'>) => {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: `temp_${Date.now()}_${Math.random()}`,
      status: 'pending',
      timestamp: Date.now(),
    }
    
    setQueue(prev => [...prev, queuedMessage])
    return queuedMessage.id
  }, [])

  // Versuchen eine Nachricht zu senden
  const sendMessage = useCallback(async (msg: QueuedMessage) => {
    console.log('[Queue] Attempting to send:', msg.id)
    
    // Status auf "sending"
    setQueue(prev => prev.map(m => 
      m.id === msg.id ? { ...m, status: 'sending' } : m
    ))

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.text,
          chatid: msg.chatid,
          photo: msg.photo || '',
          position: msg.position || '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send')
      }

      console.log('[Queue] Successfully sent:', msg.id)
      
      //aus Queue entfernen
      setQueue(prev => prev.filter(m => m.id !== msg.id))
      
      return { success: true, data }
    } catch (error) {
      console.error('[Queue] Failed to send:', msg.id, error)
      
      //als Fehler markieren
      setQueue(prev => prev.map(m => 
        m.id === msg.id 
          ? { ...m, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
          : m
      ))
      
      return { success: false, error }
    }
  }, [])

  // versuchen alle pending Nachrichten zu senden
  const processPendingMessages = useCallback(async () => {
    const pending = queue.filter(m => m.status === 'pending' || m.status === 'error')
    
    if (pending.length === 0) return

    console.log(`[Queue] Processing ${pending.length} pending messages`)

    for (const msg of pending) {
      await sendMessage(msg)
      // Kleine Pause zwischen Nachrichten
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }, [queue, sendMessage])

  // Automatisch senden wenn online
  useEffect(() => {
    if (isOnline && queue.some(m => m.status === 'pending' || m.status === 'error')) {
      processPendingMessages()
    }
  }, [isOnline, queue, processPendingMessages])

  // Nachricht manuell erneut versuchen
  const retryMessage = useCallback(async (messageId: string) => {
    const msg = queue.find(m => m.id === messageId)
    if (msg) {
      await sendMessage(msg)
    }
  }, [queue, sendMessage])

  // Nachricht aus Queue entfernen
  const removeFromQueue = useCallback((messageId: string) => {
    setQueue(prev => prev.filter(m => m.id !== messageId))
  }, [])

  return {
    queue,
    isOnline,
    addToQueue,
    retryMessage,
    removeFromQueue,
    hasPending: queue.some(m => m.status === 'pending' || m.status === 'sending'),
  }
}