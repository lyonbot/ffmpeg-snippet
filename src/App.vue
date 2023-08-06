<script setup lang="ts">
import { NForm } from "naive-ui";
import { computed, onMounted, ref } from "vue";
import WorkflowEditor from "./components/WorkflowEditor.vue";
import { FSWorkflow } from "./common/workflow";

const mounted = ref(false);
const workflow = ref({} as FSWorkflow);

onMounted(() => {
  mounted.value = true;
});
</script>

<template>
  <h2>he</h2>

  <WorkflowEditor v-model:workflow="workflow" />

  <pre>{{ workflow }}</pre>
</template>
