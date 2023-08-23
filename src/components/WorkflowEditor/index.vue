<script setup lang="ts">
import Draggable from "vuedraggable";
import { useEditorStore } from "@/stores";
import { NButton, NForm } from "naive-ui";
import { computed, nextTick, ref, watch } from "vue";
import { ProcessStage, SnippetSuggestion, stageOrderList, suggestionToStep } from "@/common";
import StepTab from "./StepTab.vue";
import AddStep from "./AddStep.vue";

const editor = useEditorStore();
const selectedStepId = ref("");
const selectedStep = computed(() => editor.result.stepsOutput.find((s) => s.step.id === selectedStepId.value));

// ----------------------------------------
// draggable

function handleDraggableChange(
  indexOffset: number,
  e: {
    added?: {
      newIndex: number;
      element: SnippetSuggestion | (typeof draggableSections)["value"][number]["steps"][number];
    };
    moved?: {
      oldIndex: number;
      newIndex: number;
      element: SnippetSuggestion | (typeof draggableSections)["value"][number]["steps"][number];
    };
  }
) {
  // note: dragging source could be
  // 1. Current list itself
  // 2. Suggestions from <AddStep />

  let oldIndex = e.moved?.oldIndex;
  let newIndex = e.moved?.oldIndex || e.added?.newIndex;
  let element = e.moved?.element || e.added?.element;

  const list = editor.workflow.process.slice();

  if (typeof oldIndex === "number") {
    list.splice(oldIndex + indexOffset, 1);
  }

  if (element && typeof newIndex === "number") {
    const step = "type" in element ? suggestionToStep(element) : element.item.step;
    list.splice(newIndex + indexOffset, 0, step);

    if ("type" in element) {
      // is from Suggestion
      selectedStepId.value = step.id;
    }
  }

  editor.updateProcessList(list);
}

const draggingStage = ref<ProcessStage | null>(null);
const draggableSections = computed(() => {
  const rawList = editor.result.stepsOutput;
  const splitted = stageOrderList.map((stage) => ({
    stage,
    steps: rawList.map((item, index) => ({ item, index })).filter(({ item }) => item.snippet?.stage === stage),
  }));

  return splitted;
});

// ----------------------------------------
// Config Form Position

const arrowOffset = 30; //80;
const formStyle = ref("");
const theListContainer = ref<HTMLDivElement>();
const formDiv = ref<HTMLDivElement>();

function syncFormPosition(anchorDiv: HTMLDivElement | null) {
  if (!anchorDiv) return;
  let { offsetLeft: ol, offsetTop: ot } = anchorDiv;
  let { offsetLeft: ol2, offsetTop: ot2, className: opClass } = anchorDiv.offsetParent! as HTMLDivElement; // stepList is relative

  if (!opClass.includes("stepList")) return; // maybe dragging

  const left = ol + ol2 + 5;
  const top = ot + ot2 - theListContainer.value!.offsetHeight - arrowOffset;

  const newStyle = `margin-left: ${left}px; margin-top: ${top}px`;
  if (newStyle !== formStyle.value) formStyle.value = newStyle;
}
watch(
  () => selectedStep.value?.step,
  (s) => {
    if (!s) {
      syncFormPosition(null);
    } else {
      nextTick(() => {
        let el = formDiv.value?.querySelector("textarea,input,select") as HTMLElement | HTMLInputElement | undefined;
        if (!el) return;
        // if ("select" in el) el.select();
        el.focus();
      });
    }
  }
);

const confirmingDelete = ref(false);
function hideForm() {
  selectedStepId.value = "";
}
function deleteStepFromForm() {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true;
    return;
  }

  const steps = editor.workflow.process.filter((it) => it.id !== selectedStepId.value);
  editor.updateProcessList(steps);
  confirmingDelete.value = false;
}
</script>

<template>
  <div class="relative">
    <div class="flex flex-col" ref="theListContainer">
      <Draggable
        v-for="{ steps, stage } in draggableSections"
        :key="stage"
        :group="`stage-${stage}`"
        :model-value="steps"
        :item-key="({item}: typeof steps[number]) => item.step.id"
        @change="handleDraggableChange(steps[0]?.index || 0, $event)"
        @start="draggingStage = stage"
        @end="draggingStage = null"
        :animation="100"
        class="stepList"
        :class="{ isDragging: draggingStage === stage }"
        ghost-class="isDragGhost"
      >
        <template
          #item="{
            element: {
              item: { step, snippet, summaries, warnings },
            },
          }"
        >
          <StepTab
            :selected="step.id === selectedStepId"
            :disabled="step.disabled"
            :title="snippet?.title || ''"
            :summaries="summaries"
            :warnings="warnings"
            @select="selectedStepId = step.id"
            @sync-form-position="$nextTick(() => syncFormPosition($event))"
            with-toggle
            :checked="!step.disabled"
            @toggle="step.disabled = !step.disabled"
          />
        </template>
      </Draggable>

      <AddStep @add="selectedStepId = $event" @drag-stage-change="draggingStage = $event" />
    </div>

    <!-- step configuration form -->
    <div
      class="stepForm"
      :key="selectedStepId"
      v-if="selectedStep"
      :style="formStyle"
      tabindex="-1"
      ref="formDiv"
      @keydown.capture="if ($event.code === 'Escape') hideForm();"
    >
      <div class="stepForm-arrow" :style="{ top: `${arrowOffset}px` }">
        <svg view-box="0 0 7 13" width="7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 0L0.5 6.5L7 13" fill="white" stroke="#333" stroke-width="1" />
        </svg>
      </div>

      <div class="mb-4 flex gap-2">
        <NButton @click="hideForm" type="primary">Done</NButton>
        <n-button
          @blur="confirmingDelete = false"
          @mouseleave="confirmingDelete = false"
          @click="deleteStepFromForm"
          :ghost="!confirmingDelete"
          :type="confirmingDelete ? 'error' : 'default'"
          >{{ confirmingDelete ? "Confirm?" : "Delete" }}</n-button
        >
      </div>

      <NForm label-placement="left">
        <component :is="selectedStep.snippet?.component" v-model:options="selectedStep.step.options" />
      </NForm>
    </div>
  </div>
</template>

<style lang="scss">
.stepList {
  position: relative;
  width: fit-content;
  min-width: 200px;
  min-height: 0;
  transition: 0.1s;

  &.isDragging {
    min-height: 2em;
    z-index: 1;

    &::before {
      pointer-events: none;
      inset: -0.5em;
      left: -2.5em;
      content: " ";
      border: 2px solid purple;
      @apply absolute b-purple rounded-3;
    }
  }
}

.stepForm {
  @apply bg-white relative z1 p4 b-l-solid b-l-1 b-gray-7;
  animation: ani-leftSlideIn 0.1s;

  &::before {
    position: absolute;
    right: 100%;
    top: 0;
    bottom: 0;
    width: 3px;
    content: " ";
    background: linear-gradient(90deg, #3330, #3336);
    border-radius: 20px 0 0 20px;
  }
}

.stepForm-arrow {
  position: absolute;
  left: 0;
  transform: translate(-100%, -50%);
  height: 1em;
}
</style>
