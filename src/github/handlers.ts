import type { Context } from "probot";
import { discoverTestsInPullRequest } from "./testDiscovery";
import { ensureCommentWithTests } from "./comments";
// import { parseRecordCommand } from "../services/recordCommand";
// import { extractEpicKeyFromBody } from "./epic";
// import { buildTestReport } from "../services/report";
// import { buildJiraPayloadForTestCase } from "../services/jiraPayload";

export async function handlePullRequest(
  ctx: Context<any>
): Promise<void> {
  const files = await discoverTestsInPullRequest(ctx); // TestFile[]

  ctx.log.info(
    {
      pr: ctx.payload.pull_request.number,
      files: files.length,
      cases: files.reduce((sum, f) => sum + f.cases.length, 0),
    },
    "Discovered tests in PR (dev)"
  );

  await ensureCommentWithTests(ctx, files);
}

// Пока просто игнорируем /record, чтобы не мешал тестам
export async function handleIssueComment(
  ctx: Context<any>
): Promise<void> {
  const body = (ctx.payload.comment.body || "").trim();
  if (!body.toLowerCase().startsWith("/record")) return;

  await ctx.octokit.rest.issues.createComment({
    ...ctx.issue(),
    body:
      "`/record` is not wired in dev mode yet. Parser & PR comment work; Jira/Tricentis will be added later.",
  });
}
