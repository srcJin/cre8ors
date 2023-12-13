<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import { nextTick, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import CreateCardModal from "../components/Card/CreateCardModal.vue";
import CustomCardNode from "../components/MindMap/CustomCardNode.vue";
import FloatingCardList from "../components/MindMap/FloatingCardList.vue";
import { Card } from "../types/card";

const { id } = defineProps<{ id: string }>();
const ideablocks = ref<Card[]>([]);

const {
  params: { id: mindmapId },
} = useRoute();

const generateId = (cardId: string) => {
  return `${cardId}_${new Date().toLocaleTimeString()}`;
};

const { findNode, addNodes, project, vueFlowRef } = useVueFlow();

let elements = ref<any>([]);

const saveMindmap = async () => {
  await fetchy(`/api/mindmaps/${mindmapId}`, "PATCH", {
    body: {
      content: JSON.stringify(elements.value),
    },
  });
};

// duplicated floatingcardlist, can be merged
const loadIdeaBlocks = async () => {
  ideablocks.value = await fetchy(`/api/mindmaps/${id}/ideablocks`, "GET");
};

const addNewCard = async (newCard: any) => {
  // Load the existing idea blocks
  const existingIdeablocks = await fetchy(`/api/mindmaps/${id}/ideablocks`, "GET");

  // Add the new card to the existing idea blocks
  const updatedIdeablocks = [...existingIdeablocks, newCard];

  await fetchy(`/api/mindmaps/${id}/ideablocks`, "POST", {
    body: {
      ideaBlocks: updatedIdeablocks,
    },
  });

  // Reload the idea blocks
  await loadIdeaBlocks();
};

const handleNewCard = (cardDetails: any) => {
  addNewCard(cardDetails)
    .then(() => {
      // Handle successful addition here
    })
    .catch((error) => {
      console.error("Error adding new card:", error);
      // Handle errors here
    });
};

const showOther = ref(false);

const toggleOther = () => {
  showOther.value = !showOther.value;
};

//Mindmap for testing
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

const updateMindmap = () => {
  // Filter out edges from the elements
  const edges = elements.value.filter((el: any) => !el.position);

  // Loop through each edge and update special edges to default type
  const updatedEdges = edges.map((edge: any) => {
    if (edge.type === "special") {
      console.log("Updating special edge to default type", edge);
      // If it is a special edge, update its type to 'default' and turn off animation
      return { ...edge, type: "default", animated: false };
    }
    // Keep the edge as it is if it is not a special edge
    return edge;
  });

  // Combine the updated edges with the original nodes
  elements.value = [...elements.value.filter((el: any) => el.position), ...updatedEdges];
};

const removeAllNodes = () => {
  elements.value = elements.value.filter((el: any) => !el.position);
};

const removeAllEdges = () => {
  elements.value = elements.value.filter((el: any) => el.position);
};

const suggestRandomConnection = () => {
  // Filter out elements that have a 'position' property, assuming these are nodes
  const nodes = elements.value.filter((el: any) => el.position);

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

const suggestScoredConnection = async () => {
  // Filter out elements that have a 'position' property, assuming these are nodes
  const nodes = elements.value.filter((el: any) => el.position);

  if (nodes.length < 2) {
    console.log("Not enough nodes to form a connection");
    return;
  }

  // Define a threshold for forming a connection
  const threshold = 0.9; // can be adjusted
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];

      if (!areNodesConnected(node1, node2)) {
        console.log("node1", node1);
        const score = await findConnectedNodes(node1.data.card.content, node2.data.card.content);

        if (score >= threshold) {
          const newEdge = {
            id: `e${node1.id}-${node2.id}`,
            source: node1.id,
            target: node2.id,
            type: "special", // Set the type to 'special'
            animated: true,
          };

          elements.value = [...elements.value, newEdge];
        }
      }
    }
  }
};

