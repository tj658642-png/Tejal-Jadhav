import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { AgentCard } from '../components/analysis/AgentCard';
import { AgentProgress } from '../components/analysis/AgentProgress';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function AnalysisResultPage() {
  const { id } = useParams();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const poll = async () => {
      try {
        const res = await api.getResult(id);
        if (!active) return;
        setData(res);
        const status = (res.analysis as { status?: string })?.status;
        if (status && !['completed', 'partial', 'failed'].includes(status)) {
          setTimeout(poll, 1200);
        }
      } catch (err) {
        setError(String(err));
      }
    };
    poll();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <p className="p-8 text-rose-300">{error}</p>;
  if (!data) return <p className="p-8 text-slate-400">Loading analysis...</p>;

  const analysis = data.analysis as Record<string, unknown>;
  const agents = (data.agents as Array<Record<string, unknown>>) ?? [];
  const result = data.result as Record<string, unknown> | null;
  const isDemo = Boolean(analysis.isDemo);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      {isDemo && <Badge className="bg-amber-500/20 text-amber-200">DEMO MODE</Badge>}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Analysis Result</h1>
        <Link to="/history"><Button variant="secondary">History</Button></Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-lg font-medium">Final Answer</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{String(result?.summary ?? 'Synthesis in progress...')}</p>
          </Card>
          {result && (
            <>
              <Section title="Executive Summary" body={String(result.summary)} />
              <ListSection title="Model Consensus" items={result.consensus as string[]} />
              <ListSection title="Disagreements" items={result.disagreements as string[]} />
              <ListSection title="Important Caveats" items={result.caveats as string[]} />
              <ListSection title="Next Steps" items={result.nextSteps as string[]} />
              <Card>
                <h3 className="font-medium">Confidence</h3>
                <p className="mt-2 text-2xl font-semibold text-violet-300">{Math.round(Number(result.confidence ?? 0) * 100)}%</p>
                <p className="text-sm text-slate-400">Model-estimated confidence — {String(result.confidenceReason ?? '')}</p>
              </Card>
            </>
          )}
          <h3 className="font-medium">Model Responses</h3>
          {agents.map((a) => (
            <AgentCard key={String(a.id)} agent={a as never} />
          ))}
        </div>
        <AgentProgress status={String(analysis.status)} agents={agents.map((a) => ({ agentName: String(a.agentName), status: String(a.status) }))} />
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return <Card><h3 className="font-medium">{title}</h3><p className="mt-2 text-sm text-slate-300">{body}</p></Card>;
}

function ListSection({ title, items }: { title: string; items?: string[] }) {
  return (
    <Card>
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        {(items ?? []).map((item) => <li key={item}>{item}</li>)}
      </ul>
    </Card>
  );
}
