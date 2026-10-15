import type { PyodideInterface } from "pyodide";
import { MAX_OUTPUT_BYTES, validateRequest } from "./limits";
import type { ProbeResult, RunRequest, RunResult } from "./types";

// _guarded_import：用户代码（命名空间带 __dojo_user__ 标记）不能 import js / pyodide_js，
// 这两个模块是 Python 通向浏览器 JS 的桥。Pyodide 自己的内部 import 不受影响。
// 注意这只是 CSP（connect-src 'self'）之外的第二道、尽力而为的防线，不是安全边界。
const HELPER = `
import builtins as _b
import json as _json

_BLOCKED = {"js", "pyodide_js"}
_orig_import = _b.__import__

def _guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
    if level == 0 and name.split(".")[0] in _BLOCKED and globals is not None and globals.get("__dojo_user__"):
        raise ImportError("本站出于安全考虑，不允许导入 " + name + " 模块")
    return _orig_import(name, globals, locals, fromlist, level)

_b.__import__ = _guarded_import

def _probe(expr, ns):
    try:
        v = eval(expr, ns)
        return _json.dumps({"ok": True, "value": v}, default=repr)
    except BaseException as e:
        return _json.dumps({"ok": False, "error": type(e).__name__ + ": " + str(e)})
`;

export function setupHelpers(py: PyodideInterface) {
  py.runPython(HELPER);
}

/** 去掉 Pyodide 自己的内部栈帧，只留用户代码相关的 traceback */
export function cleanTraceback(msg: string): string {
  const lines = msg.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/File "\/lib\/python[^"]*", line/.test(lines[i])) {
      if (i + 1 < lines.length && /^\s{4,}/.test(lines[i + 1])) i++;
      continue;
    }
    if (/^\s*[\^~]+\s*$/.test(lines[i])) continue; // 被删掉的栈帧遗留的 ^^^^ 标记
    out.push(lines[i]);
  }
  return out.join("\n").trim();
}

/** 只收集前 MAX_OUTPUT_BYTES 字节，超出的丢弃并标记 truncated */
function makeCollector() {
  const bytes: number[] = [];
  let truncated = false;
  return {
    push(b: number) {
      if (bytes.length >= MAX_OUTPUT_BYTES) truncated = true;
      else bytes.push(b & 0xff);
    },
    text: () => new TextDecoder().decode(new Uint8Array(bytes)),
    truncated: () => truncated,
  };
}

const emptyResult = (error: string): RunResult => ({
  stdout: "",
  stderr: "",
  error,
  timedOut: false,
  probes: [],
});

/** 在全新命名空间里执行一次代码，然后求值 probes。Worker 与 Node 测试共用。 */
export async function execute(py: PyodideInterface, req: RunRequest): Promise<RunResult> {
  const invalid = validateRequest(req);
  if (invalid) return emptyResult(invalid);

  const out = makeCollector();
  const err = makeCollector();
  py.setStdout({ raw: (b: number) => out.push(b) });
  py.setStderr({ raw: (b: number) => err.push(b) });
  const lines = (req.stdin ?? "").split("\n");
  let li = 0;
  py.setStdin({ stdin: () => (li < lines.length ? lines[li++] : undefined) });

  const ns = py.globals.get("dict")();
  ns.set("__dojo_user__", true);
  let error: string | null = null;
  try {
    await py.runPythonAsync(req.code, { globals: ns });
  } catch (e) {
    error = cleanTraceback(String((e as Error).message ?? e));
  }

  // end="" 之类没换行的输出还留在缓冲区里
  py.runPython("import sys; sys.stdout.flush(); sys.stderr.flush()");

  const probes: ProbeResult[] = [];
  const probe = py.globals.get("_probe");
  for (const expr of req.probes ?? []) {
    const raw = probe(expr, ns) as string;
    probes.push({ expr, ...JSON.parse(raw) });
  }
  probe.destroy();
  ns.destroy();

  return {
    stdout: out.text(),
    stderr: err.text(),
    error,
    timedOut: false,
    probes,
    truncated: out.truncated() || err.truncated(),
  };
}
