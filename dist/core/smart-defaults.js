/**
 * Research-based smart defaults
 * Covers 80% of common use cases
 */
export const SMART_DEFAULTS = {
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
        theme: "light",
        variant: "outlined",
        size: "md",
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
        theme: "light",
        variant: "outlined",
        size: "md",
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
        theme: "light",
        variant: "minimal",
        size: "md",
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
        theme: "light",
        variant: "outlined",
        size: "lg",
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
        theme: "light",
        variant: "filled",
        size: "lg",
    },
};
/**
 * Get preset configuration
 */
export function getPreset(presetName) {
    return PRESETS[presetName];
}
/**
 * Merge preset with custom overrides
 */
export function mergePreset(presetName, overrides) {
    const preset = getPreset(presetName);
    return { ...preset, ...overrides };
}
/**
 * Get smart defaults with custom overrides
 */
export function getSmartDefaults(overrides = {}) {
    return { ...SMART_DEFAULTS, ...overrides };
}
//# sourceMappingURL=smart-defaults.js.map