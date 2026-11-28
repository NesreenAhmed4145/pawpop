import { FaLocationDot } from "react-icons/fa6";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { assetUrl } from "../../utils/formatters";
import { Link } from "react-router-dom";
import { calculateAge } from "../../services/petService";
import { useState } from "react";
import { isFavorite, toggleFavorite } from "../../services/favoriteService";

const getPetTags = (tags) => {
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim());
  }

  return [];
};

function PetCard({ pet, onAdopt }) {
  const [favorite, setFavorite] = useState(() => isFavorite(pet.PetID));

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = toggleFavorite(pet);
    setFavorite(updated);
  };

  return (
    <article className="w-full max-w-[380px] group overflow-hidden rounded-2xl border border-[#F0E5DF] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-100 w-full overflow-hidden">
        <img
          src={assetUrl(pet.ImageURL)}
          alt={pet.Name}
          className="size-fit object-contain transition duration-500 group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand shadow-sm">
          ● {pet.Status}
        </span>

        <button
          type="button"
          onClick={handleFavorite}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl hover:scale-110 transition"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {favorite ? (
            <FaHeart className="text-rose" />
          ) : (
            <FaRegHeart className="text-body" />
          )}
        </button>
      </div>

      <div className="px-5 pt-4 pb-5">
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-text-title mb-3">
          {pet.Name}
        </h3>

        <p className="mb-4 text-sm sm:text-base text-text-body">
          {pet.Species} • {calculateAge(pet.BirthDate)} • {pet.Gender}
        </p>

        <div className="mb-4 flex items-center gap-2 text-sm text-text-body">
          <FaLocationDot />
          <span>{pet.Location}</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {getPetTags(pet.Tags).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-section px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:shadow"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mb-5 min-h-[60px] text-sm sm:text-base leading-6 text-text-body">
          {pet.Description}
        </p>

        <div className="flex gap-2">
          <Link
            className="flex-1 rounded-full border border-field-line bg-section py-3 text-md font-semibold text-text-secondary transition hover:bg-brand-hover hover:text-white text-center"
            to={`/PetDetails/${pet.PetID}`}
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={() => onAdopt(pet)}
            className="flex-1 rounded-full bg-brand py-3 text-md font-semibold text-white hover:bg-brand-hover"
          >
            Adopt Me
          </button>
        </div>
      </div>
    </article>
  );
}

export default PetCard;
