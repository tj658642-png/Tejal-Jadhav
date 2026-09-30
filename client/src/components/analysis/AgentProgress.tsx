import { Card } from '../ui/Card';

const STEPS = [
  'Understanding request',
  'Analyst',
  'Creative',
  'Critic',
  'Comparing responses',
  'AI Judge',
  'Final answer',
];

export function AgentProgress({
  status,
  agents,
}: {
  status: string;
  agents: Array<{ agentName: string; status: string }>;
}) {
  const completedAgents = agents.filter((a) => a.status === 'success').length;
  const progress =
    status === 'completed'
      ? 100
      : status === 'synthesizing'
        ? 85
        : status === 'comparing'
          ? 70
          : Math.min(65, 20 + completedAgents * 12);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium">AI Council</h3>
        <span className="text-xs uppercase tracking-wide text-slate-400">{status}</span>
      </div>
      <div className="space-y-2">
        {agents.map((a) => (
          <div key={a.agentName} className="flex items-center justify-between text-sm">
            <span className="capitalize">{a.agentName}</span>
            <span className={a.status === 'success' ? 'text-emerald-400' : 'text-slate-400'}>
              {a.status === 'success' ? '✓ completed' : a.status === 'running' ? '⟳ running' : '○ pending'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="mb-1 text-xs text-slate-400">Comparing responses...</div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <ul className="mt-4 space-y-1 text-xs text-slate-500">
        {STEPS.map((s) => (
          <li key={s}>• {s}</li>
        ))}
      </ul>
    </Card>
  );
}