const suggestGPTConnectionBackend = async () => {
  try {
    const requestBody = {
      mapId: mindmapId, // Use .value for reactive refs
    };

    console.log("JSON.stringify(requestBody)", JSON.stringify(requestBody));

    const testRequestBody = {
      mapId: mindmapId, // Replace with a hard-coded valid ID for testing
    };
    console.log("JSON.stringify(testRequestBody)", JSON.stringify(testRequestBody));

    const response = await fetchy(`/api/autosuggestion/suggest`, "POST", {
      body: testRequestBody,
    });

    // console.log("response=", JSON.parse(response));
    return JSON.parse(response);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
};

interface Connection {
  source: string;
  target: string;
}

interface Suggestions {
  connections: Connection[];
}

const connectAccordingToSuggestions = (suggestions: Suggestions): void => {
  console.log("connectAccordingToSuggestions");
  const nodes = elements.value.filter((el: any) => "position" in el) as Node[];

  if (nodes.length < 2) {
    console.log("Not enough nodes to form a connection");
    return;
  }
  // console.log("nodes[0]=", nodes[0]);

  // console.log("nodes[0].id=", nodes[0].data.card._id);

  suggestions.connections.forEach((connection) => {
    const sourceNode: any = nodes.find((node) => {
      // Cast node to 'any' to access 'data' and 'id' properties
      const anyNode: any = node;
      return anyNode.data.card._id === connection.source;
    });

    const targetNode: any = nodes.find((node) => {
      // Cast node to 'any' to access 'data' and 'id' properties
      const anyNode: any = node;
      return anyNode.data.card._id === connection.target;
    });

    if (sourceNode && targetNode && !areNodesConnected(sourceNode, targetNode)) {
      const newEdge = {
        id: `e${sourceNode.id}-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
        type: "special",
        animated: true,
        data: {
          customProperty: "suggested",
        },
      };

      elements.value = [...elements.value, newEdge];
    }
  });
};

const suggestionPipeline = async () => {
  // For debugging, using sci-fi mindmap
  //   const suggestions: Suggestions = {
  //   connections: [
  //     { source: "6576f69cc300c74934613ba4", target: "6576f675c300c74934613ba0" },
  //     { source: "6576f69cc300c74934613ba4", target: "6576f657c300c74934613b9d" },
  //     { source: "6576f692c300c74934613ba3", target: "6576f66dc300c74934613b9f" },
  //     { source: "6576f692c300c74934613ba3", target: "6576f623c300c74934613b97" },
  //     { source: "6576f688c300c74934613ba2", target: "6576f633c300c74934613b99" },
  //   ],
  // };
  const suggestions = await suggestGPTConnectionBackend();

  // console.log("suggestionPipeline suggestions=", suggestions);
  connectAccordingToSuggestions(suggestions);
};

const areNodesConnected = (node1: any, node2: any) => {
  return elements.value.some((el: any) => (el.source === node1.id && el.target === node2.id) || (el.source === node2.id && el.target === node1.id));
};

const findConnectedNodes = async (string1: string, string2: string) => {
  // @ TODO now read the contents of each nodes, and use nlp packages to analyse their relationships, and recomment suggestions
  // Prepare the data to be sent to the backend
  const payload = {
    content1: string1,
    content2: string2,
  };
  console.log("findConnectedNodes Payload:", payload);
  // Now just return a random number for testing between 0 and 1
  const score = Math.random();
  console.log("findConnectedNodes Score:", score);
  return score;
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
        <!-- Single Button Line -->
        <div class="flex mb-2">
          <button class="btn btn-primary" onclick="card_modal.showModal()">Add Card</button>
          <!-- take the emit from child component(CreateCardModal.vue) -->
          <CreateCardModal @newCardCreated="handleNewCard" />
        </div>

        <!-- Save and Update Buttons Line -->
        <div class="flex mb-2">
          <button class="btn btn-primary mr-2" @click="saveMindmap">Save</button>
          <button class="btn btn-primary" @click="loadMindmap">Update</button>
        </div>

        <!-- Suggest and Accept Buttons Line -->
        <div class="flex mb-2">
          <button class="btn btn-primary mr-2" @click="suggestionPipeline">Suggest</button>
          <button class="btn btn-primary" @click="updateMindmap">Accept</button>
        </div>

        <!-- Collapsible Group for Removal Buttons -->
        <button @click="toggleOther" class="btn mb-2">Other</button>

        <div>
          <div v-if="showOther" class="flex">
            <button class="btn btn-warning mr-2" @click="removeAllNodes">Remove All Nodes</button>
            <button class="btn btn-warning" @click="removeAllEdges">Remove All Edges</button>
          </div>
        </div>
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
