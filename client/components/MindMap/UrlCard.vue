<script setup lang="ts">
import type { CustomData } from "./types";
const { card } = defineProps<CustomData>();
const openURL = () => {
  window.open(card.content, "_blank");
};
</script>

<template>
  <div className="card w-96 bg-warning text-warning-content h-full flex-shrink-0">
    <div className="card-body">
      <h2 className="card-title">{{ card.title }}</h2>
      <p>{{ card.content }}</p>
      <div className="card-actions justify-end">
        <button className="btn" @click="openURL">Open</button>
      </div>
    </div>
  </div>
</template>
