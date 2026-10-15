import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGlobalStore, STORAGE_KEY } from "./global";
import { MAX_CODE_CHARS } from "../core/limits";

describe("useGlobalStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("localStorage 的 key 带项目前缀，不与同一 github.io 下的其他项目冲突", () => {
    expect(STORAGE_KEY).toMatch(/^python-dojo/);
    expect(STORAGE_KEY).not.toBe("global");
  });

  it("初始状态：无通关记录、当前关为第一关", () => {
    const store = useGlobalStore();
    expect(store.passedLevels).toEqual([]);
    expect(store.currentLevelKey).toBe("level1");
  });

  it("passLevel 去重，passedCount 正确", () => {
    const store = useGlobalStore();
    store.passLevel("level1");
    store.passLevel("level1");
    expect(store.passedCount).toBe(1);
    expect(store.isPassed("level1")).toBe(true);
  });

  it("草稿可保存与清除", () => {
    const store = useGlobalStore();
    store.saveDraft("level1", "print(1)");
    expect(store.drafts.level1).toBe("print(1)");
    store.clearDraft("level1");
    expect(store.drafts.level1).toBeUndefined();
  });

  it("saveDraft 拒绝超长代码和未知的键", () => {
    const store = useGlobalStore();
    store.saveDraft("level1", "a".repeat(MAX_CODE_CHARS + 1));
    store.saveDraft("not-a-level", "x");
    expect(store.drafts).toEqual({});
    store.saveDraft("playground", "ok");
    expect(store.drafts.playground).toBe("ok");
  });

  it("resetProgress 清空一切", () => {
    const store = useGlobalStore();
    store.passLevel("level1");
    store.saveDraft("level1", "x");
    store.resetProgress();
    expect(store.passedLevels).toEqual([]);
    expect(store.drafts).toEqual({});
  });
});
