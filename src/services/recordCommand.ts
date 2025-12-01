// src/services/recordCommand.ts

export type RecordCommand =
  | { kind: "all" }
  | { kind: "indices"; indices: number[] }; // 0-based indixes in the discovered tests list

export function parseRecordCommand(
  body: string,
  maxIndex: number
): RecordCommand | null {
  const m = body.trim().match(/^\/record(?:\s+(.*))?$/i);
  if (!m) return null;

  const arg = (m[1] || "").trim();
  if (!arg || arg.toLowerCase() === "all") {
    return { kind: "all" };
  }

  const parts = arg.split(/[ ,]+/).filter(Boolean);
  const set = new Set<number>();

  for (const part of parts) {
    // single number: "3"
    if (/^\d+$/.test(part)) {
      const idx = parseInt(part, 10) - 1;
      if (idx >= 0 && idx < maxIndex) set.add(idx);
      continue;
    }

    // range: "2-5"
    const range = part.match(/^(\d+)-(\d+)$/);
    if (range) {
      let start = parseInt(range[1], 10) - 1;
      let end = parseInt(range[2], 10) - 1;
      if (end < start) [start, end] = [end, start];
      for (let i = start; i <= end; i++) {
        if (i >= 0 && i < maxIndex) set.add(i);
      }
    }
  }

  if (!set.size) return null;

  return {
    kind: "indices",
    indices: [...set].sort((a, b) => a - b),
  };
}