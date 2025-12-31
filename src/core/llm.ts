import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import type { AIConfig, ChangelogObject } from "../types.js";
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
  context?: string,
  changelogOptions?: ChangelogObject
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


  // Handle changelog-specific replacements
  if (promptType === "changelog" && changelogOptions) {
    // Version
    if (changelogOptions.version) content = content.replace("{{version}}", changelogOptions.version);
    else content = content.replace(/{{#if version}}[\s\S]*?{{\/if}}/g, "");

    // Audience
    if (changelogOptions.audience) {
      const audienceText = `Target audience: ${changelogOptions.audience}`;
      content = content.replace("{{#if audience}}", "");
      content = content.replace("{{audience}}", changelogOptions.audience);
      content = content.replace("{{/if}}", "");
    } else {
      content = content.replace(/{{#if audience}}[\s\S]*?{{\/if}}/g, "");
    }

    // Contributors
    if (changelogOptions.contributors && changelogOptions.contributors.length > 0) {
      const contributorsList = changelogOptions.contributors
        .map((c) => `- ${c}`)
        .join("\n");
      content = content.replace("{{contributors}}", contributorsList);
    } else {
      content = content.replace(/{{#if contributors}}[\s\S]*?{{\/if}}/g, "");
      content = content.replace("{{contributors}}", "");
    }

    // Date range
    if (changelogOptions.dateRange)
      content = content.replace(
        "{{date_range}}",
        `${changelogOptions.dateRange.from} to ${changelogOptions.dateRange.to}`
      );
    else content = content.replace("{{date_range}}", "");

    // Repository URL for commit linking
    if (changelogOptions.repoUrl) content = content.replace("{{repo_url}}", changelogOptions.repoUrl);
    else content = content.replace("{{repo_url}}", "");
  }

  // Clean up any remaining template markers
  content = content.replace(/{{#if \w+}}/g, "");
  content = content.replace(/{{\/if}}/g, "");

  return await callAI(getConfig(), systemPrompts[promptType], content);
}