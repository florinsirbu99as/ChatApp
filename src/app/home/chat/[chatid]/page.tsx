'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Message, Chat } from '@/types/api'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import MessageList from '@/components/MessageList'
import CameraModal from '@/components/CameraModal'
import InviteUserModal from '@/components/InviteUserModal'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'
import { useToast } from '@/contexts/ToastContext'
import { Camera, MapPin, ArrowLeft, MoreVertical, Wifi, WifiOff, Paperclip, FileText, Loader2, X } from "lucide-react"

export default function ChatPage() {
  const { addToast } = useToast()
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
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string; size: number; type: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [photoCache, setPhotoCache] = useState<Record<string, string>>({})
  const router = useRouter()
  const params = useParams()
  const chatid = params.chatid as string
  const [chatname, setChatname] = useState<string>('')
  const [chatRole, setChatRole] = useState<'owner' | 'member' | null>(null)
  const { queue, isOnline, addToQueue, retryMessage, removeFromQueue, hasPending } = useOfflineQueue()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatid) {
      setIsInitialLoad(true)
      fetchMessages()
      fetchChatName()
      
      // Set up polling to fetch messages every 2 seconds
      const pollInterval = setInterval(() => {
        fetchMessages()
      }, 2000)
      
      return () => clearInterval(pollInterval)
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

  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      const container = messagesContainerRef.current
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100 // 100px threshold

      if (isInitialLoad || isAtBottom) {
        container.scrollTop = container.scrollHeight
        if (isInitialLoad) setIsInitialLoad(false)
      }
    }
  }, [messages, isInitialLoad])

  async function fetchChatName() {
    try {
      const res = await fetch('/api/chats')
      if (!res.ok) throw new Error('Failed to load chats')
      const data = await res.json()
      const allChats = data.chats as Chat[]

      const current = allChats.find((chat: Chat) => chat.chatid.toString() === chatid)

      if (current) {
        setChatname(current.chatname);
        setChatRole((current as any).role || null);
      } else {
        setChatname(`Chat ${chatid}`);
        setChatRole(null);
      }
    } catch (err) {
      setChatname(`Chat ${chatid}`)
      setChatRole(null)
    }
  }

  const fetchMessages = async () => {
    try {
      if (messages.length === 0) {
        setLoading(true)
      }
      const response = await fetch(`/api/messages?chatid=${chatid}&fromid=0`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      const data = await response.json()
      
      const fetchedMessages = data.messages || []
      const updatedPhotoCache = { ...photoCache }
      
      const myId = typeof window !== 'undefined' ? localStorage.getItem('userid') : null
      const unmatchedPhotoids = fetchedMessages
        .filter((msg: Message) => msg.photoid && msg.userid === myId && !updatedPhotoCache[msg.photoid])
        .map((msg: Message) => msg.photoid)
        .filter((photoid: string) => photoid !== undefined)
      
      const unmatchedTimestampPhotos = Object.entries(photoCache)
        .filter(([key]) => key.match(/^\d+$/) && key !== 'photoid')
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
      
      unmatchedPhotoids.forEach((photoid: string, index: number) => {
        if (unmatchedTimestampPhotos[index]) {
          const [timestampKey, photoData] = unmatchedTimestampPhotos[index]
          updatedPhotoCache[photoid] = photoData
        }
      })
      
      if (Object.keys(updatedPhotoCache).length > Object.keys(photoCache).length) {
        setPhotoCache(updatedPhotoCache)
      }
      
      setMessages(fetchedMessages)
    } catch (err) {
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
    if (!messageText.trim() && !capturedPhoto && !attachedFile) return
    
    const photoData = capturedPhoto ? capturedPhoto.substring(22) : ''
    
    //wenn offline zur Queue hinzufügen
    if (!isOnline) {
      addToQueue({
        chatid: chatid,
        text: messageText,
        photo: photoData,
        fileUrl: attachedFile?.url,
        fileName: attachedFile?.name,
        fileSize: attachedFile?.size,
        fileType: attachedFile?.type,
      })
      
      setMessageText('')
      setCapturedPhoto(null)
      setAttachedFile(null)
      return
    }

    // wenn Online Normal senden
    try {
      setSending(true)
      
      const payload = {
        text: messageText,
        chatid: chatid,
        photo: photoData,
        fileUrl: attachedFile?.url,
        fileName: attachedFile?.name,
        fileSize: attachedFile?.size,
        fileType: attachedFile?.type,
      }
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send message')
      }

      if (capturedPhoto) {
        const photoTimestamp = Date.now().toString()
        setPhotoCache(prev => ({
          ...prev,
          [photoTimestamp]: capturedPhoto,
        }))
      }

      setMessageText('')
      setCapturedPhoto(null)
      setAttachedFile(null)
      setIsInitialLoad(true)
      await fetchMessages()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      
      // bei Netzwerkfehler zur Queue hinzufügen
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        addToQueue({
          chatid: chatid,
          text: messageText,
          photo: photoData,
          fileUrl: attachedFile?.url,
          fileName: attachedFile?.name,
          fileSize: attachedFile?.size,
          fileType: attachedFile?.type,
        })
        setMessageText('')
        setCapturedPhoto(null)
        setAttachedFile(null)
      } else {
        // Error
      }
    } finally {
      setSending(false)
    }
  }

  const handleCapturePhoto = (imageData: string) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxWidth = 320
      const maxHeight = 240
      let width = img.width * 0.25
      let height = img.height * 0.25
      
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
        const compressedImage = canvas.toDataURL('image/png')
        setCapturedPhoto(compressedImage)
      }
    }
    img.src = imageData
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      addToast('File too large (max 10MB)', 'error')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const fileData = await response.json()
      setAttachedFile(fileData)
      addToast('File attached', 'success')
    } catch (err: any) {
      addToast(err.message || 'Failed to upload file', 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const accuracy = pos.coords.accuracy;
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude

        try {
          setSending(true)

          const response = await fetch('/api/messages/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: '',                 
              chatid: chatid,
              position: `${lat},${lng}`
            }),
          })

          const responseData = await response.json()

          if (!response.ok) {
            throw new Error(responseData.error || 'Failed to send location')
          }
          setIsInitialLoad(true)
          await fetchMessages()
          
        } catch (err) {
        } finally {
          setSending(false)
        }
      },
      (error) => {
        // Handle error silently or with appropriate UI (not popup)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
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
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-slate-900 truncate">
                {chatname}
              </h1>
              <p className="text-sm text-slate-500 truncate mt-0.5">
                {(() => {
                  // Extrahiere User die schon geschrieben haben aus Messages
                  const uniqueUsers = new Map<string, string>()
                  messages.forEach(msg => {
                    if (msg.userid && !uniqueUsers.has(msg.userid)) {
                      const displayName = msg.nickname || msg.usernick || msg.userid
                      uniqueUsers.set(msg.userid, displayName)
                    }
                  })
                  
                  const names = Array.from(uniqueUsers.values())
                  
                  if (names.length === 0) return 'No members yet'
                  if (names.length === 1) return names[0]
                  
                  return names.join(', ')
                })()}
              </p>
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
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setInviteDialogOpen(true)
                      }}
                      className="block w-full px-4 py-2 text-left text-base text-slate-700 hover:bg-slate-50 transition"
                      role="menuitem"
                    >
                      Invite user
                    </button>

                    {/* Leave Chat (nur für Members)*/}
                    {chatRole === 'member' && (
                      <>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={() => {
                            setMenuOpen(false)
                            setLeaveDialogOpen(true)
                          }}
                          className="block w-full px-4 py-2 text-left text-base text-red-600 hover:bg-red-50 transition"
                          role="menuitem"
                        >
                          Leave chat
                        </button>
                      </>
                    )}

                    {/* Delete Chat (nur für Owner) */}
                    {chatRole === 'owner' && (
                      <>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={() => {
                            setMenuOpen(false)
                            setDeleteDialogOpen(true)
                          }}
                          className="block w-full px-4 py-2 text-left text-base text-red-600 hover:bg-red-50 transition"
                          role="menuitem"
                        >
                          Delete chat
                        </button>
                      </>
                    )}
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
        {/* Pending Messages Indicator */}
        {queue.filter(q => q.chatid === chatid).length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm text-blue-700 font-medium">
                {queue.filter(q => q.chatid === chatid).length} Messages are sent...
              </span>
            </div>
            {queue.filter(q => q.chatid === chatid && q.status === 'error').map(msg => (
              <div key={msg.id} className="mt-2 flex items-center justify-between text-sm">
                <span className="text-red-600">Error: {msg.error}</span>
                <button
                  onClick={() => retryMessage(msg.id)}
                  className="text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ))}
          </div>
        )}

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
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />

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
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-base font-medium text-white hover:bg-red-600 transition active:scale-95"
                >
                  Remove
                </button>
              </div>
            )}

            {/* File Preview */}
            {attachedFile && (
              <div className="py-2.5 flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100 text-blue-600">
                  {attachedFile.type.startsWith('image/') ? (
                    <img src={attachedFile.url} alt="Preview" className="h-full w-full object-cover rounded" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{attachedFile.name}</div>
                  <div className="text-xs text-slate-500">{(attachedFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 text-slate-400 hover:text-red-500 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
              
            {/* Input Bar */}
            <div className="flex items-center gap-2 py-3.5">
              {/* Message Input mit Icons */}
              <div className="flex flex-1 min-w-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending || uploading}
                  className="flex-1 min-w-0 border-none bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

                {/* File Attachment Icon */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-50"
                  title="Attach file"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Paperclip className="h-5 w-5" />
                  )}
                </button>

                {/* Kamera-Icon */}
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  disabled={uploading || sending}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 active:scale-95 disabled:opacity-50"
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

              {/* Send Button mit Icon */}
              <button
                type="submit"
                disabled={sending || (!messageText.trim() && !capturedPhoto && !attachedFile)}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition shadow-sm active:scale-95 ${
                  sending || (!messageText.trim() && !capturedPhoto && !attachedFile)
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

      <InviteUserModal
        isOpen={isInviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        chatid={chatid}
        onInviteSent={(message) => {
          if (message.startsWith('Error')) {
            addToast(message, 'error')
          } else {
            addToast(message, 'success')
          }
        }}
      />

      {/* Leave-Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Leave Chat</DialogTitle>
          </DialogHeader>
          <p className="text-base text-slate-600">
            Are you sure you want to leave this chat? You won't be able to see messages anymore.
          </p>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setLeaveDialogOpen(false)}
              className="flex-1 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                leaveChat(chatid)
                  .then(() => {
                    addToast('Left chat successfully', 'success')
                    router.push('/home')
                  })
                  .catch(err => { 
                    addToast('Error leaving chat', 'error')
                  })
                  .finally(() => {
                    setLeaveDialogOpen(false)
                  })
              }}
              className="flex-1 text-base bg-red-500 text-white hover:bg-red-600"
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
            <DialogTitle className="text-2xl">Delete Chat</DialogTitle>
          </DialogHeader>
          <p className="text-base text-slate-600">
            Are you sure you want to delete this chat? You won't be able to restore it anymore.
          </p>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                deleteChat(chatid)
                  .then(() => {
                    addToast('Chat deleted successfully', 'success')
                    router.push('/home')
                  })
                  .catch(err => { 
                    addToast('Error deleting chat', 'error')
                  })
                  .finally(() => {
                    setDeleteDialogOpen(false)
                  })
              }}
              className="flex-1 text-base bg-red-500 text-white hover:bg-red-600"
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