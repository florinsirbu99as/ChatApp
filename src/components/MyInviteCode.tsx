'use client'
import { useEffect, useState } from 'react'

function readCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  //z.B. "token=abc123; userhash=f2Pf5z1W; ..."
  const hit = document.cookie.split('; ').find(c => c.startsWith(name + '='))
  //2. Teil nach dem = returnen
  return hit ? decodeURIComponent(hit.split('=')[1]) : ''
}

export default function MyInviteCode() {
  const [userhash, setUserhash] = useState('')
  useEffect(() => { setUserhash(readCookie('userhash')) }, [])
  return (
    <div style={{ padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
      <div>My Invite-Code:</div>
      <div>
        {userhash || '(no userhash available)'}
      </div>
    </div>
  )
}