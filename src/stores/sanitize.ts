import { MAX_CODE_CHARS } from "../core/limits";

export interface PersistedState {
  passedLevels: string[];
  currentLevelKey: string;
  drafts: Record<string, string>;
}

const MAX_DRAFTS = 100;
const MAX_KEY_LENGTH = 50;

/**
 * localStorage 里的数据用户自己能改，也可能因版本升级过期。
 * 恢复后统一校验：类型不对、关卡已不存在、体积过大的一律丢弃，避免脏数据让页面白屏。
 */
export function sanitizeState(raw: unknown, validKeys: string[]): PersistedState {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const valid = new Set(validKeys);

  const passedLevels = Array.isArray(r.passedLevels)
    ? [...new Set(r.passedLevels.filter((k): k is string => typeof k === "string" && valid.has(k)))]
    : [];

  const currentLevelKey =
    typeof r.currentLevelKey === "string" && valid.has(r.currentLevelKey) ? r.currentLevelKey : validKeys[0];

  const drafts: Record<string, string> = {};
  if (typeof r.drafts === "object" && r.drafts !== null && !Array.isArray(r.drafts)) {
    for (const [k, v] of Object.entries(r.drafts as Record<string, unknown>)) {
      if (Object.keys(drafts).length >= MAX_DRAFTS) break;
      if (k.length > MAX_KEY_LENGTH || typeof v !== "string" || v.length > MAX_CODE_CHARS) continue;
      if (k !== "playground" && !valid.has(k)) continue;
      drafts[k] = v;
    }
  }

  return { passedLevels, currentLevelKey, drafts };
}
