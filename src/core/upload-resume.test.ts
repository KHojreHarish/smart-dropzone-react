import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  UploadResumeManager,
  type ResumeOptions,
  type UploadChunk,
} from "./upload-resume";

describe("UploadResumeManager", () => {
  let resumeManager: UploadResumeManager;
  let mockFile: File;
  let mockProvider: any;

  beforeEach(() => {
    resumeManager = UploadResumeManager.getInstance();
    resumeManager.destroy(); // Clear previous state

    mockFile = new File(["test content for chunking"], "test.txt", {
      type: "text/plain",
      lastModified: Date.now(),
    });

    mockProvider = {
      name: "mock-provider",
      getUploadedChunks: vi.fn(() => Promise.resolve([])),
      uploadChunk: vi.fn(() => Promise.resolve({ success: true })),
    };

    vi.clearAllMocks();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = UploadResumeManager.getInstance();
      const instance2 = UploadResumeManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Resume State Creation", () => {
    it("should create resume state with default options", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );

      expect(resumeState).toEqual({
        fileId: expect.stringContaining("resume-test.txt"),
        fileName: "test.txt",
        totalSize: mockFile.size,
        uploadedSize: 0,
        chunks: expect.any(Array),
        status: "paused",
        lastChunkIndex: -1,
        checksum: expect.any(String),
        metadata: {
          provider: "test-provider",
          mimeType: "text/plain",
          lastModified: mockFile.lastModified,
          createdAt: expect.any(Number),
        },
      });
    });

    it("should create appropriate number of chunks", async () => {
      const customManager = new UploadResumeManager({
        chunkSize: 10, // 10 bytes per chunk
      });

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );
      const expectedChunks = Math.ceil(mockFile.size / 10);

      expect(resumeState.chunks).toHaveLength(expectedChunks);
      expect(resumeState.chunks[0].start).toBe(0);
      expect(resumeState.chunks[0].end).toBe(10);
    });

    it("should generate unique file IDs", async () => {
      const resumeState1 = await resumeManager.createResumeState(
        mockFile,
        "provider1"
      );
      await new Promise((resolve) => setTimeout(resolve, 1)); // Ensure different timestamp
      const resumeState2 = await resumeManager.createResumeState(
        mockFile,
        "provider2"
      );

      expect(resumeState1.fileId).not.toBe(resumeState2.fileId);
    });
  });

  describe("Chunk Management", () => {
    it("should create chunks with correct boundaries", async () => {
      const customManager = new UploadResumeManager({
        chunkSize: 5, // Small chunks for testing
      });

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test"
      );
      const chunks = resumeState.chunks;

      expect(chunks[0].start).toBe(0);
      expect(chunks[0].end).toBe(5);
      expect(chunks[1].start).toBe(5);
      expect(chunks[1].end).toBe(10);

      // Last chunk should not exceed file size
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk.end).toBeLessThanOrEqual(mockFile.size);
    });

    it("should create chunks with proper metadata", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test"
      );
      const chunk = resumeState.chunks[0];

      expect(chunk).toEqual({
        id: expect.stringContaining("test.txt-chunk-0"),
        start: 0,
        end: expect.any(Number),
        data: expect.any(Blob),
        uploaded: false,
        retryCount: 0,
        maxRetries: 3,
      });
    });
  });

  describe("Resume Upload Operations", () => {
    it("should resume upload from paused state", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );

      const result = await resumeManager.resumeUpload(
        resumeState.fileId,
        mockProvider
      );

      expect(result.success).toBe(true);
      expect(result.uploadedSize).toBe(mockFile.size);
      expect(result.totalSize).toBe(mockFile.size);
    });

    it("should return completed result for already completed uploads", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );
      resumeState.status = "completed";

      const result = await resumeManager.resumeUpload(
        resumeState.fileId,
        mockProvider
      );

      expect(result.success).toBe(true);
      expect(result.uploadedSize).toBe(resumeState.totalSize);
    });

    it("should handle non-existent resume state", async () => {
      const result = await resumeManager.resumeUpload(
        "non-existent-id",
        mockProvider
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Resume state not found");
    });

    it("should validate existing chunks when enabled", async () => {
      mockProvider.getUploadedChunks = vi.fn(() => Promise.resolve([0, 1])); // First two chunks uploaded

      const customManager = new UploadResumeManager({
        validateChunks: true,
        chunkSize: 5,
      });

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );

      await customManager.resumeUpload(resumeState.fileId, mockProvider);

      expect(mockProvider.getUploadedChunks).toHaveBeenCalledWith(
        resumeState.fileId
      );
    });
  });

  describe("Upload Control Operations", () => {
    it("should pause upload", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );

      const result = resumeManager.pauseUpload(resumeState.fileId);

      expect(result).toBe(true);
      expect(resumeState.status).toBe("paused");
    });

    it("should not pause completed upload", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );
      resumeState.status = "completed";

      const result = resumeManager.pauseUpload(resumeState.fileId);

      expect(result).toBe(false);
    });

    it("should cancel upload and reset state", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );
      resumeState.uploadedSize = 100;
      resumeState.chunks[0].uploaded = true;

      const result = resumeManager.cancelUpload(resumeState.fileId);

      expect(result).toBe(true);
      expect(resumeState.status).toBe("paused");
      expect(resumeState.uploadedSize).toBe(0);
      expect(resumeState.chunks[0].uploaded).toBe(false);
      expect(resumeState.chunks[0].retryCount).toBe(0);
    });

    it("should handle cancel for non-existent upload", () => {
      const result = resumeManager.cancelUpload("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("Progress Tracking", () => {
    it("should calculate upload progress correctly", async () => {
      const customManager = new UploadResumeManager({
        chunkSize: 10,
      });

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );

      // Simulate partial upload
      resumeState.uploadedSize = mockFile.size / 2;

      const progress = customManager.getUploadProgress(resumeState.fileId);
      expect(progress).toBe(50);
    });

    it("should return 0 progress for non-existent file", () => {
      const progress = resumeManager.getUploadProgress("non-existent-id");
      expect(progress).toBe(0);
    });

    it("should track active uploads", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );

      expect(resumeManager.isUploadActive(resumeState.fileId)).toBe(false);

      // Simulate active upload
      resumeManager["activeUploads"].add(resumeState.fileId);

      expect(resumeManager.isUploadActive(resumeState.fileId)).toBe(true);
      expect(resumeManager.getActiveUploads()).toContain(resumeState.fileId);
    });
  });

  describe("Chunk Upload Logic", () => {
    it("should retry failed chunk uploads", async () => {
      const customManager = new UploadResumeManager({
        retryAttempts: 2,
        retryDelay: 10,
      });

      let attemptCount = 0;
      customManager["uploadChunkToProvider"] = vi.fn(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error("Simulated failure");
        }
        return true;
      });

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );
      const chunk = resumeState.chunks[0];

      const result = await customManager["uploadChunk"](
        chunk,
        resumeState,
        mockProvider
      );

      expect(result).toBe(true);
      expect(attemptCount).toBe(3); // Initial attempt + 2 retries
      expect(chunk.uploaded).toBe(true);
    });

    it("should fail after max retry attempts", async () => {
      const customManager = new UploadResumeManager({
        retryAttempts: 1,
        retryDelay: 10,
      });

      customManager["uploadChunkToProvider"] = vi.fn(() =>
        Promise.reject(new Error("Persistent failure"))
      );

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );
      const chunk = resumeState.chunks[0];

      const result = await customManager["uploadChunk"](
        chunk,
        resumeState,
        mockProvider
      );

      expect(result).toBe(false);
      expect(chunk.uploaded).toBe(false);
      expect(chunk.retryCount).toBe(2); // Initial + 1 retry
    });

    it("should emit progress events", async () => {
      const progressEvents: any[] = [];

      const progressHandler = (event: CustomEvent) => {
        progressEvents.push(event.detail);
      };

      document.addEventListener(
        "uploadProgress",
        progressHandler as EventListener
      );

      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );
      const chunk = resumeState.chunks[0];

      resumeManager["emitProgressEvent"](resumeState, chunk);

      expect(progressEvents).toHaveLength(1);
      expect(progressEvents[0]).toEqual({
        fileId: resumeState.fileId,
        fileName: resumeState.fileName,
        progress: expect.any(Number),
        uploadedSize: resumeState.uploadedSize,
        totalSize: resumeState.totalSize,
        chunkId: chunk.id,
        chunkProgress: 100,
      });

      document.removeEventListener(
        "uploadProgress",
        progressHandler as EventListener
      );
    });
  });

  describe("Concurrency Control", () => {
    it("should limit concurrent chunk uploads", async () => {
      const customManager = new UploadResumeManager({
        maxConcurrentChunks: 2,
        chunkSize: 5,
      });

      let concurrentUploads = 0;
      let maxConcurrent = 0;

      customManager["uploadChunkToProvider"] = vi.fn(async () => {
        concurrentUploads++;
        maxConcurrent = Math.max(maxConcurrent, concurrentUploads);

        await new Promise((resolve) => setTimeout(resolve, 50));

        concurrentUploads--;
        return true;
      });

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );

      await customManager["uploadRemainingChunks"](resumeState, mockProvider);

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });
  });

  describe("Checksum Calculation", () => {
    it("should calculate file checksum", async () => {
      const checksum = await resumeManager["calculateChecksum"](mockFile);

      expect(checksum).toBeTypeOf("string");
      expect(checksum).toHaveLength(64); // SHA-256 hex string length
    });

    it("should generate consistent checksums for same content", async () => {
      const file1 = new File(["same content"], "file1.txt");
      const file2 = new File(["same content"], "file2.txt");

      const checksum1 = await resumeManager["calculateChecksum"](file1);
      const checksum2 = await resumeManager["calculateChecksum"](file2);

      expect(checksum1).toBe(checksum2);
    });
  });

  describe("State Management", () => {
    it("should get resume state", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );

      const retrievedState = resumeManager.getResumeState(resumeState.fileId);

      expect(retrievedState).toBe(resumeState);
    });

    it("should get all resume states", async () => {
      const resumeState1 = await resumeManager.createResumeState(
        mockFile,
        "provider1"
      );
      const resumeState2 = await resumeManager.createResumeState(
        mockFile,
        "provider2"
      );

      const allStates = resumeManager.getAllResumeStates();

      expect(allStates).toHaveLength(2);
      expect(allStates).toContain(resumeState1);
      expect(allStates).toContain(resumeState2);
    });

    it("should clear resume state", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );

      const cleared = resumeManager.clearResumeState(resumeState.fileId);

      expect(cleared).toBe(true);
      expect(resumeManager.getResumeState(resumeState.fileId)).toBeUndefined();
    });

    it("should handle clearing non-existent state", () => {
      const cleared = resumeManager.clearResumeState("non-existent-id");
      expect(cleared).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle chunk validation errors gracefully", async () => {
      mockProvider.getUploadedChunks = vi.fn(() =>
        Promise.reject(new Error("Validation failed"))
      );

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const customManager = new UploadResumeManager({
        validateChunks: true,
      });

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );

      // Should not throw
      await expect(
        customManager.resumeUpload(resumeState.fileId, mockProvider)
      ).resolves.toBeDefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to validate existing chunks:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle upload errors and set failed status", async () => {
      const customManager = new UploadResumeManager({
        retryAttempts: 0,
      });

      customManager["uploadChunkToProvider"] = vi.fn(() =>
        Promise.reject(new Error("Upload failed"))
      );

      const resumeState = await customManager.createResumeState(
        mockFile,
        "test-provider"
      );

      const result = await customManager.resumeUpload(
        resumeState.fileId,
        mockProvider
      );

      expect(result.success).toBe(false);
      expect(resumeState.status).toBe("failed");
      expect(result.error).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should handle large files efficiently", async () => {
      // Create a large file (simulated)
      const largeFile = new File(["x".repeat(10000)], "large.txt");

      const customManager = new UploadResumeManager({
        chunkSize: 1000,
      });

      const startTime = performance.now();
      const resumeState = await customManager.createResumeState(
        largeFile,
        "test-provider"
      );
      const endTime = performance.now();

      expect(resumeState.chunks).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });

  describe("Memory Management", () => {
    it("should clean up properly on destroy", async () => {
      const resumeState = await resumeManager.createResumeState(
        mockFile,
        "test-provider"
      );
      resumeManager["activeUploads"].add(resumeState.fileId);

      resumeManager.destroy();

      expect(resumeManager["resumeStates"].size).toBe(0);
      expect(resumeManager["chunkQueue"].size).toBe(0);
      expect(resumeManager["activeUploads"].size).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero-byte files", async () => {
      const emptyFile = new File([""], "empty.txt");

      const resumeState = await resumeManager.createResumeState(
        emptyFile,
        "test-provider"
      );

      expect(resumeState.chunks).toHaveLength(1);
      expect(resumeState.chunks[0].start).toBe(0);
      expect(resumeState.chunks[0].end).toBe(0);
    });

    it("should handle files smaller than chunk size", async () => {
      const smallFile = new File(["small"], "small.txt");

      const customManager = new UploadResumeManager({
        chunkSize: 1000,
      });

      const resumeState = await customManager.createResumeState(
        smallFile,
        "test-provider"
      );

      expect(resumeState.chunks).toHaveLength(1);
      expect(resumeState.chunks[0].end).toBe(smallFile.size);
    });

    it("should handle custom resume options", () => {
      const options: ResumeOptions = {
        chunkSize: 2048,
        maxConcurrentChunks: 5,
        retryAttempts: 5,
        retryDelay: 2000,
        enableResume: false,
        validateChunks: false,
        checksumAlgorithm: "sha256",
      };

      const customManager = new UploadResumeManager(options);

      expect(customManager["options"]).toEqual({
        ...options,
        enableResume: false,
      });
    });
  });
});
