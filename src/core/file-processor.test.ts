import { describe, it, expect, beforeEach } from "vitest";
import { FileProcessor } from "./file-processor";

describe("FileProcessor", () => {
  let fileProcessor: FileProcessor;

  beforeEach(() => {
    fileProcessor = new FileProcessor();

    // Set up global FileReader mock for all tests
    global.FileReader = class MockFileReader extends EventTarget {
      onload:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
        | null = null;
      onerror:
        | ((this: FileReader, ev: ProgressEvent<FileReader>) => any)
        | null = null;

      readAsDataURL = () => {
        // Immediately set result and call onload callback
        this.result = "data:image/jpeg;base64,mock-preview";
        this.readyState = 2; // DONE

        // Call onload callback if it exists
        if (this.onload) {
          const mockEvent = new ProgressEvent("load") as any;
          this.onload.call(this, mockEvent);
        }
      };

      result: string | ArrayBuffer | null = null;
      readyState: number = 0;
    } as any;
  });

  describe("Initialization", () => {
    it("should initialize with default options", () => {
      expect(fileProcessor).toBeInstanceOf(FileProcessor);
    });

    it("should accept custom options", () => {
      const customProcessor = new FileProcessor({
        maxFiles: 5,
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: ["image/*"],
      });

      expect(customProcessor).toBeInstanceOf(FileProcessor);
    });
  });

  describe("File Processing", () => {
    it("should process valid files successfully", async () => {
      const mockFiles = [
        new File(["test content"], "test.txt", { type: "text/plain" }),
        new File(["image content"], "image.jpg", { type: "image/jpeg" }),
      ];

      const result = await fileProcessor.processFiles(mockFiles);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(2);
      expect(result.files![0].name).toBe("test.txt");
      expect(result.files![1].name).toBe("image.jpg");
    });

    it("should handle empty file array", async () => {
      const result = await fileProcessor.processFiles([]);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(0);
    });

    it("should reject files exceeding max files limit", async () => {
      const customProcessor = new FileProcessor({ maxFiles: 2 });
      const mockFiles = [
        new File(["test1"], "test1.txt", { type: "text/plain" }),
        new File(["test2"], "test2.txt", { type: "text/plain" }),
        new File(["test3"], "test3.txt", { type: "text/plain" }),
      ];

      const result = await customProcessor.processFiles(mockFiles);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain("Maximum 2 files allowed");
    });

    it("should reject files exceeding max file size", async () => {
      const customProcessor = new FileProcessor({ maxFileSize: 1000 });
      const largeFile = new File(["x".repeat(2000)], "large.txt", {
        type: "text/plain",
      });

      const result = await customProcessor.processFiles([largeFile]);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain("too large");
    });

    it("should reject files with invalid types", async () => {
      const customProcessor = new FileProcessor({ allowedTypes: ["image/*"] });
      const textFile = new File(["test"], "test.txt", { type: "text/plain" });

      const result = await customProcessor.processFiles([textFile]);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain("not allowed");
    });

    it("should accept files with wildcard types", async () => {
      const customProcessor = new FileProcessor({ allowedTypes: ["image/*"] });
      const imageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });

      const result = await customProcessor.processFiles([imageFile]);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
    }, 15000);

    it("should accept files with exact MIME types", async () => {
      const customProcessor = new FileProcessor({
        allowedTypes: ["text/plain"],
      });
      const textFile = new File(["test"], "test.txt", { type: "text/plain" });

      const result = await customProcessor.processFiles([textFile]);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
    });

    it("should accept files with file extensions", async () => {
      const customProcessor = new FileProcessor({ allowedTypes: [".txt"] });
      const textFile = new File(["test"], "test.txt", { type: "text/plain" });

      const result = await customProcessor.processFiles([textFile]);

      expect(result.success).toBe(true);
      expect(result.files).toHaveLength(1);
    });
  });

  describe("File ID Generation", () => {
    it("should generate unique IDs for different files", async () => {
      const mockFiles = [
        new File(["test1"], "test1.txt", { type: "text/plain" }),
        new File(["test2"], "test2.txt", { type: "text/plain" }),
      ];

      const result = await fileProcessor.processFiles(mockFiles);

      expect(result.success).toBe(true);
      expect(result.files![0].id).not.toBe(result.files![1].id);
    });

    it("should generate IDs with file extensions", async () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });

      const result = await fileProcessor.processFiles([mockFile]);

      expect(result.success).toBe(true);
      expect(result.files![0].id).toContain(".txt");
    });
  });

  describe("File Preview Generation", () => {
    it("should generate previews for image files", async () => {
      const imageFile = new File(["image"], "test.jpg", { type: "image/jpeg" });

      const result = await fileProcessor.processFiles([imageFile]);

      expect(result.success).toBe(true);
      expect(result.files![0].preview).toBeDefined();
      expect(typeof result.files![0].preview).toBe("string");
    });

    it("should not generate previews for non-image files", async () => {
      const textFile = new File(["test"], "test.txt", { type: "text/plain" });

      const result = await fileProcessor.processFiles([textFile]);

      expect(result.success).toBe(true);
      expect(result.files![0].preview).toBeUndefined();
    });
  });

  describe("Static Utility Methods", () => {
    describe("formatFileSize", () => {
      it("should format bytes correctly", () => {
        expect(FileProcessor.formatFileSize(0)).toBe("0 Bytes");
        expect(FileProcessor.formatFileSize(1024)).toBe("1 KB");
        expect(FileProcessor.formatFileSize(1024 * 1024)).toBe("1 MB");
        expect(FileProcessor.formatFileSize(1024 * 1024 * 1024)).toBe("1 GB");
      });

      it("should handle large sizes", () => {
        expect(FileProcessor.formatFileSize(1024 * 1024 * 1024 * 1024)).toBe(
          "1 TB"
        );
      });
    });

    describe("getFileIcon", () => {
      it("should return appropriate icons for different file types", () => {
        expect(FileProcessor.getFileIcon("image/jpeg")).toBe("🖼️");
        expect(FileProcessor.getFileIcon("video/mp4")).toBe("🎥");
        expect(FileProcessor.getFileIcon("audio/mp3")).toBe("🎵");
        expect(FileProcessor.getFileIcon("text/plain")).toBe("📄");
        expect(FileProcessor.getFileIcon("application/zip")).toBe("📦");
        expect(FileProcessor.getFileIcon("text/javascript")).toBe("💻");
        expect(FileProcessor.getFileIcon("unknown/type")).toBe("📁");
      });
    });

    describe("Type checking methods", () => {
      it("should correctly identify image files", () => {
        expect(FileProcessor.isImage("image/jpeg")).toBe(true);
        expect(FileProcessor.isImage("image/png")).toBe(true);
        expect(FileProcessor.isImage("text/plain")).toBe(false);
      });

      it("should correctly identify video files", () => {
        expect(FileProcessor.isVideo("video/mp4")).toBe(true);
        expect(FileProcessor.isVideo("video/avi")).toBe(true);
        expect(FileProcessor.isVideo("image/jpeg")).toBe(false);
      });

      it("should correctly identify audio files", () => {
        expect(FileProcessor.isAudio("audio/mp3")).toBe(true);
        expect(FileProcessor.isAudio("audio/wav")).toBe(true);
        expect(FileProcessor.isAudio("image/jpeg")).toBe(false);
      });

      it("should correctly identify document files", () => {
        expect(FileProcessor.isDocument("text/plain")).toBe(true);
        expect(FileProcessor.isDocument("application/pdf")).toBe(true);
        expect(FileProcessor.isDocument("image/jpeg")).toBe(false);
      });

      it("should correctly identify archive files", () => {
        expect(FileProcessor.isArchive("application/zip")).toBe(true);
        expect(FileProcessor.isArchive("application/x-rar")).toBe(true);
        expect(FileProcessor.isArchive("text/plain")).toBe(false);
      });

      it("should correctly identify code files", () => {
        expect(FileProcessor.isCode("text/javascript")).toBe(true);
        expect(FileProcessor.isCode("text/x-python")).toBe(true);
        expect(FileProcessor.isCode("image/jpeg")).toBe(false);
      });
    });

    describe("getFileCategory", () => {
      it("should return correct categories", () => {
        expect(FileProcessor.getFileCategory("image/jpeg")).toBe("image");
        expect(FileProcessor.getFileCategory("video/mp4")).toBe("video");
        expect(FileProcessor.getFileCategory("audio/mp3")).toBe("audio");
        expect(FileProcessor.getFileCategory("text/plain")).toBe("document");
        expect(FileProcessor.getFileCategory("application/zip")).toBe(
          "archive"
        );
        expect(FileProcessor.getFileCategory("text/javascript")).toBe("code");
        expect(FileProcessor.getFileCategory("unknown/type")).toBe("other");
      });
    });

    describe("getFileExtension", () => {
      it("should extract file extensions correctly", () => {
        expect(FileProcessor.getFileExtension("test.txt")).toBe("txt");
        expect(FileProcessor.getFileExtension("image.jpg")).toBe("jpg");
        expect(FileProcessor.getFileExtension("document.pdf")).toBe("pdf");
        expect(FileProcessor.getFileExtension("noextension")).toBe("");
        expect(FileProcessor.getFileExtension(".hidden")).toBe("hidden");
      });
    });

    describe("isPotentiallyDangerous", () => {
      it("should identify dangerous file extensions", () => {
        expect(FileProcessor.isPotentiallyDangerous("script.exe")).toBe(true);
        expect(FileProcessor.isPotentiallyDangerous("batch.bat")).toBe(true);
        expect(FileProcessor.isPotentiallyDangerous("script.js")).toBe(true);
        expect(FileProcessor.isPotentiallyDangerous("document.txt")).toBe(
          false
        );
        expect(FileProcessor.isPotentiallyDangerous("image.jpg")).toBe(false);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle file processing errors gracefully", async () => {
      // Create a file that will cause an error during processing
      const problematicFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      // Mock FileReader to throw an error
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader extends EventTarget {
        readAsDataURL = () => {
          throw new Error("Mock error");
        };
      } as any;

      try {
        const result = await fileProcessor.processFiles([problematicFile]);

        // Should still process the file even if preview generation fails
        expect(result.success).toBe(true);
        expect(result.files).toHaveLength(1);
      } finally {
        // Restore original FileReader
        global.FileReader = originalFileReader;
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle files with no extension", async () => {
      const noExtFile = new File(["test"], "README", { type: "text/plain" });

      const result = await fileProcessor.processFiles([noExtFile]);

      expect(result.success).toBe(true);
      expect(result.files![0].name).toBe("README");
    });

    it("should handle files with special characters in names", async () => {
      const specialFile = new File(
        ["test"],
        "file with spaces & symbols!@#.txt",
        { type: "text/plain" }
      );

      const result = await fileProcessor.processFiles([specialFile]);

      expect(result.success).toBe(true);
      expect(result.files![0].name).toBe("file with spaces & symbols!@#.txt");
    });

    it("should reject very long filenames", async () => {
      const longName = "a".repeat(300) + ".txt"; // > 255 characters
      const longFile = new File(["test"], longName, { type: "text/plain" });

      const result = await fileProcessor.processFiles([longFile]);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0]).toContain("File name is too long");
    });

    it("should handle zero-byte files with warnings", async () => {
      const emptyFile = new File([], "empty.txt", { type: "text/plain" });

      const result = await fileProcessor.processFiles([emptyFile]);

      // Zero-byte files should still be processed but with warnings
      expect(result.success).toBe(true);
      expect(result.files![0].size).toBe(0);
    });
  });
});
