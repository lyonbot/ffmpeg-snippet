import { fromPairs } from "lodash";

export type CommonFileType = "video" | "audio" | "image" | "subtitle";

export const enum ProcessStage {
  Input = "input",
  Process = "process",
  Output = "output",
}

export const stageOrderList = [ProcessStage.Input, ProcessStage.Process, ProcessStage.Output];
export const stageOrderDict = fromPairs(stageOrderList.map((v, k) => [v, k]));
