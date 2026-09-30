const API_URL = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = localStorage.getItem('sb-access-token');
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!token && !import.meta.env.VITE_SUPABASE_URL) {
    headers['x-demo-user'] = '1';
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>('/api/health'),
  models: () => request<{ models: Array<Record<string, unknown>> }>('/api/models'),
  demoScenarios: () => request<{ scenarios: Array<Record<string, unknown>> }>('/api/demo/scenarios'),
  analyze: (body: Record<string, unknown>) =>
    request<{ analysisId: string; status: string }>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getAnalysis: (id: string) => request<{ analysis: Record<string, unknown> }>(`/api/analysis/${id}`),
  getResult: (id: string) => request<Record<string, unknown>>(`/api/analysis/${id}/result`),
  getAgents: (id: string) => request<{ agents: Array<Record<string, unknown>> }>(`/api/analysis/${id}/agents`),
  history: () => request<{ history: Array<Record<string, unknown>> }>('/api/history'),
  deleteAnalysis: (id: string) =>
    request<{ deleted: boolean }>(`/api/analysis/${id}`, { method: 'DELETE' }),
  dashboardStats: () => request<Record<string, unknown>>('/api/dashboard/stats'),
  upload: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('sb-access-token');
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    else headers['x-demo-user'] = '1';
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: form, headers });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};
