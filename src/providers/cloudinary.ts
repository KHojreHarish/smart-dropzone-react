import { UploadProvider } from "../core/provider";
import type { UploadOptions, UploadResponse } from "../types";

/**
 * Cloudinary-specific upload response interface
 */
interface CloudinaryResponse {
  readonly public_id: string;
  readonly secure_url: string;
  readonly original_filename: string;
  readonly format: string;
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
  readonly resource_type: string;
  readonly created_at: string;
  readonly etag: string;
}

/**
 * Cloudinary provider configuration
 */
export interface CloudinaryConfig {
  readonly cloudName: string;
  readonly apiKey?: string;
  readonly apiSecret?: string;
  readonly uploadPreset?: string;
  readonly defaultFolder?: string;
}

/**
 * Cloudinary upload provider implementation
 */
export class CloudinaryProvider extends UploadProvider {
  private readonly cloudName: string;
  // API key and secret are kept for future server-side uploads
  // private readonly apiKey?: string;
  // private readonly apiSecret?: string;
  private readonly uploadPreset?: string;
  private readonly defaultFolder?: string;
  private initialized = false;

  constructor(config: CloudinaryConfig) {
    super("cloudinary", config);
    this.cloudName = config.cloudName;
    // this.apiKey = config.apiKey;
    // this.apiSecret = config.apiSecret;
    this.uploadPreset = config.uploadPreset;
    this.defaultFolder = config.defaultFolder;
  }

  /**
   * Initialize the Cloudinary provider
   */
  async initialize(): Promise<void> {
    if (!this.cloudName) {
      throw new Error("Cloudinary cloud name is required");
    }

    // Test connection by making a simple request
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${this.cloudName}/image/upload/v1/`
      );
      if (response.ok) {
        this.initialized = true;
      } else {
        throw new Error(`Failed to connect to Cloudinary: ${response.status}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize Cloudinary provider: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.cloudName && this.initialized);
  }

  /**
   * Upload a single file to Cloudinary
   */
  async uploadFile(
    file: File,
    options: UploadOptions
  ): Promise<UploadResponse> {
    if (!this.isConfigured()) {
      throw new Error("Cloudinary provider not properly configured");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use folder from options or default folder
      const folder = options.folder || this.defaultFolder;
      if (folder) {
        formData.append("folder", folder);
      }

      // Add upload preset if available
      if (this.uploadPreset) {
        formData.append("upload_preset", this.uploadPreset);
      }

      // Add metadata if provided
      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          formData.append(`context`, `${key}=${value}`);
        });
      }

      // Add tags if provided
      if (options.tags && options.tags.length > 0) {
        formData.append("tags", options.tags.join(","));
      }

      const response = await this.performUpload(formData);
      return this.mapCloudinaryResponse(response, file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown upload error";
      throw new Error(`Upload failed for ${file.name}: ${errorMessage}`);
    }
  }

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadFiles(
    files: readonly File[],
    options: UploadOptions,
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<UploadResponse[]> {
    if (!files.length) {
      return [];
    }

    const uploadPromises = files.map(async (file, index) => {
      const fileId = this.generateFileId(file, index);

      try {
        if (onProgress) {
          // Simulate progress for better UX
          const progressInterval = setInterval(() => {
            const progress = Math.min(Math.random() * 90, 85); // Random progress up to 85%
            onProgress(fileId, progress);
          }, 200);

          try {
            const result = await this.uploadFile(file, options);
            onProgress(fileId, 100);
            clearInterval(progressInterval);
            return result;
          } catch (error) {
            clearInterval(progressInterval);
            throw error;
          }
        } else {
          return this.uploadFile(file, options);
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error;
      }
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(
        `Batch upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("Cloudinary provider not properly configured");
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/delete_by_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: fileId, // In Cloudinary, this would be the delete token
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete file: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      throw new Error(
        `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get file information from Cloudinary
   */
  async getFileInfo(fileId: string): Promise<UploadResponse | null> {
    if (!this.isConfigured()) {
      throw new Error("Cloudinary provider not properly configured");
    }

    try {
      const response = await fetch(
        `https://res.cloudinary.com/${this.cloudName}/image/upload/v1/${fileId}`
      );

      if (!response.ok) {
        return null;
      }

      // This is a simplified approach - in practice you'd use Cloudinary's Admin API
      return {
        id: fileId,
        url: response.url,
        filename: fileId,
        size: 0, // Would need Admin API to get actual size
        mimeType: "image/*", // Would need Admin API to get actual type
        createdAt: new Date(),
      };
    } catch (error) {
      console.warn(`Failed to get file info for ${fileId}:`, error);
      return null;
    }
  }

  /**
   * Generate a preview URL for a file
   */
  generatePreviewUrl(
    fileId: string,
    options: Record<string, any> = {}
  ): string {
    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    const transformations = this.buildTransformations(options);

    if (transformations) {
      return `${baseUrl}/${transformations}/${fileId}`;
    } else {
      return `${baseUrl}/${fileId}`;
    }
  }

  /**
   * Validate provider-specific options
   */
  validateOptions(options: UploadOptions): { valid: boolean; error?: string } {
    // Check if folder is valid (no special characters, reasonable length)
    if (
      options.folder &&
      (options.folder.length > 100 || /[<>:"|?*]/.test(options.folder))
    ) {
      return {
        valid: false,
        error:
          "Invalid folder name. Folder names cannot contain special characters and must be under 100 characters.",
      };
    }

    return { valid: true };
  }

  /**
   * Get upload statistics
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    provider: string;
  }> {
    // This would require Cloudinary Admin API access
    return {
      totalFiles: 0,
      totalSize: 0,
      provider: "cloudinary",
    };
  }

  /**
   * Test the provider connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${this.cloudName}/image/upload/v1/`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Perform the actual upload request to Cloudinary
   */
  private async performUpload(formData: FormData): Promise<CloudinaryResponse> {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.error || errorText;
      } catch {
        errorMessage = errorText;
      }

      throw new Error(
        `Upload failed: ${response.status} ${response.statusText} - ${errorMessage}`
      );
    }

    try {
      const result: CloudinaryResponse = await response.json();
      return result;
    } catch (error) {
      throw new Error("Failed to parse upload response");
    }
  }

  /**
   * Map Cloudinary response to generic UploadResponse
   */
  private mapCloudinaryResponse(
    response: CloudinaryResponse,
    file: File
  ): UploadResponse {
    return {
      id: response.public_id,
      url: response.secure_url,
      filename: response.original_filename,
      size: response.bytes,
      mimeType: file.type,
      metadata: {
        format: response.format,
        width: response.width,
        height: response.height,
        resourceType: response.resource_type,
        etag: response.etag,
      },
      createdAt: new Date(response.created_at),
    };
  }

  /**
   * Build Cloudinary transformations string
   */
  private buildTransformations(options: Record<string, any>): string {
    const transformations: string[] = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    return transformations.length > 0 ? transformations.join(",") : "";
  }

  /**
   * Generate unique file ID for tracking
   */
  private generateFileId(_file: File, index: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `upload_${timestamp}_${index}_${random}`;
  }
}
