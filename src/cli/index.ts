import { program } from "commander";
import { getDiff, getCommitHistory, getDiffBetween, getChangelogCommits, getRepoUrl, calculateVersionBump } from "../core/diff.js";
import { generateCommitMessage } from "../core/llm.js";
import { log } from "../utils/logger.js";
import { simpleGit } from "simple-git";
import type { ChangelogObject, ChangelogOptions } from "../types.js";

program
  .name("cg")
  .description("AI-powered commit messages, PR descriptions, and changelog generation - all from your command line.")
  .version("0.1.3");

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

// ? Shared action handler for commit
async function executeGeneration(
  promptType: "commit",
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

// ? Enhanced changelog generation handler
async function executeChangelogGeneration(options: {
  since?: string;
  until?: string;
  version?: string;
  versionBump?: "auto" | "major" | "minor" | "patch";
  audience?: "technical" | "end-user" | "both";
  showContributors?: boolean;
  linkCommits?: boolean;
  context?: string;
}): Promise<void> {
  try {
    log("Fetching commit history for changelog...", "info");

    // Get commits with metadata
    const params: ChangelogOptions = {
      since: options.since,
      until: options.until,
      linkCommits: options.linkCommits ?? false,
      showContributors: options.showContributors ?? false,
    };

    const { commits, contributors, dateRange } = await getChangelogCommits(params);

    if (!commits.trim()) {
      log("No changes detected for changelog.", "warn");
      return;
    }

    // Calculate version
    let targetVersion = options.version;
    if (options.version && options.versionBump) {
      targetVersion = calculateVersionBump(
        commits,
        options.version,
        options.versionBump
      );
      log(`Version bump: ${options.version} → ${targetVersion}`, "info");
    }

    // Get repo URL for commit linking
    let repoUrl: string | undefined;
    if (options.linkCommits) {
      const url = await getRepoUrl();
      if (url) {
        repoUrl = url;
        log(`Repository URL: ${url}`, "info");
      } else {
        log("Could not detect repository URL for commit linking.", "warn");
      }
    }

    // Display metadata
    log(`Date range: ${dateRange.from} to ${dateRange.to}`, "info");
    if (options.showContributors && contributors.length > 0) {
      log(`Contributors (${contributors.length}):`, "info");
      contributors.forEach((c) => console.log(`  - ${c}`));
    }

    log("\nGenerating changelog...", "info");

    // Generate changelog
    const changelogOpts: ChangelogObject = {};
    if (targetVersion !== undefined) changelogOpts.version = targetVersion;
    if (options.audience !== undefined) changelogOpts.audience = options.audience;
    if (options.showContributors) changelogOpts.contributors = contributors;
    changelogOpts.dateRange = dateRange;
    if (repoUrl) changelogOpts.repoUrl = repoUrl;


    const changelog = await generateCommitMessage(
      commits,
      "changelog",
      options.context,
      changelogOpts
    );

    log("\nGenerated Changelog:\n", "success");
    console.log(changelog);

    // Display metadata footer
    if (options.showContributors && contributors.length > 0) {
      console.log("\n" + "=".repeat(80));
      console.log("Contributors:");
      contributors.forEach((c) => console.log(`- ${c}`));
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
  .description("Generate changelog from commit history with version management.")
  .option("--since <ref>", "Start from this commit/tag/branch (e.g., v1.0.0, HEAD~5)")
  .option("--until <ref>", "End at this commit/tag/branch (default: HEAD)")
  .option("--version <version>", "Current/base version for the changelog (e.g., 1.0.0)")
  .option(
    "--version-bump <type>",
    "Semantic version bump type: auto, major, minor, or patch (requires --version)",
    "auto"
  )
  .option(
    "--audience <type>",
    "Target audience: technical, end-user, or both (default: end-user)",
    "end-user"
  )
  .option("--show-contributors", "List all contributors in the changelog")
  .option("--link-commits", "Include commit links (requires remote repository)")
  .option("--context <text>", "Additional context for the generation")
  .action((opt) => {
    // Validate version-bump requires version
    if (opt.versionBump && opt.versionBump !== "auto" && !opt.version) {
      log("Error: --version-bump requires --version to be specified", "error");
      process.exit(1);
    }

    executeChangelogGeneration({
      since: opt.since,
      until: opt.until,
      version: opt.version,
      versionBump: opt.versionBump,
      audience: opt.audience,
      showContributors: opt.showContributors,
      linkCommits: opt.linkCommits,
      context: opt.context,
    });
  });

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