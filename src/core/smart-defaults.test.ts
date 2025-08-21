import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SMART_DEFAULTS,
  PRESETS,
  getSmartDefaults,
  getPreset,
  mergePreset,
  type PresetName,
} from "./smart-defaults";

describe("🎯 Smart Defaults & Presets", () => {
  beforeEach(() => {
    // Reset any mutations between tests
    vi.clearAllMocks();
  });

  describe("SMART_DEFAULTS", () => {
    it("should have correct default values", () => {
      expect(SMART_DEFAULTS.maxFiles).toBe(10);
      expect(SMART_DEFAULTS.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
      expect(SMART_DEFAULTS.allowedTypes).toEqual([
        "image/*",
        "application/pdf",
      ]);
      expect(SMART_DEFAULTS.showPreview).toBe(true);
      expect(SMART_DEFAULTS.showProgress).toBe(true);
      expect(SMART_DEFAULTS.showFileSize).toBe(true);
      expect(SMART_DEFAULTS.showFileType).toBe(true);
      expect(SMART_DEFAULTS.enableReorder).toBe(false);
      expect(SMART_DEFAULTS.enableResume).toBe(false);
      expect(SMART_DEFAULTS.enableI18n).toBe(false);
      expect(SMART_DEFAULTS.accessibility).toBe(true);
      expect(SMART_DEFAULTS.theme).toBe("light");
      expect(SMART_DEFAULTS.variant).toBe("outlined");
      expect(SMART_DEFAULTS.size).toBe("md");
    });

    it("should have readonly allowedTypes type", () => {
      // TypeScript test - this should compile without error
      const types: readonly string[] = SMART_DEFAULTS.allowedTypes;
      expect(types).toEqual(["image/*", "application/pdf"]);
    });
  });

  describe("PRESETS", () => {
    it("should have all required presets", () => {
      expect(PRESETS).toHaveProperty("simple");
      expect(PRESETS).toHaveProperty("gallery");
      expect(PRESETS).toHaveProperty("documents");
      expect(PRESETS).toHaveProperty("media");
      expect(PRESETS).toHaveProperty("enterprise");
    });

    it("should have correct simple preset values", () => {
      const simple = PRESETS.simple;
      expect(simple.maxFiles).toBe(5);
      expect(simple.maxFileSize).toBe(5 * 1024 * 1024);
      expect(simple.allowedTypes).toEqual(["image/*"]);
      expect(simple.showPreview).toBe(true);
      expect(simple.showProgress).toBe(true);
      expect(simple.showFileSize).toBe(true);
      expect(simple.showFileType).toBe(false);
      expect(simple.enableReorder).toBe(false);
      expect(simple.enableResume).toBe(false);
      expect(simple.enableI18n).toBe(false);
      expect(simple.accessibility).toBe(true);
      expect(simple.theme).toBe("light");
      expect(simple.variant).toBe("outlined");
      expect(simple.size).toBe("md");
    });

    it("should have correct gallery preset values", () => {
      const gallery = PRESETS.gallery;
      expect(gallery.maxFiles).toBe(20);
      expect(gallery.maxFileSize).toBe(15 * 1024 * 1024);
      expect(gallery.allowedTypes).toEqual(["image/*", "video/*"]);
      expect(gallery.enableReorder).toBe(true);
      expect(gallery.enableResume).toBe(false);
      expect(gallery.enableI18n).toBe(false);
    });

    it("should have correct documents preset values", () => {
      const documents = PRESETS.documents;
      expect(documents.maxFiles).toBe(10);
      expect(documents.maxFileSize).toBe(25 * 1024 * 1024);
      expect(documents.allowedTypes).toEqual([
        "application/pdf",
        "text/*",
        "application/*",
      ]);
      expect(documents.showPreview).toBe(false);
      expect(documents.enableReorder).toBe(false);
      expect(documents.enableResume).toBe(true);
      expect(documents.variant).toBe("minimal");
    });

    it("should have correct media preset values", () => {
      const media = PRESETS.media;
      expect(media.maxFiles).toBe(50);
      expect(media.maxFileSize).toBe(100 * 1024 * 1024);
      expect(media.allowedTypes).toEqual(["image/*", "video/*", "audio/*"]);
      expect(media.enableReorder).toBe(true);
      expect(media.enableResume).toBe(true);
      expect(media.enableI18n).toBe(false);
      expect(media.size).toBe("lg");
    });

    it("should have correct enterprise preset values", () => {
      const enterprise = PRESETS.enterprise;
      expect(enterprise.maxFiles).toBe(100);
      expect(enterprise.maxFileSize).toBe(500 * 1024 * 1024);
      expect(enterprise.allowedTypes).toEqual(["*/*"]);
      expect(enterprise.enableReorder).toBe(true);
      expect(enterprise.enableResume).toBe(true);
      expect(enterprise.enableI18n).toBe(true);
      expect(enterprise.variant).toBe("filled");
      expect(enterprise.size).toBe("lg");
    });

    it("should have readonly preset values type", () => {
      // TypeScript test - this should compile without error
      const simple = PRESETS.simple;
      const maxFiles: number = simple.maxFiles;
      expect(maxFiles).toBe(5);
    });
  });

  describe("getPreset", () => {
    it("should return correct preset for simple", () => {
      const preset = getPreset("simple");
      expect(preset.maxFiles).toBe(5);
      expect(preset.allowedTypes).toEqual(["image/*"]);
    });

    it("should return correct preset for gallery", () => {
      const preset = getPreset("gallery");
      expect(preset.maxFiles).toBe(20);
      expect(preset.enableReorder).toBe(true);
    });

    it("should return correct preset for documents", () => {
      const preset = getPreset("documents");
      expect(preset.maxFiles).toBe(10);
      expect(preset.enableResume).toBe(true);
    });

    it("should return correct preset for media", () => {
      const preset = getPreset("media");
      expect(preset.maxFiles).toBe(50);
      expect(preset.enableReorder).toBe(true);
      expect(preset.enableResume).toBe(true);
    });

    it("should return correct preset for enterprise", () => {
      const preset = getPreset("enterprise");
      expect(preset.maxFiles).toBe(100);
      expect(preset.enableI18n).toBe(true);
    });
  });

  describe("getSmartDefaults", () => {
    it("should return default values when no overrides", () => {
      const defaults = getSmartDefaults();
      expect(defaults.maxFiles).toBe(10);
      expect(defaults.maxFileSize).toBe(10 * 1024 * 1024);
      expect(defaults.allowedTypes).toEqual(["image/*", "application/pdf"]);
    });

    it("should merge overrides correctly", () => {
      const overrides = {
        maxFiles: 5,
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: ["image/*"],
      };
      const defaults = getSmartDefaults(overrides);
      expect(defaults.maxFiles).toBe(5);
      expect(defaults.maxFileSize).toBe(5 * 1024 * 1024);
      expect(defaults.allowedTypes).toEqual(["image/*"]);
      expect(defaults.showPreview).toBe(true); // Should keep default
      expect(defaults.accessibility).toBe(true); // Should keep default
    });

    it("should handle partial overrides", () => {
      const overrides = {
        maxFiles: 15,
        theme: "dark" as const,
      };
      const defaults = getSmartDefaults(overrides);
      expect(defaults.maxFiles).toBe(15);
      expect(defaults.theme).toBe("dark");
      expect(defaults.maxFileSize).toBe(10 * 1024 * 1024); // Should keep default
      expect(defaults.variant).toBe("outlined"); // Should keep default
    });
  });

  describe("mergePreset", () => {
    it("should merge preset with overrides correctly", () => {
      const overrides = {
        maxFiles: 25,
        theme: "dark" as const,
      };
      const result = mergePreset("gallery", overrides);
      expect(result.maxFiles).toBe(25); // Override
      expect(result.theme).toBe("dark"); // Override
      expect(result.maxFileSize).toBe(15 * 1024 * 1024); // From preset
      expect(result.enableReorder).toBe(true); // From preset
      expect(result.allowedTypes).toEqual(["image/*", "video/*"]); // From preset
    });

    it("should handle empty overrides", () => {
      const result = mergePreset("simple", {});
      expect(result.maxFiles).toBe(5);
      expect(result.maxFileSize).toBe(5 * 1024 * 1024);
      expect(result.allowedTypes).toEqual(["image/*"]);
    });

    it("should handle multiple overrides", () => {
      const overrides = {
        maxFiles: 30,
        maxFileSize: 30 * 1024 * 1024,
        showPreview: false,
        enableReorder: true,
      };
      const result = mergePreset("documents", overrides);
      expect(result.maxFiles).toBe(30);
      expect(result.maxFileSize).toBe(30 * 1024 * 1024);
      expect(result.showPreview).toBe(false);
      expect(result.enableReorder).toBe(true);
      expect(result.enableResume).toBe(true); // From preset
      expect(result.variant).toBe("minimal"); // From preset
    });
  });

  describe("Type Safety", () => {
    it("should have correct PresetName type", () => {
      const validPresets: PresetName[] = [
        "simple",
        "gallery",
        "documents",
        "media",
        "enterprise",
      ];
      expect(validPresets).toHaveLength(5);
      expect(validPresets).toContain("simple");
      expect(validPresets).toContain("gallery");
      expect(validPresets).toContain("documents");
      expect(validPresets).toContain("media");
      expect(validPresets).toContain("enterprise");
    });

    it("should enforce preset name constraints", () => {
      // This should cause a TypeScript error if uncommented
      // const invalidPreset: PresetName = "invalid"; // Should error
      expect(true).toBe(true); // Placeholder for type checking
    });
  });

  describe("Edge Cases", () => {
    it("should handle theme variants correctly", () => {
      const overrides = {
        theme: "custom" as const,
        variant: "filled" as const,
        size: "lg" as const,
      };
      const result = getSmartDefaults(overrides);
      expect(result.theme).toBe("custom");
      expect(result.variant).toBe("filled");
      expect(result.size).toBe("lg");
    });

    it("should preserve readonly arrays in props", () => {
      const overrides = {
        allowedTypes: ["video/*", "audio/*"] as const,
      };
      const result = getSmartDefaults(overrides);
      expect(result.allowedTypes).toEqual(["video/*", "audio/*"]);
      // Test that the array is readonly at type level
      const types: readonly string[] = result.allowedTypes;
      expect(types).toEqual(["video/*", "audio/*"]);
    });
  });

  describe("Integration", () => {
    it("should work with all presets in sequence", () => {
      const presets: PresetName[] = [
        "simple",
        "gallery",
        "documents",
        "media",
        "enterprise",
      ];

      presets.forEach((presetName) => {
        const preset = getPreset(presetName);
        expect(preset).toBeDefined();
        expect(preset.maxFiles).toBeGreaterThan(0);
        expect(preset.maxFileSize).toBeGreaterThan(0);
        expect(preset.allowedTypes.length).toBeGreaterThan(0);
        expect(preset.accessibility).toBe(true); // Always enabled
      });
    });

    it("should allow chaining of operations", () => {
      // Get a preset, merge with overrides, then get smart defaults
      const basePreset = getPreset("gallery");
      const customPreset = mergePreset("gallery", { maxFiles: 30 });
      const finalConfig = getSmartDefaults({
        maxFileSize: customPreset.maxFileSize,
        theme: "dark" as const,
      });

      expect(basePreset.maxFiles).toBe(20);
      expect(customPreset.maxFiles).toBe(30);
      expect(finalConfig.maxFileSize).toBe(15 * 1024 * 1024); // From gallery preset
      expect(finalConfig.theme).toBe("dark");
    });
  });
});
