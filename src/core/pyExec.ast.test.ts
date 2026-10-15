import { describe, it, expect } from "vitest";
import { getTestRunner } from "./testRunner";
import { checkRules } from "./checker";
import type { CheckRule } from "./types";

async function astOf(code: string) {
  const r = await (await getTestRunner()).run({ code });
  return r.ast!;
}

describe("AST 分析（真实 Python ast）", () => {
  it("统计语法节点，包括派生的 Elif / BareExcept", async () => {
    const a = await astOf(
      [
        "for i in range(3):",
        "    pass",
        "while False:",
        "    pass",
        "x = [n for n in range(3)]",
        "if 1:",
        "    pass",
        "elif 2:",
        "    pass",
        "else:",
        "    pass",
        "try:",
        "    pass",
        "except:",
        "    pass",
        "f = f'{x}'",
        "y = 7 // 2 + 7 % 2 + 2 ** 3 + (1 & 3)",
      ].join("\n")
    );
    expect(a.ok).toBe(true);
    const n = a.nodes!;
    expect(n.For).toBe(1);
    expect(n.While).toBe(1);
    expect(n.ListComp).toBe(1);
    expect(n.Elif).toBe(1);
    expect(n.BareExcept).toBe(1);
    expect(n.Try).toBe(1);
    expect(n.JoinedStr).toBe(1);
    for (const op of ["FloorDiv", "Mod", "Pow", "BitAnd"]) expect(n[op], op).toBe(1);
  });

  it("关键字只出现在注释和字符串里，不算用了（正则做不到的）", async () => {
    const a = await astOf(
      ['# for while elif yield nonlocal global try import math', 's = "for x in y: sum(1) append("', "print(s)"].join("\n")
    );
    expect(a.ok).toBe(true);
    const n = a.nodes!;
    for (const k of ["For", "While", "Elif", "Yield", "Nonlocal", "Global", "Try"]) expect(n[k], k).toBeUndefined();
    expect(a.calls).toEqual(["print"]);
    expect(a.imports).toEqual([]);
  });

  it("调用：取最后一段名字，super().x 单独标记", async () => {
    const a = await astOf(
      [
        "import re, os.path",
        "from collections import Counter",
        "re.sub('a', 'b', 'c')",
        "x = []; x.append(1)",
        "Counter('a')",
        "class A:",
        "    def __init__(self):",
        "        super().__init__()",
      ].join("\n")
    );
    expect(a.calls).toEqual(expect.arrayContaining(["sub", "append", "Counter", "super().__init__", "super"]));
    expect(a.imports).toEqual(["collections", "os", "re"]);
  });

  it("关键字参数：区分字面量与表达式", async () => {
    const a = await astOf("import json\njson.dumps({}, ensure_ascii=False, sort_keys=True, default=str)\nsorted([], key=len, reverse=True)");
    const get = (call: string, arg: string) => a.keywords!.find((k) => k.call === call && k.arg === arg)!;
    expect(get("dumps", "ensure_ascii")).toMatchObject({ const: true, value: false });
    expect(get("dumps", "sort_keys")).toMatchObject({ const: true, value: true });
    expect(get("dumps", "default")).toMatchObject({ const: false });
    expect(get("sorted", "reverse")).toMatchObject({ const: true, value: true });
    expect(get("sorted", "key").const).toBe(false);
  });

  it("星号展开、装饰器、*args/**kwargs 函数、被读取的变量名", async () => {
    const a = await astOf(
      [
        "def deco(f):",
        "    def w(*args, **kwargs):",
        "        return f(*args, **kwargs)",
        "    return w",
        "@deco",
        "def add(a, b):",
        "    return a + b",
        "xs = [1, 2]",
        "opts = {'b': 2}",
        "add(*xs)",
        "add(**opts)",
        "total = xs[0] * 2",
      ].join("\n")
    );
    expect(a.stars).toEqual(expect.arrayContaining([{ callee: "add", kind: "*" }, { callee: "add", kind: "**" }]));
    expect(a.decorated).toEqual([{ func: "add", decorator: "deco" }]);
    expect(a.functions).toEqual(
      expect.arrayContaining([
        { name: "w", vararg: true, kwarg: true },
        { name: "add", vararg: false, kwarg: false },
      ])
    );
    expect(a.names).toEqual(expect.arrayContaining(["xs", "opts", "f", "a", "b"]));
    expect(a.names).not.toContain("total"); // 只统计被读取的，赋值目标不算
  });

  it("语法错误：ok 为 false，不会抛异常", async () => {
    const r = await (await getTestRunner()).run({ code: "def (:" });
    expect(r.ast).toEqual({ ok: false });
    expect(r.error).toContain("SyntaxError");
  });

  it("异步语法（top-level await）也能分析", async () => {
    const a = await astOf("import asyncio\nawait asyncio.sleep(0)");
    expect(a.ok).toBe(true);
    expect(a.calls).toContain("sleep");
  });

  it("分析与运行互不影响：用户把 ast.parse 改掉，下一次分析仍然正确", async () => {
    const runner = await getTestRunner();
    await runner.run({ code: "import ast\nast.parse = lambda *a, **k: None\nast.walk = lambda *a: []\nast.Call = int" });
    const a = (await runner.run({ code: "for i in range(2):\n    print(i)" })).ast!;
    expect(a.ok).toBe(true);
    expect(a.nodes!.For).toBe(1);
    expect(a.calls).toEqual(expect.arrayContaining(["print", "range"]));
  });
});

describe("检查规则对‘技巧性通关’的免疫", () => {
  const forbidsFor: CheckRule = { type: "forbids", nodes: ["For"], label: "不写 for 循环" };
  const usesFor: CheckRule = { type: "uses", nodes: ["For"], label: "用了 for 循环" };

  it("把 for 写在注释/字符串里，既不会让‘用了 for’误通过，也不会让‘不能用 for’误失败", async () => {
    const run = await (await getTestRunner()).run({ code: '# for i in range(3)\ns = "for x in y"\nprint(s)' });
    const [uses, forbids] = checkRules(run, [usesFor, forbidsFor]);
    expect(uses.passed).toBe(false);
    expect(forbids.passed).toBe(true);
  });

  it("真的写了 for 循环才算用了", async () => {
    const run = await (await getTestRunner()).run({ code: "for i in range(3):\n    pass" });
    const [uses, forbids] = checkRules(run, [usesFor, forbidsFor]);
    expect(uses.passed).toBe(true);
    expect(forbids.passed).toBe(false);
  });

  it("语法错误的代码不会因为 forbids 规则“没出现禁止项”而白白通过", async () => {
    const run = await (await getTestRunner()).run({ code: "def (:" });
    expect(checkRules(run, [forbidsFor])[0].passed).toBe(false);
  });
});
