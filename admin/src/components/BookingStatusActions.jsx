// نفس الانتقالات المسموحة في الباك إند (bookingController ALLOWED_TRANSITIONS)
export const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
}

// لون الزرار = لون الحالة اللي هتتحول لها (نفس ألوان StatusBadge)
const BUTTONS = {
  confirmed: {
    label: 'Confirm',
    cls: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300',
    icon: 'M5 13l4 4L19 7',
  },
  completed: {
    label: 'Complete',
    cls: 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700 focus-visible:ring-sky-300',
    icon: 'M5 13l4 4L19 7M12 13l4 4 4-4',
  },
  cancelled: {
    label: 'Cancel',
    cls: 'bg-white text-red-600 border-red-300 hover:bg-red-50 focus-visible:ring-red-200',
    icon: 'M6 6l12 12M18 6L6 18',
  },
}

export default function BookingStatusActions({ booking, busy, onChange }) {
  const next = ALLOWED_TRANSITIONS[booking.Status] || []

  if (next.length === 0) {
    return <span className="text-xs italic text-cocoa/50">No further actions</span>
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {next.map((status) => {
        const { label, cls, icon } = BUTTONS[status]
        return (
          <button
            key={status}
            type="button"
            disabled={busy}
            onClick={() => onChange(booking, status)}
            className={`inline-flex h-8 min-w-[92px] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${cls}`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={icon} />
            </svg>
            {label}
          </button>
        )
      })}
    </div>
  )
}
