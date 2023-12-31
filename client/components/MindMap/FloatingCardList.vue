<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { useCardStore } from "../../stores/card";
import { Card } from "../../types/card";
import CardComponent from "../Card/CardComponent.vue";

const { id } = defineProps<{ id: string }>();

const cardStore = useCardStore();
const { loadCards } = cardStore;
const { cards } = storeToRefs(cardStore);
const isChecked = ref<Record<string, boolean>>({});
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const ideablocks = ref<Card[]>([]);
const searchText = ref("");
const importSearchText = ref("");

const filteredIdeablocks = computed(() => {
  return ideablocks.value.filter((block) => block.title.toLowerCase().includes(searchText.value.toLowerCase()) || block.content.toLowerCase().includes(searchText.value.toLowerCase()));
});

const filteredCards = computed(() => {
  return cards.value.filter((card) => card.title.toLowerCase().includes(importSearchText.value.toLowerCase()) || card.content.toLowerCase().includes(importSearchText.value.toLowerCase()));
});

const loadIdeaBlocks = async () => {
  ideablocks.value = await fetchy(`/api/mindmaps/${id}/ideablocks`, "GET");
};

const importCards = async () => {
  const selectedCards = Object.entries(isChecked.value)
    .filter(([, value]) => value)
    .map(([key]) => key);
  await fetchy(`/api/mindmaps/${id}/ideablocks`, "POST", {
    body: {
      ideaBlocks: selectedCards,
    },
  });
  await loadIdeaBlocks();
};

const resetIsChecked = () => {
  isChecked.value = cards.value.reduce(
    (acc, card) => {
      acc[card._id] = ideablocks.value.some((block) => block._id === card._id);
      return acc;
    },
    {} as Record<string, boolean>,
  );
};

onBeforeMount(async () => {
  await loadIdeaBlocks();
  await loadCards();
  resetIsChecked();
});

const onDragStart = (event: DragEvent, card: Card) => {
  if (event.dataTransfer) {
    const cardData = JSON.stringify(card);
    event.dataTransfer.setData("application/json", cardData);
    event.dataTransfer.effectAllowed = "move";
  }
};
</script>

<template>
  <div :class="{ overlay: true, collapsed: isCollapsed }">
    <div className="flex flex-col justify-between w-full h-full">
      <div class="flex flex-row justify-between px-6">
        <input type="text" placeholder="Search..." className="input input-bordered w-full max-w-xs" v-model="searchText" />
        <p class="font-semibold text-info pt-3">Drag and drop to add cards to the mind map.</p>

        <!-- Collapse Button -->
        <button @click="toggleCollapse" class="btn">
          <img v-if="isCollapsed" src="@/assets/eva-icons/outline/arrowhead-up-outline.svg" alt="Expand" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
          <img v-else src="@/assets/eva-icons/outline/arrowhead-down-outline.svg" alt="Collapse" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" />
        </button>
        <button class="btn btn-accent btn-md ml-20" @click="resetIsChecked" onclick="import_card_modal.showModal()">Import cards</button>
        <!-- here is the list of cards in import cards panel -->
        <!-- adding a container for search bar and import button -->
        <dialog id="import_card_modal" class="modal">
          <div class="modal-box">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
              <input type="text" placeholder="Search..." class="input input-bordered w-full max-w-xs" v-model="importSearchText" />

              <button class="btn btn-accent" @click="importCards">Reload</button>

              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
            </div>

            <div class="modal-content">
              <div className="flex flex-col">
                <div className="flex flex-row items-center gap-4 w-full" v-for="card in filteredCards" :key="card._id">
                  <CardComponent :card="card" />
                  <input type="checkbox" v-model="isChecked[card._id]" class="checkbox" />
                </div>
              </div>
            </div>
          </div>
        </dialog>
      </div>

      <div v-if="!isCollapsed" class="nodes">
        <div class="nodes">
          <div class="overflow-x-auto">
            <div class="flex whitespace-no-wrap w-full h-[200px] px-4 gap-4">
              <div v-for="block in filteredIdeablocks" :key="block._id">
                <div className="w-80 flex" :draggable="true" @dragstart="onDragStart($event, block)">
                  <CardComponent :card="block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  bottom: 0;
  height: 300px;
  width: 100%;
  z-index: 10;
  backdrop-filter: blur(15px);
  background-color: rgba(256, 256, 256, 0.5); /* Set a transparent background color */
  box-shadow: 0px -6px 8px rgba(0, 0, 0, 0.1);
  padding: 20px 0 0 0;
  transition: height 0.3s ease; /* Add transition for  height change */
}
.card {
  min-height: 150px;
  width: 200px;
  overflow-y: auto; /* Add scrolling if content overflows the min height */
  margin-top: 2em; /* Adjust the space below each card to show the shadow */
  margin-bottom: 2em; /* Adjust the space below each card to show the shadow */
}
.overlay.collapsed {
  height: 5rem; /* Adjust this height for collapsed state */
}
</style>
