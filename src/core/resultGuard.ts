import { MAX_OUTPUT_BYTES } from "./limits";
import type { AstInfo, ProbeResult, RunResult } from "./types";

// 用户的 Python 代码跑在 Worker 里，能通过 js 桥直接 postMessage 任意内容给主线程。
// 所以主线程不能信任 Worker 发来的数据：只接受形状完全合法的结果，其余一律丢弃。
// （注意：这防的是“把界面搞崩”，防不了“伪造一个合法的结果”——后者只会让用户自己白白通关，不影响别人。）

const MAX_TEXT = MAX_OUTPUT_BYTES * 4 + 1024; // UTF-8 解码后字符数不会超过字节数，留足余量
const MAX_PROBES = 200;
const MAX_ERROR = 20_000;

const isStr = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max;

function parseProbe(p: unknown): ProbeResult | null {
  if (typeof p !== "object" || p === null) return null;
  const o = p as Record<string, unknown>;
  if (!isStr(o.expr, 2000) || typeof o.ok !== "boolean") return null;
  if (o.error !== undefined && !isStr(o.error, MAX_ERROR)) return null;
  const out: ProbeResult = { expr: o.expr, ok: o.ok };
  if ("value" in o) out.value = o.value;
  if (o.error !== undefined) out.error = o.error as string;
  return out;
}

const MAX_ITEMS = 500;
const isStrArr = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length <= MAX_ITEMS && v.every((x) => isStr(x, 200));
const isObjArr = (v: unknown): v is Array<Record<string, unknown>> =>
  Array.isArray(v) && v.length <= MAX_ITEMS && v.every((x) => typeof x === "object" && x !== null);

/** 校验并重建 AstInfo；任何字段形状不对就整体丢弃（返回 null） */
function parseAst(raw: unknown): AstInfo | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.ok !== "boolean") return null;
  const out: AstInfo = { ok: o.ok };
  if (!o.ok) return out;

  const nodes = o.nodes;
  if (typeof nodes !== "object" || nodes === null || Array.isArray(nodes)) return null;
  const entries = Object.entries(nodes as Record<string, unknown>);
  if (entries.length > MAX_ITEMS) return null;
  out.nodes = {};
  for (const [k, v] of entries) {
    if (k.length > 100 || typeof v !== "number" || !Number.isFinite(v)) return null;
    out.nodes[k] = v;
  }

  if (!isStrArr(o.calls) || !isStrArr(o.imports) || !isStrArr(o.names)) return null;
  out.calls = o.calls;
  out.imports = o.imports;
  out.names = o.names;

  if (!isObjArr(o.keywords) || !isObjArr(o.stars) || !isObjArr(o.decorated) || !isObjArr(o.functions)) return null;
  out.keywords = [];
  for (const k of o.keywords) {
    if (!isStr(k.call, 200) || !isStr(k.arg, 200) || typeof k.const !== "boolean") return null;
    out.keywords.push({ call: k.call, arg: k.arg, const: k.const, value: k.value });
  }
  out.stars = [];
  for (const s of o.stars) {
    if (!isStr(s.callee, 200) || (s.kind !== "*" && s.kind !== "**")) return null;
    out.stars.push({ callee: s.callee, kind: s.kind });
  }
  out.decorated = [];
  for (const d of o.decorated) {
    if (!isStr(d.func, 200) || !isStr(d.decorator, 200)) return null;
    out.decorated.push({ func: d.func, decorator: d.decorator });
  }
  out.functions = [];
  for (const f of o.functions) {
    if (!isStr(f.name, 200) || typeof f.vararg !== "boolean" || typeof f.kwarg !== "boolean") return null;
    out.functions.push({ name: f.name, vararg: f.vararg, kwarg: f.kwarg });
  }
  return out;
}

/** 校验并重建 RunResult；形状不对返回 null（只复制已知字段，丢弃多余的） */
export function parseResult(raw: unknown): RunResult | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (!isStr(o.stdout, MAX_TEXT) || !isStr(o.stderr, MAX_TEXT)) return null;
  if (o.error !== null && !isStr(o.error, MAX_ERROR)) return null;
  if (typeof o.timedOut !== "boolean") return null;
  if (!Array.isArray(o.probes) || o.probes.length > MAX_PROBES) return null;
  if (o.truncated !== undefined && typeof o.truncated !== "boolean") return null;
  if (o.engineFailed !== undefined && typeof o.engineFailed !== "boolean") return null;
  const ast = o.ast === undefined ? undefined : parseAst(o.ast);
  if (ast === null) return null;

  const probes: ProbeResult[] = [];
  for (const p of o.probes) {
    const parsed = parseProbe(p);
    if (!parsed) return null;
    probes.push(parsed);
  }

  const result: RunResult = {
    stdout: o.stdout,
    stderr: o.stderr,
    error: o.error as string | null,
    timedOut: o.timedOut,
    probes,
  };
  if (o.truncated !== undefined) result.truncated = o.truncated;
  if (o.engineFailed !== undefined) result.engineFailed = o.engineFailed;
  if (ast !== undefined) result.ast = ast;
  return result;
}
