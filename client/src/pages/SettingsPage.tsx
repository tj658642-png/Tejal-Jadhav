import { Card } from '../components/ui/Card';
import { Sidebar } from '../components/layout/Sidebar';

export function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar />
      <Card className="flex-1 space-y-3">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-300">Configure providers via server environment variables. API keys are never shown in the UI.</p>
        <p className="text-xs text-slate-500">MAX_AGENTS, MAX_TOKENS, REQUEST_TIMEOUT_MS, and MAX_FILE_SIZE_MB are enforced server-side.</p>
      </Card>
    </div>
  );
}
