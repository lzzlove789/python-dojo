import type { LevelType } from "../core/types";
import { mainLevels } from "./mainLevels";

export { mainLevels };
export { loadLevelContent } from "./contentLoader";

export function getLevel(key: string): LevelType | undefined {
  return mainLevels.find((l) => l.key === key);
}

export function getLevelIndex(key: string): number {
  return mainLevels.findIndex((l) => l.key === key);
}

export function nextLevel(key: string): LevelType | undefined {
  const i = getLevelIndex(key);
  return i >= 0 && i < mainLevels.length - 1 ? mainLevels[i + 1] : undefined;
}

export function prevLevel(key: string): LevelType | undefined {
  const i = getLevelIndex(key);
  return i > 0 ? mainLevels[i - 1] : undefined;
}
