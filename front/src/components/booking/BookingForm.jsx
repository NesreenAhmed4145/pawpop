import { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const fieldClass =
  'h-[46px] w-full rounded-lg border border-field-line bg-field px-3 text-[15px] text-ink outline-none focus:border-brand';

export default function BookingForm({ place, initial, onSubmit, submitting, error }) {
  const [checkIn, setCheckIn] = useState(initial.checkIn);
  const [checkOut, setCheckOut] = useState(initial.checkOut);
  const [guests, setGuests] = useState(initial.guests);
  const [pets, setPets] = useState(initial.pets);
  const [formError, setFormError] = useState('');

  const rules = place.Rules;
  const today = new Date().toISOString().slice(0, 10);
  const maxPets = rules?.MaxPets || 1;
  const price = Number(place.PricePerNight);

  const nights =
    checkIn && checkOut ? Math.round((new Date(checkOut) - new Date(checkIn)) / MS_PER_DAY) : 0;
  const total = nights > 0 ? nights * price : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!checkIn || !checkOut) {
      setFormError('Please choose check-in and check-out dates.');
      return;
    }
    if (nights <= 0) {
      setFormError('Check-out must be after check-in.');
      return;
    }

    onSubmit({
      CheckInDate: checkIn,
      CheckOutDate: checkOut,
      GuestsCount: Number(guests),
      PetsCount: Number(pets),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-10">
      <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-3xl bg-surface p-8 shadow-card">
          <h2 className="text-[22px] font-bold text-text-heading">Your stay</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
              Check-in date
              <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
              Check-out date
              <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
              Number of guests
              <input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
              Number of pets
              <input type="number" min="1" max={maxPets} value={pets} onChange={(e) => setPets(e.target.value)} className={fieldClass} />
              <span className="text-[12.5px] font-normal text-text-secondary">
                This place accepts up to {maxPets} pet(s).
              </span>
            </label>
          </div>

          {(formError || error) && (
            <p className="rounded-xl bg-danger-bg px-3.5 py-3 text-sm font-semibold text-danger">
              {formError || error}
            </p>
          )}
        </section>

        {rules && (
          <section className="flex flex-col gap-3.5 rounded-3xl bg-surface p-8 shadow-card">
            <h2 className="text-[22px] font-bold text-text-heading">Before you arrive</h2>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-text-body">
              <li>
                Accepted pets: {rules.AcceptedPetTypes || 'any'}, size: {rules.AllowedSize || 'any'}.
              </li>
              {rules.RequiresVaccination && <li>An up-to-date vaccination card is required.</li>}
              {rules.AdditionalRulesText && <li>{rules.AdditionalRulesText}</li>}
            </ul>
          </section>
        )}
      </div>

      <aside className="flex w-full flex-1 basis-80 flex-col gap-5 rounded-[28px] bg-surface p-7 shadow-card lg:max-w-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-2xl bg-page">
            <PawPrint size={30} className="text-line" />
          </div>
          <div className="flex flex-col gap-1">
            <strong className="text-lg text-text-heading">{place.Title}</strong>
            <span className="text-[13px] text-text-secondary">
              {place.Type} · {place.Location}
            </span>
          </div>
        </div>

        <div className="h-px bg-line" />

        <div className="flex flex-col gap-2.5 text-sm text-text-secondary">
          <div className="flex justify-between gap-3">
            <span>Dates</span>
            <span className="font-semibold text-text-heading">
              {checkIn && checkOut ? `${formatDate(checkIn)} to ${formatDate(checkOut)}` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Guests</span>
            <span className="font-semibold text-text-heading">{guests}</span>
          </div>
          <div className="flex justify-between">
            <span>Pets</span>
            <span className="font-semibold text-text-heading">{pets}</span>
          </div>
          <div className="flex justify-between">
            <span>
              {price} EGP × {nights > 0 ? nights : 0} nights
            </span>
            <span>{total} EGP</span>
          </div>
          <div className="flex justify-between pt-1.5 text-lg font-bold text-text-heading">
            <span>Total</span>
            <span>{total} EGP</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="h-[50px] rounded-full bg-brand text-base font-semibold text-brand-contrast transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {submitting ? 'Booking...' : 'Confirm booking'}
        </button>

        <p className="text-center text-[12.5px] leading-normal text-text-secondary">
          The host will confirm your request. You can cancel from My Bookings.
        </p>
      </aside>
    </form>
  );
}