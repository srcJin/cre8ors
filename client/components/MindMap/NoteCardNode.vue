<script setup lang="ts">
import { Handle, NodeProps, Position } from "@vue-flow/core";
import NoteCard from "./NoteCard.vue";
import { CustomData } from "./types";

const { data } = defineProps<NodeProps<CustomData>>();
</script>

<template>
  <div>
    <NoteCard v-bind="data" />
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>
