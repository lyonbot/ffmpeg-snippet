import { FFmpegCommandLine } from "./FFmpegCommandLine";

export enum SnippetStage {
  Input = "input",
  Process = "process",
  Output = "output",
}

export interface ParamsComponentFundamental {
  options: any;
  [k: string]: any;
}

export interface DefineSnippet<Options> {
  title: string;
  keywords: string;
  /** the timing to apply this snippet. for example, a "output" snippet only applies after all the "process" snippets */
  stage: SnippetStage;
  defaults: Options;
  apply(options: Options, ffArgs: FFmpegCommandLine): void;
}

export type FFmpegSnippet<Options> = Required<DefineSnippet<Options>>;

export function defineSnippet<Options>(val: DefineSnippet<Options>): FFmpegSnippet<Options> {
  return {
    ...val,
  };
}
