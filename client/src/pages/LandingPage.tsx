import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const pipeline = ['YOU', 'ORCHESTRATOR', 'MULTIPLE AI MODELS', 'COMPARE', 'AI JUDGE', 'FINAL ANSWER'];

export function LandingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-violet-300">AI COUNCIL</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            One Question.
            <br />
            Multiple Minds.
            <br />
            One Better Answer.
          </h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Compare multiple AI models, detect disagreements, and synthesize a stronger answer with an intelligent AI judge.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/analyze"><Button>Start Analysis</Button></Link>
            <Link to="/analyze?demo=1"><Button variant="secondary">Try Demo</Button></Link>
          </div>
        </div>
        <Card className="p-6">
          <div className="space-y-3 text-center text-sm font-medium">
            {pipeline.map((step, i) => (
              <div key={step}>
                <div className="rounded-xl bg-violet-500/10 px-4 py-2">{step}</div>
                {i < pipeline.length - 1 && <div className="text-slate-500">↓</div>}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          ['Why Multi-Model AI?', 'Different models surface different blind spots, risks, and creative options.'],
          ['How It Works', 'Route to specialized agents, run models in parallel, compare, then synthesize with a Judge.'],
          ['AI Agents', 'Analyst, Creative, Critic, Researcher, Technical, Vision, and Judge.'],
          ['Supported Inputs', 'Text, code, PDFs, and images with capability-aware routing.'],
          ['Model Comparison', 'Side-by-side responses with consensus and disagreement views.'],
          ['Security', 'RLS, server-side auth checks, validated uploads, and no exposed secrets.'],
        ].map(([title, body]) => (
          <Card key={title}>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-2 text-sm text-slate-300">{body}</p>
          </Card>
        ))}
      </section>

      <p className="mt-10 text-center text-xs text-slate-500">
        Multi-model consensus can improve robustness, but agreement does not guarantee correctness. Verify important information independently.
      </p>
    </div>
  );
}
