'use client'

import AccountActions from '@/components/AccountActions'

export default function HomePage() {
  return (
    <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1>Home</h1>
      <p>You are logged in.</p>
      <AccountActions />
    </main>
  )
}
