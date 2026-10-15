import { describe, it, expect } from "vitest";
import { mainLevels } from "./mainLevels";
import { getTestRunner } from "../core/testRunner";
import { checkRules, collectProbes } from "../core/checker";

async function runLevel(code: string, level: (typeof mainLevels)[number]) {
  const runner = await getTestRunner();
  const run = await runner.run({ code, stdin: level.stdin, probes: collectProbes(level.checks) });
  return checkRules(run, level.checks);
}

describe("关卡数据", () => {
  it("key 唯一，且与顺序一致 level1..N", () => {
    expect(mainLevels.map((l) => l.key)).toEqual(mainLevels.map((_, i) => `level${i + 1}`));
  });

  for (const level of mainLevels) {
    describe(`${level.key} ${level.title}`, () => {
      it("参考答案能通过全部检查", async () => {
        const results = await runLevel(level.answer, level);
        const failed = results.filter((r) => !r.passed).map((r) => r.rule.label);
        expect(failed).toEqual([]);
      });

      it("初始代码不会直接通关", async () => {
        const results = await runLevel(level.starter, level);
        expect(results.every((r) => r.passed)).toBe(false);
      });

      it("示例代码都能无错运行", async () => {
        const runner = await getTestRunner();
        for (const ex of level.examples ?? []) {
          const r = await runner.run({ code: ex.code, stdin: level.stdin });
          expect(r.error, ex.code).toBeNull();
        }
      });
    });
  }
});

// 代码结构检查（uses / forbids …）是基于 AST 的，规则里写的节点名拼错了就会永远判不过（或永远判过）。
// 这里用真实的 `ast` 模块核对：每个节点名必须真的存在（Elif、BareExcept 是我们自己派生的两项）。
describe("AST 规则的写法", () => {
  const DERIVED = ["Elif", "BareExcept"];
  const nodeNames = [
    ...new Set(
      mainLevels.flatMap((l) =>
        l.checks.flatMap((c) => (c.type === "uses" || c.type === "forbids" ? (c.nodes ?? []) : []))
      )
    ),
  ];

  it("uses / forbids 至少列出一项（节点、调用或导入）", () => {
    for (const l of mainLevels) {
      for (const c of l.checks) {
        if (c.type === "uses" || c.type === "forbids") {
          const total = (c.nodes?.length ?? 0) + (c.calls?.length ?? 0) + (c.imports?.length ?? 0);
          expect(total, `${l.key}「${c.label}」`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("规则里的语法节点名都是真实存在的 ast 节点", async () => {
    expect(nodeNames.length).toBeGreaterThan(10);
    const runner = await getTestRunner();
    const r = await runner.run({
      code: "import ast",
      probes: [`[n for n in ${JSON.stringify(nodeNames)} if not hasattr(ast, n) and n not in ${JSON.stringify(DERIVED)}]`],
    });
    expect(r.probes[0]).toMatchObject({ ok: true, value: [] });
  });

  it("每关至少有一条检查是行为测试（exprEquals 或输出），不会只靠语法结构过关", () => {
    for (const l of mainLevels) {
      const behavioural = l.checks.some(
        (c) => c.type === "exprEquals" || c.type === "stdoutEquals" || c.type === "stdoutMatches"
      );
      expect(behavioural, l.key).toBe(true);
    }
  });
});

// stdoutMatches 是对**程序输出**（上限 100KB）做的正则，写得不好同样会被畸形输出卡死。
describe("输出正则的性能（防 ReDoS）", () => {
  const rules = mainLevels.flatMap((l) =>
    l.checks.flatMap((c) => (c.type === "stdoutMatches" ? [{ level: l.key, label: c.label, pattern: c.pattern }] : []))
  );
  const adversarial: Array<[string, (n: number) => string]> = [
    ["超长空白", (n) => " ".repeat(n)],
    ["超长换行", (n) => "\n".repeat(n)],
    ["重复的数字", (n) => "7".repeat(n)],
    ["重复的汉字", (n) => "小明明年".repeat(n / 4)],
    ["重复的 Hello,", (n) => "Hello, Python".repeat(n / 13)],
  ];
  const time = (re: RegExp, s: string) => {
    const t0 = performance.now();
    re.test(s);
    return performance.now() - t0;
  };

  it("至少收集到了输出正则", () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  for (const { level, label, pattern } of rules) {
    it(`${level}「${label}」对畸形输出不会卡死`, () => {
      const re = new RegExp(pattern, "m");
      for (const [name, make] of adversarial) {
        expect(time(re, make(3000)), `${name} @3KB`).toBeLessThan(100);
      }
      for (const [name, make] of adversarial) {
        expect(time(re, make(100_000)), `${name} @100KB`).toBeLessThan(500);
      }
    });
  }
});
