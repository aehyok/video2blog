import path, { resolve } from "path";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";
import vue from "@vitejs/plugin-vue";

function pathResolve(dir: string) {
  return resolve(process.cwd(), ".", dir);
}

export default defineConfig({
  build: {
    minify: true,
  },
  plugins: [
    vue(),
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          build: {
            rollupOptions: {
              external: ["sqlite3", "sharp"],
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
      renderer: {
        resolve: {
          sqlite3: { type: "cjs" },
          sharp: { type: "cjs" }
        },
      },
    }),
  ],
  // 别名
  resolve: {
    alias: [
      // @/xxxx => src/xxxx
      {
        find: /\@\//,
        replacement: `${pathResolve("src")}/`,
      },
      // #/xxxx => types/xxxx
      {
        find: /\#\//,
        replacement: `${pathResolve("types")}/`,
      },
    ],
    dedupe: ["vue"],
  },
});
