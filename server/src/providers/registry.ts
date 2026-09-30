import type { AIProvider, ModelInfo } from './provider.js';
import { OpenAIProvider } from './openai.js';
import { GeminiProvider } from './gemini.js';
import { AnthropicProvider } from './anthropic.js';
import { GroqProvider } from './groq.js';
import { OpenRouterProvider } from './openrouter.js';

const providers: AIProvider[] = [
  new OpenAIProvider(),
  new GeminiProvider(),
  new AnthropicProvider(),
  new GroqProvider(),
  new OpenRouterProvider(),
];

export function getProviders(): AIProvider[] {
  return providers;
}

export function getConfiguredProviders(): AIProvider[] {
  return providers.filter((p) => p.isConfigured());
}

export function getProviderById(id: string): AIProvider | undefined {
  return providers.find((p) => p.id === id);
}

export async function listAllModels(): Promise<
  Array<ModelInfo & { configured: boolean }>
> {
  const result: Array<ModelInfo & { configured: boolean }> = [];
  for (const provider of providers) {
    const configured = provider.isConfigured();
    const models = await provider.getModels();
    for (const m of models) {
      result.push({ ...m, configured });
    }
  }
  return result;
}

export function hasAnyProviderConfigured(): boolean {
  return getConfiguredProviders().length > 0;
}
