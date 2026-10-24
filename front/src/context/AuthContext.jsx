import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { storage } from '../utils/storage';

export const AuthContext = createContext(null);

// ملحوظة: الـ AuthProvider بره الـ BrowserRouter (زي ما في main.jsx)،
// فمفيش useNavigate هنا. التنقل بيتم من الصفحات والـ ProtectedRoute/GuestRoute.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.getToken());
  const [user, setUser] = useState(null);
  // لو فيه توكن محفوظ لازم نستنى تحميل بيانات المستخدم قبل ما نقرر نوديه فين
  const [loading, setLoading] = useState(() => Boolean(storage.getToken()));

  const clearSession = useCallback(() => {
    storage.removeToken();
    setToken(null);
    setUser(null);
  }, []);

  // 1) استرجاع الجلسة عند فتح الموقع أو عمل refresh
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!storage.getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getProfile();
        if (!cancelled) setUser(res.data);
      } catch {
        // توكن منتهي أو مستخدم اتمسح: نمسح الجلسة
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // 2) api.js بيبعت الحدث ده لما الباك يرفض التوكن (401 أو توكن منتهي)
  useEffect(() => {
    const handleForcedLogout = () => clearSession();
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [clearSession]);

  // تسجيل الدخول: بيحفظ التوكن في localStorage وبعدها بيجيب بيانات البروفايل كاملة (فيها Role)
  const login = useCallback(
    async (email, password) => {
      const res = await authService.login(email, password);
      storage.setToken(res.token);
      setToken(res.token);

      try {
        const profile = await authService.getProfile();
        setUser(profile.data);
      } catch (error) {
        clearSession();
        throw error;
      }
      return res;
    },
    [clearSession]
  );

  // إنشاء حساب: مبيعملش تسجيل دخول تلقائي (المطلوب: بعد الإنشاء يروح على صفحة login)
  const register = useCallback((payload) => authService.register(payload), []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // لإعادة تحميل بيانات المستخدم بعد تعديل البروفايل
  const refreshUser = useCallback(async () => {
    const res = await authService.getProfile();
    setUser(res.data);
    return res.data;
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshUser
    }),
    [token, user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
