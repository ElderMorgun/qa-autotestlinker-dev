import type { Context } from "probot";
import { discoverTestsInPullRequest } from "./testDiscovery";
import { ensureCommentWithTests } from "./comments";
import { parseRecordCommand } from "../services/recordCommand";
import { createTestCasesMock } from "../services/tricentis";
import { extractEpicKeyFromBody } from "./epic";

export async function handlePullRequest(
  ctx: Context<any>
): Promise<void> {
  const tests = await discoverTestsInPullRequest(ctx);

  ctx.log.info(
    {
      pr: ctx.payload.pull_request.number,
      tests: tests.length,
    },
    "Discovered tests in PR"
  );

  await ensureCommentWithTests(ctx, tests);
}

export async function handleIssueComment(
  ctx: Context<any>
): Promise<void> {
  const raw = (ctx.payload.comment.body || "").trim();
  if (!raw.toLowerCase().startsWith("/record")) return;

  const tests = await discoverTestsInPullRequest(ctx);

  const cmd = parseRecordCommand(raw, tests.length);
  if (!cmd) {
    await ctx.octokit.issues.createComment(
      ctx.issue({
        body:
          "No valid indices. Use `/record 1,2,5`, `/record 1-3,7` or `/record all`.",
      })
    );
    return;
  }

  const epicKey = extractEpicKeyFromBody(ctx.payload.issue.body);
  if (!epicKey) {
    await ctx.octokit.issues.createComment(
      ctx.issue({
        body:
          "No Epic key found. Please add a line like `Epic: TAGS-1234` to the PR description.",
      })
    );
    return;
  }

  const indices =
    cmd.kind === "all" ? tests.map((_, i) => i) : cmd.indices;

  const selected = indices.map((i) => tests[i]);
  const created = await createTestCasesMock({ epicKey, tests: selected });

  const lines = created.map((c, i) => {
    const suite = c.test.describePath.join(" › ");
    const fullTitle = suite
      ? `${suite} › ${c.test.title}`
      : c.test.title;
    return `${i + 1}. ${fullTitle}
    └─ \`${c.test.filePath}:${c.test.line}\` → **${c.caseId}**`;
  });

  const body = [
    `Mock-created ${created.length} test case(s) under epic **${epicKey}**:`,
    "",
    ...lines,
  ].join("\n");

  await ctx.octokit.issues.createComment(ctx.issue({ body }));

  ctx.log.info(
    {
      epicKey,
      created: created.map((c) => ({
        caseId: c.caseId,
        file: c.test.filePath,
        line: c.test.line,
      })),
    },
    "Handled /record command (mock)"
  );
}
