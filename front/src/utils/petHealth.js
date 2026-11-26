// كل دوال الحيوان والصحة في مكان واحد (OwnerPetCard / MyPetsPage / PetProfilePage)
import { getAppointments, getCareTasks, getVaccinations } from "../services/healthService";

export const REMINDER_WINDOW_DAYS = 90; // نافذة "Care reminders"
export const DUE_SOON_DAYS = 30; // أقل من كده = "Due soon"

/* ---------- أساسيات ---------- */

// الباك بيرجّع غالباً { data: [...] }
export const toList = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);

export const petId = (pet) => pet?.PetID ?? pet?.id;
export const petName = (pet) => pet?.PetName ?? pet?.Name ?? "Unnamed";

export const formatShortDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// عدد الأيام من النهارده (سالب = فات الميعاد)
export const daysUntil = (value) => {
  if (!value) return null;
  const target = new Date(value);
  if (isNaN(target)) return null;
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

// عمر الحيوان من تاريخ الميلاد
export function calculateAge(birthDate) {
  if (!birthDate) return "";

  const birth = new Date(birthDate);
  const today = new Date();

  if (isNaN(birth.getTime()) || birth > today) return "";

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) return "Less than 1 month";
  if (years === 0) return months === 1 ? "1 month" : `${months} months`;
  return years === 1 ? "1 year" : `${years} years`;
}

// حالة الصحة -> نص ولون من index.css
export const HEALTH_BADGE = {
  overdue: { label: "Overdue", cls: "bg-danger-bg text-danger" },
  "due-soon": { label: "Due soon", cls: "bg-section text-text-secondary" },
  ok: { label: "Up to date", cls: "bg-success-bg text-success" },
};

/* ---------- ملخص الصحة ---------- */

const isFinished = (status) =>
  ["cancelled", "canceled", "completed", "done"].includes(String(status || "").toLowerCase());

// تذكيرات التطعيمات: آخر NextDueDate لكل تطعيم (عشان مايتكررش لو اتاخد قبل كده)
const vaccineReminders = (pet, vaccinations) => {
  const latest = new Map();
  vaccinations.forEach((v) => {
    if (!v.NextDueDate) return;
    const key = String(v.VaccineName || "").toLowerCase();
    const current = latest.get(key);
    if (!current || new Date(v.NextDueDate) > new Date(current.NextDueDate)) latest.set(key, v);
  });
  return [...latest.values()].map((v) => ({
    id: `vac-${petId(pet)}-${v.VaccinationID ?? v.VaccineName}`,
    type: "vaccine",
    title: `${v.VaccineName || "Vaccine"} due`,
    date: v.NextDueDate,
  }));
};

const appointmentReminders = (pet, appointments) =>
  appointments
    .filter((a) => a.AppointmentDate && !isFinished(a.Status))
    .map((a) => ({
      id: `apt-${petId(pet)}-${a.AppointmentID ?? a.AppointmentDate}`,
      type: "appointment",
      title: a.AppointmentType || "Appointment",
      date: a.AppointmentDate,
    }));

const careReminders = (pet, tasks) =>
  tasks
    .filter((t) => t.ScheduleDate && !t.IsCompleted)
    .map((t) => ({
      id: `care-${petId(pet)}-${t.CareID ?? t.ScheduleDate}`,
      type: "care",
      title: t.TaskName || "Care task",
      date: t.ScheduleDate,
    }));

// بيحوّل التطعيمات والمواعيد والـ care لملخص جاهز للعرض
export function summarizeHealth(pet, vaccinations = [], appointments = [], careTasks = []) {
  const reminders = [
    ...vaccineReminders(pet, vaccinations),
    ...appointmentReminders(pet, appointments),
    ...careReminders(pet, careTasks),
  ]
    .map((r) => ({ ...r, petId: petId(pet), petName: petName(pet), daysLeft: daysUntil(r.date) }))
    .filter((r) => r.daysLeft !== null && r.daysLeft <= REMINDER_WINDOW_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const ofType = (type) => reminders.filter((r) => r.type === type);
  const vaccines = ofType("vaccine");
  const overdueVaccines = vaccines.filter((r) => r.daysLeft < 0).length;
  const dueSoonVaccines = vaccines.filter((r) => r.daysLeft >= 0 && r.daysLeft <= DUE_SOON_DAYS).length;

  let status = "ok"; // 'overdue' | 'due-soon' | 'ok'
  if (overdueVaccines > 0) status = "overdue";
  else if (dueSoonVaccines > 0) status = "due-soon";

  return {
    vaccinations,
    appointments,
    careTasks,
    reminders,
    nextVaccine: vaccines[0] || null, // الأقرب (أو الأكثر تأخيراً)
    nextAppointment: ofType("appointment").find((r) => r.daysLeft >= 0) || null,
    overdueVaccines,
    dueSoonVaccines,
    status,
  };
}

// ملخص حيوان واحد. getMyPets بيرجّع البيانات الصحية مع الحيوان؛ لو مش جاية بنطلبها
export async function getPetHealth(pet) {
  if (Array.isArray(pet.Vaccinations) && Array.isArray(pet.Appointments) && Array.isArray(pet.CareSchedules)) {
    return summarizeHealth(pet, pet.Vaccinations, pet.Appointments, pet.CareSchedules);
  }
  const [vac, apt, care] = await Promise.allSettled([
    getVaccinations(petId(pet)),
    getAppointments(petId(pet)),
    getCareTasks(petId(pet)),
  ]);
  const value = (r) => (r.status === "fulfilled" ? toList(r.value) : []);
  return summarizeHealth(pet, value(vac), value(apt), value(care));
}

// ملخص كل الحيوانات: { [PetID]: summary }
export async function getPetsHealthOverview(pets) {
  const entries = await Promise.all(pets.map(async (pet) => [petId(pet), await getPetHealth(pet)]));
  return Object.fromEntries(entries);
}

// إحصائيات صفحة My Pets (التطعيمات المستحقة = متأخرة أو قريبة)
export function buildOverviewStats(pets, healthByPet) {
  const all = Object.values(healthByPet);
  const count = (fn) => all.reduce((sum, h) => sum + fn(h), 0);
  return {
    totalPets: pets.length,
    vaccinationsDue: count((h) => h.overdueVaccines + h.dueSoonVaccines),
    upcomingAppointments: count((h) => h.reminders.filter((r) => r.type === "appointment" && r.daysLeft >= 0).length),
    careReminders: count((h) => h.reminders.filter((r) => r.type === "care").length),
  };
}