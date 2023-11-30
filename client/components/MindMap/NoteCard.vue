<script setup lang="ts">
import { CustomData } from "./types";

const { title, text } = defineProps<CustomData>();
</script>

<template>
  <div className="card w-96 bg-neutral text-neutral-content  h-full flex-shrink-0">
    <div className="card-body">
      <h2 className="card-title">{{ title }}</h2>
      <p>{{ text }}</p>
    </div>
  </div>
</template>
