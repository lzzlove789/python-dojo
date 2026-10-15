import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDraftSaver } from "./draftSaver";

describe("createDraftSaver", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("连续输入只在停手后保存一次，且保存最后的内容", () => {
    const save = vi.fn();
    const s = createDraftSaver(save, 400);
    s.queue("level1", "a");
    s.queue("level1", "ab");
    s.queue("level1", "abc");
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(399);
    expect(save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("level1", "abc");
  });

  it("切关：旧关卡待保存的内容不会被新关卡的写入覆盖掉", () => {
    const save = vi.fn();
    const s = createDraftSaver(save);
    s.queue("level1", "我写到一半的代码");
    s.queue("level2", "starter2");
    vi.runAllTimers();
    expect(save).toHaveBeenCalledWith("level1", "我写到一半的代码");
    expect(save).toHaveBeenCalledWith("level2", "starter2");
  });

  it("flush 立即写入并取消定时器", () => {
    const save = vi.fn();
    const s = createDraftSaver(save);
    s.queue("level1", "x");
    s.flush();
    expect(save).toHaveBeenCalledTimes(1);
    vi.runAllTimers();
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("没有待保存内容时 flush 什么也不做", () => {
    const save = vi.fn();
    createDraftSaver(save).flush();
    expect(save).not.toHaveBeenCalled();
  });
});
