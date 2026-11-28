import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, MapPin, PawPrint, Star } from 'lucide-react';
import { getAccommodationById } from '../../services/accommodationService';
import { checkAvailability } from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import RulesBox from '../../components/accommodation/RulesBox';
import { assetUrl } from '../../utils/formatters';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const fieldClass =
  'h-[46px] w-full rounded-lg border border-field-line bg-field px-3 text-sm text-ink outline-none focus:border-brand';

export default function AccommodationDetailsPage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [pets, setPets] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [availError, setAvailError] = useState('');

  useEffect(() => {
    const loadPlace = async () => {
      try {
        const result = await getAccommodationById(id);
        setPlace(result.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load this place.'));
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [id]);

  if (loading) {
    return <p className="p-10 text-center text-text-muted">Loading...</p>;
  }

  if (error) {
    return <p className="p-10 text-center text-danger">{error}</p>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const nights =
    checkIn && checkOut ? Math.round((new Date(checkOut) - new Date(checkIn)) / MS_PER_DAY) : 0;
  const price = Number(place.PricePerNight);
  const rating = Number(place.Rating);

  const handleCheck = async () => {
    setAvailError('');
    setAvailability(null);
    if (nights <= 0) {
      setAvailError('Choose a check-in date, then a later check-out date.');
      return;
    }
    setChecking(true);
    try {
      const result = await checkAvailability(id, checkIn, checkOut);
      setAvailability(result);
    } catch (err) {
      setAvailError(getErrorMessage(err, 'Could not check availability.'));
    } finally {
      setChecking(false);
    }
  };

  // بنبعت التواريخ اللي اختارها المستخدم لصفحة الحجز في الرابط
  const bookingQuery = new URLSearchParams({ checkIn, checkOut, guests, pets }).toString();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-7 px-4 pb-20 pt-6 sm:px-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary">
        <Link to="/accommodation" className="font-semibold text-brand">
          Accommodation
        </Link>
        <span>/</span>
        <span className="font-semibold text-text-heading">{place.Title}</span>
      </nav>

    <div className="flex h-60 items-center justify-center overflow-hidden rounded-[28px] bg-surface sm:h-96">
  {place.ImageURL ? (
    <img
      src={assetUrl(place.ImageURL)}
      alt={place.Title}
      className="h-full w-full object-cover"
    />
  ) : (
    <PawPrint size={72} className="text-line" />
  )}
</div>

      <div className="flex flex-wrap items-start gap-12">
        <div className="flex min-w-0 flex-[999_1_540px] flex-col gap-9">
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-bold text-brand">{place.Type}</span>
              {rating >= 4.8 && (
                <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-contrast">
                  Top rated
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold leading-tight text-text-heading">{place.Title}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} className="text-brand" />
                {place.Location} · {Number(place.DistanceKm)} km away
              </span>
              <span className="flex items-center gap-1.5">
                <Star size={16} className="fill-brand text-brand" />
                <strong className="text-text-heading">{rating.toFixed(1)}</strong> ({place.ReviewsCount} reviews)
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <h2 className="text-[22px] font-bold text-text-heading">About this place</h2>
            <p className="text-[15px] leading-loose text-text-body">{place.Description}</p>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-[22px] font-bold text-text-heading">Facilities</h2>
            <ul className="flex flex-wrap gap-2.5">
              {place.Amenities.map((item) => (
                <li
                  key={item.AmenityID}
                  className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink"
                >
                  <Check size={16} className="text-brand" />
                  {item.Name}
                </li>
              ))}
            </ul>
          </section>

          <RulesBox rules={place.Rules} />
        </div>

        <aside className="flex w-full flex-1 basis-80 flex-col gap-5 self-start rounded-[28px] bg-surface p-7 shadow-card lg:sticky lg:top-6 lg:max-w-sm">
          <p className="text-sm text-text-secondary">
            <span className="text-3xl font-bold text-text-heading">{price} EGP</span> / night
          </p>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
              Check-in
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  setAvailability(null);
                }}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
              Check-out
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setAvailability(null);
                }}
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
              Guests
              <input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
              Pets
              <input
                type="number"
                min="1"
                max={place.Rules?.MaxPets || 1}
                value={pets}
                onChange={(e) => setPets(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="h-11 rounded-full border border-brand font-semibold text-brand transition-colors hover:bg-section disabled:opacity-60"
          >
            {checking ? 'Checking...' : 'Check availability'}
          </button>

          {availError && (
            <p className="rounded-xl bg-danger-bg px-3.5 py-3 text-[13px] font-semibold text-danger">{availError}</p>
          )}

          {availability && (
            <p
              className={`rounded-xl px-3.5 py-3 text-[13px] font-semibold ${
                availability.available ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
              }`}
            >
              {availability.available ? 'Available for your dates' : 'Not available for these dates'}
            </p>
          )}

          <div className="h-px bg-line" />

          <div className="flex justify-between text-[15px] text-text-secondary">
            <span>
              {price} EGP × {nights > 0 ? nights : 0} nights
            </span>
            <strong className="text-[17px] text-text-heading">{nights > 0 ? nights * price : 0} EGP</strong>
          </div>

          <Link
            to={`/accommodation/${place.AccommodationID}/book?${bookingQuery}`}
            className="flex h-[50px] items-center justify-center rounded-full bg-brand text-base font-semibold text-brand-contrast transition-colors hover:bg-brand-hover"
          >
            Book now
          </Link>
        </aside>
      </div>
    </main>
  );
}