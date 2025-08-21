# 📚 Smart Dropzone API Reference

Complete API documentation for `@tanflare/smart-dropzone` package.

## 📋 Table of Contents

- [Components](#components)
- [Hooks](#hooks)
- [Providers](#providers)
- [Core Classes](#core-classes)
- [Types](#types)
- [Utilities](#utilities)

## 🧩 Components

### SmartDropzoneSimple

The recommended component for most use cases. Provides smart defaults and preset configurations.

```tsx
import { SmartDropzoneSimple } from "@tanflare/smart-dropzone";

<SmartDropzoneSimple
  preset="gallery"
  cloudinary={{ cloudName: "demo", uploadPreset: "demo" }}
  overrides={{ maxFiles: 50 }}
  onFilesAdded={handleFiles}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `PresetName` | `undefined` | Use a preset configuration |
| `cloudinary` | `CloudinaryConfig` | **Required** | Cloudinary configuration |
| `overrides` | `Partial<SmartDropzoneProps>` | `{}` | Override preset/default values |
| `...props` | `SmartDropzoneProps` | - | All SmartDropzone props |

#### Preset Options

- `"simple"` - Basic upload (5 files, 5MB, images only)
- `"gallery"` - Gallery upload (20 files, 15MB, images/videos, reordering)
- `"documents"` - Document upload (10 files, 25MB, documents, resume)
- `"media"` - Media upload (50 files, 100MB, all media, reordering, resume)
- `"enterprise"` - Enterprise (100 files, 500MB, all features)

### Preset Components

Pre-configured components for common use cases:

```tsx
import { 
  SimpleUpload, 
  GalleryUpload, 
  DocumentUpload, 
  MediaUpload, 
  EnterpriseUpload 
} from "@tanflare/smart-dropzone";

// Simple blog/contact form upload
<SimpleUpload
  cloudinary={{ cloudName: "demo", uploadPreset: "demo" }}
  onFilesAdded={handleFiles}
/>

// Gallery with reordering
<GalleryUpload
  cloudinary={{ cloudName: "demo", uploadPreset: "demo" }}
  onFilesAdded={handleFiles}
/>
```

### SmartDropzone

Advanced component with full control over all features.

```tsx
import { SmartDropzone, CloudinaryProvider } from "@tanflare/smart-dropzone";

const provider = new CloudinaryProvider({
  cloudName: "your-cloud-name",
  uploadPreset: "your-upload-preset",
});

<SmartDropzone
  provider={provider}
  maxFiles={20}
  maxFileSize={50 * 1024 * 1024}
  showPreview={true}
  showProgress={true}
  onFilesAdded={handleFiles}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `provider` | `UploadProvider` | **Required** | Upload provider instance |
| `maxFiles` | `number` | `10` | Maximum number of files |
| `maxFileSize` | `number` | `10MB` | Maximum file size in bytes |
| `allowedTypes` | `string[]` | `['image/*', 'application/pdf']` | Allowed MIME types |
| `showPreview` | `boolean` | `true` | Show file previews |
| `showProgress` | `boolean` | `true` | Show upload progress |
| `showFileSize` | `boolean` | `true` | Show file size |
| `showFileType` | `boolean` | `true` | Show file type |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme variant |
| `variant` | `'outlined' \| 'filled' \| 'minimal'` | `'outlined'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `onFilesAdded` | `(files: File[]) => void` | - | Files added callback |
| `onUploadComplete` | `(files: UploadFile[]) => void` | - | Upload complete callback |
| `onValidationError` | `(error: string) => void` | - | Validation error callback |

### FileItem

Individual file display component.

```tsx
import { FileItem } from "@tanflare/smart-dropzone";

<FileItem
  file={file}
  progress={uploadProgress}
  onRemove={removeFile}
  onRetry={retryUpload}
  onCancel={cancelUpload}
  showPreview={true}
  showProgress={true}
  theme="light"
/>
```

## 🪝 Hooks

### useUpload

Custom hook for managing upload state and operations.

```tsx
import { useUpload } from "@tanflare/smart-dropzone";

const {
  files,
  isUploading,
  error,
  uploadProgress,
  addFiles,
  removeFile,
  uploadAll,
  retryUpload,
  cancelUpload,
} = useUpload(provider, options);
```

#### Parameters

- `provider: UploadProvider` - Upload provider instance
- `options: UploadOptions` - Upload configuration options

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `files` | `UploadFile[]` | Array of uploaded files |
| `isUploading` | `boolean` | Upload in progress flag |
| `error` | `string \| null` | Current error message |
| `uploadProgress` | `Record<string, number>` | Upload progress by file ID |
| `addFiles` | `(files: File[]) => Promise<FileProcessingResult>` | Add files function |
| `removeFile` | `(fileId: string) => void` | Remove file function |
| `uploadAll` | `() => Promise<UploadResponse[]>` | Upload all files function |
| `retryUpload` | `(fileId: string) => Promise<void>` | Retry upload function |
| `cancelUpload` | `(fileId: string) => void` | Cancel upload function |

## 🚀 Providers

### CloudinaryProvider

Cloudinary upload provider implementation.

```tsx
import { CloudinaryProvider } from "@tanflare/smart-dropzone";

const provider = new CloudinaryProvider({
  cloudName: "your-cloud-name",
  uploadPreset: "your-upload-preset",
  defaultFolder: "uploads",
});

await provider.initialize();
```

#### Configuration

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `cloudName` | `string` | ✅ | Cloudinary cloud name |
| `uploadPreset` | `string` | ✅ | Upload preset name |
| `defaultFolder` | `string` | ❌ | Default upload folder |
| `apiKey` | `string` | ❌ | API key (for server-side) |
| `apiSecret` | `string` | ❌ | API secret (for server-side) |

#### Methods

- `initialize(): Promise<void>` - Initialize provider
- `uploadFile(file: File, options: UploadOptions): Promise<UploadResponse>` - Upload single file
- `uploadFiles(files: File[], options: UploadOptions): Promise<UploadResponse[]>` - Upload multiple files
- `deleteFile(fileId: string): Promise<void>` - Delete file
- `getFileInfo(fileId: string): Promise<UploadResponse | null>` - Get file info
- `generatePreviewUrl(fileId: string, options?: any): string` - Generate preview URL

## 🔧 Core Classes

### FileProcessor

Handles file processing, validation, and preview generation.

```tsx
import { FileProcessor } from "@tanflare/smart-dropzone";

const processor = new FileProcessor(options);
const result = await processor.processFiles(files);
```

### FilePreviewManager

Manages file preview generation and caching.

```tsx
import { FilePreviewManager } from "@tanflare/smart-dropzone";

const manager = FilePreviewManager.getInstance();
const preview = await manager.generatePreview(file, options);
```

### DragReorderManager

Handles drag and drop reordering functionality.

```tsx
import { DragReorderManager } from "@tanflare/smart-dropzone";

const manager = new DragReorderManager({
  enableReordering: true,
  animationDuration: 300,
});
```

### UploadResumeManager

Manages upload resumption and chunked uploads.

```tsx
import { UploadResumeManager } from "@tanflare/smart-dropzone";

const manager = UploadResumeManager.getInstance();
const result = await manager.resumeUpload(fileId, provider);
```

### PerformanceMonitor

Tracks performance metrics and optimization.

```tsx
import { PerformanceMonitor } from "@tanflare/smart-dropzone";

const monitor = PerformanceMonitor.getInstance();
monitor.startRender();
const metrics = monitor.getMetrics();
```

### AccessibilityManager

Manages accessibility features and configurations.

```tsx
import { AccessibilityManager } from "@tanflare/smart-dropzone";

const manager = AccessibilityManager.getInstance();
manager.updateConfig({
  enableHighContrast: true,
  enableReducedMotion: true,
});
```

### InternationalizationManager

Handles multi-language support and localization.

```tsx
import { InternationalizationManager } from "@tanflare/smart-dropzone";

const manager = InternationalizationManager.getInstance();
manager.setLocale("es");
const translation = manager.getTranslation("dropzone.title");
```

## 📝 Types

### UploadFile

```tsx
interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: UploadStatus;
  progress: number;
  url?: string;
  error?: string;
  preview?: string;
  metadata?: Record<string, any>;
}
```

### UploadStatus

```tsx
type UploadStatus = 
  | "pending"    // File added, not yet uploaded
  | "uploading"  // Currently uploading
  | "uploaded"   // Successfully uploaded
  | "failed"     // Upload failed
  | "cancelled"  // Upload cancelled
  | "processing" // File being processed
```

### UploadResponse

```tsx
interface UploadResponse {
  success: boolean;
  fileId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any>;
  error?: string;
}
```

### SmartDefaults

```tsx
interface SmartDefaults {
  maxFiles: number;
  maxFileSize: number;
  allowedTypes: string[];
  showPreview: boolean;
  showProgress: boolean;
  showFileSize: boolean;
  showFileType: boolean;
  enableReorder: boolean;
  enableResume: boolean;
  enableI18n: boolean;
  accessibility: boolean;
  theme: 'light' | 'dark';
  variant: 'outlined' | 'filled' | 'minimal';
  size: 'sm' | 'md' | 'lg';
}
```

## 🛠️ Utilities

### Smart Defaults

```tsx
import { 
  SMART_DEFAULTS, 
  PRESETS, 
  getSmartDefaults, 
  getPreset, 
  mergePreset 
} from "@tanflare/smart-dropzone";

// Get smart defaults
const defaults = getSmartDefaults();

// Get preset configuration
const galleryPreset = getPreset("gallery");

// Merge preset with overrides
const config = mergePreset("gallery", { maxFiles: 50 });
```

### File Utilities

```tsx
import { FileProcessor } from "@tanflare/smart-dropzone";

// Format file size
const size = FileProcessor.formatFileSize(1024 * 1024); // "1 MB"

// Get file icon
const icon = FileProcessor.getFileIcon("image/jpeg"); // "🖼️"

// Check file type
const isImage = FileProcessor.isImage("image/png"); // true
const isVideo = FileProcessor.isVideo("video/mp4"); // true
const isDocument = FileProcessor.isDocument("application/pdf"); // true
```

### Validation

```tsx
import { InputValidator } from "@tanflare/smart-dropzone";

// Validate file
const result = InputValidator.validateFile(file);
if (!result.isValid) {
  console.log("Validation errors:", result.errors);
}

// Validate file list
const listResult = InputValidator.validateFileList(files);
```

### Error Handling

```tsx
import { UploadError } from "@tanflare/smart-dropzone";

// Create specific error types
const validationError = UploadError.validationError("File too large", "large.jpg");
const uploadError = UploadError.uploadError("Network failed", "file123", "test.jpg");
const networkError = UploadError.networkError("Connection lost", "file123");
```

## 📱 Browser Support

- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+
- **Mobile**: iOS 14+, Android Chrome 88+

## 🔒 Security Features

- File type validation
- File size limits
- Input sanitization
- Error boundaries
- Type safety (TypeScript)
- No sensitive data leakage

## ♿ Accessibility Features

- Screen reader support
- Keyboard navigation
- High contrast mode
- Reduced motion support
- ARIA labels and descriptions
- Focus management

## 🌍 Internationalization

- Built-in translations (EN, ES, FR, DE, JA)
- Locale switching
- Cultural formatting
- Extensible translation system
- RTL support

## 📊 Performance Features

- Lazy loading
- Memory management
- Progress tracking
- Upload resumption
- Chunked uploads
- Performance monitoring
