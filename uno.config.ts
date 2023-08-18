import { defineConfig, presetIcons, presetUno, transformerDirectives } from "unocss";

export default defineConfig({
  transformers: [transformerDirectives()],
  presets: [
    presetUno(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
      collections: {
        mdi: () => import("@iconify-json/mdi/icons.json").then((i) => i.default),
      },
    }),
  ],
});
