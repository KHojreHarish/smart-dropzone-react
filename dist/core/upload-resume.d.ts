export interface UploadChunk {
    id: string;
    start: number;
    end: number;
    data: Blob;
    uploaded: boolean;
    retryCount: number;
    maxRetries: number;
}
export interface ResumeOptions {
    chunkSize?: number;
    maxConcurrentChunks?: number;
    retryAttempts?: number;
    retryDelay?: number;
    enableResume?: boolean;
    validateChunks?: boolean;
    checksumAlgorithm?: "md5" | "sha1" | "sha256" | "crc32";
}
export interface ResumeState {
    fileId: string;
    fileName: string;
    totalSize: number;
    uploadedSize: number;
    chunks: UploadChunk[];
    status: "paused" | "resuming" | "uploading" | "completed" | "failed";
    lastChunkIndex: number;
    checksum?: string;
    metadata?: Record<string, any>;
}
export interface ResumeResult {
    success: boolean;
    uploadedSize: number;
    totalSize: number;
    chunks: UploadChunk[];
    error?: string;
}
export declare class UploadResumeManager {
    private static instance;
    private static fileIdCounter;
    private resumeStates;
    private options;
    private activeUploads;
    private chunkQueue;
    constructor(options?: ResumeOptions);
    static getInstance(): UploadResumeManager;
    createResumeState(file: File, provider: string): Promise<ResumeState>;
    resumeUpload(fileId: string, provider: any): Promise<ResumeResult>;
    pauseUpload(fileId: string): boolean;
    cancelUpload(fileId: string): boolean;
    getResumeState(fileId: string): ResumeState | undefined;
    getAllResumeStates(): ResumeState[];
    clearResumeState(fileId: string): boolean;
    private createChunks;
    private calculateChecksum;
    private validateExistingChunks;
    private uploadRemainingChunks;
    private uploadChunk;
    private uploadChunkToProvider;
    private emitProgressEvent;
    private generateFileId;
    private delay;
    getUploadProgress(fileId: string): number;
    isUploadActive(fileId: string): boolean;
    getActiveUploads(): string[];
    destroy(): void;
}
//# sourceMappingURL=upload-resume.d.ts.map