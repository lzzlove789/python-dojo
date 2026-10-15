<template>
  <div class="app-root">
    <CrtOverlay />
    <header class="app-header">
      <div class="header-left">
        <span class="app-logo">Python 练功房</span>
      </div>
      <nav class="header-nav">
        <router-link to="/" class="nav-link" :class="{ active: currentPath === '/' }">做题</router-link>
        <router-link to="/levels" class="nav-link" :class="{ active: currentPath === '/levels' }">选关</router-link>
        <router-link to="/playground" class="nav-link" :class="{ active: currentPath === '/playground' }">练功场</router-link>
      </nav>
      <div class="header-right">
        <LevelProgress />
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import CrtOverlay from "./components/CrtOverlay.vue";
import LevelProgress from "./components/LevelProgress.vue";

const route = useRoute();
const currentPath = computed(() => route.path);
</script>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 var(--ld-sp-8);
  background: var(--bg-dark);
  border-bottom: 1px solid var(--bg-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex: 0 0 auto;
}

.app-logo {
  font-family: var(--font-mono);
  font-size: 18px;
  color: var(--orange);
  letter-spacing: 2px;
  font-weight: bold;
  text-shadow: 0 0 18px rgba(254, 128, 25, 0.3);
}

.header-nav {
  display: flex;
  gap: var(--ld-sp-2);
  margin-left: var(--ld-sp-10);
}

.nav-link {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-dim);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: var(--ld-radius-sm);
  transition: color 0.2s, background 0.2s;
}

.nav-link:hover {
  color: var(--fg);
  background: var(--bg-mid);
}

.nav-link.active {
  color: var(--orange);
  border-bottom: 2px solid var(--orange);
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: var(--ld-sp-8);
  min-width: 0;
}

.app-main {
  height: calc(100vh - 64px);
  overflow: hidden;
}
</style>
