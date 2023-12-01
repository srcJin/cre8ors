<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshCards"]);

const createCard = async (content: string) => {
  try {
    await fetchy("/api/cards", "POST", {
      body: { content },
    });
  } catch (_) {
    return;
  }
  emit("refreshCards");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <div class="card base-100 bg-base-200 hover:shadow-2xl transition-shadow">
    <form @submit.prevent="createCard(content)">
      <!-- <label for="content">Card Contents:</label> -->
      <textarea id="content" v-model="content" placeholder="Create a card!" required> </textarea>
      <button type="submit" class="btn btn-primary btn-sm">Create Card</button>
    </form>
  </div>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  /* height: 6em; */
  padding: 0.5em;
  border-radius: 4px;
  /* resize: none; */
}
</style>
