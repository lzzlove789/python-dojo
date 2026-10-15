<template>
  <Teleport to="body">
    <div class="celebration-overlay" @click.self="onClose" role="dialog" aria-label="关卡通过">
      <div class="celebration-modal">
        <div class="particles">
          <div
            v-for="p in particles"
            :key="p.id"
            class="particle"
            :style="{
              left: p.x + '%',
              animationDelay: p.delay + 's',
              animationDuration: p.duration + 's',
              background: p.color,
              width: p.size + 'px',
              height: p.size + 'px',
            }"
          ></div>
        </div>

        <div class="celebration-content">
          <div class="celebration-icon">🎉</div>
          <h2 class="celebration-title">关卡通过！</h2>
          <p class="celebration-subtitle">
            {{ level.chapterTitle }} · {{ level.title }}
          </p>

          <div class="celebration-actions">
            <button class="action-btn action-primary" @click="onNext" tabindex="0">
              下一关 →
              <span class="key-hint">1</span>
            </button>
            <button class="action-btn" @click="onLevels" tabindex="0">
              选关
              <span class="key-hint">2</span>
            </button>
            <button class="action-btn" @click="onStay" tabindex="0">
              继续改代码
              <span class="key-hint">3</span>
            </button>
          </div>

          <p class="celebration-hint">按 Enter 进入下一关 · Esc 关闭</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { LevelType } from "../core/types";

defineProps<{ level: LevelType }>();
const emit = defineEmits<{
  (e: 'next'): void;
  (e: 'levels'): void;
  (e: "stay"): void;
  (e: 'close'): void;
}>();

const particles = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 6,
    color: ['#fe8019', '#b8bb26', '#83a598', '#fabd2f', '#d3869b'][
      Math.floor(Math.random() * 5)
    ],
  }))
);

function onClose() {
  emit('close');
}

function onNext() {
  emit('next');
}

function onLevels() {
  emit('levels');
}

function onStay() {
  emit("stay");
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onNext();
  } else if (e.key === 'Escape') {
    onClose();
  } else if (e.key === '1') {
    onNext();
  } else if (e.key === '2') {
    onLevels();
  } else if (e.key === '3') {
    onStay();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<style scoped>
.celebration-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 0.3s ease;
}

.celebration-modal {
  position: relative;
  background: var(--bg-dark);
  border: 1px solid var(--bg-light);
  border-radius: var(--ld-radius-lg);
  padding: 48px 40px 36px;
  text-align: center;
  max-width: 460px;
  width: 90%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  animation: modal-in 0.4s ease;
  overflow: hidden;
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  top: -10px;
  border-radius: 50%;
  animation: particle-fall linear forwards;
  opacity: 0.8;
}

.celebration-content {
  position: relative;
  z-index: 1;
}

.celebration-icon {
  font-size: 56px;
  margin-bottom: 16px;
  animation: pop-in 0.5s ease;
}

.celebration-title {
  color: var(--ld-progress-done);
  font-size: 28px;
  font-family: var(--font-mono);
  font-weight: bold;
  letter-spacing: 4px;
  margin: 0 0 8px;
}

.celebration-subtitle {
  color: var(--fg-dim);
  font-size: 14px;
  margin: 0 0 32px;
  font-family: var(--font-mono);
}

.celebration-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.action-btn {
  position: relative;
  padding: 12px 24px;
  background: var(--bg-mid);
  border: 1px solid var(--bg-light);
  color: var(--fg);
  cursor: pointer;
  border-radius: var(--ld-radius-sm);
  font-family: var(--font-mono);
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-light);
  border-color: var(--orange);
  color: var(--orange);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.action-primary {
  background: var(--orange) !important;
  color: #1d2021 !important;
  border-color: var(--orange) !important;
  font-weight: bold;
}

.action-primary:hover {
  background: #ff9336 !important;
  color: #1d2021 !important;
}

.key-hint {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  font-size: 11px;
  color: var(--fg-dim);
}

.celebration-hint {
  color: var(--fg-dim);
  font-size: 12px;
  font-family: var(--font-mono);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes pop-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
