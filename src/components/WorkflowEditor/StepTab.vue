<script setup lang="ts">
const props = defineProps<{
  selected?: boolean;
  disabled?: boolean;
  withToggle?: boolean;
  checked?: boolean;
  title: string;
  summaries?: string[];
  warnings?: string[];
}>();

const emit = defineEmits<{
  (event: "toggle"): void;
  (event: "select"): void;
  (event: "syncFormPosition", anchorDiv: HTMLDivElement): void;
}>();

// special note: .stepTab support .isDragGhost
</script>

<template>
  <div
    class="stepTab"
    :class="{ isSelected: props.selected, isDisabled: props.disabled, withToggle: props.withToggle }"
    @click="emit('select')"
    @keydown.stop.prevent="emit('select')"
    tabindex="0"
    role="menuitem"
  >
    <i class="i-mdi-drag-vertical stepDragger"></i>

    <i class="i-mdi-package stepIcon"></i>
    <div
      class="stepToggle"
      @click.stop="emit('toggle')"
      @keydown.stop.prevent="emit('toggle')"
      tabindex="0"
      role="menuitemcheckbox"
      title="Toggle this Snippet"
    >
      <i class="block" :class="props.checked ? 'i-mdi-checkbox-marked' : 'i-mdi-checkbox-blank'"></i>
    </div>

    <div @click="if (selected) $emit('toggle');">
      {{ props.title }}
    </div>

    <!-- anchor -->
    <i class="i-mdi-chevron-double-right stepChevron"></i>
    <div :ref="(p) => (props.selected && emit('syncFormPosition', p as HTMLDivElement))"></div>

    <div class="op50" v-for="txt in props.summaries">{{ txt }}</div>
    <div class="text-amber-5" v-for="txt in props.warnings">{{ txt }}</div>
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
      animation: ani-leftSlideIn 0.1s;
    }

    &.withToggle {
      .stepToggle {
        display: block;
      }

      .stepIcon {
        display: none;
      }
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
</style>
