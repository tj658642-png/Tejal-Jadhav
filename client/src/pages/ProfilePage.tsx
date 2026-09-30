import { Card } from '../components/ui/Card';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user, isDemoAuth } = useAuth();
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <Card className="flex-1">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-4 text-sm text-slate-300">Email: {user?.email ?? (isDemoAuth ? 'demo-user-local' : '—')}</p>
        <p className="text-sm text-slate-300">Name: {user?.user_metadata?.full_name ?? '—'}</p>
      </Card>
    </div>
  );
}
