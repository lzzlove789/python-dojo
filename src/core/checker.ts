import type { AstInfo, CheckRule, RunResult } from "./types";

/** 没通过时给用户看的线索：期望值（可选）和实际得到的内容 */
export interface CheckDetail {
  expected?: string;
  actual: string;
}

export interface CheckResult {
  rule: CheckRule;
  passed: boolean;
  detail?: CheckDetail;
}

/** 把规则里需要在 Python 命名空间求值的表达式收集出来，随代码一起交给 Runner */
export function collectProbes(rules: CheckRule[]): string[] {
  return [...new Set(rules.flatMap((r) => (r.type === "exprEquals" ? [r.expr] : [])))];
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
  );
}

function safeRegex(pattern: string, flags = ""): RegExp | null {
  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

const MAX_DETAIL = 200;

function clip(s: string): string {
  return s.length > MAX_DETAIL ? s.slice(0, MAX_DETAIL) + "…" : s;
}

/** 两个字符串共同前缀 + 共同后缀的长度，用来衡量“有多像” */
function similarity(a: string, b: string): number {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return p + s;
}

/** 从实际输出里挑出和期望最像的一行，没有一行沾边就返回整个输出 */
function closestLine(output: string, expected: string): string {
  const lines = output.split("\n").filter((l) => l.trim() !== "");
  let best = "";
  let bestScore = 0;
  for (const l of lines) {
    const score = similarity(l, expected);
    if (score > bestScore) {
      best = l;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : output.trim();
}

function show(output: string): string {
  return output.trim() === "" ? "（没有输出）" : clip(output.trim());
}

/** run 为 null 表示还没运行过，全部判未通过且没有线索 */
export function checkRules(run: RunResult | null, rules: CheckRule[]): CheckResult[] {
  return rules.map((rule) => {
    if (run === null) return { rule, passed: false };
    const { passed, detail } = evaluateRule(run, rule);
    return passed ? { rule, passed } : { rule, passed, detail };
  });
}

export function allPassed(results: CheckResult[]): boolean {
  return results.length > 0 && results.every((r) => r.passed);
}

// ---- 基于 AST 的结构检查 ----
// 语法有错（ok: false）或没有 AST 信息时，这类规则一律判未通过（noError 规则会同时提示语法错误）

function usesAny(ast: AstInfo, r: { nodes?: string[]; calls?: string[]; imports?: string[] }): boolean {
  const nodes = ast.nodes ?? {};
  return (
    (r.nodes ?? []).some((n) => (nodes[n] ?? 0) > 0) ||
    (r.calls ?? []).some((c) => (ast.calls ?? []).includes(c)) ||
    (r.imports ?? []).some((m) => (ast.imports ?? []).includes(m))
  );
}

function evaluateAstRule(ast: AstInfo | undefined, rule: CheckRule): boolean {
  if (!ast || !ast.ok) return false;
  switch (rule.type) {
    case "uses":
      return usesAny(ast, rule);
    case "forbids":
      return !usesAny(ast, rule);
    case "usesNames":
      return rule.names.every((n) => (ast.names ?? []).includes(n));
    case "hasKeyword":
      return (ast.keywords ?? []).some(
        (k) =>
          k.arg === rule.keyword &&
          (rule.call === undefined || k.call === rule.call) &&
          (!("equals" in rule) || (k.const && deepEqual(k.value, rule.equals)))
      );
    case "usesStar":
      return (ast.stars ?? []).some((s) => s.callee === rule.callee && s.kind === rule.kind);
    case "decoratedWith":
      return (ast.decorated ?? []).some((d) => d.func === rule.func && d.decorator === rule.decorator);
    case "definesFunction":
      return (ast.functions ?? []).some(
        (f) => (!rule.varargs || f.vararg) && (!rule.kwargs || f.kwarg)
      );
    default:
      return false;
  }
}

function evaluateRule(run: RunResult, rule: CheckRule): { passed: boolean; detail?: CheckDetail } {
  switch (rule.type) {
    case "noError": {
      const passed = run.error === null && !run.timedOut;
      if (passed) return { passed };
      const lastLine = (run.error ?? "").trim().split("\n").pop() ?? "";
      return { passed, detail: { actual: clip(lastLine || "运行被终止") } };
    }
    case "stdoutEquals": {
      const passed = run.stdout.trim() === rule.expected.trim();
      return { passed, detail: passed ? undefined : { expected: rule.expected.trim(), actual: show(run.stdout) } };
    }
    case "stdoutMatches": {
      const passed = safeRegex(rule.pattern, "m")?.test(run.stdout) ?? false;
      if (passed) return { passed };
      if (rule.example === undefined) return { passed, detail: { actual: show(run.stdout) } };
      const actual = run.stdout.trim() === "" ? "（没有输出）" : clip(closestLine(run.stdout, rule.example));
      return { passed, detail: { expected: rule.example, actual } };
    }
    case "exprEquals": {
      const p = run.probes.find((x) => x.expr === rule.expr);
      const passed = !!p && p.ok && deepEqual(p.value, rule.equals);
      if (passed) return { passed };
      // 变量/函数类的检查只告诉用户实际得到了什么，不直接泄露期望值
      if (!p) return { passed, detail: { actual: "（代码出错，没能检查到）" } };
      if (!p.ok) return { passed, detail: { actual: clip(p.error ?? "求值失败") } };
      return { passed, detail: { actual: "实际得到 " + clip(JSON.stringify(p.value)) } };
    }
    default:
      return { passed: evaluateAstRule(run.ast, rule) };
  }
}
