<script lang="ts">
import { cloneDeep } from "lodash";
import { computed } from "vue";
import { NCard, NCollapse, NForm, NSelect } from "naive-ui";
import Draggable from "vuedraggable";
import { Icon } from "@iconify/vue";
import { SelectMixedOption } from "naive-ui/es/select/src/interface";

import { FSWorkflow } from "../common/workflow";
import { useObjectModel } from "../common/useObjectModel";
import { snippets, snippetsDict } from "../snippets";
import { SnippetStage } from "../common/snippet";

const defaultWorkflow: FSWorkflow = {
  "stage:input": [],
  "stage:process": [],
  "stage:output": [
    {
      id: "stepX",
      type: "output/to-gif",
      options: {
        max_colors: 256,
        dither: "none",
        diff_mode: "none",
      },
    },
  ],
};
</script>

<script setup lang="ts">
defineProps<{
  workflow: FSWorkflow;
}>();

const workflow = useObjectModel("workflow", defaultWorkflow);
const snippetListForSelector: SelectMixedOption[] = snippets.map((item) => ({
  value: item.id,
  label: `${item.title} (${item.id})`,
}));

const stagesTitle = {
  "stage:input": "Input",
  "stage:process": "Process",
  "stage:output": "Output",
} satisfies { [k in SnippetStage as `stage:${k}`]: string };

function addSnippet(type: string) {
  const snippet = snippets.find((x) => x.id === type);
  if (!snippet) return;

  workflow[`stage:${snippet.stage}`].push({
    id: `step_${type}_${Date.now().toString(16)}`,
    type,
    options: cloneDeep(snippet.defaults),
  });
}
</script>

<template>
  <NSelect value="" filterable placeholder="选择歌曲" :options="snippetListForSelector" @update:value="addSnippet" />

  <NCard v-for="(v, k) in stagesTitle" :key="k" :title="v">
    <Draggable v-model="workflow[k]" item-key="id" handle=".dragHandle">
      <template #item="{ element: step }">
        <div>
          <div class="dragHandle">
            <Icon icon="mdi:drag" />
            {{ step.type }}
          </div>

          <div>
            <NForm label-placement="left">
              <component :is="snippetsDict[step.type].component" v-model:options="step.options" />
            </NForm>
          </div>
        </div>
      </template>
    </Draggable>
  </NCard>
</template>
