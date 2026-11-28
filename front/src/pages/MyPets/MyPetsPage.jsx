import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, PawPrint, Plus, Stethoscope, Syringe } from "lucide-react";
import OwnerPetCard from "../../components/pets/OwnerPetCard";
import LoadingPage from "../../components/pets/LoadingPage";
import ConfirmDialog from "../../components/layout/ConfirmDialog";

import { deletePet, getMyPets } from "../../services/petService";
import { getErrorMessage } from "../../services/api";
import { formatDate } from "../../utils/formatters";
import { buildOverviewStats, getPetsHealthOverview, petId, petName, toList } from "../../utils/petHealth";

// عدّلي المسارات دي حسب الـ router عندك
const ROUTES = {
  add: "/my-pets/new",
  profile: (id) => `/my-pets/${id}`,
  edit: (id) => `/my-pets/${id}/edit`,
};

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-edge bg-white px-5 py-4 shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand-soft text-text-secondary">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-text-title">{value}</p>
        <p className="mt-1.5 text-sm text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

function dueLabel(daysLeft) {
  if (daysLeft < 0) return { text: `${Math.abs(daysLeft)}d overdue`, cls: "text-danger" };
  if (daysLeft === 0) return { text: "Today", cls: "text-brand" };
  return { text: `in ${daysLeft}d`, cls: "text-text-secondary" };
}

function CareReminders({ reminders, loading }) {
  const icons = { vaccine: Syringe, appointment: Stethoscope, care: CalendarDays };

  return (
    <aside className="h-fit rounded-xl border border-edge bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <CalendarDays size={22} className="text-text-secondary" />
        <h2 className="text-xl font-bold text-text-title">Care reminders</h2>
      </div>
      <p className="mt-2 text-sm text-text-secondary">Next 90 days across all pets</p>

      {loading ? (
        <p className="mt-5 text-sm text-text-muted">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p className="mt-5 text-sm text-text-muted">You're all caught up 🐾</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {reminders.map((r) => {
            const Icon = icons[r.type] || CalendarDays;
            const due = dueLabel(r.daysLeft);
            return (
              <li key={r.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge bg-sand-soft text-text-secondary">
                  <Icon size={15} />
                </span>
                <div>
                  <p className="font-semibold text-text-title">{r.title}</p>
                  <p className="text-sm text-text-secondary">
                    {r.petName} · {formatDate(r.date)} ·{" "}
                    <span className={`font-semibold ${due.cls}`}>{due.text}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default function MyPetsPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [health, setHealth] = useState({}); // { [PetID]: summary }
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(true);
  const [error, setError] = useState(null);

  // حالة نافذة تأكيد الحذف
  const [petToDelete, setPetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setHealthLoading(true);
    setError(null);
    try {
      const list = toList(await getMyPets());
      setPets(list);
      setLoading(false); // الكروت تظهر فوراً، والصحة تتحمّل بعدها
      setHealth(await getPetsHealthOverview(list));
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your pets."));
      setLoading(false);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const askDelete = (pet) => {
    setDeleteError("");
    setPetToDelete(pet);
  };

  const closeDelete = () => {
    if (deleting) return;
    setPetToDelete(null);
    setDeleteError("");
  };

  // بيمسح من الداتابيز عن طريق الـ API، ولو نجح بس بنشيله من الشاشة
  const confirmDelete = async () => {
    if (!petToDelete) return;
    const id = petId(petToDelete);
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePet(id);
      setPets((prev) => prev.filter((p) => petId(p) !== id));
      setHealth((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
      setPetToDelete(null);
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Could not delete this pet."));
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => buildOverviewStats(pets, health), [pets, health]);
  const reminders = useMemo(
    () => Object.values(health).flatMap((h) => h.reminders).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 8),
    [health]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-edge bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="font-serif text-3xl font-bold text-text-title sm:text-5xl">My Pets</h1>
          <p className="mt-3 max-w-2xl text-base text-text-body sm:text-lg">
            Keep every pet's profile, vaccinations and care schedule organised in one place.
          </p>
          <Link
            to={ROUTES.add}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover"
          >
            <Plus size={18} /> Add New Pet
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <LoadingPage />
        ) : error ? (
          <div className="rounded-xl border border-edge bg-danger-bg p-6 text-center">
            <p className="font-semibold text-danger">{error}</p>
            <button
              onClick={load}
              className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-hover"
            >
              Try again
            </button>
          </div>
        ) : pets.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-edge bg-surface px-6 py-16 text-center">
            <PawPrint size={44} className="text-text-secondary" />
            <h2 className="mt-4 text-2xl font-bold text-text-title">No pets yet</h2>
            <p className="mt-2 text-text-body">Add your first pet to start tracking their health and care.</p>
            <Link
              to={ROUTES.add}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-contrast hover:bg-brand-hover"
            >
              <Plus size={18} /> Add New Pet
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={PawPrint} value={stats.totalPets} label="Total pets" />
              <StatCard icon={Syringe} value={stats.vaccinationsDue} label="Vaccinations due" />
              <StatCard icon={Stethoscope} value={stats.upcomingAppointments} label="Upcoming appointments" />
              <StatCard icon={CalendarDays} value={stats.careReminders} label="Care reminders" />
            </div>

            <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
              <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
                {pets.map((pet) => (
                  <OwnerPetCard
                    key={petId(pet)}
                    pet={pet}
                    health={health[petId(pet)]}
                    viewTo={ROUTES.profile(petId(pet))}
                    onEdit={() => navigate(ROUTES.edit(petId(pet)))}
                    onDelete={askDelete}
                  />
                ))}
              </div>
              <CareReminders reminders={reminders} loading={healthLoading} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(petToDelete)}
        title={petToDelete ? `Delete ${petName(petToDelete)}?` : ""}
        message="This will permanently remove the pet and all of its health records. This can't be undone."
        confirmLabel="Yes, delete"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}