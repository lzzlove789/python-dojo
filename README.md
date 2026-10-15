# Python 练功房

一个在浏览器里闯关学 Python 的小游戏：30 个关卡、4 个章节，每关有教程、提示、参考答案和实时的通关检查清单。
代码由 [Pyodide](https://pyodide.org)（WebAssembly 版 CPython）**真实运行**在你的浏览器里，没有后端。

## 关卡

- 第一章 · 初识 Python（1–8）：print、变量与类型、运算符、字符串与 f-string、input 与类型转换、条件判断、for、while
- 第二章 · 数据结构（9–16）：列表、切片、字典、集合与元组、列表推导式、排序与 key、enumerate 与 zip、词频统计
- 第三章 · 函数与面向对象（17–24）：函数、`*args/**kwargs`、闭包、装饰器、类、继承、魔术方法、生成器
- 第四章 · 工程实战（25–30）：异常、文件、JSON、标准库、正则、终极关（CSV 统计报告）
- 练功场：不限题目的自由编辑器 + 语法速查表

## 开发

```bash
npm ci
npm run dev       # http://localhost:5173/python-dojo/
npm test          # 校验引擎、检查器，并把每一关的参考答案真实跑一遍
npm run build     # 产物在 dist/，可直接部署到 GitHub Pages
npm run preview   # 预览构建产物（带 CSP，和线上一致）
```

技术栈：Vue 3 · TypeScript · Vite · Pinia · Vue Router · CodeMirror 6 · Pyodide · Vitest。

## 新增一关

在 `src/levels/main/` 下新建 `levelN/`，包含 `index.ts`（标题、初始代码、提示、参考答案、检查规则）和 `README.md`（教程），
然后在 `src/levels/mainLevels.ts` 里按顺序注册。`npm test` 会自动验证：参考答案必须通过全部检查，且初始代码不能直接通关。

检查规则见 `src/core/types.ts` 的 `CheckRule`：`noError`、`stdoutEquals`、`stdoutMatches`、`codeMatches`、`codeForbids`、`exprEquals`
（在用户代码运行后的命名空间里求值，可测变量，也可调用用户写的函数）。

## 安全

线上版是纯静态站点，代码只在你自己的浏览器里运行，不会上传。主要防护：Pyodide 自托管（不依赖 CDN）、
严格的 CSP（`connect-src 'self'`，用户代码无法联网）、运行超时与输出/代码长度上限、防点击劫持、本地存储校验、
CI 依赖审计与 Actions 固定 SHA。详见 [SECURITY.md](SECURITY.md)。

## 部署到 GitHub Pages

仓库 Settings → Pages → Source 选 **GitHub Actions**，推送到 `main` 即自动构建部署（`.github/workflows/deploy.yml`）。
`vite.config.ts` 里的 `base` 需与仓库名一致（当前为 `/python-dojo/`）。

## 许可

MIT
