import { forEach, keyBy } from "lodash";
import { Component } from "vue";
import { FFmpegSnippet, ParamsComponentFundamental } from "../common/snippet";

export interface FFmpegSnippetWithUI extends FFmpegSnippet<any> {
  id: string;
  component: Component<any, any, ParamsComponentFundamental>;
}

export const snippets = getSnippets();
export const snippetsDict = keyBy(snippets, "id") as Record<string, FFmpegSnippetWithUI>;

function getSnippets() {
  const rawSnippets = import.meta.glob("./**/*.vue", { eager: true });
  const snippets = [] as FFmpegSnippetWithUI[];

  forEach(rawSnippets, (module: any, key) => {
    const id = key.slice(2, -4);
    const component = module.default as Component<any, any, ParamsComponentFundamental>;
    const meta = module.meta as FFmpegSnippet<any> | undefined;

    if (!meta) return;

    snippets.push({
      id,
      ...meta,
      component,
    });
  });

  return snippets;
}
