<script setup lang="ts">
import Draggable from "vuedraggable";
import { useEditorStore } from "@/stores";
import { NButton, NForm } from "naive-ui";
import { computed, nextTick, ref, watch } from "vue";
import { ProcessStage, stageOrderList } from "@/common";

const editor = useEditorStore();
const selectedStepId = ref("a");
const selectedStep = computed(() => editor.result.stepsOutput.find((s) => s.step.id === selectedStepId.value));

// ----------------------------------------
// draggable

function handleDraggableChange(e: {
  moved?: {
    oldIndex: number;
    newIndex: number;
    element: (typeof draggableSections)["value"][number]["steps"][number];
  };
}) {
  if (typeof e.moved?.oldIndex !== "number") return;

  const { oldIndex, newIndex } = e.moved;
  const indexOffset = e.moved.element.index - oldIndex;

  const list = editor.workflow.process.slice();
  const taken = list.splice(oldIndex + indexOffset, 1);
  list.splice(newIndex + indexOffset, 0, ...taken);

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
  let { offsetLeft: ol2, offsetTop: ot2 } = anchorDiv.offsetParent! as HTMLDivElement; // stepList is relative

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
</script>

<template>
  <div class="relative">
    <div class="flex flex-col" ref="theListContainer">
      <Draggable
        v-for="{ steps, stage } in draggableSections"
        :model-value="steps"
        :item-key="({item}: typeof steps[number]) => item.step.id"
        @change="handleDraggableChange"
        @start="draggingStage = stage"
        @end="draggingStage = null"
        :animation="100"
        class="stepList"
        :class="{ isDragging: draggingStage === stage }"
        ghostClass="isDragGhost"
      >
        <template
          #item="{
            element: {
              item: { step, snippet, summaries, warnings },
            },
          }"
        >
          <div
            class="stepTab"
            :class="{ isSelected: step.id === selectedStepId, isDisabled: step.disabled }"
            @click="selectedStepId = step.id"
            @keydown.stop.prevent="selectedStepId = step.id"
            tabindex="0"
            role="menuitem"
          >
            <i class="i-mdi-drag-vertical stepDragger"></i>

            <i class="i-mdi-package stepIcon"></i>
            <div
              class="stepToggle"
              @click.stop="step.disabled = !step.disabled"
              @keydown.stop.prevent="step.disabled = !step.disabled"
              tabindex="0"
              role="menuitemcheckbox"
              title="Toggle this Snippet"
            >
              <i class="block" :class="step.disabled ? 'i-mdi-checkbox-blank' : 'i-mdi-checkbox-marked'"></i>
            </div>

            <div @click="if (step.id === selectedStepId) step.disabled = !step.disabled;">
              {{ snippet?.title }}
            </div>

            <!-- anchor -->
            <i class="i-mdi-chevron-double-right stepChevron"></i>
            <div
              :ref="(p) => (step.id === selectedStepId && $nextTick(() => syncFormPosition(p as HTMLDivElement)))"
            ></div>

            <div class="op50" v-for="txt in summaries">{{ txt }}</div>
            <div class="text-amber-5" v-for="txt in warnings">{{ txt }}</div>
          </div>
        </template>
      </Draggable>
    </div>

    <!-- step configuration form -->
    <div class="stepForm" :key="selectedStepId" v-if="selectedStep" :style="formStyle" ref="formDiv">
      <div class="stepForm-arrow" :style="{ top: `${arrowOffset}px` }">
        <svg view-box="0 0 7 13" width="7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 0L0.5 6.5L7 13" fill="white" stroke="#333" stroke-width="1" />
        </svg>
      </div>

      <div class="mb-4">
        <NButton @click="selectedStepId = ''">Done</NButton>
      </div>

      <NForm label-placement="left">
        <component :is="selectedStep.snippet?.component" v-model:options="selectedStep.step.options" />
      </NForm>
    </div>
  </div>
</template>

<style lang="scss">
.stepTab {
  @apply flex items-center gap-2 p-1 px-2 rounded-2;
  cursor: pointer;
  width: fit-content;
  margin-left: -2em; // gap + padding-left + stepDragger width
  transition: transform 0.1s;

  &.isDisabled {
    @apply line-through op-50 text-gray-7;
  }

  .stepDragger {
    opacity: 0;
    cursor: move;
  }

  .stepChevron {
    opacity: 0;
    margin: 0 -10px;
  }

  .stepToggle {
    @apply text-white bg-black rounded;
    display: none;

    &:hover,
    &:focus {
      outline: 1px solid #fff;
    }
  }

  &:hover,
  &.isSelected {
    @apply bg-gray-3;

    .stepDragger {
      opacity: 1;
    }

    .stepChevron {
      opacity: 0.7;
      animation: stepFormEntering 0.1s;
    }

    .stepToggle {
      display: block;
    }

    .stepIcon {
      display: none;
    }
  }

  &.isSelected {
    @apply bg-gray-7 text-white;

    .stepChevron {
      opacity: 0;
    }
  }

  &.isDragGhost {
    @apply bg-purple text-white;
  }
}

.stepList {
  position: relative;
  width: fit-content;
  &.isDragging {
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
  animation: stepFormEntering 0.1s;

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

@keyframes stepFormEntering {
  0% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
  }
}

.stepForm-arrow {
  position: absolute;
  left: 0;
  transform: translate(-100%, -50%);
  height: 1em;
}
</style>
