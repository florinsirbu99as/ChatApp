'use client'

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const handleLogin = async () => {
    const username = (document.querySelector('input[name="username"]') as HTMLInputElement).value;
    const password = (document.querySelector('input[type="password"]') as HTMLInputElement).value;

    const formData = new FormData();
    formData.append('userid', username);
    formData.append('password', password);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('userid', username);
        window.location.href = '/home'
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error or server unavailable.')
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Welcome
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <button 
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        Log In
      </button>

      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
