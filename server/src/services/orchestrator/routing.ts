import { routeAgents } from '../../agents/definitions.js';
import type { AgentName, TaskType } from '../../types/analysis.js';
import { listAllModels } from '../../providers/registry.js';
import type { ModelInfo } from '../../types/ai.js';

export interface RoutedPlan {
  agents: AgentName[];
  modelAssignments: Array<{ agent: AgentName; provider: string; model: string }>;
}

export async function buildRoutingPlan(
  taskType: TaskType,
  hasVision: boolean,
  selectedAgents?: AgentName[],
  selectedModels?: Array<{ provider: string; model: string }>,
  maxAgents = 4,
): Promise<RoutedPlan> {
  const agents = (selectedAgents?.length ? selectedAgents : routeAgents(taskType, hasVision)).filter(
    (a) => a !== 'judge',
  ).slice(0, maxAgents);

  const allModels = await listAllModels();
  const configured = allModels.filter((m) => m.configured);

  const modelAssignments: RoutedPlan['modelAssignments'] = [];
  let modelIdx = 0;

  for (const agent of agents) {
    let pick: (ModelInfo & { configured: boolean }) | undefined;
    if (selectedModels?.length) {
      const sel = selectedModels[modelIdx % selectedModels.length];
      pick = configured.find((m) => m.provider === sel.provider && m.id === sel.model);
      modelIdx++;
    }
    if (!pick) {
      pick = configured[modelIdx % configured.length];
      modelIdx++;
    }
    if (pick) {
      modelAssignments.push({ agent, provider: pick.provider, model: pick.id });
    }
  }

  return { agents, modelAssignments };
}
