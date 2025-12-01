// src/services/tricentis.ts
import type { DetectedTest } from "../domain/tests";

export interface CreatedCase {
  test: DetectedTest;
  caseId: string;    // "TAGS-1234"
  epicKey: string;
}

export async function createTestCasesMock(args: {
  epicKey: string;
  tests: DetectedTest[];
}): Promise<CreatedCase[]> {
  return args.tests.map((t) => ({
    test: t,
    caseId: simulateId(),
    epicKey: args.epicKey,
  }));
}

function simulateId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `TAGS-${n}`;
}