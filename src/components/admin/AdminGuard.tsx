import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
