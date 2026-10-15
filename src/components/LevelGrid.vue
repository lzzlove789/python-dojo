<template>
  <div class="level-grid">
    <div
      v-for="lv in levels"
      :key="lv.key"
      class="level-cell"
      :class="{
        passed: store.isPassed(lv.key),
        current: lv.key === currentKey,
      }"
      :title="lv.title"
      @click="$emit('select', lv.key)"
    >
      <span v-if="store.isPassed(lv.key)" class="cell-check">✓</span>
      <span v-else class="cell-no">{{ lv.key.replace('level', '') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from "../stores/global";
import type { LevelType } from "../core/types";

const store = useGlobalStore();

defineProps<{
  levels: LevelType[];
  currentKey?: string;
}>();

defineEmits<{
  (e: 'select', key: string): void;
}>();
</script>

<style scoped>
.level-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.level-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ld-progress-locked);
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--fg-dim);
  transition: all 0.2s ease;
  position: relative;
}

.level-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.level-cell.passed {
  background: var(--ld-progress-done);
  color: #1d2021;
  font-weight: bold;
}

.level-cell.current {
  border: 2px solid var(--ld-progress-current);
  box-shadow: 0 0 8px rgba(254, 128, 25, 0.4);
}

.cell-check {
  font-size: 14px;
}

.cell-no {
  font-size: 11px;
}
</style>
