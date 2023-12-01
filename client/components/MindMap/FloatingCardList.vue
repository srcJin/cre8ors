<script setup lang="ts">
import EditNoteCard from "@/components/Card/EditNoteCard.vue";
import NoteCard from "@/components/Card/NoteCard.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { Card } from "./types";

// let cards = ref<Array<Record<string, string>>>([]);
let cards = ref<Card[]>([]);
let editing = ref("");
let searchAuthor = ref("");

function updateEditing(id: string) {
  editing.value = id;
}
const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);

// const cards: Card[] = [
//   { type: "note", title: "Note", text: "This is a note" },
//   { type: "note", title: "Note", text: "This is a note" },
//   { type: "url", title: "URL", text: "https://www.google.com" },
//   { type: "note", title: "URL", text: "https://www.google.com" },
//   { type: "url", title: "URL", text: "https://www.google.com" },
//   { type: "note", title: "Note", text: "This is a note" },
//   { type: "note", title: "URL", text: "https://www.google.com" },
//   { type: "note", title: "Note", text: "This is a note" },
//   { type: "url", title: "URL", text: "https://www.google.com" },
// ];

async function getCards(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let cardResults;
  try {
    cardResults = await fetchy("/api/cards", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  console.log("cardResults=", cardResults);
  let i = 0;
  for (i = 0; i < cardResults.length; i++) {
    console.log("cardResults[i]=", i, cardResults[i].content);
    cards.value[i] = { type: "note", _id: cardResults[i]._id, title: cardResults[i].author, text: cardResults[i].content };
  }
  console.log("cards=", cards);
}

const onDragStart = (event: DragEvent, card: Card) => {
  if (event.dataTransfer) {
    const cardData = JSON.stringify(card);
    event.dataTransfer.setData("application/json", cardData);
    event.dataTransfer.effectAllowed = "move";
  }
};

onBeforeMount(async () => {
  await getCards();
  loaded.value = true;
});
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
          <div v-for="(card, index) in cards" :key="index">
            <!-- <div v-for="card in cards" :key="card._id"> -->
            <div :draggable="true" @dragstart="onDragStart($event, card)">
              <!-- <component v-if="card.type === 'note'" :is="NoteCard" :title="card.title" :text="card.text" />
              <component v-else :is="UrlCard" :title="card.title" :text="card.text" /> -->
              <NoteCard class="card" v-if="editing !== card._id" :card="card" @refreshCards="getCards" @editCard="updateEditing" />
              <EditNoteCard class="card" v-else :card="card" @refreshCards="getCards" @editCard="updateEditing" />
            </div>
          </div>
          <!-- </template> -->
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
.card {
  min-height: 150px;
  width: 200px;
  overflow-y: auto; /* Add scrolling if content overflows the min height */
  margin-top: 2em; /* Adjust the space below each card to show the shadow */
  margin-bottom: 2em; /* Adjust the space below each card to show the shadow */
}
</style>
