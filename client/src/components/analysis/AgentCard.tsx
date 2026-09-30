import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function AgentCard({
  agent,
}: {
  agent: {
    agentName: string;
    provider: string;
    model: string;
    status: string;
    response?: string;
    executionTimeMs?: number;
    error?: string;
  };
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <Card>
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium capitalize">{agent.agentName}</h4>
            <Badge>{agent.status}</Badge>
          </div>
          <p className="text-xs text-slate-400">{agent.provider} · {agent.model}</p>
        </div>
        <span className="text-xs text-slate-400">{agent.executionTimeMs ? `${agent.executionTimeMs}ms` : ''}</span>
      </button>
      {open && (
        <div className="mt-3 whitespace-pre-wrap text-sm text-slate-200">
          {agent.error ? <p className="text-rose-300">{agent.error}</p> : agent.response}
        </div>
      )}
    </Card>
  );
}
