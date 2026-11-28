import api from './api';
import { ENDPOINTS } from './endpoints';

const BASE = ENDPOINTS.pets;

// بيحوّل قيم الفورم لـ FormData (الباك بيستقبل الصورة في حقل اسمه ImageURL)
// keepEmpty: أسماء حقول نصية نبعتها حتى لو فاضية (عشان المستخدم يقدر يمسح قيمتها في التعديل)
export const buildPetFormData = (values, imageFile = null, keepEmpty = []) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value === '' && !keepEmpty.includes(key)) return;
    formData.append(key, value);
  });
  if (imageFile) formData.append('ImageURL', imageFile);
  return formData;
};

// GET /pets/adoption  (عام، بدون توكن)
// ملحوظة: الباك الحالي مش بيقرأ أي query params هنا (البحث والفلترة لسه ناقصين في الباك)
export const getAdoptionPets = async (params = {}) => {
  const { data } = await api.get(`${BASE}/adoption`, { params });
  return data; // { message, count, data: [...] }
};

// GET /pets/my-pets
export const getMyPets = async () => {
  const { data } = await api.get(`${BASE}/my-pets`);
  return data;
};

// GET /pets/:id  -> { mode: 'owner_view' | 'adoption_view', data }
export const getPetById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
};

// POST /pets  (multipart)
export const addPet = async (values, imageFile = null) => {
  const { data } = await api.post(BASE, buildPetFormData(values, imageFile));
  return data;
};

// PATCH /pets/:id  (multipart)
export const updatePet = async (id, values, imageFile = null) => {
  const { data } = await api.patch(
    `${BASE}/${id}`,
    buildPetFormData(values, imageFile, ['Description', 'Color', 'VetName'])
  );
  return data;
};

// DELETE /pets/:id
export const deletePet = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};

// PATCH /pets/:id/status  (للأدمن، وبيستخدم في لوحة الأدمن)
export const updatePetStatus = async (id, body) => {
  const { data } = await api.patch(`${BASE}/${id}/status`, body);
  return data;
};

export function calculateAge(birthDate) {
  if (!birthDate) return "Age not specified";
  const birth = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (today.getDate() < birth.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0) return `${years} years`;
  if (months > 0) return `${months} months`;
  return "Less than a month";
}
