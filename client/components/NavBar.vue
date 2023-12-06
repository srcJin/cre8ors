<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
</script>

<template>
  <div class="navbar bg-base-100">
    <div class="flex-1">
      <RouterLink :to="{ name: 'Home' }" class="btn btn-ghost text-xl">Cre8ors</RouterLink>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1 space-x-10">
        <template v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Cards' }">Card </RouterLink>
          <RouterLink :to="{ name: 'Mindmap' }">Mindmap </RouterLink>
          <RouterLink :to="{ name: 'Settings' }">Settings </RouterLink>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'Login' }"> Login </RouterLink>
        </template>
        <!-- Card View -->
      </ul>
    </div>
  </div>
</template>

<style scoped>
.menu-horizontal > li {
  display: inline-block;
  list-style-type: none; /* Removes default list marker */
  padding: 0; /* Resets default padding */
}
</style>
