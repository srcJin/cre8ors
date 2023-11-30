<script setup lang="ts">
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import FloatingCardList from "../components/MindMap/FloatingCardList.vue";
import NoteCardNode from "../components/MindMap/NoteCardNode.vue";
import UrlCardNode from "../components/MindMap/UrlCardNode.vue";

useVueFlow({
  nodes: [
    {
      id: "1",
      type: "note",
      position: { x: 100, y: 100 },
      data: {
        title: "How to draw good mind maps",
        text: "This is a note node. You can add notes to your mind map to help you remember things.",
      },
    },
    {
      id: "2",
      type: "url",
      position: { x: 300, y: 500 },
      data: {
        title: "Cre8tors",
        text: "https://cre8tors.app",
      },
    },
  ],
});
</script>

<template>
  <main class="h-screen w-screen pt-[68px] -mt-[68px]">
    <VueFlow fit-view-on-init :auto-connect="true" :default-zoom="1.5" :min-zoom="0.2" :max-zoom="4">
      <template #node-note="noteNodeProps">
        <NoteCardNode v-bind="noteNodeProps" />
      </template>
      <template #node-url="urlNodeProps">
        <UrlCardNode v-bind="urlNodeProps" />
      </template>
      <Background pattern-color="#aaa" :gap="8" />
      <Controls />
      <button class="btn btn-primary absolute top-0 right-0 m-[15px] z-50">Save</button>
    </VueFlow>
    <FloatingCardList />
  </main>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import "@vue-flow/controls/dist/style.css";
.vue-flow__panel {
  top: 0px;
  bottom: unset !important;
}
</style>
