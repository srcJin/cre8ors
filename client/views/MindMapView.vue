<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { nextTick, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import CustomCardNode from "../components/MindMap/CustomCardNode.vue";
import FloatingCardList from "../components/MindMap/FloatingCardList.vue";

const {
  params: { id: mindmapId },
} = useRoute();

const generateId = (cardId: string) => {
  return `${cardId}_${new Date().toLocaleTimeString()}`;
};

const { findNode, addNodes, project, vueFlowRef } = useVueFlow();

const elements = ref([]);

const saveMindmap = async () => {
  await fetchy(`/api/mindmaps/${mindmapId}`, "PATCH", {
    body: {
      content: JSON.stringify(elements.value),
    },
  });
};

const loadMindmap = async () => {
  const mindmap = await fetchy(`/api/mindmaps/${mindmapId}`, "GET");
  elements.value = JSON.parse(mindmap.content);
};

onBeforeMount(async () => {
  await loadMindmap();
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
    id: generateId(card.id),
    type: "custom",
    position,
    label: `${card.type} node`,
    data: {
      card,
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
    <VueFlow v-model="elements" fit-view-on-init :auto-connect="true" :default-zoom="0.5" :min-zoom="0.2" :max-zoom="4" @dragover="onDragOver">
      <template #node-custom="customNodeProps">
        <CustomCardNode v-bind="customNodeProps" />
      </template>
      <Background pattern-color="#aaa" :gap="8" />
      <Controls />
      <button class="btn btn-primary absolute top-0 right-0 m-[15px] z-50" @click="saveMindmap">Save</button>
      <FloatingCardList :id="mindmapId as string" />
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
