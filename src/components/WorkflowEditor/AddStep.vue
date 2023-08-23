<script setup lang="ts">
import { useEditorStore, useSnippetsStore } from "@/stores";
import { computed, nextTick, shallowRef } from "vue";
import StepTab from "./StepTab.vue";
import { ProcessStage, SnippetSuggestion, suggestionToStep } from "@/common";
import Draggable from "vuedraggable";

const emit = defineEmits<{
  (type: "add", id: string): void;
  (type: "dragStageChange", stage: ProcessStage | null): void;
}>();

const editor = useEditorStore();
const snippets = useSnippetsStore();
const suggestedSnippets = computed(() => editor.suggestedSnippets);

const draggingSuggestion = shallowRef<SnippetSuggestion>();
const draggingSuggestionSnippet = computed(() => snippets.dict[draggingSuggestion.value?.type!]);
function handleDragStart({ oldIndex }: { oldIndex: number }) {
  draggingSuggestion.value = suggestedSnippets.value[oldIndex];
  emit("dragStageChange", draggingSuggestionSnippet.value?.stage);
}

function applySuggestion(s: SnippetSuggestion) {
  const step = suggestionToStep(s);
  editor.updateProcessList([...editor.workflow.process, step]);

  nextTick(() => emit("add", step.id));
}
</script>

<template>
  <input type="text" />

  <div class="suggestions text-purple-6" v-if="suggestedSnippets.length">
    <div class="text-amber-5">
      <i class="i-mdi-creation text-xl"></i>
      Suggestions
    </div>

    <Draggable
      class="suggestions-list ml5 max-w-xl flex flex-wrap gap-4 gap-y-1"
      :list="suggestedSnippets"
      :itemKey="(_:any, i:number) => i"
      :group="`stage-${draggingSuggestionSnippet?.stage}`"
      @start="handleDragStart($event)"
      @end="emit('dragStageChange', null), (draggingSuggestion = undefined)"
    >
      <template #item="{ element: s }">
        <StepTab :title="s.title" @select="applySuggestion(s)" />
      </template>
    </Draggable>
  </div>
</template>

<style lang="scss"></style>
