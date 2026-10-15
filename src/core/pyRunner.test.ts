import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PyRunner, type RunnerWorker } from "./pyRunner";
import type { RunResult } from "./types";

/** 假 Worker：可以手动“发消息给主线程”，并记录收到的请求 */
class FakeWorker implements RunnerWorker {
  listeners = new Map<string, Set<(ev: unknown) => void>>();
  posted: Array<{ id: number; req: { code: string } }> = [];
  terminated = false;

  postMessage(m: unknown) {
    this.posted.push(m as { id: number; req: { code: string } });
  }
  terminate() {
    this.terminated = true;
  }
  addEventListener(type: string, l: (ev: unknown) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(l);
  }
  removeEventListener(type: string, l: (ev: unknown) => void) {
    this.listeners.get(type)?.delete(l);
  }
  emit(type: string, data?: unknown) {
    for (const l of [...(this.listeners.get(type) ?? [])]) l({ data });
  }
  ready() {
    this.emit("message", { type: "ready" });
  }
  reply(id: number, result: unknown) {
    this.emit("message", { type: "result", id, result });
  }
}

const okResult = (stdout = ""): RunResult => ({ stdout, stderr: "", error: null, timedOut: false, probes: [] });
const flush = () => vi.advanceTimersByTimeAsync(0);

function setup(opts: { timeoutMs?: number; initTimeoutMs?: number } = {}) {
  const workers: FakeWorker[] = [];
  const runner = new PyRunner({
    createWorker: () => {
      const w = new FakeWorker();
      workers.push(w);
      return w;
    },
    ...opts,
  });
  return { runner, workers };
}

