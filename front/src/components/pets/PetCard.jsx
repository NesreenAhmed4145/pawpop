import { FaLocationDot } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";
import { assetUrl } from '../../utils/formatters';
function calculateAge(birthDate) {
  if (!birthDate) return "";

  const birth = new Date(birthDate);
  const today = new Date();

  if (isNaN(birth.getTime()) || birth > today) return "";

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) {
    return "Less than 1 month";
  }

  if (years === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  }

  return years === 1 ? "1 year" : `${years} years`;
}
const getPetTags = (tags) => {
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim());
  }

  return [];
};
function PetCard({pet}) {

  return (
    <>
        <article
          key={pet.PetID}
          className="group overflow-hidden rounded-2xl border border-[#F0E5DF] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative h-56 overflow-hidden">
            <img
             src={assetUrl(pet.ImageURL)}
              alt={pet.Name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />

            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-[#66876B] shadow-sm">
              ● {pet.Status}
            </span>

            <button
              aria-label="Add to favorites"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-text-body shadow-sm transition hover:bg-section"
            >
              <FaRegHeart />
            </button>
          </div>

          <div className="p-5">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-text-title mb-3">
              {pet.Name}
            </h3>

            <p className="mb-4 text-sm sm:text-base text-text-body">
              {pet.Species} • {calculateAge(pet.BirthDate)} • {pet.Gender}
            </p>

            <div className="mb-4 flex items-center gap-2 text-sm text-text-body">
              <span>
                <FaLocationDot />
              </span>
              <span>{pet.Location}</span>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {getPetTags(pet.Tags).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-section px-3 py-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:shadow sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mb-5 min-h-[60px] text-sm sm:text-base leading-6 text-text-body">
              {pet.Description}
            </p>

            <div className="flex gap-2">
              <button className="flex-1 rounded-full border border-field-line bg-section py-3 text-sm font-semibold text-text-secondary transition hover:bg-brand-hover hover:text-white">
                View Details
              </button>

              <button className="flex-1 rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">
                Adopt Me
              </button>
            </div>
          </div>
        </article>
    </>
  );
}

export default PetCard;