import { Navigate, Route, Routes } from 'react-router-dom';
import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import NotFoundPage from '../pages/Errors/NotFoundPage';
import ServerErrorPage from '../pages/Errors/ServerErrorPage';

import Home from '../pages/Home/HomePage'

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
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/500" element={<ServerErrorPage />} />


    </Routes>
  );
}
