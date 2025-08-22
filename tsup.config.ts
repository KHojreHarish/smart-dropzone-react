import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    // Main entry point (full package)
    index: "src/index.ts",

    // Individual components for tree shaking - these should be self-contained
    "components/smart-dropzone": "src/components/smart-dropzone.tsx",
    "components/smart-dropzone-simple":
      "src/components/smart-dropzone-simple.tsx",
    "components/file-item": "src/components/file-item.tsx",

    // Individual hooks
    "hooks/use-upload": "src/hooks/use-upload.ts",

    // Individual providers
    "providers/cloudinary": "src/providers/cloudinary.ts",

    // Core utilities
    "core/smart-defaults": "src/core/smart-defaults.ts",
    "core/file-processor": "src/core/file-processor.ts",
    "core/provider": "src/core/provider.ts",
    "core/validation": "src/core/validation.ts",
    "core/error-handler": "src/core/error-handler.ts",
    "core/performance-monitor": "src/core/performance-monitor.ts",
    "core/accessibility": "src/core/accessibility.ts",
    "core/internationalization": "src/core/internationalization.ts",
    "core/file-preview": "src/core/file-preview.ts",
    "core/drag-reorder": "src/core/drag-reorder.ts",
    "core/upload-resume": "src/core/upload-resume.ts",

    // Preset components for common use cases
    "components/simple-upload": "src/components/smart-dropzone-simple.tsx",
    "components/gallery-upload": "src/components/smart-dropzone-simple.tsx",
    "components/document-upload": "src/components/smart-dropzone-simple.tsx",
    "components/media-upload": "src/components/smart-dropzone-simple.tsx",
    "components/enterprise-upload": "src/components/smart-dropzone-simple.tsx",
  },

  format: ["esm", "cjs"],
  dts: true,
  splitting: true, // Enable code splitting for tree shaking
  sourcemap: true,
  clean: true,
  treeshake: true, // Aggressive tree shaking for bundle optimization
  minify: true, // Minify output for production

  // External dependencies (won't be bundled)
  external: ["react", "react-dom"],

  // ESBuild options for optimization
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.jsxImportSource = "react";
    options.target = "es2020";

    // Ensure proper module resolution
    options.mainFields = ["module", "main"];
    options.resolveExtensions = [".tsx", ".ts", ".jsx", ".js", ".json"];

    // Keep console logs for debugging (remove in production if needed)
    if (options.minify) {
      options.drop = ["debugger"]; // Keep console logs
    }
  },

  // Bundle optimization - bundle dependencies for individual components
  noExternal: [
    "class-variance-authority",
    "clsx",
    "react-dropzone",
    "tailwind-merge",
  ],

  // Output optimization
  outDir: "dist",

  // Success callback
  onSuccess: "tsc --emitDeclarationOnly --declaration",

  // Bundle analysis (optional)
  // metafile: true,
});
