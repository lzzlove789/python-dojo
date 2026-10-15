import { MAX_OUTPUT_BYTES } from "./limits";
import type { ProbeResult, RunResult } from "./types";

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

/** 校验并重建 RunResult；形状不对返回 null（只复制已知字段，丢弃多余的） */
export function parseResult(raw: unknown): RunResult | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  if (!isStr(o.stdout, MAX_TEXT) || !isStr(o.stderr, MAX_TEXT)) return null;
  if (o.error !== null && !isStr(o.error, MAX_ERROR)) return null;
  if (typeof o.timedOut !== "boolean") return null;
  if (!Array.isArray(o.probes) || o.probes.length > MAX_PROBES) return null;
  if (o.truncated !== undefined && typeof o.truncated !== "boolean") return null;

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
  return result;
}
