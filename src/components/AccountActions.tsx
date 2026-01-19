'use client'

export default function AccountActions() {
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' })
      if (res.ok) {
        localStorage.removeItem('userid');
        document.cookie = 'userhash=; Max-Age=0; path=/;'
        window.location.href = '/'
      } else {
        window.location.href = '/'
      }
    } catch (err) {
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
        window.location.href = '/'
      } else {
        window.location.href = '/'
      }
    } catch (err) {
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