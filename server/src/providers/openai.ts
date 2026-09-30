import OpenAI from 'openai';
import type { AIProvider, AIRequest, AIResponse, ModelInfo } from './provider.js';
import { env } from '../config/env.js';

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai';
  private client: OpenAI | null = null;

  isConfigured(): boolean {
    return Boolean(env.OPENAI_API_KEY);
  }

  private getClient(): OpenAI {
    if (!env.OPENAI_API_KEY) throw new Error('OpenAI is not configured');
    if (!this.client) this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    return this.client;
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'gpt-4o-mini', provider: this.id, name: 'GPT-4o Mini', capabilities: ['text', 'json', 'vision'] },
      { id: 'gpt-4o', provider: this.id, name: 'GPT-4o', capabilities: ['text', 'json', 'vision', 'long_context'] },
    ];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const client = this.getClient();
    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: request.messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n') },
    ];
    if (request.images?.length) {
      for (const img of request.images) {
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
        });
      }
    }
    const completion = await client.chat.completions.create({
      model: request.model,
      messages: [
        ...request.messages.filter((m) => m.role !== 'user').map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userContent },
      ],
      max_tokens: request.maxTokens ?? env.MAX_TOKENS,
      temperature: request.temperature ?? 0.7,
      response_format: request.jsonMode ? { type: 'json_object' } : undefined,
    });
    const choice = completion.choices[0]?.message?.content ?? '';
    return {
      content: choice,
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
