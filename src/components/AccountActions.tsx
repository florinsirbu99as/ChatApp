'use client'

export default function AccountActions() {
  const handleLogout = async () => {
    try {
      console.log('[Logout] wird aufgerufen');
      const res = await fetch('/api/logout', { method: 'POST' })
      console.log('[Logout] Antwort:', res.status);
      if (res.ok) {
        localStorage.removeItem('userid');
        document.cookie = 'userhash=; Max-Age=0; path=/;'
        window.location.href = '/'
      } else {
        const data = await res.json().catch(() => ({}))
        alert('Error while logging out: ' + (data?.error || 'Unknown error'))
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Logout-Error:', err)
      alert('Network error while logging out.')
      window.location.href = '/'
    }
  }

  const handleDeregister = async () => {
    if (!confirm('Do you really want to delete your account? This action cannot be undone.')) return

    try {
      const res = await fetch('/api/deregister', { method: 'POST' })
      if (res.ok) {
        localStorage.removeItem('userid');
        document.cookie = 'userhash=; Max-Age=0; path=/;'
        alert('Account deleted.')
        window.location.href = '/'
      } else {
        const data = await res.json().catch(() => ({}))
        alert('Error deleting your account: ' + (data?.error || 'Unknown error'))
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Deregistration-error:', err)
      alert('Network error while deleting.')
      window.location.href = '/'
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleLogout}
        className="w-full bg-slate-200 text-slate-900 text-base py-3 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
      >
        Log out
      </button>

      <button
        onClick={handleDeregister}
        className="w-full bg-red-500 text-white text-base py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
      >
        Delete account
      </button>
    </div>
  )
}