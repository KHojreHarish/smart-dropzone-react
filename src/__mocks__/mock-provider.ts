import { UploadProvider } from "../core/provider";
import type { UploadOptions, UploadResponse } from "../types";

export class MockProvider extends UploadProvider {
  private initialized = false;

  constructor(name: string = "mock", config: Record<string, any> = {}) {
    super(name, config);
  }

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  isConfigured(): boolean {
    return this.initialized;
  }

  async uploadFile(file: File, options: UploadOptions): Promise<UploadResponse> {
    if (!this.isConfigured()) {
      throw new Error("Mock provider not properly configured");
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      url: `https://mock.example.com/${file.name}`,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      metadata: {
        provider: this.getName(),
        uploadedAt: new Date().toISOString(),
        ...options.metadata,
      },
      createdAt: new Date(),
    };
  }

  async uploadFiles(
    files: readonly File[],
    options: UploadOptions,
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<UploadResponse[]> {
    const results: UploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `mock-${Date.now()}-${i}`;
      
      // Simulate progress
      if (onProgress) {
        onProgress(fileId, 0);
        setTimeout(() => onProgress(fileId, 50), 50);
        setTimeout(() => onProgress(fileId, 100), 100);
      }
      
      const result = await this.uploadFile(file, options);
      results.push(result);
    }
    
    return results;
  }

  async deleteFile(_fileId: string): Promise<void> {
    // Mock delete - always succeeds
  }

  async getFileInfo(fileId: string): Promise<UploadResponse | null> {
    return {
      id: fileId,
      url: `https://mock.example.com/${fileId}`,
      filename: fileId,
      size: 0,
      mimeType: "application/octet-stream",
      createdAt: new Date(),
    };
  }

  generatePreviewUrl(fileId: string): string {
    return `https://mock.example.com/preview/${fileId}`;
  }

  validateOptions(_options: UploadOptions): { valid: boolean; error?: string } {
    return { valid: true };
  }

  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    provider: string;
  }> {
    return {
      totalFiles: 0,
      totalSize: 0,
      provider: this.getName(),
    };
  }

  async testConnection(): Promise<boolean> {
    return this.isConfigured();
  }

  async cleanup(): Promise<void> {
    this.initialized = false;
  }
}
