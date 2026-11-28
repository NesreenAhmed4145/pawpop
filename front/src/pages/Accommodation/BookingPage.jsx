import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAccommodationById } from '../../services/accommodationService';
import { createBooking } from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import BookingForm from '../../components/booking/BookingForm';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // التواريخ اللي المستخدم اختارها في صفحة التفاصيل بتيجي في الرابط بعد علامة ?
  const [searchParams] = useSearchParams();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const result = await getAccommodationById(id);
        setPlace(result.data);
      } catch (err) {
        setLoadError(getErrorMessage(err, 'Could not load this place.'));
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [id]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await createBooking({
        AccommodationID: Number(id),
        ...values,
      });
      navigate(`/my-bookings/${result.data.BookingID}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Could not create the booking.'));
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="p-10 text-center text-text-muted">Loading...</p>;
  }

  if (loadError) {
    return <p className="p-10 text-center text-danger">{loadError}</p>;
  }

  const initial = {
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || 1,
    pets: searchParams.get('pets') || 1,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/accommodation" className="font-semibold text-brand">
          Accommodation
        </Link>
        <span>/</span>
        <Link to={`/accommodation/${id}`} className="font-semibold text-brand">
          {place.Title}
        </Link>
        <span>/</span>
        <span className="font-semibold text-text-heading">Book</span>
      </nav>

      <h1 className="mb-8 mt-4 text-4xl font-bold text-text-heading">Book your stay</h1>

      <BookingForm
        place={place}
        initial={initial}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={submitError}
      />
    </main>
  );
}