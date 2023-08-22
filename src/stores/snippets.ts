import { FFmpegSnippetWithUI, loadSnippets } from "@/snippets";
import { keyBy } from "lodash";
import { defineStore } from "pinia";
import { markRaw } from "vue";

export const useSnippetsStore = defineStore("snippets", {
  state() {
    const list = loadSnippets();
    list.forEach((it) => markRaw(it.component)); // performance
    return { list };
  },
  getters: {
    dict(state) {
      return keyBy(state.list, "id") as Record<string, FFmpegSnippetWithUI>;
    },
  },
});
