import { defineStore } from "pinia";
import { ref } from "vue";

import { fetchy } from "@/utils/fetchy";
import { Card } from "../types/card";
import { useUserStore } from "./user";

export const useCardStore = defineStore(
  "card",
  () => {
    const cards = ref<Card[]>([]);
    const { currentUsername } = useUserStore();

    const loadCards = async () => {
      cards.value = await fetchy("/api/cards", "GET", { query: { author: currentUsername } });
    };

    const createCard = async (title: string, type: string, content: string) => {
      await fetchy("/api/cards", "POST", {
        body: { title, type, content },
      });
      await loadCards();
    };

    const updateCard = async (_id: string, content: string) => {
      await fetchy(`/api/cards/${_id}`, "PATCH", {
        body: { update: { content } },
      });
      await loadCards();
    };

    const deleteCard = async (_id: string) => {
      await fetchy(`/api/cards/${_id}`, "DELETE");
      await loadCards();
    };

    return {
      cards,
      loadCards,
      createCard,
      updateCard,
      deleteCard,
    };
  },
  { persist: false },
);
