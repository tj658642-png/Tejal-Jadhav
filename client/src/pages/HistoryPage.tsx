import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';

export function HistoryPage() {
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    api.history().then((r) => setHistory(r.history)).catch(() => setHistory([]));
  }, []);

  async function remove(id: string) {
    await api.deleteAnalysis(id);
    setHistory((h) => h.filter((item) => item.id !== id));
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1">
        <h1 className="mb-4 text-2xl font-semibold">History</h1>
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={String(item.id)} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{String(item.title)}</p>
                <p className="text-sm text-slate-400">{new Date(String(item.createdAt)).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/analysis/${item.id}`}><Button variant="secondary">Open</Button></Link>
                <Button variant="ghost" onClick={() => remove(String(item.id))}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
