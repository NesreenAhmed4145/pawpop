import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

// صفحات login/register: لو المستخدم مسجل دخول بالفعل يوديه على البروفايل
// (أو على الصفحة اللي كان رايحلها قبل ما يتحول على login)
export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
<div className="flex min-h-screen items-center justify-center px-4 py-8">
            <Spinner size={32} />
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/profile';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
