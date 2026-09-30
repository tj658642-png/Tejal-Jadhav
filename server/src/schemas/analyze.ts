import { z } from 'zod';

export const analyzeRequestSchema = z.object({
  prompt: z.string().min(3).max(20000),
  taskType: z.enum(['general', 'research', 'coding', 'business', 'document', 'image', 'technical']).default('general'),
  title: z.string().max(200).optional(),
  selectedAgents: z.array(z.enum(['analyst', 'creative', 'critic', 'researcher', 'technical', 'vision'])).optional(),
  selectedModels: z
    .array(z.object({ provider: z.string(), model: z.string() }))
    .optional(),
  demoScenarioId: z.string().optional(),
  isDemo: z.boolean().optional(),
  contextText: z.string().max(50000).optional(),
});
