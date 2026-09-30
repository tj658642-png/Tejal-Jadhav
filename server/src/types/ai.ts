export type ModelCapability =
  | 'text'
  | 'vision'
  | 'json'
  | 'streaming'
  | 'long_context';

export interface ModelInfo {
  id: string;
  provider: string;
  name: string;
  capabilities: ModelCapability[];
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
  images?: Array<{ mimeType: string; base64: string }>;
  timeoutMs?: number;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  raw?: unknown;
}

export interface AIStreamChunk {
  content: string;
  done?: boolean;
}

export interface AIProvider {
  readonly id: string;
  isConfigured(): boolean;
  getModels(): Promise<ModelInfo[]>;
  generate(request: AIRequest): Promise<AIResponse>;
}
