<script setup lang="ts">
import NoteCard from "./NoteCard.vue";
import UrlCard from "./UrlCard.vue";
import { Card } from "./types";

const cards: Card[] = [
  { type: "note", title: "Note", text: "This is a note" },
  { type: "note", title: "Note", text: "This is a note" },
  { type: "url", title: "URL", text: "https://www.google.com" },
  { type: "note", title: "URL", text: "https://www.google.com" },
  { type: "url", title: "URL", text: "https://www.google.com" },
  { type: "note", title: "Note", text: "This is a note" },
  { type: "note", title: "URL", text: "https://www.google.com" },
  { type: "note", title: "Note", text: "This is a note" },
  { type: "url", title: "URL", text: "https://www.google.com" },
];

const onDragStart = (event: DragEvent, card: Card) => {
  if (event.dataTransfer) {
    const cardData = JSON.stringify(card);
    event.dataTransfer.setData("application/json", cardData);
    event.dataTransfer.effectAllowed = "move";
  }
};
</script>

<template>
  <div class="overlay">
    <div class="flex flex-row justify-between">
      <input type="text" placeholder="Search..." className="input input-bordered w-full max-w-xs mx-4 mb-4" />
      <p class="font-semibold text-info pt-3">Drag and drop to add cards to the mind map.</p>
      <div class="w-80"></div>
    </div>
    <div class="nodes">
      <div class="overflow-x-auto">
        <div class="flex whitespace-no-wrap w-full h-[200px] px-4 gap-4">
          <template v-for="(card, index) in cards" :key="index">
            <div :draggable="true" @dragstart="onDragStart($event, card)">
              <component v-if="card.type === 'note'" :is="NoteCard" :title="card.title" :text="card.text" />
              <component v-else :is="UrlCard" :title="card.title" :text="card.text" />
            </div>
          </template>
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
  padding: 20px 0;
}
</style>
