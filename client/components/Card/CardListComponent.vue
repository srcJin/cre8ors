<script setup lang="ts">
import CreateCardForm from "@/components/Card/CreateCardForm.vue";
import EditCardForm from "@/components/Card/EditCardForm.vue";
import CardComponent from "@/components/Card/CardComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

let cards = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);

async function getCards(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let cardResults;
  try {
    cardResults = await fetchy("/api/cards", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  cards.value = cardResults;
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getCards();
  loaded.value = true;
});
</script>

<template>
   <div class="cards-wrapper">

	  <div v-if="isLoggedIn">
		<CreateCardForm class="card" @refreshCards="getCards" />
	  </div>

	  <section class="cards" v-if="loaded && cards.length !== 0">
	  <div class="cards-container">
		<div v-for="card in cards" :key="card._id">
		  <CardComponent  class="card" v-if="editing !== card._id" :card="card" @refreshCards="getCards" @editCard="updateEditing" />
		  <EditCardForm  class="card" v-else :card="card" @refreshCards="getCards" @editCard="updateEditing" />
		</div>
	  </div>

	  </section>
	  <p v-else-if="loaded">No cards found</p>
	  <p v-else>Loading...</p>
   </div>

</template>

<style scoped>




.cards-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 1em; /* Adjust the gap between cards as necessary */
 }

.cards {
  display: flex;
  flex-wrap: nowrap; /* Prevent flex items from wrapping */
  margin-left:1em;
}

section,
.row {
  max-width: 50em;
}


.cards-wrapper {
  display: flex;
}

.card {
  min-height: 150px; 
  width: 200px;
  overflow-y: auto; /* Add scrolling if content overflows the min height */
  margin-top: 2em; /* Adjust the space below each card to show the shadow */
  margin-bottom: 2em; /* Adjust the space below each card to show the shadow */

}


</style>
