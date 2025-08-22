

// Core exports
export { UploadProvider, ProviderFactory } from "./core/provider";
export { FileProcessor } from "./core/file-processor";
export {
  DEFAULT_CONFIG,
  FILE_SIZE,
  TIMING,
  QUALITY,
  DIMENSIONS,
  UPLOAD,
  PERFORMANCE,
  LAYOUT,
  FORMATS,
  COLORS,
  VIDEO,
  ConfigValidator,
  type FileFormatType,
  type ImageFormat,
  type ColorTheme,
  type ComponentSize,
  type ComponentVariant,
} from "./core/config";

// Smart defaults and presets
export {
  SMART_DEFAULTS,
  PRESETS,
  getSmartDefaults,
  getPreset,
  mergePreset,
  type SmartDefaults,
  type PresetName,
} from "./core/smart-defaults";

// Advanced features exports
export { UploadError, ErrorBoundary } from "./core/error-handler";
export {
  PerformanceMonitor,
  PerformanceOptimizer,
} from "./core/performance-monitor";
export {
  InputValidator,
  validateInput,
  type ValidationResult,
} from "./core/validation";
export {
  AccessibilityManager,
  type AccessibilityConfig,
  type AccessibilityTheme,
} from "./core/accessibility";
export {
  InternationalizationManager,
  type I18nConfig,
  type LocaleConfig,
  type Translation,
} from "./core/internationalization";

// New advanced features exports
export {
  FilePreviewManager,
  type PreviewOptions,
  type FilePreview,
} from "./core/file-preview";
export {
  DragReorderManager,
  type DragReorderOptions,
  type DragState,
  type ReorderResult,
} from "./core/drag-reorder";
export {
  UploadResumeManager,
  type ResumeOptions,
  type ResumeState,
  type ResumeResult,
  type UploadChunk,
} from "./core/upload-resume";

// Provider exports
export { CloudinaryProvider } from "./providers/cloudinary";
export type { CloudinaryConfig } from "./providers/cloudinary";

// Component exports
export { SmartDropzone } from "./components/smart-dropzone";
export { FileItem } from "./components/file-item";

// NEW: Simplified components with smart defaults
export { SmartDropzoneSimple } from "./components/smart-dropzone-simple";
export {
  SimpleUpload,
  GalleryUpload,
  DocumentUpload,
  MediaUpload,
  EnterpriseUpload,
} from "./components/smart-dropzone-simple";



// Hook exports
export { useUpload } from "./hooks/use-upload";

// Type exports
export type {
  UploadFile,
  UploadStatus,
  UploadResponse,
  UploadOptions,
  FileValidationResult,
  UploadProgressEvent,
  FileProcessingResult,
  ThemeConfig,
  SmartDropzoneProps,
} from "./types";

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
