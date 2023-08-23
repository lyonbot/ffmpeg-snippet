<script lang="ts">
import { NFormItem, NInputNumber } from "naive-ui";

import { defineSnippet, ProcessStage, filter, guessTypeByFilename } from "@/common";
import { useObjectModel } from "@/utils/useObjectModel";
import type { ParamsComponentExposes } from "..";

const defaults = {
  intensity: 0,
};

export const meta = defineSnippet({
  title: "Color Boost",
  keywords: "color, saturate, vibrance",
  stage: ProcessStage.Process,
  defaults,
  apply(opt, cmd, h) {
    const { intensity } = opt;

    h.addSummary(`intensity = ${intensity}`);
    if (intensity < -2 || intensity > 2) h.addWarning(`intensity shall between [-2, 2]`);

    // cmd.vf.push(filter("vibrance", { intensity }));
    cmd.vf.push(filter("vibrance", intensity)); // same
  },
  *recommend(cmd) {
    if (guessTypeByFilename(cmd.inputs[0].path) === "video") {
      // give a suggestion with default options
      yield {};

      // give a suggestion with custom options and title
      // yield { title: "Color Boost", options: { intensity: 1 } }
      // yield { title: "Make it decay", options: { intensity: -1 } }
    }
  },
});
</script>

<script setup lang="ts">
defineProps<{
  options: typeof defaults;
}>();

const options = useObjectModel("options", defaults);

defineExpose<ParamsComponentExposes>({
  options,
});
</script>

<template>
  <NFormItem label="Intensity">
    <NInputNumber v-model:value="options.intensity" max="2" min="-2" step="0.1" />
  </NFormItem>
  <!-- add more form items here -->
</template>
