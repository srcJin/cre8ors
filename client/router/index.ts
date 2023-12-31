import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import CardView from "../views/CardView.vue";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import MindMapListViewVue from "../views/MindMapListView.vue";
import MindMapViewVue from "../views/MindMapView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import SettingView from "../views/SettingView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/setting",
      name: "Settings",
      component: SettingView,

      meta: { requiresAuth: true },
    },
    {
      path: "/cards",
      name: "Cards",
      component: CardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/mindmaps",
      name: "Mindmaps",
      component: MindMapListViewVue,
      meta: { requiresAuth: true },
    },
    {
      path: "/mindmaps/:id",
      name: "Mindmap",
      component: MindMapViewVue,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
