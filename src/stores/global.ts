import { defineStore } from "pinia";
import { mainLevels } from "../levels";
import { sanitizeState } from "./sanitize";
import { MAX_CODE_CHARS } from "../core/limits";

export const STORAGE_KEY = "python-dojo:state";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    passedLevels: [] as string[],
    currentLevelKey: mainLevels[0]?.key ?? "level1",
    /** 每关用户写到一半的代码，刷新页面不丢 */
    drafts: {} as Record<string, string>,
  }),
  getters: {
    isPassed: (state) => (key: string) => state.passedLevels.includes(key),
    passedCount: (state) => state.passedLevels.length,
    totalLevels: () => mainLevels.length,
  },
  actions: {
    passLevel(key: string) {
      if (!this.passedLevels.includes(key)) {
        this.passedLevels.push(key);
      }
    },
    setCurrentLevel(key: string) {
      this.currentLevelKey = key;
    },
    saveDraft(key: string, code: string) {
      // 与恢复时的校验（sanitize.ts）保持一致：否则存进去的东西下次恢复时会被丢掉，
      // 超大的草稿还会撑爆 localStorage 的 5MB 配额，导致连通关进度都存不进去
      if (code.length > MAX_CODE_CHARS) return;
      if (key !== "playground" && !mainLevels.some((l) => l.key === key)) return;
      this.drafts[key] = code;
    },
    clearDraft(key: string) {
      delete this.drafts[key];
    },
    resetProgress() {
      this.passedLevels = [];
      this.drafts = {};
      this.currentLevelKey = mainLevels[0]?.key ?? "level1";
    },
  },
  persist: {
    // 必须带项目前缀：GitHub Pages 的所有项目（xxx.github.io/项目A、/项目B）共用同一个 origin，
    // 也就共用同一份 localStorage。默认 key 是 store 的 id（"global"），会和同一账号下
    // 其他用了同名 store 的项目（比如 linux-dojo）互相覆盖进度
    key: STORAGE_KEY,
    // 恢复后校验：localStorage 可被用户改动或因版本升级过期
    afterRestore: (ctx) => {
      const clean = sanitizeState(ctx.store.$state, mainLevels.map((l) => l.key));
      ctx.store.passedLevels = clean.passedLevels;
      ctx.store.currentLevelKey = clean.currentLevelKey;
      ctx.store.drafts = clean.drafts;
    },
  },
});
