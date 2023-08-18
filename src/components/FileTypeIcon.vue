<script setup lang="ts">
import { CommonFileType } from "@/common/constants";
import { guessTypeByFilename } from "@/common/filename";
import { computed } from "vue";

const props = defineProps({ path: String });
const type = computed(() => guessTypeByFilename(props.path || ""));
const lut: Record<string, string> = {
  video: "i-mdi-card-text-outline",
  audio: "i-mdi-waveform",
  image: "i-mdi-file-image-box",
  subtitle: "i-mdi-card-text-outline",
} satisfies Record<CommonFileType, string>;
</script>

<template>
  <span :class="lut[type!] || 'i-mdi-file-outline'"></span>
</template>
