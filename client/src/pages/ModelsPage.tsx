import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Sidebar } from '../components/layout/Sidebar';
import { Badge } from '../components/ui/Badge';

export function ModelsPage() {
  const [models, setModels] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    api.models().then((r) => setModels(r.models)).catch(() => setModels([]));
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1">
        <h1 className="mb-4 text-2xl font-semibold">Models</h1>
        <div className="grid gap-3 md:grid-cols-2">
          {models.map((m) => (
            <Card key={`${m.provider}-${m.id}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{String(m.name)}</h3>
                <Badge className={m.configured ? 'bg-emerald-500/20 text-emerald-200' : ''}>
                  {m.configured ? 'Configured ✓' : 'Not configured'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-400">{String(m.provider)} · {String(m.id)}</p>
              <p className="mt-2 text-xs text-slate-500">{(m.capabilities as string[] | undefined)?.join(', ')}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
