import { FILE_SIZE, UPLOAD, TIMING } from "./config";

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

export class UploadResumeManager {
  private static instance: UploadResumeManager;
  private static fileIdCounter = 0;
  private resumeStates: Map<string, ResumeState> = new Map();
  private options: Required<ResumeOptions>;
  private activeUploads: Set<string> = new Set();
  private chunkQueue: Map<string, UploadChunk[]> = new Map();

  constructor(options: ResumeOptions = {}) {
    this.options = {
      chunkSize: FILE_SIZE.CHUNK_SIZE,
      maxConcurrentChunks: UPLOAD.MAX_CONCURRENT_CHUNKS,
      retryAttempts: UPLOAD.MAX_RETRY_ATTEMPTS,
      retryDelay: TIMING.RETRY_DELAY,
      enableResume: true,
      validateChunks: true,
      checksumAlgorithm: "md5",
      ...options,
    };
  }

  static getInstance(): UploadResumeManager {
    if (!UploadResumeManager.instance) {
      UploadResumeManager.instance = new UploadResumeManager();
    }
    return UploadResumeManager.instance;
  }

  async createResumeState(file: File, provider: string): Promise<ResumeState> {
    const fileId = this.generateFileId(file);
    const chunks = this.createChunks(file);
    const checksum = await this.calculateChecksum(file);

    const resumeState: ResumeState = {
      fileId,
      fileName: file.name,
      totalSize: file.size,
      uploadedSize: 0,
      chunks,
      status: "paused",
      lastChunkIndex: -1,
      checksum,
      metadata: {
        provider,
        mimeType: file.type,
        lastModified: file.lastModified,
        createdAt: Date.now(),
      },
    };

    this.resumeStates.set(fileId, resumeState);
    this.chunkQueue.set(fileId, [...chunks]);

    return resumeState;
  }

