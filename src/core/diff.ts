import simpleGit from "simple-git";

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