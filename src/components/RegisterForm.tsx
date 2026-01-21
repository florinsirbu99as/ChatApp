'use client'

import { useToast } from '@/contexts/ToastContext';

export default function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { addToast } = useToast();

  const handleRegister = async () => {
    const username = (document.querySelector('input[name="username"]') as HTMLInputElement)?.value;
    const firstName = (document.querySelector('input[placeholder="John"]') as HTMLInputElement)?.value;
    const lastName = (document.querySelector('input[placeholder="Doe"]') as HTMLInputElement)?.value;
    const password = (document.querySelector('input[placeholder="Create a strong password"]') as HTMLInputElement)?.value;
    const confirm = (document.querySelector('input[placeholder="Confirm your password"]') as HTMLInputElement)?.value;

    if (!username || !firstName || !lastName || !password) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }

    const formData = new FormData();
    formData.append("userid", username);
    formData.append("password", password);
    formData.append("firstname", firstName);
    formData.append("lastname", lastName);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        addToast('Registration successful!', 'success');
        window.location.reload(); 
      } else {
        addToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      addToast('An error occurred during registration', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 text-center">
        Welcome
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            placeholder="John"
            className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Doe"
            className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          placeholder="johndoe"
          className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Password
        </label>
        <input
          type="password"
          placeholder="Create a strong password"
          className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Confirm your password"
          className="w-full px-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>

      <button 
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white py-3 text-base font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Account
      </button>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}