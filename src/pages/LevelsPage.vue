<template>
  <div class="levels-page">
    <pre class="ascii-banner">{{
`  ____        _   _
 |  _ \ _   _| |_| |__   ___  _ __
 | |_) | | | | __| '_ \ / _ \| '_ \
 |  __/| |_| | |_| | | | (_) | | | |
 |_|    \__, |\__|_| |_|\___/|_| |_|
        |___/`
    }}</pre>
    <p class="banner-subtitle">Python 练功房 · 选择关卡</p>

    <div class="chapters">
      <div v-for="ch in chapters" :key="ch.chapter" class="chapter-card">
        <div class="chapter-bar" :class="'chapter-color-' + ch.chapter">
          <h2 class="chapter-name">{{ ch.title }}</h2>
          <div class="chapter-progress">
            <span class="progress-text">已通关 {{ ch.passedCount }}/{{ ch.totalCount }}</span>
            <div class="progress-bar">
              <div
                v-for="lv in ch.levels"
                :key="lv.key"
                class="progress-segment"
                :class="{ passed: store.isPassed(lv.key) }"
                :title="lv.title"
              ></div>
            </div>
          </div>
        </div>
        <div class="level-grid-wrapper">
          <LevelGrid :levels="ch.levels" @select="enterLevel" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "../stores/global";
import { mainLevels } from "../levels";
import type { LevelType } from "../core/types";
import LevelGrid from "../components/LevelGrid.vue";

const router = useRouter();
const store = useGlobalStore();

const chapters = computed(() => {
  const map = new Map<number, { chapter: number; title: string; levels: LevelType[] }>();
  for (const lv of mainLevels) {
    if (!map.has(lv.chapter)) {
      map.set(lv.chapter, { chapter: lv.chapter, title: lv.chapterTitle, levels: [] });
    }
    map.get(lv.chapter)!.levels.push(lv);
  }
  return Array.from(map.values()).map((ch) => ({
    ...ch,
    passedCount: ch.levels.filter((lv) => store.isPassed(lv.key)).length,
    totalCount: ch.levels.length,
  }));
});

function enterLevel(key: string) {
  store.setCurrentLevel(key);
  router.push("/");
}
</script>

<style scoped>
.levels-page {
  padding: 40px 32px 60px;
  max-width: 1120px;
  margin: 0 auto;
  overflow: auto;
  height: 100%;
}

.ascii-banner {
  font-family: var(--font-mono);
  color: var(--green);
  font-size: 12px;
  line-height: 1.25;
  white-space: pre;
  margin: 0 auto;
  text-align: center;
  overflow-x: auto;
  text-shadow: 0 0 14px rgba(184, 187, 38, 0.3);
  animation: banner-in 0.7s ease both;
}

.banner-subtitle {
  text-align: center;
  color: var(--fg-dim);
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: 6px;
  margin: 16px 0 44px;
  animation: banner-in 0.7s ease 0.1s both;
}

.chapters {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.chapter-card {
  background: var(--bg-dark);
  border: var(--ld-panel-border);
  border-radius: var(--ld-radius-lg);
  overflow: hidden;
  box-shadow: var(--ld-shadow-panel);
  animation: rise 0.5s ease both;
}

.chapter-card:nth-child(2) {
  animation-delay: 0.06s;
}
.chapter-card:nth-child(3) {
  animation-delay: 0.12s;
}
.chapter-card:nth-child(4) {
  animation-delay: 0.18s;
}

.chapter-bar {
  padding: 14px 22px;
  border-left: 4px solid;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.chapter-color-1 {
  border-left-color: var(--green);
}

.chapter-color-2 {
  border-left-color: var(--yellow);
}

.chapter-color-3 {
  border-left-color: var(--orange);
}

.chapter-color-4 {
  border-left-color: var(--red);
}

.chapter-name {
  color: var(--fg-bright);
  font-size: 17px;
  letter-spacing: 2px;
  font-family: var(--font-display);
  white-space: nowrap;
}

.chapter-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.progress-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--yellow);
  white-space: nowrap;
}

.progress-bar {
  display: flex;
  gap: 3px;
}

.progress-segment {
  width: 14px;
  height: 6px;
  background: var(--bg-light);
  border-radius: 2px;
  transition: background 0.3s, box-shadow 0.3s;
}

.progress-segment.passed {
  background: var(--ld-progress-done);
  box-shadow: 0 0 4px rgba(184, 187, 38, 0.4);
}

.level-grid-wrapper {
  padding: 14px 18px 20px;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes banner-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
</style>
