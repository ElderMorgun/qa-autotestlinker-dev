// src/github/epic.ts

export function extractEpicKeyFromBody(
  body: string | null | undefined
): string | null {
  // Look for a string like "Epic: TAGS-8706"
  const m = /Epic\s*:\s*([A-Z]+-\d+)/i.exec(body || "");
  return m ? m[1].toUpperCase() : null;
}