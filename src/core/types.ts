export interface RunRequest {
  code: string;
  /** 喂给 input() 的内容，按行消费 */
  stdin?: string;
  /** 代码运行结束后，在其命名空间里求值的 Python 表达式 */
  probes?: string[];
}

export interface ProbeResult {
  expr: string;
  ok: boolean;
  /** 表达式结果经 json 序列化后的值（tuple 会变成 list） */
  value?: unknown;
  error?: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  /** 用户代码抛出的异常（已去掉 Pyodide 内部栈帧）；无异常为 null */
  error: string | null;
  timedOut: boolean;
  probes: ProbeResult[];
  /** 输出超过上限被截断 */
  truncated?: boolean;
  /** 引擎自身出错（不是用户代码的错）：主线程应该重建 Worker */
  engineFailed?: boolean;
  /** 对用户源码做 AST 分析的结果（代码检查规则据此判断，而不是对源码文本做正则） */
  ast?: AstInfo;
}

/**
 * 用户源码的 AST 摘要，由 Worker 里的 Python `ast` 生成。
 * 语法错误时只有 `ok: false`。
 */
export interface AstInfo {
  ok: boolean;
  /** 语法节点类型 -> 出现次数，如 For、While、ListComp、FloorDiv、JoinedStr……；
   *  另有两个派生项：Elif（else 里嵌套的 if）、BareExcept（`except:` 不带异常类型） */
  nodes?: Record<string, number>;
  /** 被调用的函数/方法名（取最后一段：`re.sub()` -> "sub"，`super().__init__()` -> "super().__init__"） */
  calls?: string[];
  /** 导入的顶层模块名：`import os.path` / `from os import x` -> "os" */
  imports?: string[];
  /** 被读取的变量名 */
  names?: string[];
  /** 函数调用里的关键字参数；const 为 true 时 value 是字面量的值 */
  keywords?: Array<{ call: string; arg: string; const: boolean; value: unknown }>;
  /** 带 `*xs` / `**kw` 展开的调用 */
  stars?: Array<{ callee: string; kind: "*" | "**" }>;
  /** 被装饰器修饰的函数/类 */
  decorated?: Array<{ func: string; decorator: string }>;
  /** 定义的函数，以及它们是否声明了 *args / **kwargs */
  functions?: Array<{ name: string; vararg: boolean; kwarg: boolean }>;
}

export interface Runner {
  run(req: RunRequest): Promise<RunResult>;
}

export type CheckRule =
  | { type: "noError"; label: string }
  | { type: "stdoutEquals"; expected: string; label: string }
  /** example：给用户看的期望输出样例（正则本身不适合展示），没通过时用来和实际输出对比 */
  | { type: "stdoutMatches"; pattern: string; label: string; example?: string }
  // ---- 以下是对用户源码的结构检查，基于 AST（见 AstInfo），不对源码文本做正则 ----
  /** 用到了列出的任意一种：语法节点（如 "For"）、被调用的函数/方法（如 "append"）、导入的模块（如 "math"） */
  | { type: "uses"; nodes?: string[]; calls?: string[]; imports?: string[]; label: string }
  /** 一个都不能用到（参数同 uses） */
  | { type: "forbids"; nodes?: string[]; calls?: string[]; imports?: string[]; label: string }
  /** 列出的变量名都被读取过（用来要求“是用变量算出来的”，而不是直接写死结果） */
  | { type: "usesNames"; names: string[]; label: string }
  /** 某个调用带了关键字参数；call 省略表示任意调用；equals 给出时要求字面量值相等 */
  | { type: "hasKeyword"; keyword: string; call?: string; equals?: unknown; label: string }
  /** 调用 callee 时用了 `*xs`（kind "*"）或 `**kw`（kind "**"）展开 */
  | { type: "usesStar"; callee: string; kind: "*" | "**"; label: string }
  /** 函数/类 func 被装饰器 decorator 修饰 */
  | { type: "decoratedWith"; func: string; decorator: string; label: string }
  /** 定义了一个满足条件的函数（可要求声明了 *args 和/或 **kwargs） */
  | { type: "definesFunction"; varargs?: boolean; kwargs?: boolean; label: string }
  /** 在代码运行后的命名空间里求值 expr，与 equals 做深度比较（既可测变量也可测函数调用） */
  | { type: "exprEquals"; expr: string; equals: unknown; label: string };

export interface Example {
  /** 示例代码，可一键载入编辑器 */
  code: string;
  description?: string;
}

export interface LevelType {
  key: string;
  title: string;
  chapter: number;
  chapterTitle: string;
  /** 编辑器初始代码 */
  starter: string;
  /** 喂给 input() 的固定输入 */
  stdin?: string;
  hint: string;
  /** 参考答案（完整代码） */
  answer: string;
  checks: CheckRule[];
  scenario?: string;
  examples?: Example[];
}
