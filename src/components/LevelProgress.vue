<template>
  <div class="level-progress">
    <span class="progress-text">已通关 {{ passedCount }}/{{ totalLevels }}</span>
    <div class="progress-cells">
      <div
        v-for="(group, gi) in chapterGroups"
        :key="gi"
        class="chapter-group"
      >
        <div
          v-if="gi > 0"
          class="chapter-sep"
          :title="group.title"
        ></div>
        <button
          v-for="lv in group.levels"
          :key="lv.key"
          class="progress-cell"
          :class="{
            passed: store.isPassed(lv.key),
            current: lv.key === currentKey,
          }"
          :title="`${group.title} - ${lv.title}`"
          @click="onSelect(lv.key)"
        >
          <span v-if="store.isPassed(lv.key)" class="cell-check">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGlobalStore } from "../stores/global";
import { mainLevels } from "../levels";
import type { LevelType } from "../core/types";

const store = useGlobalStore();
const route = useRoute();
const router = useRouter();

const passedCount = computed(() => store.passedCount);
const totalLevels = computed(() => store.totalLevels);
const currentKey = computed(() => store.currentLevelKey);

interface ChapterGroup {
  chapter: number;
  title: string;
  levels: LevelType[];
}

const chapterGroups = computed<ChapterGroup[]>(() => {
  const map = new Map<number, ChapterGroup>();
  for (const lv of mainLevels) {
    if (!map.has(lv.chapter)) {
      map.set(lv.chapter, { chapter: lv.chapter, title: lv.chapterTitle, levels: [] });
    }
    map.get(lv.chapter)!.levels.push(lv);
  }
  return Array.from(map.values());
});

function onSelect(key: string) {
  if (route.path !== "/") {
    router.push("/");
  }
  store.setCurrentLevel(key);
}
</script>

<style scoped>
.level-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-dim);
  flex: 1;
  justify-content: flex-end;
  min-width: 0;
}

.progress-text {
  white-space: nowrap;
  color: var(--yellow);
  font-size: 12px;
  flex-shrink: 0;
}

.progress-cells {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.chapter-group {
  display: flex;
  gap: 3px;
}

.chapter-sep {
  width: 1px;
  height: 14px;
  background: var(--bg-light);
  margin: 0 4px;
  flex-shrink: 0;
}

.progress-cell {
  width: 14px;
  height: 14px;
  background: var(--bg-light);
  border: none;
  border-radius: 3px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.progress-cell:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.progress-cell.passed {
  background: var(--ld-progress-done);
}

.progress-cell.current {
  background: var(--ld-progress-current);
  box-shadow: 0 0 6px rgba(254, 128, 25, 0.5);
}

.cell-check {
  font-size: 9px;
  color: #1d2021;
  font-weight: bold;
  line-height: 1;
}
</style>
