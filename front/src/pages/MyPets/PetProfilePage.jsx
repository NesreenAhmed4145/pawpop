import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, PawPrint, Pencil, Plus, Stethoscope, Syringe, Trash2, X } from "lucide-react";

import LoadingPage from "../../components/pets/LoadingPage";
import ConfirmDialog from "../../components/layout/ConfirmDialog";
import { addCareTask, getAppointments, getCareTasks, getVaccinations, updateCareTask } from "../../services/healthService";
import { deletePet, getPetById } from "../../services/petService";
import { getErrorMessage } from "../../services/api";
import { assetUrl } from "../../utils/formatters";
import {
  calculateAge,
  daysUntil,
  formatShortDate,
  HEALTH_BADGE,
  petId,
  petName,
  summarizeHealth,
  toList,
} from "../../utils/petHealth";

// عدّلي المسارات دي حسب الـ router عندك
const ROUTES = {
  list: "/my-pets",
  edit: (id) => `/my-pets/${id}/edit`,
};

// التابات اللي ليها بيانات فعلاً في الباك (مفيش Notes / Allergies / Medications / Microchip عندكم)
const TABS = ["Overview", "Health", "Vaccinations", "Appointments", "Care"];

// حقول الحيوان زي ما هي في الباك: Name, Species, Breed, Gender, BirthDate, Weight,
// Color, IsNeutered, VetName, Description, ImageURL
function normalizePet(pet) {
  const age = calculateAge(pet.BirthDate);
  return {
    name: petName(pet),
    species: pet.Species || "",
    breed: pet.Breed || "",
    gender: pet.Gender || "",
    age,
    born: pet.BirthDate ? `${formatShortDate(pet.BirthDate)}${age ? ` (${age})` : ""}` : "",
    weight: pet.Weight ? `${Number(pet.Weight)} kg` : "", // الباك بيرجّع الوزن كنص ("22.00")
    colour: pet.Color || "",
    neutered: pet.IsNeutered === null || pet.IsNeutered === undefined ? "" : pet.IsNeutered ? "Yes" : "No",
    vet: pet.VetName || "",
    description: pet.Description || "",
    image: pet.ImageURL ? assetUrl(pet.ImageURL) : "",
  };
}

// ---------- مكونات صغيرة ----------
function InfoTile({ label, value, children }) {
  return (
    <div className="rounded-xl bg-sand px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{label}</p>
      <div className="mt-1 text-[15px] font-semibold text-text-heading">{children ?? (value || "—")}</div>
    </div>
  );
}

