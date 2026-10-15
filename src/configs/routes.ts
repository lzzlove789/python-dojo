import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", component: () => import("../pages/IndexPage.vue") },
  { path: "/levels", component: () => import("../pages/LevelsPage.vue") },
  { path: "/playground", component: () => import("../pages/PlaygroundPage.vue") },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
