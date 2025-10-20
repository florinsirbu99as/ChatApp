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
    if (chatid) {
      fetchMessages()
    }
  }, [chatid])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?chatid=${chatid}&fromid=0`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      console.log('Fetched messages data:', data)
      
      // Handle if data is an array or if it's wrapped in an object
      if (Array.isArray(data)) {
        setMessages(data)
      } else if (data && typeof data === 'object') {
        // Check if it has a messages property or similar
        setMessages(data.messages || data.data || [])
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

  const handleBack = () => {
    router.push('/home')
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim()) return

    try {
      setSending(true)
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageText,
          chatid: chatid,
        }),
      })

      const responseData = await response.json()
      console.log('Send message response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send message')
      }

      // Clear the input
      setMessageText('')
      
      // Refresh messages to show the new one
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
    <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={handleBack}
          style={{
            padding: 8,
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <h1>Chat {chatid}</h1>
      </div>

      <div>
        <h2>Messages</h2>
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
                borderRadius: 4
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {message.nickname || message.usernick || message.userid || 'Unknown user'}
              </div>
              {message.text && <p style={{ margin: 0 }}>{message.text}</p>}
              {(message.timestamp || message.time) && (
                <div style={{ fontSize: '0.85em', color: '#6c757d', marginTop: 4 }}>
                  {new Date(message.timestamp || message.time || '').toLocaleString()}
                </div>
              )}
            </div>
          ))}
          
          {!loading && (!Array.isArray(messages) || messages.length === 0) && (
            <p>No messages in this chat yet.</p>
          )}
        </div>
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} style={{ marginTop: 16 }}>
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
              fontSize: '1em'
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
              fontWeight: 'bold'
            }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </main>
  )
}
