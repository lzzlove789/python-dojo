import { defineStore } from "pinia";
import { mainLevels } from "../levels";
import { sanitizeState } from "./sanitize";

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
    // 恢复后校验：localStorage 可被用户改动或因版本升级过期
    afterRestore: (ctx) => {
      const clean = sanitizeState(ctx.store.$state, mainLevels.map((l) => l.key));
      ctx.store.passedLevels = clean.passedLevels;
      ctx.store.currentLevelKey = clean.currentLevelKey;
      ctx.store.drafts = clean.drafts;
    },
  },
});
