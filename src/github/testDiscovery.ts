import type { Context } from "probot";
import { parseTestsFromSource } from "../services/testParser";
import type { TestFile } from "../domain/types";

export async function discoverTestsInPullRequest(
  ctx: Context<any>
): Promise<TestFile[]> {
  const pr = ctx.pullRequest();
  const filesResp = await ctx.octokit.pulls.listFiles({ ...pr, per_page: 100 });

  const branch = (ctx.payload.pull_request as any).head.ref;

  const files: TestFile[] = [];

  for (const f of filesResp.data) {
    if (f.status === "removed") continue;
    if (!/\.(spec|test)\.(t|j)sx?$/.test(f.filename)) continue;

    const fileContent = await ctx.octokit.repos.getContent({
      ...ctx.repo(),
      path: f.filename,
      ref: branch,
    });

    if (
      Array.isArray(fileContent.data) ||
      fileContent.data.type !== "file" ||
      !("content" in fileContent.data)
    ) {
      continue;
    }

    const text = Buffer.from(fileContent.data.content, "base64").toString("utf8");

    const parsedFile = parseTestsFromSource(text, f.filename);
    files.push(parsedFile);
  }

  return files;
}
