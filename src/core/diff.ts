import simpleGit from "simple-git";

const git = simpleGit();

export async function getDiff(): Promise<string> {
  return git.diff();
}
