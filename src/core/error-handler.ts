import { TIMING, UPLOAD } from "./config";

export interface ErrorContext {
  operation: "validation" | "upload" | "processing" | "network" | "provider";
  fileId?: string;
  fileName?: string;
  provider?: string;
  details?: Record<string, any>;
  correlationId?: string;
  userAgent?: string;
  sessionId?: string;
}

export class UploadError extends Error {
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly userMessage: string;
  public readonly technicalMessage: string;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    code: string,
    userMessage: string,
    technicalMessage: string,
    context: ErrorContext,
    retryable: boolean = false
  ) {
    super(userMessage);
    this.name = "UploadError";
    this.code = code;
    this.context = context;
    this.userMessage = userMessage;
    this.technicalMessage = technicalMessage;
    this.timestamp = new Date();
    this.retryable = retryable;
  }

  static validationError(message: string, fileName?: string): UploadError {
    return new UploadError(
      "VALIDATION_ERROR",
      message,
      `File validation failed: ${message}`,
      { operation: "validation", fileName },
      false
    );
  }

  static uploadError(
    message: string,
    fileId: string,
    fileName?: string
  ): UploadError {
    return new UploadError(
      "UPLOAD_ERROR",
      message,
      `Upload failed for file ${fileName || fileId}: ${message}`,
      { operation: "upload", fileId, fileName },
      true
    );
  }

  static networkError(message: string, fileId?: string): UploadError {
    return new UploadError(
      "NETWORK_ERROR",
      "Network connection issue. Please check your internet connection and try again.",
      `Network error: ${message}`,
      { operation: "network", fileId },
      true
    );
  }

  static providerError(
    message: string,
    provider: string,
    fileId?: string
  ): UploadError {
    return new UploadError(
      "PROVIDER_ERROR",
      `Service temporarily unavailable. Please try again later.`,
      `Provider ${provider} error: ${message}`,
      { operation: "provider", provider, fileId },
      true
    );
  }

  static processingError(message: string, fileId?: string): UploadError {
    return new UploadError(
      "PROCESSING_ERROR",
      "File processing failed. Please try a different file.",
      `Processing error: ${message}`,
      { operation: "processing", fileId },
      false
    );
  }

  toJSON() {
    return {
      code: this.code,
      userMessage: this.userMessage,
      technicalMessage: this.technicalMessage,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

export class ErrorBoundary {
  private static readonly errorMap = new Map<string, string>([
    ["FILE_TOO_LARGE", "File is too large. Please choose a smaller file."],
    [
      "INVALID_FILE_TYPE",
      "File type not supported. Please choose a different file.",
    ],
    [
      "TOO_MANY_FILES",
      "Too many files selected. Please reduce the number of files.",
    ],
    [
      "NETWORK_TIMEOUT",
      "Upload timed out. Please check your connection and try again.",
    ],
    [
      "QUOTA_EXCEEDED",
      "Storage quota exceeded. Please remove some files and try again.",
    ],
    [
      "FILE_CORRUPTED",
      "File appears to be corrupted. Please try a different file.",
    ],
    ["UPLOAD_CANCELLED", "Upload was cancelled."],
    [
      "PROVIDER_UNAVAILABLE",
      "Upload service is temporarily unavailable. Please try again later.",
    ],
  ]);

  private static errorLogs: UploadError[] = [];
  private static maxLogSize: number = 100;
  private static sessionId: string = this.generateSessionId();

  static getUserMessage(error: Error | UploadError): string {
    if (error instanceof UploadError) {
      return error.userMessage;
    }

    // Map common error messages to user-friendly versions
    const errorMessage = error.message.toLowerCase();

    for (const [code, userMessage] of this.errorMap) {
      if (
        errorMessage.includes(code.toLowerCase()) ||
        errorMessage.includes(code.replace("_", " ").toLowerCase())
      ) {
        return userMessage;
      }
    }

    // Default user-friendly message
    return "Something went wrong. Please try again.";
  }

  static isRetryable(error: Error | UploadError): boolean {
    if (error instanceof UploadError) {
      return error.retryable;
    }

    // Determine if error is retryable based on message
    const errorMessage = error.message.toLowerCase();
    const retryablePatterns = [
      "network",
      "timeout",
      "connection",
      "server error",
      "temporary",
      "rate limit",
    ];

    return retryablePatterns.some((pattern) => errorMessage.includes(pattern));
  }

  static getErrorCode(error: Error | UploadError): string {
    if (error instanceof UploadError) {
      return error.code;
    }

    // Infer error code from message
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection")
    ) {
      return "NETWORK_ERROR";
    }
    if (errorMessage.includes("timeout")) {
      return "TIMEOUT_ERROR";
    }
    if (errorMessage.includes("validation")) {
      return "VALIDATION_ERROR";
    }

    return "UNKNOWN_ERROR";
  }

  static logError(error: UploadError): void {
    // Enhance context with additional tracking information
    const enhancedContext = {
      ...error.context,
      correlationId:
        error.context.correlationId || this.generateCorrelationId(),
      sessionId: this.sessionId,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      timestamp: new Date().toISOString(),
    };

    // Create a new UploadError with enhanced context
    const enhancedError = new UploadError(
      error.code,
      error.userMessage,
      error.technicalMessage,
      enhancedContext,
      error.retryable
    );

    // Add to internal log
    this.errorLogs.push(enhancedError);

    // Maintain log size limit
    if (this.errorLogs.length > this.maxLogSize) {
      this.errorLogs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("SmartDropzone Error:", enhancedError);
    }

    // In production, you could send to error tracking service
    // this.sendToErrorService(enhancedError);
  }

  static getErrorStats(): {
    total: number;
    byOperation: Record<string, number>;
    byCode: Record<string, number>;
    retryableCount: number;
  } {
    const stats = {
      total: this.errorLogs.length,
      byOperation: {} as Record<string, number>,
      byCode: {} as Record<string, number>,
      retryableCount: 0,
    };

    this.errorLogs.forEach((error) => {
      // Count by operation
      stats.byOperation[error.context.operation] =
        (stats.byOperation[error.context.operation] || 0) + 1;

      // Count by code
      stats.byCode[error.code] = (stats.byCode[error.code] || 0) + 1;

      // Count retryable errors
      if (error.retryable) {
        stats.retryableCount++;
      }
    });

    return stats;
  }

  static clearErrorLogs(): void {
    this.errorLogs = [];
  }

  static getRecentErrors(limit: number = 10): UploadError[] {
    return this.errorLogs.slice(-limit);
  }

  static shouldRetry(
    error: Error | UploadError,
    attemptCount: number
  ): boolean {
    if (attemptCount >= UPLOAD.MAX_RETRY_ATTEMPTS) {
      return false;
    }

    return this.isRetryable(error);
  }

  static getRetryDelay(attemptCount: number): number {
    return (
      TIMING.RETRY_DELAY * Math.pow(TIMING.RETRY_EXPONENTIAL_BASE, attemptCount)
    );
  }

  private static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Optional: Send errors to external service
  // private static sendToErrorService(error: UploadError): void {
  //   // Implementation for sending to error tracking service
  //   // (Sentry, LogRocket, etc.)
  // }
}
