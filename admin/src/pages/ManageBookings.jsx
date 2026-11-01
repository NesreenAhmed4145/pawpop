import { useCallback, useEffect, useMemo, useState } from 'react'
import { getBookings, updateBooking, updateBookingStatus } from '../services/adminApi'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import BookingStatusActions, { ALLOWED_TRANSITIONS } from '../components/BookingStatusActions'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

const CONFIRM_TEXT = {
  confirmed: 'Confirm this booking?',
  cancelled: 'Cancel this booking? This cannot be undone.',
  completed: 'Mark this booking as completed? This cannot be undone.',
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    try {
      setBookings(await getBookings())
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings.filter((b) => {
      if (filter !== 'all' && b.Status !== filter) return false
      if (!q) return true
      return [b.BookingID, b.Accommodation?.Title, b.User?.FullName, b.User?.Email]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [bookings, filter, search])

  const changeStatus = async (booking, status) => {
    if (!window.confirm(CONFIRM_TEXT[status])) return
    setBusyId(booking.BookingID)
    try {
      await updateBookingStatus(booking.BookingID, status)
      setNotice({ type: 'success', text: `Booking #${booking.BookingID} is now ${status}.` })
      await load()
      setEditing((cur) => (cur && cur.BookingID === booking.BookingID ? null : cur))
    } catch (err) {
      setNotice({ type: 'error', text: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const handleSaved = async (id) => {
    setEditing(null)
    setNotice({ type: 'success', text: `Booking #${id} updated.` })
    await load()
  }

  return (
    <div className="p-6 md:p-8 space-y-6 bg-sand-soft/30 min-h-screen font-sans text-cocoa">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-cocoa">Bookings</h1>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div 
          className={`p-4 rounded-xl text-sm border cursor-pointer transition-all ${
            notice.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-600' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
          onClick={() => setNotice(null)}
        >
          {notice.text}
        </div>
      )}

      {/* Toolbar (Tabs & Search) */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white border border-edge rounded-2xl p-1.5 shadow-sm">
          {FILTERS.map((f) => {
            const count = f === 'all' ? bookings.length : bookings.filter((b) => b.Status === f).length
            return (
              <button
                key={f}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-cocoa text-white shadow-sm'
                    : 'text-cocoa/70 hover:bg-sand-soft hover:text-cocoa'
                }`}
                onClick={() => setFilter(f)}
              >
                <span>{f}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-sand-soft text-cocoa'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <input
          className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-edge bg-white focus:outline-none focus:border-cocoa text-cocoa text-sm shadow-sm transition-all"
          placeholder="Search by ID, guest or accommodation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-edge rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-cocoa/70 p-8 text-center text-sm">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-cocoa/70 p-8 text-center text-sm">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-edge text-xs font-semibold text-cocoa/70 uppercase tracking-wider bg-sand-soft/20">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Accommodation</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Guests / Pets</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Change status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/50 text-sm text-cocoa">
                {visible.map((b) => (
                  <tr key={b.BookingID} className="hover:bg-sand-soft/20 transition-colors">
                    <td className="py-3 px-4 font-medium">{b.BookingID}</td>
                    <td className="py-3 px-4">
                      <strong className="block">{b.Accommodation?.Title}</strong>
                      <div className="text-xs text-cocoa/60">{b.Accommodation?.Location}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{b.User?.FullName}</div>
                      <div className="text-xs text-cocoa/60">{b.User?.Email}</div>
                    </td>
                    <td className="py-3 px-4 text-cocoa/80 text-xs">
                      {b.CheckInDate} → {b.CheckOutDate}
                    </td>
                    <td className="py-3 px-4">{b.GuestsCount} / {b.PetsCount}</td>
                    <td className="py-3 px-4 font-semibold">{money(b.TotalPrice)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.Status} />
                    </td>
                    <td className="py-3 px-4">
                      <BookingStatusActions booking={b} busy={busyId === b.BookingID} onChange={changeStatus} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-sand hover:bg-edge text-cocoa rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => setEditing(b)}
                        disabled={(ALLOWED_TRANSITIONS[b.Status] || []).length === 0}
                        title={
                          (ALLOWED_TRANSITIONS[b.Status] || []).length === 0
                            ? 'Cancelled and completed bookings cannot be edited'
                            : 'Edit booking'
                        }
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <EditBookingModal
          booking={editing}
          busy={busyId === editing.BookingID}
          onStatusChange={changeStatus}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

function EditBookingModal({ booking, busy, onStatusChange, onClose, onSaved }) {
  const [form, setForm] = useState({
    CheckInDate: booking.CheckInDate,
    CheckOutDate: booking.CheckOutDate,
    GuestsCount: booking.GuestsCount,
    PetsCount: booking.PetsCount,
    TotalPrice: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        CheckInDate: form.CheckInDate,
        CheckOutDate: form.CheckOutDate,
        GuestsCount: Number(form.GuestsCount),
        PetsCount: Number(form.PetsCount),
      }
      if (form.TotalPrice !== '') payload.TotalPrice = Number(form.TotalPrice)

      await updateBooking(booking.BookingID, payload)
      await onSaved(booking.BookingID)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={`Edit booking #${booking.BookingID}`} onClose={onClose}>
      <div className="flex items-center justify-between p-4 bg-sand-soft/40 border border-edge rounded-2xl mb-6">
        <div>
          <strong className="block text-cocoa font-semibold">{booking.Accommodation?.Title}</strong>
          <div className="text-xs text-cocoa/70 mt-0.5">
            {booking.User?.FullName} · {booking.User?.Email}
          </div>
        </div>
        <StatusBadge status={booking.Status} />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {error && <div className="col-span-full bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Check-in</span>
          <input 
            type="date" 
            value={form.CheckInDate} 
            onChange={set('CheckInDate')} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Check-out</span>
          <input 
            type="date" 
            value={form.CheckOutDate} 
            onChange={set('CheckOutDate')} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Guests</span>
          <input 
            type="number" 
            min="1" 
            step="1" 
            value={form.GuestsCount} 
            onChange={set('GuestsCount')} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa">
          <span>Pets</span>
          <input 
            type="number" 
            min="1" 
            step="1" 
            value={form.PetsCount} 
            onChange={set('PetsCount')} 
            required 
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-cocoa col-span-full">
          <span>Total price override (optional)</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.TotalPrice}
            onChange={set('TotalPrice')}
            placeholder={`Current: ${money(booking.TotalPrice)} — leave empty to keep / auto-calculate`}
            className="w-full px-4 py-2.5 rounded-xl border border-edge bg-sand-soft/30 focus:outline-none focus:border-cocoa text-cocoa transition-all"
          />
          <small className="text-xs text-cocoa/60 font-normal">
            If you change the dates and leave this empty, the price is recalculated from the nightly rate.
          </small>
        </label>

        <div className="col-span-full flex items-center justify-end gap-3 pt-4 border-t border-edge mt-2">
          <button 
            type="button" 
            className="px-5 py-2.5 bg-sand hover:bg-edge text-cocoa font-medium rounded-xl text-sm transition-all"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-cocoa hover:bg-cocoa-hover text-white font-medium rounded-xl text-sm shadow-sm transition-all disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-edge">
        <h3 className="text-sm font-bold text-cocoa mb-3">Booking status</h3>
        <BookingStatusActions booking={booking} busy={busy} onChange={onStatusChange} />
      </div>
    </Modal>
  )
}