// GitHub Pages 无法设置 HTTP 响应头，只能用 <meta http-equiv> 声明 CSP（由 vite.config.ts 在 build 时注入）。
//
// 这份策略是项目最重要的安全边界：用户的 Python 代码可以通过 js 桥 / pyodide.code.run_js 拿到任意 JS 能力，
// Python 层的黑名单挡不住，真正挡住"联网外传"的是 connect-src 'self'（以及 Worker 以 blob: 方式创建而继承到它，
// 见 runnerInstance.ts）。csp.test.ts 会断言这里的关键指令，改动请谨慎。
export const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  // 'wasm-unsafe-eval' 是 Pyodide 编译 WebAssembly 所必需的；没有 'unsafe-eval'，也没有 'unsafe-inline'
  "script-src": ["'self'", "'wasm-unsafe-eval'"],
  "worker-src": ["'self'", "blob:"],
  // 用户代码无法向任何外部地址发请求
  "connect-src": ["'self'"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["https://fonts.gstatic.com"],
  "img-src": ["'self'", "data:"],
  "object-src": ["'none'"],
  "base-uri": ["'none'"],
  "form-action": ["'none'"],
};

export function buildCsp(directives: Record<string, string[]> = CSP_DIRECTIVES): string {
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

export const CSP = buildCsp();
