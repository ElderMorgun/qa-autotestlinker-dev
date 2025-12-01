import type { Context } from "probot";
import type { TestFile, TestCase } from "../domain/types";

const MARKER = "<!-- qa-autotestlinker:tests -->";

interface FlattenedCase {
  index: number;      // 1-based
  file: TestFile;
  testCase: TestCase;
}

function flatten(files: TestFile[]): FlattenedCase[] {
  const out: FlattenedCase[] = [];
  let idx = 1;

  for (const file of files) {
    for (const c of file.cases) {
      out.push({ index: idx++, file, testCase: c });
    }
  }

  return out;
}

export async function ensureCommentWithTests(
  ctx: Context<any>,
  files: TestFile[]
): Promise<void> {
  const flat = flatten(files);

  const header = "**Detected tests in this PR**";

  const lines = flat.length
    ? flat.map((item) => {
        const { index, file, testCase } = item;
        const suite = testCase.suite ? `${testCase.suite} › ` : "";
        return `${index}. ${suite}${testCase.title}\n    └─ \`${file.path}\``;
      })
    : ["_No tests detected in changed files._"];

  const body =
    [
      MARKER,
      header,
      "",
      ...lines,
      "",
      "Use `/record 1,3,5` or `/record all` to create/link cases (not implemented in dev mode).",
    ].join("\n");

  // ⚠️ Probot v14: только через ctx.octokit.rest.issues
  const { data: comments } = await ctx.octokit.rest.issues.listComments({
    ...ctx.issue(),
    per_page: 100,
  });

  const existing = comments.find((c) => (c.body || "").includes(MARKER));

  if (existing) {
    await ctx.octokit.rest.issues.updateComment({
      ...ctx.issue(),
      comment_id: existing.id,
      body,
    });
  } else {
    await ctx.octokit.rest.issues.createComment({
      ...ctx.issue(),
      body,
    });
  }
}
