<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useCardStore } from "../../stores/card";
import { useUserStore } from "../../stores/user";
import { Card, CardType } from "../../types/card";

const { card, editable = true } = defineProps<{
  card: Card;
  editable?: boolean;
}>();

const editing = ref(false);
const editingContent = ref(card.content);
const openURL = () => {
  window.open(card.content, "_blank");
};

const { currentUsername } = storeToRefs(useUserStore());
const { updateCard, deleteCard } = useCardStore();

const onSubmit = async () => {
  await updateCard(card._id, editingContent.value);
  editing.value = false;
};
</script>
<template>
  <div :class="[card.type === CardType.note ? 'bg-base-200' : 'bg-neutral text-neutral-content', 'card', 'flex-1', 'shadow-md']">
    <div className="card-body">
      <div className="flex flex-row justify-between">
        <h2 className="card-title">{{ card.title }}</h2>
        <button v-if="card.type === 'url'" className="btn btn-accent btn-xs" @click="openURL">Open</button>
      </div>
      <template v-if="!editing">
        <p>{{ card.content }}</p>
        <div v-if="editable && currentUsername === card.author" className="card-actions justify-end">
          <button className="btn btn-warning btn-xs" @click="editing = true">Edit</button>
          <button className="btn btn-error btn-xs" @click="deleteCard(card._id)">Delete</button>
        </div>
      </template>
      <template v-else>
        <textarea className="textarea textarea-bordered text-black h-40" v-model="editingContent"></textarea>
        <div className="card-actions justify-end">
          <button className="btn btn-error btn-xs" @click="editing = false">Cancel</button>
          <button className="btn btn-info btn-xs" @click="onSubmit">Submit</button>
        </div>
      </template>
    </div>
  </div>
</template>
