<template>
  <div class="crt-overlay" aria-hidden="true"></div>
</template>

<script setup lang="ts"></script>

<style scoped>
.crt-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.02) 0px,
    rgba(0, 0, 0, 0.02) 1px,
    transparent 1px,
    transparent 4px
  );
  mix-blend-mode: multiply;
}
.crt-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 62%,
    rgba(0, 0, 0, 0.13) 100%
  );
}
</style>
