'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700">
      <div className="flex items-center justify-center min-h-screen p-4 py-8">
        <div className="w-full max-w-md max-h-screen overflow-y-auto">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">ChatApp</h1>
            <p className="text-blue-100">Connect with friends instantly</p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8">
            {/* Toggle Buttons */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  isLogin
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  !isLogin
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {isLogin ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
                  Welcome Back
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button className="text-sm text-blue-500 hover:text-blue-700">
                    Forgot password?
                  </button>
                </div>
                /*____________BUTTON SIGN IN START________________ */
                <button
                  onClick={async () => {
                    const email = (document.querySelector('input[type="email"]') as HTMLInputElement).value;
                    const password = (document.querySelector('input[type="password"]') as HTMLInputElement).value;

                    const formData = new FormData();
                    formData.append('userid', email);
                    formData.append('password', password);

                    try {
                      const res = await fetch('/api/login', {
                        method: 'POST',
                        body: formData,
                      });

                      const data = await res.json();
                      console.log('Antwort vom Server:', data);

                      if (res.ok) {
                        alert('Log in succesful!');
                      } else {
                        alert('Error: ' + (data.error || 'Unknown error'));
                      }
                    } catch (err) {
                      console.error('Fehler beim Login:', err);
                    }
                  }}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Sign In
                </button>
                /*____________BUTTON SIGN IN END________________ */


                <div className="text-center">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* Register Form */
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Create Account
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="john.doe@example.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex items-start pt-1">
                  <input 
                    type="checkbox" 
                    className="mt-1 rounded border-gray-300 text-blue-500 focus:ring-blue-500" 
                  />
                  <span className="ml-2 text-sm text-gray-600 leading-tight">
                    I agree to the{' '}
                    <button className="text-blue-500 hover:text-blue-700">Terms of Service</button>
                    {' '}and{' '}
                    <button className="text-blue-500 hover:text-blue-700">Privacy Policy</button>
                  </span>
                </div>
                /*____________BUTTON REGISTER START________________ */
                <button
                  onClick={async () => {
                    const firstName = (document.querySelector('input[placeholder="John"]') as HTMLInputElement)?.value;
                    const lastName = (document.querySelector('input[placeholder="Doe"]') as HTMLInputElement)?.value;
                    const email = (document.querySelector('input[placeholder="john.doe@example.com"]') as HTMLInputElement)?.value;
                    const password = (document.querySelector('input[placeholder="Create a strong password"]') as HTMLInputElement)?.value;
                    const confirm = (document.querySelector('input[placeholder="Confirm your password"]') as HTMLInputElement)?.value;

                    if (!firstName || !lastName || !email || !password) {
                      alert("Please fill in all required fields.");
                      return;
                    }

                    if (password !== confirm) {
                      alert("Passwords do not match!");
                      return;
                    }

                    const formData = new FormData();
                    formData.append("userid", email);
                    formData.append("password", password);
                    formData.append("nickname", firstName);
                    formData.append("fullname", `${firstName} ${lastName}`);

                    try {
                      const res = await fetch("/api/register", {
                        method: "POST",
                        body: formData,
                      });

                      const data = await res.json();
                      console.log("Antwort vom Server:", data);

                      if (res.ok) {
                        alert("You created an account! You can now sign in.");
                        window.location.reload(); 
                      } else {
                        alert("Error: " + (data.error || "Unknown error"));
                      }
                    } catch (err) {
                      console.error("Registration failed:", err);
                      alert("Network error or server unavailable.");
                    }
                  }}
                  className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Create Account
                </button>
                /*____________BUTTON REGISTER END________________ */


                <div className="text-center pt-1">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-blue-100 text-sm">
              © 2025 ChatApp. Made with ❤️ for seamless communication.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}