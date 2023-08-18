<script setup lang="ts">
import { FSWorkflow, FSWorkflowStageStep } from "../common/workflow";
import { useObjectModel } from "../common/useObjectModel";
import { watch, watchSyncEffect } from "vue";

defineProps<{
  modelValue: FSWorkflowStageStep;
}>();

const defaultValues: Required<FSWorkflowStageStep> = {
  id: "",
  type: "",
  options: {},
};
const modelValue = useObjectModel("modelValue", defaultValues);

watchSyncEffect(() => {
  if (!modelValue.id) modelValue.id = `${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
});
</script>

<template></template>