function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-edge bg-white p-6 sm:p-7 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-text-heading">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatusBadge({ status, className = "" }) {
  const b = HEALTH_BADGE[status];
  if (!b) return null;
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${b.cls} ${className}`}>{b.label}</span>;
}

function Empty({ children }) {
  return <p className="text-sm text-text-secondary">{children}</p>;
}

function ListRow({ title, subtitle, right }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-edge px-4 py-3.5">
      <div className="min-w-0">
        <p className="truncate font-semibold text-text-heading">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {right}
    </li>
  );
}

function ReminderModal({ onClose, onSave }) {
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!task.trim() || !date) return setErr("Please enter a task and a date.");
    setSaving(true);
    setErr("");
    try {
      await onSave({ TaskName: task.trim(), ScheduleDate: date });
    } catch (error) {
      setErr(getErrorMessage(error, "Could not add the reminder."));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm" onClick={() => !saving && onClose()}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-edge bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-heading">New reminder</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-heading">
            <X size={20} />
          </button>
        </div>
        <label className="mt-5 block text-sm font-medium text-text-body">
          Task
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Grooming, flea treatment"
            className="mt-1.5 w-full rounded-xl border border-field-line bg-field px-4 py-2.5 text-text-heading outline-none focus:border-brand"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-text-body">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-field-line bg-field px-4 py-2.5 text-text-heading outline-none focus:border-brand"
          />
        </label>
        {err && <p className="mt-4 rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger">{err}</p>}
        <button
          type="submit"
          disabled={saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-cocoa px-5 py-3 text-sm font-semibold text-white transition hover:bg-cocoa-hover disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />} Add reminder
        </button>
      </form>
    </div>
  );
}

function ReminderButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-white px-4 py-1.5 text-sm font-medium text-text-body transition hover:bg-sand-soft"
    >
      <Plus size={15} /> Reminder
    </button>
  );
}

// ---------- الصفحة ----------
export default function PetProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rawPet, setRawPet] = useState(null);
  const [isOwner, setIsOwner] = useState(true);
  const [lists, setLists] = useState({ vaccinations: [], appointments: [], care: [] });
  const [healthUnavailable, setHealthUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Overview");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reminderOpen, setReminderOpen] = useState(false);

  // التطعيمات والمواعيد والـ care: GET /pets/:id/{vaccinations|appointments|care} (للمالك بس)
  const loadHealth = useCallback(async () => {
    const [v, a, c] = await Promise.allSettled([getVaccinations(id), getAppointments(id), getCareTasks(id)]);
    setHealthUnavailable([v, a, c].every((r) => r.status === "rejected"));
    const val = (r) => (r.status === "fulfilled" ? toList(r.value) : []);
    setLists({ vaccinations: val(v), appointments: val(a), care: val(c) });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // GET /pets/:id -> { mode: 'owner_view' | 'adoption_view', data }
        const res = await getPetById(id);
        if (cancelled) return;
        setRawPet(res?.data ?? res);
        const owner = res?.mode ? res.mode === "owner_view" : true;
        setIsOwner(owner);
        setLoading(false);
        if (owner) await loadHealth(); // الزائر مالوش صلاحية على بيانات الصحة
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.status === 404 ? "We couldn't find this pet." : getErrorMessage(err, "Could not load this pet."));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, loadHealth]);

  const pet = useMemo(() => (rawPet ? normalizePet(rawPet) : null), [rawPet]);
  const summary = useMemo(
    () => (rawPet ? summarizeHealth(rawPet, lists.vaccinations, lists.appointments, lists.care) : null),
    [rawPet, lists]
  );

  // القادمة بس (المواعيد اللي فاتت ومتعلّمتش Completed مابتتعرضش هنا)
  const upcomingAppointments = summary?.reminders.filter((r) => r.type === "appointment" && r.daysLeft >= 0) ?? [];
  const careSchedule = summary?.reminders.filter((r) => r.type !== "appointment") ?? [];
  const openCareTasks = lists.care.filter((c) => !c.IsCompleted).length;

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePet(petId(rawPet) ?? id);
      navigate(ROUTES.list, { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Could not delete this pet."));
      setDeleting(false);
    }
  };

  // POST /pets/:id/care  { TaskName, ScheduleDate }
  const addReminder = async (body) => {
    await addCareTask(id, body);
    setReminderOpen(false);
    await loadHealth();
  };

  // PATCH /pets/:id/care/:careId  { IsCompleted }
  const toggleCare = async (task) => {
    const next = !task.IsCompleted;
    setLists((l) => ({ ...l, care: l.care.map((t) => (t === task ? { ...t, IsCompleted: next } : t)) }));
    try {
      await updateCareTask(id, task.CareID, { IsCompleted: next });
    } catch {
      loadHealth(); // رجّعي الحالة الحقيقية من السيرفر لو فشل التحديث
    }
  };

  if (loading) return <div className="min-h-screen bg-white"><LoadingPage /></div>;

  if (error || !pet) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 text-center">
        <PawPrint size={44} className="text-text-secondary" />
        <p className="mt-4 text-lg font-semibold text-text-title">{error || "Pet not found."}</p>
        <Link to={ROUTES.list} className="mt-5 rounded-full bg-cocoa px-6 py-2.5 text-sm font-semibold text-white hover:bg-cocoa-hover">
          Back to My Pets
        </Link>
      </div>
    );
  }

  const subtitle = [pet.species, pet.breed, pet.gender, pet.age].filter(Boolean).join(" · ");
  // الزائر (adoption_view) مالوش تابات الصحة
  const tabs = isOwner ? TABS : ["Overview"];

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header */}
      <section className="border-b border-edge bg-sand-soft">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
          <Link to={ROUTES.list} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-heading">
            <ArrowLeft size={16} /> My Pets
          </Link>

          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="h-44 w-44 shrink-0 overflow-hidden rounded-3xl bg-sand shadow-lg sm:h-52 sm:w-52">
              {pet.image ? (
                <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-text-muted"><PawPrint size={56} /></span>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold text-text-heading sm:text-5xl">{pet.name}</h1>
                {isOwner && !healthUnavailable && summary && <StatusBadge status={summary.status} />}
              </div>
              {subtitle && <p className="mt-2 text-lg text-text-secondary">{subtitle}</p>}
              {pet.description && <p className="mt-3 max-w-2xl text-lg text-text-body">{pet.description}</p>}
            </div>

            {isOwner && (
              <div className="flex items-center gap-3 sm:pb-1">
                <Link
                  to={ROUTES.edit(id)}
                  className="inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cocoa-hover"
                >
                  <Pencil size={16} /> Edit profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setConfirmOpen(true);
                  }}
                  aria-label={`Delete ${pet.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-white text-danger transition hover:bg-danger-bg"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="mt-9 overflow-x-auto">
            <div role="tablist" className="inline-flex gap-1 rounded-full border border-edge bg-sand-soft/70 p-1">
              {tabs.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    tab === t ? "bg-white text-text-heading shadow-sm" : "text-text-secondary hover:text-text-heading"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`${tabs.length > 1 ? "mt-6" : "mt-9"} grid items-start gap-6 lg:grid-cols-3`}>
          {/* العمود الرئيسي */}
          <div className={`space-y-6 ${isOwner ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {tab === "Overview" && (
              <>
                <Card title="Basic information">
                  <div className="grid gap-3.5 sm:grid-cols-3">
                    <InfoTile label="Species" value={pet.species} />
                    <InfoTile label="Breed" value={pet.breed} />
                    <InfoTile label="Gender" value={pet.gender} />
                    <InfoTile label="Born" value={pet.born} />
                    <InfoTile label="Weight" value={pet.weight} />
                    <InfoTile label="Colour" value={pet.colour} />
                    <InfoTile label="Neutered / Spayed" value={pet.neutered} />
                    {isOwner && <InfoTile label="Vet" value={pet.vet} />}
                  </div>
                </Card>
                {isOwner && (
                  <Card title="Health overview">
                    <div className="grid gap-3.5 sm:grid-cols-3">
                      <InfoTile label="Vaccinations">
                        {summary && !healthUnavailable ? <StatusBadge status={summary.status} /> : "—"}
                      </InfoTile>
                      <InfoTile label="Vaccines recorded" value={String(lists.vaccinations.length)} />
                      <InfoTile label="Open care tasks" value={String(openCareTasks)} />
                    </div>
                  </Card>
                )}
              </>
            )}

            {isOwner && tab === "Health" && (
              <Card title="Health details">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <InfoTile label="Weight" value={pet.weight} />
                  <InfoTile label="Neutered / Spayed" value={pet.neutered} />
                  <InfoTile label="Vet" value={pet.vet} />
                  <InfoTile label="Vaccinations">
                    {summary && !healthUnavailable ? <StatusBadge status={summary.status} /> : "—"}
                  </InfoTile>
                </div>
              </Card>
            )}

            {isOwner && tab === "Vaccinations" && (
              <Card title="Vaccinations">
                {lists.vaccinations.length === 0 ? (
                  <Empty>No vaccinations recorded yet.</Empty>
                ) : (
                  <ul className="space-y-3">
                    {lists.vaccinations.map((v) => {
                      const left = v.NextDueDate ? daysUntil(v.NextDueDate) : null;
                      return (
                        <ListRow
                          key={v.VaccinationID}
                          title={v.VaccineName}
                          subtitle={`Given ${formatShortDate(v.VaccinationDate)}${v.NextDueDate ? ` · Next due ${formatShortDate(v.NextDueDate)}` : ""}`}
                          right={left !== null && left < 0 ? <StatusBadge status="overdue" /> : v.Status ? <span className="text-sm text-text-secondary">{v.Status}</span> : null}
                        />
                      );
                    })}
                  </ul>
                )}
              </Card>
            )}

            {isOwner && tab === "Appointments" && (
              <Card title="Appointments">
                {lists.appointments.length === 0 ? (
                  <Empty>No appointments yet.</Empty>
                ) : (
                  <ul className="space-y-3">
                    {lists.appointments.map((a) => (
                      <ListRow
                        key={a.AppointmentID}
                        title={a.AppointmentType || "Vet visit"}
                        subtitle={`${formatShortDate(a.AppointmentDate)}${a.Location ? ` · ${a.Location}` : ""}`}
                        right={a.Status ? <span className="text-sm capitalize text-text-secondary">{a.Status}</span> : null}
                      />
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {isOwner && tab === "Care" && (
              <Card title="Care schedule" action={<ReminderButton onClick={() => setReminderOpen(true)} />}>
                {lists.care.length === 0 ? (
                  <Empty>No care tasks yet.</Empty>
                ) : (
                  <ul className="space-y-3">
                    {lists.care.map((c) => (
                      <ListRow
                        key={c.CareID}
                        title={<span className={c.IsCompleted ? "line-through opacity-60" : ""}>{c.TaskName}</span>}
                        subtitle={formatShortDate(c.ScheduleDate)}
                        right={
                          <button
                            type="button"
                            onClick={() => toggleCare(c)}
                            aria-label={c.IsCompleted ? "Mark as not done" : "Mark as done"}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                              c.IsCompleted ? "border-success bg-success-bg text-success" : "border-edge text-text-muted hover:bg-sand-soft"
                            }`}
                          >
                            <Check size={16} />
                          </button>
                        }
                      />
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>

          {/* العمود الجانبي (للمالك بس) */}
          {isOwner && (
            <div className="space-y-6">
              <Card title={<><Stethoscope size={21} className="text-text-secondary" /> Upcoming appointments</>}>
                {healthUnavailable ? (
                  <Empty>Health data isn't available right now.</Empty>
                ) : upcomingAppointments.length === 0 ? (
                  <Empty>No upcoming vet visits.</Empty>
                ) : (
                  <ul className="space-y-3">
                    {upcomingAppointments.map((r) => (
                      <li key={r.id}>
                        <p className="font-semibold text-text-heading">{r.title}</p>
                        <p className="text-sm text-text-secondary">{formatShortDate(r.date)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card title="Care schedule" action={<ReminderButton onClick={() => setReminderOpen(true)} />}>
                {careSchedule.length === 0 ? (
                  <Empty>Nothing scheduled in the next 90 days.</Empty>
                ) : (
                  <ul className="space-y-3.5">
                    {careSchedule.map((r) => (
                      <li key={r.id} className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sand text-text-secondary">
                          {r.type === "vaccine" ? <Syringe size={17} /> : <Pencil size={17} />}
                        </span>
                        <div>
                          <p className="font-semibold text-text-heading">{r.title}</p>
                          <p className="text-sm text-text-secondary">
                            {r.type === "vaccine" ? "Vaccination" : "Care"} · {formatShortDate(r.date)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${pet.name}?`}
        message="This will permanently remove the pet and all of its health records. This can't be undone."
        confirmLabel="Yes, delete"
        loading={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setConfirmOpen(false)}
      />
      {reminderOpen && <ReminderModal onClose={() => setReminderOpen(false)} onSave={addReminder} />}
    </div>
  );
}