  async resumeUpload(fileId: string, provider: any): Promise<ResumeResult> {
    const resumeState = this.resumeStates.get(fileId);
    if (!resumeState) {
      return {
        success: false,
        uploadedSize: 0,
        totalSize: 0,
        chunks: [],
        error: "Resume state not found",
      };
    }

    if (resumeState.status === "completed") {
      return {
        success: true,
        uploadedSize: resumeState.totalSize,
        totalSize: resumeState.totalSize,
        chunks: resumeState.chunks,
      };
    }

    resumeState.status = "resuming";
    this.activeUploads.add(fileId);

    try {
      // Validate existing chunks if validation is enabled
      if (this.options.validateChunks) {
        await this.validateExistingChunks(resumeState, provider);
      }

      // Resume from last successful chunk
      const result = await this.uploadRemainingChunks(resumeState, provider);

      if (result.success) {
        resumeState.status = "completed";
        resumeState.uploadedSize = resumeState.totalSize;
      } else {
        resumeState.status = "failed";
      }

      return result;
    } catch (error) {
      resumeState.status = "failed";
      return {
        success: false,
        uploadedSize: resumeState.uploadedSize,
        totalSize: resumeState.totalSize,
        chunks: resumeState.chunks,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      this.activeUploads.delete(fileId);
    }
  }

  pauseUpload(fileId: string): boolean {
    const resumeState = this.resumeStates.get(fileId);
    if (!resumeState || resumeState.status === "completed") {
      return false;
    }

    resumeState.status = "paused";
    return true;
  }

  cancelUpload(fileId: string): boolean {
    const resumeState = this.resumeStates.get(fileId);
    if (!resumeState) {
      return false;
    }

    // Clean up chunks
    this.chunkQueue.delete(fileId);
    this.activeUploads.delete(fileId);

    // Reset state
    resumeState.status = "paused";
    resumeState.uploadedSize = 0;
    resumeState.chunks.forEach((chunk) => {
      chunk.uploaded = false;
      chunk.retryCount = 0;
    });

    return true;
  }

  getResumeState(fileId: string): ResumeState | undefined {
    return this.resumeStates.get(fileId);
  }

  getAllResumeStates(): ResumeState[] {
    return Array.from(this.resumeStates.values());
  }

  clearResumeState(fileId: string): boolean {
    const removed = this.resumeStates.delete(fileId);
    this.chunkQueue.delete(fileId);
    this.activeUploads.delete(fileId);
    return removed;
  }

  private createChunks(file: File): UploadChunk[] {
    const chunks: UploadChunk[] = [];

    // Handle zero-byte files
    if (file.size === 0) {
      chunks.push({
        id: `${file.name}-chunk-0`,
        start: 0,
        end: 0,
        data: new Blob(),
        uploaded: false,
        retryCount: 0,
        maxRetries: this.options.retryAttempts,
      });
      return chunks;
    }

    const totalChunks = Math.ceil(file.size / this.options.chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.options.chunkSize;
      const end = Math.min(start + this.options.chunkSize, file.size);
      const data = file.slice(start, end);

      chunks.push({
        id: `${file.name}-chunk-${i}`,
        start,
        end,
        data,
        uploaded: false,
        retryCount: 0,
        maxRetries: this.options.retryAttempts,
      });
    }

    return chunks;
  }

  private async calculateChecksum(file: File): Promise<string> {
    // This is a simplified checksum calculation
    // In production, you'd use a proper crypto library
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private async validateExistingChunks(
    resumeState: ResumeState,
    provider: any
  ): Promise<void> {
    // Check with provider which chunks are already uploaded
    try {
      const uploadedChunks =
        (await provider.getUploadedChunks?.(resumeState.fileId)) || [];

      resumeState.chunks.forEach((chunk, index) => {
        if (uploadedChunks.includes(index)) {
          chunk.uploaded = true;
          resumeState.uploadedSize += chunk.end - chunk.start;
          resumeState.lastChunkIndex = Math.max(
            resumeState.lastChunkIndex,
            index
          );
        }
      });
    } catch (error) {
      console.warn("Failed to validate existing chunks:", error);
      // Continue without validation
    }
  }

  private async uploadRemainingChunks(
    resumeState: ResumeState,
    provider: any
  ): Promise<ResumeResult> {
    const remainingChunks = resumeState.chunks.filter(
      (chunk) => !chunk.uploaded
    );

    if (remainingChunks.length === 0) {
      return {
        success: true,
        uploadedSize: resumeState.totalSize,
        totalSize: resumeState.totalSize,
        chunks: resumeState.chunks,
      };
    }

    // Upload chunks with concurrency control
    const uploadPromises: Promise<boolean>[] = [];
    const activeChunks = new Set<string>();

    for (const chunk of remainingChunks) {
      if (activeChunks.size >= this.options.maxConcurrentChunks) {
        // Wait for a chunk to complete before starting another
        await Promise.race(uploadPromises);
        uploadPromises.splice(0, 1);
      }

      const uploadPromise = this.uploadChunk(chunk, resumeState, provider);
      activeChunks.add(chunk.id);

      uploadPromise.then(() => {
        activeChunks.delete(chunk.id);
      });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all remaining uploads to complete
    const results = await Promise.all(uploadPromises);
    const success = results.every((result) => result);

    return {
      success,
      uploadedSize: resumeState.uploadedSize,
      totalSize: resumeState.totalSize,
      chunks: resumeState.chunks,
      error: success ? undefined : "Some chunks failed to upload",
    };
  }

  private async uploadChunk(
    chunk: UploadChunk,
    resumeState: ResumeState,
    provider: any
  ): Promise<boolean> {
    let attempts = 0;
    const maxAttempts = chunk.maxRetries + 1;

    while (attempts < maxAttempts) {
      try {
        const result = await this.uploadChunkToProvider(
          chunk,
          resumeState,
          provider
        );

        if (result) {
          chunk.uploaded = true;
          resumeState.uploadedSize += chunk.end - chunk.start;
          resumeState.lastChunkIndex = Math.max(
            resumeState.lastChunkIndex,
            resumeState.chunks.indexOf(chunk)
          );

          // Emit progress event
          this.emitProgressEvent(resumeState, chunk);
          return true;
        }
      } catch (error) {
        console.warn(`Chunk upload attempt ${attempts + 1} failed:`, error);
        chunk.retryCount++;

        if (attempts < maxAttempts - 1) {
          await this.delay(
            this.options.retryDelay *
              Math.pow(TIMING.RETRY_EXPONENTIAL_BASE, attempts)
          );
        }
      }

      attempts++;
    }

    return false;
  }

  private async uploadChunkToProvider(
    _chunk: UploadChunk,
    _resumeState: ResumeState,
    _provider: any
  ): Promise<boolean> {
    // This would be implemented by the specific provider
    // For now, we'll simulate the upload
    try {
      // Simulate upload delay
      await this.delay(
        Math.random() * UPLOAD.UPLOAD_SIMULATION_DELAY_RANGE +
          UPLOAD.UPLOAD_SIMULATION_DELAY_MIN
      );

      // Simulate success (in real implementation, this would call provider.uploadChunk)
      return true;
    } catch (error) {
      throw new Error(`Failed to upload chunk: ${error}`);
    }
  }

  private emitProgressEvent(
    resumeState: ResumeState,
    chunk: UploadChunk
  ): void {
    const progress = (resumeState.uploadedSize / resumeState.totalSize) * 100;

    // Create a custom event for progress updates
    const event = new CustomEvent("uploadProgress", {
      detail: {
        fileId: resumeState.fileId,
        fileName: resumeState.fileName,
        progress,
        uploadedSize: resumeState.uploadedSize,
        totalSize: resumeState.totalSize,
        chunkId: chunk.id,
        chunkProgress: 100,
      },
    });

    document.dispatchEvent(event);
  }

  private generateFileId(file: File): string {
    UploadResumeManager.fileIdCounter++;
    return `resume-${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${UploadResumeManager.fileIdCounter}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Utility methods for external use
  getUploadProgress(fileId: string): number {
    const resumeState = this.resumeStates.get(fileId);
    if (!resumeState) return 0;

    return (resumeState.uploadedSize / resumeState.totalSize) * 100;
  }

  isUploadActive(fileId: string): boolean {
    return this.activeUploads.has(fileId);
  }

  getActiveUploads(): string[] {
    return Array.from(this.activeUploads);
  }

  // Cleanup method
  destroy(): void {
    this.resumeStates.clear();
    this.chunkQueue.clear();
    this.activeUploads.clear();
  }
}
