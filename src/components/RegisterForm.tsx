'use client'

export default function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const handleRegister = async () => {
    const username = (document.querySelector('input[name="username"]') as HTMLInputElement)?.value;
    const firstName = (document.querySelector('input[placeholder="John"]') as HTMLInputElement)?.value;
    const lastName = (document.querySelector('input[placeholder="Doe"]') as HTMLInputElement)?.value;
    const password = (document.querySelector('input[placeholder="Create a strong password"]') as HTMLInputElement)?.value;
    const confirm = (document.querySelector('input[placeholder="Confirm your password"]') as HTMLInputElement)?.value;

    if (!username || !firstName || !lastName || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match!");
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
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
        Welcome
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
          Username
        </label>
        <input
          type="text"
          name="username"
          placeholder="johndoe"
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

      <button 
        onClick={handleRegister}
        className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        Create Account
      </button>

      <div className="text-center pt-1">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}
