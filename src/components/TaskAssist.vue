<template>
  <div class="task-assist">
    <div class="assist-tabs">
      <button
        class="assist-tab"
        :class="{ active: activeTab === 'checklist' }"
        @click="switchTab('checklist')"
      >
        检查清单
      </button>
      <button
        class="assist-tab"
        :class="{ active: activeTab === 'hint' }"
        @click="switchTab('hint')"
      >
        提示
      </button>
      <button
        class="assist-tab"
        :class="{ active: activeTab === 'answer' }"
        @click="switchTab('answer')"
      >
        参考答案
      </button>
      <button class="assist-tab assist-reset" @click="onReset">重置</button>
    </div>
    <div class="assist-content">
      <div v-show="activeTab === 'checklist'">
        <CheckList :results="displayResults" />
      </div>
      <div v-show="activeTab === 'hint'" class="assist-hint">
        <div class="hint-box">{{ hint }}</div>
      </div>
      <div v-show="activeTab === 'answer'" class="assist-answer">
        <button
          v-if="!showAnswer"
          class="show-answer-btn"
          @click="showAnswer = true"
        >
          点击查看参考答案（建议先自己尝试）
        </button>
        <pre v-else class="answer-code">{{ answer }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import CheckList from "./CheckList.vue";
import type { CheckResult } from "../core/checker";
import type { CheckRule } from "../core/types";

const props = defineProps<{
  results: CheckResult[];
  hint: string;
  answer: string;
  rules?: CheckRule[];
}>();
const emit = defineEmits<{ (e: "reset"): void }>();

type TabKey = "checklist" | "hint" | "answer";
const activeTab = ref<TabKey>("checklist");
const showAnswer = ref(false);

const displayResults = computed<CheckResult[]>(() => {
  if (props.results.length > 0) return props.results;
  return (props.rules ?? []).map((rule) => ({ rule, passed: false }));
});

// 关卡切换时重置参考答案折叠状态
watch(
  () => props.answer,
  () => {
    showAnswer.value = false;
  }
);

function switchTab(tab: TabKey) {
  activeTab.value = tab;
}

function onReset() {
  emit("reset");
}
</script>

<style scoped>
.task-assist {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.assist-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-dark);
  padding: 10px 16px 0;
  flex-shrink: 0;
}

.assist-tab {
  flex: 1;
  padding: 10px 8px 12px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--fg-dim);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: color 0.2s, border-color 0.2s;
}

.assist-tab.active {
  color: var(--orange);
  border-bottom-color: var(--orange);
}

.assist-tab:hover {
  color: var(--fg);
}

.assist-reset {
  color: var(--red);
  flex: 0 0 auto;
  flex-basis: 72px;
}

.assist-content {
  flex: 1;
  overflow: auto;
  background: var(--bg-dark);
}

.assist-hint {
  padding: 18px 20px;
}

.hint-box {
  padding: 14px 18px;
  background: var(--bg-mid);
  border-left: 3px solid var(--yellow);
  color: var(--fg);
  font-size: 14px;
  line-height: 1.8;
  border-radius: var(--ld-radius-sm);
}

.assist-answer {
  padding: 18px 20px;
  text-align: center;
}

.show-answer-btn {
  padding: 10px 22px;
  background: var(--bg-mid);
  border: 1px dashed var(--fg-dim);
  color: var(--fg-dim);
  cursor: pointer;
  border-radius: var(--ld-radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.show-answer-btn:hover {
  color: var(--orange);
  border-color: var(--orange);
  background: rgba(254, 128, 25, 0.06);
}

.answer-code {
  background: var(--bg-darkest);
  padding: 16px 18px;
  border: 1px solid var(--bg-light);
  border-radius: 8px;
  text-align: left;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--green);
}
</style>
