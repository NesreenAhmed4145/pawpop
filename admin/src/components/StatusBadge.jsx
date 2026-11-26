const STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-sky-50 text-sky-700 border-sky-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

const DOTS = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-500',
  completed: 'bg-sky-500',
  cancelled: 'bg-red-500',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        STYLES[status] || 'bg-sand-soft text-cocoa border-edge'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status] || 'bg-cocoa/40'}`} />
      {status}
    </span>
  )
}
