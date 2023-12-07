<script setup lang="ts">
import { CustomData } from "./types";
const { title, text } = defineProps<CustomData>();
const openURL = () => {
  window.open(text, "_blank");
};
</script>

<template>
  <div className="card w-96 bg-warning text-warning-content h-full flex-shrink-0">
    <div className="card-body">
      <h2 className="card-title">{{ title }}</h2>
      <p>{{ text }}</p>
      <div className="card-actions justify-end">
        <button className="btn" @click="openURL">Open</button>
      </div>
    </div>
  </div>
</template>
