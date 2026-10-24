import api from './api';
import { ENDPOINTS } from './endpoints';

const BASE = ENDPOINTS.adoption;

// POST /adoption  { petId, Notes }
export const createAdoptionRequest = async (petId, notes = '') => {
  const { data } = await api.post(BASE, { petId, Notes: notes });
  return data;
};

// GET /adoption/my-requests  (الطلبات اللي أنا قدمتها)
export const getMyRequests = async () => {
  const { data } = await api.get(`${BASE}/my-requests`);
  return data;
};

// GET /adoption/my-pet-requests  (الطلبات الواردة على حيواناتي)
export const getReceivedRequests = async () => {
  const { data } = await api.get(`${BASE}/my-pet-requests`);
  return data;
};

// PATCH /adoption/:id/status  { Status: 'Approved' | 'Rejected' }  (صاحب الحيوان فقط)
export const updateRequestStatus = async (id, status) => {
  const { data } = await api.patch(`${BASE}/${id}/status`, { Status: status });
  return data;
};

// PATCH /adoption/:id/cancel  (صاحب الطلب فقط)
export const cancelRequest = async (id) => {
  const { data } = await api.patch(`${BASE}/${id}/cancel`);
  return data;
};

// GET /adoption/admin/all  (للأدمن، وبيستخدم في لوحة الأدمن)
export const getAllRequests = async () => {
  const { data } = await api.get(`${BASE}/admin/all`);
  return data;
};
