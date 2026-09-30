import type { AgentRunRecord } from '../../types/analysis.js';

export interface ComparisonResult {
  agreementAreas: string[];
  disagreementAreas: string[];
  contradictions: string[];
  commonConclusions: string[];
  missingInformation: string[];
  averageExecutionTimeMs: number;
}

export function compareAgentRuns(runs: AgentRunRecord[]): ComparisonResult {
  const successful = runs.filter((r) => r.status === 'success' && r.response);
  const texts = successful.map((r) => r.response!.toLowerCase());

  const agreementAreas: string[] = [];
  const disagreementAreas: string[] = [];
  const contradictions: string[] = [];
  const commonConclusions: string[] = [];
  const missingInformation: string[] = [];

  const keywords = ['measure', 'audit', 'hvac', 'lighting', 'cost', 'risk', 'security', 'scale'];
  for (const kw of keywords) {
    const count = texts.filter((t) => t.includes(kw)).length;
    if (count >= 2) agreementAreas.push(`Shared theme: "${kw}" mentioned by multiple agents`);
    if (count === 1 && texts.length >= 2) disagreementAreas.push(`Only one agent emphasized "${kw}"`);
  }

  if (successful.length < runs.length) {
    missingInformation.push('Some agents failed or timed out; synthesis may be incomplete.');
  }

  const times = successful.map((r) => r.executionTimeMs ?? 0).filter((t) => t > 0);
  const averageExecutionTimeMs =
    times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return {
    agreementAreas,
    disagreementAreas,
    contradictions,
    commonConclusions,
    missingInformation,
    averageExecutionTimeMs,
  };
}
