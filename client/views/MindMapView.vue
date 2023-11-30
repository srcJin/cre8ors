<script setup lang="ts">
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { nextTick, watch } from "vue";
import FloatingCardList from "../components/MindMap/FloatingCardList.vue";
import NoteCardNode from "../components/MindMap/NoteCardNode.vue";
import UrlCardNode from "../components/MindMap/UrlCardNode.vue";

let id = 0;
const getId = () => {
  return `dndnode_${id++}`;
};

const { findNode, addNodes, project, vueFlowRef } = useVueFlow({
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

const onDragOver = (event: DragEvent) => {
  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
};

const onDrop = async (event: DragEvent) => {
  const cardData = event.dataTransfer?.getData("application/json");
  const card = JSON.parse(cardData || "");

  const { left, top } = vueFlowRef.value?.getBoundingClientRect() ?? { left: 0, top: 0 };

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  });

  const newNode = {
    id: getId(),
    type: card.type,
    position,
    label: `${card.type} node`,
    data: {
      title: card.title,
      text: card.text,
    },
  };

  addNodes([newNode]);

  // Align node position after drop, so it's centered to the mouse
  await nextTick(() => {
    const node = findNode(newNode.id);
    if (!node) return;
    const stop = watch(
      () => node.dimensions,
      (dimensions) => {
        if (dimensions.width > 0 && dimensions.height > 0) {
          node.position = { x: node.position.x - node.dimensions.width / 2, y: node.position.y - node.dimensions.height / 2 };
          stop();
        }
      },
      { deep: true, flush: "post" },
    );
  });
};
</script>

<template>
  <main class="dndflow h-screen w-screen pt-[68px] -mt-[68px]" @drop="onDrop">
    <!-- @vue-expect-error -->
    <VueFlow fit-view-on-init :auto-connect="true" :default-zoom="1.5" :min-zoom="0.2" :max-zoom="4" @dragover="onDragOver">
      <template #node-note="noteNodeProps">
        <NoteCardNode v-bind="noteNodeProps" />
      </template>
      <template #node-url="urlNodeProps">
        <UrlCardNode v-bind="urlNodeProps" />
      </template>
      <Background pattern-color="#aaa" :gap="8" />
      <Controls />
      <button class="btn btn-primary absolute top-0 right-0 m-[15px] z-50">Save</button>
      <FloatingCardList />
    </VueFlow>
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
