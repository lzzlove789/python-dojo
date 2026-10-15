import { describe, it, expect } from "vitest";
import MarkdownIt from "markdown-it";

// QuestionBoard.vue 用 v-html 渲染教程，这里锁定它的 markdown-it 配置：原始 HTML 必须被转义
const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

describe("教程 markdown 渲染的 XSS 防护", () => {
  it("<script> 与事件处理器被转义成纯文本", () => {
    const out = md.render('<script>alert(1)</script>\n\n<img src=x onerror="alert(1)">');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<img");
    expect(out).toContain("&lt;script&gt;");
  });

  it("javascript: 链接不会生成可点击的 href", () => {
    const out = md.render("[点我](javascript:alert(1))");
    expect(out).not.toContain('href="javascript:');
  });
});
