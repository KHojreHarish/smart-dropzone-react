import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { UploadError, ErrorBoundary, type ErrorContext } from "./error-handler";

// Mock environment
const mockEnv = { NODE_ENV: "test" };
vi.stubGlobal("process", { env: mockEnv });

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
  ErrorBoundary.clearErrorLogs();
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.restoreAllMocks();
});

describe("Error Handler", () => {
  describe("UploadError Class", () => {
    it("should create UploadError with correct properties", () => {
      const context: ErrorContext = {
        operation: "upload",
        fileId: "test-123",
        fileName: "test.jpg",
      };

      const error = new UploadError(
        "TEST_ERROR",
        "User friendly message",
        "Technical details",
        context,
        true
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(UploadError);
      expect(error.name).toBe("UploadError");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.userMessage).toBe("User friendly message");
      expect(error.technicalMessage).toBe("Technical details");
      expect(error.context).toEqual(context);
      expect(error.retryable).toBe(true);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
    });

    it("should create validation error", () => {
      const error = UploadError.validationError("File too large", "large.jpg");

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.userMessage).toBe("File too large");
      expect(error.technicalMessage).toBe(
        "File validation failed: File too large"
      );
      expect(error.context.operation).toBe("validation");
      expect(error.context.fileName).toBe("large.jpg");
      expect(error.retryable).toBe(false);
    });

    it("should create upload error", () => {
      const error = UploadError.uploadError(
        "Upload failed",
        "file-123",
        "test.jpg"
      );

      expect(error.code).toBe("UPLOAD_ERROR");
      expect(error.userMessage).toBe("Upload failed");
      expect(error.technicalMessage).toBe(
        "Upload failed for file test.jpg: Upload failed"
      );
      expect(error.context.operation).toBe("upload");
      expect(error.context.fileId).toBe("file-123");
      expect(error.context.fileName).toBe("test.jpg");
      expect(error.retryable).toBe(true);
    });

    it("should create network error", () => {
      const error = UploadError.networkError("Connection timeout", "file-123");

      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.userMessage).toBe(
        "Network connection issue. Please check your internet connection and try again."
      );
      expect(error.technicalMessage).toBe("Network error: Connection timeout");
      expect(error.context.operation).toBe("network");
      expect(error.context.fileId).toBe("file-123");
      expect(error.retryable).toBe(true);
    });

    it("should create provider error", () => {
      const error = UploadError.providerError(
        "Service unavailable",
        "cloudinary",
        "file-123"
      );

      expect(error.code).toBe("PROVIDER_ERROR");
      expect(error.userMessage).toBe(
        "Service temporarily unavailable. Please try again later."
      );
      expect(error.technicalMessage).toBe(
        "Provider cloudinary error: Service unavailable"
      );
      expect(error.context.operation).toBe("provider");
      expect(error.context.provider).toBe("cloudinary");
      expect(error.context.fileId).toBe("file-123");
      expect(error.retryable).toBe(true);
    });

    it("should create processing error", () => {
      const error = UploadError.processingError(
        "Image processing failed",
        "file-123"
      );

      expect(error.code).toBe("PROCESSING_ERROR");
      expect(error.userMessage).toBe(
        "File processing failed. Please try a different file."
      );
      expect(error.technicalMessage).toBe(
        "Processing error: Image processing failed"
      );
      expect(error.context.operation).toBe("processing");
      expect(error.context.fileId).toBe("file-123");
      expect(error.retryable).toBe(false);
    });

    it("should serialize to JSON correctly", () => {
      const context: ErrorContext = {
        operation: "upload",
        fileId: "test-123",
      };

      const error = new UploadError(
        "TEST_ERROR",
        "Test message",
        "Technical details",
        context,
        true
      );

      const json = error.toJSON();

      expect(json).toEqual({
        code: "TEST_ERROR",
        userMessage: "Test message",
        technicalMessage: "Technical details",
        context,
        timestamp: error.timestamp.toISOString(),
        retryable: true,
        stack: error.stack,
      });
    });
  });

  describe("ErrorBoundary Static Methods", () => {
    describe("getUserMessage", () => {
      it("should return user message for UploadError", () => {
        const error = UploadError.validationError(
          "File too large",
          "large.jpg"
        );
        const message = ErrorBoundary.getUserMessage(error);

        expect(message).toBe("File too large");
      });

      it("should map common error codes to user-friendly messages", () => {
        const error = new Error("FILE_TOO_LARGE error occurred");
        const message = ErrorBoundary.getUserMessage(error);

        expect(message).toBe(
          "File is too large. Please choose a smaller file."
        );
      });

      it("should map error codes with spaces", () => {
        const error = new Error("INVALID_FILE_TYPE error occurred");
        const message = ErrorBoundary.getUserMessage(error);

        expect(message).toBe(
          "File type not supported. Please choose a different file."
        );
      });

      it("should return default message for unknown errors", () => {
        const error = new Error("Some random error");
        const message = ErrorBoundary.getUserMessage(error);

        expect(message).toBe("Something went wrong. Please try again.");
      });

      it("should handle all predefined error codes", () => {
        const errorCodes = [
          "FILE_TOO_LARGE",
          "INVALID_FILE_TYPE",
          "TOO_MANY_FILES",
          "NETWORK_TIMEOUT",
          "QUOTA_EXCEEDED",
          "FILE_CORRUPTED",
          "UPLOAD_CANCELLED",
          "PROVIDER_UNAVAILABLE",
        ];

        errorCodes.forEach((code) => {
          const error = new Error(`${code} error occurred`);
          const message = ErrorBoundary.getUserMessage(error);
          expect(message).not.toBe("Something went wrong. Please try again.");
        });
      });
    });

    describe("isRetryable", () => {
      it("should return retryable status for UploadError", () => {
        const retryableError = UploadError.uploadError(
          "Upload failed",
          "file-123"
        );
        const nonRetryableError = UploadError.validationError("File too large");

        expect(ErrorBoundary.isRetryable(retryableError)).toBe(true);
        expect(ErrorBoundary.isRetryable(nonRetryableError)).toBe(false);
      });

      it("should detect retryable errors by message pattern", () => {
        const retryableErrors = [
          new Error("Network connection failed"),
          new Error("Request timeout"),
          new Error("Connection lost"),
          new Error("Server error occurred"),
          new Error("Temporary failure"),
          new Error("Rate limit exceeded"),
        ];

        retryableErrors.forEach((error) => {
          expect(ErrorBoundary.isRetryable(error)).toBe(true);
        });
      });

      it("should detect non-retryable errors", () => {
        const nonRetryableErrors = [
          new Error("File not found"),
          new Error("Permission denied"),
          new Error("Invalid format"),
        ];

        nonRetryableErrors.forEach((error) => {
          expect(ErrorBoundary.isRetryable(error)).toBe(false);
        });
      });
    });

    describe("getErrorCode", () => {
      it("should return code for UploadError", () => {
        const error = UploadError.networkError("Connection failed", "file-123");
        const code = ErrorBoundary.getErrorCode(error);

        expect(code).toBe("NETWORK_ERROR");
      });

      it("should infer error codes from message content", () => {
        const testCases = [
          { message: "Network connection failed", expected: "NETWORK_ERROR" },
          { message: "Connection timeout", expected: "NETWORK_ERROR" }, // "network" is checked before "timeout"
          { message: "File validation failed", expected: "VALIDATION_ERROR" },
          { message: "Unknown error", expected: "UNKNOWN_ERROR" },
        ];

        testCases.forEach(({ message, expected }) => {
          const error = new Error(message);
          const code = ErrorBoundary.getErrorCode(error);
          expect(code).toBe(expected);
        });
      });
    });

    describe("shouldRetry", () => {
      it("should not retry after max attempts", () => {
        const error = new Error("Network error");
        const maxAttempts = 3;

        expect(ErrorBoundary.shouldRetry(error, maxAttempts)).toBe(false);
      });

      it("should retry retryable errors within limit", () => {
        const error = new Error("Network error");
        const attemptCount = 1;

        expect(ErrorBoundary.shouldRetry(error, attemptCount)).toBe(true);
      });

      it("should not retry non-retryable errors", () => {
        const error = UploadError.validationError("File too large");
        const attemptCount = 1;

        expect(ErrorBoundary.shouldRetry(error, attemptCount)).toBe(false);
      });
    });

    describe("getRetryDelay", () => {
      it("should calculate exponential backoff delay", () => {
        const baseDelay = 1000; // 1 second
        const exponentialBase = 2;

        const delay1 = ErrorBoundary.getRetryDelay(1);
        const delay2 = ErrorBoundary.getRetryDelay(2);
        const delay3 = ErrorBoundary.getRetryDelay(3);

        expect(delay1).toBe(baseDelay * Math.pow(exponentialBase, 1));
        expect(delay2).toBe(baseDelay * Math.pow(exponentialBase, 2));
        expect(delay3).toBe(baseDelay * Math.pow(exponentialBase, 3));
      });

      it("should handle zero attempt count", () => {
        const delay = ErrorBoundary.getRetryDelay(0);
        expect(delay).toBe(1000); // Base delay
      });
    });
  });

  describe("Error Logging and Management", () => {
    describe("logError", () => {
      it("should log error with enhanced context", () => {
        const error = UploadError.uploadError("Upload failed", "file-123");
        ErrorBoundary.logError(error);

        const stats = ErrorBoundary.getErrorStats();
        expect(stats.total).toBe(1);
        expect(stats.byOperation.upload).toBe(1);
        expect(stats.byCode.UPLOAD_ERROR).toBe(1);
      });

      it("should enhance context with tracking information", () => {
        const error = UploadError.networkError("Connection failed", "file-123");
        ErrorBoundary.logError(error);

        const recentErrors = ErrorBoundary.getRecentErrors(1);
        const loggedError = recentErrors[0];

        expect(loggedError.context.correlationId).toBeDefined();
        expect(loggedError.context.sessionId).toBeDefined();
        expect(loggedError.context.userAgent).toBeDefined(); // In test environment, jsdom provides userAgent
        expect(loggedError.context.timestamp).toBeDefined();
      });

      it("should maintain log size limit", () => {
        const maxLogSize = 100;
        const testErrors = Array.from({ length: maxLogSize + 10 }, (_, i) =>
          UploadError.uploadError(`Error ${i}`, `file-${i}`)
        );

        testErrors.forEach((error) => ErrorBoundary.logError(error));

        const stats = ErrorBoundary.getErrorStats();
        expect(stats.total).toBeLessThanOrEqual(maxLogSize);
      });

      it("should log to console in development", () => {
        // Temporarily set NODE_ENV to development
        mockEnv.NODE_ENV = "development";

        const error = UploadError.validationError("File too large");
        ErrorBoundary.logError(error);

        expect(console.error).toHaveBeenCalledWith(
          "SmartDropzone Error:",
          expect.any(UploadError)
        );

        // Reset to test
        mockEnv.NODE_ENV = "test";
      });

      it("should not log to console in production", () => {
        // Temporarily set NODE_ENV to production
        mockEnv.NODE_ENV = "production";

        const error = UploadError.validationError("File too large");
        ErrorBoundary.logError(error);

        expect(console.error).not.toHaveBeenCalled();

        // Reset to test
        mockEnv.NODE_ENV = "test";
      });
    });

    describe("getErrorStats", () => {
      it("should return correct statistics", () => {
        const errors = [
          UploadError.uploadError("Upload failed", "file-1"),
          UploadError.networkError("Connection failed", "file-2"),
          UploadError.validationError("File too large", "file-3"),
          UploadError.uploadError("Another upload failed", "file-4"),
        ];

        errors.forEach((error) => ErrorBoundary.logError(error));

        const stats = ErrorBoundary.getErrorStats();

        expect(stats.total).toBe(4);
        expect(stats.byOperation.upload).toBe(2);
        expect(stats.byOperation.network).toBe(1);
        expect(stats.byOperation.validation).toBe(1);
        expect(stats.byCode.UPLOAD_ERROR).toBe(2);
        expect(stats.byCode.NETWORK_ERROR).toBe(1);
        expect(stats.byCode.VALIDATION_ERROR).toBe(1);
        expect(stats.retryableCount).toBe(3); // upload + network errors
      });

      it("should handle empty error log", () => {
        const stats = ErrorBoundary.getErrorStats();

        expect(stats.total).toBe(0);
        expect(stats.byOperation).toEqual({});
        expect(stats.byCode).toEqual({});
        expect(stats.retryableCount).toBe(0);
      });
    });

    describe("getRecentErrors", () => {
      it("should return recent errors in correct order", () => {
        const errors = [
          UploadError.uploadError("First error", "file-1"),
          UploadError.networkError("Second error", "file-2"),
          UploadError.validationError("Third error", "file-3"),
        ];

        errors.forEach((error) => ErrorBoundary.logError(error));

        const recentErrors = ErrorBoundary.getRecentErrors(2);
        expect(recentErrors).toHaveLength(2);
        expect(recentErrors[0].technicalMessage).toContain("Second error");
        expect(recentErrors[1].technicalMessage).toContain("Third error");
      });

      it("should return all errors when limit exceeds total", () => {
        const error = UploadError.uploadError("Single error", "file-1");
        ErrorBoundary.logError(error);

        const recentErrors = ErrorBoundary.getRecentErrors(10);
        expect(recentErrors).toHaveLength(1);
      });

      it("should return empty array when no errors logged", () => {
        const recentErrors = ErrorBoundary.getRecentErrors(5);
        expect(recentErrors).toHaveLength(0);
      });
    });

    describe("clearErrorLogs", () => {
      it("should clear all error logs", () => {
        const error = UploadError.uploadError("Test error", "file-1");
        ErrorBoundary.logError(error);

        expect(ErrorBoundary.getErrorStats().total).toBe(1);

        ErrorBoundary.clearErrorLogs();

        expect(ErrorBoundary.getErrorStats().total).toBe(0);
        expect(ErrorBoundary.getRecentErrors()).toHaveLength(0);
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle errors without fileId", () => {
      const error = UploadError.networkError("Connection failed");
      expect(error.context.fileId).toBeUndefined();
    });

    it("should handle errors without fileName", () => {
      const error = UploadError.uploadError("Upload failed", "file-123");
      expect(error.context.fileName).toBeUndefined();
    });

    it("should handle errors without provider", () => {
      const error = UploadError.providerError("Service error");
      expect(error.context.provider).toBeUndefined();
    });

    it("should handle errors with custom details", () => {
      const context: ErrorContext = {
        operation: "upload",
        fileId: "file-123",
        details: { customField: "customValue" },
      };

      const error = new UploadError(
        "CUSTOM_ERROR",
        "Custom message",
        "Technical",
        context
      );
      expect(error.context.details?.customField).toBe("customValue");
    });

    it("should handle correlation and session ID generation", () => {
      const error = UploadError.uploadError("Test error", "file-123");
      ErrorBoundary.logError(error);

      const recentErrors = ErrorBoundary.getRecentErrors(1);
      const loggedError = recentErrors[0];

      expect(loggedError.context.correlationId).toMatch(/^corr-\d+-\w+$/);
      expect(loggedError.context.sessionId).toMatch(/^session-\d+-\w+$/);
    });

    it("should handle multiple error types in same session", () => {
      const errors = [
        UploadError.validationError("File too large", "large.jpg"),
        UploadError.uploadError("Upload failed", "file-1"),
        UploadError.networkError("Connection failed", "file-2"),
        UploadError.providerError(
          "Service unavailable",
          "cloudinary",
          "file-3"
        ),
        UploadError.processingError("Processing failed", "file-4"),
      ];

      errors.forEach((error) => ErrorBoundary.logError(error));

      const stats = ErrorBoundary.getErrorStats();
      expect(stats.total).toBe(5);
      expect(stats.retryableCount).toBe(3); // upload + network + provider
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete error lifecycle", () => {
      // 1. Create and log various errors
      const validationError = UploadError.validationError(
        "File too large",
        "large.jpg"
      );
      const uploadError = UploadError.uploadError("Upload failed", "file-123");
      const networkError = UploadError.networkError(
        "Connection timeout",
        "file-456"
      );

      ErrorBoundary.logError(validationError);
      ErrorBoundary.logError(uploadError);
      ErrorBoundary.logError(networkError);

      // 2. Check statistics
      const stats = ErrorBoundary.getErrorStats();
      expect(stats.total).toBe(3);
      expect(stats.retryableCount).toBe(2);

      // 3. Check retry logic
      expect(ErrorBoundary.shouldRetry(validationError, 1)).toBe(false);
      expect(ErrorBoundary.shouldRetry(uploadError, 1)).toBe(true);
      expect(ErrorBoundary.shouldRetry(networkError, 1)).toBe(true);

      // 4. Check retry delays
      expect(ErrorBoundary.getRetryDelay(1)).toBeGreaterThan(0);
      expect(ErrorBoundary.getRetryDelay(2)).toBeGreaterThan(
        ErrorBoundary.getRetryDelay(1)
      );

      // 5. Check user messages
      expect(ErrorBoundary.getUserMessage(validationError)).toBe(
        "File too large"
      );
      expect(ErrorBoundary.getUserMessage(uploadError)).toBe("Upload failed");
      expect(ErrorBoundary.getUserMessage(networkError)).toBe(
        "Network connection issue. Please check your internet connection and try again."
      );

      // 6. Check error codes
      expect(ErrorBoundary.getErrorCode(validationError)).toBe(
        "VALIDATION_ERROR"
      );
      expect(ErrorBoundary.getErrorCode(uploadError)).toBe("UPLOAD_ERROR");
      expect(ErrorBoundary.getErrorCode(networkError)).toBe("NETWORK_ERROR");
    });

    it("should handle error recovery scenarios", () => {
      // Simulate a retry scenario
      const networkError = UploadError.networkError(
        "Connection failed",
        "file-123"
      );

      // First attempt (index 1 uses exponential calculation)
      expect(ErrorBoundary.shouldRetry(networkError, 1)).toBe(true);
      expect(ErrorBoundary.getRetryDelay(1)).toBe(1000 * Math.pow(2, 1)); // 2000ms

      // Second attempt
      expect(ErrorBoundary.shouldRetry(networkError, 2)).toBe(true);
      expect(ErrorBoundary.getRetryDelay(2)).toBe(1000 * Math.pow(2, 2)); // 4000ms

      // Max attempts reached
      expect(ErrorBoundary.shouldRetry(networkError, 3)).toBe(false);
    });
  });
});
