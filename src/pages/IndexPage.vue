<template>
  <div class="index-page">
    <div class="panel-left">
      <QuestionBoard :level="currentLevel" @navigate="onNavigate" @load="onLoadExample" />
    </div>
    <div class="panel-center">
      <div class="toolbar">
        <span class="toolbar-title">{{ currentLevel.chapterTitle }} · {{ currentLevel.title }}</span>
        <span class="toolbar-spacer"></span>
        <button class="run-btn" :disabled="running" @click="onRun">
          ▶ 运行 <span class="run-key">Ctrl+Enter</span>
        </button>
      </div>
      <div class="editor-wrap">
        <CodeEditor v-model="code" @run="onRun" />
      </div>
      <div class="output-wrap">
        <OutputPanel :result="result" :running="running" :status="status" />
      </div>
    </div>
    <div class="panel-right">
      <TaskAssist
        :results="checkResults"
        :rules="currentLevel.checks"
        :hint="currentLevel.hint"
        :answer="currentLevel.answer"
        @reset="onReset"
      />
    </div>

    <CelebrationModal
      v-if="showCelebration"
      :level="currentLevel"
      @close="showCelebration = false"
      @next="onNextLevel"
      @levels="onGoLevels"
      @stay="showCelebration = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "../stores/global";
import { getLevel, mainLevels } from "../levels";
import { checkRules, collectProbes, allPassed } from "../core/checker";
import type { CheckResult } from "../core/checker";
import type { RunResult } from "../core/types";
import { getRunner } from "../core/pyRunner";
import type { RunnerStatus } from "../core/pyRunner";
import CodeEditor from "../components/CodeEditor.vue";
import OutputPanel from "../components/OutputPanel.vue";
import QuestionBoard from "../components/QuestionBoard.vue";
import TaskAssist from "../components/TaskAssist.vue";
import CelebrationModal from "../components/CelebrationModal.vue";

const store = useGlobalStore();
const router = useRouter();
const runner = getRunner();

const currentLevel = computed(() => getLevel(store.currentLevelKey) ?? mainLevels[0]);

const code = ref("");
const result = ref<RunResult | null>(null);
const checkResults = ref<CheckResult[]>([]);
const running = ref(false);
const showCelebration = ref(false);
const status = ref<RunnerStatus>(runner.status);
runner.onStatus = (s) => (status.value = s);

let alreadyPassed = false;

function applyLevel(key: string) {
  const lv = getLevel(key);
  if (!lv) return;
  code.value = store.drafts[key] ?? lv.starter;
  result.value = null;
  checkResults.value = [];
  showCelebration.value = false;
  alreadyPassed = store.isPassed(key);
}

watch(() => store.currentLevelKey, applyLevel, { immediate: true });

// 代码草稿自动保存，刷新页面不丢
watch(code, (v) => store.saveDraft(currentLevel.value.key, v));

async function onRun() {
  if (running.value) return;
  const lv = currentLevel.value;
  const submitted = code.value;
  running.value = true;
  try {
    const r = await runner.run({ code: submitted, stdin: lv.stdin, probes: collectProbes(lv.checks) });
    // 运行期间切关了就丢弃结果
    if (lv.key !== currentLevel.value.key) return;
    result.value = r;
    const results = checkRules(submitted, r, lv.checks);
    checkResults.value = results;
    if (allPassed(results)) {
      if (!alreadyPassed) {
        alreadyPassed = true;
        store.passLevel(lv.key);
        showCelebration.value = true;
      }
    }
  } finally {
    running.value = false;
  }
}

function onLoadExample(example: string) {
  code.value = example;
}

function onNavigate(key: string) {
  store.setCurrentLevel(key);
}

function onReset() {
  store.clearDraft(currentLevel.value.key);
  applyLevel(currentLevel.value.key);
}

function onNextLevel() {
  showCelebration.value = false;
  const idx = mainLevels.findIndex((l) => l.key === store.currentLevelKey);
  if (idx < mainLevels.length - 1) store.setCurrentLevel(mainLevels[idx + 1].key);
}

function onGoLevels() {
  showCelebration.value = false;
  router.push("/levels");
}
</script>

<style scoped>
.index-page {
  display: flex;
  gap: var(--ld-panel-gap);
  height: 100%;
  padding: var(--ld-sp-5) var(--ld-sp-6);
  overflow: hidden;
}

.panel-left,
.panel-center,
.panel-right {
  border: var(--ld-panel-border);
  border-radius: var(--ld-content-radius);
  background: var(--bg-dark);
  box-shadow: var(--ld-shadow-panel);
  overflow: hidden;
}

.panel-left {
  width: 28%;
  min-width: 240px;
  animation: panel-in 0.45s ease both;
}

.panel-center {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  animation: panel-in 0.45s ease 0.06s both;
}

.panel-right {
  width: 22%;
  min-width: 220px;
  animation: panel-in 0.45s ease 0.12s both;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  background: var(--bg-dark);
  border-bottom: 1px solid var(--bg-light);
  flex-shrink: 0;
}

.toolbar-title {
  color: var(--fg-dim);
  font-size: 12px;
}

.toolbar-spacer {
  flex: 1;
}

.run-btn {
  padding: 6px 16px;
  background: var(--green);
  border: none;
  border-radius: 4px;
  color: var(--bg-darkest);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.run-key {
  margin-left: 6px;
  font-size: 11px;
  font-weight: normal;
  opacity: 0.7;
}

.editor-wrap {
  flex: 3;
  min-height: 0;
}

.output-wrap {
  flex: 2;
  min-height: 0;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 1199px) {
  .panel-left {
    width: 25%;
    min-width: 200px;
  }

  .panel-right {
    width: 20%;
    min-width: 180px;
  }
}

@media (max-width: 767px) {
  .index-page {
    flex-direction: column;
    overflow-y: auto;
  }

  .panel-left,
  .panel-center,
  .panel-right {
    width: 100%;
    min-width: unset;
    min-height: 300px;
  }

  .panel-center {
    min-height: 480px;
  }
}
</style>
