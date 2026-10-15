import { describe, it, expect } from "vitest";
import { CSP, CSP_DIRECTIVES, buildCsp } from "./csp";

// CSP 是项目最重要的安全边界（见 csp.ts 里的说明），这里锁定关键指令，防止以后改配置时不小心放宽。
describe("CSP 配置", () => {
  const d = CSP_DIRECTIVES;

  it("connect-src 只允许同源：用户代码无法联网外传数据", () => {
    expect(d["connect-src"]).toEqual(["'self'"]);
  });

  it("script-src 不允许 unsafe-eval / unsafe-inline / 通配 / 外部域名 / data:", () => {
    const v = d["script-src"].join(" ");
    expect(v).toContain("'self'");
    expect(v).toContain("'wasm-unsafe-eval'"); // Pyodide 必需
    expect(v).not.toMatch(/'unsafe-eval'|'unsafe-inline'|\*|https?:|data:/);
  });

  it("worker-src 只允许同源和 blob:（运行用户代码的 Worker 以 blob 创建，才能继承这份 CSP）", () => {
    expect([...d["worker-src"]].sort()).toEqual(["'self'", "blob:"]);
  });

  it("禁用 object / base / form 提交", () => {
    expect(d["object-src"]).toEqual(["'none'"]);
    expect(d["base-uri"]).toEqual(["'none'"]);
    expect(d["form-action"]).toEqual(["'none'"]);
  });

  it("default-src 兜底为同源", () => {
    expect(d["default-src"]).toEqual(["'self'"]);
  });

  it("任何指令都不含通配符 *，也不含明文 http:", () => {
    for (const [name, values] of Object.entries(d)) {
      for (const v of values) {
        expect(v, `${name} ${v}`).not.toBe("*");
        expect(v, `${name} ${v}`).not.toMatch(/^http:/);
      }
    }
  });

  it("外部域名只剩 Google Fonts（样式与字体），其余全部同源", () => {
    const external = Object.values(d)
      .flat()
      .filter((v) => /^https:/.test(v));
    expect(external.sort()).toEqual(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
  });

  it("buildCsp 生成的字符串可以被浏览器直接使用", () => {
    expect(CSP).toContain("connect-src 'self'");
    expect(CSP).not.toMatch(/;\s*;/);
    expect(buildCsp({ "a-src": ["x", "y"], "b-src": ["z"] })).toBe("a-src x y; b-src z");
  });
});
