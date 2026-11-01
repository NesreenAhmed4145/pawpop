import { useCallback, useEffect, useState } from 'react'
import { auth, setUnauthorizedHandler } from './services/adminApi'
import AdminLogin from './pages/AdminLogin'
import DashboardHome from './pages/DashboardHome'
import ManageAccommodations from './pages/ManageAccommodations'
import ManageBookings from './pages/ManageBookings'

const PAGES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'accommodations', label: 'Accommodations' },
  { key: 'bookings', label: 'Bookings' },
]

export default function App() {
  const [user, setUser] = useState(() => (auth.isAdminSession() ? auth.getUser() || {} : null))
  const [page, setPage] = useState('dashboard')

  const logout = useCallback(() => {
    auth.clear()
    setUser(null)
    setPage('dashboard')
  }, [])

  // لو أي طلب رجع 401/403 (توكن منتهي أو مش أدمن) نرجّع لصفحة الدخول
  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  if (!user) return <AdminLogin onLoggedIn={setUser} />

  return (
    <div className="flex min-h-screen bg-sand-soft/30 font-sans text-cocoa">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-edge flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          {/* Brand Logo / Title */}
          <div className="text-xl font-extrabold text-cocoa tracking-tight px-2">
            Pet Admin
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {PAGES.map((p) => (
              <button
                key={p.key}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                  page === p.key
                    ? 'bg-cocoa text-white shadow-sm'
                    : 'text-cocoa/70 hover:bg-sand-soft hover:text-cocoa'
                }`}
                onClick={() => setPage(p.key)}
              >
                {p.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer (User Info & Logout) */}
        <div className="pt-6 border-t border-edge space-y-4">
          <div className="text-xs text-cocoa/70 truncate px-1" title={user.FullName || user.Email}>
            {user.FullName || user.Email}
          </div>
          <button 
            className="w-full py-2.5 px-4 bg-sand hover:bg-edge text-cocoa font-medium text-sm rounded-xl transition-all" 
            onClick={logout}
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {page === 'dashboard' && <DashboardHome onNavigate={setPage} />}
        {page === 'accommodations' && <ManageAccommodations />}
        {page === 'bookings' && <ManageBookings />}
      </main>
    </div>
  )
}