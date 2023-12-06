<script setup lang="ts">
import { ref } from "vue";
import { useCardStore } from "../../stores/card";
import { CardType } from "../../types/card";

const title = ref("");
const type = ref<CardType>(CardType.note);
const content = ref("");
const { createCard } = useCardStore();
const onSubmit = async () => {
  await createCard(title.value, type.value, content.value);
  title.value = "";
  type.value = CardType.note;
  content.value = "";
};
</script>

<template>
  <dialog id="card_modal" class="modal">
    <div class="modal-box">
      <div className="flex flex-col gap-4">
        <input type="text" placeholder="Title" class="input input-bordered w-full" v-model="title" />
        <select class="select select-bordered w-full" v-model="type">
          <option disabled selected>Type</option>
          <option :value="CardType.note">Note</option>
          <option :value="CardType.url">URL</option>
        </select>
        <textarea className="textarea textarea-bordered text-black h-40" placeholder="Writing anything..." v-model="content" />
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn mr-4">Close</button>
          <button class="btn btn-primary" @click="onSubmit">Add</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
