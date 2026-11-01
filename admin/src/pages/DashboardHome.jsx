import { useEffect, useState } from 'react'
import { getAccommodations, getBookings } from '../services/adminApi'
import StatusBadge from '../components/StatusBadge'

const money = (n) => Number(n || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })

export default function DashboardHome({ onNavigate }) {
  const [accommodations, setAccommodations] = useState([])
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([getAccommodations(), getBookings()])
      .then(([acc, bks]) => {
        if (!alive) return
        setAccommodations(acc)
        setBookings(bks)
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  if (loading) return <div className="text-cocoa/70 p-6 text-center">Loading…</div>
  if (error) return <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl m-6">{error}</div>

  const count = (status) => bookings.filter((b) => b.Status === status).length
  const revenue = bookings
    .filter((b) => b.Status === 'confirmed' || b.Status === 'completed')
    .reduce((sum, b) => sum + Number(b.TotalPrice || 0), 0)

  const pending = bookings.filter((b) => b.Status === 'pending').slice(0, 5)

  return (
    <div className="p-6 md:p-8 space-y-8 bg-sand-soft/30 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-cocoa">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-edge rounded-2xl p-6 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-medium text-cocoa/70">Accommodations</span>
          <strong className="text-3xl font-bold text-cocoa">{accommodations.length}</strong>
        </div>
        <div className="bg-white border border-edge rounded-2xl p-6 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-medium text-cocoa/70">Pending bookings</span>
          <strong className="text-3xl font-bold text-cocoa">{count('pending')}</strong>
        </div>
        <div className="bg-white border border-edge rounded-2xl p-6 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-medium text-cocoa/70">Confirmed</span>
          <strong className="text-3xl font-bold text-cocoa">{count('confirmed')}</strong>
        </div>
        <div className="bg-white border border-edge rounded-2xl p-6 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-medium text-cocoa/70">Completed</span>
          <strong className="text-3xl font-bold text-cocoa">{count('completed')}</strong>
        </div>
        <div className="bg-white border border-edge rounded-2xl p-6 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-medium text-cocoa/70">Cancelled</span>
          <strong className="text-3xl font-bold text-cocoa">{count('cancelled')}</strong>
        </div>
        <div className="bg-white border border-edge rounded-2xl p-6 shadow-sm flex flex-col gap-2">
          <span className="text-sm font-medium text-cocoa/70">Revenue (confirmed + completed)</span>
          <strong className="text-3xl font-bold text-cocoa">{money(revenue)}</strong>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-white border border-edge rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-cocoa">Bookings waiting for approval</h2>
          <button 
            className="px-4 py-2 text-sm font-medium bg-sand hover:bg-edge text-cocoa rounded-xl transition-all" 
            onClick={() => onNavigate('bookings')}
          >
            Manage bookings
          </button>
        </div>

        {pending.length === 0 ? (
          <p className="text-cocoa/70 py-4 text-sm">No pending bookings.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-edge text-xs font-semibold text-cocoa/70 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Accommodation</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/50 text-sm text-cocoa">
                {pending.map((b) => (
                  <tr key={b.BookingID} className="hover:bg-sand-soft/20 transition-colors">
                    <td className="py-4 px-4 font-medium">{b.BookingID}</td>
                    <td className="py-4 px-4">{b.Accommodation?.Title}</td>
                    <td className="py-4 px-4">{b.User?.FullName}</td>
                    <td className="py-4 px-4 text-cocoa/80">
                      {b.CheckInDate} → {b.CheckOutDate}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={b.Status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}