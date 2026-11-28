import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";
import { getMyRequests, cancelRequest } from "../../services/adoptionService";
import { assetUrl } from "../../utils/formatters";
import { calculateAge } from "../../services/petService";
import MeowLoader from "../../components/layout/MeowLoader";
import { FaPaw } from "react-icons/fa";

function RequestAdoption() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyRequests();

        setRequests(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Unable to load your adoption requests.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-600";

      case "pending":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };
  const handleCancelRequest = async (requestId) => {
    const result = await Swal.fire({
      title: "Changing your mind?",
      text: "Are you sure you want to cancel this adoption request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#684027",
      cancelButtonColor: "#A89584",
      cancelButtonText: "Keep my request",
      confirmButtonText: "Yes, cancel request",
    });

    if (!result.isConfirmed) return;

    try {
      await cancelRequest(requestId);

      setRequests((prev) =>
        prev.map((request) =>
          request.RequestID === requestId
            ? { ...request, Status: "Cancelled" }
            : request,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <MeowLoader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page px-5 py-12 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <span className="text-sm font-semibold tracking-widest text-text-secondary">
            PAWPOP COMMUNITY
          </span>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-title mt-3">
            My Adoption Requests
          </h1>

          <p className="text-text-body mt-3 text-lg">
            Keep track of your journey to finding a new best friend.
          </p>
        </div>

{requests.filter((request) => request.Status !== "Cancelled").length === 0 ? (
          <div className="rounded-3xl p-10 text-center shadow-md">
            <div className="text-6xl mb-5 text-brand flex justify-center"> <FaPaw /></div>

            <h2 className="text-2xl font-bold text-brand mb-3">
              No Requests Yet
            </h2>

            <p className="text-text-body mb-6">
              You haven't submitted any adoption requests yet.
            </p>

            <Link
              to="/adoption"
              className="inline-block rounded-full bg-brand px-7 py-3 text-white font-semibold hover:bg-brand-hover transition"
            >
              Explore Pets
            </Link>
          </div>
        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests
              .filter((request) => request.Status !== "Cancelled")
              .map((request) => {
                const pet = request.Pet;

                return (
                  <article
                    key={request.RequestID}
                    className="overflow-hidden rounded-3xl border border-[#F0E5DF] bg-white shadow-sm hover:shadow-lg transition"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-2/5 h-64 sm:h-auto min-h-64">
                        <img
                          src={assetUrl(pet?.ImageURL)}
                          alt={pet?.Name}
                          className="w-full h-full absolute inset-0 object-cover"
                        />

                        <span
                          className={`absolute top-4 left-4 rounded-full px-4 py-2 text-xs font-bold ${getStatusStyle(request.Status)}`}
                        >
                          {request.Status}
                        </span>
                      </div>

                      {/* Pet Information */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-xs text-text-muted font-semibold tracking-wider">
                              ADOPTION REQUEST
                            </p>

                            <h2 className="font-serif text-3xl font-bold text-text-title mt-2">
                              {pet?.Name}
                            </h2>

                            <p className="text-text-body mt-2">
                              {pet?.Breed || pet?.Species}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <p className="text-xs text-text-muted">Age</p>
                            <p className="font-semibold text-text-title mt-1">
                              {calculateAge(pet?.BirthDate)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-text-muted">Gender</p>
                            <p className="font-semibold text-text-title mt-1">
                              {pet?.Gender || "Not specified"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-text-muted">Weight</p>
                            <p className="font-semibold text-text-title mt-1">
                              {pet?.Weight != null
                                ? `${pet.Weight} kg`
                                : "Not specified"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-text-muted">Color</p>
                            <p className="font-semibold text-text-title mt-1">
                              {pet?.Color || "Not specified"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-6 text-sm text-text-body">
                          <FaLocationDot />
                          {pet?.Location || "Location not specified"}
                        </div>

                        <div className="border-t border-[#F0E5DF] mt-5 pt-4">
                          <p className="text-xs text-text-muted">
                            Request Submitted
                          </p>

                          <p className="text-sm font-semibold text-text-title mt-1">
                            {formatDate(request.RequestDate)}
                          </p>
                        </div>

                        <Link
                          to={`/PetDetails/${pet?.PetID}`}
                          className="block text-center mt-5 rounded-full border border-brand py-3 text-sm font-semibold text-brand hover:bg-brand hover:text-white transition"
                        >
                          View Pet Details
                        </Link>
                        {request.Status === "Pending" && (
                          <button
                            onClick={() =>
                              handleCancelRequest(request.RequestID)
                            }
                            className="mt-4 w-full rounded-full border border-red-200 bg-red-50 py-3 font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestAdoption;
