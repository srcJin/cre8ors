<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function handleLogout() {
  await logoutUser();
  router.push({ name: "Home" });
}

async function handleDeleteUser() {
  await deleteUser();
  router.push({ name: "Home" });
}
</script>

<template>
  <main class="settings-page">
    <h1>Settings for {{ currentUsername }}</h1>
    <div class="button-group">
      <button class="btn btn-primary" @click="handleLogout">Logout</button>
      <button class="btn btn-error" @click="handleDeleteUser">Delete User</button>
    </div>
    <UpdateUserForm />
  </main>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.button-group {
  margin-bottom: 20px;
}
</style>
