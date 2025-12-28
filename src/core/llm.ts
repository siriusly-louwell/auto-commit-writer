import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import type { AIConfig } from "../types.js";
import { callAI } from "./aiAdapter.js";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

function getConfig(): AIConfig {
  const provider = process.env.AI_PROVIDER as 'gemini' | 'openai' | 'anthropic';

  const apiKeyMap = {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY
  };

  const apiKey = apiKeyMap[provider];
  if (!apiKey) throw new Error(`API key not found for provider: ${provider}`);

  return { provider, apiKey };
}

function loadPrompt(name: string): string {
  const file = resolve(__dirname, "..", "prompts", `${name}.prompt.txt`);
  return readFileSync(file, "utf8");
}

export async function generateCommitMessage(
  diff: string,
  promptType: "commit" | "changelog" | "pr" = "commit",
  context?: string
): Promise<string> {

  const template = loadPrompt(promptType);
  let content = template.replace("{{diff}}", diff);
  const systemPrompts: Record<typeof promptType, string> = {
    commit: "You write clean, concise commit messages following conventional commit format.",
    changelog: "You write clear, user-friendly changelogs that highlight important changes.",
    pr: "You write comprehensive PR descriptions that summarize the purpose, changes, and impact of multiple commits. Focus on the overall goal and key changes, not individual commit details."
  };

  if (context) content = content.replace("{{context}}", context);
  else content = content.replace("{{context}}", "");

  return await callAI(getConfig(), systemPrompts[promptType], content);
}