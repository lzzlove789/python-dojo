/// <reference lib="webworker" />
import { loadPyodide } from "pyodide";
import { execute, setupHelpers } from "./pyExec";
import type { RunRequest } from "./types";

// 同源自托管（由 vite.config.ts 的 selfHostPyodide 提供），版本与 package.json 锁定的 pyodide 一致
const INDEX_URL = new URL(`${import.meta.env.BASE_URL}pyodide/`, self.location.origin).href;

const ready = loadPyodide({ indexURL: INDEX_URL }).then((py) => {
  setupHelpers(py);
  postMessage({ type: "ready" });
  return py;
});

// 初始化失败（网络断了、资源 404、wasm 编译失败……）在 Worker 里只是个未处理的 Promise rejection，
// 不会触发主线程的 error 事件，页面就会永远停在“加载中”。必须主动告诉主线程。
ready.catch((e) => postMessage({ type: "init-error", message: String((e as Error)?.message ?? e) }));

self.onmessage = async (ev: MessageEvent<{ id: number; req: RunRequest }>) => {
  const { id, req } = ev.data;
  try {
    const py = await ready;
    postMessage({ type: "result", id, result: await execute(py, req) });
  } catch (e) {
    // 引擎自身出错也必须回一条消息，否则主线程会一直等到超时，并被误报成“死循环”
    postMessage({
      type: "result",
      id,
      result: {
        stdout: "",
        stderr: "",
        error: "运行引擎内部出错：" + String((e as Error)?.message ?? e),
        timedOut: false,
        probes: [],
      },
    });
  }
};
