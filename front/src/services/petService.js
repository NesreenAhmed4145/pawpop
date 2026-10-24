import api from './api';
import { ENDPOINTS } from './endpoints';

const BASE = ENDPOINTS.pets;

// بيحوّل قيم الفورم لـ FormData (الباك بيستقبل الصورة في حقل اسمه ImageURL)
export const buildPetFormData = (values, imageFile = null) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
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
  const { data } = await api.patch(`${BASE}/${id}`, buildPetFormData(values, imageFile));
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
