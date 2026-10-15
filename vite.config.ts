import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Pyodide 运行时只需要这四个文件；pyodide.mjs（JS 入口）由 Vite 从 npm 包直接打包。
// 自托管而不是走 CDN：避免 CDN 被投毒影响所有访客，也让 CSP 可以收紧到只允许同源。
const PYODIDE_FILES = ["pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
const PYODIDE_DIR = resolve(__dirname, "node_modules/pyodide");
const MIME: Record<string, string> = {
  ".js": "text/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".zip": "application/zip",
};

function selfHostPyodide(base: string): Plugin {
  return {
    name: "self-host-pyodide",
    // dev：直接从 node_modules 提供
    configureServer(server) {
      server.middlewares.use(`${base}pyodide/`, (req, res, next) => {
        const name = decodeURIComponent((req.url ?? "").split("?")[0].replace(/^\//, ""));
        if (!PYODIDE_FILES.includes(name)) return next();
        const ext = name.slice(name.lastIndexOf("."));
        res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
        createReadStream(resolve(PYODIDE_DIR, name)).pipe(res);
      });
    },
    // build：作为静态资源输出到 dist/pyodide/
    generateBundle() {
      for (const name of PYODIDE_FILES) {
        const file = resolve(PYODIDE_DIR, name);
        if (!existsSync(file)) throw new Error(`缺少 Pyodide 文件：${file}，请先 npm ci`);
        this.emitFile({ type: "asset", fileName: `pyodide/${name}`, source: readFileSync(file) });
      }
    },
  };
}

// GitHub Pages 无法设置响应头，只能用 <meta> 声明 CSP。
// 关键是 connect-src 'self'：用户的 Python 代码（js.fetch 等）无法向外网发请求。
// 只在 build 时注入：dev 服务器自带内联脚本（HMR），会和严格 CSP 冲突。
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "worker-src 'self' blob:",
  "connect-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

function injectCsp(): Plugin {
  return {
    name: "inject-csp",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace("<head>", `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
    },
  };
}

const base = "/python-dojo/";

export default defineConfig({
  plugins: [vue(), selfHostPyodide(base), injectCsp()],
  assetsInclude: ["**/*.md"],
  base,
  optimizeDeps: { exclude: ["pyodide"] },
  worker: { format: "es" },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ["vue", "vue-router", "pinia", "pinia-plugin-persistedstate"],
          markdown: ["markdown-it"],
        },
      },
    },
  },
});
