'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountActions from '@/components/AccountActions'
import type { Chat } from '@/types/api'
import MyInviteCode from '@/components/MyInviteCode'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'  // Importiere Button von ShadCN

export default function HomePage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setDialogOpen] = useState(false) 
  const [chatName, setChatName] = useState('') 
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

  //Neuen Chat erstellen
  const createChat = async (chatname: string) => {
    const response = await fetch('/api/chats/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatname }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Create failed')
    return data
  }

  const handleCreateChat = async () => {
    if (!chatName.trim()) return
    try {
      await createChat(chatName)
      await fetchChats()
      setDialogOpen(false)  // Schließt das Dialog-Fenster nach erfolgreicher Erstellung
      setChatName('')  // Setzt den Chatnamen zurück
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
     // Inhalt der Home-Seite
    <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1>Home</h1>
      <p>You are logged in.</p>


      <MyInviteCode />



      {/*Neuer Chat Button*/}
      <Button
        onClick={() => setDialogOpen(true)}  // Öffnet das Dialog für den neuen Chat
        style={{ padding: 10, backgroundColor: '#28a745', color: '#fff', borderRadius: 4, marginBottom: 12 }}
      >
        New Chat
      </Button>

      {/*Chats Ausgabe*/}
      <div>
        <h2>Your Chats</h2>
        {loading && <p>Loading chats...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {Array.isArray(chats) && chats.map((chat) => (
            <Button
              key={chat.chatid}
              onClick={() => handleChatClick(chat.chatid)}
              style={{
                padding: 12,
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
              }}
            >
              {chat.chatname || `Chat ${chat.chatid}`}
            </Button>
          ))}

          {!loading && (!Array.isArray(chats) || chats.length === 0) && (
            <p>No chats available yet.</p>
          )}
        </div>
      </div>

      

      <AccountActions />

      {/* Dialog für Chat erstellen */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new chat</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Enter chat name"
            style={{ padding: 8, width: '100%' }}
          />
          <DialogFooter>
            <Button onClick={handleCreateChat} style={{ backgroundColor: '#28a745', color: 'white' }}>
              Create Chat
            </Button>
            <Button onClick={() => setDialogOpen(false)} style={{ backgroundColor: '#6c757d', color: 'white' }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
