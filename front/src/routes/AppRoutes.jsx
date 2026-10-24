import { Navigate, Route, Routes } from 'react-router-dom';
import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import NotFoundPage from '../pages/Errors/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* صفحات الزوار فقط: لو مسجل دخول بيتحول على /profile */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* صفحات محمية: لازم تسجيل دخول */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        {/* TODO: هنا هنضيف باقي الصفحات المحمية جوه MainLayout (حيواناتي، الطلبات، الحجوزات...) */}
      </Route>

      <Route path="/" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
