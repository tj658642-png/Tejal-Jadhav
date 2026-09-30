export type TaskType =
  | 'general'
  | 'research'
  | 'coding'
  | 'business'
  | 'document'
  | 'image'
  | 'technical';

export type AnalysisStatus =
  | 'queued'
  | 'routing'
  | 'running'
  | 'comparing'
  | 'synthesizing'
  | 'completed'
  | 'partial'
  | 'failed';

export type AgentName =
  | 'analyst'
  | 'creative'
  | 'critic'
  | 'researcher'
  | 'technical'
  | 'vision'
  | 'judge';

export type AgentRunStatus = 'pending' | 'running' | 'success' | 'failed' | 'timeout' | 'skipped';

export interface JudgeResult {
  summary: string;
  consensus: string[];
  disagreements: string[];
  caveats: string[];
  nextSteps: string[];
  confidence: number;
  confidenceReason: string;
  sources: Array<{ title: string; url?: string; sourceType?: string }>;
  agentAssessment: Array<{ agent: string; assessment: string }>;
}

export interface AgentRunRecord {
  id: string;
  analysisId: string;
  agentName: AgentName;
  provider: string;
  model: string;
  status: AgentRunStatus;
  response?: string;
  executionTimeMs?: number;
  tokenUsage?: number;
  error?: string;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  title: string;
  originalPrompt: string;
  taskType: TaskType;
  status: AnalysisStatus;
  isDemo: boolean;
  createdAt: string;
  completedAt?: string;
}
