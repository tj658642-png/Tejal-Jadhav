import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';

export function DashboardPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  useEffect(() => {
    api.dashboardStats().then(setStats).catch(() => setStats(null));
  }, []);
  const recent = (stats?.recentAnalyses as Array<Record<string, unknown>>) ?? [];
  const chartData = recent.slice(0, 5).map((r) => ({ name: String(r.title).slice(0, 12), count: 1 }));

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total analyses" value={Number(stats?.totalAnalyses ?? 0)} />
          <StatCard label="Completed" value={Number(stats?.completedAnalyses ?? 0)} />
          <StatCard label="Avg execution (ms)" value={Number(stats?.averageExecutionTimeMs ?? 0)} />
          <StatCard label="Models used" value={Number(stats?.modelsUsed ?? 0)} />
        </div>
        <Card>
          <h2 className="mb-4 font-medium">Recent activity</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-medium">Recent analyses</h2>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-sm text-slate-400">No analyses yet. Start one from Analyze.</p>}
            {recent.map((item) => (
              <div key={String(item.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{String(item.title)}</p>
                  <p className="text-slate-400">{String(item.taskType)} · {String(item.status)}</p>
                </div>
                <Link to={`/analysis/${item.id}`}><Button variant="secondary">Open</Button></Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <Card><p className="text-sm text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></Card>;
}
