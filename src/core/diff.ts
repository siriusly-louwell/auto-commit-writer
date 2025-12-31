import simpleGit from "simple-git";
import type { ChangelogOptions } from "../types";

const git = simpleGit();

export async function getDiff(): Promise<string> {
  return git.diff();
}

/**
 * ? Get commit history with diffs from a range of commits
 * @param base - Base branch/commit (e.g., 'main', 'origin/main')
 * @param head - Head branch/commit (defaults to 'HEAD')
 * @returns Combined commit messages and diffs
 */
export async function getCommitHistory(
  base: string = "origin/main",
  head: string = "HEAD"
): Promise<string> {
  try {
    const log = await git.log({
      from: base,
      to: head,
    });

    if (log.all.length === 0) throw new Error(`No commits found between ${base} and ${head}`);

    let history = "";

    for (const commit of log.all) {
      history += `\n${"=".repeat(80)}\n`;
      history += `Commit: ${commit.hash}\n`;
      history += `Author: ${commit.author_name} <${commit.author_email}>\n`;
      history += `Date: ${commit.date}\n`;
      history += `\n${commit.message}\n`;
      history += `\n${"-".repeat(80)}\n`;

      const diff = await git.show([commit.hash, "--format="]);
      history += diff;
    }

    return history;
  } catch (error: any) {
    throw new Error(`Failed to get commit history: ${error.message}`);
  }
}

/**
 * ? Get just the commit messages without diffs (lighter weight)
 * @param base - Base branch/commit
 * @param head - Head branch/commit
 * @returns Formatted commit messages
 */
export async function getCommitMessages(
  base: string = "origin/main",
  head: string = "HEAD"
): Promise<string> {
  try {
    const log = await git.log({
      from: base,
      to: head,
    });

    if (log.all.length === 0) throw new Error(`No commits found between ${base} and ${head}`);

    return log.all
      .map(
        (commit) =>
          `Commit: ${commit.hash.substring(0, 7)}\n` +
          `Author: ${commit.author_name}\n` +
          `Date: ${commit.date}\n` +
          `Message: ${commit.message}\n`
      )
      .join("\n" + "=".repeat(80) + "\n");
  } catch (error: any) {
    throw new Error(`Failed to get commit messages: ${error.message}`);
  }
}

/**
 * ? Get the combined diff between two commits/branches
 * @param base - Base branch/commit
 * @param head - Head branch/commit
 * @returns Combined diff
 */
export async function getDiffBetween(
  base: string = "origin/main",
  head: string = "HEAD"
): Promise<string> {
  try {
    return await git.diff([`${base}...${head}`]);
  } catch (error: any) {
    throw new Error(`Failed to get diff: ${error.message}`);
  }
}

/**
 * ? Get commit history for changelog with enhanced metadata
 * @param options - Configuration for changelog generation
 * @returns Formatted commit history with metadata
 */
export async function getChangelogCommits(options: ChangelogOptions): Promise<{
  commits: string;
  contributors: string[];
  dateRange: { from: string; to: string };
}> {
  try {
    const logOptions: any = {};

    if (options.since) logOptions.from = options.since;
    if (options.until) logOptions.to = options.until;
    else logOptions.to = "HEAD";

    const log = await git.log(logOptions);

    if (log.all.length === 0)
      throw new Error(
        `No commits found${options.since ? ` since ${options.since}` : ""}${options.until ? ` until ${options.until}` : ""
        }`
      );

    // Get unique contributors
    const contributorSet = new Set<string>();
    log.all.forEach((commit) => {
      contributorSet.add(`${commit.author_name} <${commit.author_email}>`);
    });
    const contributors = Array.from(contributorSet);

    // Get date range
    const dates = log.all.map((c) => new Date(c.date));
    const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Format commits
    let formattedCommits = "";
    for (const commit of log.all) {
      formattedCommits += `\n${"=".repeat(80)}\n`;
      formattedCommits += `Commit: ${commit.hash.substring(0, 7)}`;

      if (options.linkCommits) {
        // Add full hash for linking purposes
        formattedCommits += ` (${commit.hash})`;
      }

      formattedCommits += `\n`;
      formattedCommits += `Author: ${commit.author_name} <${commit.author_email}>\n`;
      formattedCommits += `Date: ${commit.date}\n`;
      formattedCommits += `\n${commit.message}\n`;
      formattedCommits += `\n${"-".repeat(80)}\n`;

      const diff = await git.show([commit.hash, "--format="]);
      formattedCommits += diff;
    }

    return {
      commits: formattedCommits,
      contributors,
      dateRange: {
        from: oldestDate.toISOString().split("T")[0]!,
        to: newestDate.toISOString().split("T")[0]!,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to get changelog commits: ${error.message}`);
  }
}

/**
 * ? Get the current repository's remote URL for commit linking
 * @returns GitHub/GitLab/etc repository URL or null if not found
 */
export async function getRepoUrl(): Promise<string | null> {
  try {
    const remotes = await git.getRemotes(true);

    if (remotes.length === 0) return null;

    // Prefer 'origin' remote
    const origin = remotes.find((r) => r.name === "origin") || remotes[0];

    if (!origin || !origin.refs.fetch) return null;

    // Convert SSH or HTTPS URLs to web URLs
    let url = origin.refs.fetch;

    // SSH format: git@github.com:user/repo.git
    if (url.startsWith("git@")) {
      url = url
        .replace(/^git@([^:]+):/, "https://$1/")
        .replace(/\.git$/, "");
    }
    // HTTPS format: https://github.com/user/repo.git
    else if (url.endsWith(".git")) {
      url = url.replace(/\.git$/, "");
    }

    return url;
  } catch (error) {
    return null;
  }
}

/**
 * ? Calculate semantic version bump based on commit messages
 * @param commits - Array of commit messages
 * @param currentVersion - Current version (e.g., "1.0.0")
 * @param bumpType - Explicit bump type or 'auto' for detection
 * @returns New version string
 */
export function calculateVersionBump(
  commits: string,
  currentVersion: string,
  bumpType: "auto" | "major" | "minor" | "patch" = "auto"
): string {
  const parts = currentVersion.split(".").map(Number);
  const major = parts[0] ?? 0;
  const minor = parts[1] ?? 0;
  const patch = parts[2] ?? 0;

  if (bumpType !== "auto") {
    switch (bumpType) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  // Auto-detect from commit messages
  const hasBreaking =
    /BREAKING CHANGE:|breaking:/i.test(commits) ||
    commits.includes("!:"); // conventional commit breaking change marker

  const hasFeat = /^feat(\(.*?\))?:/m.test(commits);
  const hasFix = /^fix(\(.*?\))?:/m.test(commits);

  if (hasBreaking) {
    return `${major + 1}.0.0`;
  } else if (hasFeat) {
    return `${major}.${minor + 1}.0`;
  } else if (hasFix) {
    return `${major}.${minor}.${patch + 1}`;
  }

  // Default to patch if no conventional commits detected
  return `${major}.${minor}.${patch + 1}`;
}