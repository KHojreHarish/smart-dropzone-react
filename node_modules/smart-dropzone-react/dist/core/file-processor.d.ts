import type { UploadOptions, FileProcessingResult } from "../types";
/**
 * Enhanced file processor with comprehensive validation and error handling
 * Provider-agnostic and highly configurable
 */
export declare class FileProcessor {
    private readonly options;
    constructor(options?: UploadOptions);
    /**
     * Process and validate multiple files with comprehensive error handling
     */
    processFiles(files: readonly File[]): Promise<FileProcessingResult>;
    /**
     * Process a single file with comprehensive validation
     */
    private processFile;
    /**
     * Comprehensive file validation with detailed error messages
     */
    private validateFile;
    /**
     * Generate preview for image files with error handling
     */
    private generatePreview;
    /**
     * Generate unique file ID with collision resistance
     */
    private generateFileId;
    /**
     * Format file size for human-readable display
     */
    static formatFileSize(bytes: number): string;
    /**
     * Get appropriate file icon based on MIME type
     */
    static getFileIcon(type: string): string;
    /**
     * Type checking methods with better accuracy
     */
    static isImage(type: string): boolean;
    static isVideo(type: string): boolean;
    static isAudio(type: string): boolean;
    static isDocument(type: string): boolean;
    static isArchive(type: string): boolean;
    static isCode(type: string): boolean;
    /**
     * Get file category for better organization
     */
    static getFileCategory(type: string): "image" | "video" | "audio" | "document" | "archive" | "code" | "other";
    /**
     * Get file extension from filename
     */
    static getFileExtension(filename: string): string;
    /**
     * Check if file is potentially dangerous
     */
    static isPotentiallyDangerous(filename: string): boolean;
}
//# sourceMappingURL=file-processor.d.ts.map