import Groq from 'groq-sdk';
import type { AIProvider, AIRequest, AIResponse, ModelInfo } from './provider.js';
import { env } from '../config/env.js';

export class GroqProvider implements AIProvider {
  readonly id = 'groq';

  isConfigured(): boolean {
    return Boolean(env.GROQ_API_KEY);
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'llama-3.3-70b-versatile', provider: this.id, name: 'Llama 3.3 70B', capabilities: ['text', 'json'] },
      { id: 'llama-3.1-8b-instant', provider: this.id, name: 'Llama 3.1 8B', capabilities: ['text'] },
    ];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!env.GROQ_API_KEY) throw new Error('Groq is not configured');
    const client = new Groq({ apiKey: env.GROQ_API_KEY });
    const completion = await client.chat.completions.create({
      model: request.model,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: request.maxTokens ?? env.MAX_TOKENS,
      temperature: request.temperature ?? 0.7,
      response_format: request.jsonMode ? { type: 'json_object' } : undefined,
    });
    return {
      content: completion.choices[0]?.message?.content ?? '',
      model: request.model,
      provider: this.id,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    };
  }
}
