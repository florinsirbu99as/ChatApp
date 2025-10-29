'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Message, Chat } from '@/types/api'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MessageList from '@/components/MessageList'
import { useToast } from '@/contexts/ToastContext'  

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [userHash, setUserHash] = useState('')
  const router = useRouter()
  const params = useParams()
  const chatid = params.chatid as string
  const [chatname, setChatname] = useState<string>('')

  const { addToast } = useToast() 

  useEffect(() => {
     // Laden, falls chatid existiert
    if (chatid) {
      fetchMessages()
      fetchChatName()
    }
  }, [chatid])

  //Chatnamen um ihn anzeigen zu lassen
  async function fetchChatName() {
    try {
      const res = await fetch('/api/chats')
      if (!res.ok) throw new Error('Failed to load chats')
      const data = await res.json()
      const allChats = data.chats as Chat[]

      const current = allChats.find((chat: Chat) => chat.chatid.toString() === chatid)

      if (current) {
        setChatname(current.chatname);
      } else {
        setChatname(`Chat ${chatid}`);
      }
    } catch (err) {
      console.error('Error loading chat name:', err)
      setChatname(`Chat ${chatid}`)
    }
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
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
// Zurück zur Home-Seite
  const handleBack = () => {
    router.push('/home')
  }

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      alert(`Error: ${errorMessage}`)
    } finally {
      setSending(false)
    }
  }

  const inviteToChat = async (chatid: string | number, invitedhash: string) => {
    const response = await fetch('/api/chats/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatid, invitedhash }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Invite failed')
    return data
  }

  const leaveChat = async (chatid: string | number) => {
    const response = await fetch('/api/chats/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatid }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Leaving failed')
    return data
  }

  return (
    <main style={{ padding: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderBottom: '1px solid #eee', justifyContent: 'space-between' }}>
          <button
            onClick={handleBack}
            style={{ padding: 8, backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0 }}>{chatname}</h1>

          <div>
            {chatid !== '0' && (
              <button
                onClick={() => setInviteDialogOpen(true)}
                style={{ padding: 8, backgroundColor: '#28a745', color: '#fff', borderRadius: 4 }}
              >
                Invite user
              </button>
            )}

            {chatid !== '0' && (
              <button
                onClick={() => setLeaveDialogOpen(true)}
                style={{ padding: 8, backgroundColor: '#d53131ff', color: '#fff', borderRadius: 4 }}
              >
                Leave chat
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <MessageList messages={messages} loading={loading} error={error} />
        </div>

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

      <Dialog open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={userHash}
            onChange={(e) => setUserHash(e.target.value)}
            placeholder="Enter user hash"
            style={{ padding: 8, width: '100%' }}
          />
          <DialogFooter>
            <Button
              onClick={() => {
                if (userHash) {
                  inviteToChat(chatid, userHash)
                    .then(() => {
                      addToast('Einladung gesendet')  // Zeige Toast-Benachrichtigung
                    })
                    .catch((err) => addToast('Fehler: ' + err.message))
                    .finally(() => {
                      setInviteDialogOpen(false)
                      setUserHash('')
                    })
                }
              }}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Chat</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to leave this chat?</p>
          <DialogFooter>
            <Button
              onClick={() => {
                leaveChat(chatid)
                  .then(() => {
                    addToast('Chat verlassen')  
                    router.push('/home')
                  })
                  .catch((err) => addToast('Fehler: ' + err.message))
                  .finally(() => {
                    setLeaveDialogOpen(false)
                  })
              }}
            >
              Yes, leave chat
            </Button>
            <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
