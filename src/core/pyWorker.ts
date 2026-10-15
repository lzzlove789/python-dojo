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
  const py = await ready;
  const result = await execute(py, ev.data.req);
  postMessage({ type: "result", id: ev.data.id, result });
};
