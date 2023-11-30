<script setup lang="ts">
import { Handle, NodeProps, Position } from "@vue-flow/core";
import { CustomData } from "./types";

const { data } = defineProps<NodeProps<CustomData>>();
</script>

<template>
  <div>
    <div className="card w-96 bg-neutral text-neutral-content">
      <div className="card-body">
        <h2 className="card-title">{{ data.title }}</h2>
        <p>{{ data.text }}</p>
      </div>
    </div>
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>
