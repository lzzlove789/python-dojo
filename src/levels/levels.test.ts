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
