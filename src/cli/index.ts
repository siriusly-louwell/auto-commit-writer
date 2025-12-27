import { program } from "commander";
import { getDiff } from "../core/diff.js";
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

// ? Shared action handler
async function executeGeneration(
  promptType: "commit" | "changelog" | "pr",
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

program
  .command("commit")
  .description("Generate a commit message from the current diff.")
  .option("--context <text>", "Additional context for the generation")
  .option("--auto-commit", "Automatically stage and commit changes")
  .action((opt) => executeGeneration("commit", "Commit Message", { autoCommit: opt.autoCommit }));

program
  .command("changelog")
  .description("Generate changelog from the current diff.")
  .option("--context <text>", "Additional context for the generation")
  .action(() => executeGeneration("changelog", "Changelog"));

program
  .command("pr")
  .description("Generate a PR description from the current diff.")
  .option("--context <text>", "Additional context for the generation")
  .action(() => executeGeneration("pr", "Pull Request description"));

program.parse();

