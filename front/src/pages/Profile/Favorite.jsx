import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaLocationDot, FaRegHeart } from "react-icons/fa6";
import { assetUrl } from "../../utils/formatters";
import { getFavorites, toggleFavorite } from "../../services/favoriteService";
import { calculateAge } from "../../services/petService";
function Favorite() {
  const [favorites, setFavorites] = useState(() => getFavorites());

  const handleRemoveFavorite = (pet) => {
    toggleFavorite(pet);

    setFavorites((prev) =>
      prev.filter((item) => String(item.PetID) !== String(pet.PetID)),
    );
  };
  return (
    <>
      <section className="min-h-screen px-5 py-12 md:px-12">
        <div className="max-w-7xl mx-auto mb-10">
          <p className="text-md font-semibold text-text-muted mb-3">
            YOUR FAVORITE PETS
          </p>

          <h1 className="text-3xl md:text-5xl font-bold text-text-title flex gap-3">
            My Favorites <FaHeart />
          </h1>

          <p className="text-text-body text-lg font-semibold mt-3">
            All the lovely pets you have saved in one place.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {favorites.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-section shadow-lg">
              <FaRegHeart className="text-6xl text-text-muted mx-auto mb-5" />

              <h2 className="text-3xl font-bold text-text-title mb-3">
                No Favorites Yet!
              </h2>

              <p className="text-text-body text-lg mb-7">
                You haven't saved any pets to your favorites.
              </p>

              <Link
                to="/adoption"
                className="inline-block rounded-full bg-brand px-8 py-3 text-white font-semibold hover:bg-brand-hover transition"
              >
                Explore Pets
              </Link>
            </div>
          ) : (
            <>
              <p className="text-text-muted text-lg mb-6">
                {favorites.length} saved{" "}
                {favorites.length === 1 ? "pet" : "pets"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-7">
                {favorites.map((pet) => (
                  <article
                    key={pet.PetID}
                    className="group flex overflow-hidden rounded-2xl border border-section shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative w-2/5 min-h-64 overflow-hidden">
                      <img
                        src={assetUrl(pet.ImageURL)}
                        alt={pet.Name}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand shadow-sm">
                        ● {pet.Status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(pet)}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-xl hover:scale-110 transition"
                        aria-label="Remove from favorites"
                      >
                        <FaHeart className="text-rose text-xl" />
                      </button>
                    </div>

                    <div className="flex-1 p-5 flex flex-col justify-center">
                      <h3 className="font-serif text-3xl font-bold text-text-title mb-3">
                        {pet.Name}
                      </h3>

                      <p className="text-md text-text-body mb-4">
                        {pet.Species} • {calculateAge(pet.BirthDate)} •{" "}
                        {pet.Gender}
                      </p>

                      <div className="flex items-center gap-2 text-md text-text-body mb-5">
                        <FaLocationDot />
                        <span>{pet.Location}</span>
                      </div>

                      <Link
                        to={`/PetDetails/${pet.PetID}`}
                        className="rounded-full bg-section py-3 px-5 text-lg font-semibold text-text-secondary text-center hover:bg-brand-hover hover:text-white transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default Favorite;
