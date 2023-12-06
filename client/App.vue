<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";

const userStore = useUserStore();
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <NavBar />
  <div v-if="toast !== null" class="toast toast-top toast-center">
    <div class="alert" :class="toast.style === 'success' ? 'alert-success' : 'alert-error'">
      <span>{{ toast.message }}</span>
    </div>
  </div>
  <RouterView />
</template>
