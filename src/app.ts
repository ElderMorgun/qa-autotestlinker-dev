import { Probot } from "probot";
import { handlePullRequest, handleIssueComment } from "./github/handlers";

export default (app: Probot) => {
  app.log.info("qa-autotestlinker loaded");

  app.on(["pull_request.opened", "pull_request.synchronize"], handlePullRequest);
  app.on("issue_comment.created", handleIssueComment);
};

// локальный запуск: npm run dev
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { run } = require("probot");
  run(require("./app").default);
}