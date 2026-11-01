// نفس الانتقالات المسموحة في الباك إند (bookingController ALLOWED_TRANSITIONS)
export const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
}

const LABELS = { confirmed: 'Confirm', cancelled: 'Cancel', completed: 'Complete' }
const VARIANTS = { confirmed: 'btn-success', cancelled: 'btn-danger', completed: 'btn-primary' }

export default function BookingStatusActions({ booking, busy, onChange }) {
  const next = ALLOWED_TRANSITIONS[booking.Status] || []
  if (next.length === 0) return <span className="muted">No actions</span>

  return (
    <div className="btn-row">
      {next.map((status) => (
        <button
          key={status}
          type="button"
          className={`btn btn-sm ${VARIANTS[status]}`}
          disabled={busy}
          onClick={() => onChange(booking, status)}
        >
          {LABELS[status]}
        </button>
      ))}
    </div>
  )
}
