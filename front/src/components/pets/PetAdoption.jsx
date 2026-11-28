import { useState } from "react";
import { Link } from "react-router-dom";
import { assetUrl } from "../../utils/formatters";
import { calculateAge } from "../../services/petService";
import { createAdoptionRequest } from "../../services/adoptionService";
import { FaPaw } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";


function PetAdoption({ pet, onClose }) {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdopt = async () => {
    try {
      setLoading(true);
      setError("");

      await createAdoptionRequest(pet.PetID);

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center">

            <h2 className="mb-3 flex gap-3 text-2xl font-bold text-brand">
              Pawsome! Your request is in! <FaPaw />
            </h2>
            <p className="mb-6 flex gap-3 text-sm text-text-body">
              Your adoption request for {pet.Name} has been sent! He's not yours just yet, 
              but we're one paw closer. We'll keep you posted! <FaHeart />
            </p>
            <Link
              to="/requestAdoption"
              className="block rounded-full bg-brand py-3 font-semibold text-white"
            >
              View My Requests
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 text-6xl text-brand flex justify-center item-center"><FaPaw /></div>

            <h2 className="mb-3 text-3xl font-bold text-brand">
              Ready to Adopt?
            </h2>

            <p className="mb-5 text-lg text-text-body">
              Are you sure you want to adopt {pet.Name}?
            </p>

            <img
              src={assetUrl(pet.ImageURL)}
              alt={pet.Name}
              className="mx-auto mb-4 h-56 w-56 rounded-2xl object-cover"
            />
            <h3 className="text-2xl font-bold text-brand">
              {pet.Name}
            </h3>

            <p className="mb-6 mt-1 text-lg text-text-muted">
              {calculateAge(pet.BirthDate)} · {pet.Species}
            </p>

            {error && (
              <p className="mb-4 rounded-xl bg-red-50 p-3 text-md text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 font-semibold rounded-full border border-brand py-3 text-brand hover:text-white hover:bg-brand-hover"
              >
                Cancel
              </button>

              <button
                onClick={handleAdopt}
                disabled={loading}
                className="flex-1 font-semibold rounded-full bg-brand py-3 text-white hover:bg-brand-hover disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Yes, Adopt!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PetAdoption;

