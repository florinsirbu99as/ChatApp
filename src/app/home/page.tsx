'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountActions from '@/components/AccountActions'
import InvitesList from '@/components/InvitesList'
import type { Chat } from '@/types/api'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setDialogOpen] = useState(false) 
  const [chatName, setChatName] = useState('') 
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      fetchChats()
    }
  }, [isHydrated])

  const fetchChats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chats')

      if (!response.ok) {
        throw new Error('Failed to fetch chats')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setChats(data)
      } else if (data && typeof data === 'object') {
        setChats(data.chats || data.data || [])
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

  const handleChatClick = (chatid: string) => {
    router.push(`/home/chat/${chatid}`)
  }

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
      setDialogOpen(false)
      setChatName('')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleInviteAccepted = () => {
    fetchChats()
  }

  if (!isHydrated) {
    return (
      <main className="bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gradient-to-br from-slate-50 to-slate-100" suppressHydrationWarning>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
              <p className="text-sm text-slate-600 mt-1">Stay connected with your chats</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8" suppressHydrationWarning>
        {/* Invites Liste */}
        <InvitesList onInviteAccepted={handleInviteAccepted} />

        {/* New Chat Button */}
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full h-12 mb-6 bg-blue-600 hover:bg-blue-700 text-base text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          + New Chat
        </Button>

        {/* Chats Section */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Chats</h2>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-sm text-slate-600 mt-3">Loading your chats...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 font-medium">Error loading chats</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {Array.isArray(chats) && chats.length > 0 ? (
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <button
                      key={chat.chatid}
                      onClick={() => handleChatClick(chat.chatid)}
                      className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 active:scale-95"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-slate-900">
                            {chat.chatname || `Chat ${chat.chatid}`}
                          </h3>
                        </div>
                        <div className="text-blue-600 ml-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                  <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-base text-slate-600 font-medium">No chats yet</p>
                  <p className="text-sm text-slate-500 mt-1">Create your first chat to get started</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Account Actions */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <AccountActions />
        </div>
      </div>

      {/* Create Chat Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create a new chat</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Enter chat name"
            className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateChat()
              }
            }}
          />
          <DialogFooter className="gap-3">
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outline"
              className="flex-1 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              className="flex-1 text-base bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}