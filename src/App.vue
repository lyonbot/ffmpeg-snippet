<script setup lang="ts">
import { NButton, NInput } from "naive-ui";
import { useSnippetsStore, useEditorStore } from "./stores";
import { storeToRefs } from "pinia";
import WorkflowEditor from "@/components/WorkflowEditor/index.vue";

const snippets = useSnippetsStore();
const editor = useEditorStore();

const { workflow, result } = storeToRefs(editor);
</script>

<template>
  <main>
    <h1 style="grid-column: 1/-1">FFmpeg snippets!</h1>

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
    <div class="section-content flex gap-1">
      <NInput v-model:value="workflow.outputName" />
      <NButton @click="workflow.outputName = '1.gif'">GIF</NButton>
      <NButton @click="workflow.outputName = 'frame%d.jpg'">frame%d.jpg</NButton>
    </div>

    <!-- Process -->
    <div class="section-label">Process:</div>
    <div class="section-content flex">
      <WorkflowEditor />
    </div>

    <!-- Command -->
    <div class="section-label">Command:</div>
    <div class="section-content">
      <pre>{{ result.cmdArgs }}</pre>
    </div>
  </main>
</template>

<style lang="scss">
main {
  @apply grid gap-4 m8;
  grid-template-columns: 120px 1fr;
}

.section-label {
  text-align: right;
  margin-top: 5px;
  grid-column: 1;
}
</style>
