import { describe, it, expect } from "vitest";
import { mainLevels } from "./mainLevels";
import { getTestRunner } from "../core/testRunner";
import { checkRules, collectProbes } from "../core/checker";

async function runLevel(code: string, level: (typeof mainLevels)[number]) {
  const runner = await getTestRunner();
  const run = await runner.run({ code, stdin: level.stdin, probes: collectProbes(level.checks) });
  return checkRules(code, run, level.checks);
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

// 用户提交的代码会被各关的 codeMatches / codeForbids 正则扫描，而 JS 正则是回溯引擎，
// 写得不好的模式遇到畸形输入会卡死整个标签页（曾经第 13 关就有立方级回溯）。
// 这里用一批对回溯最不友好的输入做回归：先用小输入探测，确认没有指数/立方级再放大到上限长度。
describe("关卡正则的性能（防 ReDoS）", () => {
  const rules = mainLevels.flatMap((l) =>
    l.checks.flatMap((c) =>
      c.type === "codeMatches" || c.type === "codeForbids" ? [{ level: l.key, label: c.label, pattern: c.pattern }] : []
    )
  );

  const adversarial: Array<[string, (n: number) => string]> = [
    ["重复的 [ for in", (n) => "[ for in ".repeat(n / 9)],
    ["重复的 [for", (n) => "[for ".repeat(n / 5)],
    ["一个 [ 加长串 for in", (n) => "[" + " for in".repeat(n / 7)],
    ["超长空白", (n) => " ".repeat(n)],
    ["超长换行", (n) => "\n".repeat(n)],
    ["@logged 后跟大量空白", (n) => "@logged" + " \n".repeat(n / 2)],
    ["关键字后跟大量空白", (n) => "except" + " ".repeat(n) + "price" + " ".repeat(n) + "key" + " ".repeat(n)],
    ["重复的 print(", (n) => "print(".repeat(n / 6)],
    ["重复的 for for", (n) => "for for ".repeat(n / 8)],
    ["重复的 import from", (n) => "from import ".repeat(n / 12)],
  ];

  const time = (re: RegExp, s: string) => {
    const t0 = performance.now();
    re.test(s);
    return performance.now() - t0;
  };

  it("至少收集到了一批代码检查正则", () => {
    expect(rules.length).toBeGreaterThan(30);
  });

  for (const { level, label, pattern } of rules) {
    it(`${level}「${label}」对畸形输入不会卡死`, () => {
      const re = new RegExp(pattern, "m");
      for (const [name, make] of adversarial) {
        expect(time(re, make(3000)), `${name} @3KB`).toBeLessThan(100);
      }
      for (const [name, make] of adversarial) {
        expect(time(re, make(50_000)), `${name} @50KB`).toBeLessThan(500);
      }
    });
  }
});
