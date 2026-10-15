import { describe, it, expect } from "vitest";
import { sanitizeState } from "./sanitize";
import { MAX_CODE_CHARS } from "../core/limits";

const keys = ["level1", "level2", "level3"];

describe("sanitizeState", () => {
  it("正常数据原样保留", () => {
    const s = sanitizeState(
      { passedLevels: ["level1"], currentLevelKey: "level2", drafts: { level2: "x = 1", playground: "print(1)" } },
      keys
    );
    expect(s).toEqual({
      passedLevels: ["level1"],
      currentLevelKey: "level2",
      drafts: { level2: "x = 1", playground: "print(1)" },
    });
  });

  it("完全不是对象时回退到默认值", () => {
    for (const bad of [null, undefined, 42, "str", []]) {
      expect(sanitizeState(bad, keys)).toEqual({ passedLevels: [], currentLevelKey: "level1", drafts: {} });
    }
  });

  it("丢弃类型错误、已不存在的关卡、重复项", () => {
    const s = sanitizeState(
      { passedLevels: ["level1", "level1", "nope", 5, null], currentLevelKey: "gone", drafts: "oops" },
      keys
    );
    expect(s.passedLevels).toEqual(["level1"]);
    expect(s.currentLevelKey).toBe("level1");
    expect(s.drafts).toEqual({});
  });

  it("丢弃超长草稿、非字符串草稿、未知键", () => {
    const s = sanitizeState(
      {
        drafts: {
          level1: "a".repeat(MAX_CODE_CHARS + 1),
          level2: 123,
          unknown: "x",
          ["k".repeat(80)]: "x",
          level3: "ok",
        },
      },
      keys
    );
    expect(s.drafts).toEqual({ level3: "ok" });
  });

  it("原型污染式的键不会混进来", () => {
    const raw = JSON.parse('{"drafts": {"__proto__": "x", "level1": "ok"}}');
    const s = sanitizeState(raw, keys);
    expect(Object.keys(s.drafts)).toEqual(["level1"]);
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });
});
