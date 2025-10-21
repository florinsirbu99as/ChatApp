'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountActions from '@/components/AccountActions'
import type { Chat } from '@/types/api'

export default function HomePage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      //ruf die API /api/chats auf, um die Chat-Liste zu holen
      setLoading(true)
      const response = await fetch('/api/chats')

      if (!response.ok) {
        throw new Error('Failed to fetch chats')
      }
      //speicher die Daten
      const data = await response.json()
      console.log('Fetched chats data:', data)
      //Prüfe das Format der Daten
      //ist data Array?
      if (Array.isArray(data)) {
        setChats(data)
      //ist data Objekt?
      } else if (data && typeof data === 'object') {
        setChats(data.chats || data.data || [])
      //sonst leere Liste setzen
      } else {
        setChats([])
      }
    } catch (err) {
      console.error('Error fetching chats:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  //Beim clicken gehe zur chat-Seite mit der jeweiligen chatid
  const handleChatClick = (chatid: string) => {
    router.push(`/home/chat/${chatid}`)
  }

  return (
    // Inhalt der Home-Seite
    <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1>Home</h1>
      <p>You are logged in.</p>

      <div>
        <h2>Your Chats</h2>
        {loading && <p>Loading chats...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {Array.isArray(chats) && chats.map((chat) => (
            <button
              key={chat.chatid}
              onClick={() => handleChatClick(chat.chatid)}
              style={{
                padding: 12,
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {chat.chatname || `Chat ${chat.chatid}`}
            </button>
          ))}

          {!loading && (!Array.isArray(chats) || chats.length === 0) && (
            <p>No chats available yet.</p>
          )}
        </div>
      </div>

      <AccountActions />
    </main>
  )
}
