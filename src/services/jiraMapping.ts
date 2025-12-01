import { TestLayer } from "../domain/types";

// customfield_14418: Test Pyramid
//   "System E2E" | "E2E Test (UI)" | "Integration" | "Unit";

export function mapLayerToPyramidValue(layer: TestLayer): string {
  switch (layer) {
    case "unit":
      return "Unit";
    case "integration":
      return "Integration";
    case "e2e":
      return "E2E Test (UI)"; // можно поменять на "System E2E", если будет нужно
    case "unknown":
    default:
      return "E2E Test (UI)";
  }
}

// customfield_14420: Test Type
// value: "Smoke" | "Regression" | "Sanity";
export function mapTagsToTestType(tags?: string[]): string {
  if (!tags || !tags.length) return "Regression";

  const lower = tags.map((t) => t.toLowerCase());
  if (lower.includes("smoke")) return "Smoke";
  if (lower.includes("sanity")) return "Sanity";
  return "Regression";
}