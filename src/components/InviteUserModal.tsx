'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/types/api'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  chatid: string
  onInviteSent: (message: string) => void
}

export default function InviteUserModal({ 
  isOpen, 
  onClose, 
  chatid,
  onInviteSent 
}: InviteUserModalProps) {

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [inviting, setInviting] = useState<string | null>(null)

  // Lädt alle verfügbaren Profile, sobald das Modal geöffnet wird
  useEffect(() => {
    if (isOpen) {
      fetchProfiles()
    }
  }, [isOpen])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profiles')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profiles')
      }
      
      const data = await response.json()
      console.log('Profiles data:', data)
      setProfiles(data.profiles || data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
      onInviteSent('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (profile: Profile) => {
    try {
      setInviting(profile.userid)

      console.log('Inviting profile:', profile)

      // Nutze den userhash als Invite-Code (so wie es bei dir funktioniert hat)
      // bevorzugt userhash, sonst hash (wie im Log zu sehen)
        const invitedHash = profile.userhash || (profile as any).hash


      console.log('Using invitedHash:', invitedHash)

      if (!invitedHash) {
        onInviteSent('Error: This user has no invite code.')
        setInviting(null)
        return
      }

      const response = await fetch('/api/chats/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chatid: Number(chatid), 
          invitedhash: invitedHash,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Invite failed')
      }
      
      onInviteSent(`Invitation sent to ${profile.nickname || profile.userid}`)
      onClose()
    } catch (error: any) {
      onInviteSent('Error: ' + error.message)
    } finally {
      setInviting(null)
    }
  }

  // Filtert Profile nach Suchbegriff
  const filteredProfiles = profiles.filter(profile => {
    const searchLower = searchTerm.toLowerCase()
    return (
      profile.nickname?.toLowerCase().includes(searchLower) ||
      profile.fullname?.toLowerCase().includes(searchLower) ||
      profile.userid?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Invite User to Chat</DialogTitle>
        </DialogHeader>

        {/* Suchfeld */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profil-Liste */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 mt-2">Loading users...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">
                {searchTerm ? 'No users found' : 'No users available'}
              </p>
            </div>
          ) : (
            filteredProfiles.map((profile, index) => (
              <div
                key={`${profile.userhash || profile.userid || 'profile'}-${index}`}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {profile.nickname || profile.userid}
                  </p>
                  {profile.fullname && (
                    <p className="text-sm text-slate-600 truncate">
                      {profile.fullname}
                    </p>
                  )}
                </div>
                
                <Button
                  onClick={() => handleInvite(profile)}
                  disabled={inviting === profile.userid}
                  className="ml-3 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {inviting === profile.userid ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      Inviting...
                    </span>
                  ) : (
                    'Invite'
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
