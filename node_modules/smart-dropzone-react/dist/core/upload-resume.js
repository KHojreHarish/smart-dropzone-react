import { FILE_SIZE, UPLOAD, TIMING } from "./config";
export class UploadResumeManager {
    constructor(options = {}) {
        Object.defineProperty(this, "resumeStates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "activeUploads", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "chunkQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
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
    static getInstance() {
        if (!UploadResumeManager.instance) {
            UploadResumeManager.instance = new UploadResumeManager();
        }
        return UploadResumeManager.instance;
    }
    async createResumeState(file, provider) {
        const fileId = this.generateFileId(file);
        const chunks = this.createChunks(file);
        const checksum = await this.calculateChecksum(file);
        const resumeState = {
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
    async resumeUpload(fileId, provider) {
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
            }
            else {
                resumeState.status = "failed";
            }
            return result;
        }
        catch (error) {
            resumeState.status = "failed";
            return {
                success: false,
                uploadedSize: resumeState.uploadedSize,
                totalSize: resumeState.totalSize,
                chunks: resumeState.chunks,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
        finally {
            this.activeUploads.delete(fileId);
        }
    }
    pauseUpload(fileId) {
        const resumeState = this.resumeStates.get(fileId);
        if (!resumeState || resumeState.status === "completed") {
            return false;
        }
        resumeState.status = "paused";
        return true;
    }
    cancelUpload(fileId) {
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
    getResumeState(fileId) {
        return this.resumeStates.get(fileId);
    }
    getAllResumeStates() {
        return Array.from(this.resumeStates.values());
    }
    clearResumeState(fileId) {
        const removed = this.resumeStates.delete(fileId);
        this.chunkQueue.delete(fileId);
        this.activeUploads.delete(fileId);
        return removed;
    }
    createChunks(file) {
        const chunks = [];
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
    async calculateChecksum(file) {
        // This is a simplified checksum calculation
        // In production, you'd use a proper crypto library
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    async validateExistingChunks(resumeState, provider) {
        // Check with provider which chunks are already uploaded
        try {
            const uploadedChunks = (await provider.getUploadedChunks?.(resumeState.fileId)) || [];
            resumeState.chunks.forEach((chunk, index) => {
                if (uploadedChunks.includes(index)) {
                    chunk.uploaded = true;
                    resumeState.uploadedSize += chunk.end - chunk.start;
                    resumeState.lastChunkIndex = Math.max(resumeState.lastChunkIndex, index);
                }
            });
        }
        catch (error) {
            console.warn("Failed to validate existing chunks:", error);
            // Continue without validation
        }
    }
    async uploadRemainingChunks(resumeState, provider) {
        const remainingChunks = resumeState.chunks.filter((chunk) => !chunk.uploaded);
        if (remainingChunks.length === 0) {
            return {
                success: true,
                uploadedSize: resumeState.totalSize,
                totalSize: resumeState.totalSize,
                chunks: resumeState.chunks,
            };
        }
        // Upload chunks with concurrency control
        const uploadPromises = [];
        const activeChunks = new Set();
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
    async uploadChunk(chunk, resumeState, provider) {
        let attempts = 0;
        const maxAttempts = chunk.maxRetries + 1;
        while (attempts < maxAttempts) {
            try {
                const result = await this.uploadChunkToProvider(chunk, resumeState, provider);
                if (result) {
                    chunk.uploaded = true;
                    resumeState.uploadedSize += chunk.end - chunk.start;
                    resumeState.lastChunkIndex = Math.max(resumeState.lastChunkIndex, resumeState.chunks.indexOf(chunk));
                    // Emit progress event
                    this.emitProgressEvent(resumeState, chunk);
                    return true;
                }
            }
            catch (error) {
                console.warn(`Chunk upload attempt ${attempts + 1} failed:`, error);
                chunk.retryCount++;
                if (attempts < maxAttempts - 1) {
                    await this.delay(this.options.retryDelay *
                        Math.pow(TIMING.RETRY_EXPONENTIAL_BASE, attempts));
                }
            }
            attempts++;
        }
        return false;
    }
    async uploadChunkToProvider(_chunk, _resumeState, _provider) {
        // This would be implemented by the specific provider
        // For now, we'll simulate the upload
        try {
            // Simulate upload delay
            await this.delay(Math.random() * UPLOAD.UPLOAD_SIMULATION_DELAY_RANGE +
                UPLOAD.UPLOAD_SIMULATION_DELAY_MIN);
            // Simulate success (in real implementation, this would call provider.uploadChunk)
            return true;
        }
        catch (error) {
            throw new Error(`Failed to upload chunk: ${error}`);
        }
    }
    emitProgressEvent(resumeState, chunk) {
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
    generateFileId(file) {
        UploadResumeManager.fileIdCounter++;
        return `resume-${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${UploadResumeManager.fileIdCounter}`;
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    // Utility methods for external use
    getUploadProgress(fileId) {
        const resumeState = this.resumeStates.get(fileId);
        if (!resumeState)
            return 0;
        return (resumeState.uploadedSize / resumeState.totalSize) * 100;
    }
    isUploadActive(fileId) {
        return this.activeUploads.has(fileId);
    }
    getActiveUploads() {
        return Array.from(this.activeUploads);
    }
    // Cleanup method
    destroy() {
        this.resumeStates.clear();
        this.chunkQueue.clear();
        this.activeUploads.clear();
    }
}
Object.defineProperty(UploadResumeManager, "fileIdCounter", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
});
//# sourceMappingURL=upload-resume.js.map