import { validateRequest } from "./limits";
import { parseResult } from "./resultGuard";
import type { RunRequest, RunResult, Runner } from "./types";

export type RunnerStatus = "loading" | "ready" | "failed";

/** Worker 的最小接口：真实环境是浏览器 Worker，单测里用假的 */
export interface RunnerWorker {
  postMessage(message: unknown): void;
  terminate(): void;
  addEventListener(type: string, listener: (ev: any) => void): void;
  removeEventListener(type: string, listener: (ev: any) => void): void;
}

export interface PyRunnerOptions {
  createWorker: () => RunnerWorker;
  /** 单次运行的超时（从它真正开始运行起计时） */
  timeoutMs?: number;
  /** Pyodide 初始化（下载 ~14MB 并启动）的超时 */
  initTimeoutMs?: number;
}

const failure = (error: string, timedOut = false): RunResult => ({
  stdout: "",
  stderr: "",
  error,
  timedOut,
  probes: [],
});

/**
 * 主线程侧的 Runner。Pyodide 跑在 Worker 里：
 * - 运行超时：terminate 并重建，防死循环卡死页面
 * - 初始化超时 / 初始化失败：状态置 failed，给出原因，下次运行或点「重试」会重新初始化
 * - 崩溃（如内存耗尽）：捕获 error/messageerror，重建并给出友好提示
 * - 串行执行：所有运行排队，输出不会串台
 * - 不信任 Worker 消息：用户代码就跑在 Worker 里，它可以伪造任何 postMessage，所以结果必须校验形状
 */
export class PyRunner implements Runner {
  private worker!: RunnerWorker;
  private ready!: Promise<void>;
  private nextId = 1;
  private queue: Promise<unknown> = Promise.resolve();
  private cancelCurrent?: () => void;
  private readonly timeoutMs: number;
  private readonly initTimeoutMs: number;
  private readonly createWorker: () => RunnerWorker;

  status: RunnerStatus = "loading";
  /** 最近一次初始化失败的原因 */
  lastError: string | null = null;
  onStatus?: (s: RunnerStatus) => void;

  constructor(opts: PyRunnerOptions) {
    this.createWorker = opts.createWorker;
    this.timeoutMs = opts.timeoutMs ?? 5000;
    this.initTimeoutMs = opts.initTimeoutMs ?? 45_000;
    this.spawn();
  }

  private setStatus(s: RunnerStatus) {
    this.status = s;
    this.onStatus?.(s);
  }

  private spawn() {
    this.setStatus("loading");
    this.lastError = null;
    const w = this.createWorker();
    this.worker = w;

    this.ready = new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        w.removeEventListener("message", onMsg);
        w.removeEventListener("error", onError);
      };
      const fail = (message: string) => {
        cleanup();
        reject(new Error(message));
      };
      const onMsg = (ev: MessageEvent) => {
        if (ev.data?.type === "ready") {
          cleanup();
          resolve();
        } else if (ev.data?.type === "init-error") {
          fail(`Python 环境初始化失败：${String(ev.data.message ?? "未知错误").slice(0, 200)}`);
        }
      };
      const onError = () => fail("Python 环境加载失败，请检查网络");
      const timer = setTimeout(
        () => fail(`Python 环境加载超过 ${Math.round(this.initTimeoutMs / 1000)} 秒，请检查网络后重试`),
        this.initTimeoutMs
      );
      w.addEventListener("message", onMsg);
      w.addEventListener("error", onError);
    });

    this.ready.then(
      () => {
        if (this.worker === w) this.setStatus("ready");
      },
      (e: Error) => {
        // 初始化失败：杀掉半死不活的 Worker，等待下一次重试
        w.terminate();
        if (this.worker === w) {
          this.lastError = e.message;
          this.setStatus("failed");
        }
      }
    );
  }

  /** 杀掉当前 Worker 并重新初始化；正在跑的那次运行会立刻以“已重置”结束 */
  restart() {
    this.cancelCurrent?.();
    this.worker.terminate();
    this.spawn();
  }

  /**
   * 串行执行：做题页和练功场共用同一个 Worker，Worker 里的 stdout 收集器和命名空间是全局的，
   * 两次运行重叠会互相串输出。排队后每次运行的超时也是从它真正开始时才计时。
   */
  run(req: RunRequest): Promise<RunResult> {
    const result = this.queue.then(() => this.runNow(req));
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async runNow(req: RunRequest): Promise<RunResult> {
    const invalid = validateRequest(req);
    if (invalid) return failure(invalid);

    if (this.status === "failed") this.restart();
    try {
      await this.ready;
    } catch (e) {
      return failure((e as Error).message);
    }

    const id = this.nextId++;
    const w = this.worker;
    return new Promise<RunResult>((resolve) => {
      let done = false;
      const finish = (result: RunResult, needRestart: boolean) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        w.removeEventListener("message", onMsg);
        w.removeEventListener("error", onCrash);
        w.removeEventListener("messageerror", onCrash);
        this.cancelCurrent = undefined;
        // 只重建“自己用的那个” Worker，避免它已被 restart() 换掉时又误杀新的
        if (needRestart && this.worker === w) this.restart();
        resolve(result);
      };
      const onMsg = (ev: MessageEvent) => {
        if (ev.data?.type !== "result" || ev.data.id !== id) return;
        const parsed = parseResult(ev.data.result);
        finish(parsed ?? failure("运行引擎返回了无法识别的结果，已自动重置"), parsed === null);
      };
      const onCrash = () =>
        finish(failure("运行环境崩溃了（可能是内存不足），已自动重置，请检查代码后重试"), true);
      const timer = setTimeout(
        () => finish(failure(`运行超过 ${this.timeoutMs / 1000} 秒被终止，是不是写了死循环？`, true), true),
        this.timeoutMs
      );
      this.cancelCurrent = () => finish(failure("Python 环境已重置，请重新运行"), false);
      w.addEventListener("message", onMsg);
      w.addEventListener("error", onCrash);
      w.addEventListener("messageerror", onCrash);
      w.postMessage({ id, req });
    });
  }
}
