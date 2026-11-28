import { Link } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { assetUrl, formatDate } from '../../utils/formatters';
const STATUS_STYLES = {
  pending: 'border border-brand text-brand',
  confirmed: 'bg-success-bg text-success',
  cancelled: 'bg-danger-bg text-danger',
  completed: 'bg-page text-ink',
};

export function StatusPill({ status }) {
  return (
    <span
      className={`rounded-full px-3.5 py-1 text-xs font-bold capitalize ${
        STATUS_STYLES[status] || STATUS_STYLES.pending
      }`}
    >
      {status}
    </span>
  );
}

export default function BookingCard({ booking, onCancel, cancelling }) {
  const place = booking.Accommodation;
  const canCancel = booking.Status === 'pending' || booking.Status === 'confirmed';

  return (
    <article className="flex flex-wrap items-center gap-6 rounded-3xl bg-surface p-3.5 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lg">
   <div className="flex h-28 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-page">
  {place.ImageURL ? (
    <img
      src={assetUrl(place.ImageURL)}
      alt={place.Title}
      className="h-full w-full object-cover"
    />
  ) : (
    <PawPrint size={34} className="text-line" />
  )}
</div>
      <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-text-heading">{place.Title}</h2>
          <StatusPill status={booking.Status} />
        </div>
        <p className="text-sm text-text-secondary">{place.Location}</p>
        <p className="text-sm text-text-secondary">
          {formatDate(booking.CheckInDate)} → {formatDate(booking.CheckOutDate)} · {booking.GuestsCount} guest(s), {booking.PetsCount} pet(s)
        </p>
        <p className="text-sm text-text-secondary">
          Total: <strong className="text-text-heading">{Number(booking.TotalPrice)} EGP</strong>
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 pr-2">
        <Link
          to={`/my-bookings/${booking.BookingID}`}
          className="flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-hover"
        >
          View details
        </Link>
        {canCancel && (
          <button
            type="button"
            onClick={() => onCancel(booking.BookingID)}
            disabled={cancelling}
            className="h-11 rounded-full border border-danger px-6 text-sm font-semibold text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
          >
            {cancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </div>
    </article>
  );
}