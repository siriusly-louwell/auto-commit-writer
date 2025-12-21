import { program } from "commander";
import { getDiff } from "../core/diff.js";
import { generateCommitMessage } from "../core/llm.js";
import { log } from "../utils/logger.js";

program
  .name("commitgen")
  .description("Generate commit messages and PR descriptions with LLMs.")
  .version("0.1.0");

// ? Shared action handler
async function executeGeneration(
  promptType: "commit" | "changelog" | "pr",
  outputLabel: string
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
  } catch (e: any) {
    log(e.message || "Unknown error", "error");
  }
}

program
  .command("commit")
  .description("Generate a commit message from the current diff.")
  .action(() => executeGeneration("commit", "Commit Message"));

program
  .command("changelog")
  .description("Generate changelog from the current diff.")
  .action(() => executeGeneration("changelog", "Changelog"));

program
  .command("pr")
  .description("Generate a PR description from the current diff.")
  .action(() => executeGeneration("pr", "Pull Request description"));

program.parse();
