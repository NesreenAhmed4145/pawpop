import axios from 'axios';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000
});

// 1) إضافة التوكن لكل طلب
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2) لو التوكن مش صالح: امسحيه وبلّغي الـ AuthContext يعمل logout
// الـ auth middleware في الباك بيرجّع:
//   401 لو مفيش توكن، و 403 برسالة "Invalid or expired token!" لو التوكن باظ أو انتهى
// (403 برسالة تانية، زي "Admin privileges required"، مش بتعمل logout)
const INVALID_TOKEN_MESSAGE = 'Invalid or expired token!';

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const tokenRejected = status === 401 || (status === 403 && message === INVALID_TOKEN_MESSAGE);
    if (tokenRejected && storage.getToken()) {
      storage.removeToken();
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

// الباك أحياناً بيرجّع الرسالة في message وأحياناً في error، فالدالة دي بتوحّدهم
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error.response) {
    const data = error.response.data;
    return data?.message || data?.error || fallback;
  }
  if (error.request) {
    return 'Cannot reach the server. Please check your connection.';
  }
  return fallback;
};

export default api;
