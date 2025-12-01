import ts from "typescript";
import { TestCase, TestFile, TestLayer } from "../domain/types";

function detectTestLayer(path: string): TestLayer {
  if (path.includes("unit")) return "unit";
  if (path.includes("integration")) return "integration";
  if (path.includes("e2e") || path.includes("scenario")) return "e2e";
  return "unknown";
}

function detectFramework(path: string): TestFile["framework"] {
  if (path.endsWith(".spec.ts") || path.includes("jest")) return "jest";
  if (path.includes("vitest")) return "vitest";
  if (path.includes("playwright")) return "playwright";
  if (path.includes("wdio")) return "wdio";
  if (path.includes("mocha")) return "mocha";
  return "unknown";
}

const TEST_FN_NAMES = new Set(["it", "test", "fit", "xit"]);
const DESCRIBE_FN_NAMES = new Set(["describe", "fdescribe", "xdescribe"]);

const CASE_SUFFIX_REGEX = /\s+-\s+(TAGS-\d+)\s*$/;

export function parseTestsFromSource(
  source: string,
  filePath: string
): TestFile {
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

  const testLayer = detectTestLayer(filePath);
  const framework = detectFramework(filePath);

  const cases: TestCase[] = [];
  const describeStack: string[] = [];

  function getRootName(expr: ts.LeftHandSideExpression): string | null {
    if (ts.isIdentifier(expr)) return expr.text;
    if (ts.isPropertyAccessExpression(expr)) {
      return getRootName(expr.expression as ts.LeftHandSideExpression);
    }
    return null;
  }

  function getTitleValue(arg: ts.Expression): string | null {
    if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
      return arg.text;
    }
    return null;
  }

  function stripCaseSuffix(title: string): string {
    return title.replace(CASE_SUFFIX_REGEX, "").trim();
  }

  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node)) {
      const name = getRootName(node.expression as ts.LeftHandSideExpression);

      // describe()
      if (name && DESCRIBE_FN_NAMES.has(name)) {
        const titleArg = node.arguments[0];
        const cb = node.arguments[1];

        const suiteName = titleArg ? getTitleValue(titleArg) || "<unknown>" : "<unknown>";
        describeStack.push(suiteName);

        if (cb && (ts.isFunctionExpression(cb) || ts.isArrowFunction(cb)) && cb.body) {
          if (ts.isBlock(cb.body)) {
            cb.body.statements.forEach(st => visit(st));
          } else {
            visit(cb.body);
          }
        }

        describeStack.pop();
        return;
      }

      // it() / test()
      if (name && TEST_FN_NAMES.has(name)) {
        const titleArg = node.arguments[0];
        if (titleArg) {
          const raw = getTitleValue(titleArg);
          if (raw) {
            const clean = stripCaseSuffix(raw);
            const suite = describeStack.join(" › ");

            cases.push({
              suite,
              title: clean,
              description: undefined,
              tags: []
            });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);

  return {
    path: filePath,
    framework,
    testLayer,
    cases
  };
}
