import type { UploadFile, UploadOptions } from "../types";
import type { UploadProvider } from "../core/provider";
/**
 * Hook for managing file uploads with a specific provider
 */
export declare function useUpload(provider: UploadProvider, options?: UploadOptions): {
    files: UploadFile[];
    isUploading: boolean;
    error: string | null;
    uploadProgress: Record<string, number>;
    pendingFiles: UploadFile[];
    uploadingFiles: UploadFile[];
    successFiles: UploadFile[];
    errorFiles: UploadFile[];
    cancelledFiles: UploadFile[];
    totalSize: number;
    uploadedSize: number;
    addFiles: (newFiles: readonly File[]) => Promise<{
        success: boolean;
        files: readonly UploadFile[];
        errors?: undefined;
    } | {
        success: boolean;
        errors: readonly string[];
        files?: undefined;
    } | undefined>;
    removeFile: (fileId: string) => void;
    clearAll: () => void;
    uploadFile: (fileId: string, uploadOptions?: UploadOptions) => Promise<import("../types").UploadResponse | undefined>;
    uploadAll: (uploadOptions?: UploadOptions) => Promise<import("../types").UploadResponse[] | undefined>;
    retryUpload: (fileId: string, uploadOptions?: UploadOptions) => Promise<import("../types").UploadResponse | undefined>;
    cancelUpload: (fileId: string) => Promise<void>;
    getStats: () => Promise<{
        totalFiles: number;
        totalSize: number;
        provider: string;
    } | null>;
    testConnection: () => Promise<boolean>;
    hasFiles: boolean;
    hasPendingFiles: boolean;
    hasErrors: boolean;
    isFullyUploaded: boolean;
};
//# sourceMappingURL=use-upload.d.ts.map