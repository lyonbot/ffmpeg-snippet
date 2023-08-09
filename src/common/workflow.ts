import { SnippetStage } from "./snippet";

export interface FSWorkflowStageStep {
  id: string;
  type: string;
  options: any;
}

export type FSWorkflow = {
  /** a stage is composed of a list of snippets */
  [k in SnippetStage as `stage:${k}`]: FSWorkflowStageStep[];
};
