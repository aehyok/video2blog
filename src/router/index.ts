import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    meta: {
      name: "首页",
    },
    component: () => import("../views/home/index.vue"),
  },
  {
    path: "/short",
    name: "short",
    meta: {
      name: "短视频",
    },
    component: () => import("../views/short/index.vue"),
  },
  {
    path: "/mine",
    name: "mine",
    meta: {
      name: "首页",
    },
    component: () => import("../views/mine/index.vue"),
  },
];

let router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
