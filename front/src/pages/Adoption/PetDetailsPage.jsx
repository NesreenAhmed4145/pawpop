import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPetById, calculateAge } from "../../services/petService";
import { assetUrl } from "../../utils/formatters";
import MeowLoader from "../../components/layout/MeowLoader";
import CatDog from "../../assets/img/CatDog.png";
import { FaLocationDot } from "react-icons/fa6";
import { getVaccinations } from "../../services/healthService";
import { isFavorite, toggleFavorite } from "../../services/favoriteService";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import PetAdoption from "../../components/pets/PetAdoption";

function PetDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPet, setSelectedPet] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [vaccinations, setVaccinations] = useState([]);
  useEffect(() => {
    if (pet?.PetID) {
      setFavorite(isFavorite(pet.PetID));
    }
  }, [pet]);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const updated = toggleFavorite(pet);
    setFavorite(updated);
  };
  const [vaccinationError, setVaccinationError] = useState("");

  useEffect(() => {
    const fetchVaccinations = async () => {
      try {
        setVaccinationError("");

        const data = await getVaccinations(id);

        console.log("Vaccinations:", data);

        setVaccinations(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error("Vaccination Error:", err);
        setVaccinationError("Unable to load vaccination records.");
      }
    };

    if (id) {
      fetchVaccinations();
    }
  }, [id]);
  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPetById(id);
        setPet(response.data);
      } catch (err) {
        console.error("Error fetching pet:", err);

        if (err.code === "ECONNABORTED") {
          setError(
            "The server is taking too long to respond. Please try again.",
          );
        } else if (err.response?.status === 404) {
          setError("Pet not found!");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load pet details. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPet();
  }, [id]);

  const getPetTags = (tags) => {
    if (Array.isArray(tags)) return tags;

    if (typeof tags === "string") {
      return tags.split(",").map((tag) => tag.trim());
    }

    return [];
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  if (loading) {
    return <MeowLoader />;
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen  flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={CatDog}
              alt="Cute cat and dog"
              className="w-full max-w-md h-auto object-contain"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-text-secondary font-semibold tracking-widest uppercase text-sm mb-4">
              Oops! Something went wrong
            </span>

            <h1 className="text-5xl md:text-6xl font-bold text-text-title mb-5">
              Pet Not Found!
            </h1>

            <p className="text-2xl text-text-body leading-8 mb-4 max-w-md">
              Looks like this little friend has wandered off!
            </p>

            <p className="text-lg text-text-body leading-7 mb-8 max-w-md">
              Don't worry, there are plenty of lovely pets waiting for their
              forever homes. Let's find your new best friend!
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/adoption")}
                className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                Explore Pets
              </button>

              <button
                onClick={() => navigate("/")}
                className="border-2 border-brand text-text-title hover:bg-brand-hover hover:text-white px-8 py-3 rounded-full font-medium transition-all duration-300"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    { label: "Good with dogs", value: pet.GoodWithDogs },
    { label: "Good with children", value: pet.GoodWithChildren },
    { label: "Good with apartments", value: pet.GoodWithApartments },
  ];

  return (
    <div className="min-h-screen bg-white px-5 py-6 md:px-10 lg:px-14 py-10">
      <div className="max-w-[1450px] mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-text-body border border-text-muted py-1 px-2 rounded-4xl text-md mb-10 hover:bg-brand-hover hover:text-white transition"
        >
          <span className="text-2xl">←</span>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-15">
          <div className="relative ">
            <img
              src={assetUrl(pet.ImageURL)}
              alt={pet.Name}
              className="w-full lg:h-[600px] h-[400px] object-contain rounded-2xl"
            />

            <button
              type="button"
              onClick={handleFavorite}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl hover:scale-110 transition"
              aria-label={
                favorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {favorite ? (
                <FaHeart className="text-rose" />
              ) : (
                <FaRegHeart className="text-body" />
              )}
            </button>
          </div>
          <div className="pt-2 lg:pt-0">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-text-secondary text-white px-5 py-2 rounded-full text-lg font-medium">
                {pet.Species}
              </span>

              <span className="bg-text-secondary text-white px-5 py-2 rounded-full text-lg font-medium">
                {pet.Gender}
              </span>

              <span className="bg-text-secondary text-white px-5 py-2 rounded-full text-lg font-medium">
                {pet.Status}
              </span>
            </div>

            <h1 className="text-6xl md:text-5xl font-bold text-text-heading mb-2">
              {pet.Name}
            </h1>

            <p className="text-text-body text-lg mb-4">
              {pet.Breed}
              {" · "}
              {calculateAge(pet.BirthDate)}
              {" · "}
              {pet.Weight != null ? `${pet.Weight} kg` : "Weight not specified"}
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {getPetTags(pet.Tags).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-section px-3 py-1.5 text-md sm:text-sm font-medium text-text-secondary hover:shadow sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-brand text-lg mb-2">
              <span className="text-xl">
                <FaLocationDot />
              </span>
              {pet.Location || "Location not specified"}
            </div>

            <p className="text-brand text-xl mb-8">
              {pet.Description || "No description available yet."}
            </p>

            {/* Pet Information & Health */}
            <div className="border border-[#EDE0D7] rounded-2xl p-6 md:p-8 bg-white">
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <span className="text-2xl text-brand">✚</span>
                <h2 className="text-xl md:text-2xl font-bold text-brand">
                  Pet Information & Health
                </h2>
              </div>

              {/* Pet Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-brand mb-5">
                  About {pet.Name}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-sm text-text-muted mb-1">Coat Color</p>
                    <p className="font-semibold text-brand">
                      {pet.Color || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted mb-1">
                      Date of Birth
                    </p>
                    <p className="font-semibold text-brand">
                      {formatDate(pet.BirthDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted mb-1">Veterinarian</p>
                    <p className="font-semibold text-brand">
                      {pet.VetName || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted mb-1">
                      Profile Created
                    </p>
                    <p className="font-semibold text-brand">
                      {formatDate(pet.CreatedAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted mb-1">
                      Neutered / Spayed
                    </p>

                    <p
                      className={`font-semibold ${
                        pet.IsNeutered === true || pet.IsNeutered === 1
                          ? "text-[#858D78]"
                          : "text-[#A18E80]"
                      }`}
                    >
                      {pet.IsNeutered === true || pet.IsNeutered === 1
                        ? "✓ Done"
                        : pet.IsNeutered === false || pet.IsNeutered === 0
                          ? "Not neutered"
                          : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-muted mb-1">
                      Adoption Availability
                    </p>

                    <p className="font-semibold text-brand">
                      {pet.IsForAdoption === true || pet.IsForAdoption === 1
                        ? "Available for Adoption"
                        : pet.IsForAdoption === false || pet.IsForAdoption === 0
                          ? "Not Available"
                          : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#EDE0D7] my-7" />

              {/* Vaccination Records */}
              <div>
                <h3 className="text-lg font-semibold text-brand mb-5">
                  Vaccination Records
                </h3>

                {vaccinationError ? (
                  <p className="text-red-500 text-sm">{vaccinationError}</p>
                ) : vaccinations.length === 0 ? (
                  <div className="bg-[#FFFAF6] rounded-xl p-5 text-center">
                    <p className="text-brand font-medium">
                      No vaccinations recorded yet.
                    </p>

                    <p className="text-sm text-text-muted mt-2">
                      Vaccination information will appear here when available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vaccinations.map((vaccine, index) => (
                      <div
                        key={vaccine.VaccinationID || index}
                        className="border border-[#EDE0D7] rounded-xl p-5 hover:bg-[#FFFAF6] transition"
                      >
                        <div className="flex justify-between items-center gap-3">
                          <h4 className="font-semibold text-brand">
                            {vaccine.VaccineName}
                          </h4>

                          <span className="text-xs bg-[#EDF0E8] text-[#718064] px-3 py-1 rounded-full">
                            {vaccine.Status || "Not specified"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                          <div>
                            <p className="text-xs text-text-muted mb-1">
                              Vaccination Date
                            </p>

                            <p className="text-sm text-text-body">
                              {formatDate(vaccine.VaccinationDate)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-text-muted mb-1">
                              Next Due Date
                            </p>

                            <p className="text-sm text-text-body">
                              {formatDate(vaccine.NextDueDate)}
                            </p>
                          </div>
                        </div>

                        {vaccine.Notes && (
                          <div className="mt-4 pt-3 border-t border-[#EDE0D7]">
                            <p className="text-xs text-text-muted mb-1">
                              Notes
                            </p>

                            <p className="text-sm text-text-body">
                              {vaccine.Notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {(pet.IsForAdoption === true || pet.IsForAdoption === 1) && (
              <button
                type="button"
                onClick={() => setSelectedPet(pet)}
                className="w-full mt-6 rounded-full bg-brand py-3 text-md font-semibold text-white hover:bg-brand-hover transition"
              >
                Adopt {pet.Name} ♡
              </button>
            )}
          </div>
        </div>
      </div>
      {selectedPet && (
        <PetAdoption pet={selectedPet} onClose={() => setSelectedPet(null)} />
      )}
    </div>
  );
}

export default PetDetailsPage;
