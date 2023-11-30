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
      <ul class="menu menu-horizontal px-1">
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }"> Settings </RouterLink>
          <RouterLink :to="{ name: 'Cards' }"> Card </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }"> Login </RouterLink>
        </li>
        <!-- Card View -->
      </ul>
    </div>
  </div>
</template>
