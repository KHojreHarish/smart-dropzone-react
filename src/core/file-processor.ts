import type {
  UploadFile,
  UploadOptions,
  FileValidationResult,
  FileProcessingResult,
} from "../types";
import { FILE_SIZE } from "./config";
import { InputValidator } from "./validation";

/**
 * Enhanced file processor with comprehensive validation and error handling
 * Provider-agnostic and highly configurable
 */
export class FileProcessor {
  private readonly options: Required<
    Omit<
      UploadOptions,
      | "folder"
      | "onProgress"
      | "onSuccess"
      | "onError"
      | "onCancel"
      | "metadata"
      | "tags"
    >
  >;

  constructor(options: UploadOptions = {}) {
    this.options = {
      maxFiles: options.maxFiles || 10,
      maxFileSize: options.maxFileSize || FILE_SIZE.DEFAULT_MAX_SIZE,
      allowedTypes: options.allowedTypes || [
        "image/*",
        "application/pdf",
        "text/*",
      ],
    };
  }

  /**
   * Process and validate multiple files with comprehensive error handling
   */
  async processFiles(files: readonly File[]): Promise<FileProcessingResult> {
    // Validate input files
    const validation = InputValidator.validateFileList(files as File[]);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    if (!files.length) {
      return { success: true, files: [] };
    }

    if (files.length > this.options.maxFiles) {
      return {
        success: false,
        errors: [
          `Maximum ${this.options.maxFiles} files allowed. Received ${files.length} files.`,
        ],
      };
    }

    const processedFiles: UploadFile[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.processFile(file);
        if (result.success && result.file) {
          processedFiles.push(result.file);
        } else if (result.error) {
          errors.push(result.error);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        errors.push(`Failed to process ${file.name}: ${errorMessage}`);
      }
    }

    return {
      success: processedFiles.length > 0,
      files: processedFiles,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Process a single file with comprehensive validation
   */
  private async processFile(
    file: File
  ): Promise<{ success: boolean; file?: UploadFile; error?: string }> {
    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Validation failed" };
    }

    // Generate preview for images
    let preview: string | undefined;
    if (FileProcessor.isImage(file.type)) {
      try {
        preview = await this.generatePreview(file);
      } catch (error) {
        console.warn(`Failed to generate preview for ${file.name}:`, error);
        // Continue without preview - not a critical error
      }
    }

    const processedFile: UploadFile = {
      id: this.generateFileId(file),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview,
      progress: 0,
      status: "pending",
    };

    return { success: true, file: processedFile };
  }

  /**
   * Comprehensive file validation with detailed error messages
   */
  private validateFile(file: File): FileValidationResult {
    const warnings: string[] = [];

    // Check file size
    if (file.size > this.options.maxFileSize) {
      const maxSizeMB = Math.round(
        this.options.maxFileSize / FILE_SIZE.BYTES_PER_MB
      );
      const fileSizeMB = Math.round(file.size / FILE_SIZE.BYTES_PER_MB);
      return {
        valid: false,
        error: `File "${file.name}" is too large. Maximum size: ${maxSizeMB}MB, Received: ${fileSizeMB}MB`,
      };
    }

    // Check file type
    if (this.options.allowedTypes.length > 0) {
      const isValidType = this.options.allowedTypes.some((type) => {
        if (type === "*") return true;
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return file.type.startsWith(category + "/");
        }
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isValidType) {
        return {
          valid: false,
          error: `File type "${
            file.type
          }" not allowed. Allowed types: ${this.options.allowedTypes.join(
            ", "
          )}`,
        };
      }
    }

    // Additional validations
    if (file.size === 0) {
      warnings.push("File appears to be empty");
    }

    if (file.name.length > 255) {
      warnings.push("Filename is very long");
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Generate preview for image files with error handling
   */
  private generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!FileProcessor.isImage(file.type)) {
        reject(new Error("Preview only available for image files"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to generate preview"));
        }
      };
      reader.onerror = () =>
        reject(new Error("Failed to read file for preview"));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate unique file ID with collision resistance
   */
  private generateFileId(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop() || "";
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 20);

    return `${sanitizedName}_${timestamp}_${random}${
      extension ? `.${extension}` : ""
    }`;
  }

  // Static utility methods
  /**
   * Format file size for human-readable display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = FILE_SIZE.BYTES_PER_KB;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    if (i >= sizes.length)
      return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(2)} TB`;

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Get appropriate file icon based on MIME type
   */
  static getFileIcon(type: string): string {
    if (FileProcessor.isImage(type)) return "🖼️";
    if (FileProcessor.isVideo(type)) return "🎥";
    if (FileProcessor.isAudio(type)) return "🎵";
    if (FileProcessor.isDocument(type)) return "📄";
    if (FileProcessor.isArchive(type)) return "📦";
    if (FileProcessor.isCode(type)) return "💻";
    return "📁";
  }

  /**
   * Type checking methods with better accuracy
   */
  static isImage(type: string): boolean {
    return type.startsWith("image/");
  }

  static isVideo(type: string): boolean {
    return type.startsWith("video/");
  }

  static isAudio(type: string): boolean {
    return type.startsWith("audio/");
  }

  static isDocument(type: string): boolean {
    return (
      (type.startsWith("text/") &&
        !type.includes("javascript") &&
        !type.includes("typescript")) ||
      type === "application/pdf" ||
      type.includes("document") ||
      type.includes("word") ||
      type.includes("excel") ||
      type.includes("powerpoint") ||
      type.includes("presentation")
    );
  }

  static isArchive(type: string): boolean {
    return (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("tar") ||
      type.includes("7z") ||
      type.includes("gzip") ||
      type.includes("bzip2")
    );
  }

  static isCode(type: string): boolean {
    return (
      type.includes("javascript") ||
      type.includes("typescript") ||
      type.includes("python") ||
      type.includes("java") ||
      type.includes("c++") ||
      type.includes("c#") ||
      type.includes("php") ||
      type.includes("ruby") ||
      type.includes("go") ||
      type.includes("rust") ||
      type.includes("swift") ||
      type.includes("kotlin") ||
      type.includes("x-python") ||
      type.includes("x-java") ||
      type.includes("x-c++") ||
      type.includes("x-c#") ||
      type.includes("x-php") ||
      type.includes("x-ruby") ||
      type.includes("x-go") ||
      type.includes("x-rust") ||
      type.includes("x-swift") ||
      type.includes("x-kotlin")
    );
  }

  /**
   * Get file category for better organization
   */
  static getFileCategory(
    type: string
  ): "image" | "video" | "audio" | "document" | "archive" | "code" | "other" {
    if (FileProcessor.isImage(type)) return "image";
    if (FileProcessor.isVideo(type)) return "video";
    if (FileProcessor.isAudio(type)) return "audio";
    if (FileProcessor.isDocument(type)) return "document";
    if (FileProcessor.isArchive(type)) return "archive";
    if (FileProcessor.isCode(type)) return "code";
    return "other";
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    const parts = filename.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
  }

  /**
   * Check if file is potentially dangerous
   */
  static isPotentiallyDangerous(filename: string): boolean {
    const dangerousExtensions = [
      "exe",
      "bat",
      "cmd",
      "com",
      "pif",
      "scr",
      "vbs",
      "js",
      "jar",
      "msi",
      "ps1",
      "psm1",
      "psd1",
      "ps1xml",
      "psc1",
      "psc2",
      "py",
      "pyc",
      "pyw",
    ];
    const ext = FileProcessor.getFileExtension(filename);
    return dangerousExtensions.includes(ext);
  }
}
