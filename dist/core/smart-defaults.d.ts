import type { ThemeConfig } from "../types";
/**
 * Smart Defaults & Presets for Smart Dropzone
 *
 * Based on research of what 80% of developers actually need
 * These defaults provide excellent UX out of the box
 */
export interface SmartDefaults {
    maxFiles: number;
    maxFileSize: number;
    allowedTypes: readonly string[];
    showPreview: boolean;
    showProgress: boolean;
    showFileSize: boolean;
    showFileType: boolean;
    enableReorder: boolean;
    enableResume: boolean;
    enableI18n: boolean;
    accessibility: boolean;
    theme: ThemeConfig | "light" | "dark" | "custom";
    variant: "outlined" | "filled" | "minimal";
    size: "sm" | "md" | "lg";
}
/**
 * Research-based smart defaults
 * Covers 80% of common use cases
 */
export declare const SMART_DEFAULTS: SmartDefaults;
/**
 * Preset configurations for common use cases
 */
export declare const PRESETS: {
    readonly simple: {
        readonly maxFiles: 5;
        readonly maxFileSize: number;
        readonly allowedTypes: readonly ["image/*"];
        readonly showPreview: true;
        readonly showProgress: true;
        readonly showFileSize: true;
        readonly showFileType: false;
        readonly enableReorder: false;
        readonly enableResume: false;
        readonly enableI18n: false;
        readonly accessibility: true;
        readonly theme: "light";
        readonly variant: "outlined";
        readonly size: "md";
    };
    readonly gallery: {
        readonly maxFiles: 20;
        readonly maxFileSize: number;
        readonly allowedTypes: readonly ["image/*", "video/*"];
        readonly showPreview: true;
        readonly showProgress: true;
        readonly showFileSize: true;
        readonly showFileType: true;
        readonly enableReorder: true;
        readonly enableResume: false;
        readonly enableI18n: false;
        readonly accessibility: true;
        readonly theme: "light";
        readonly variant: "outlined";
        readonly size: "md";
    };
    readonly documents: {
        readonly maxFiles: 10;
        readonly maxFileSize: number;
        readonly allowedTypes: readonly ["application/pdf", "text/*", "application/*"];
        readonly showPreview: false;
        readonly showProgress: true;
        readonly showFileSize: true;
        readonly showFileType: true;
        readonly enableReorder: false;
        readonly enableResume: true;
        readonly enableI18n: false;
        readonly accessibility: true;
        readonly theme: "light";
        readonly variant: "minimal";
        readonly size: "md";
    };
    readonly media: {
        readonly maxFiles: 50;
        readonly maxFileSize: number;
        readonly allowedTypes: readonly ["image/*", "video/*", "audio/*"];
        readonly showPreview: true;
        readonly showProgress: true;
        readonly showFileSize: true;
        readonly showFileType: true;
        readonly enableReorder: true;
        readonly enableResume: true;
        readonly enableI18n: false;
        readonly accessibility: true;
        readonly theme: "light";
        readonly variant: "outlined";
        readonly size: "lg";
    };
    readonly enterprise: {
        readonly maxFiles: 100;
        readonly maxFileSize: number;
        readonly allowedTypes: readonly ["*/*"];
        readonly showPreview: true;
        readonly showProgress: true;
        readonly showFileSize: true;
        readonly showFileType: true;
        readonly enableReorder: true;
        readonly enableResume: true;
        readonly enableI18n: true;
        readonly accessibility: true;
        readonly theme: "light";
        readonly variant: "filled";
        readonly size: "lg";
    };
};
export type PresetName = keyof typeof PRESETS;
/**
 * Get preset configuration
 */
export declare function getPreset(presetName: PresetName): SmartDefaults;
/**
 * Merge preset with custom overrides
 */
export declare function mergePreset(presetName: PresetName, overrides: Partial<SmartDefaults>): SmartDefaults;
/**
 * Get smart defaults with custom overrides
 */
export declare function getSmartDefaults(overrides?: Partial<SmartDefaults>): SmartDefaults;
//# sourceMappingURL=smart-defaults.d.ts.map