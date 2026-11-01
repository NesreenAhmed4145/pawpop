import { useState } from 'react'
import { login } from '../services/adminApi'

export default function AdminLogin({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      onLoggedIn(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand-soft flex items-center justify-center px-4">
      <form 
        className="w-full max-w-md bg-white border border-edge rounded-2xl shadow-sm p-8 flex flex-col gap-6" 
        onSubmit={handleSubmit}
      >
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold text-cocoa mb-1">Admin Login</h1>
          <p className="text-sm text-cocoa/70">Sign in with an admin account to manage accommodations and bookings.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Email</span>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            autoFocus 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Password</span>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <button 
          className="w-full py-3 px-4 bg-cocoa hover:bg-cocoa-hover text-white font-medium rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}