describe("PyRunner", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe("初始化", () => {
    it("收到 ready 后状态变为 ready", async () => {
      const { runner, workers } = setup();
      expect(runner.status).toBe("loading");
      workers[0].ready();
      await flush();
      expect(runner.status).toBe("ready");
    });

    it("Worker 报告 init-error：状态 failed、带原因、旧 Worker 被终止", async () => {
      const { runner, workers } = setup();
      workers[0].emit("message", { type: "init-error", message: "Failed to fetch" });
      await flush();
      expect(runner.status).toBe("failed");
      expect(runner.lastError).toContain("Failed to fetch");
      expect(workers[0].terminated).toBe(true);
    });

    it("初始化一直没有响应：超时后变成 failed，而不是永远“加载中”", async () => {
      const { runner } = setup({ initTimeoutMs: 30_000 });
      await vi.advanceTimersByTimeAsync(29_999);
      expect(runner.status).toBe("loading");
      await vi.advanceTimersByTimeAsync(2);
      expect(runner.status).toBe("failed");
      expect(runner.lastError).toContain("30 秒");
    });

    it("初始化失败后 run() 立即返回失败原因；再次 run() 会自动重新初始化", async () => {
      const { runner, workers } = setup();
      workers[0].emit("message", { type: "init-error", message: "boom" });
      await flush();

      const p1 = runner.run({ code: "print(1)" });
      await flush();
      // 第一次 run 发现 failed → 重建 Worker，并等待新的 ready
      expect(workers).toHaveLength(2);
      workers[1].emit("message", { type: "init-error", message: "still down" });
      expect((await p1).error).toContain("still down");

      const p2 = runner.run({ code: "print(2)" });
      await flush();
      expect(workers).toHaveLength(3);
      workers[2].ready();
      await flush();
      workers[2].reply(workers[2].posted[0].id, okResult("2\n"));
      expect((await p2).stdout).toBe("2\n");
    });

    it("restart() 重建 Worker 并回到 loading", async () => {
      const { runner, workers } = setup();
      workers[0].ready();
      await flush();
      runner.restart();
      expect(workers[0].terminated).toBe(true);
      expect(workers).toHaveLength(2);
      expect(runner.status).toBe("loading");
    });
  });

  describe("运行", () => {
    async function ready() {
      const ctx = setup({ timeoutMs: 5000 });
      ctx.workers[0].ready();
      await flush();
      return ctx;
    }

    it("正常返回结果", async () => {
      const { runner, workers } = await ready();
      const p = runner.run({ code: "print(1)" });
      await flush();
      workers[0].reply(workers[0].posted[0].id, okResult("1\n"));
      expect((await p).stdout).toBe("1\n");
      expect(workers).toHaveLength(1);
    });

    it("超时：终止并重建 Worker，标记 timedOut，且之后还能继续运行", async () => {
      const { runner, workers } = await ready();
      const p = runner.run({ code: "while True: pass" });
      await vi.advanceTimersByTimeAsync(5000);
      const r = await p;
      expect(r.timedOut).toBe(true);
      expect(r.error).toContain("5 秒");
      expect(workers[0].terminated).toBe(true);
      expect(workers).toHaveLength(2);

      workers[1].ready();
      await flush();
      const p2 = runner.run({ code: "print(1)" });
      await flush();
      workers[1].reply(workers[1].posted[0].id, okResult("ok\n"));
      expect((await p2).stdout).toBe("ok\n");
    });

    it("Worker 崩溃（error 事件）：给出友好提示并重建", async () => {
      const { runner, workers } = await ready();
      const p = runner.run({ code: "x = [0] * 10**10" });
      await flush();
      workers[0].emit("error");
      const r = await p;
      expect(r.error).toContain("崩溃");
      expect(workers).toHaveLength(2);
    });

    it("messageerror 同样按崩溃处理", async () => {
      const { runner, workers } = await ready();
      const p = runner.run({ code: "pass" });
      await flush();
      workers[0].emit("messageerror");
      expect((await p).error).toContain("崩溃");
    });

    it("多次运行串行排队：前一次没结束，后一次不会发给 Worker", async () => {
      const { runner, workers } = await ready();
      const p1 = runner.run({ code: "A" });
      const p2 = runner.run({ code: "B" });
      await flush();
      expect(workers[0].posted.map((m) => m.req.code)).toEqual(["A"]);
      workers[0].reply(workers[0].posted[0].id, okResult("a"));
      expect((await p1).stdout).toBe("a");
      await flush();
      expect(workers[0].posted.map((m) => m.req.code)).toEqual(["A", "B"]);
      workers[0].reply(workers[0].posted[1].id, okResult("b"));
      expect((await p2).stdout).toBe("b");
    });

    it("排队的运行，超时从它真正开始时才计时", async () => {
      const { runner, workers } = await ready();
      const p1 = runner.run({ code: "A" });
      const p2 = runner.run({ code: "B" });
      await vi.advanceTimersByTimeAsync(4000);
      workers[0].reply(workers[0].posted[0].id, okResult("a"));
      await p1;
      // B 在 t=4s 才开始，再过 4s（总共 8s）仍未超时
      await vi.advanceTimersByTimeAsync(4000);
      expect(workers).toHaveLength(1);
      workers[0].reply(workers[0].posted[1].id, okResult("b"));
      expect((await p2).stdout).toBe("b");
    });

    it("超长代码在主线程就被拒绝，不会发给 Worker", async () => {
      const { runner, workers } = await ready();
      const r = await runner.run({ code: "x".repeat(60_000) });
      expect(r.error).toContain("代码太长");
      expect(workers[0].posted).toHaveLength(0);
    });

    it("只响应属于自己的 id，忽略别的 id 的结果", async () => {
      const { runner, workers } = await ready();
      const p = runner.run({ code: "A" });
      await flush();
      const id = workers[0].posted[0].id;
      workers[0].reply(id + 99, okResult("someone else"));
      workers[0].reply(id, okResult("mine"));
      expect((await p).stdout).toBe("mine");
    });

    it("运行中调用 restart()：这次运行立刻以“已重置”结束，且不会误杀新的 Worker", async () => {
      const { runner, workers } = await ready();
      const p = runner.run({ code: "while True: pass" });
      await flush();
      runner.restart();
      const r = await p;
      expect(r.error).toContain("已重置");
      expect(workers).toHaveLength(2);
      // 旧运行的超时定时器已被清掉：再过很久也不会把新 Worker 重建
      workers[1].ready();
      await vi.advanceTimersByTimeAsync(60_000);
      expect(workers).toHaveLength(2);
      expect(workers[1].terminated).toBe(false);
    });
  });

  describe("不信任 Worker 消息", () => {
    async function readyRunner() {
      const ctx = setup();
      ctx.workers[0].ready();
      await flush();
      return ctx;
    }

    it("伪造的、形状不合法的结果被拒绝并重建 Worker", async () => {
      const bad: unknown[] = [
        null,
        "pass",
        { stdout: 1 },
        { stdout: "", stderr: "", error: null, timedOut: false, probes: "nope" },
        { stdout: "", stderr: "", error: 5, timedOut: false, probes: [] },
        { stdout: "", stderr: "", error: null, timedOut: "no", probes: [] },
        { stdout: "", stderr: "", error: null, timedOut: false, probes: [{ expr: 1, ok: true }] },
        { stdout: "x".repeat(1_000_000), stderr: "", error: null, timedOut: false, probes: [] },
        { stdout: "", stderr: "", error: null, timedOut: false, probes: new Array(500).fill({ expr: "x", ok: true }) },
      ];
      for (const payload of bad) {
        const { runner, workers } = await readyRunner();
        const p = runner.run({ code: "pass" });
        await flush();
        workers[0].reply(workers[0].posted[0].id, payload);
        const r = await p;
        expect(r.error, JSON.stringify(payload)?.slice(0, 60)).toContain("无法识别");
        expect(workers).toHaveLength(2);
      }
    });

    it("引擎报告自身出错（engineFailed，如复位抛异常）：返回错误并重建 Worker", async () => {
      const { runner, workers } = await readyRunner();
      const p = runner.run({ code: "pass" });
      await flush();
      workers[0].reply(workers[0].posted[0].id, { ...okResult(), error: "运行引擎内部出错：boom", engineFailed: true });
      const r = await p;
      expect(r.error).toContain("运行引擎内部出错");
      expect(workers[0].terminated).toBe(true);
      expect(workers).toHaveLength(2);
    });

    it("合法结果只保留已知字段，多余字段被丢弃", async () => {
      const { runner, workers } = await readyRunner();
      const p = runner.run({ code: "pass" });
      await flush();
      workers[0].reply(workers[0].posted[0].id, {
        ...okResult("hi"),
        probes: [{ expr: "x", ok: true, value: [1], extra: "drop me" }],
        evil: "<script>",
      });
      const r = await p;
      expect(r).toEqual({ stdout: "hi", stderr: "", error: null, timedOut: false, probes: [{ expr: "x", ok: true, value: [1] }] });
    });
  });
});
