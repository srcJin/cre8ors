<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "../stores/user";
import { MindMap } from "../types/mindmap";

const mindmaps = ref<MindMap[]>([]);
const title = ref("");
const description = ref("");
const collaborator: { [key: string]: string } = {};
const { currentUsername } = storeToRefs(useUserStore());
const getMindMaps = async () => {
  mindmaps.value = await fetchy(`/api/mindmaps/user/${currentUsername.value}`, "GET");
  for (const map of mindmaps.value) {
    collaborator[map._id] = "";
  }
};
const addMindMap = async () => {
  await fetchy(`/api/mindmaps`, "POST", {
    body: {
      title: title.value,
      description: description.value,
    },
  });
  await getMindMaps();
  title.value = "";
  description.value = "";
};

const deleteMindMap = async (id: string) => {
  await fetchy(`/api/mindmaps/${id}`, "DELETE");
  await getMindMaps();
};

const shareMindmap = async (id: string) => {
  await fetchy(`/api/mindmaps/${id}/share/${collaborator[id]}`, "PATCH");
  collaborator[id] = "";
};

onBeforeMount(async () => {
  await getMindMaps();
});
</script>

<template>
  <main className="flex flex-col w-screen px-12">
    <div className="flex flex-col w-full gap-2 border border-1 border-dashed border-gray-500 rounded-lg p-4 mb-4">
      <h1 className="font-semibold text-lg">New mindmap</h1>
      <div className="w-full flex flex-row justify-between gap-4">
        <input type="text" placeholder="Title" class="input input-bordered flex-1" v-model="title" />
        <input type="text" placeholder="Description" class="input input-bordered flex-1" v-model="description" />
      </div>
      <button class="btn btn-primary self-end" @click="addMindMap">Add</button>
    </div>
    <div v-for="mindmap in mindmaps" :key="mindmap._id" className="font-semibold bg-base-200 rounded-xl w-full h-auto mb-4">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-1 flex-col items-start w-full p-4 gap-2">
          <h3 className="flex-1 text-lg">{{ mindmap.title }}</h3>
          <p className="flex-1 text-gray-500">{{ mindmap.description }}</p>
        </div>
        <div className="flex flex-col gap-2 pr-4">
          <button class="btn btn-error btn-sm w-full" @click="deleteMindMap(mindmap._id)">Delete</button>
          <RouterLink :to="{ name: 'Mindmap', params: { id: mindmap._id } }">
            <button class="btn btn-neutral btn-sm w-full">Open</button>
          </RouterLink>
        </div>
      </div>
      <div className="flex flex-row gap-4 pl-4 pb-5 ">
        <input type="text" placeholder="add collaborator's username" class="input input-bordered input-sm w-full max-w-xs" v-model="collaborator[mindmap._id]" />
        <button class="btn btn-primary btn-sm" @click="shareMindmap(mindmap._id)">Share</button>
      </div>
    </div>
  </main>
</template>
