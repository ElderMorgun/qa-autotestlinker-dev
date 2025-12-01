import { TestFile, TestLayer, TestReport } from "../domain/types";

function emptySummary() {
  return {
    unit: 0,
    integration: 0,
    e2e: 0,
    unknown: 0,
    totalCases: 0,
  };
}

function inc(layer: TestLayer, summary: TestReport["summary"]) {
  switch (layer) {
    case "unit":
      summary.unit++;
      break;
    case "integration":
      summary.integration++;
      break;
    case "e2e":
      summary.e2e++;
      break;
    default:
      summary.unknown++;
  }
  summary.totalCases++;
}

/**
 * Build TestReport based on selected (files may already be filtered
 * by /record – i.e. only the cases the user selected).
 */
export function buildTestReport(args: {
  prNumber: number;
  epicId: string;
  commitSha: string;
  files: TestFile[];
}): TestReport {
  const summary = emptySummary();

  for (const file of args.files) {
    for (const _case of file.cases) {
      inc(file.testLayer, summary);
    }
  }

  return {
    prNumber: args.prNumber,
    epicId: args.epicId,
    commitSha: args.commitSha,
    summary,
    files: args.files,
  };
}
