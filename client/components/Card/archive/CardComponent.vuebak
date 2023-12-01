<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["card"]);
const emit = defineEmits(["editCard", "refreshCards"]);
const { currentUsername } = storeToRefs(useUserStore());

const deleteCard = async () => {
  try {
    await fetchy(`/api/cards/${props.card._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshCards");
};
</script>

<template>
  <!-- Ref: https://daisyui.com/components/card/ -->
  <div class="card w-96 base-100 bg-base-200 hover:shadow-2xl transition-shadow" @click="emit('editCard', props.card._id)">
    <!-- display image if image exists -->
    <figure v-if="props.card.image" class="image-container">
      <img :src="props.card.image" alt="Card Image" />
    </figure>
    <div class="card-body">
      <!-- <h2 class="card-title">{{ props.card.author }}</h2> -->
      <p>{{ props.card.content }}</p>
      <div v-if="props.card.author == currentUsername" class="delete-overlay">
        <button class="delete-button" @click.stop="deleteCard">×</button>
      </div>
      <!-- <article class="timestamp">
        <p v-if="props.card.dateCreated !== props.card.dateUpdated">Edited on: {{ formatDate(props.card.dateUpdated) }}</p>
        <p v-else>{{ formatDate(props.card.dateCreated) }}</p>
      </article> -->
      <!-- <div class="card-actions justify-center">
        <menu v-if="props.card.author == currentUsername">
          <li>
            <button class="btn btn btn-xs" @click="emit('editCard', props.card._id)">Edit</button>
          </li>
          <li>
            <button class="btn btn btn-xs" @click="deleteCard">Delete</button>
          </li>
        </menu>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
p {
  display: flex;
  justify-content: center;
  margin: 0em;
  font-weight: bold;
  font-size: 1.2em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
  justify-content: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

/* .base {
  display: flex;
  justify-content: space-between;
  align-items: center;
} */

.base article:only-child {
  margin-left: auto;
}

.delete-overlay {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5em;
}

.delete-button {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: rgb(174, 174, 174);
}

.delete-button:hover {
  color: #b00;
}
</style>
