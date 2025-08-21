import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InputValidator } from "./validation";

describe("Validation Module", () => {
  describe("InputValidator", () => {
    describe("validateFile", () => {
      it("should validate valid file objects", () => {
        const mockFile = new File(["test content"], "test.jpg", {
          type: "image/jpeg",
        });
        const result = InputValidator.validateFile(mockFile);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should reject null/undefined files", () => {
        const result1 = InputValidator.validateFile(null);
        const result2 = InputValidator.validateFile(undefined);

        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain("File is required");
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain("File is required");
      });

      it("should reject non-File objects", () => {
        const invalidInputs = [
          "not a file",
          123,
          {},
          [],
          new Date(),
          new Blob(),
        ];

        invalidInputs.forEach((input) => {
          const result = InputValidator.validateFile(input);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain("Invalid file object");
        });
      });

      it("should reject files without names", () => {
        const mockFile = new File(["content"], "", { type: "text/plain" });
        const result = InputValidator.validateFile(mockFile);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("File name is required");
      });

      it("should reject files with only whitespace names", () => {
        const mockFile = new File(["content"], "   ", { type: "text/plain" });
        const result = InputValidator.validateFile(mockFile);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("File name is required");
      });

      it("should reject files with names too long", () => {
        const longName = "a".repeat(256);
        const mockFile = new File(["content"], longName, {
          type: "text/plain",
        });
        const result = InputValidator.validateFile(mockFile);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "File name is too long (maximum 255 characters)"
        );
      });

      it("should reject files with dangerous names", () => {
        const dangerousNames = [
          ".",
          "..",
          "...",
          "file<>.txt",
          "file:name.txt",
          "file|name.txt",
          "file?name.txt",
          "file*name.txt",
        ];

        dangerousNames.forEach((name) => {
          const mockFile = new File(["content"], name, { type: "text/plain" });
          const result = InputValidator.validateFile(mockFile);

          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            "File name contains invalid characters"
          );
        });
      });

      it("should warn about zero-byte files", () => {
        const mockFile = new File([], "empty.txt");
        const result = InputValidator.validateFile(mockFile);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toContain("File appears to be empty");
      });
    });

    describe("validateFileList", () => {
      it("should validate valid file arrays", () => {
        const mockFiles = [
          new File(["content1"], "file1.txt", { type: "text/plain" }),
          new File(["content2"], "file2.txt", { type: "text/plain" }),
        ];

        const result = InputValidator.validateFileList(mockFiles);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should reject non-array inputs", () => {
        const invalidInputs = [
          "not an array",
          123,
          {},
          new File(["content"], "test.txt"),
          null,
          undefined,
        ];

        invalidInputs.forEach((input) => {
          const result = InputValidator.validateFileList(input);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain("Files must be an array");
        });
      });

      it("should warn about empty arrays", () => {
        const result = InputValidator.validateFileList([]);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toContain("No files provided");
      });

      it("should reject arrays with too many files", () => {
        const manyFiles = Array.from(
          { length: 11 },
          (_, i) =>
            new File([`content${i}`], `file${i}.txt`, { type: "text/plain" })
        );

        const result = InputValidator.validateFileList(manyFiles);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Too many files (maximum 10)");
      });

      it("should aggregate validation errors from individual files", () => {
        const invalidFiles = [
          new File(["content"], "", { type: "text/plain" }), // No name
          new File(["content"], "file2.txt", { type: "text/plain" }), // Valid
          new File(["content"], "a".repeat(256), { type: "text/plain" }), // Name too long
        ];

        const result = InputValidator.validateFileList(invalidFiles);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("File 1: File name is required");
        expect(result.errors).toContain(
          "File 3: File name is too long (maximum 255 characters)"
        );
        expect(result.errors).toHaveLength(2);
      });
    });

    describe("validateUploadOptions", () => {
      it("should accept valid upload options", () => {
        const validOptions = {
          maxFileSize: 1024 * 1024,
          maxFiles: 10,
          allowedTypes: ["image/*", "text/plain"],
        };

        const result = InputValidator.validateUploadOptions(validOptions);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should warn about missing options", () => {
        const result = InputValidator.validateUploadOptions(undefined);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toContain(
          "No upload options provided, using defaults"
        );
      });

      it("should validate maxFileSize", () => {
        const invalidSizeOptions = [
          { maxFileSize: -1 },
          { maxFileSize: 0 },
          { maxFileSize: "not a number" },
        ];

        invalidSizeOptions.forEach((options) => {
          const result = InputValidator.validateUploadOptions(options);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            "maxFileSize must be a positive number"
          );
        });
      });

      it("should validate maxFiles", () => {
        const invalidMaxFilesOptions = [
          { maxFiles: -1 },
          { maxFiles: 0 },
          { maxFiles: 101 },
        ];

        invalidMaxFilesOptions.forEach((options) => {
          const result = InputValidator.validateUploadOptions(options);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            "maxFiles must be a number between 1 and 100"
          );
        });
      });
    });

    describe("validatePreviewOptions", () => {
      it("should accept valid preview options", () => {
        const validOptions = {
          maxWidth: 800,
          maxHeight: 600,
          quality: 0.8,
          format: "webp",
        };

        const result = InputValidator.validatePreviewOptions(validOptions);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should validate maxWidth", () => {
        const invalidWidthOptions = [
          { maxWidth: -1 },
          { maxWidth: 0 },
          { maxWidth: "not a number" },
        ];

        invalidWidthOptions.forEach((options) => {
          const result = InputValidator.validatePreviewOptions(options);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain("maxWidth must be a positive number");
        });
      });

      it("should validate quality", () => {
        const invalidQualityOptions = [
          { quality: -0.1 },
          { quality: 1.1 },
          { quality: "not a number" },
        ];

        invalidQualityOptions.forEach((options) => {
          const result = InputValidator.validatePreviewOptions(options);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            "quality must be a number between 0 and 1"
          );
        });
      });

      it("should validate format", () => {
        const invalidFormatOptions = [
          { format: "gif" },
          { format: "bmp" },
          { format: "not a format" },
        ];

        invalidFormatOptions.forEach((options) => {
          const result = InputValidator.validatePreviewOptions(options);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            "format must be one of: webp, jpeg, png"
          );
        });
      });
    });

    describe("validateDragOptions", () => {
      it("should accept valid drag options", () => {
        const validOptions = {
          animationDuration: 300,
          dragThreshold: 5,
          gridSize: 10,
        };

        const result = InputValidator.validateDragOptions(validOptions);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should validate animationDuration", () => {
        const invalidDurationOptions = [
          { animationDuration: -1 },
          { animationDuration: "not a number" },
        ];

        invalidDurationOptions.forEach((options) => {
          const result = InputValidator.validateDragOptions(options);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain(
            "animationDuration must be a non-negative number"
          );
        });
      });

      it("should warn about long animation durations", () => {
        const result = InputValidator.validateDragOptions({
          animationDuration: 6000,
        });

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          "animationDuration is quite long - may affect user experience"
        );
      });
    });

    describe("validateProviderConfig", () => {
      it("should accept valid provider configuration", () => {
        const validConfig = {
          apiKey: "test-api-key",
          cloudName: "test-cloud",
          uploadPreset: "test-preset",
        };

        const result = InputValidator.validateProviderConfig(validConfig);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should reject missing configuration", () => {
        const invalidInputs = [null, undefined, "", 123, true];

        invalidInputs.forEach((input) => {
          const result = InputValidator.validateProviderConfig(input);
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain("Provider configuration is required");
        });
      });

      it("should warn about missing authentication", () => {
        const configWithoutAuth = {
          cloudName: "test-cloud",
          folder: "uploads",
        };

        const result = InputValidator.validateProviderConfig(configWithoutAuth);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          "No authentication credentials found in configuration"
        );
      });
    });

    describe("validateArrayOperation", () => {
      it("should validate valid array operations", () => {
        const result = InputValidator.validateArrayOperation(1, 3, 5);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should reject non-integer indices", () => {
        const invalidIndices = [
          [1.5, 2, 5],
          [1, 2.7, 5],
        ];

        invalidIndices.forEach(([from, to, length]) => {
          const result = InputValidator.validateArrayOperation(
            from,
            to,
            length
          );
          expect(result.isValid).toBe(false);
          expect(result.errors).toContain("Indices must be integers");
        });
      });

      it("should reject negative indices", () => {
        const result1 = InputValidator.validateArrayOperation(-1, 2, 5);
        const result2 = InputValidator.validateArrayOperation(1, -2, 5);

        expect(result1.isValid).toBe(false);
        expect(result1.errors).toContain("Indices cannot be negative");
        expect(result2.isValid).toBe(false);
        expect(result2.errors).toContain("Indices cannot be negative");
      });

      it("should warn about same source and target", () => {
        const result = InputValidator.validateArrayOperation(2, 2, 5);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toContain(
          "Source and target indices are the same - no operation needed"
        );
      });
    });

    describe("validateAllInputs", () => {
      it("should validate all input types successfully", () => {
        const inputs = {
          files: [new File(["content"], "test.txt", { type: "text/plain" })],
          options: { maxFiles: 5, maxFileSize: 1024 },
          previewOptions: { maxWidth: 800, quality: 0.8 },
          dragOptions: { animationDuration: 300 },
          providerConfig: { apiKey: "test-key", cloudName: "test-cloud" },
        };

        const result = InputValidator.validateAllInputs(inputs);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });

      it("should aggregate errors from multiple validations", () => {
        const inputs = {
          files: [new File(["content"], "", { type: "text/plain" })],
          options: { maxFiles: -1 },
          previewOptions: { maxWidth: -100 },
        };

        const result = InputValidator.validateAllInputs(inputs);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("File 1: File name is required");
        expect(result.errors).toContain(
          "maxFiles must be a number between 1 and 100"
        );
        expect(result.errors).toContain("maxWidth must be a positive number");
        expect(result.errors).toHaveLength(3);
      });

      it("should handle partial inputs", () => {
        const inputs = {
          files: [new File(["content"], "test.txt", { type: "text/plain" })],
        };

        const result = InputValidator.validateAllInputs(inputs);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });
    });
  });
});
