import { toArray } from "yon-utils";
import { flatten, isObject } from "lodash";
import { FFmpegCommandLine, ProcessStage, SnippetSuggestion, guessTypeByFilename, stageOrderDict, stageOrderList } from "@/common";
import { FFWorkflow, FFWorkflowStep } from "@/common/workflow";
import { defineStore } from "pinia";
import { useSnippetsStore } from ".";
import { FFmpegSnippetWithUI } from "@/snippets";

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
      id: "vib",
      type: "image-effect/vibrance",
      disabled: false,
      options: {
        intensity: 1,
      },
    },
    {
      id: "vib2",
      type: "image-effect/vibrance",
      disabled: false,
      options: {
        intensity: 2,
      },
    },
    {
      id: "a",
      disabled: false,
      options: { max_colors: 128 },
      type: "1output/to-gif",
    },
  ],
};

export const useEditorStore = defineStore("editor", {
  state() {
    return {
      workflow: import.meta.env.PROD ? emptyWorkflow : debugWorkflow,
    };
  },
  getters: {
    result(state) {
      const { workflow } = state;
      const { dict: snippets } = useSnippetsStore();

      const ffArgs = new FFmpegCommandLine();
      const stepsOutput = [] as StepStat[];
      type StepStat = {
        step: FFWorkflowStep;
        snippet: FFmpegSnippetWithUI | null;
        warnings: string[];
        summaries: string[];
      };

      workflow.inputs.forEach((x, i) => ffArgs.setInput(i, { path: x.path }));
      ffArgs.output = workflow.outputName;

      workflow.process.forEach((step, i) => {
        const snippet = snippets[step.type];
        const stat: StepStat = {
          step,
          snippet: snippet || null,
          summaries: [],
          warnings: [],
        };
        stepsOutput[i] = stat;

        if (!snippet || step.disabled) return; // skip

        snippet.apply({ ...snippet.defaults, ...step.options }, ffArgs, {
          addSummary: (message) => void stat.summaries.push(message),
          addWarning: (message) => void stat.warnings.push(message),
        });
      });

      return {
        ffArgs,
        stepsOutput,
        cmdArgs: ffArgs.toCommandArguments(),
      };
    },
    suggestedOutputNames(state) {
      const mat = /([^/\\]*)(\.\w+)$/.exec(state.workflow.inputs[0]?.path || '');
      if (!mat) return []
      const [fullName, basename, /* extname */] = mat;
      const type = guessTypeByFilename(fullName);

      const output = [] as Array<{ name: string, title?: string }>
      if (type === 'video') {
        output.push({ name: basename + '.gif', title: 'GIF' })
        output.push({ name: basename + '.m4a', title: 'm4a' })
        output.push({ name: basename + '.mp3', title: 'mp3' })
        output.push({ name: 'frame%03d.jpg' })
      }
      if (type === 'image') {
        output.push({ name: basename + '.mp4', title: 'mp4' })
      }
      if (type === 'audio') {
        output.push({ name: basename + '.mp4', title: 'mp4' })
      }

      return output
    },
    suggestedSnippets(state) {
      const snippetStore = useSnippetsStore();
      const ans = [] as SnippetSuggestion[];

      const usedSnippets = new Set<FFmpegSnippetWithUI>();
      let ignoreOutputSnippets = false;

      state.workflow.process.forEach((x) => {
        const s = snippetStore.dict[x.type];
        if (!s) return;
        if (s.stage === ProcessStage.Output) ignoreOutputSnippets = true;
        usedSnippets.add(s);
      });

      for (const snippet of snippetStore.list) {
        if (usedSnippets.has(snippet)) continue;
        if (snippet.stage === ProcessStage.Output && ignoreOutputSnippets) continue; // usually we only need one Output Snippet

        try {
          for (const partialSuggestion of toArray(snippet.recommend(this.result.ffArgs))) {
            if (!isObject(partialSuggestion)) continue;

            const suggestion: SnippetSuggestion = {
              type: snippet.id,
              title: snippet.title,
              options: {},
              ...partialSuggestion,
            };

            ans.push(suggestion);
          }
        } catch (error) {
          // TODO: print error?
        }
      }

      return ans;
    },
  },
  actions: {
    /** update `workflow.process` and ensure the steps sorted in Stage order */
    updateProcessList(unsortedList?: FFWorkflowStep[]) {
      if (!unsortedList) unsortedList = this.workflow.process;

      const { dict: snippets } = useSnippetsStore();
      const subLists = stageOrderList.map(() => [] as FFWorkflowStep[]);
      const unknownList = [] as FFWorkflowStep[];

      for (const step of unsortedList) {
        const snippet = snippets[step.type];
        const dest = subLists[stageOrderDict[snippet?.stage]] || unknownList;

        dest.push(step);
      }

      const finalList = flatten([...subLists, unknownList]);
      if (finalList.some((s, i) => this.workflow.process[i].id !== s.id)) {
        // order fixed!
        this.workflow.process = finalList;
      }
    },
  },
});
