<script setup lang="ts">
import { Handle, NodeProps, Position } from "@vue-flow/core";
import { CustomData } from "./types";

const { data } = defineProps<NodeProps<CustomData>>();
const openURL = () => {
  window.open(data.text, "_blank");
};
</script>

<template>
  <div className="card w-96 bg-primary text-primary-content">
    <div className="card-body">
      <h2 className="card-title">{{ data.title }}</h2>
      <p>{{ data.text }}</p>
      <div className="card-actions justify-end">
        <button className="btn" @click="openURL">Open</button>
      </div>
    </div>
  </div>
  <Handle type="target" :position="Position.Top" />
  <Handle type="source" :position="Position.Bottom" />
</template>
