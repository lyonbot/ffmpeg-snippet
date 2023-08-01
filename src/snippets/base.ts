import { VueElementConstructor } from "vue";
import { FFmpegCommandLine } from "../common/FFmpegCommandLine";

interface ParamsComponentFundamental {
  applyTo(ffArgs: FFmpegCommandLine): void;
}

export interface FFmpegSnippet {
  title: string
  keywords: string[]
  ParamsComponent: VueElementConstructor<ParamsComponentFundamental>
}

export function defineSnippet(val: Omit<FFmpegSnippet, 'ParamsComponent'> & { ParamsComponent: any }): FFmpegSnippet {
  return val
}