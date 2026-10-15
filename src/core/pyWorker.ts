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
