import { describe, it, expect } from "vitest";
import { parseResult } from "./resultGuard";

const base = { stdout: "", stderr: "", error: null, timedOut: false, probes: [] };
const fullAst = {
  ok: true,
  nodes: { For: 1, Elif: 2 },
  calls: ["print", "super().__init__"],
  imports: ["math"],
  names: ["x"],
  keywords: [{ call: "dumps", arg: "ensure_ascii", const: true, value: false }],
  stars: [{ callee: "f", kind: "*" }],
  decorated: [{ func: "add", decorator: "logged" }],
  functions: [{ name: "w", vararg: true, kwarg: true }],
};

describe("parseResult 的 ast 校验", () => {
  it("合法的 ast 原样保留，并丢弃多余字段", () => {
    const r = parseResult({ ...base, ast: { ...fullAst, evil: "<script>" } });
    expect(r?.ast).toEqual(fullAst);
  });

  it("语法错误的 ast（只有 ok:false）合法", () => {
    expect(parseResult({ ...base, ast: { ok: false } })?.ast).toEqual({ ok: false });
  });

  it("没有 ast 字段合法（旧结果 / 非检查场景）", () => {
    expect(parseResult(base)?.ast).toBeUndefined();
  });

  it("形状不对的 ast 一律让整个结果作废", () => {
    const bad: unknown[] = [
      "x",
      null,
      { ok: "yes" },
      { ...fullAst, nodes: [] },
      { ...fullAst, nodes: { For: "1" } },
      { ...fullAst, nodes: { For: Infinity } },
      { ...fullAst, calls: [1] },
      { ...fullAst, calls: new Array(501).fill("x") },
      { ...fullAst, imports: "math" },
      { ...fullAst, keywords: [{ call: "a", arg: "b", const: "yes" }] },
      { ...fullAst, stars: [{ callee: "f", kind: "***" }] },
      { ...fullAst, decorated: [{ func: 1, decorator: "x" }] },
      { ...fullAst, functions: [{ name: "w", vararg: 1, kwarg: true }] },
      { ...fullAst, calls: ["x".repeat(500)] },
    ];
    for (const ast of bad) {
      expect(parseResult({ ...base, ast }), JSON.stringify(ast)?.slice(0, 70)).toBeNull();
    }
  });
});
