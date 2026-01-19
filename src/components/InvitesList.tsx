'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface Invite {
  chatid: string
  chatname: string
  invitedhash: string
}

interface InvitesListProps {
  onInviteAccepted: () => void
}

export default function InvitesList({ onInviteAccepted }: InvitesListProps) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)

  useEffect(() => {
    fetchInvites()
    //aktualisiert Invites alle 10 Sekunden
    const interval = setInterval(fetchInvites, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch invites')
      }
      
      const data = await response.json()
      setInvites(data.invites || data || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleJoinChat = async (chatid: string) => {
    try {
      setJoining(chatid)
      
      const response = await fetch('/api/chats/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatid: Number(chatid) }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join chat')
      }
      
      //Entfernt Invite aus der Liste
      setInvites(prev => prev.filter(invite => invite.chatid !== chatid))
      
      //Benachrichtigt Parent-Komponente
      onInviteAccepted()
    } catch (error: any) {
    } finally {
      setJoining(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 mt-2 text-sm">Loading invites...</p>
        </div>
      </div>
    )
  }

  if (invites.length === 0) {
    return null //zeigt nichts an, wenn keine Invites vorhanden sind
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Chat Invitations ({invites.length})
        </h2>
        <button
          onClick={fetchInvites}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {invites.map((invite) => (
          <div
            key={invite.chatid}
            className="bg-white border border-purple-200 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {invite.chatname || `Chat ${invite.chatid}`}
              </p>
              <p className="text-sm text-slate-600">
                You've been invited to join this chat
              </p>
            </div>

            <Button
              onClick={() => handleJoinChat(invite.chatid)}
              disabled={joining === invite.chatid}
              className="ml-3 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {joining === invite.chatid ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                  Joining...
                </span>
              ) : (
                'Join'
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}