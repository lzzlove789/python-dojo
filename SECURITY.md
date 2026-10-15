# 安全策略

## 项目的安全模型

Python 练功房是**纯静态网站**（部署在 GitHub Pages），没有后端、没有数据库、没有账号系统：

- 你写的 Python 代码由浏览器里的 [Pyodide](https://pyodide.org)（WebAssembly 版 CPython）执行，**不会上传到任何服务器**。
- 通关进度和代码草稿只保存在你自己浏览器的 `localStorage` 里。
- 代码只能影响你自己的浏览器标签页，影响不到其他用户。

## 已有的防护

| 威胁 | 措施 |
| --- | --- |
| 供应链：CDN 被投毒 | Pyodide 运行时**自托管**在本站同源下（不从第三方 CDN 加载），版本由 `package-lock.json` 锁定 |
| 供应链：依赖 / Actions | CI 用 `npm ci` + `npm audit`；GitHub Actions 固定到提交 SHA，Dependabot 每周检查更新；工作流默认只读权限 |
| 用户代码向外网发请求 | CSP `connect-src 'self'` 禁止一切跨域请求；运行时还屏蔽了 `import js` / `import pyodide_js`（尽力而为的第二道防线） |
| XSS | CSP `script-src 'self'`（无内联脚本）、`object-src 'none'`；教程 Markdown 渲染时禁用原始 HTML |
| 死循环 / 内存耗尽 / 输出刷屏 | Worker 中运行，5 秒超时强制终止并重建；输出上限 100KB；代码长度上限 50,000 字符；崩溃自动恢复 |
| 点击劫持 | 页面默认隐藏，确认自己是顶层窗口才显示；被嵌入 iframe 时尝试跳转顶层 |
| 本地存储被篡改 | 恢复进度时校验类型、关卡是否存在、体积上限，非法数据直接丢弃 |

## 已知限制

- GitHub Pages **无法设置 HTTP 响应头**，所以 CSP 通过 `<meta>` 标签声明，`frame-ancestors` 等指令不可用（用上面的 frame guard 代替）。
- 屏蔽 `import js` 是尽力而为：Python 足够灵活，用户总能找到绕过方式。真正的边界是 CSP 和浏览器自身的沙箱。
- 通关进度存在本地，用户自己改 `localStorage` 就能"作弊"。这是学习项目，不视为安全问题。

## 报告漏洞

请**不要**在公开 issue 里披露细节。请通过仓库 **Security → Report a vulnerability**（GitHub 私密安全报告）联系维护者，或发邮件给维护者。我们会尽快确认并修复。

## 给维护者的备忘

- 运行用户代码的 Worker 必须保持 `?worker&inline`（blob: Worker）。从 URL 加载的 Worker 不会继承页面 `<meta>` 里的 CSP，
  `connect-src 'self'` 就会对用户代码失效（GitHub Pages 发不了响应头来补）。改动 `src/core/pyRunner.ts` 后，请在 `npm run preview` 下
  实测：用 `importlib.import_module("js")` 取到 `js.fetch` 去请求一个允许跨域的地址（如 `https://api.github.com/`），控制台应出现
  `violates the following Content Security Policy directive: "connect-src 'self'"`。
- 升级 `pyodide` 时，`package.json` 里保持精确版本号，并重新跑 `npm test`（会把 30 关的参考答案都真实执行一遍）。
