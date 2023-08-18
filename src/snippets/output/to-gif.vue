<script lang="ts">
import { NButton, NFormItem, NInputNumber, NSelect } from "naive-ui";
import { SelectMixedOption } from "naive-ui/es/select/src/interface";

import { defineSnippet, ProcessStage, extname, filter, ee } from "@/common";
import { useObjectModel } from "@/utils/useObjectModel";
import type { ParamsComponentExposes } from "..";

const defaults = {
  max_colors: 256,
  dither: "none",
  diff_mode: "none",
};

export const meta = defineSnippet({
  title: "High Quality GIF",
  keywords: "gif",
  stage: ProcessStage.Output,
  defaults,
  *recommend(cmd) {
    if (extname(cmd.output) === ".gif") yield {};
  },
  apply(opt, cmd, h) {
    const { max_colors, dither, diff_mode } = opt;

    if (max_colors !== defaults.max_colors) h.addSummary(`${max_colors} colors`);
    if (dither !== defaults.dither) h.addSummary(`with ditcher`);

    cmd.vf.push(
      "split [a][b]; " + // split for palette
        `[a] ${filter("palettegen", max_colors)} [p]; ` + // https://ffmpeg.org/ffmpeg-filters.html#palettegen
        `[b][p] ${filter("paletteuse", {
          dither: ee(dither, "none"),
          diff_mode: ee(diff_mode, "none"),
        })}`
    );
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

const incrColors = () => void (options.max_colors = Math.min(256, ~~(options.max_colors * 2)));
const decrColors = () => void (options.max_colors = Math.max(2, ~~(options.max_colors / 2)));

const ditcherOptions: SelectMixedOption[] = [
  {
    value: "none",
    label: "none",
  },
  {
    value: "bayer",
    label: "bayer - Ordered 8x8 bayer dithering (deterministic)",
  },
  {
    value: "floyd_steinberg",
    label: "floyd_steinberg - Floyd and Steingberg dithering (error diffusion)",
  },
  {
    value: "sierra2",
    label: "sierra2 - Frankie Sierra dithering v2 (error diffusion)",
  },
  {
    value: "sierra2_4a",
    label: 'sierra2_4a - Frankie Sierra dithering v2 "Lite" (error diffusion)',
  },
  {
    value: "sierra3",
    label: "sierra3 - Frankie Sierra dithering v3 (error diffusion)",
  },
  {
    value: "burkes",
    label: "burkes - Burkes dithering (error diffusion)",
  },
  {
    value: "atkinson",
    label: "atkinson - Atkinson dithering by Bill Atkinson at Apple Computer (error diffusion)",
  },
];

const diffModeOptions: SelectMixedOption[] = [
  {
    value: "none",
    label: "none",
  },
  {
    value: "rectangle",
    label: "rectangle - good if the scene doesn't change much. only the changing rectangle will be reprocessed",
  },
];
</script>

<template>
  <NFormItem label="Max Colors">
    <NInputNumber v-model:value="options.max_colors" max="256" min="2" :show-button="false" />
    <NButton @click="decrColors">-</NButton>
    <NButton @click="incrColors">+</NButton>
  </NFormItem>
  <NFormItem label="Dither">
    <NSelect v-model:value="options.dither" :options="ditcherOptions" />
  </NFormItem>
  <NFormItem label="Diff Mode">
    <NSelect v-model:value="options.diff_mode" :options="diffModeOptions" />
  </NFormItem>
</template>
