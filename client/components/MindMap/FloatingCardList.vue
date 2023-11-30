<script setup lang="ts"></script>

<template>
  <div class="overlay"></div>
</template>

<style scoped>
.overlay {
  position: fixed;
  bottom: 0;
  height: 240px;
  width: 100%;
  z-index: 10;
  backdrop-filter: blur(15px);
  background-color: rgba(256, 256, 256, 0.5); /* Set a transparent background color */
  box-shadow: 0px -6px 8px rgba(0, 0, 0, 0.1);
}
</style>
