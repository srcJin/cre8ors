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
      <RouterLink :to="{ name: 'Home' }" class="btn btn-ghost text-xl">Cre8tors</RouterLink>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }"> Settings </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
