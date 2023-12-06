<script setup lang="ts">
import { Handle, NodeProps, Position } from "@vue-flow/core";
import CardComponent from "../Card/CardComponent.vue";
import { CustomData } from "./types";

const { data } = defineProps<NodeProps<CustomData>>();
</script>

<template>
  <div>
    <div className="w-80">
      <CardComponent v-bind="data" />
    </div>
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>
