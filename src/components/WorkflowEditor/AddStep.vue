<script setup lang="ts">
import { useEditorStore, useSnippetsStore } from "@/stores";
import { computed, nextTick, shallowRef } from "vue";
import StepTab from "./StepTab.vue";
import { ProcessStage, SnippetSuggestion } from "@/common";
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
  const id = s.type + "." + Math.random().toString(16).slice(-4);
  editor.updateProcessList([
    ...editor.workflow.process,
    {
      id,
      type: s.type,
      options: s.options,
      disabled: false,
    },
  ]);

  nextTick(() => emit("add", id));
}
</script>

<template>
  <input type="text" />

  <div class="suggestions text-purple-6" v-if="suggestedSnippets.length">
    <div class="text-amber-5 ml--5">
      <i class="i-mdi-star-four-points"></i>
      Suggestions
    </div>

    <Draggable
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
