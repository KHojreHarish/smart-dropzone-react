import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 8080,
    open: false,
  },
  build: {
    target: "es2020",
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
  },
});
