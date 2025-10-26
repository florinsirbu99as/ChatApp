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
  

  useEffect(() => {
    // Laden, falls chatid existiert
    if (chatid) {
      fetchMessages()
    }
  }, [chatid])

  //andere Nutzer zu Chat einladen
  async function inviteToChat(chatid: string | number, invitedhash:string) {
    const response = await fetch('/api/chats/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatid, invitedhash }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Invite failed')
    return data
  }

  //Chat verlassen
  async function leaveChat(chatid: string | number) {
    const response = await fetch('/api/chats/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatid }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Leaving failed')
    return data
  }

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
  const formatMessageDate = (value?: string | number) => {
  if (value == null) return ''

  const m = /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/.exec(String(value).trim())
  if (!m) return `${value} (Invalid date format)`

  const [, Y, M, D, h, mi, s] = m.map(Number)
  const date = new Date(Y, M - 1, D, h, mi, s) // als lokale Zeit interpretiert

  if (isNaN(date.getTime())) return `${value} (Invalid date)`

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  }).format(date)
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
        {/*Zurück Button*/}
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

        {/*Neue Einladung*/}
        {chatid !== '0' && (
        <button
          onClick={async () => {
            const name = prompt('Enter userhash:')
            if (!name) return
            try {
              await inviteToChat(chatid, name);
              alert('Einladung gesendet.');
              
            } catch (e: any) {
              alert(e.message)
            }
          }}
          style={{
            padding: 8,
            backgroundColor: '#28a745',
            color: '#fff',
            borderRadius: 4,
          }}
        >
          Invite userrr
        </button>
        )}

        {/*Chat verlassen*/}
        {chatid !== '0' && (
        <button
          onClick={async () => {
            if (!confirm('Do you really want to leave this chat?')) return
            try {
              await leaveChat(chatid);
              router.push('/home');
              
            } catch (e: any) {
              alert(e.message)
            }
          }}
          style={{
            padding: 8,
            backgroundColor: '#d53131ff',
            color: '#fff',
            borderRadius: 4,
          }}
        >
          Leave chat
        </button>
        )}
      </div>

      {/* Nachrichtenliste scrollbar */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <h2 style={{ marginTop: 0 }}>Messages</h2>
        {loading && <p>Loading messages...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {Array.isArray(messages) && messages.map((message) => {
            const myId = typeof window !== 'undefined' ? localStorage.getItem('userid') : null
            const isMine = myId && message.userid === myId

            return (
              <div
                key={message.id || message.messageid || `${message.userid}-${message.time}`}
                style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    padding: 12,
                    backgroundColor: isMine ? '#2563eb' : '#f8f9fa', // blau vs. grau
                    color: isMine ? '#ffffff' : '#111111',
                    border: '1px solid',
                    borderColor: isMine ? '#2563eb' : '#dee2e6',
                    borderRadius: 8,
                    maxWidth: '70%',
                  }}
                >
                  {!isMine && (
                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#1f2937' }}>
                      {message.nickname || message.usernick || message.userid || 'Unknown user'}
                    </div>
                  )}
                  {message.text && <p style={{ margin: 0 }}>{message.text}</p>}
                  {(message.timestamp || message.time) && (
                    <div
                      style={{
                        fontSize: '0.85em',
                        marginTop: 4,
                        color: isMine ? 'rgba(255,255,255,0.8)' : '#6c757d',
                      }}
                    >
                      {formatMessageDate(message.timestamp || message.time || '')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {!loading && (!Array.isArray(messages) || messages.length === 0) && (
            <p>No messages in this chat yet.</p>
          )}
        </div>
      </div>

      {/* Composer ist unten fix */}
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
