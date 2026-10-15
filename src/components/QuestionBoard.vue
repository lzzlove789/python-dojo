<template>
  <div class="question-board">
    <div class="tutorial-content">
      <div class="tutorial-header">
        <h2 class="tutorial-title">{{ level.title }}</h2>
        <p v-if="level.scenario" class="tutorial-scenario">📍 {{ level.scenario }}</p>
      </div>
      <div class="markdown-body" v-html="renderedContent"></div>
      <ExampleBox
        v-if="level.examples?.length"
        :key="level.key"
        :examples="level.examples"
        @load="(code) => emit('load', code)"
      />
    </div>

    <div class="nav-buttons">
      <button
        class="nav-btn nav-prev"
        :disabled="!prevLevelKey"
        @click="goPrev"
      >
        ← 上一关
      </button>
      <button
        class="nav-btn nav-next"
        :disabled="!nextLevelKey"
        @click="goNext"
      >
        下一关 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import MarkdownIt from "markdown-it";
import type { LevelType } from "../core/types";
import { nextLevel, prevLevel, loadLevelContent } from "../levels";
import ExampleBox from "./ExampleBox.vue";

const props = defineProps<{ level: LevelType }>();
const emit = defineEmits<{
  (e: "navigate", key: string): void;
  (e: "load", code: string): void;
}>();

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });
const loadedContent = ref("");
const renderedContent = computed(() => md.render(loadedContent.value));

let contentLoadSeq = 0;
watch(
  () => props.level.key,
  async (key) => {
    const seq = ++contentLoadSeq;
    loadedContent.value = "";
    const content = await loadLevelContent(key);
    if (seq === contentLoadSeq) loadedContent.value = content;
  },
  { immediate: true }
);

const prevLevelKey = computed(() => {
  const p = prevLevel(props.level.key);
  return p ? p.key : null;
});
const nextLevelKey = computed(() => {
  const n = nextLevel(props.level.key);
  return n ? n.key : null;
});

function goPrev() {
  if (prevLevelKey.value) emit("navigate", prevLevelKey.value);
}
function goNext() {
  if (nextLevelKey.value) emit("navigate", nextLevelKey.value);
}
</script>

<style scoped>
.question-board {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-dark);
}

.tutorial-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 28px 30px;
  min-width: 0;
}

.tutorial-header {
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px dashed var(--bg-light);
}

.tutorial-title {
  color: var(--orange);
  font-size: 18px;
  line-height: 1.35;
  font-family: var(--font-mono);
  letter-spacing: 1px;
  font-weight: bold;
  margin: 0;
}

.tutorial-scenario {
  margin-top: 10px;
  padding: 8px 14px;
  background: rgba(254, 128, 25, 0.08);
  border-left: 3px solid var(--orange);
  border-radius: var(--ld-radius-sm);
  color: var(--fg);
  font-size: 13px;
  line-height: 1.6;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: var(--ld-sp-4);
  padding: 14px 18px;
  border-top: 1px solid var(--bg-light);
  background: var(--bg-darkest);
  flex-shrink: 0;
}

.nav-btn {
  padding: 9px 22px;
  background: var(--bg-mid);
  border: 1px solid var(--bg-light);
  color: var(--fg);
  cursor: pointer;
  border-radius: var(--ld-radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: var(--bg-light);
  color: var(--orange);
  border-color: var(--orange);
}

.nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
