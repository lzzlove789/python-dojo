import { describe, it, expect } from "vitest";
import { guardFrame } from "./frameGuard";

function fakeDoc() {
  let removed = false;
  return {
    doc: { getElementById: () => ({ remove: () => (removed = true) }) } as unknown as Document,
    wasRemoved: () => removed,
  };
}

describe("guardFrame", () => {
  it("顶层窗口：放行并移除隐藏样式", () => {
    const self = {} as Window;
    const win = { top: self, self } as unknown as Window;
    const { doc, wasRemoved } = fakeDoc();
    expect(guardFrame(win, doc)).toBe(true);
    expect(wasRemoved()).toBe(true);
  });

  it("被嵌入：尝试跳转顶层，页面保持隐藏", () => {
    const top = { location: { href: "https://evil.example/" } };
    const win = { top, self: { location: { href: "https://me.example/python-dojo/" } } } as unknown as Window;
    const { doc, wasRemoved } = fakeDoc();
    expect(guardFrame(win, doc)).toBe(false);
    expect(wasRemoved()).toBe(false);
    expect(top.location.href).toBe("https://me.example/python-dojo/");
  });

  it("顶层地址不允许修改（抛异常）时不崩溃，仍保持隐藏", () => {
    const top = {
      get location(): never {
        throw new Error("SecurityError");
      },
    };
    const win = { top, self: { location: { href: "x" } } } as unknown as Window;
    const { doc } = fakeDoc();
    expect(guardFrame(win, doc)).toBe(false);
  });
});
