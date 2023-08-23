import { ProcessStage } from ".";
import { FFmpegCommandLine } from "./commandLine";
import { FFWorkflowStep } from "./workflow";

export interface SnippetSuggestion {
  title: string;
  options: Record<string, any>;
  type: string;
}

export function suggestionToStep(s: SnippetSuggestion): FFWorkflowStep {
  const id = s.type + "." + Math.random().toString(16).slice(-4);

  return {
    id,
    type: s.type,
    options: s.options,
    disabled: false,
  };
}

export interface DefineSnippetOptions<Options> {
  title: string;
  keywords: string;

  /** the timing to apply this snippet. for example, a "output" snippet only applies after all the "process" snippets */
  stage: ProcessStage;

  /** default options */
  defaults: Options;

  /**
   * logic to update `cmd` with given `options`, optionally add warnings and summaries
   *
   * @example
   * ```js
   * apply(opt, cmd, h) {
   *   const { width, height } = opt;
   *
   *   h.addSummary(`scale to ${width}x${height}`)
   *   if (width % 2 || height % 2) h.addWarning('size shall be power of 2')
   *
   *   cmd.set('s', `${width}x${height}`);
   *
   *   // or with filter:
   *   // see https://ffmpeg.org/ffmpeg-filters.html#Examples-112
   *   // cmd.vf.push(filter('scale', `${width}x${height}`))
   * }
   * ```
   */
  apply(
    options: Options,
    cmd: FFmpegCommandLine,
    helper: { addWarning(message: string): void; addSummary(message: string): void }
  ): void;

  /**
   * logic to recommend this snippet. must be a generator function
   *
   * @example
   * ```
   * *recommend(cmd) {
   *   if (guessTypeByFilename(cmd.inputs[0].path) === 'video') {
   *     // give a suggestion with default options
   *     yield {}
   *
   *     // give a suggestion with custom options and title
   *     yield { title: "Color Boost", options: { xx: 1 } }
   *   }
   * }
   * ```
   */
  recommend?(cmd: FFmpegCommandLine): Iterable<Partial<SnippetSuggestion>>;
}

export type FFSnippet<Options> = Required<DefineSnippetOptions<Options>>;

export function defineSnippet<Options>(val: DefineSnippetOptions<Options>): FFSnippet<Options> {
  return {
    *recommend() {},
    ...val,
  };
}
