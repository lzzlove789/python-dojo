import type { RunRequest } from "./types";

/** 运行时资源上限：防止超长代码 / 无限输出把页面卡死 */
export const MAX_CODE_CHARS = 50_000;
export const MAX_STDIN_CHARS = 10_000;
export const MAX_OUTPUT_BYTES = 100_000;

/** 请求不合法时返回给用户看的原因，合法返回 null */
export function validateRequest(req: RunRequest): string | null {
  if (req.code.length > MAX_CODE_CHARS) {
    return `代码太长了（超过 ${MAX_CODE_CHARS} 个字符），请精简后再运行`;
  }
  if ((req.stdin ?? "").length > MAX_STDIN_CHARS) {
    return `输入内容太长了（超过 ${MAX_STDIN_CHARS} 个字符）`;
  }
  return null;
}
