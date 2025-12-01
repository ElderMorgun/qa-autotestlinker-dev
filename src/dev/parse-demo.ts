import { readFileSync } from "fs";
import { parseTestsFromSource } from "../services/testParser";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npx ts-node src/dev/parse-demo.ts <path-to-spec.ts>");
  process.exit(1);
}

const src = readFileSync(filePath, "utf8");
const tests = parseTestsFromSource(src, filePath);

console.log(JSON.stringify(tests, null, 2));
