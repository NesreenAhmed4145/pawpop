import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getAccommodations } from '../../services/accommodationService';
import { getErrorMessage } from '../../services/api';
import AccommodationCard from '../../components/accommodation/AccommodationCard';
import AccommodationFilters from '../../components/accommodation/AccommodationFilters';

const EMPTY_FILTERS = { types: [], maxPrice: '', minRating: 0, facilities: [] };

// بيرجّع أسماء الـ amenities حتى لو الحقل مش موجود
const amenityNames = (place) => (place.Amenities || []).map((item) => item.Name);

export default function AccommodationListPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const result = await getAccommodations();
        setPlaces(result.data || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load the places.'));
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, []);

  if (loading) {
    return <p className="p-10 text-center text-text-muted">Loading...</p>;
  }

  if (error) {
    return <p className="p-10 text-center text-danger">{error}</p>;
  }

  const types = [...new Set(places.map((place) => place.Type))];
  const facilities = [...new Set(places.flatMap(amenityNames))];
  const priceLimit = Math.max(0, ...places.map((place) => Number(place.PricePerNight) || 0));

  const filteredPlaces = places.filter((place) => {
    const text = location.trim().toLowerCase();
    const matchesLocation =
      !text ||
      String(place.Location || '').toLowerCase().includes(text) ||
      String(place.Title || '').toLowerCase().includes(text);
    const matchesType = filters.types.length === 0 || filters.types.includes(place.Type);
    const matchesRating = Number(place.Rating || 0) >= filters.minRating;
    const matchesPrice =
      filters.maxPrice === '' || Number(place.PricePerNight) <= Number(filters.maxPrice);
    const names = amenityNames(place);
    const matchesFacilities = filters.facilities.every((name) => names.includes(name));
    return matchesLocation && matchesType && matchesRating && matchesPrice && matchesFacilities;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.PricePerNight) - Number(b.PricePerNight);
    if (sortBy === 'rating') return Number(b.Rating || 0) - Number(a.Rating || 0);
    return 0;
  });

  const updateFilter = (name, value) => setFilters({ ...filters, [name]: value });

  const toggleFilter = (name, value) => {
    const list = filters[name];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    setFilters({ ...filters, [name]: next });
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setLocation('');
  };

  // الشرايح اللي بتظهر فوق النتايج، وكل واحدة ليها زرار X يشيلها
  const chips = [
    ...filters.types.map((type) => ({
      key: `type-${type}`,
      label: type,
      remove: () => toggleFilter('types', type),
    })),
    ...filters.facilities.map((name) => ({
      key: `fac-${name}`,
      label: name,
      remove: () => toggleFilter('facilities', name),
    })),
  ];
  if (filters.maxPrice !== '') {
    chips.push({
      key: 'price',
      label: `Up to ${filters.maxPrice} EGP`,
      remove: () => updateFilter('maxPrice', ''),
    });
  }
  if (filters.minRating > 0) {
    chips.push({
      key: 'rating',
      label: `${filters.minRating} and up`,
      remove: () => updateFilter('minRating', 0),
    });
  }

  const heroType = filters.types.length === 1 ? filters.types[0] : '';

  return (
    <div>
      <div className="bg-surface">
        <section className="mx-auto flex max-w-7xl flex-col items-center gap-7 px-4 pb-16 pt-12 text-center sm:px-8">
          <div className="flex max-w-2xl flex-col items-center gap-3.5">
            <h1 className="text-4xl font-bold leading-tight text-text-heading sm:text-5xl">
              Find a cozy stay for your pet
            </h1>
            <p className="text-[17px] leading-relaxed text-text-body">
              Pet hotels, villas and farm stays near you. Pick a place, then choose your dates.
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-3xl flex-wrap items-stretch gap-2 rounded-[32px] bg-page p-2.5 text-left shadow-card sm:rounded-full"
          >
            <div className="flex min-w-[200px] flex-1 flex-col gap-0.5 px-5 py-2">
              <label htmlFor="hero-location" className="text-xs font-bold text-text-secondary">
                Location
              </label>
              <input
                id="hero-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or place name"
                className="bg-transparent py-1 text-[15px] text-ink outline-none"
              />
            </div>

            <div className="hidden w-px bg-line sm:my-2 sm:block" />

            <div className="flex min-w-[160px] flex-1 flex-col gap-0.5 px-5 py-2">
              <label htmlFor="hero-type" className="text-xs font-bold text-text-secondary">
                Stay type
              </label>
              <select
                id="hero-type"
                value={heroType}
                onChange={(e) => updateFilter('types', e.target.value ? [e.target.value] : [])}
                className="bg-transparent py-1 text-[15px] text-ink outline-none"
              >
                <option value="">Any type</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="flex h-14 items-center justify-center gap-2 rounded-full bg-brand px-9 font-semibold text-brand-contrast transition-colors hover:bg-brand-hover"
            >
              <Search size={18} />
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm text-text-secondary">
            <span>Popular:</span>
            {types.slice(0, 3).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateFilter('types', [type])}
                className="min-h-9 rounded-full border border-line bg-page px-4 font-medium text-ink transition-colors hover:border-brand"
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="-mb-px block h-14 w-full fill-page"
          aria-hidden="true"
        >
          <path d="M0 50 C 200 0, 400 100, 720 50 S 1240 0, 1440 50 L1440 80 L0 80 Z" />
        </svg>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-8">
        <div className="flex flex-wrap items-start gap-10">
          <div className="w-full shrink-0 lg:w-72">
            <AccommodationFilters
              types={types}
              facilities={facilities}
              priceLimit={priceLimit}
              filters={filters}
              onChange={updateFilter}
              onToggle={toggleFilter}
              onClear={clearFilters}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="mr-1.5 text-[22px] font-bold text-text-heading">
                  {sortedPlaces.length} places found
                </h2>

                {chips.map((chip) => (
                  <span
                    key={chip.key}
                    className="flex min-h-9 items-center gap-2 rounded-full border border-line bg-surface py-0 pl-3.5 pr-1.5 text-[13px] font-medium text-ink"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.remove}
                      aria-label={`Remove ${chip.label} filter`}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-page text-text-secondary"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}

                {chips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="min-h-9 px-2 text-[13px] font-semibold text-brand"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="sort" className="text-text-secondary">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="min-h-11 rounded-full border border-line bg-page px-4 text-sm text-ink outline-none focus:border-brand"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="rating">Top rated</option>
                </select>
              </div>
            </div>

            {sortedPlaces.length === 0 ? (
              <div className="flex flex-col items-center gap-3.5 rounded-[28px] border border-line bg-surface px-6 py-14 text-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-page">
                  <Search size={32} className="text-brand" />
                </div>
                <h3 className="text-[22px] font-bold text-text-heading">No places match your search</h3>
                <p className="max-w-sm text-[15px] leading-relaxed text-text-body">
                  Try a different location, or remove some filters to see more places.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 rounded-full bg-brand px-8 font-semibold text-brand-contrast transition-colors hover:bg-brand-hover"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
                {sortedPlaces.map((place) => (
                  <AccommodationCard key={place.AccommodationID} place={place} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}