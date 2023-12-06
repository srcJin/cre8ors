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

let elements = ref([]);

const saveMindmap = async () => {
  await fetchy(`/api/mindmaps/${mindmapId}`, "PATCH", {
    body: {
      content: JSON.stringify(elements.value),
    },
  });
};

// Mindmap for testing
// let elements = ref<Elements>([
//   // nodes
//   // an input node, specified by using `type: 'input'`
//   { id: "1", type: "input", label: "Node 1", position: { x: 250, y: 5 } },
//   // default node, you can omit `type: 'default'` as it's the fallback type
//   { id: "2", label: "Node 2", position: { x: 140, y: 200 } },
//   { id: "3", type: "output", label: "Node 3", position: { x: 50, y: 600 } },

//   // A custom node, specified by using a custom type name
//   // we choose `type: 'special'` for this example
//   {
//     id: "4",
//     type: "special",
//     label: "Node 4",
//     position: { x: 400, y: 200 },
//     // pass custom data to the node
//     data: {
//       // you can pass any data you want to the node
//       hello: "world",
//     },
//   },
//   // An output node, specified by using `type: 'output'`
//   { id: "5", type: "output", label: "Node 5", position: { x: 420, y: 300 } },
//   { id: "6", type: "output", label: "Node 6", position: { x: 20, y: 400 } },
//   { id: "7", type: "output", label: "Node 7", position: { x: 100, y: 80 } },

//   // edges
//   // simple default bezier edge
//   // consists of an id, source-id and target-id
//   { id: "e1-3", source: "1", target: "3" },
//   // an animated edge, specified by using `animated: true`
//   { id: "e1-2", source: "1", target: "2", animated: true },
//   // a custom edge, specified by using a custom type name
//   // we choose `type: 'special'` for this example
//   {
//     id: "e1-4",
//     type: "special",
//     source: "1",
//     target: "4",
//     // pass custom data to the edge
//     data: {
//       // You can pass any data you want to the edge
//       hello: "world",
//     },
//   },
// ]);

const loadMindmap = async () => {
  const mindmap = await fetchy(`/api/mindmaps/${mindmapId}`, "GET");
  elements.value = JSON.parse(mindmap.content);
};

const suggestRandomConnection = () => {
  // Filter out elements that have a 'position' property, assuming these are nodes
  const nodes = elements.value.filter((el) => el.position);

  if (nodes.length < 2) {
    console.log("Not enough nodes to form a connection");
    return;
  }

  let randomNode1, randomNode2;
  do {
    randomNode1 = nodes[Math.floor(Math.random() * nodes.length)];
    randomNode2 = nodes[Math.floor(Math.random() * nodes.length)];
  } while (randomNode1.id === randomNode2.id || areNodesConnected(randomNode1, randomNode2));

  const newEdge = {
    id: `e${randomNode1.id}-${randomNode2.id}`,
    source: randomNode1.id,
    target: randomNode2.id,
    type: "special", // Set the type to 'special'
    animated: true,
    // Add any additional properties required for special type edges
    data: {
      customProperty: "suggested", // Example custom property
    },
  };

  elements.value = [...elements.value, newEdge];
};

const areNodesConnected = (node1: any, node2: any) => {
  return elements.value.some((el) => (el.source === node1.id && el.target === node2.id) || (el.source === node2.id && el.target === node1.id));
};

const updateMindmap = () => {
  // Filter out edges from the elements
  const edges = elements.value.filter((el) => !el.position);

  // Loop through each edge and update special edges to default type
  const updatedEdges = edges.map((edge) => {
    if (edge.type === "special") {
      console.log("Updating special edge to default type", edge);
      // If it is a special edge, update its type to 'default' and turn off animation
      return { ...edge, type: "default", animated: false };
    }
    // Keep the edge as it is if it is not a special edge
    return edge;
  });

  // Combine the updated edges with the original nodes
  elements.value = [...elements.value.filter((el) => el.position), ...updatedEdges];
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
      <div class="flex flex-col items-end m-[15px] top-0 right-0 z-50 pr-4 absolute">
        <button class="btn btn-primary mb-2" @click="saveMindmap">Save</button>
        <!-- @TODO - Load button -->
        <button class="btn btn-primary mb-2" @click="loadMindmap">Revert</button>
        <!-- @ TODO - Suggest button -->
        <button class="btn btn-primary mb-2" @click="suggestRandomConnection">Suggest</button>
        <button class="btn btn-primary mb-2" @click="updateMindmap">Accept</button>
      </div>
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

.vue-flow__handle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
}

.vue-flow__edge-path,
.vue-flow__connection-path {
  stroke: #b1b1b7;
  stroke-width: 5px;
  opacity: 1;
  fill: none;
}
</style>
