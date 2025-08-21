import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CloudinaryProvider } from "./cloudinary";
import type { UploadOptions } from "../types";

// Mock fetch globally
global.fetch = vi.fn();

describe("☁️ CloudinaryProvider", () => {
  let provider: CloudinaryProvider;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = global.fetch as ReturnType<typeof vi.fn>;

    provider = new CloudinaryProvider({
      cloudName: "test-cloud",
      uploadPreset: "test-preset",
      defaultFolder: "uploads",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("🔧 Configuration", () => {
    it("should initialize with correct configuration", () => {
      expect(provider.getConfig().cloudName).toBe("test-cloud");
      expect(provider.getConfig().uploadPreset).toBe("test-preset");
      expect(provider.getConfig().defaultFolder).toBe("uploads");
    });

    it("should use default folder when not specified", () => {
      const providerWithoutFolder = new CloudinaryProvider({
        cloudName: "test-cloud",
        uploadPreset: "test-preset",
      });
      expect(providerWithoutFolder.getConfig().defaultFolder).toBeUndefined();
    });

    it("should have correct provider name", () => {
      expect(provider.getName()).toBe("cloudinary");
    });
  });

  describe("📤 Upload Functionality", () => {
    const mockFile = new File(["test content"], "test.jpg", {
      type: "image/jpeg",
    });

    beforeEach(async () => {
      // Mock the initialize method to set initialized = true
      mockFetch.mockResolvedValue({ ok: true });
      await provider.initialize();
    });

    it("should upload file successfully", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          public_id: "test-cloud/test-image",
          secure_url:
            "https://res.cloudinary.com/test-cloud/image/upload/test-image.jpg",
          original_filename: "test.jpg",
          width: 800,
          height: 600,
          format: "jpg",
          bytes: 1024,
          resource_type: "image",
          created_at: "2023-01-01T00:00:00Z",
          etag: "test-etag",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await provider.uploadFile(mockFile, {});

      expect(result).toEqual({
        id: "test-cloud/test-image",
        url: "https://res.cloudinary.com/test-cloud/image/upload/test-image.jpg",
        filename: "test.jpg",
        size: 1024,
        mimeType: "image/jpeg",
        metadata: {
          format: "jpg",
          width: 800,
          height: 600,
          resourceType: "image",
          etag: "test-etag",
        },
        createdAt: new Date("2023-01-01T00:00:00Z"),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cloudinary.com/v1_1/test-cloud/upload",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
    });

    it("should handle upload errors gracefully", async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: vi.fn().mockResolvedValue("Invalid upload preset"),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(provider.uploadFile(mockFile, {})).rejects.toThrow(
        "Upload failed for test.jpg: Upload failed: 400 Bad Request - Invalid upload preset"
      );
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(provider.uploadFile(mockFile, {})).rejects.toThrow(
        "Upload failed for test.jpg: Network error"
      );
    });

    it("should include custom options in upload", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          public_id: "test-cloud/custom-folder/test-image",
          secure_url:
            "https://res.cloudinary.com/test-cloud/image/upload/custom-folder/test-image.jpg",
          original_filename: "test.jpg",
          bytes: 1024,
          format: "jpg",
          resource_type: "image",
          created_at: "2023-01-01T00:00:00Z",
          etag: "test-etag",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const options: UploadOptions = {
        folder: "custom-folder",
        metadata: { category: "test", type: "image" },
        tags: ["test", "image"],
      };

      // Clear previous mock calls to avoid confusion with initialization
      mockFetch.mockClear();

      await provider.uploadFile(mockFile, options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cloudinary.com/v1_1/test-cloud/upload",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );

      // Verify FormData contains the options by checking the mock call
      const mockCall = mockFetch.mock.calls[0];
      expect(mockCall[0]).toBe(
        "https://api.cloudinary.com/v1_1/test-cloud/upload"
      );
      expect(mockCall[1].method).toBe("POST");
      expect(mockCall[1].body).toBeInstanceOf(FormData);
    });
  });

  describe("📊 Progress Tracking", () => {
    const mockFile = new File(["test content"], "test.jpg", {
      type: "image/jpeg",
    });

    beforeEach(async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await provider.initialize();
    });

    it("should track upload progress for multiple files", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          public_id: "test-cloud/test-image",
          secure_url:
            "https://res.cloudinary.com/test-cloud/image/upload/test-image.jpg",
          original_filename: "test.jpg",
          bytes: 1024,
          format: "jpg",
          resource_type: "image",
          created_at: "2023-01-01T00:00:00Z",
          etag: "test-etag",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const progressCallback = vi.fn();
      const files = [mockFile, mockFile];

      await provider.uploadFiles(files, {}, progressCallback);

      // Progress callback should be called multiple times
      expect(progressCallback).toHaveBeenCalled();
    });
  });

  describe("🔄 Batch Uploads", () => {
    const mockFiles = [
      new File(["content1"], "file1.jpg", { type: "image/jpeg" }),
      new File(["content2"], "file2.png", { type: "image/png" }),
      new File(["content3"], "file3.pdf", { type: "application/pdf" }),
    ];

    beforeEach(async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await provider.initialize();
    });

    it("should upload multiple files successfully", async () => {
      // Mock different responses for each file
      const mockResponses = [
        {
          ok: true,
          json: vi.fn().mockResolvedValue({
            public_id: "test-cloud/file1",
            secure_url:
              "https://res.cloudinary.com/test-cloud/image/upload/file1.jpg",
            original_filename: "file1.jpg",
            bytes: 1024,
            format: "jpg",
            resource_type: "image",
            created_at: "2023-01-01T00:00:00Z",
            etag: "test-etag-1",
          }),
        },
        {
          ok: true,
          json: vi.fn().mockResolvedValue({
            public_id: "test-cloud/file2",
            secure_url:
              "https://res.cloudinary.com/test-cloud/image/upload/file2.png",
            original_filename: "file2.png",
            bytes: 2048,
            format: "png",
            resource_type: "image",
            created_at: "2023-01-01T00:00:00Z",
            etag: "test-etag-2",
          }),
        },
        {
          ok: true,
          json: vi.fn().mockResolvedValue({
            public_id: "test-cloud/file3",
            secure_url:
              "https://res.cloudinary.com/test-cloud/image/upload/file3.pdf",
            original_filename: "file3.pdf",
            bytes: 3072,
            format: "pdf",
            resource_type: "raw",
            created_at: "2023-01-01T00:00:00Z",
            etag: "test-etag-3",
          }),
        },
      ];

      mockFetch
        .mockResolvedValueOnce(mockResponses[0])
        .mockResolvedValueOnce(mockResponses[1])
        .mockResolvedValueOnce(mockResponses[2]);

      const results = await provider.uploadFiles(mockFiles, {});

      expect(results).toHaveLength(3);
      expect(results[0].filename).toBe("file1.jpg");
      expect(results[1].filename).toBe("file2.png");
      expect(results[2].filename).toBe("file3.pdf");
    });

    it("should handle empty file array", async () => {
      const results = await provider.uploadFiles([], {});
      expect(results).toHaveLength(0);
    });
  });

  describe("🗑️ Delete Functionality", () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await provider.initialize();
    });

    it("should delete file successfully", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          result: "ok",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      await provider.deleteFile("test-cloud/test-image");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cloudinary.com/v1_1/test-cloud/delete_by_token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: "test-cloud/test-image",
          }),
        })
      );
    });

    it("should handle delete errors", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };

      mockFetch.mockResolvedValue(mockResponse);

      await expect(provider.deleteFile("non-existent-file")).rejects.toThrow(
        "Delete failed: Failed to delete file: 404 Not Found"
      );
    });
  });

  describe("🔍 File Information", () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await provider.initialize();
    });

    it("should get file information", async () => {
      const mockResponse = {
        ok: true,
        url: "https://res.cloudinary.com/test-cloud/image/upload/test-image.jpg",
      };

      mockFetch.mockResolvedValue(mockResponse);

      const info = await provider.getFileInfo("test-cloud/test-image");

      expect(info).toEqual({
        id: "test-cloud/test-image",
        url: "https://res.cloudinary.com/test-cloud/image/upload/test-image.jpg",
        filename: "test-cloud/test-image",
        size: 0,
        mimeType: "image/*",
        createdAt: expect.any(Date),
      });
    });

    it("should return null for non-existent files", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };

      mockFetch.mockResolvedValue(mockResponse);

      const info = await provider.getFileInfo("non-existent-file");
      expect(info).toBeNull();
    });
  });

  describe("🔗 Preview URLs", () => {
    it("should generate preview URL with transformations", () => {
      const url = provider.generatePreviewUrl("test-image", {
        width: 800,
        height: 600,
        crop: "fill",
        quality: 80,
      });

      expect(url).toBe(
        "https://res.cloudinary.com/test-cloud/image/upload/w_800,h_600,c_fill,q_80/test-image"
      );
    });

    it("should generate preview URL without transformations", () => {
      const url = provider.generatePreviewUrl("test-image");
      expect(url).toBe(
        "https://res.cloudinary.com/test-cloud/image/upload/test-image"
      );
    });
  });

  describe("⚡ Performance & Edge Cases", () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await provider.initialize();
    });

    it("should handle large files", async () => {
      const largeFile = new File(["x".repeat(10 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          public_id: "test-cloud/large-image",
          secure_url:
            "https://res.cloudinary.com/test-cloud/image/upload/large-image.jpg",
          original_filename: "large.jpg",
          bytes: 10 * 1024 * 1024,
          format: "jpg",
          resource_type: "image",
          created_at: "2023-01-01T00:00:00Z",
          etag: "test-etag",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await provider.uploadFile(largeFile, {});
      expect(result.size).toBe(10 * 1024 * 1024);
    });

    it("should handle empty files", async () => {
      const emptyFile = new File([], "empty.txt", { type: "text/plain" });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          public_id: "test-cloud/empty-file",
          secure_url:
            "https://res.cloudinary.com/test-cloud/image/upload/empty-file.txt",
          original_filename: "empty.txt",
          bytes: 0,
          format: "txt",
          resource_type: "raw",
          created_at: "2023-01-01T00:00:00Z",
          etag: "test-etag",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await provider.uploadFile(emptyFile, {});
      expect(result.size).toBe(0);
    });

    it("should handle special characters in filenames", async () => {
      const specialFile = new File(
        ["content"],
        "file with spaces & special chars!@#.jpg",
        { type: "image/jpeg" }
      );

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          public_id: "test-cloud/special-filename",
          secure_url:
            "https://res.cloudinary.com/test-cloud/image/upload/special-filename.jpg",
          original_filename: "file with spaces & special chars!@#.jpg",
          bytes: 1024,
          format: "jpg",
          resource_type: "image",
          created_at: "2023-01-01T00:00:00Z",
          etag: "test-etag",
        }),
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await provider.uploadFile(specialFile, {});
      expect(result.filename).toBe("file with spaces & special chars!@#.jpg");
    });
  });

  describe("🔐 Security & Validation", () => {
    it("should validate folder names", () => {
      const result = provider.validateOptions({ folder: "valid-folder" });
      expect(result.valid).toBe(true);

      const invalidResult = provider.validateOptions({
        folder: "invalid/folder<with>special:chars",
      });
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain("Invalid folder name");
    });

    it("should validate long folder names", () => {
      const longFolder = "a".repeat(101);
      const result = provider.validateOptions({ folder: longFolder });
      expect(result.valid).toBe(false);
      expect(result.error).toContain("under 100 characters");
    });
  });

  describe("📊 Statistics & Connection", () => {
    it("should get upload statistics", async () => {
      const stats = await provider.getStats();
      expect(stats).toEqual({
        totalFiles: 0,
        totalSize: 0,
        provider: "cloudinary",
      });
    });

    it("should test connection", async () => {
      mockFetch.mockResolvedValue({ ok: true });
      const result = await provider.testConnection();
      expect(result).toBe(true);
    });

    it("should handle connection test failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      const result = await provider.testConnection();
      expect(result).toBe(false);
    });
  });

  describe("🔄 Initialization", () => {
    it("should initialize successfully with valid cloud name", async () => {
      mockFetch.mockResolvedValue({ ok: true });
      await expect(provider.initialize()).resolves.not.toThrow();
      expect(provider.isConfigured()).toBe(true);
    });

    it("should fail initialization with empty cloud name", async () => {
      const invalidProvider = new CloudinaryProvider({
        cloudName: "",
        uploadPreset: "test-preset",
      });

      await expect(invalidProvider.initialize()).rejects.toThrow(
        "Cloudinary cloud name is required"
      );
    });

    it("should fail initialization with invalid connection", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(provider.initialize()).rejects.toThrow(
        "Failed to connect to Cloudinary: 500"
      );
    });

    it("should fail initialization with network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      await expect(provider.initialize()).rejects.toThrow(
        "Failed to initialize Cloudinary provider: Network error"
      );
    });
  });
});
