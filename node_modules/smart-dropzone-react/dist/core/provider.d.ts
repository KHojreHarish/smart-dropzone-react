import type { UploadOptions, UploadResponse } from "../types";
/**
 * Abstract base class for all upload providers
 * This allows for easy switching between different upload services
 */
export declare abstract class UploadProvider {
    protected readonly name: string;
    protected readonly config: Record<string, any>;
    constructor(name: string, config?: Record<string, any>);
    /**
     * Get the provider name
     */
    getName(): string;
    /**
     * Get the provider configuration
     */
    getConfig(): Record<string, any>;
    /**
     * Initialize the provider (called before first use)
     */
    abstract initialize(): Promise<void>;
    /**
     * Check if the provider is properly configured
     */
    abstract isConfigured(): boolean;
    /**
     * Upload a single file
     */
    abstract uploadFile(file: File, options: UploadOptions): Promise<UploadResponse>;
    /**
     * Upload multiple files
     */
    abstract uploadFiles(files: readonly File[], options: UploadOptions, onProgress?: (fileId: string, progress: number) => void): Promise<UploadResponse[]>;
    /**
     * Delete a file by its ID
     */
    abstract deleteFile(fileId: string): Promise<void>;
    /**
     * Get file information by ID
     */
    abstract getFileInfo(fileId: string): Promise<UploadResponse | null>;
    /**
     * Generate a preview URL for a file
     */
    abstract generatePreviewUrl(fileId: string, options?: Record<string, any>): string;
    /**
     * Validate provider-specific options
     */
    abstract validateOptions(options: UploadOptions): {
        valid: boolean;
        error?: string;
    };
    /**
     * Get upload statistics
     */
    abstract getStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        provider: string;
    }>;
    /**
     * Test the provider connection
     */
    abstract testConnection(): Promise<boolean>;
    /**
     * Clean up resources
     */
    cleanup(): Promise<void>;
}
/**
 * Provider factory for creating provider instances
 */
export declare class ProviderFactory {
    private static providers;
    /**
     * Register a provider class
     */
    static register(name: string, providerClass: new (config: any) => UploadProvider): void;
    /**
     * Create a provider instance
     */
    static create(name: string, config: any): UploadProvider;
    /**
     * Get list of available providers
     */
    static getAvailableProviders(): string[];
}
/**
 * Provider configuration interface
 */
export interface ProviderConfig {
    readonly name: string;
    readonly type: string;
    readonly config: Record<string, any>;
    readonly enabled: boolean;
}
//# sourceMappingURL=provider.d.ts.map