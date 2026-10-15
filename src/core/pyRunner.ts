// 必须内联成 blob: Worker：从 URL 加载的 Worker 用的是 Worker 脚本自己的响应头里的 CSP，
// 而 GitHub Pages 发不了响应头，页面 <meta> 里的 CSP（connect-src 'self'）管不到它——
// 用户的 Python 代码恰恰就跑在这个 Worker 里。blob: Worker 会继承创建者页面的 CSP。
import PyWorker from "./pyWorker.ts?worker&inline";
import { validateRequest } from "./limits";
import type { RunRequest, RunResult, Runner } from "./types";

export type RunnerStatus = "loading" | "ready" | "failed";

const failure = (error: string, timedOut = false): RunResult => ({
  stdout: "",
  stderr: "",
  error,
  timedOut,
  probes: [],
});

/**
 * 浏览器端 Runner：Pyodide 跑在 Worker 里。
 * - 超时：直接 terminate 并重建，防死循环卡死页面
 * - 崩溃（如内存耗尽）：捕获 error/messageerror，重建并给出友好提示
 * - 加载失败：下次运行时自动重试
 */
export class PyRunner implements Runner {
  private worker!: Worker;
  private ready!: Promise<void>;
  private nextId = 1;
  status: RunnerStatus = "loading";
  onStatus?: (s: RunnerStatus) => void;

  constructor(private timeoutMs = 5000) {
    this.spawn();
  }

  private setStatus(s: RunnerStatus) {
    this.status = s;
    this.onStatus?.(s);
  }

  private spawn() {
    this.setStatus("loading");
    this.worker = new PyWorker();
    const w = this.worker;
    this.ready = new Promise<void>((resolve, reject) => {
      w.addEventListener("message", function onMsg(ev) {
        if (ev.data?.type === "ready") {
          w.removeEventListener("message", onMsg);
          resolve();
        }
      });
      w.addEventListener("error", () => reject(new Error("Pyodide 加载失败")));
    });
    this.ready.then(
      () => this.setStatus("ready"),
      () => this.setStatus("failed")
    );
  }

  private reset() {
    this.worker.terminate();
    this.spawn();
  }

  async run(req: RunRequest): Promise<RunResult> {
    const invalid = validateRequest(req);
    if (invalid) return failure(invalid);

    if (this.status === "failed") this.reset();
    try {
      await this.ready;
    } catch {
      return failure("Python 环境加载失败，请检查网络后刷新页面重试");
    }

    const id = this.nextId++;
    const w = this.worker;
    return new Promise<RunResult>((resolve) => {
      let done = false;
      const finish = (result: RunResult, needReset: boolean) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        w.removeEventListener("message", onMsg);
        w.removeEventListener("error", onCrash);
        w.removeEventListener("messageerror", onCrash);
        if (needReset) this.reset();
        resolve(result);
      };
      const onMsg = (ev: MessageEvent) => {
        if (ev.data?.type === "result" && ev.data.id === id) finish(ev.data.result, false);
      };
      const onCrash = () =>
        finish(failure("运行环境崩溃了（可能是内存不足），已自动重置，请检查代码后重试"), true);
      const timer = setTimeout(
        () => finish(failure(`运行超过 ${this.timeoutMs / 1000} 秒被终止，是不是写了死循环？`, true), true),
        this.timeoutMs
      );
      w.addEventListener("message", onMsg);
      w.addEventListener("error", onCrash);
      w.addEventListener("messageerror", onCrash);
      w.postMessage({ id, req });
    });
  }
}

let shared: PyRunner | null = null;
export function getRunner(): PyRunner {
  return (shared ??= new PyRunner());
}
