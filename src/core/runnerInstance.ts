// 必须内联成 blob: Worker：从 URL 加载的 Worker 用的是 Worker 脚本自己的响应头里的 CSP，
// 而 GitHub Pages 发不了响应头，页面 <meta> 里的 CSP（connect-src 'self'）管不到它——
// 用户的 Python 代码恰恰就跑在这个 Worker 里。blob: Worker 会继承创建者页面的 CSP。
// 单独放一个文件，是为了让 pyRunner.ts 不依赖 `?worker&inline` 这种打包器专有语法，能在 Vitest 里直接测试。
import PyWorker from "./pyWorker.ts?worker&inline";
import { PyRunner } from "./pyRunner";

let shared: PyRunner | null = null;

export function getRunner(): PyRunner {
  return (shared ??= new PyRunner({ createWorker: () => new PyWorker() }));
}
