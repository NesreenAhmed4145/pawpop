import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import BookingCard from '../../components/booking/BookingCard';

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const result = await getMyBookings();
        setBookings(result.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load your bookings.'));
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;

    setCancellingId(bookingId);
    setActionError('');
    try {
      await cancelBooking(bookingId);
      setBookings(
        bookings.map((b) => (b.BookingID === bookingId ? { ...b, Status: 'cancelled' } : b))
      );
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not cancel the booking.'));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <p className="p-10 text-center text-text-muted">Loading...</p>;
  }

  if (error) {
    return <p className="p-10 text-center text-danger">{error}</p>;
  }

  const visibleBookings = tab === 'all' ? bookings : bookings.filter((b) => b.Status === tab);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-7 px-4 pb-20 pt-8 sm:px-8">
      <h1 className="text-4xl font-bold text-text-heading">My bookings</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`min-h-11 rounded-full px-5 text-sm capitalize transition-colors ${
              tab === name
                ? 'bg-brand font-semibold text-brand-contrast'
                : 'border border-line bg-surface font-medium text-ink hover:border-brand'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">{actionError}</p>
      )}

      {visibleBookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 rounded-[28px] border border-line bg-surface px-6 py-14 text-center">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-page">
            <CalendarDays size={32} className="text-brand" />
          </div>
          <h2 className="text-[22px] font-bold text-text-heading">
            {bookings.length === 0 ? 'You have no bookings yet' : `No ${tab} bookings`}
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed text-text-body">
            When you book a stay for your pet, it will show up here.
          </p>
          <Link
            to="/accommodation"
            className="flex h-11 items-center rounded-full bg-brand px-8 font-semibold text-brand-contrast transition-colors hover:bg-brand-hover"
          >
            Find a place
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {visibleBookings.map((booking) => (
            <BookingCard
              key={booking.BookingID}
              booking={booking}
              onCancel={handleCancel}
              cancelling={cancellingId === booking.BookingID}
            />
          ))}
        </div>
      )}
    </main>
  );
}