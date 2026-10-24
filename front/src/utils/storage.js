import { STORAGE_KEYS } from './constants';

// كل العمليات جوه try/catch لأن localStorage ممكن يفشل (وضع الخصوصية مثلاً)
const safeGet = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

const safeRemove = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const storage = {
  getToken: () => safeGet(STORAGE_KEYS.token),
  setToken: (token) => safeSet(STORAGE_KEYS.token, token),
  removeToken: () => safeRemove(STORAGE_KEYS.token),

  getTheme: () => safeGet(STORAGE_KEYS.theme),
  setTheme: (theme) => safeSet(STORAGE_KEYS.theme, theme)
};
