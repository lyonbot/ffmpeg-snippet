# snippets

A snippet is a `.vue` file. It exports:

- `default` - the configuration form component, written in Vue

  - the component accepts `v-model:options`

- `meta` - the snippet info, including name, initial options, logic etc.

  - `apply()` - logic to update ffmpeg command line with given options, optionally you can output warnings and summaries within.
  - `recommend()` - if this snippet is suggested, based on input / output name etc, then recommend itself (optionally with ooptions)

## Write a Snippet

You can write two `<scrip>` blocks in the `.vue` file to export both component and `meta`.

We've prepared some useful utils like `useObjectModel`, `defineSnippet`. Please use them in your component.

```vue
<script lang="ts">
import { NFormItem, NInputNumber } from "naive-ui";

import { defineSnippet, ProcessStage, extname, filter, ee } from "@/common";
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

    cmd.vf.push(filter("vibrance", { intensity }));
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
```
