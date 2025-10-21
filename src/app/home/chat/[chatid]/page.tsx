'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Message } from '@/types/api'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const router = useRouter()
  const params = useParams()
  const chatid = params.chatid as string

  // eigene UserId speichern
  const [myUserId, setMyUserId] = useState<string | null>(null)
  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('userid') : null
    setMyUserId(id)
  }, [])

  useEffect(() => {
    // Laden, falls chatid existiert
    if (chatid) {
      fetchMessages()
    }
  }, [chatid])

  const fetchMessages = async () => {
    try {
      // Ruft die API /api/messages auf, um die Nachrichten für die gegebene chatid zu holen
      setLoading(true)
      const response = await fetch(`/api/messages?chatid=${chatid}&fromid=0`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      // Speichert die Daten
      const data = await response.json()
      console.log('Fetched messages data:', data)
      // Ist data Array?
      if (Array.isArray(data)) {
        setMessages(data)
        // Ist data Objekt?
      } else if (data && typeof data === 'object') {
        setMessages(data.messages || data.data || [])
        // Sonst leere Liste setzen
      } else {
        setMessages([])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  // Zurück zur Home-Seite
  const handleBack = () => {
    router.push('/home')
  }
  // Datum formatieren
  const formatMessageDate = (dateValue: string | number | undefined) => {
    if (!dateValue) return ''
    
    try {
      let date: Date
      // Verschiedene mögliche Formate behandeln
      if (typeof dateValue === 'number') {
        const timestamp = dateValue
        // Falls es wie Sekunden aussieht (vernünftiger Unix-Timestamp), in Millisekunden umwandeln
        date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000)
      } else if (typeof dateValue === 'string') {
        // Versuche, als String zu parsen
        date = new Date(dateValue)
        // Falls ungültig, andere Formate versuchen
        if (isNaN(date.getTime())) {
          // Versuche Unix-Timestamp als String
          const timestamp = parseInt(dateValue, 10)
          if (!isNaN(timestamp)) {
        date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000)
          }
        }
      } else {
        return ''
      }
      
      // Prüfe ob Datum gültig ist
      if (isNaN(date.getTime())) {
        return `${dateValue} (Invalid date format)`
      }
      // Gibt das formatierte Datum zurück
      return date.toLocaleString()
    } catch (err) {
      console.error('Error formatting date:', dateValue, err)
      return `${dateValue} (Error parsing)`
    }
  }
  // Nachricht senden
  const handleSendMessage = async (e: React.FormEvent) => {
    // Verhindert das Standardformularverhalten, also Seite nicht neuladen
    e.preventDefault()
    // Überprüft, ob der Nachrichtentext leer ist
    if (!messageText.trim()) return
    try {
      setSending(true)
      // Ruft die
      const response = await fetch('/api/messages/send', {
        //Sende die Nachricht im Body der Anfrage
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageText,
          chatid: chatid,
        }),
      })
      //Lese die Antwort
      const responseData = await response.json()
      console.log('Send message response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send message')
      }

      // Eingabefeld leeren
      setMessageText('')
      
      // Nachrichten neu laden, um die neue anzuzeigen
      await fetchMessages()
    } catch (err) {
      console.error('Error sending message:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      alert(`Error: ${errorMessage}`)
    } finally {
      setSending(false)
    }
  }

  return (
  <main style={{ padding: 16 }}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        border: '1px solid #eee',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* Kopfzeile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <button
          onClick={handleBack}
          style={{
            padding: 8,
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>Chat {chatid}</h1>
      </div>

      {/* Nachrichtenliste (scrollt) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Messages</h2>
        {loading && <p>Loading messages...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {Array.isArray(messages) && messages.map((message) => (
            <div
              key={message.id || message.messageid || `${message.userid}-${message.time}`}
              style={{
                padding: 12,
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {message.nickname || message.usernick || message.userid || 'Unknown user'}
              </div>
              {message.text && <p style={{ margin: 0 }}>{message.text}</p>}
              {(message.timestamp || message.time) && (
                <div style={{ fontSize: '0.85em', color: '#6c757d', marginTop: 4 }}>
                  {formatMessageDate(message.timestamp || message.time || '')}
                </div>
              )}
            </div>
          ))}
          {!loading && (!Array.isArray(messages) || messages.length === 0) && (
            <p>No messages in this chat yet.</p>
          )}
        </div>
      </div>

      {/* Composer (unten fix) */}
      <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid #eee', padding: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            style={{
              flex: 1,
              padding: 12,
              border: '1px solid #ced4da',
              borderRadius: 4,
              fontSize: '1em',
            }}
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: sending || !messageText.trim() ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: sending || !messageText.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  </main>
)

}
