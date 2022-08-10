/// <reference types="./env" />
import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import svgLoader from "vite-svg-loader";

// https://github.com/vbenjs/vite-plugin-html
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envVars = loadEnv(mode, process.cwd()) as any as ImportMetaEnv;
  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router", "@vueuse/core"],
        resolvers: [ElementPlusResolver()],
        dts: true,
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: true,
      }),
      svgLoader({
        svgo: false,
      }),
      createHtmlPlugin({
        minify: mode === "production",
        inject: {
          data: {
            title: envVars.VITE_WEBSITE_TITLE,
            description: envVars.VITE_WEBSITE_DESCRIPTION,
            favicon: envVars.VITE_WEBSITE_FAVICON,
          },
        },
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    base: mode === "development" ? "/" : "/path-finder/",
  };
});
