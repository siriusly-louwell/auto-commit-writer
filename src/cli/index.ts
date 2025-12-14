import { program } from "commander";
import { getDiff } from "../core/diff.js";
import { generateCommitMessage } from "../core/llm.js";
import { log } from "../utils/logger.js";

program
  .name("commitgen")
  .description("Generate commit messages and PR descriptions with LLMs.")
  .version("0.1.0");

program
  .command("commit")
  .description("Generate a commit message from the current diff.")
  .action(async () => {
    try {
      const diff = await getDiff();
      if (!diff.trim()) {
        log("No changes detected.", "warn");
        return;
      }

      const message = await generateCommitMessage(diff);
      log("\nGenerated Commit Message:\n", "info");
      console.log(message);
    } catch (e: any) {
      log(e.message || "Unknown error", "error");
    }
  });

program.parse();
