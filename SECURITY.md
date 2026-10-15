# 安全策略

## 项目的安全模型

Python 练功房是**纯静态网站**（部署在 GitHub Pages），没有后端、没有数据库、没有账号系统：

- 你写的 Python 代码由浏览器里的 [Pyodide](https://pyodide.org)（WebAssembly 版 CPython）执行，**不会上传到任何服务器**。
- 通关进度和代码草稿只保存在你自己浏览器的 `localStorage` 里。
- 代码只能影响你自己的浏览器标签页，影响不到其他用户（项目没有分享、协作、导入他人代码的功能）。

> **不要为了"更安全"把用户代码改成发到后端 `exec()` 执行。** 那会把风险从用户自己的浏览器转移到服务器，攻击面反而大幅增加。

## 真正的安全边界是什么

先说清楚什么**不是**边界：

- ❌ **Python 层的黑名单不是边界。** 本项目会拦截用户代码里的 `import js`，但这只是一个友好提示。
  已验证的绕过方式至少有：通过拦截函数的 `__globals__` 取回原始 `__import__`；`importlib.import_module("js")`；
  `pyodide.ffi` 等。绕过之后用户代码就能拿到 JS 全局对象（`fetch`、`postMessage`、`indexedDB`……）。
  Python 足够灵活，这类黑名单不可能堵死。
- ℹ️ 顺带一提：`pyodide.code.run_js(...)`（把字符串当 JS 执行）在线上环境**用不了**——我们的 CSP 没有 `'unsafe-eval'`，浏览器会直接报
  `EvalError`（已在浏览器里实测）。这是 CSP 里"不放 `unsafe-eval`"的又一个收益，所以 `csp.test.ts` 会锁住这一点。

真正起作用的是：

- ✅ **CSP `connect-src 'self'`**：用户代码即使拿到了 JS 桥，也无法向任何外部地址发请求。配置在 [`src/security/csp.ts`](src/security/csp.ts)，
  有单元测试锁定关键指令。
- ✅ **运行用户代码的 Worker 以 `blob:` 方式创建**（[`runnerInstance.ts`](src/core/runnerInstance.ts)），这样才会继承页面 `<meta>` 里的 CSP。
  从 URL 加载的 Worker 用的是 Worker 脚本自己的响应头，而 GitHub Pages 发不了响应头，会让 CSP 对用户代码失效。
- ✅ **浏览器自身的沙箱**：Worker 里没有 DOM、没有 `localStorage`，用户代码碰不到页面。
- ✅ **主线程不信任 Worker 消息**：用户代码能向主线程 `postMessage` 任意内容，所以结果必须通过形状校验才会被采纳
  （[`resultGuard.ts`](src/core/resultGuard.ts)）。这防的是"把界面搞崩"；伪造一个合法的结果只会让用户自己白白通关。

## 其他防护

| 威胁 | 措施 |
| --- | --- |
| 供应链：CDN 被投毒 | Pyodide 运行时**自托管**在本站同源下（不从第三方 CDN 加载），版本由 `package-lock.json` 锁定 |
| 供应链：依赖 / Actions | CI 用 `npm ci` + `npm audit`；GitHub Actions 固定到提交 SHA，Dependabot 每周检查更新；工作流默认只读权限 |
| XSS | CSP `script-src 'self'`（无内联脚本、无 `unsafe-eval`）、`object-src 'none'`；教程 Markdown 渲染时禁用原始 HTML；界面只用文本插值渲染用户输出 |
| 死循环 | Worker 中运行，5 秒超时强制终止并重建 |
| 输出刷屏 / 超长代码 | 输出上限 100KB，代码上限 50,000 字符，输入上限 10,000 字符 |
| Worker 崩溃 / 初始化失败 | 崩溃自动重建；初始化 45 秒超时并显示原因和「重试」；所有运行串行排队，输出不会串台 |
| 运行间状态污染 | 每次运行前后恢复 `builtins`、`sys` 流、`sys.path`、工作目录、递归上限、新导入的模块、`os.environ`，以及常用标准库模块（`json`、`math`、`re`、`os`、`collections`……）和其中 Python 类的属性；检查表达式的助手函数使用私有引用，不会被用户改写的 `json.dumps` 等影响 |
| 点击劫持 | 页面默认隐藏，确认自己是顶层窗口才显示；被嵌入 iframe 时尝试跳转顶层 |
| 本地存储被篡改 | 恢复进度时校验类型、关卡是否存在、体积上限，非法数据直接丢弃；存储 key 带项目前缀 |

## 已知限制

- **内存耗尽无法在浏览器里硬限制。** 5 秒超时只限制时间，不限制内存（WebAssembly 的内存上限由 Pyodide 构建决定）。
  `terminate()` 能杀掉卡在原生调用里的 Worker，崩溃后会自动重建，但极端的内存分配仍可能让标签页短暂卡顿甚至被浏览器回收。
  这只影响运行代码的用户自己的标签页。我们**不**用字符串黑名单去预检内存（不可靠，还会误伤正常代码）。
- **状态复位不是完全重启解释器。** 没在名单里的模块、C 实现的内置类型不在自动恢复范围内。如果感觉环境被前一次运行搞坏了，
  点击工具栏的「**重置环境**」，会杀掉并重建整个 Python 解释器。
- GitHub Pages **无法设置 HTTP 响应头**，所以 CSP 通过 `<meta>` 声明，`frame-ancestors` 等指令不可用（用 frame guard 代替）。
- 通关进度存在本地，用户自己改 `localStorage` 就能"作弊"。这是学习项目，不视为安全问题。

## 同一个 github.io 下的多个项目共享 origin

GitHub Pages 上同一账号的所有项目页（`用户名.github.io/项目A`、`/项目B`）属于**同一个 origin**，浏览器会让它们共用 `localStorage`，
并且互相可以读到。所以：

- 本项目的存储 key 带了 `python-dojo:` 前缀，避免和其他项目（例如另一个同样用 Pinia 的项目）互相覆盖。
- **不要在 `localStorage` 里存任何敏感信息**；同账号下任何一个项目出现 XSS，都能读到其他项目的存储。
- 如果以后要做账号、登录、付费之类的功能，请先给本项目配一个**自定义域名**（Pages 支持），获得独立的 origin。

## 报告漏洞

请**不要**在公开 issue 里披露细节。请通过仓库 **Security → Report a vulnerability**（GitHub 私密安全报告）联系维护者。我们会尽快确认并修复。

## 给维护者的备忘

- 运行用户代码的 Worker 必须保持 `?worker&inline`（blob: Worker）。改动 `src/core/runnerInstance.ts` 或 CSP 后，请在 `npm run preview` 下实测
  下面的清单；这些只能在真实浏览器里验证，单元测试覆盖不到：
  1. **外联应被 CSP 拦截**：在练功场运行
     ```python
     import importlib
     js = importlib.import_module("js")   # 绕过 import js 的提示，拿到 JS 桥
     try:
         r = await js.fetch("https://api.github.com/")   # 这个地址允许跨域，所以只有 CSP 能拦住它
         print("LEAK", r.status)
     except Exception as e:
         print("blocked:", e)
     ```
     应输出 `blocked: ...`，控制台出现 `violates the following Content Security Policy directive: "connect-src 'self'"`，且不出现 `LEAK`。
     再用 `js.Worker.new(js.URL.createObjectURL(js.Blob.new([...])))` 创建嵌套 Worker 去请求同一地址，结果应相同。
     另外 `from pyodide.code import run_js; run_js("1")` 应抛 `EvalError`（CSP 禁止 `unsafe-eval`）。
  2. **内存压力**（请在独立浏览器窗口里做，别开着重要标签页）：`x = [0] * (2 * 10**8)`、`bytearray(10**9)`，
     要么 `MemoryError`，要么 Worker 崩溃后自动恢复，之后正常运行代码应当可用。
  3. **初始化失败可恢复**：在开发者工具里拦截 `pyodide.asm.wasm` 请求 → 应显示失败原因和「重试」，取消拦截后点「重试」可恢复。
  4. **状态污染**：运行 `import json; json.dumps = lambda *a, **k: "x"`，再运行第 27 关的参考答案，应当通过。
  5. **iframe 嵌入**：用 iframe 嵌入页面，页面应保持隐藏。
- 升级 `pyodide` 时，`package.json` 里保持精确版本号，并重新跑 `npm test`（会把 30 关的参考答案都真实执行一遍）。
