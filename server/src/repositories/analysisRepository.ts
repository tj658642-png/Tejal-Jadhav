import { v4 as uuidv4 } from 'uuid';
import type {
  AgentRunRecord,
  AnalysisRecord,
  AnalysisStatus,
  JudgeResult,
  TaskType,
} from '../types/analysis.js';
import { createSupabaseAdmin } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/env.js';

interface MemoryStore {
  analyses: Map<string, AnalysisRecord & { userId: string }>;
  agentRuns: Map<string, AgentRunRecord[]>;
  finalResults: Map<string, JudgeResult & { id: string; analysisId: string; createdAt: string }>;
  inputs: Map<string, Array<Record<string, unknown>>>;
}

const memory: MemoryStore = {
  analyses: new Map(),
  agentRuns: new Map(),
  finalResults: new Map(),
  inputs: new Map(),
};

export async function createAnalysis(params: {
  userId: string;
  title: string;
  prompt: string;
  taskType: TaskType;
  isDemo: boolean;
}): Promise<AnalysisRecord> {
  const record: AnalysisRecord = {
    id: uuidv4(),
    userId: params.userId,
    title: params.title,
    originalPrompt: params.prompt,
    taskType: params.taskType,
    status: 'queued',
    isDemo: params.isDemo,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        id: record.id,
        user_id: params.userId,
        title: record.title,
        original_prompt: record.originalPrompt,
        task_type: record.taskType,
        status: record.status,
        is_demo: record.isDemo,
      })
      .select()
      .single();
    if (error) throw error;
    return mapAnalysisRow(data);
  }

  memory.analyses.set(record.id, record);
  memory.agentRuns.set(record.id, []);
  return record;
}

export async function updateAnalysisStatus(
  analysisId: string,
  status: AnalysisStatus,
  completedAt?: string,
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    await supabase
      .from('analyses')
      .update({ status, completed_at: completedAt ?? null })
      .eq('id', analysisId);
    return;
  }
  const a = memory.analyses.get(analysisId);
  if (a) {
    a.status = status;
    if (completedAt) a.completedAt = completedAt;
  }
}

export async function saveAgentRun(run: AgentRunRecord): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    await supabase.from('agent_runs').insert({
      id: run.id,
      analysis_id: run.analysisId,
      agent_name: run.agentName,
      provider: run.provider,
      model: run.model,
      status: run.status,
      response: run.response,
      execution_time_ms: run.executionTimeMs,
      token_usage: run.tokenUsage,
      error: run.error,
    });
    return;
  }
  const runs = memory.agentRuns.get(run.analysisId) ?? [];
  runs.push(run);
  memory.agentRuns.set(run.analysisId, runs);
}

export async function saveFinalResult(
  analysisId: string,
  result: JudgeResult,
): Promise<{ id: string }> {
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    await supabase.from('final_results').insert({
      id,
      analysis_id: analysisId,
      summary: result.summary,
      consensus: result.consensus,
      disagreements: result.disagreements,
      caveats: result.caveats,
      next_steps: result.nextSteps,
      confidence: result.confidence,
      confidence_reason: result.confidenceReason,
    });
    if (result.sources.length) {
      await supabase.from('sources').insert(
        result.sources.map((s) => ({
          id: uuidv4(),
          analysis_id: analysisId,
          title: s.title,
          url: s.url,
          source_type: s.sourceType,
        })),
      );
    }
    return { id };
  }
  memory.finalResults.set(analysisId, { ...result, id, analysisId, createdAt });
  return { id };
}

export async function getAnalysis(analysisId: string, userId: string): Promise<AnalysisRecord | null> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return mapAnalysisRow(data);
  }
  const a = memory.analyses.get(analysisId);
  if (!a || a.userId !== userId) return null;
  return a;
}

export async function getAnalysisPublic(analysisId: string): Promise<AnalysisRecord | null> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase.from('analyses').select('*').eq('id', analysisId).single();
    return data ? mapAnalysisRow(data) : null;
  }
  return memory.analyses.get(analysisId) ?? null;
}

export async function listAgentRuns(analysisId: string): Promise<AgentRunRecord[]> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase.from('agent_runs').select('*').eq('analysis_id', analysisId);
    return (data ?? []).map(mapAgentRunRow);
  }
  return memory.agentRuns.get(analysisId) ?? [];
}

export async function getFinalResult(analysisId: string): Promise<(JudgeResult & { id: string }) | null> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase.from('final_results').select('*').eq('analysis_id', analysisId).single();
    if (!data) return null;
    const { data: sources } = await supabase.from('sources').select('*').eq('analysis_id', analysisId);
    return {
      id: data.id,
      summary: data.summary,
      consensus: data.consensus ?? [],
      disagreements: data.disagreements ?? [],
      caveats: data.caveats ?? [],
      nextSteps: data.next_steps ?? [],
      confidence: data.confidence ?? 0,
      confidenceReason: data.confidence_reason ?? '',
      sources: (sources ?? []).map((s: { title: string; url?: string; source_type?: string }) => ({
        title: s.title,
        url: s.url,
        sourceType: s.source_type,
      })),
      agentAssessment: [],
    };
  }
  const r = memory.finalResults.get(analysisId);
  return r ? { ...r } : null;
}

export async function listHistory(userId: string): Promise<AnalysisRecord[]> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    const { data } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data ?? []).map(mapAnalysisRow);
  }
  return [...memory.analyses.values()].filter((a) => a.userId === userId);
}

export async function deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from('analyses').delete().eq('id', analysisId).eq('user_id', userId);
    return !error;
  }
  const a = memory.analyses.get(analysisId);
  if (!a || a.userId !== userId) return false;
  memory.analyses.delete(analysisId);
  memory.agentRuns.delete(analysisId);
  memory.finalResults.delete(analysisId);
  return true;
}

export async function getDashboardStats(userId: string) {
  const history = await listHistory(userId);
  const completed = history.filter((h) => h.status === 'completed' || h.status === 'partial');
  const runs = await Promise.all(history.slice(0, 20).map((h) => listAgentRuns(h.id)));
  const allRuns = runs.flat();
  const times = allRuns.map((r) => r.executionTimeMs ?? 0).filter((t) => t > 0);
  const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const models = new Set(allRuns.map((r) => `${r.provider}:${r.model}`));
  return {
    totalAnalyses: history.length,
    completedAnalyses: completed.length,
    averageExecutionTimeMs: avgTime,
    modelsUsed: models.size,
    recentAnalyses: history.slice(0, 10),
  };
}

function mapAnalysisRow(row: Record<string, unknown>): AnalysisRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    originalPrompt: String(row.original_prompt),
    taskType: row.task_type as TaskType,
    status: row.status as AnalysisStatus,
    isDemo: Boolean(row.is_demo),
    createdAt: String(row.created_at),
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
  };
}

function mapAgentRunRow(row: Record<string, unknown>): AgentRunRecord {
  return {
    id: String(row.id),
    analysisId: String(row.analysis_id),
    agentName: row.agent_name as AgentRunRecord['agentName'],
    provider: String(row.provider),
    model: String(row.model),
    status: row.status as AgentRunRecord['status'],
    response: row.response ? String(row.response) : undefined,
    executionTimeMs: row.execution_time_ms ? Number(row.execution_time_ms) : undefined,
    tokenUsage: row.token_usage ? Number(row.token_usage) : undefined,
    error: row.error ? String(row.error) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export const DEMO_USER_ID = 'demo-user-local';
