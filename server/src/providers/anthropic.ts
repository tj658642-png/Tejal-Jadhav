import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AIRequest, AIResponse, ModelInfo } from './provider.js';
import { env } from '../config/env.js';

export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic';

  isConfigured(): boolean {
    return Boolean(env.ANTHROPIC_API_KEY);
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'claude-3-5-haiku-20241022', provider: this.id, name: 'Claude 3.5 Haiku', capabilities: ['text', 'json'] },
      { id: 'claude-3-5-sonnet-20241022', provider: this.id, name: 'Claude 3.5 Sonnet', capabilities: ['text', 'json', 'vision'] },
    ];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!env.ANTHROPIC_API_KEY) throw new Error('Anthropic is not configured');
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const system = request.messages.find((m) => m.role === 'system')?.content;
    const userBlocks: Anthropic.Messages.ContentBlockParam[] = [
      {
        type: 'text',
        text: request.messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n'),
      },
    ];
    if (request.images?.length) {
      for (const img of request.images) {
        userBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: img.mimeType as 'image/jpeg', data: img.base64 },
        });
      }
    }
    const msg = await client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens ?? env.MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: userBlocks }],
    });
    const text = msg.content
      .filter((c): c is Anthropic.Messages.TextBlock => c.type === 'text')
      .map((c) => c.text)
      .join('');
    return {
      content: text,
      model: request.model,
      provider: this.id,
      usage: {
        promptTokens: msg.usage.input_tokens,
        completionTokens: msg.usage.output_tokens,
        totalTokens: msg.usage.input_tokens + msg.usage.output_tokens,
      },
    };
  }
}
