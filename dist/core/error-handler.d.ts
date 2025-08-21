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
export declare class UploadError extends Error {
    readonly code: string;
    readonly context: ErrorContext;
    readonly userMessage: string;
    readonly technicalMessage: string;
    readonly timestamp: Date;
    readonly retryable: boolean;
    constructor(code: string, userMessage: string, technicalMessage: string, context: ErrorContext, retryable?: boolean);
    static validationError(message: string, fileName?: string): UploadError;
    static uploadError(message: string, fileId: string, fileName?: string): UploadError;
    static networkError(message: string, fileId?: string): UploadError;
    static providerError(message: string, provider: string, fileId?: string): UploadError;
    static processingError(message: string, fileId?: string): UploadError;
    toJSON(): {
        code: string;
        userMessage: string;
        technicalMessage: string;
        context: ErrorContext;
        timestamp: string;
        retryable: boolean;
        stack: string | undefined;
    };
}
export declare class ErrorBoundary {
    private static readonly errorMap;
    private static errorLogs;
    private static maxLogSize;
    private static sessionId;
    static getUserMessage(error: Error | UploadError): string;
    static isRetryable(error: Error | UploadError): boolean;
    static getErrorCode(error: Error | UploadError): string;
    static logError(error: UploadError): void;
    static getErrorStats(): {
        total: number;
        byOperation: Record<string, number>;
        byCode: Record<string, number>;
        retryableCount: number;
    };
    static clearErrorLogs(): void;
    static getRecentErrors(limit?: number): UploadError[];
    static shouldRetry(error: Error | UploadError, attemptCount: number): boolean;
    static getRetryDelay(attemptCount: number): number;
    private static generateSessionId;
    private static generateCorrelationId;
}
//# sourceMappingURL=error-handler.d.ts.map