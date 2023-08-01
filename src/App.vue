<script setup lang="ts">
import { NForm } from "naive-ui";
import ConvertToGif from "./snippets/to-gif";
import { computed, onMounted, ref } from "vue";
import { FFmpegCommandLine } from "./common/FFmpegCommandLine";

const cc = ref<InstanceType<any>>();
const mounted = ref(false);

const cmdLine = computed(() => {
  mounted.value;
  console.log(cc.value, mounted.value);
  const args = new FFmpegCommandLine();
  cc.value?.applyTo(args);
  return args.toCommandArguments();
});

onMounted(() => {
  mounted.value = true;
});
</script>

<template>
  <h2>he</h2>

  <NForm label-placement="left">
    <ConvertToGif.ParamsComponent ref="cc" />
  </NForm>

  <code>{{ cmdLine.join("\n") }}</code>
</template>
./snippets/to-gif./snippets/to-gif