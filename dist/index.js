// Core exports
export { UploadProvider, ProviderFactory } from "./core/provider";
export { FileProcessor } from "./core/file-processor";
export { DEFAULT_CONFIG, FILE_SIZE, TIMING, QUALITY, DIMENSIONS, UPLOAD, PERFORMANCE, LAYOUT, FORMATS, COLORS, VIDEO, ConfigValidator, } from "./core/config";
// Smart defaults and presets
export { SMART_DEFAULTS, PRESETS, getSmartDefaults, getPreset, mergePreset, } from "./core/smart-defaults";
// Advanced features exports
export { UploadError, ErrorBoundary } from "./core/error-handler";
export { PerformanceMonitor, PerformanceOptimizer, } from "./core/performance-monitor";
export { InputValidator, validateInput, } from "./core/validation";
export { AccessibilityManager, } from "./core/accessibility";
export { InternationalizationManager, } from "./core/internationalization";
// New advanced features exports
export { FilePreviewManager, } from "./core/file-preview";
export { DragReorderManager, } from "./core/drag-reorder";
export { UploadResumeManager, } from "./core/upload-resume";
// Provider exports
export { CloudinaryProvider } from "./providers/cloudinary";
// Component exports
export { SmartDropzone } from "./components/smart-dropzone";
export { FileItem } from "./components/file-item";
// NEW: Simplified components with smart defaults
export { SmartDropzoneSimple } from "./components/smart-dropzone-simple";
export { SimpleUpload, GalleryUpload, DocumentUpload, MediaUpload, EnterpriseUpload } from "./components/smart-dropzone-simple";
// Hook exports
export { useUpload } from "./hooks/use-upload";
// Provider registration
import { ProviderFactory } from "./core/provider";
import { CloudinaryProvider } from "./providers/cloudinary";
// Auto-register built-in providers
ProviderFactory.register("cloudinary", CloudinaryProvider);
// Re-export provider factory for convenience
export { ProviderFactory as UploadProviderFactory };
// Tree-shaking friendly exports
// Import only what you need:
// import { SmartDropzoneSimple } from '@tanflare/smart-dropzone/components/smart-dropzone-simple'
// import { CloudinaryProvider } from '@tanflare/smart-dropzone/providers/cloudinary'
// import { useUpload } from '@tanflare/smart-dropzone/hooks/use-upload'
//# sourceMappingURL=index.js.map