import { FFWorkflow } from "@/common/workflow";
import { defineStore } from "pinia";

const emptyWorkflow: FFWorkflow = {
  inputs: [{ path: "" }],
  outputName: "",
  process: [],
};

const debugWorkflow: FFWorkflow = {
  inputs: [{ path: "111.mov" }],
  outputName: "111.gif",
  process: [
    {
      id: "a",
      disabled: false,
      options: {},
      type: "output/to-gif",
    },
  ],
};

export const useWorkflowStore = defineStore("workflow", {
  state: (): FFWorkflow => debugWorkflow,
});
