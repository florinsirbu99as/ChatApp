'use client'

export default function AccountActions() {
  const handleLogout = async () => {
    try {
    console.log('[Logout] wird aufgerufen');
      const res = await fetch('/api/logout', { method: 'POST' })
      console.log('[Logout] Antwort:', res.status);
      if (res.ok) {
        localStorage.removeItem('userid');
        // Go back to the login page
        window.location.href = '/'
      } else {
        const data = await res.json().catch(() => ({}))
        alert('Error while logging out: ' + (data?.error || 'Unknown error'))
        // As a fallback, still send the user to login
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Logout-Error:', err)
      alert('Network error while logging out.')
      // Fallback redirect to login even if request errored
      window.location.href = '/'
    }
  }

  const handleDeregister = async () => {
    if (!confirm('Do you really want to delete your account?')) return

    try {
      const res = await fetch('/api/deregister', { method: 'POST' })
      if (res.ok) {
        localStorage.removeItem('userid');
        alert('Account deleted.')
        // After account deletion, go to login
        window.location.href = '/'
      } else {
        const data = await res.json().catch(() => ({}))
        alert('Error deleting your account: ' + (data?.error || 'Unknown error'))
        // Safe fallback redirect
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Deregistration-error:', err)
      alert('Netzwork-error while deleting.')
      // Fallback redirect on error
      window.location.href = '/'
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      <button
        onClick={handleLogout}
        className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
      >
        Log out
      </button>

      <button
        onClick={handleDeregister}
        className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
      >
        Delete account
      </button>
    </div>
  )
}
