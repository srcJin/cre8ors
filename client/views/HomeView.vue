<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useUserStore } from "../stores/user";

const { currentUsername, isLoggedIn } = useUserStore();
</script>

<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <img src="@/assets/images/LOGO.png" alt="Cre8ors Logo" class="mx-auto w-1/3 mb-4" />
        <h1 class="text-5xl font-bold">Cre8ors</h1>
        <p class="py-6">The smartest mindmap tool</p>
        <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
        <RouterLink v-else :to="{ name: 'Login' }" class="btn btn-primary">Get Started</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
