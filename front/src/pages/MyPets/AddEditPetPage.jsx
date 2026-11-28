import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PawPrint } from "lucide-react";

import LoadingPage from "../../components/pets/LoadingPage";
import PetForm, { EMPTY_PET, petToFormValues } from "../../components/pets/PetForm";
import { addPet, getPetById, updatePet } from "../../services/petService";
import { getErrorMessage } from "../../services/api";
import { assetUrl } from "../../utils/formatters";
import { petId } from "../../utils/petHealth";

// عدّلي المسارات دي حسب الـ router عندك
const ROUTES = {
  list: "/my-pets",
  profile: (id) => `/my-pets/${id}`,
};

// صفحة واحدة للإضافة (/my-pets/new) والتعديل (/my-pets/:id/edit)
export default function AddEditPetPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // التعديل: GET /pets/:id (لازم يكون صاحب الحيوان)
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const res = await getPetById(id);
        if (cancelled) return;
        if (res?.mode && res.mode !== "owner_view") {
          setLoadError("You can only edit your own pets.");
        } else {
          setPet(res?.data ?? res);
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(err.response?.status === 404 ? "We couldn't find this pet." : getErrorMessage(err, "Could not load this pet."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  // الإضافة: POST /pets (multipart) | التعديل: PATCH /pets/:id (multipart)
  const handleSubmit = async (body, imageFile) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      if (isEdit) {
        await updatePet(id, body, imageFile);
        navigate(ROUTES.profile(id));
      } else {
        const res = await addPet(body, imageFile);
        const created = res?.data;
        navigate(created ? ROUTES.profile(petId(created)) : ROUTES.list);
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err, isEdit ? "Could not save your changes." : "Could not add this pet."));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page">
        <LoadingPage />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-page px-4 text-center">
        <PawPrint size={44} className="text-text-secondary" />
        <p className="mt-4 text-lg font-semibold text-text-title">{loadError}</p>
        <Link to={ROUTES.list} className="mt-5 rounded-full bg-cocoa px-6 py-2.5 text-sm font-semibold text-white hover:bg-cocoa-hover">
          Back to My Pets
        </Link>
      </div>
    );
  }

  const backTo = isEdit ? ROUTES.profile(id) : ROUTES.list;

  return (
    <div className="min-h-screen bg-page pb-16">
      <section className="border-b border-edge bg-sand-soft">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-heading">
            <ArrowLeft size={16} /> {isEdit ? "Back to profile" : "My Pets"}
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold text-text-title sm:text-4xl">
            {isEdit ? `Edit ${pet?.Name || "pet"}` : "Add a new pet"}
          </h1>
          <p className="mt-2 text-text-body">
            {isEdit ? "Update your pet's details and photo." : "Tell us about your pet. You can add vaccinations and care tasks afterwards."}
          </p>
        </div>
      </section>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <PetForm
          initial={isEdit ? petToFormValues(pet) : EMPTY_PET}
          existingImage={isEdit && pet?.ImageURL ? assetUrl(pet.ImageURL) : ""}
          submitLabel={isEdit ? "Save changes" : "Add pet"}
          submitting={submitting}
          error={submitError}
          cancelTo={backTo}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
