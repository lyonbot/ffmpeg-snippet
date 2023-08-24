<script setup lang="ts">
import { ProcessStage } from "@/common";
import { FFWorkflowStep } from "@/common/workflow";
import { ref, watch } from "vue";
import Draggable from "vuedraggable";
import StepTab from "./StepTab.vue";

export interface AddStepListItem {
   stage: ProcessStage | null;
   title: string;
   getSteps(): Array<FFWorkflowStep>;
}

const props = defineProps<{
  list: Array<AddStepListItem>;
}>();
const emit = defineEmits<{
  (event: "dragStageChange", stage: ProcessStage | null): void;
  (event: "select", item: AddStepListItem): void;
}>();

const draggingStage = ref<ProcessStage | null>(null);
watch(draggingStage, (v) => emit("dragStageChange", v));

const dragEnabled = ref(false);
function handleDragStart({ oldIndex }: { oldIndex: number }) {
  draggingStage.value = props.list[oldIndex]?.stage;
}
function handleDragEnd() {
  draggingStage.value = null;
  dragEnabled.value = false;
}
</script>

<template>
  <Draggable
    class="suggestions-list ml5 max-w-xl flex flex-wrap gap-4 gap-y-1"
    :list="props.list"
    :itemKey="(_:AddStepListItem, i:number) => i"
    :group="`stage-${draggingStage}`"
    :disabled="!dragEnabled"
    @pointerdown.native="dragEnabled = true"
    @pointerup.native="handleDragEnd"
    @pointercancel.native="handleDragEnd"
    @start="handleDragStart($event)"
    @end="handleDragEnd"
  >
    <template #item="{ element: item }">
      <StepTab :title="item.title" @select="emit('select', item)" />
    </template>
  </Draggable>
</template>
