import { v4 as uuidv4 } from 'uuid';
import { AGENT_DEFINITIONS } from '../../agents/definitions.js';
import { env } from '../../config/env.js';
import { getProviderById, hasAnyProviderConfigured } from '../../providers/registry.js';
import type { AgentName, AgentRunStatus, JudgeResult, TaskType } from '../../types/analysis.js';
import { parseJsonLoose } from '../../utils/jsonParse.js';
import { logError, logInfo } from '../../utils/logger.js';
import {
  createAnalysis,
  saveAgentRun,
  saveFinalResult,
  updateAnalysisStatus,
} from '../../repositories/analysisRepository.js';
import { getDemoScenario } from '../demo/demoScenarios.js';
import { buildRoutingPlan } from './routing.js';

export interface RunAnalysisInput {
  userId: string;
  prompt: string;
  taskType: TaskType;
  title?: string;
  demoScenarioId?: string;
  isDemo?: boolean;
  selectedAgents?: AgentName[];
  selectedModels?: Array<{ provider: string; model: string }>;
  contextText?: string;
  images?: Array<{ mimeType: string; base64: string }>;
}

async function runWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export async function runAnalysis(input: RunAnalysisInput): Promise<{ analysisId: string }> {
  const isDemo = Boolean(input.isDemo || input.demoScenarioId);
  const analysis = await createAnalysis({
    userId: input.userId,
    title: input.title ?? input.prompt.slice(0, 80),
    prompt: input.prompt,
    taskType: input.taskType,
    isDemo,
  });

  void executeAnalysis(analysis.id, input).catch((err) => {
    logError('analysis_failed', { analysisId: analysis.id, error: String(err) });
    void updateAnalysisStatus(analysis.id, 'failed', new Date().toISOString());
  });

  return { analysisId: analysis.id };
}

async function executeAnalysis(analysisId: string, input: RunAnalysisInput): Promise<void> {
  const requestId = uuidv4();
  logInfo('analysis_start', { analysisId, requestId });

  if (input.isDemo || input.demoScenarioId) {
    await runDemoAnalysis(
      analysisId,
      input.demoScenarioId ?? 'college-electricity',
      input.prompt,
    );
    return;
  }

  if (!hasAnyProviderConfigured()) {
    await updateAnalysisStatus(analysisId, 'failed');
    throw new Error('No AI providers configured. Use Demo Mode or add API keys.');
  }

  await updateAnalysisStatus(analysisId, 'routing');
  const hasVision = Boolean(input.images?.length);
  const plan = await buildRoutingPlan(
    input.taskType,
    hasVision,
    input.selectedAgents,
    input.selectedModels,
    env.MAX_AGENTS,
  );

  await updateAnalysisStatus(analysisId, 'running');
  const promptBody = [input.contextText, input.prompt].filter(Boolean).join('\n\n');

  const results = await Promise.allSettled(
    plan.modelAssignments.map(async (assignment) => {
      const started = Date.now();
      const agentDef = AGENT_DEFINITIONS[assignment.agent];
      const provider = getProviderById(assignment.provider);
      const runId = uuidv4();
      const baseRun = {
        id: runId,
        analysisId,
        agentName: assignment.agent,
        provider: assignment.provider,
        model: assignment.model,
        createdAt: new Date().toISOString(),
      };

      if (!provider?.isConfigured()) {
        const run = { ...baseRun, status: 'failed' as const, error: 'This provider is not configured.' };
        await saveAgentRun(run);
        return run;
      }

      try {
        const response = await runWithTimeout(
          provider.generate({
            model: assignment.model,
            messages: [
              { role: 'system', content: agentDef.systemPrompt },
              { role: 'user', content: promptBody },
            ],
            maxTokens: env.MAX_TOKENS,
            images: assignment.agent === 'vision' ? input.images : undefined,
            timeoutMs: env.REQUEST_TIMEOUT_MS,
          }),
          env.REQUEST_TIMEOUT_MS,
        );
        const run = {
          ...baseRun,
          status: 'success' as const,
          response: response.content,
          executionTimeMs: Date.now() - started,
          tokenUsage: response.usage?.totalTokens,
        };
        await saveAgentRun(run);
        return run;
      } catch (err) {
        const message = String(err);
        const status: AgentRunStatus = message.includes('timeout') ? 'timeout' : 'failed';
        const friendly =
          message.includes('timeout')
            ? 'This model timed out. Continuing with other models.'
            : message.includes('401') || message.includes('auth')
              ? 'This provider authentication failed.'
              : message.includes('429')
                ? 'This provider is temporarily rate-limited.'
                : 'Agent execution failed.';
        const run = {
          ...baseRun,
          status,
          error: friendly,
          executionTimeMs: Date.now() - started,
        };
        await saveAgentRun(run);
        return run;
      }
    }),
  );

  const successful = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((r) => r.status === 'success');

  await updateAnalysisStatus(analysisId, 'comparing');
  await updateAnalysisStatus(analysisId, 'synthesizing');
  const judgeResult = await runJudge(input.prompt, successful);

  await saveFinalResult(analysisId, judgeResult);
  const finalStatus = successful.length === 0 ? 'failed' : successful.length < plan.modelAssignments.length ? 'partial' : 'completed';
  await updateAnalysisStatus(analysisId, finalStatus, new Date().toISOString());
  logInfo('analysis_complete', { analysisId, requestId, finalStatus });
}

