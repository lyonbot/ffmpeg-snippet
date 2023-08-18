import { forEach } from "lodash";
import { Component } from "vue";
import { FFSnippet } from "@/common/snippet";

export interface ParamsComponentExposes {
  options: Record<string, any>;
}

export interface FFmpegSnippetWithUI extends FFSnippet<any> {
  id: string;
  component: Component;
}

export function loadSnippets() {
  const rawSnippets = import.meta.glob("./**/*.vue", { eager: true });
  const snippets = [] as FFmpegSnippetWithUI[];

  forEach(rawSnippets, (module: any, key) => {
    const id = key.slice(2, -4);
    const component = module.default as Component;
    const meta = module.meta as FFSnippet<any> | undefined;

    if (!meta) return;

    snippets.push({
      id,
      ...meta,
      component,
    });
  });

  return snippets;
}
