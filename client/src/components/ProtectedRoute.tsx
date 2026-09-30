import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemoAuth } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-8 text-center text-slate-400">Loading session...</div>;
  if (!user && !isDemoAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
