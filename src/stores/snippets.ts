import { FFmpegSnippetWithUI, loadSnippets } from "@/snippets";
import { keyBy } from "lodash";
import { defineStore } from "pinia";

export const useSnippetsStore = defineStore("snippets", {
  state() {
    const list = loadSnippets();
    return { list };
  },
  getters: {
    dict(state) {
      return keyBy(state.list, "id") as Record<string, FFmpegSnippetWithUI>;
    },
  },
});
