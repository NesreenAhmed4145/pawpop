import api from './api';
import { ENDPOINTS } from './endpoints';

// كل المسارات تحت /pets/:id/...
// الموجود في الباك الحالي: POST للتطعيمات والمواعيد فقط.
// الباقي (GET / PATCH / DELETE + care) يحتاج ملف "إضافات الباك" (pawpop_backend_additions).
const base = (petId) => `${ENDPOINTS.pets}/${petId}`;

// ---------- Vaccinations ----------
// body: { VaccineName, VaccinationDate, NextDueDate, Notes, Status }
export const getVaccinations = async (petId) => (await api.get(`${base(petId)}/vaccinations`)).data;
export const addVaccination = async (petId, body) =>
  (await api.post(`${base(petId)}/vaccinations`, body)).data;
export const updateVaccination = async (petId, vaccinationId, body) =>
  (await api.patch(`${base(petId)}/vaccinations/${vaccinationId}`, body)).data;
export const deleteVaccination = async (petId, vaccinationId) =>
  (await api.delete(`${base(petId)}/vaccinations/${vaccinationId}`)).data;

// ---------- Appointments ----------
// body: { AppointmentDate, AppointmentType, Location, Notes, Status }
export const getAppointments = async (petId) => (await api.get(`${base(petId)}/appointments`)).data;
export const addAppointment = async (petId, body) =>
  (await api.post(`${base(petId)}/appointments`, body)).data;
export const updateAppointment = async (petId, appointmentId, body) =>
  (await api.patch(`${base(petId)}/appointments/${appointmentId}`, body)).data;
export const deleteAppointment = async (petId, appointmentId) =>
  (await api.delete(`${base(petId)}/appointments/${appointmentId}`)).data;

// ---------- Care schedule ----------
// body: { TaskName, ScheduleDate, IsCompleted }
export const getCareTasks = async (petId) => (await api.get(`${base(petId)}/care`)).data;
export const addCareTask = async (petId, body) => (await api.post(`${base(petId)}/care`, body)).data;
export const updateCareTask = async (petId, careId, body) =>
  (await api.patch(`${base(petId)}/care/${careId}`, body)).data;
export const deleteCareTask = async (petId, careId) =>
  (await api.delete(`${base(petId)}/care/${careId}`)).data;
