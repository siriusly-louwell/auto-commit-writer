export type AIProvider = 'gemini' | 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
//   model: string;
}