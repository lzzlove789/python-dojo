// 仅供 Vitest 使用：在 Node 里直接加载 npm 版 Pyodide，复用与浏览器 Worker 相同的 execute()
import { loadPyodide } from "pyodide";
import { execute, setupHelpers } from "./pyExec";
import type { RunRequest, RunResult, Runner } from "./types";

let pending: Promise<Runner> | null = null;

export function getTestRunner(): Promise<Runner> {
  pending ??= loadPyodide().then((py) => {
    setupHelpers(py);
    return { run: (req: RunRequest): Promise<RunResult> => execute(py, req) };
  });
  return pending;
}
