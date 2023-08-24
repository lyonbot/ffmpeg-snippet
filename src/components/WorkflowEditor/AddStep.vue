<script setup lang="ts">
import { useEditorStore, useSnippetsStore } from "@/stores";
import { computed, nextTick } from "vue";
import { ProcessStage, suggestionToStep } from "@/common";
import AddStepList, { AddStepListItem } from "./AddStepList.vue";
import { toArray } from "yon-utils";

const emit = defineEmits<{
  (type: "add", id: string): void;
  (type: "dragStageChange", stage: ProcessStage | null): void;
}>();

const editor = useEditorStore();
const snippets = useSnippetsStore();
const suggestedSnippets = computed((): AddStepListItem[] =>
  editor.suggestedSnippets.map((v) => ({
    stage: snippets.dict[v.type]?.stage || null,
    title: v.title,
    getSteps() {
      return [suggestionToStep(v)];
    },
  }))
);

function applySuggestion(s: (typeof suggestedSnippets)["value"][0]) {
  const steps = toArray(s.getSteps());
  editor.updateProcessList([...editor.workflow.process, ...steps]);

  let id = steps[0]?.id;
  if (id) nextTick(() => emit("add", id));
}
</script>

<template>
  <input type="text" />

  <div class="suggestions text-purple-6" v-if="suggestedSnippets.length">
    <div class="text-amber-5">
      <i class="i-mdi-creation text-xl"></i>
      Suggestions
    </div>

    <AddStepList
      :list="suggestedSnippets"
      @select="applySuggestion"
      @dragStageChange="emit('dragStageChange', $event)"
    />
  </div>
</template>

<style lang="scss"></style>
