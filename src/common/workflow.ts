export interface FFWorkflowStep {
  id: string;
  type: string;
  options: any;
  disabled: boolean;
}

export type FFWorkflow = {
  /** ffmpeg allows multiple inputs; but in most case there is only one */
  inputs: { path: string }[];

  /** output path */
  outputName: string;

  /** a stage is composed of a list of snippets */
  process: FFWorkflowStep[];
};
