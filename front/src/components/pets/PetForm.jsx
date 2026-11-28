import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Loader2, PawPrint } from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB زي الباك
const SPECIES = ["Dog", "Cat", "Other"];
const GENDERS = ["Male", "Female"];
const today = () => new Date().toISOString().slice(0, 10);

export const EMPTY_PET = {
  Name: "",
  Species: "",
  Breed: "",
  Gender: "",
  BirthDate: "",
  Weight: "",
  Color: "",
  VetName: "",
  Description: "",
  IsNeutered: false,
};

// بيحوّل الحيوان القادم من الباك لقيم الفورم
export const petToFormValues = (pet) => ({
  Name: pet.Name || "",
  Species: pet.Species || "",
  Breed: pet.Breed || "",
  Gender: pet.Gender || "",
  BirthDate: pet.BirthDate ? String(pet.BirthDate).slice(0, 10) : "",
  Weight: pet.Weight ? String(Number(pet.Weight)) : "", // الباك بيرجّع "22.00"
  Color: pet.Color || "",
  VetName: pet.VetName || "",
  Description: pet.Description || "",
  IsNeutered: Boolean(pet.IsNeutered),
});

// نفس شروط الباك: Name/Species/Breed/Gender/BirthDate مطلوبين، والحدود حسب أعمدة الجدول
function validate(v, hasImage) {
  const e = {};
  if (!v.Name.trim()) e.Name = "Name is required";
  else if (v.Name.trim().length > 100) e.Name = "Name must be at most 100 characters";
  if (!v.Species) e.Species = "Please choose a species";
  if (!v.Breed.trim()) e.Breed = "Breed is required";
  else if (v.Breed.trim().length > 100) e.Breed = "Breed must be at most 100 characters";
  if (!v.Gender) e.Gender = "Please choose a gender";
  if (!v.BirthDate) e.BirthDate = "Birth date is required";
  else if (v.BirthDate > today()) e.BirthDate = "Birth date can't be in the future";
  if (v.Weight !== "") {
    const w = Number(v.Weight);
    if (!Number.isFinite(w) || w <= 0 || w >= 1000) e.Weight = "Enter a weight between 0 and 999.99 kg";
  }
  if (v.Color.trim().length > 50) e.Color = "Colour must be at most 50 characters";
  if (v.VetName.trim().length > 100) e.VetName = "Vet name must be at most 100 characters";
  return e;
}

function Field({ label, required, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-body">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

const inputCls = (error) =>
  `h-11 w-full rounded-xl border bg-field px-4 text-sm text-text-heading outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 ${
    error ? "border-danger" : "border-field-line"
  }`;

// initial: قيم الفورم، existingImage: رابط الصورة الحالية (في التعديل)
export default function PetForm({ initial = EMPTY_PET, existingImage = "", submitLabel, submitting, error, cancelTo, onSubmit }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [imageError, setImageError] = useState("");

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const set = (name) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFile = (event) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    if (!/^image\/(jpeg|png|webp)$/.test(picked.type)) return setImageError("Please choose a JPG, PNG or WEBP image.");
    if (picked.size > MAX_IMAGE_SIZE) return setImageError("Image must be 5MB or smaller.");
    setImageError("");
    setFile(picked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = validate(values, Boolean(file || existingImage));
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = {
      Name: values.Name.trim(),
      Species: values.Species,
      Breed: values.Breed.trim(),
      Gender: values.Gender,
      BirthDate: values.BirthDate,
      IsNeutered: String(values.IsNeutered),
      Description: values.Description.trim(),
      Color: values.Color.trim(),
      VetName: values.VetName.trim(),
    };
    if (values.Weight !== "") body.Weight = String(Number(values.Weight));
    onSubmit(body, file);
  };

  // لو النوع المحفوظ مش من القائمة (مثلاً Rabbit) نضيفه عشان مايضيعش
  const speciesOptions = values.Species && !SPECIES.includes(values.Species) ? [...SPECIES, values.Species] : SPECIES;
  const shownImage = preview || existingImage;

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-3">
      {/* الصورة */}
      <section className="rounded-xl border border-edge bg-card p-6 lg:col-span-1">
        <h2 className="text-lg font-bold text-text-heading">Photo</h2>
        <div className="mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-sand-soft text-text-muted">
          {shownImage ? (
            <img src={shownImage} alt="Pet preview" className="h-full w-full object-cover" />
          ) : (
            <PawPrint size={56} />
          )}
        </div>
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-edge bg-card px-4 py-2.5 text-sm font-medium text-text-body transition hover:bg-sand-soft">
          <ImagePlus size={16} /> {shownImage ? "Change photo" : "Upload photo"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </label>
        {imageError ? (
          <p className="mt-2 text-xs text-danger">{imageError}</p>
        ) : (
          <p className="mt-2 text-xs text-text-muted">JPG, PNG or WEBP, up to 5MB.</p>
        )}
      </section>

      {/* البيانات */}
      <section className="rounded-xl border border-edge bg-card p-6 lg:col-span-2">
        <h2 className="text-lg font-bold text-text-heading">Pet details</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name" required error={errors.Name}>
            <input value={values.Name} onChange={set("Name")} maxLength={100} className={inputCls(errors.Name)} />
          </Field>

          <Field label="Species" required error={errors.Species}>
            <select value={values.Species} onChange={set("Species")} className={inputCls(errors.Species)}>
              <option value="">Select species</option>
              {speciesOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Breed" required error={errors.Breed}>
            <input value={values.Breed} onChange={set("Breed")} maxLength={100} className={inputCls(errors.Breed)} />
          </Field>

          <Field label="Gender" required error={errors.Gender}>
            <select value={values.Gender} onChange={set("Gender")} className={inputCls(errors.Gender)}>
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Birth date" required error={errors.BirthDate}>
            <input type="date" max={today()} value={values.BirthDate} onChange={set("BirthDate")} className={inputCls(errors.BirthDate)} />
          </Field>

          <Field label="Weight (kg)" error={errors.Weight}>
            <input type="number" inputMode="decimal" step="0.01" min="0" value={values.Weight} onChange={set("Weight")} className={inputCls(errors.Weight)} />
          </Field>

          <Field label="Colour" error={errors.Color}>
            <input value={values.Color} onChange={set("Color")} maxLength={50} className={inputCls(errors.Color)} />
          </Field>

          <Field label="Vet name" error={errors.VetName}>
            <input value={values.VetName} onChange={set("VetName")} maxLength={100} className={inputCls(errors.VetName)} />
          </Field>
        </div>

        <label className="mt-5 flex items-center gap-3 text-sm font-medium text-text-body">
          <input type="checkbox" checked={values.IsNeutered} onChange={set("IsNeutered")} className="h-4 w-4 accent-brand" />
          Neutered / Spayed
        </label>

        <div className="mt-5">
          <Field label="Description">
            <textarea
              value={values.Description}
              onChange={set("Description")}
              rows={4}
              className="w-full rounded-xl border border-field-line bg-field px-4 py-3 text-sm text-text-heading outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
          </Field>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />} {submitLabel}
          </button>
          <Link
            to={cancelTo}
            className="inline-flex items-center rounded-full border border-edge bg-card px-6 py-3 text-sm font-medium text-text-body transition hover:bg-sand-soft"
          >
            Cancel
          </Link>
        </div>
      </section>
    </form>
  );
}
