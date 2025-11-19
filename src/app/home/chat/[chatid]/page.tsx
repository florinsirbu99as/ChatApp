'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Message, Chat } from '@/types/api'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MessageList from '@/components/MessageList'
import CameraModal from '@/components/CameraModal'
import { useToast } from '@/contexts/ToastContext'  

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [photoCache, setPhotoCache] = useState<Record<string, string>>({})
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
      console.log('Fetched messages:', data)
      
      // Match photos with photoid based on timestamp
      const messages = data.messages || []
      const updatedPhotoCache = { ...photoCache }
      
      // Get list of photoids that don't have a cache entry yet
      const myId = typeof window !== 'undefined' ? localStorage.getItem('userid') : null
      const unmatchedPhotoids = messages
        .filter((msg: Message) => msg.photoid && msg.userid === myId && !updatedPhotoCache[msg.photoid])
        .map((msg: Message) => msg.photoid)
      
      // Get list of timestamp-keyed photos that haven't been matched yet
      const unmatchedTimestampPhotos = Object.entries(photoCache)
        .filter(([key]) => key.match(/^\d+$/) && key !== 'photoid') // numeric keys
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // sort by timestamp desc
      
      // Match them up: oldest photoid gets newest photo
      unmatchedPhotoids.forEach((photoid: string, index: number) => {
        if (unmatchedTimestampPhotos[index]) {
          const [timestampKey, photoData] = unmatchedTimestampPhotos[index]
          updatedPhotoCache[photoid] = photoData
          console.log(`Matched photoid ${photoid} with stored photo from ${timestampKey}`)
        }
      })
      
      if (Object.keys(updatedPhotoCache).length > Object.keys(photoCache).length) {
        setPhotoCache(updatedPhotoCache)
        console.log('Updated photo cache after fetch:', updatedPhotoCache)
      }
      
      setMessages(messages)
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
    e.preventDefault()
    // Überprüfe ob Nachrichtentext oder Foto vorhanden ist
    if (!messageText.trim() && !capturedPhoto) return
    try {
      setSending(true)
      // Entferne Data-URL-Präfix (erste 22 Zeichen) vom Foto zum Senden
      // Das Backend erwartet nur den Base64-Teil ohne "data:image/png;base64,"
      const photoData = capturedPhoto ? capturedPhoto.substring(22) : ''
      
      const payload = {
        text: messageText,
        chatid: chatid,
        photo: photoData, // Nur Base64-Daten werden gesendet
      }
      console.log('Sende Nachricht mit Foto:', { 
        text: payload.text,
        chatid: payload.chatid,
        photoSize: payload.photo.length,
        hatFoto: !!capturedPhoto
      })
       // Ruft die
      const response = await fetch('/api/messages/send', {
         //Sende die Nachricht im Body der Anfrage
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
     //Lese die Antwort
      const responseData = await response.json()
      console.log('Send message response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send message')
      }

      // Store the photo with current timestamp so we can match it with the photoid when messages are fetched
      if (capturedPhoto) {
        const photoTimestamp = Date.now().toString()
        setPhotoCache(prev => ({
          ...prev,
          [photoTimestamp]: capturedPhoto, // Store with timestamp key
        }))
        console.log(`Stored photo with key: ${photoTimestamp}`)
      }

      // Eingabefeld leeren und Foto zurücksetzen
      setMessageText('')
      setCapturedPhoto(null)
       // Nachrichten neu laden, um die neue anzuzeigen
      await fetchMessages()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      alert(`Error: ${errorMessage}`)
    } finally {
      setSending(false)
    }
  }

  const handleCapturePhoto = (imageData: string) => {
    // Komprimiere das Foto um Speichergröße zu reduzieren
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // Skaliere auf 25% um Dateigröße drastisch zu reduzieren
      const maxWidth = 320
      const maxHeight = 240
      let width = img.width * 0.25
      let height = img.height * 0.25
      
      // Stelle sicher, dass Dimensionen nicht größer werden als Max-Werte
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width
        height = maxHeight
      }
      
      canvas.width = Math.max(width, 160)
      canvas.height = Math.max(height, 120)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        // Konvertiere zu PNG (beste Kompression)
        const compressedImage = canvas.toDataURL('image/png')
        const sizeInKB = (compressedImage.length / 1024).toFixed(2)
        console.log(`Komprimiertes Foto: ${sizeInKB} KB`)
        setCapturedPhoto(compressedImage) // Speichere komprimiertes Foto
        addToast(`Foto bereit zum Senden (${sizeInKB} KB)`)
      }
    }
    img.src = imageData
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
          <MessageList messages={messages} loading={loading} error={error} photoCache={photoCache} />
        </div>

        <form onSubmit={handleSendMessage} style={{ borderTop: '1px solid #eee', padding: 12 }}>
          {/* Zeige Foto-Vorschau wenn ein Foto ausgewählt wurde */}
          {capturedPhoto && (
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, padding: 8, backgroundColor: '#e7f3ff', borderRadius: 4 }}>
              <img src={capturedPhoto} alt="Angehängtes Foto" style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }} />
              <span style={{ flex: 1, fontSize: '0.9em', color: '#555' }}>Foto hinzugefügt</span>
              <button
                type="button"
                onClick={() => setCapturedPhoto(null)}
                style={{ padding: '4px 8px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.8em' }}
              >
                Entfernen
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Gib deine Nachricht ein..."
              disabled={sending}
              style={{
                flex: 1,
                padding: 12,
                border: '1px solid #ced4da',
                borderRadius: 4,
                fontSize: '1em',
              }}
            />
            {/* Kamera-Button - Öffnet Modal zum Fotos aufnehmen */}
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              title="Foto aufnehmen"
            >
              📷
            </button>
            <button
              type="submit"
              disabled={sending || (!messageText.trim() && !capturedPhoto)}
              style={{
                padding: '12px 24px',
                backgroundColor: sending || (!messageText.trim() && !capturedPhoto) ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: sending || (!messageText.trim() && !capturedPhoto) ? 'not-allowed' : 'pointer',
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

      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)} 
        onCapture={handleCapturePhoto}
      />
    </main>
  )
}
