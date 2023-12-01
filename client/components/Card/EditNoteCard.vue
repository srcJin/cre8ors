<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["card"]);
const content = ref(props.card.content);
const emit = defineEmits(["editCard", "refreshCards"]);

const editCard = async (content: string) => {
  try {
    await fetchy(`/api/cards/${props.card._id}`, "PATCH", { body: { update: { content: content } } });
  } catch (e) {
    return;
  }
  emit("editCard");
  emit("refreshCards");
};
</script>

<template>
  <form @submit.prevent="editCard(content)">
    <!-- <p class="author">{{ props.card.author }}</p> -->
    <textarea id="content" v-model="content" placeholder="Edit Content" required> </textarea>
    <div>
      <menu>
        <li><button class="btn-sm" type="submit">Save</button></li>
        <li><button class="btn-sm" @click="emit('editCard')">Cancel</button></li>
      </menu>
      <!-- <p v-if="props.card.dateCreated !== props.card.dateUpdated" class="timestamp">Edited on: {{ formatDate(props.card.dateUpdated) }}</p>
      <p v-else class="timestamp">{{ formatDate(props.card.dateCreated) }}</p> -->
    </div>
  </form>
</template>

<style scoped>
form {
  padding: 1em;
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 5em;
  border-radius: 4px;
  resize: none;
  padding: 0.5em;
}

p {
  margin: 0em;
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

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}
</style>
