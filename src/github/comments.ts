import type { Context } from "probot";
import type { DetectedTest } from "../domain/tests";

const MARKER = "<!-- qa-autotestlinker:tests -->";

export async function ensureCommentWithTests(
  ctx: Context<any>,
  tests: DetectedTest[]
): Promise<void> {
  const header = "**Detected tests in this PR**";

  const lines = tests.length
    ? tests.map((t, i) => {
        const suitePath = t.describePath.join(" › ");
        const prefix = suitePath ? `${suitePath} › ${t.title}` : t.title;
        return `${i + 1}. ${prefix}\n    └─ \`${t.filePath}:${t.line}\`${t.caseId ? ` (already linked: ${t.caseId})` : ""}`;
      })
    : ["_No tests detected in changed files._"];

  const body =
    [
      MARKER,
      header,
      "",
      ...lines,
      "",
      "Use `/record 1,3,5` or `/record all` to create / link cases."
    ].join("\n");

  const { data: comments } = await ctx.octokit.issues.listComments(
    ctx.issue({ per_page: 100 })
  );

  const existing = comments.find((c) => (c.body || "").includes(MARKER));

  if (existing) {
    await ctx.octokit.issues.updateComment({
      ...ctx.issue(),
      comment_id: existing.id,
      body,
    });
  } else {
    await ctx.octokit.issues.createComment(ctx.issue({ body }));
  }
}
