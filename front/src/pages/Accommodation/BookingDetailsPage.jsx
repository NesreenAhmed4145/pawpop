import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { getBookingById, updateBooking, cancelBooking } from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import { StatusPill } from '../../components/booking/BookingCard';
import { assetUrl, formatDate } from '../../utils/formatters';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const fieldClass =
  'h-[46px] w-full rounded-lg border border-field-line bg-field px-3 text-[15px] text-ink outline-none focus:border-brand';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newIn, setNewIn] = useState('');
  const [newOut, setNewOut] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const result = await getBookingById(id);
        setBooking(result.data);
        setNewIn(String(result.data.CheckInDate).slice(0, 10));
        setNewOut(String(result.data.CheckOutDate).slice(0, 10));
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load this booking.'));
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const handleSave = async () => {
    setActionError('');
    setMessage('');
    if (!newIn || !newOut) {
      setActionError('Please choose both dates.');
      return;
    }
    setSaving(true);
    try {
      const result = await updateBooking(id, { CheckInDate: newIn, CheckOutDate: newOut });
      setBooking({ ...booking, ...result.data });
      setMessage('Your dates were updated. The host will confirm them again.');
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not update the booking.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;

    setCancelling(true);
    setActionError('');
    setMessage('');
    try {
      await cancelBooking(id);
      setBooking({ ...booking, Status: 'cancelled' });
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not cancel the booking.'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <p className="p-10 text-center text-text-muted">Loading...</p>;
  }

  if (error) {
    return <p className="p-10 text-center text-danger">{error}</p>;
  }

  const place = booking.Accommodation;
  const canCancel = booking.Status === 'pending' || booking.Status === 'confirmed';
  const nights = Math.round((new Date(booking.CheckOutDate) - new Date(booking.CheckInDate)) / MS_PER_DAY);
  const today = new Date().toISOString().slice(0, 10);

  const tiles = [
    ['Check-in', formatDate(booking.CheckInDate)],
    ['Check-out', formatDate(booking.CheckOutDate)],
    ['Nights', nights],
    ['Guests', booking.GuestsCount],
    ['Pets', booking.PetsCount],
    ['Total price', `${Number(booking.TotalPrice)} EGP`],
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/my-bookings" className="font-semibold text-brand">
          My bookings
        </Link>
        <span>/</span>
        <span className="font-semibold text-text-heading">Booking #{booking.BookingID}</span>
      </nav>

      <div className="mb-6 mt-4 flex flex-wrap items-center gap-4">
        <h1 className="text-4xl font-bold text-text-heading">Booking details</h1>
        <StatusPill status={booking.Status} />
      </div>

      <div className="flex flex-wrap items-start gap-10">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-6">
          <section className="flex flex-wrap items-center gap-6 rounded-3xl bg-surface p-3.5 shadow-card">
      <div className="flex h-36 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-page">
  {place.ImageURL ? (
    <img
      src={assetUrl(place.ImageURL)}
      alt={place.Title}
      className="h-full w-full object-cover"
    />
  ) : (
    <PawPrint size={40} className="text-line" />
  )}
</div>
            <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1.5 pr-3">
              {place.Type && <span className="text-[13px] font-bold text-brand">{place.Type}</span>}
              <h2 className="text-[22px] font-bold text-text-heading">{place.Title}</h2>
              <p className="text-sm text-text-secondary">{place.Location}</p>
              <Link
                to={`/accommodation/${place.AccommodationID}`}
                className="flex min-h-11 items-center text-sm font-semibold text-brand"
              >
                View place
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-5 rounded-3xl bg-surface p-8 shadow-card">
            <h2 className="text-[22px] font-bold text-text-heading">Stay details</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {tiles.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1 rounded-2xl bg-page p-4">
                  <span className="text-xs font-semibold text-text-secondary">{label}</span>
                  <strong className="text-base text-text-heading">{value}</strong>
                </div>
              ))}
            </div>
          </section>

          {canCancel && (
            <section className="flex flex-col gap-4 rounded-3xl bg-surface p-8 shadow-card">
              <h2 className="text-[22px] font-bold text-text-heading">Change your dates</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                  New check-in
                  <input type="date" min={today} value={newIn} onChange={(e) => setNewIn(e.target.value)} className={fieldClass} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
                  New check-out
                  <input type="date" min={newIn || today} value={newOut} onChange={(e) => setNewOut(e.target.value)} className={fieldClass} />
                </label>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-11 self-start rounded-full bg-brand px-7 font-semibold text-brand-contrast transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </section>
          )}

          {message && (
            <p className="rounded-xl bg-success-bg px-4 py-3 text-sm font-semibold text-success">{message}</p>
          )}
          {actionError && (
            <p className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">{actionError}</p>
          )}
        </div>

        <aside className="flex w-full flex-1 basis-72 flex-col gap-4 rounded-[28px] bg-surface p-7 shadow-card lg:max-w-sm">
          <h2 className="text-xl font-bold text-text-heading">Need to cancel?</h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            You can cancel a pending or confirmed booking. Once cancelled, the dates are released and this cannot be undone.
          </p>
          {canCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="h-11 rounded-full border border-danger font-semibold text-danger transition-colors hover:bg-danger-bg disabled:opacity-60"
            >
              {cancelling ? 'Cancelling...' : 'Cancel booking'}
            </button>
          ) : (
            <p className="rounded-xl bg-page px-4 py-3 text-sm font-semibold capitalize text-text-heading">
              This booking is {booking.Status}.
            </p>
          )}
          <div className="h-px bg-line" />
          <Link
            to="/my-bookings"
            className="flex h-11 items-center justify-center rounded-full border border-brand font-semibold text-brand transition-colors hover:bg-section"
          >
            Back to my bookings
          </Link>
        </aside>
      </div>
    </main>
  );
}