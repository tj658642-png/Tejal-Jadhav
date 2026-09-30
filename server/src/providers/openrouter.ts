import type { AIProvider, AIRequest, AIResponse, ModelInfo } from './provider.js';
import { env } from '../config/env.js';

export class OpenRouterProvider implements AIProvider {
  readonly id = 'openrouter';

  isConfigured(): boolean {
    return Boolean(env.OPENROUTER_API_KEY);
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'openai/gpt-4o-mini', provider: this.id, name: 'OR GPT-4o Mini', capabilities: ['text', 'json'] },
      { id: 'anthropic/claude-3.5-haiku', provider: this.id, name: 'OR Claude Haiku', capabilities: ['text', 'json'] },
    ];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!env.OPENROUTER_API_KEY) throw new Error('OpenRouter is not configured');
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        max_tokens: request.maxTokens ?? env.MAX_TOKENS,
        temperature: request.temperature ?? 0.7,
        response_format: request.jsonMode ? { type: 'json_object' } : undefined,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter error: ${res.status} ${errText.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: request.model,
      provider: this.id,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }
}
