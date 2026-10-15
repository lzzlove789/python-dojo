import { describe, it, expect } from "vitest";
import { checkRules, collectProbes, allPassed, deepEqual } from "./checker";
import type { CheckRule, RunResult } from "./types";

const run = (p: Partial<RunResult> = {}): RunResult => ({
  stdout: "",
  stderr: "",
  error: null,
  timedOut: false,
  probes: [],
  ...p,
});

describe("checker", () => {
  it("未运行时全部未通过", () => {
    const rules: CheckRule[] = [{ type: "noError", label: "a" }];
    expect(allPassed(checkRules("", null, rules))).toBe(false);
  });

  it("noError：有异常或超时都不通过", () => {
    const rules: CheckRule[] = [{ type: "noError", label: "a" }];
    expect(allPassed(checkRules("", run(), rules))).toBe(true);
    expect(allPassed(checkRules("", run({ error: "boom" }), rules))).toBe(false);
    expect(allPassed(checkRules("", run({ timedOut: true }), rules))).toBe(false);
  });

  it("stdoutEquals 忽略首尾空白，stdoutMatches 走正则", () => {
    const eq: CheckRule[] = [{ type: "stdoutEquals", expected: "hi", label: "a" }];
    expect(allPassed(checkRules("", run({ stdout: "hi\n" }), eq))).toBe(true);
    expect(allPassed(checkRules("", run({ stdout: "hi!" }), eq))).toBe(false);
    const re: CheckRule[] = [{ type: "stdoutMatches", pattern: "^\\d+$", label: "a" }];
    expect(allPassed(checkRules("", run({ stdout: "12\n" }), re))).toBe(true);
  });

  it("codeMatches / codeForbids；非法正则一律判未通过", () => {
    const m: CheckRule[] = [{ type: "codeMatches", pattern: "for .* in", label: "a" }];
    expect(allPassed(checkRules("for x in y:", run(), m))).toBe(true);
    const f: CheckRule[] = [{ type: "codeForbids", pattern: "eval\\(", label: "a" }];
    expect(allPassed(checkRules("eval(1)", run(), f))).toBe(false);
    expect(allPassed(checkRules("print(1)", run(), f))).toBe(true);
    const bad: CheckRule[] = [{ type: "codeForbids", pattern: "(", label: "a" }];
    expect(allPassed(checkRules("x", run(), bad))).toBe(false);
  });

  it("exprEquals 深度比较 probe 结果", () => {
    const rules: CheckRule[] = [{ type: "exprEquals", expr: "f(2)", equals: [1, { a: 2 }], label: "a" }];
    const ok = run({ probes: [{ expr: "f(2)", ok: true, value: [1, { a: 2 }] }] });
    const bad = run({ probes: [{ expr: "f(2)", ok: true, value: [1, { a: 3 }] }] });
    const err = run({ probes: [{ expr: "f(2)", ok: false, error: "NameError" }] });
    expect(allPassed(checkRules("", ok, rules))).toBe(true);
    expect(allPassed(checkRules("", bad, rules))).toBe(false);
    expect(allPassed(checkRules("", err, rules))).toBe(false);
  });

  it("collectProbes 去重", () => {
    const rules: CheckRule[] = [
      { type: "exprEquals", expr: "x", equals: 1, label: "a" },
      { type: "exprEquals", expr: "x", equals: 1, label: "b" },
      { type: "noError", label: "c" },
    ];
    expect(collectProbes(rules)).toEqual(["x"]);
  });

  it("deepEqual 基本情形", () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual([1], { 0: 1 })).toBe(false);
    expect(deepEqual(1, "1")).toBe(false);
  });
});

describe("没通过时的线索 detail", () => {
  it("stdoutEquals 失败：给出期望和实际", () => {
    const rules: CheckRule[] = [{ type: "stdoutEquals", expected: "a b", label: "x" }];
    const [r] = checkRules("", run({ stdout: "a  b\n" }), rules);
    expect(r.detail).toEqual({ expected: "a b", actual: "a  b" });
  });

  it("stdoutMatches 带 example：挑出最像的一行做对比", () => {
    const rules: CheckRule[] = [
      { type: "stdoutMatches", pattern: "^Hello, Python!$", label: "x", example: "Hello, Python!" },
    ];
    const [r] = checkRules("", run({ stdout: "你好\n7\nHello,Python!\n" }), rules);
    expect(r.detail).toEqual({ expected: "Hello, Python!", actual: "Hello,Python!" });
  });

  it("没有输出时提示没有输出", () => {
    const rules: CheckRule[] = [{ type: "stdoutEquals", expected: "a", label: "x" }];
    const [r] = checkRules("", run(), rules);
    expect(r.detail?.actual).toBe("（没有输出）");
  });

  it("exprEquals 失败：只给实际值或报错，不泄露期望值", () => {
    const rules: CheckRule[] = [{ type: "exprEquals", expr: "x", equals: 99, label: "x" }];
    const wrong = checkRules("", run({ probes: [{ expr: "x", ok: true, value: 1 }] }), rules)[0];
    expect(wrong.detail).toEqual({ actual: "实际得到 1" });
    const err = checkRules("", run({ probes: [{ expr: "x", ok: false, error: "NameError: name 'x' is not defined" }] }), rules)[0];
    expect(err.detail?.expected).toBeUndefined();
    expect(err.detail?.actual).toContain("NameError");
  });

  it("noError 失败：给出报错的最后一行", () => {
    const rules: CheckRule[] = [{ type: "noError", label: "x" }];
    const [r] = checkRules("", run({ error: "Traceback...\nZeroDivisionError: division by zero" }), rules);
    expect(r.detail?.actual).toBe("ZeroDivisionError: division by zero");
  });

  it("通过的、还没运行过的都没有 detail", () => {
    const rules: CheckRule[] = [{ type: "noError", label: "x" }];
    expect(checkRules("", run(), rules)[0].detail).toBeUndefined();
    expect(checkRules("", null, rules)[0].detail).toBeUndefined();
  });
});
