export interface UploadFile {
    readonly id: string;
    readonly file: File;
    readonly name: string;
    readonly size: number;
    readonly type: string;
    readonly preview?: string;
    readonly progress: number;
    readonly status: UploadStatus;
    readonly error?: string;
    readonly publicId?: string;
    readonly url?: string;
    readonly uploadedAt?: Date;
    readonly metadata?: Record<string, any>;
}
export type UploadStatus = "pending" | "uploading" | "success" | "error" | "cancelled";
export interface UploadResponse {
    readonly id: string;
    readonly url: string;
    readonly filename: string;
    readonly size: number;
    readonly mimeType: string;
    readonly metadata?: Record<string, any>;
    readonly createdAt: Date;
}
export interface UploadOptions {
    readonly maxFiles?: number;
    readonly maxFileSize?: number;
    readonly allowedTypes?: readonly string[];
    readonly folder?: string;
    readonly onProgress?: (fileId: string, progress: number) => void;
    readonly onSuccess?: (fileId: string, response: UploadResponse) => void;
    readonly onError?: (fileId: string, error: string) => void;
    readonly onCancel?: (fileId: string) => void;
    readonly metadata?: Record<string, any>;
    readonly tags?: string[];
}
export type { UploadProvider } from "../core/provider";
export interface FileValidationResult {
    readonly valid: boolean;
    readonly error?: string;
    readonly warnings?: readonly string[];
}
export interface UploadProgressEvent {
    readonly fileId: string;
    readonly progress: number;
    readonly bytesLoaded: number;
    readonly bytesTotal: number;
}
export interface FileProcessingResult {
    readonly success: boolean;
    readonly files?: readonly UploadFile[];
    readonly errors?: readonly string[];
}
export interface ThemeConfig {
    readonly mode: "light" | "dark" | "custom";
    readonly variant: "outlined" | "filled" | "minimal";
    readonly size: "sm" | "md" | "lg";
    readonly colors?: {
        readonly primary?: string;
        readonly secondary?: string;
        readonly success?: string;
        readonly error?: string;
        readonly warning?: string;
    };
}
export interface PreviewOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    generateThumbnail?: boolean;
    thumbnailSize?: number;
}
export interface DragReorderOptions {
    enableReordering?: boolean;
    animationDuration?: number;
    dragThreshold?: number;
    snapToGrid?: boolean;
    gridSize?: number;
    constrainToContainer?: boolean;
}
export interface ResumeOptions {
    chunkSize?: number;
    maxConcurrentChunks?: number;
    retryAttempts?: number;
    retryDelay?: number;
    enableResume?: boolean;
    validateChunks?: boolean;
    checksumAlgorithm?: 'md5' | 'sha1' | 'sha256' | 'crc32';
}
export interface SmartDropzoneProps extends UploadOptions {
    readonly className?: string;
    readonly theme?: ThemeConfig | "light" | "dark" | "custom";
    readonly variant?: "outlined" | "filled" | "minimal";
    readonly size?: "sm" | "md" | "lg";
    readonly showPreview?: boolean;
    readonly showProgress?: boolean;
    readonly showFileSize?: boolean;
    readonly showFileType?: boolean;
    readonly onFilesSelected?: (files: readonly UploadFile[]) => void;
    readonly onUploadComplete?: (files: readonly UploadFile[]) => void;
    readonly onValidationError?: (error: string) => void;
    readonly disabled?: boolean;
    readonly accept?: Record<string, string[]>;
    readonly multiple?: boolean;
    readonly maxSize?: number;
    readonly minSize?: number;
    readonly noClick?: boolean;
    readonly noKeyboard?: boolean;
    readonly noDrag?: boolean;
    readonly noDragEventsBubbling?: boolean;
    readonly preventDropOnDocument?: boolean;
    readonly useFsAccessApi?: boolean;
    readonly autoFocus?: boolean;
    readonly tabIndex?: number;
    enableDragReorder?: boolean;
    enableResume?: boolean;
    previewOptions?: PreviewOptions;
    dragReorderOptions?: DragReorderOptions;
    resumeOptions?: ResumeOptions;
    onFileAdded?: (file: File) => void;
    onPreviewGenerated?: (preview: any) => void;
    onReorder?: (fromIndex: number, toIndex: number, newOrder: UploadFile[]) => void;
    onResumeStateChanged?: (fileId: string, state: any) => void;
}
//# sourceMappingURL=index.d.ts.map