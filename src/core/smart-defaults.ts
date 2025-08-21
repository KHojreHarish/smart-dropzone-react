import type { ThemeConfig } from "../types";

/**
 * Smart Defaults & Presets for Smart Dropzone
 *
 * Based on research of what 80% of developers actually need
 * These defaults provide excellent UX out of the box
 */

export interface SmartDefaults {
  // File handling
  maxFiles: number;
  maxFileSize: number;
  allowedTypes: readonly string[];

  // Preview & UI
  showPreview: boolean;
  showProgress: boolean;
  showFileSize: boolean;
  showFileType: boolean;

  // Advanced features (disabled by default)
  enableReorder: boolean;
  enableResume: boolean;
  enableI18n: boolean;

  // Accessibility (always enabled)
  accessibility: boolean;

  // Theme & styling - compatible with SmartDropzoneProps
  theme: ThemeConfig | "light" | "dark" | "custom";
  variant: "outlined" | "filled" | "minimal";
  size: "sm" | "md" | "lg";
}

/**
 * Research-based smart defaults
 * Covers 80% of common use cases
 */
export const SMART_DEFAULTS: SmartDefaults = {
  // File handling - optimized for most use cases
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ["image/*", "application/pdf"],

  // Preview & UI - what users expect
  showPreview: true,
  showProgress: true,
  showFileSize: true,
  showFileType: true,

  // Advanced features - disabled by default
  enableReorder: false,
  enableResume: false,
  enableI18n: false,

  // Accessibility - always enabled
  accessibility: true,

  // Theme - clean, professional look
  theme: "light",
  variant: "outlined",
  size: "md",
};

/**
 * Preset configurations for common use cases
 */
export const PRESETS = {
  // Simple upload (blog, contact form, basic apps)
  simple: {
    maxFiles: 5,
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ["image/*"],
    showPreview: true,
    showProgress: true,
    showFileSize: true,
    showFileType: false,
    enableReorder: false,
    enableResume: false,
    enableI18n: false,
    accessibility: true,
    theme: "light" as const,
    variant: "outlined" as const,
    size: "md" as const,
  },

  // Gallery upload (portfolio, social media, photo apps)
  gallery: {
    maxFiles: 20,
    maxFileSize: 15 * 1024 * 1024,
    allowedTypes: ["image/*", "video/*"],
    showPreview: true,
    showProgress: true,
    showFileSize: true,
    showFileType: true,
    enableReorder: true,
    enableResume: false,
    enableI18n: false,
    accessibility: true,
    theme: "light" as const,
    variant: "outlined" as const,
    size: "md" as const,
  },

  // Document upload (business, legal, enterprise)
  documents: {
    maxFiles: 10,
    maxFileSize: 25 * 1024 * 1024,
    allowedTypes: ["application/pdf", "text/*", "application/*"],
    showPreview: false,
    showProgress: true,
    showFileSize: true,
    showFileType: true,
    enableReorder: false,
    enableResume: true,
    enableI18n: false,
    accessibility: true,
    theme: "light" as const,
    variant: "minimal" as const,
    size: "md" as const,
  },

  // Media upload (content creation, video platforms)
  media: {
    maxFiles: 50,
    maxFileSize: 100 * 1024 * 1024,
    allowedTypes: ["image/*", "video/*", "audio/*"],
    showPreview: true,
    showProgress: true,
    showFileSize: true,
    showFileType: true,
    enableReorder: true,
    enableResume: true,
    enableI18n: false,
    accessibility: true,
    theme: "light" as const,
    variant: "outlined" as const,
    size: "lg" as const,
  },

  // Enterprise (large scale, business critical)
  enterprise: {
    maxFiles: 100,
    maxFileSize: 500 * 1024 * 1024,
    allowedTypes: ["*/*"],
    showPreview: true,
    showProgress: true,
    showFileSize: true,
    showFileType: true,
    enableReorder: true,
    enableResume: true,
    enableI18n: true,
    accessibility: true,
    theme: "light" as const,
    variant: "filled" as const,
    size: "lg" as const,
  },
} as const;

export type PresetName = keyof typeof PRESETS;

/**
 * Get preset configuration
 */
export function getPreset(presetName: PresetName): SmartDefaults {
  return PRESETS[presetName];
}

/**
 * Merge preset with custom overrides
 */
export function mergePreset(
  presetName: PresetName,
  overrides: Partial<SmartDefaults>
): SmartDefaults {
  const preset = getPreset(presetName);
  return { ...preset, ...overrides };
}

/**
 * Get smart defaults with custom overrides
 */
export function getSmartDefaults(
  overrides: Partial<SmartDefaults> = {}
): SmartDefaults {
  return { ...SMART_DEFAULTS, ...overrides };
}
