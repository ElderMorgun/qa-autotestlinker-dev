export type TestLayer = "unit" | "integration" | "e2e" | "unknown";

export interface TestCase {
  suite: string;         // Full describe path, joined by " > "
  title: string;         // Text of it()/test() without cases
  description?: string;
  tags?: string[];
}

export interface TestFile {
  path: string;                                   // relative path
  framework: "jest" | "vitest" | "playwright" | "wdio" | "mocha" | "unknown";
  testLayer: TestLayer;
  cases: TestCase[];
}

export interface TestReport {
  prNumber: number;
  epicId: string;
  commitSha: string;

  summary: {
    unit: number;
    integration: number;
    e2e: number;
    unknown: number;
    totalCases: number;
  };

  files: TestFile[];
}
