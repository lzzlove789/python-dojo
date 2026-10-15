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

# 所有运行共用一个 Python 解释器，用户代码可能留下副作用（sys.stdout = None、
# 覆盖 builtins、改 sys.path / 工作目录 / 递归上限、导入的模块……）。
# 每次运行前后把这些恢复到初始快照，避免一次胡写把后面所有运行（和后面的关卡）带崩。
# 注意：快照之前已加载的模块（json、os 等）的属性被改写不在恢复范围内。
import sys as _sys
import os as _os

_snap_builtins = dict(_b.__dict__)
_snap_modules = set(_sys.modules)
_snap_streams = (_sys.stdout, _sys.stderr, _sys.stdin)
_snap_path = list(_sys.path)
_snap_reclimit = _sys.getrecursionlimit()
_snap_cwd = _os.getcwd()

def _reset():
    _sys.stdout, _sys.stderr, _sys.stdin = _snap_streams
    for k in list(_b.__dict__):
        if k not in _snap_builtins:
            del _b.__dict__[k]
    for k, v in _snap_builtins.items():
        if _b.__dict__.get(k) is not v:
            _b.__dict__[k] = v
    for m in list(_sys.modules):
        if m not in _snap_modules:
            del _sys.modules[m]
    _sys.path[:] = _snap_path
    _sys.setrecursionlimit(_snap_reclimit)
    try:
        _os.chdir(_snap_cwd)
    except Exception:
        pass

from pyodide.code import eval_code_async as _eval_async

# 用户代码里的 sys.exit() / raise SystemExit 在 Pyodide 的异步执行里会同时变成一个
# “未处理的 Promise rejection”，所以在 Python 这一侧先接住，再转成普通的错误信息。
async def _run_user(code, ns):
    try:
        await _eval_async(code, ns)
    except SystemExit as e:
        if e.code not in (None, 0):
            raise RuntimeError("程序通过 sys.exit(" + repr(e.code) + ") 提前退出")

def _flush():
    for s in (_sys.stdout, _sys.stderr):
        try:
            s.flush()
        except Exception:
            pass

def _err(e):
    return _json.dumps({"ok": False, "error": type(e).__name__ + ": " + str(e)})

def _probe(expr, ns):
    try:
        v = eval(expr, ns)
    except BaseException as e:
        return _err(e)
    try:
        return _json.dumps({"ok": True, "value": v}, default=repr, allow_nan=False)
    except ValueError:
        # NaN / Infinity 不是合法 JSON，退而求其次用 repr 字符串
        return _json.dumps({"ok": True, "value": repr(v)})
    except BaseException as e:
        return _err(e)
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

  py.globals.get("_reset")();

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
  const runUser = py.globals.get("_run_user");
  try {
    await runUser(req.code, ns);
  } catch (e) {
    error = cleanTraceback(String((e as Error).message ?? e));
  } finally {
    runUser.destroy();
  }

  // end="" 之类没换行的输出还留在缓冲区里
  py.globals.get("_flush")();

  const probes: ProbeResult[] = [];
  const probe = py.globals.get("_probe");
  for (const expr of req.probes ?? []) {
    try {
      probes.push({ expr, ...JSON.parse(probe(expr, ns) as string) });
    } catch (e) {
      probes.push({ expr, ok: false, error: "检查表达式求值失败：" + String((e as Error).message ?? e) });
    }
  }
  probe.destroy();
  ns.destroy();
  py.globals.get("_reset")();

  return {
    stdout: out.text(),
    stderr: err.text(),
    error,
    timedOut: false,
    probes,
    truncated: out.truncated() || err.truncated(),
  };
}
