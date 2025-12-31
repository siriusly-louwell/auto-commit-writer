export type AIProvider = 'gemini' | 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

export interface ChangelogOptions {
  since?: string | undefined;
  until?: string | undefined;
  linkCommits?: boolean;
  showContributors?: boolean;
}

export interface ChangelogObject {
  version?: string;
  audience?: "technical" | "end-user" | "both";
  contributors?: string[];
  dateRange?: { from: string; to: string };
  repoUrl?: string;
}