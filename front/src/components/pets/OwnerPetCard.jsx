import { Link } from "react-router-dom";
import { AlertTriangle, CalendarDays, PawPrint, Pencil, Syringe, Trash2 } from "lucide-react";
import { assetUrl, formatDate } from "../../utils/formatters";
import { calculateAge, HEALTH_BADGE, petName } from "../../utils/petHealth";

// التنبيه اللي بيظهر على صورة الكارت (بس لو في تطعيم متأخر أو قريب)
const VACCINE_ALERT = {
  overdue: { label: "Vaccine overdue", cls: "text-danger" },
  "due-soon": { label: "Vaccine due soon", cls: "text-text-secondary" },
};

// كارت الحيوان في صفحة My Pets (للمالك): View Profile / Edit / Delete
// health = الملخص اللي راجع من healthService (status / nextVaccine / nextAppointment)
export default function OwnerPetCard({ pet, health, viewTo, onEdit, onDelete }) {
  const name = petName(pet);
  const badge = health ? HEALTH_BADGE[health.status] : null;
  const alert = health ? VACCINE_ALERT[health.status] : null;
  const nextVaccine = health?.nextVaccine;
  const nextAppointment = health?.nextAppointment;

  const age = calculateAge(pet.BirthDate) || (pet.Age ? `${pet.Age} years` : "");
  const breedLine = [pet.Species, pet.Breed].filter(Boolean).join(" · ");
  // الباك بيرجّع Weight كنص ("22.00") فبنحوّله لرقم
  const details = [age, pet.Gender, pet.Weight ? `${Number(pet.Weight)} kg` : ""].filter(Boolean).join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-edge bg-page shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={viewTo} className="relative block h-56 overflow-hidden bg-sand-soft sm:h-60">
        {pet.ImageURL ? (
          <img
            src={assetUrl(pet.ImageURL)}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-text-muted">
            <PawPrint size={48} />
          </span>
        )}
        {alert && (
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold shadow-sm ${alert.cls}`}
          >
            {health.status === "overdue" ? <AlertTriangle size={13} /> : <Syringe size={13} />}
            {alert.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl font-bold text-text-title sm:text-2xl">{name}</h3>
          {badge && (
            <span className={`mt-1 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>
              {badge.label}
            </span>
          )}
        </div>

        {breedLine && <p className="mt-1 text-sm text-text-secondary">{breedLine}</p>}
        {details && <p className="mt-3 text-sm text-text-body">{details}</p>}

        <div className="mt-3 space-y-2 text-sm text-text-body">
          {nextVaccine && (
            <p className="flex items-center gap-2">
              <Syringe size={16} className="shrink-0 text-text-secondary" />
              <span>
                {nextVaccine.title} {formatDate(nextVaccine.date)}
              </span>
            </p>
          )}
          {nextAppointment && (
            <p className="flex items-center gap-2">
              <CalendarDays size={16} className="shrink-0 text-text-secondary" />
              <span>
                {nextAppointment.title} {formatDate(nextAppointment.date)}
              </span>
            </p>
          )}
          {!nextVaccine && !nextAppointment && <p className="text-text-muted">No upcoming health tasks</p>}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link
            to={viewTo}
            className="flex flex-1 items-center justify-center rounded-full bg-brand py-3 text-sm font-semibold text-brand-contrast transition hover:bg-brand-hover"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${name}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-edge text-text-title transition hover:bg-sand-soft"
          >
            <Pencil size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(pet)}
            aria-label={`Delete ${name}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-edge text-danger transition hover:bg-danger-bg"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}