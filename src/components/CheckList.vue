<template>
  <div class="check-list">
    <div v-if="allDone" class="check-banner">
      ✓ 本关通过！
    </div>
    <div class="check-list-header">
      <span class="check-title">通关条件</span>
      <span v-if="allDone" class="check-all-done">全部通过 ✓</span>
    </div>
    <ul class="check-items">
      <li
        v-for="(r, i) in results"
        :key="i"
        class="check-item"
        :class="{ passed: r.passed, pending: !r.passed }"
      >
        <span class="check-icon" :class="{ 'check-pop': r.passed }">
          {{ r.passed ? "☑" : "☐" }}
        </span>
        <div class="check-body">
          <span class="check-label">{{ r.rule.label }}</span>
          <div v-if="!r.passed && r.detail" class="check-detail">
            <template v-if="r.detail.expected !== undefined">
              <div class="detail-row">
                <span class="detail-tag">期望</span>
                <span class="detail-text">{{ diffOf(r.detail.expected, r.detail.actual).expected.head }}<mark class="diff-mark">{{ visible(diffOf(r.detail.expected, r.detail.actual).expected.mid) }}</mark>{{ diffOf(r.detail.expected, r.detail.actual).expected.tail }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-tag">实际</span>
                <span class="detail-text">{{ diffOf(r.detail.expected, r.detail.actual).actual.head }}<mark class="diff-mark">{{ visible(diffOf(r.detail.expected, r.detail.actual).actual.mid) }}</mark>{{ diffOf(r.detail.expected, r.detail.actual).actual.tail }}</span>
              </div>
            </template>
            <div v-else class="detail-row">
              <span class="detail-tag">实际</span>
              <span class="detail-text">{{ r.detail.actual }}</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CheckResult } from "../core/checker";

const props = defineProps<{ results: CheckResult[] }>();

interface Part { head: string; mid: string; tail: string }

/** 去掉共同前缀和共同后缀，剩下的 mid 就是两边真正不同的地方 */
function diffOf(expected: string, actual: string): { expected: Part; actual: Part } {
  let p = 0;
  while (p < expected.length && p < actual.length && expected[p] === actual[p]) p++;
  let s = 0;
  while (
    s < expected.length - p &&
    s < actual.length - p &&
    expected[expected.length - 1 - s] === actual[actual.length - 1 - s]
  ) s++;
  const split = (str: string): Part => ({
    head: str.slice(0, p),
    mid: str.slice(p, str.length - s),
    tail: str.slice(str.length - s),
  });
  return { expected: split(expected), actual: split(actual) };
}

/** 高亮片段为空（缺了东西）或只是空白时，换成看得见的符号 */
function visible(mid: string): string {
  if (mid === "") return "∅";
  return mid.replace(/ /g, "␣").replace(/\n/g, "↵");
}

const allDone = computed(
  () => props.results.length > 0 && props.results.every((r) => r.passed)
);
</script>

<style scoped>
.check-list {
  padding: 16px 20px 18px;
}

.check-banner {
  margin-bottom: 12px;
  padding: 8px 14px;
  background: rgba(184, 187, 38, 0.1);
  border: 1px dashed var(--ld-progress-done);
  border-radius: var(--ld-radius-sm);
  color: var(--ld-progress-done);
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  font-family: var(--font-mono);
  animation: panel-in 0.4s ease;
}

.check-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--bg-light);
}

.check-title {
  color: var(--orange);
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
}

.check-all-done {
  color: var(--green);
  font-size: 13px;
}

.check-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--fg-dim);
  border-radius: var(--ld-radius-sm);
}

.check-item.passed {
  color: var(--fg);
}

.check-item {
  align-items: flex-start;
}

.check-body {
  min-width: 0;
  flex: 1;
}

.check-detail {
  margin-top: 6px;
  padding: 6px 8px;
  background: var(--bg-darkest);
  border-left: 2px solid var(--red);
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
}

.detail-row {
  display: flex;
  gap: 8px;
}

.detail-tag {
  flex-shrink: 0;
  color: var(--fg-dim);
}

.detail-text {
  min-width: 0;
  color: var(--fg);
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-mark {
  background: rgba(251, 73, 52, 0.35);
  color: var(--fg-bright);
  border-radius: 2px;
  padding: 0 1px;
}

.check-item.pending {
  color: var(--fg-dim);
}

.check-item.passed .check-label {
  text-decoration: line-through;
  text-decoration-color: var(--green);
}

.check-icon {
  display: inline-block;
  width: 18px;
  text-align: center;
  font-weight: bold;
  flex-shrink: 0;
  font-size: 15px;
  line-height: 1;
}

.check-item.passed .check-icon {
  color: var(--green);
}

.check-item.pending .check-icon {
  color: var(--fg-dim);
}

@keyframes panel-in {
  0% {
    opacity: 0;
    transform: translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
