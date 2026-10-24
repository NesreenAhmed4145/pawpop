import api from './api';
import { ENDPOINTS } from './endpoints';

const BASE = ENDPOINTS.users;

// POST /users/register  ->  201 { status, message, data: { UserID, Email } }
export const register = async ({ fullName, email, password, phone }) => {
  const body = { FullName: fullName, Email: email, Password: password };
  if (phone) body.Phone = phone;
  const { data } = await api.post(`${BASE}/register`, body);
  return data;
};

// POST /users/login  ->  200 { message, token, data: { UserID, Email, FullName, ... } }
export const login = async (email, password) => {
  const { data } = await api.post(`${BASE}/login`, { Email: email, Password: password });
  return data;
};

// GET /users/profile  ->  200 { status, data: { UserID, FullName, Email, Phone, ProfileImageURL, Role, CreatedAt } }
export const getProfile = async () => {
  const { data } = await api.get(`${BASE}/profile`);
  return data;
};

// PATCH /users/profile
// - بدون صورة: بنبعت JSON { FullName, Phone } (شغال مع الباك الحالي)
// - مع صورة: multipart بحقل ProfileImage (يحتاج إضافة الباك الخاصة بصورة البروفايل)
export const updateProfile = async ({ fullName, phone }, imageFile = null) => {
  const fields = {};
  if (fullName !== undefined) fields.FullName = fullName;
  if (phone !== undefined) fields.Phone = phone;

  if (imageFile) {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    formData.append('ProfileImage', imageFile);
    const { data } = await api.patch(`${BASE}/profile`, formData);
    return data;
  }

  const { data } = await api.patch(`${BASE}/profile`, fields);
  return data;
};

// PATCH /users/change-password  (يحتاج إضافة الباك الخاصة بتغيير كلمة المرور، مش موجودة في الكود الحالي)
export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.patch(`${BASE}/change-password`, {
    CurrentPassword: currentPassword,
    NewPassword: newPassword
  });
  return data;
};
