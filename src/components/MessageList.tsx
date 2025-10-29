// src/components/MessageList.tsx

import { Message } from '@/types/api'

type MessageListProps = {
  messages: Message[]
  loading: boolean
  error: string | null
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, error }) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {loading && <p>Loading messages...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {Array.isArray(messages) &&
        messages.map((message) => {
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
      {!loading && (!Array.isArray(messages) || messages.length === 0) && <p>No messages in this chat yet.</p>}
    </div>
  )
}

export default MessageList
