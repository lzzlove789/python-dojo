<template>
  <div class="example-box">
    <div class="example-header">
      <span class="example-title">示例</span>
    </div>
    <div class="example-list">
      <div v-for="(ex, i) in examples" :key="i" class="example-item">
        <span v-if="ex.description" class="example-description">{{ ex.description }}</span>
        <pre class="example-code">{{ ex.code }}</pre>
        <button class="example-load-btn" @click="emit('load', ex.code)">载入编辑器</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Example } from "../core/types";

defineProps<{ examples: Example[] }>();
const emit = defineEmits<{ (e: "load", code: string): void }>();
</script>

<style scoped>
.example-box {
  margin-top: 20px;
  border: 1px solid var(--bg-light);
  border-radius: 6px;
  background: var(--bg-darkest);
}
.example-header {
  padding: 8px 14px;
  border-bottom: 1px solid var(--bg-light);
  color: var(--fg-dim);
  font-size: 12px;
}
.example-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 14px;
}
.example-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.example-description {
  color: var(--fg-dim);
  font-size: 12px;
}
.example-code {
  margin: 0;
  padding: 8px 10px;
  background: var(--bg-dark);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 13px;
  overflow-x: auto;
}
.example-load-btn {
  align-self: flex-start;
  padding: 3px 10px;
  background: transparent;
  border: 1px solid var(--bg-light);
  border-radius: 4px;
  color: var(--blue);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
}
.example-load-btn:hover {
  border-color: var(--blue);
}
</style>
