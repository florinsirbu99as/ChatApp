'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Message, Chat } from '@/types/api'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MessageList from '@/components/MessageList'
import CameraModal from '@/components/CameraModal'
import { useToast } from '@/contexts/ToastContext'  
import { Camera, MapPin, ArrowLeft, MoreVertical } from "lucide-react"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [photoCache, setPhotoCache] = useState<Record<string, string>>({})
  const [userHash, setUserHash] = useState('')
  const router = useRouter()
  const params = useParams()
  const chatid = params.chatid as string
  const [chatname, setChatname] = useState<string>('')
  const { addToast } = useToast() 
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Laden, falls chatid existiert
    if (chatid) {
      fetchMessages()
      fetchChatName()
    }
  }, [chatid])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  //Seite am unteren Ende öffnen
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

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
      // Ruft die API auf
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

  //Standort teilen Funktion
  const handleShareLocation = () => {
    //Prüfen ob der Browser Geolocation unterstützt
    if (!navigator.geolocation) {
      addToast('Geolocation wird von diesem Browser nicht unterstützt.')
      return
    }

    //Standort abrufen
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        console.log("Geolocation details:", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy_in_meters: pos.coords.accuracy,
          altitudeAccuracy: pos.coords.altitudeAccuracy,
          timestamp: new Date(pos.timestamp).toISOString()
        });

        const accuracy = pos.coords.accuracy;
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        //Genauigkeit prüfen
        if (accuracy !== null && accuracy > 200) { 
          const accuracyKm = (accuracy / 1000).toFixed(1);
          addToast(
            `Location accuracy is about ${accuracyKm} km (${Math.round(accuracy)}m).`
          );
        }

        try {
          setSending(true)

          //Standortnachricht an die API senden
          const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: '',                 
              chatid: chatid,
              position: `${lat},${lng}` //Koordinaten als Zeichenkette
            }),
          })

          const responseData = await response.json()
          console.log('Send location response:', responseData)

          if (!response.ok) {
            throw new Error(responseData.error || 'Failed to send location')
          }
          await fetchMessages()
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to send location'
          addToast('Error: ' + errorMessage)
        } finally {
          setSending(false)
        }
      },
      (error) => {
        // Fehlerbehandlung für Standortzugriff
        switch (error.code) {
          case error.PERMISSION_DENIED:
            addToast('Location permission denied.')
            break
          case error.POSITION_UNAVAILABLE:
            addToast('Location unavailable.')
            break
          case error.TIMEOUT:
            addToast('Location request timed out.')
            break
          default:
            addToast('Unknown location error.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
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

  const deleteChat = async (chatid: string | number) => {
    const response = await fetch('/api/chats/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatid }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Deleting failed')
    return data
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - Sticky wie auf der Home-Page */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
              aria-label="Back to chats"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            {/* Chat Name */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {chatname}
              </h1>
            </div>

            {/* Menu */}
            {chatid !== '0' && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : 'false'}
                  aria-label="More actions"
                >
                  <MoreVertical className="h-5 w-5 text-slate-700" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    {/* Invite*/}
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setInviteDialogOpen(true)
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition"
                      role="menuitem"
                    >
                      Invite user
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {/* Leave*/}
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setLeaveDialogOpen(true)
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition"
                      role="menuitem"
                    >
                      Leave chat
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {/*Delete*/}
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setDeleteDialogOpen(true)
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
                      role="menuitem"
                    >
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="mx-auto max-w-2xl px-4 sm:px-6 overflow-y-auto py-6"
        style={{ height: 'calc(100vh - 140px)', paddingBottom: '80px' }}
      >
        <MessageList
          messages={messages}
          loading={loading}
          error={error}
          photoCache={photoCache}
        />
      </div>

      {/* Input Bereich */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="mx-auto max-w-2xl w-full px-3 sm:px-6">
          <form onSubmit={handleSendMessage}>
            {/* Photo Preview */}
            {capturedPhoto && (
              <div className="py-2.5 flex items-center gap-2 border-b border-slate-100">
                <img
                  src={capturedPhoto}
                  alt="Attached photo"
                  className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                />
                <span className="flex-1 text-sm text-slate-600">Photo attached</span>
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 transition active:scale-95"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="flex items-center gap-2 py-3.5">
              {/* Message Input with Icons */}
              <div className="flex flex-1 min-w-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 min-w-0 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                {/* Kamera-Icon */}
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                  title="Take photo"
                >
                  <Camera className="h-5 w-5" />
                </button>

                {/* Standort-Icon */}
                <button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={sending}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300 active:scale-95"
                  title="Share location"
                >
                  <MapPin className="h-5 w-5" />
                </button>
              </div>

              {/* Send Button with Icon */}
              <button
                type="submit"
                disabled={sending || (!messageText.trim() && !capturedPhoto)}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition shadow-sm active:scale-95 ${
                  sending || (!messageText.trim() && !capturedPhoto)
                    ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={sending ? 'Sending...' : 'Send message'}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={userHash}
            onChange={e => setUserHash(e.target.value)}
            placeholder="Enter user hash"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userHash) {
                inviteToChat(chatid, userHash)
                  .then(() => {
                    addToast('Invitation sent')
                  })
                  .catch(err => addToast('Error: ' + err.message))
                  .finally(() => {
                    setInviteDialogOpen(false)
                    setUserHash('')
                  })
              }
            }}
          />
          <DialogFooter className="gap-3">
            <Button
              onClick={() => setInviteDialogOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (userHash) {
                  inviteToChat(chatid, userHash)
                    .then(() => {
                      addToast('Invitation sent')
                    })
                    .catch(err => addToast('Error: ' + err.message))
                    .finally(() => {
                      setInviteDialogOpen(false)
                      setUserHash('')
                    })
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave-Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Leave Chat</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to leave this chat? You won't be able to see messages anymore.
          </p>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setLeaveDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                leaveChat(chatid)
                  .then(() => {
                    addToast('Left chat successfully')
                    router.push('/home')
                  })
                  .catch(err => addToast('Error: ' + err.message))
                  .finally(() => {
                    setLeaveDialogOpen(false)
                  })
              }}
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
            >
              Yes, leave chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete-Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this chat? You won't be able to restore it anymore.
          </p>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                deleteChat(chatid)
                  .then(() => {
                    addToast('Deleted chat successfully')
                    router.push('/home')
                  })
                  .catch(err => addToast('Error: ' + err.message))
                  .finally(() => {
                    setDeleteDialogOpen(false)
                  })
              }}
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
            >
              Yes, delete chat
            </Button>
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