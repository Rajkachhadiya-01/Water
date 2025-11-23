// client/src/components/Login.jsx
import React, { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin, onNotify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const demoAccounts = [
    { role: 'Admin', email: 'admin@example.com', pass: 'adminpass' },
    { role: 'Driver', email: 'driver@example.com', pass: 'driverpass' },
    { role: 'Customer', email: 'customer@example.com', pass: 'customerpass' }
  ];

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const r = await login(email, password);
      if (!r.token) {
        onNotify({ type: "error", text: r.error || "Login failed" });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", r.token);
      localStorage.setItem("role", r.user.role);
      localStorage.setItem("userName", r.user.name);
      localStorage.setItem("userEmail", r.user.email);

      onNotify({ type: "success", text: `Welcome back, ${r.user.name}!` });
      setTimeout(() => onLogin(r.user.role), 800);
    } catch (err) {
      onNotify({ type: "error", text: err?.error || "Login failed" });
      setLoading(false);
    }
  }

  function quickLogin(acc) {
    setEmail(acc.email);
    setPassword(acc.pass);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mineral Water</h1>
            <p className="text-gray-500 mt-2">Delivery Management System</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-center text-gray-500 mb-3">Quick Login (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => quickLogin(acc)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Secure & Encrypted Connection 🔒
        </p>
      </div>
    </div>
  );
}