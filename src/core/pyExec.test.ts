import { describe, it, expect } from "vitest";
import { getTestRunner } from "./testRunner";
import { MAX_CODE_CHARS, MAX_OUTPUT_BYTES, MAX_STDIN_CHARS } from "./limits";

describe("pyExec", () => {
  it("捕获 stdout", async () => {
    const r = await (await getTestRunner()).run({ code: 'print("hi")\nprint(1 + 1)' });
    expect(r.stdout).toBe("hi\n2\n");
    expect(r.error).toBeNull();
  });

  it("print(end='') 不会多出换行", async () => {
    const r = await (await getTestRunner()).run({ code: 'print("a", end="")' });
    expect(r.stdout).toBe("a");
  });

  it("异常信息去掉 Pyodide 内部栈帧", async () => {
    const r = await (await getTestRunner()).run({ code: "x = 1\n1 / 0" });
    expect(r.error).toContain("ZeroDivisionError");
    expect(r.error).not.toContain("_pyodide");
    expect(r.error).not.toMatch(/^\s*\^+\s*$/m);
  });

  it("语法错误也能返回", async () => {
    const r = await (await getTestRunner()).run({ code: "print(" });
    expect(r.error).toContain("SyntaxError");
  });

  it("input() 读取 stdin", async () => {
    const r = await (await getTestRunner()).run({
      code: 'name = input("n? ")\nprint("hello", name)',
      stdin: "Tom",
    });
    expect(r.stdout).toContain("hello Tom");
  });

  it("每次运行命名空间相互隔离", async () => {
    const runner = await getTestRunner();
    await runner.run({ code: "leak = 42" });
    const r = await runner.run({ code: "print('leak' in globals())" });
    expect(r.stdout.trim()).toBe("False");
  });

  it("probes 能求值变量与函数调用，出错的标记 ok=false", async () => {
    const r = await (await getTestRunner()).run({
      code: "def f(n):\n    return [n, n * 2]\nx = (1, 2)",
      probes: ["f(3)", "x", "missing"],
    });
    expect(r.probes[0]).toMatchObject({ ok: true, value: [3, 6] });
    expect(r.probes[1]).toMatchObject({ ok: true, value: [1, 2] });
    expect(r.probes[2].ok).toBe(false);
  });
});

describe("安全与资源限制", () => {
  it("用户代码不能 import js / pyodide_js（含 from ... import 与函数内导入）", async () => {
    const runner = await getTestRunner();
    for (const code of [
      "import js",
      "from js import fetch",
      "import pyodide_js",
      "def f():\n    import js\nf()",
    ]) {
      const r = await runner.run({ code });
      expect(r.error, code).toContain("ImportError");
      expect(r.error, code).toContain("不允许导入");
    }
  });

  it("屏蔽不影响正常的标准库导入，也不影响 probes", async () => {
    const r = await (await getTestRunner()).run({
      code: "import json, math\nx = json.dumps([math.pi > 3])",
      probes: ["x", '__import__("unittest") is not None'],
    });
    expect(r.error).toBeNull();
    expect(r.probes[0]).toMatchObject({ ok: true, value: "[true]" });
    expect(r.probes[1]).toMatchObject({ ok: true, value: true });
  });

  it("输出超过上限时被截断并标记 truncated", async () => {
    const r = await (await getTestRunner()).run({ code: 'print("x" * 250000)' });
    expect(r.stdout.length).toBe(MAX_OUTPUT_BYTES);
    expect(r.truncated).toBe(true);
  });

  it("正常输出不会被标记截断", async () => {
    const r = await (await getTestRunner()).run({ code: 'print("ok")' });
    expect(r.truncated).toBe(false);
  });

  it("超长代码被拒绝，不会执行", async () => {
    const r = await (await getTestRunner()).run({ code: "x = 1\n" + "#".repeat(MAX_CODE_CHARS) });
    expect(r.error).toContain("代码太长");
    expect(r.stdout).toBe("");
  });

  it("超长 stdin 被拒绝", async () => {
    const r = await (await getTestRunner()).run({ code: "pass", stdin: "a".repeat(MAX_STDIN_CHARS + 1) });
    expect(r.error).toContain("输入内容太长");
  });
});
