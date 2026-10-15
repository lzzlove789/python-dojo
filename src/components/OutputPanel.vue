<template>
  <div class="output-panel">
    <div class="output-head">
      <span>输出</span>
      <span v-if="running" class="output-state">运行中…</span>
      <span v-else-if="status === 'loading'" class="output-state">Python 环境加载中（首次约几秒）…</span>
      <span v-else-if="status === 'failed'" class="output-state output-err">Python 环境加载失败，请检查网络；再点一次「运行」会重试</span>
    </div>
    <pre class="output-body"><template v-if="result"><span class="out-text">{{ result.stdout }}</span><span v-if="result.stderr" class="out-err">{{ result.stderr }}</span><span v-if="result.truncated" class="out-dim">{{ "\n…（输出太长，已截断）\n" }}</span><span v-if="result.error" class="out-err">{{ result.error }}</span><span v-if="!result.stdout && !result.stderr && !result.error" class="out-dim">（没有输出）</span></template><span v-else class="out-dim">点击「运行」或按 Ctrl+Enter 执行代码</span></pre>
  </div>
</template>

<script setup lang="ts">
import type { RunResult } from "../core/types";
import type { RunnerStatus } from "../core/pyRunner";

defineProps<{ result: RunResult | null; running: boolean; status: RunnerStatus }>();
</script>

<style scoped>
.output-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border-top: 1px solid var(--bg-light);
}
.output-head {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 6px 14px;
  font-size: 12px;
  color: var(--fg-dim);
  background: var(--bg-dark);
  flex-shrink: 0;
}
.output-state {
  color: var(--yellow);
}
.output-err,
.out-err {
  color: var(--red);
}
.out-dim {
  color: var(--fg-dim);
}
.output-body {
  flex: 1;
  margin: 0;
  padding: 10px 14px;
  overflow: auto;
  background: var(--bg-darkest);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--fg);
}
</style>
