import { UploadProvider } from "../core/provider";
import type { UploadOptions, UploadResponse } from "../types";
/**
 * Cloudinary provider configuration
 */
export interface CloudinaryConfig {
    readonly cloudName: string;
    readonly apiKey?: string;
    readonly apiSecret?: string;
    readonly uploadPreset?: string;
    readonly defaultFolder?: string;
}
/**
 * Cloudinary upload provider implementation
 */
export declare class CloudinaryProvider extends UploadProvider {
    private readonly cloudName;
    private readonly uploadPreset?;
    private readonly defaultFolder?;
    private initialized;
    constructor(config: CloudinaryConfig);
    /**
     * Initialize the Cloudinary provider
     */
    initialize(): Promise<void>;
    /**
     * Check if the provider is properly configured
     */
    isConfigured(): boolean;
    /**
     * Upload a single file to Cloudinary
     */
    uploadFile(file: File, options: UploadOptions): Promise<UploadResponse>;
    /**
     * Upload multiple files to Cloudinary
     */
    uploadFiles(files: readonly File[], options: UploadOptions, onProgress?: (fileId: string, progress: number) => void): Promise<UploadResponse[]>;
    /**
     * Delete a file from Cloudinary
     */
    deleteFile(fileId: string): Promise<void>;
    /**
     * Get file information from Cloudinary
     */
    getFileInfo(fileId: string): Promise<UploadResponse | null>;
    /**
     * Generate a preview URL for a file
     */
    generatePreviewUrl(fileId: string, options?: Record<string, any>): string;
    /**
     * Validate provider-specific options
     */
    validateOptions(options: UploadOptions): {
        valid: boolean;
        error?: string;
    };
    /**
     * Get upload statistics
     */
    getStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        provider: string;
    }>;
    /**
     * Test the provider connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Perform the actual upload request to Cloudinary
     */
    private performUpload;
    /**
     * Map Cloudinary response to generic UploadResponse
     */
    private mapCloudinaryResponse;
    /**
     * Build Cloudinary transformations string
     */
    private buildTransformations;
    /**
     * Generate unique file ID for tracking
     */
    private generateFileId;
}
//# sourceMappingURL=cloudinary.d.ts.map