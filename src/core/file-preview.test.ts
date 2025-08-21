import { describe, it, expect, beforeEach, vi } from "vitest";
import { FilePreviewManager, type PreviewOptions } from "./file-preview";

describe("FilePreviewManager", () => {
  let previewManager: FilePreviewManager;
  let mockFile: File;
  let mockImageFile: File;
  let mockVideoFile: File;

  beforeEach(() => {
    previewManager = FilePreviewManager.getInstance();
    previewManager.clearCache();

    // Create mock files
    mockFile = new File(["test content"], "test.txt", { type: "text/plain" });
    mockImageFile = new File(["fake image data"], "test.jpg", {
      type: "image/jpeg",
    });
    mockVideoFile = new File(["fake video data"], "test.mp4", {
      type: "video/mp4",
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = FilePreviewManager.getInstance();
      const instance2 = FilePreviewManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Image Preview Generation", () => {
    it("should generate image preview with default options", async () => {
      const mockImg = {
        width: 1920,
        height: 1080,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: "",
      };

      global.Image = vi.fn(() => mockImg) as any;

      // Mock canvas context
      const mockCanvas = document.createElement("canvas");
      const mockCtx = {
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
        drawImage: vi.fn(),
      };
      mockCanvas.getContext = vi.fn(() => mockCtx as any);
      mockCanvas.toDataURL = vi.fn(() => "data:image/png;base64,mock-preview");
      mockCanvas.width = 0;
      mockCanvas.height = 0;

      // Mock document.createElement for canvas
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName) => {
        if (tagName === "canvas") {
          return mockCanvas;
        }
        return originalCreateElement.call(document, tagName);
      });

      // Mock URL.createObjectURL
      const mockObjectURL = "blob:mock-url";
      global.URL.createObjectURL = vi.fn(() => mockObjectURL);

      // Start the preview generation
      const previewPromise = previewManager.generatePreview(mockImageFile);

      // Simulate image load immediately
      if (mockImg.onload) {
        mockImg.onload();
      }

      const preview = await previewPromise;

      expect(preview).toEqual({
        id: expect.stringContaining("preview-test.jpg"),
        url: "data:image/png;base64,mock-preview",
        type: "image",
        dimensions: expect.objectContaining({
          width: expect.any(Number),
          height: expect.any(Number),
        }),
        size: mockImageFile.size,
        mimeType: "image/jpeg",
        metadata: expect.objectContaining({
          originalWidth: 1920,
          originalHeight: 1080,
          aspectRatio: 1920 / 1080,
          format: "webp",
          quality: 0.8,
        }),
      });

      // Restore original createElement
      document.createElement = originalCreateElement;
    });

    it("should generate image preview with custom options", async () => {
      const options: PreviewOptions = {
        maxWidth: 500,
        maxHeight: 300,
        quality: 0.9,
        format: "jpeg",
        generateThumbnail: true,
        thumbnailSize: 150,
      };

      const mockImg = {
        width: 1920,
        height: 1080,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: "",
      };

      global.Image = vi.fn(() => mockImg) as any;

      // Mock canvas context
      const mockCanvas = document.createElement("canvas");
      const mockCtx = {
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
        drawImage: vi.fn(),
      };
      mockCanvas.getContext = vi.fn(() => mockCtx as any);
      mockCanvas.toDataURL = vi.fn(() => "data:image/jpeg;base64,mock-preview");

      // Mock document.createElement for canvas
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName) => {
        if (tagName === "canvas") {
          return mockCanvas;
        }
        return originalCreateElement.call(document, tagName);
      });

      // Mock URL.createObjectURL
      const mockObjectURL = "blob:mock-url";
      global.URL.createObjectURL = vi.fn(() => mockObjectURL);

      // Start the preview generation
      const previewPromise = previewManager.generatePreview(
        mockImageFile,
        options
      );

      // Simulate image load immediately
      if (mockImg.onload) {
        mockImg.onload();
      }

      const preview = await previewPromise;

      expect(preview.metadata?.format).toBe("jpeg");
      expect(preview.metadata?.quality).toBe(0.9);
    });

    it("should handle image load errors gracefully", async () => {
      const mockImg = {
        width: 0,
        height: 0,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        src: "",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      global.Image = vi.fn(() => mockImg) as any;

      // Mock canvas context
      const mockCanvas = document.createElement("canvas");
      const mockCtx = {
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
        drawImage: vi.fn(),
      };
      mockCanvas.getContext = vi.fn(() => mockCtx as any);
      mockCanvas.toDataURL = vi.fn(() => "data:image/png;base64,mock-preview");
      mockCanvas.width = 0;
      mockCanvas.height = 0;

      // Mock document.createElement for canvas
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn((tagName) => {
        if (tagName === "canvas") {
          return mockCanvas;
        }
        return originalCreateElement.call(document, tagName);
      });

      // Mock URL.createObjectURL
      const mockObjectURL = "blob:mock-url";
      global.URL.createObjectURL = vi.fn(() => mockObjectURL);

      // Start the preview generation
      const previewPromise = previewManager.generatePreview(mockImageFile);

      // Simulate error immediately
      if (mockImg.onerror) {
        mockImg.onerror();
      }

      await expect(previewPromise).rejects.toThrow("Failed to load image");

      // Restore original createElement
      document.createElement = originalCreateElement;
    }, 5000);
  });

  describe("Video Preview Generation", () => {
    it("should generate video thumbnail", async () => {
      const mockVideo = {
        videoWidth: 1920,
        videoHeight: 1080,
        duration: 120,
        currentTime: 0,
        onloadedmetadata: null as (() => void) | null,
        onseeked: null as (() => void) | null,
        onerror: null as (() => void) | null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        load: vi.fn(),
        src: "",
      };

      global.HTMLVideoElement = vi.fn(() => mockVideo) as any;

      // Mock document.createElement to return proper canvas for video preview
      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "video") return mockVideo as any;
        if (tagName === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn(() => ({
              drawImage: vi.fn(),
              imageSmoothingEnabled: true,
              imageSmoothingQuality: "high",
            })),
            toDataURL: vi.fn(
              () => "data:image/webp;base64,mock-video-thumbnail"
            ),
          } as any;
        }
        return document.createElement(tagName);
      });

      // Start the preview generation
      const previewPromise = previewManager.generatePreview(mockVideoFile);

      // Simulate video load events immediately
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata();
      }
      if (mockVideo.onseeked) {
        mockVideo.onseeked();
      }

      const preview = await previewPromise;

      expect(preview.type).toBe("video");
      expect(preview.duration).toBe(120);
      expect(preview.thumbnailUrl).toBe(
        "data:image/webp;base64,mock-video-thumbnail"
      );
      expect(preview.metadata?.codec).toBe("H.264/AVC");
    }, 5000);

    it("should handle video load errors gracefully", async () => {
      const mockVideo = {
        videoWidth: 0,
        videoHeight: 0,
        duration: 0,
        currentTime: 0,
        onloadedmetadata: null as (() => void) | null,
        onseeked: null as (() => void) | null,
        onerror: null as (() => void) | null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        load: vi.fn(),
        src: "",
      };

      global.HTMLVideoElement = vi.fn(() => mockVideo) as any;

      // Mock document.createElement to return proper canvas for video preview
      vi.spyOn(document, "createElement").mockImplementation((tagName) => {
        if (tagName === "video") return mockVideo as any;
        if (tagName === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn(() => ({
              drawImage: vi.fn(),
              imageSmoothingEnabled: true,
              imageSmoothingQuality: "high",
            })),
            toDataURL: vi.fn(() => "data:image/webp;base64,"),
          } as any;
        }
        return document.createElement(tagName);
      });

      // Start the preview generation
      const previewPromise = previewManager.generatePreview(mockVideoFile);

      // Simulate error immediately
      if (mockVideo.onerror) {
        mockVideo.onerror();
      }

      await expect(previewPromise).rejects.toThrow("Failed to load video");
    }, 5000);
  });

  describe("Generic File Preview", () => {
    it("should generate generic preview for unsupported files", async () => {
      const preview = await previewManager.generatePreview(mockFile);

      expect(preview.type).toBe("other");
      expect(preview.size).toBe(mockFile.size);
      expect(preview.mimeType).toBe("text/plain");
      expect(preview.metadata?.extension).toBe("txt");
    });
  });

  describe("Cache Management", () => {
    it("should cache preview results", async () => {
      const generateSpy = vi.spyOn(previewManager as any, "createPreview");

      await previewManager.generatePreview(mockFile);
      await previewManager.generatePreview(mockFile);

      expect(generateSpy).toHaveBeenCalledTimes(1);
    });

    it("should return cached preview", async () => {
      const firstPreview = await previewManager.generatePreview(mockFile);
      const secondPreview = await previewManager.generatePreview(mockFile);

      expect(firstPreview).toBe(secondPreview);
    });

    it("should clear cache", async () => {
      await previewManager.generatePreview(mockFile);
      const cachedPreview = previewManager.getCachedPreview(mockFile);
      expect(cachedPreview).toBeDefined();

      previewManager.clearCache();
      const clearedPreview = previewManager.getCachedPreview(mockFile);
      expect(clearedPreview).toBeUndefined();
    });
  });

  describe("Dimension Calculations", () => {
    it("should calculate dimensions maintaining aspect ratio", () => {
      const calculateDimensions = (
        previewManager as any
      ).calculateDimensions.bind(previewManager);

      const result = calculateDimensions(1920, 1080, 800, 600);
      expect(result.width).toBeLessThanOrEqual(800);
      expect(result.height).toBeLessThanOrEqual(600);
      expect(Math.abs(result.width / result.height - 1920 / 1080)).toBeLessThan(
        0.01
      );
    });

    it("should handle very wide images", () => {
      const calculateDimensions = (
        previewManager as any
      ).calculateDimensions.bind(previewManager);

      const result = calculateDimensions(3840, 400, 800, 600);
      expect(result.width).toBe(800);
      expect(result.height).toBeLessThanOrEqual(600);
    });

    it("should handle very tall images", () => {
      const calculateDimensions = (
        previewManager as any
      ).calculateDimensions.bind(previewManager);

      const result = calculateDimensions(400, 3840, 800, 600);
      expect(result.width).toBeLessThanOrEqual(800);
      expect(result.height).toBe(600);
    });
  });

  describe("Video Codec Detection", () => {
    it("should detect common video codecs", () => {
      const detectVideoCodec = (previewManager as any).detectVideoCodec.bind(
        previewManager
      );

      expect(detectVideoCodec("video/mp4")).toBe("H.264/AVC");
      expect(detectVideoCodec("video/webm")).toBe("VP8/VP9");
      expect(detectVideoCodec("video/ogg")).toBe("Theora");
      expect(detectVideoCodec("video/quicktime")).toBe("H.264/HEVC");
      expect(detectVideoCodec("video/x-msvideo")).toBe("MPEG-4");
      expect(detectVideoCodec("video/unknown")).toBe("Unknown");
    });
  });

  describe("Error Handling", () => {
    it("should handle createPreview errors gracefully", async () => {
      const invalidFile = new File([""], "", { type: "invalid/type" });

      await expect(
        previewManager.generatePreview(invalidFile)
      ).resolves.toEqual({
        id: expect.stringContaining("preview-"),
        url: expect.stringContaining("blob:"),
        type: "other",
        size: 0,
        mimeType: "invalid/type",
        metadata: {
          extension: "",
          lastModified: expect.any(Number),
        },
      });
    });
  });
});
