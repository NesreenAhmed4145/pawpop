import { CiSearch } from "react-icons/ci";
import { useState, useEffect, useReducer } from "react";
import { getAdoptionPets } from "../../services/petService";
import  LoadingPage  from "../../components/pets/LoadingPage";
import PetCard from "../../components/pets/PetCard";
import hero from "../../assets/img/hero-adopt.png";

const initialState = {
  pets: [],
  search: "",
  selectedType: "All",
  selectedSort: "RecentAdd",
  loading: true,
  error: null,
};
function petsReducer(state, action) {
  switch (action.type) {
    case "SET_PETS":
      return {
        ...state,
        pets: action.payload,
        loading: false,
      };

    case "SET_SEARCH":
      return {
        ...state,
        search: action.payload,
      };

    case "SET_TYPE":
      return {
        ...state,
        selectedType: action.payload,
      };
    case "SET_SORT":
      return {
        ...state,
        selectedSort: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
}

function AdoptionListPage() {
  const [state, dispatch] = useReducer(petsReducer, initialState);
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const [response] = await Promise.all([
        getAdoptionPets(),

        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
        
        dispatch({
          type: "SET_PETS",
          payload: response.data,
        });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error.message,
        });
      }
    };

    fetchPets();
  }, []);

  const filterPets = state.pets.filter((pets) => {
    const searchPet = state.search.toLowerCase().trim();
    const matchSearch =
      pets.Name?.toLowerCase().includes(searchPet) ||
      pets.Breed?.toLowerCase().includes(searchPet) ||
      pets.Species?.toLowerCase().includes(searchPet);
    const matchType =
      state.selectedType == "All" || state.selectedType == pets.Species;
    return matchSearch && matchType;
  });

  const sortedPets = [...filterPets].sort((a, b) => {
    if (state.selectedSort === "RecentAdd") {
      return new Date(b.CreatedAt) - new Date(a.CreatedAt);
    }

    if (state.selectedSort === "Oldest") {
      return new Date(a.BirthDate) - new Date(b.BirthDate);
    }

    if (state.selectedSort === "Youngest") {
      return new Date(b.BirthDate) - new Date(a.BirthDate);
    }

    return 0;
  });
  return (
    <>
      <div className="min-h-screen bg-page px-4 py-5 sm:px-6 lg:px-10">
        <section className="mb-10 flex justify-between rounded-2xl px-6 py-12 shadow-sm sm:px-10 sm:py-16 lg:flex-row lg:items-center lg:gap-4 lg:pl-14 lg:pr-0">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-section px-5 py-2.5 text-base font-semibold text-text-secondary shadow-sm">
              <span>&#128062; Give a Pet a Second Chance</span>
            </div>

            <h1 className="font-serif text-3xl font-bold leading-tight text-text-title sm:text-5xl lg:text-6xl">
              Find Your New Best Friend
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-body sm:text-xl">
              Browse our lovely sheltered and nurtured companions waiting for
              their forever families. Every pet deserves unconditional love,
              tenderness, and warmth in your home.
            </p>

            <div className="mt-7 flex flex-wrap gap-3 text-sm font-medium text-text-secondary sm:text-base">
              <span className="rounded-full bg-section px-4 py-2.5">
                &hearts; 100% Match Created With Love
              </span>

              <span className=" items-center gap-2 rounded-full bg-section px-4 py-2.5">
                &#128062; Rescue & Adopt
              </span>

              <span className="rounded-full bg-section px-4 py-2.5">
                &hearts; Lifetime Adoption Support
              </span>
            </div>
          </div>
          <div>
            <img
              src={hero}
              alt="Header image"
              className="h-full w-full max-w-[500px] lg:pr-10  object-contain "
            />
          </div>
        </section>

        <section className="mb-5 px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center w-full gap-3 rounded-full border border-field-line px-5 py-3.5 shadow-sm lg:max-w-md">
              <span className="text-xl text-text-body">
                <CiSearch />
              </span>
              <input
                type="text"
                placeholder="Search by name, breed, or species..."
                className="w-full bg-transparent text-base text-text-body outline-none placeholder:text-text-muted"
                value={state.search}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SEARCH",
                    payload: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  state.selectedType === "All"
                    ? "bg-brand text-white shadow-md"
                    : "border border-field-line bg-white text-text-title hover:bg-brand-hover hover:text-white"
                }`}
                onClick={() => dispatch({ type: "SET_TYPE", payload: "All" })}
              >
                🐾 All Pets
              </button>

              <button
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  state.selectedType === "Dog"
                    ? "bg-brand text-white shadow-md"
                    : "border border-field-line bg-white text-text-title hover:bg-brand-hover hover:text-white"
                }`}
                onClick={() => dispatch({ type: "SET_TYPE", payload: "Dog" })}
              >
                🐕 Dogs
              </button>

              <button
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  state.selectedType === "Cat"
                    ? "bg-brand text-white shadow-md"
                    : "border border-field-line bg-white text-text-title hover:bg-brand-hover hover:text-white"
                }`}
                onClick={() => dispatch({ type: "SET_TYPE", payload: "Cat" })}
              >
                🐈 Cats
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 px-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-4xl font-bold text-text-title sm:text-5xl">
                Meet Your New Friend
              </h2>

              <p className="mt-3 text-3xl text-text-body font-semibold sm:text-lg">
                Little paws, big hearts, endless love.
              </p>
            </div>

            <select
              className="rounded-lg border border-field-line bg-white px-3 py-2 text-sm sm:text-base text-text-body outline-none"
              value={state.selectedSort}
              onChange={(e) =>
                dispatch({
                  type: "SET_SORT",
                  payload: e.target.value,
                })
              }
            >
              <option value="RecentAdd">Recently Added</option>
              <option value="Oldest">Oldest First</option>
              <option value="Youngest">Youngest First</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.loading ? (
              <LoadingPage/> 
//               <div className="col-span-full flex min-h-[60vh] flex-col items-center justify-center">
//   <div className="h-20 w-20 animate-spin rounded-full border-[6px] border-brand/20 border-t-brand"></div>

//   <p className="mt-7 text-2xl font-bold text-text-title">
//     Finding lovely pets...
//   </p>

//   <p className="mt-3 text-lg text-text-muted">
//     Loading your furry friends 🐾
//   </p>
// </div>
            ) : state.error ? (
              <p>{state.error}</p>
            ) : sortedPets.length > 0 ? (
              sortedPets.map((pet) => <PetCard key={pet.PetID} pet={pet} />)
            ) : (
              <p>No pets found.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default AdoptionListPage;
