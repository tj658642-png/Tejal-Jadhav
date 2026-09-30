import type { AgentName, TaskType } from '../types/analysis.js';

export interface AgentDefinition {
  name: AgentName;
  title: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  preferredProviders: string[];
}

export const AGENT_DEFINITIONS: Record<AgentName, AgentDefinition> = {
  analyst: {
    name: 'analyst',
    title: 'Analyst',
    description: 'Breaks the problem into logical components and structured reasoning.',
    systemPrompt:
      'You are the Analyst agent in AI Council. Decompose the user question into assumptions, constraints, sub-problems, and evaluation criteria. Be precise and structured. Do not invent facts.',
    capabilities: ['reasoning', 'decomposition'],
    preferredProviders: ['openai', 'anthropic', 'gemini'],
  },
  creative: {
    name: 'creative',
    title: 'Creative',
    description: 'Generates alternative ideas and unconventional approaches.',
    systemPrompt:
      'You are the Creative agent in AI Council. Propose diverse, practical alternatives and novel angles. Label speculative ideas clearly.',
    capabilities: ['ideation'],
    preferredProviders: ['openai', 'gemini', 'groq'],
  },
  critic: {
    name: 'critic',
    title: 'Critic',
    description: 'Challenges assumptions and surfaces risks and weaknesses.',
    systemPrompt:
      'You are the Critic agent in AI Council. Stress-test ideas, identify blind spots, failure modes, and hidden assumptions. Be constructive.',
    capabilities: ['critique', 'risk'],
    preferredProviders: ['anthropic', 'openai', 'groq'],
  },
  researcher: {
    name: 'researcher',
    title: 'Researcher',
    description: 'Identifies evidence needs and supporting information frameworks.',
    systemPrompt:
      'You are the Researcher agent in AI Council. Outline what evidence would be needed, credible source types, and knowledge gaps. Do not fabricate citations or URLs.',
    capabilities: ['research'],
    preferredProviders: ['openai', 'gemini', 'anthropic'],
  },
  technical: {
    name: 'technical',
    title: 'Technical',
    description: 'Handles engineering, architecture, and implementation guidance.',
    systemPrompt:
      'You are the Technical agent in AI Council. Provide implementation-oriented guidance, trade-offs, and architecture notes. Never claim to have executed code.',
    capabilities: ['engineering'],
    preferredProviders: ['openai', 'anthropic', 'groq'],
  },
  vision: {
    name: 'vision',
    title: 'Vision',
    description: 'Analyzes visual inputs when vision-capable models are available.',
    systemPrompt:
      'You are the Vision agent in AI Council. Describe visual content relevant to the user task and implications. State uncertainty when the image is ambiguous.',
    capabilities: ['vision'],
    preferredProviders: ['openai', 'gemini', 'anthropic'],
  },
  judge: {
    name: 'judge',
    title: 'Judge',
    description: 'Synthesizes agent outputs into a final structured verdict.',
    systemPrompt:
      'You are the Judge in AI Council. Compare agent responses, identify consensus and disagreements, preserve meaningful alternatives, and explain uncertainty. Return valid JSON only with keys: summary, consensus, disagreements, caveats, nextSteps, confidence, confidenceReason, sources, agentAssessment. Multi-model agreement is not proof of correctness. Do not fabricate citations.',
    capabilities: ['synthesis'],
    preferredProviders: ['openai', 'anthropic', 'gemini'],
  },
};

export function routeAgents(taskType: TaskType, hasVision: boolean): AgentName[] {
  const base: AgentName[] = [];
  switch (taskType) {
    case 'coding':
    case 'technical':
      base.push('technical', 'analyst', 'critic');
      break;
    case 'document':
    case 'research':
      base.push('researcher', 'analyst', 'critic');
      break;
    case 'image':
      if (hasVision) base.push('vision');
      base.push('analyst', 'critic');
      break;
    case 'business':
      base.push('analyst', 'creative', 'critic', 'researcher');
      break;
    case 'general':
    default:
      base.push('analyst', 'creative', 'critic');
      break;
  }
  const unique = [...new Set(base)].filter((a) => a !== 'judge');
  return unique.slice(0, 4);
}
