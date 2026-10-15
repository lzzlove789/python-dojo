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
}

export interface Runner {
  run(req: RunRequest): Promise<RunResult>;
}

export type CheckRule =
  | { type: "noError"; label: string }
  | { type: "stdoutEquals"; expected: string; label: string }
  /** example：给用户看的期望输出样例（正则本身不适合展示），没通过时用来和实际输出对比 */
  | { type: "stdoutMatches"; pattern: string; label: string; example?: string }
  | { type: "codeMatches"; pattern: string; label: string }
  | { type: "codeForbids"; pattern: string; label: string }
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
