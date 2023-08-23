import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

declare var __dirname: string;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [UnoCSS(), vue()],
  resolve: {
    alias: {
      lodash: "lodash-es",
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
