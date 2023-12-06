<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import CardComponent from "../components/Card/CardComponent.vue";
import CreateCardModal from "../components/Card/CreateCardModal.vue";
import { useCardStore } from "../stores/card";

const cardStore = useCardStore();
const { loadCards } = cardStore;
const { cards } = storeToRefs(cardStore);
onBeforeMount(async () => {
  await loadCards();
});
</script>

<template>
  <main className="flex flex-col items-center w-screen px-12">
    <div className="w-full flex flex-row justify-between items-center pb-8">
      <div class="w-24" />
      <h1 class="text-2xl font-bold">{{ cards.length }} cards</h1>
      <button class="btn btn-primary" onclick="card_modal.showModal()">Add Card</button>
      <CreateCardModal />
    </div>
    <div class="grid grid-cols-3 gap-10 pb-20">
      <CardComponent v-for="card in cards" :key="card._id" :card="card" editable />
    </div>
  </main>
</template>
