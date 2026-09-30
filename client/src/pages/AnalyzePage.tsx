import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sidebar } from '../components/layout/Sidebar';
import { api } from '../lib/api';

const TASK_TYPES = ['general', 'research', 'coding', 'business', 'document', 'image', 'technical'] as const;

export function AnalyzePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [taskType, setTaskType] = useState<string>('general');
  const [demoMode, setDemoMode] = useState(params.get('demo') === '1');
  const [demoScenarioId, setDemoScenarioId] = useState('college-electricity');
  const [scenarios, setScenarios] = useState<Array<{ id: string; title: string }>>([]);
  const [file, setFile] = useState<File | null>(null);
  const [contextText, setContextText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.demoScenarios().then((r) => setScenarios(r.scenarios as Array<{ id: string; title: string }>)).catch(() => undefined);
    if (demoMode) {
      setPrompt('How can a college reduce electricity consumption by 20%?');
      setTaskType('business');
    }
  }, [demoMode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (file) {
        const uploaded = await api.upload(file);
        setContextText((uploaded as { extractedText?: string }).extractedText || '');
      }
      const res = await api.analyze({
        prompt,
        taskType,
        isDemo: demoMode,
        demoScenarioId: demoMode ? demoScenarioId : undefined,
        contextText: contextText || undefined,
      });
      navigate(`/analysis/${res.analysisId}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <div className="flex-1">
        {demoMode && <Badge className="mb-4 bg-amber-500/20 text-amber-200">DEMO MODE — simulated responses</Badge>}
        <Card>
          <h1 className="text-2xl font-semibold">Create Analysis</h1>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              Task type
              <select className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2" value={taskType} onChange={(e) => setTaskType(e.target.value)}>
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              Prompt
              <textarea
                className="mt-1 min-h-40 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              Upload (PDF, image, text, code)
              <input
                className="mt-1 block w-full text-sm"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.json,.ts,.tsx,.js,.jsx,.py"
              />
            </label>
            {demoMode && (
              <label className="block text-sm">
                Demo scenario
                <select className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2" value={demoScenarioId} onChange={(e) => setDemoScenarioId(e.target.value)}>
                  {scenarios.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </label>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
                Demo mode
              </label>
              <Button type="submit" disabled={loading}>{loading ? 'Starting...' : 'Run analysis'}</Button>
            </div>
            {error && <p className="text-sm text-rose-300">{error}</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}
