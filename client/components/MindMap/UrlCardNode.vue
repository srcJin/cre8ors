<script setup lang="ts">
import { Handle, NodeProps, Position } from "@vue-flow/core";
import UrlCard from "./UrlCard.vue";
import { CustomData } from "./types";

const { data } = defineProps<NodeProps<CustomData>>();
</script>

<template>
  <div>
    <UrlCard v-bind="data" />
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>
