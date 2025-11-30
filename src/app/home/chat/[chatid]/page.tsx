'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Message, Chat } from '@/types/api'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MessageList from '@/components/MessageList'
import CameraModal from '@/components/CameraModal'
import { useToast } from '@/contexts/ToastContext'  
import { FaCamera, FaMapMarkerAlt } from 'react-icons/fa'
import { Camera, MapPin } from "lucide-react"
import { ArrowLeft } from "lucide-react"




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

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700">
    <main className="flex min-h-screen items-center justify-center p-4">
      {/* Zentrale Chat-Card */}
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <button
            onClick={handleBack}
            className="rounded-md bg-slate-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="truncate text-lg font-semibold text-slate-800">
            {chatname}
          </h1>

          <div className="flex gap-2">
            {chatid !== '0' && (
              <button
                type="button"
                onClick={() => setInviteDialogOpen(true)}
                className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                Invite user
              </button>
            )}

            {chatid !== '0' && (
              <button
                type="button"
                onClick={() => setLeaveDialogOpen(true)}
                className="rounded-md bg-rose-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
              >
                Leave chat
              </button>
            )}
          </div>
        </div>

        {/* Nachrichtenliste eigener Scrollbereich */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-5 sm:px-6 sm:py-6">
          <MessageList
            messages={messages}
            loading={loading}
            error={error}
            photoCache={photoCache}
          />
        </div>


       <form
  onSubmit={handleSendMessage}
  className="border-t border-slate-200 bg-white"
>
  {/* Foto-Vorschau (unverändert, falls du sie schon hast) */}
  {capturedPhoto && (
    <div className="mx-4 mt-3 mb-1 flex items-center gap-3 rounded-lg bg-blue-50 p-2 text-sm text-slate-700">
      <img
        src={capturedPhoto}
        alt="Angehängtes Foto"
        className="h-12 w-12 rounded object-cover"
      />
      <span className="flex-1 text-xs sm:text-sm">Foto hinzugefügt</span>
      <button
        type="button"
        onClick={() => setCapturedPhoto(null)}
        className="rounded-md bg-rose-500 px-2 py-1 text-xs font-medium text-white hover:bg-rose-600"
      >
        Remove
      </button>
    </div>
  )}

  <div className="flex items-center gap-2 px-4 py-3">
    {/* Message-Bar mit Icons innen rechts */}
    <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm">
      <input
        type="text"
        value={messageText}
        onChange={e => setMessageText(e.target.value)}
        placeholder="Type your message..."
        disabled={sending}
        className="flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />

      {/* Kamera-Icon in der Bar */}
      <button
        type="button"
        onClick={() => setIsCameraModalOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        title="Take photo"
      >
        <Camera className="h-5 w-5" />
      </button>

      {/* Standort-Icon in der Bar */}
      <button
        type="button"
        onClick={handleShareLocation}
        disabled={sending}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        title="Share location"
      >
        <MapPin className="h-5 w-5" />
      </button>
    </div>

    {/* Senden-Button rechts daneben */}
    <button
      type="submit"
      disabled={sending || (!messageText.trim() && !capturedPhoto)}
      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
        sending || (!messageText.trim() && !capturedPhoto)
          ? 'cursor-not-allowed bg-slate-400'
          : 'bg-emerald-500 hover:bg-emerald-600'
      }`}
    >
      {sending ? 'Sending…' : 'Send'}
    </button>
  </div>
</form>



      </div>

      {/* Invite-Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={userHash}
            onChange={e => setUserHash(e.target.value)}
            placeholder="Enter user hash"
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/40"
          />
          <DialogFooter>
            <Button
              onClick={() => {
                if (userHash) {
                  inviteToChat(chatid, userHash)
                    .then(() => {
                      addToast('Einladung gesendet')
                    })
                    .catch(err => addToast('Fehler: ' + err.message))
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

      {/* Leave-Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Chat</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-700">
            Are you sure you want to leave this chat?
          </p>
          <DialogFooter>
            <Button
              onClick={() => {
                leaveChat(chatid)
                  .then(() => {
                    addToast('Chat verlassen')
                    router.push('/home')
                  })
                  .catch(err => addToast('Fehler: ' + err.message))
                  .finally(() => {
                    setLeaveDialogOpen(false)
                  })
              }}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              Yes, leave chat
            </Button>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              Cancel
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
  </div>
)

}
