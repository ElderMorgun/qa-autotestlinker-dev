import { TestCase, TestFile, TestReport } from "../domain/types";
import { mapLayerToPyramidValue, mapTagsToTestType } from "./jiraMapping";

export interface JiraIssueFields {
  parent: {
    id?: string;
    key: string;
  };
  reporter: {
    accountId: string;
  };
  issuetype: {
    name: "Test Case";
  };
  status: {
    name: "Verified";
  };
  project: {
    id: string;
    key: string;
    name: string;
  };
  summary: string;
  description: string;
  customfield_10009: string; // Parent
  customfield_14420: {
    // Test Type
    value: "Smoke" | "Regression" | "Sanity";
  };
  customfield_14418: {
    // Test Pyramid
    value: "System E2E" | "E2E Test (UI)" | "Integration" | "Unit";
  };
  customfield_11260: {
    // Product Component
    value: string;
    id: string;
  };
  customfield_11670: {
    // Technical Component
    value: string;
    id: string;
    child: {
      value: string;
      id: string;
    };
  };
  customfield_11512: {
    // Unit
    value: string;
    id: string;
  };
  customfield_14422: {
    // Project Type (tricentis)
    value: string;
    id: string;
  };
  customfield_11529: {
    // Tech stack
    value: string;
    id: string;
  };
  customfield_14419: {
    // Automation Status
    value: string;
    id: string;
  };
  customfield_14421: {
    // Automated By
    accountId: string;
  };
}

export interface JiraCreatePayload {
  fields: JiraIssueFields;
}

export interface JiraCreateContext {
  report: TestReport;
  file: TestFile;
  testCase: TestCase;
  parent: {
    id?: string;   // Jira epic id (optional; если есть)
    key: string;   // Jira epic key, например TAGS-8706
  };
  reporterAccountId: string;   // кто владелец тест кейса
  automationAccountId: string; // кто автоматизировал
}

export function buildJiraPayloadForTestCase(
  ctx: JiraCreateContext
): JiraCreatePayload {
  const layer = ctx.file.testLayer;
  const pyramidValue = mapLayerToPyramidValue(layer);
  const testTypeValue = mapTagsToTestType(ctx.testCase.tags);

  const summary = ctx.testCase.title;

  const descriptionParts: string[] = [];

  if (ctx.testCase.description) {
    descriptionParts.push(ctx.testCase.description.trim());
  }

  descriptionParts.push(
    "",
    "*Automation link:*",
    `- PR: #${ctx.report.prNumber}`,
    `- Commit: ${ctx.report.commitSha}`,
    `- File: ${ctx.file.path}`,
    ctx.testCase.suite
      ? `- Suite: ${ctx.testCase.suite}`
      : `- Suite: <root>`
  );

  const description = descriptionParts.join("\n");

  const fields: JiraIssueFields = {
    parent: {
      id: ctx.parent.id,
      key: ctx.parent.key,
    },
    reporter: {
      accountId: ctx.reporterAccountId,
    },
    issuetype: {
      name: "Test Case",
    },
    status: {
      name: "Verified",
    },
    project: {
      id: "11100",
      key: "TAGS",
      name: "Tag",
    },
    summary,
    description,
    customfield_10009: ctx.parent.key, // Parent (epic key как строка)
    customfield_14420: {
      // Test Type
      value: testTypeValue as JiraIssueFields["customfield_14420"]["value"],
    },
    customfield_14418: {
      // Test Pyramid
      value: pyramidValue as JiraIssueFields["customfield_14418"]["value"],
    },
    customfield_11260: {
      // Product Component
      value: "Tag",
      id: "24732",
    },
    customfield_11670: {
      // Technical Component
      value: "CSQ",
      id: "24571",
      child: {
        value: "tracking-tag",
        id: "40169",
      },
    },
    customfield_11512: {
      // Unit
      value: "Tag Core",
      id: "27958",
    },
    customfield_14422: {
      // Project Type (tricentis)
      value: "Web",
      id: "36836",
    },
    customfield_11529: {
      // Tech stack
      value: "TAG",
      id: "36973",
    },
    customfield_14419: {
      // Automation Status
      value: "Automated",
      id: "36518",
    },
    customfield_14421: {
      // Automated By
      accountId: ctx.automationAccountId,
    },
  };

  return { fields };
}
