<script setup lang="ts">
import { NButton, NInput } from "naive-ui";
import { useSnippetsStore, useWorkflowStore } from "./stores";
import { FFmpegCommandLine } from "./common";
import { computed } from "vue";

const snippets = useSnippetsStore();
const workflow = useWorkflowStore();

const ffOut = computed(() => {
  const ffArgs = new FFmpegCommandLine();
  const stepsOutput = [] as StepStat[];
  type StepStat = { warnings: string[]; summaries: string[] };

  workflow.inputs.forEach((x, i) => ffArgs.setInput(i, { path: x.path }));
  ffArgs.output = workflow.outputName;

  workflow.process.forEach((step, i) => {
    const stat: StepStat = {
      summaries: [],
      warnings: [],
    };
    stepsOutput[i] = stat;

    const mod = !step.disabled && snippets.dict[step.type];
    if (!mod) return; // skip

    mod.apply(step.options, ffArgs, {
      addSummary: (message) => void stat.summaries.push(message),
      addWarning: (message) => void stat.warnings.push(message),
    });
  });

  return {
    stepsOutput,
    cmdArgs: ffArgs.toCommandArguments(),
  };
});
</script>

<template>
  <h1>FFmpeg snippets!</h1>

  <main>
    <!-- input -->
    <div class="section-label">Input:</div>
    <div class="section-content">
      <div v-for="it in workflow.inputs">
        <NInput v-model:value="it.path" />

        <div class="text-amber-5">
          <i class="i-mdi-lightbulb-on"></i>
          try drag your input file into browser?
        </div>
      </div>
    </div>

    <!-- output -->
    <div class="section-label">Output:</div>
    <div class="section-content flex">
      <NInput v-model:value="workflow.outputName" />
      <NButton @click="workflow.outputName = '1.gif'">GIF</NButton>
      <NButton @click="workflow.outputName = 'frame%d.jpg'">frame%d.jpg</NButton>
    </div>

    <!-- Process -->
    <div class="section-label">Process:</div>
    <div class="section-content flex">
      <pre>{{ workflow.process }}</pre>
    </div>

    <!-- Command -->
    <div class="section-label">Command:</div>
    <div class="section-content">
      <pre>{{ ffOut.cmdArgs }}</pre>
    </div>
  </main>
</template>

<style lang="scss">
main {
  @apply grid gap-4;
  grid-template-columns: 120px 1fr;
}

.section-label {
  text-align: right;
  margin-top: 5px;
  grid-column: 1;
}
</style>
