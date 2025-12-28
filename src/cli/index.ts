import { program } from "commander";
import { getDiff, getCommitHistory, getDiffBetween } from "../core/diff.js";
import { generateCommitMessage } from "../core/llm.js";
import { log } from "../utils/logger.js";
import { simpleGit } from "simple-git";

program
  .name("cg")
  .description("Generate commit messages and PR descriptions with LLMs.")
  .version("0.1.0");

const git = simpleGit();

async function stageAndCommit(commitMessage: string): Promise<void> {
  try {
    await git.add(".");
    log("Staged changes", "info");

    await git.commit(commitMessage);
    log("Changes committed successfully!", "success");
  } catch (e: any) {
    log(`Commit failed: ${e.message}`, "error");
  }
}

// ? Shared action handler for commit and changelog
async function executeGeneration(
  promptType: "commit" | "changelog",
  outputLabel: string,
  options?: { autoCommit?: boolean }
): Promise<void> {
  try {
    const diff = await getDiff();
    if (!diff.trim()) {
      log("No changes detected.", "warn");
      return;
    }

    const message = await generateCommitMessage(diff, promptType);
    log(`\nGenerated ${outputLabel}:\n`, "info");
    console.log(message);

    if (options?.autoCommit && promptType === "commit") {
      await stageAndCommit(message);
    }
  } catch (e: any) {
    log(e.message || "Unknown error", "error");
  }
}

// ? PR-specific handler using commit history
async function executePRGeneration(options: {
  base?: string;
  context?: string;
  includeCommits?: boolean;
}): Promise<void> {
  try {
    const base = options.base || "origin/main";

    log(`Fetching changes from ${base} to HEAD...`, "info");

    let content: string;

    if (options.includeCommits) content = await getCommitHistory(base, "HEAD");
    else content = await getDiffBetween(base, "HEAD");

    if (!content.trim()) {
      log(`No changes detected between ${base} and HEAD.`, "warn");
      log(`Make sure you've committed your changes and that ${base} exists.`, "info");
      return;
    }

    log("Generating PR description...", "info");
    const prDescription = await generateCommitMessage(
      content,
      "pr",
      options.context
    );

    log("\nGenerated Pull Request Description:\n", "info");
    console.log(prDescription);
  } catch (e: any) {
    log(e.message || "Unknown error", "error");
  }
}

program
  .command("commit")
  .description("Generate a commit message from the current diff.")
  .option("--context <text>", "Additional context for the generation")
  .option("--auto-commit", "Automatically stage and commit changes")
  .action((opt) =>
    executeGeneration("commit", "Commit Message", { autoCommit: opt.autoCommit })
  );

program
  .command("changelog")
  .description("Generate changelog from the current diff.")
  .option("--context <text>", "Additional context for the generation")
  .action(() => executeGeneration("changelog", "Changelog"));

program
  .command("pr")
  .description("Generate a PR description from multiple commits.")
  .option(
    "--base <branch>",
    "Base branch to compare against (default: origin/main)",
    "origin/main"
  )
  .option("--context <text>", "Additional context for the generation")
  .option(
    "--include-commits",
    "Include individual commit messages in the analysis (more comprehensive)"
  )
  .action((opt) =>
    executePRGeneration({
      base: opt.base,
      context: opt.context,
      includeCommits: opt.includeCommits,
    })
  );

program.parse();