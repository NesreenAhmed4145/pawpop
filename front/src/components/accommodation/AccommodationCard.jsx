import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, PawPrint, Star } from 'lucide-react';
import { assetUrl } from '../../utils/formatters';
export default function AccommodationCard({ place }) {
  const rating = Number(place.Rating);
  const isTopRated = rating >= 4.8;
  const tags = place.Amenities.slice(0, 3);

  return (
    <Link
      to={`/accommodation/${place.AccommodationID}`}
      className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-3 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
     <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-page">
  {place.ImageURL ? (
    <img
      src={assetUrl(place.ImageURL)}
      alt={place.Title}
      className="h-full w-full object-cover"
    />
  ) : (
    <PawPrint size={44} className="text-line" />
  )}

        <span className="absolute left-3 top-3 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-text-heading">
          {place.Type}
        </span>

        {isTopRated && (
          <span className="absolute bottom-3 left-3 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-brand-contrast">
            Top rated
          </span>
        )}

        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-surface px-2.5 py-1.5 text-[13px] font-bold text-text-heading">
          <Star size={13} className="fill-brand text-brand" />
          {rating.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-col gap-2 px-2 pb-2">
        <h3 className="text-[19px] font-bold leading-tight text-text-heading">{place.Title}</h3>

        <p className="flex items-center gap-1.5 text-[13px] text-text-secondary">
          <MapPin size={14} />
          {place.Location} · {Number(place.DistanceKm)} km
        </p>

        <ul className="flex flex-wrap gap-1.5">
          {tags.map((item) => (
            <li
              key={item.AmenityID}
              className="rounded-full border border-line bg-page px-2.5 py-1 text-xs text-text-body"
            >
              {item.Name}
            </li>
          ))}
        </ul>

        <div className="mt-1.5 flex items-center justify-between border-t border-line pt-3">
          <p className="text-sm text-text-secondary">
            <span className="text-lg font-bold text-text-heading">
              {Number(place.PricePerNight)} EGP
            </span>{' '}
            / night
          </p>
          <span className="flex items-center gap-1.5 text-sm font-bold text-brand">
            View <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}