async function runJudge(
  prompt: string,
  runs: Array<{ agentName: AgentName; response?: string }>,
): Promise<JudgeResult> {
  const payload = runs
    .map((r) => `Agent ${r.agentName}:\n${r.response ?? '(no response)'}`)
    .join('\n\n---\n\n');

  const judgeDef = AGENT_DEFINITIONS.judge;
  const configured = ['openai', 'anthropic', 'gemini', 'groq', 'openrouter']
    .map((id) => getProviderById(id))
    .find((p) => p?.isConfigured());

  if (!configured) {
    return fallbackJudge(payload);
  }

  const models = await configured.getModels();
  const model = models[0]?.id;
  if (!model) return fallbackJudge(payload);

  try {
    const res = await configured.generate({
      model,
      jsonMode: true,
      messages: [
        { role: 'system', content: judgeDef.systemPrompt },
        {
          role: 'user',
          content: `Original question:\n${prompt}\n\nAgent outputs:\n${payload}`,
        },
      ],
    });
    const parsed = parseJsonLoose<JudgeResult>(res.content);
    if (parsed) return normalizeJudge(parsed);
  } catch (err) {
    logError('judge_failed', { error: String(err) });
  }
  return fallbackJudge(payload);
}

function normalizeJudge(j: Partial<JudgeResult>): JudgeResult {
  return {
    summary: j.summary ?? 'Synthesis unavailable.',
    consensus: j.consensus ?? [],
    disagreements: j.disagreements ?? [],
    caveats: [
      ...(j.caveats ?? []),
      'Multi-model consensus can improve robustness, but agreement does not guarantee correctness.',
    ],
    nextSteps: j.nextSteps ?? [],
    confidence: typeof j.confidence === 'number' ? j.confidence : 0.5,
    confidenceReason: j.confidenceReason
      ? `Model-estimated confidence: ${j.confidenceReason}`
      : 'Model-estimated confidence',
    sources: j.sources ?? [],
    agentAssessment: j.agentAssessment ?? [],
  };
}

function fallbackJudge(payload: string): JudgeResult {
  return {
    summary: `Partial synthesis from available agent outputs (${payload.length} chars aggregated).`,
    consensus: ['See individual agent responses for aligned themes'],
    disagreements: ['Could not run structured judge; inspect agent cards'],
    caveats: [
      'Judge structured output parsing failed or judge unavailable',
      'Multi-model consensus can improve robustness, but agreement does not guarantee correctness.',
    ],
    nextSteps: ['Retry analysis or configure an additional provider for the Judge'],
    confidence: 0.4,
    confidenceReason: 'Model-estimated confidence (fallback)',
    sources: [],
    agentAssessment: [],
  };
}

async function runDemoAnalysis(analysisId: string, scenarioId: string, prompt: string): Promise<void> {
  const scenario = getDemoScenario(scenarioId);
  if (!scenario) {
    await updateAnalysisStatus(analysisId, 'failed');
    return;
  }

  await updateAnalysisStatus(analysisId, 'running');
  for (const agent of scenario.agents) {
    await new Promise((r) => setTimeout(r, 400));
    await saveAgentRun({
      id: uuidv4(),
      analysisId,
      agentName: agent,
      provider: 'demo',
      model: 'simulated',
      status: 'success',
      response: scenario.agentResponses[agent] ?? `[DEMO] Response for ${agent}`,
      executionTimeMs: 300 + Math.floor(Math.random() * 400),
      createdAt: new Date().toISOString(),
    });
  }
  await updateAnalysisStatus(analysisId, 'comparing');
  await new Promise((r) => setTimeout(r, 500));
  await updateAnalysisStatus(analysisId, 'synthesizing');
  const judge = {
    ...scenario.judge,
    summary: scenario.judge.summary,
    caveats: [...scenario.judge.caveats, `Prompt used: ${prompt.slice(0, 120)}`],
  };
  await saveFinalResult(analysisId, judge);
  await updateAnalysisStatus(analysisId, 'completed', new Date().toISOString());
}
