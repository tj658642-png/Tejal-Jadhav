import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIProvider, AIRequest, AIResponse, ModelInfo } from './provider.js';
import { env } from '../config/env.js';

export class GeminiProvider implements AIProvider {
  readonly id = 'gemini';

  isConfigured(): boolean {
    return Boolean(env.GEMINI_API_KEY);
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'gemini-2.0-flash', provider: this.id, name: 'Gemini 2.0 Flash', capabilities: ['text', 'json', 'vision'] },
    ];
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!env.GEMINI_API_KEY) throw new Error('Gemini is not configured');
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: request.model,
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? env.MAX_TOKENS,
        temperature: request.temperature ?? 0.7,
        responseMimeType: request.jsonMode ? 'application/json' : undefined,
      },
    });
    const system = request.messages.find((m) => m.role === 'system')?.content ?? '';
    const userText = request.messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n');
    const parts: Array<string | { inlineData: { data: string; mimeType: string } }> = [
      system ? `${system}\n\n${userText}` : userText,
    ];
    if (request.images?.length) {
      for (const img of request.images) {
        parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
      }
    }
    const result = await model.generateContent(parts);
    const text = result.response.text();
    return { content: text, model: request.model, provider: this.id };
  }
}
