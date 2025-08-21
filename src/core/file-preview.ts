import { DIMENSIONS, QUALITY, FORMATS, VIDEO } from "./config";

export interface PreviewOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface FilePreview {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: "image" | "video" | "document" | "other";
  dimensions?: { width: number; height: number };
  duration?: number; // for videos
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

export class FilePreviewManager {
  private static instance: FilePreviewManager;
  private previewCache: Map<string, FilePreview> = new Map();
  private supportedImageTypes = [...FORMATS.SUPPORTED_IMAGE_FORMATS];
  private supportedVideoTypes = [...FORMATS.SUPPORTED_VIDEO_FORMATS];

  static getInstance(): FilePreviewManager {
    if (!FilePreviewManager.instance) {
      FilePreviewManager.instance = new FilePreviewManager();
    }
    return FilePreviewManager.instance;
  }

  async generatePreview(
    file: File,
    options: PreviewOptions = {}
  ): Promise<FilePreview> {
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;

    if (this.previewCache.has(cacheKey)) {
      return this.previewCache.get(cacheKey)!;
    }

    const preview = await this.createPreview(file, options);
    this.previewCache.set(cacheKey, preview);

    return preview;
  }

  private async createPreview(
    file: File,
    options: PreviewOptions
  ): Promise<FilePreview> {
    const {
      maxWidth = DIMENSIONS.DEFAULT_MAX_WIDTH,
      maxHeight = DIMENSIONS.DEFAULT_MAX_HEIGHT,
      quality = QUALITY.DEFAULT_IMAGE_QUALITY,
      format = FORMATS.DEFAULT_FORMAT,
    } = options;

    if (this.supportedImageTypes.includes(file.type as any)) {
      return this.createImagePreview(file, {
        maxWidth,
        maxHeight,
        quality,
        format,
      });
    } else if (this.supportedVideoTypes.includes(file.type as any)) {
      return this.createVideoPreview(file, {
        maxWidth,
        maxHeight,
        thumbnailSize: options.thumbnailSize || DIMENSIONS.THUMBNAIL_SIZE,
      });
    } else {
      return this.createGenericPreview(file);
    }
  }

  private async createImagePreview(
    file: File,
    options: PreviewOptions
  ): Promise<FilePreview> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        try {
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            options.maxWidth!,
            options.maxHeight!
          );

          canvas.width = width;
          canvas.height = height;

          // Enable image smoothing for better quality
          ctx!.imageSmoothingEnabled = true;
          ctx!.imageSmoothingQuality = "high";

          // Draw image with proper scaling
          ctx!.drawImage(img, 0, 0, width, height);

          // Convert to desired format with quality
          const dataUrl = canvas.toDataURL(
            `image/${options.format}`,
            options.quality
          );

          const preview: FilePreview = {
            id: this.generatePreviewId(file),
            url: dataUrl,
            type: "image",
            dimensions: { width, height: height },
            size: file.size,
            mimeType: file.type,
            metadata: {
              originalWidth: img.width,
              originalHeight: img.height,
              aspectRatio: img.width / img.height,
              format: options.format,
              quality: options.quality,
            },
          };

          // Generate thumbnail if requested
          if (options.generateThumbnail) {
            this.generateThumbnail(
              canvas,
              options.thumbnailSize || DIMENSIONS.THUMBNAIL_SIZE
            ).then((thumbnailUrl) => {
              preview.thumbnailUrl = thumbnailUrl;
            });
          }

          resolve(preview);
        } catch (error) {
          reject(new Error(`Failed to create image preview: ${error}`));
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  private async createVideoPreview(
    file: File,
    options: PreviewOptions
  ): Promise<FilePreview> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.onloadedmetadata = () => {
        try {
          // Seek to 25% of video for thumbnail
          video.currentTime = video.duration * VIDEO.THUMBNAIL_SEEK_PERCENTAGE;
        } catch (error) {
          video.currentTime = VIDEO.FALLBACK_SEEK_TIME;
        }
      };

      video.onseeked = () => {
        try {
          const { width, height } = this.calculateDimensions(
            video.videoWidth,
            video.videoHeight,
            options.maxWidth!,
            options.maxHeight!
          );

          canvas.width = width;
          canvas.height = height;

          // Enable high-quality rendering
          ctx!.imageSmoothingEnabled = true;
          ctx!.imageSmoothingQuality = "high";

          // Draw video frame
          ctx!.drawImage(video, 0, 0, width, height);

          const thumbnailUrl = canvas.toDataURL(
            `image/${FORMATS.VIDEO_THUMBNAIL_FORMAT}`,
            QUALITY.VIDEO_THUMBNAIL_QUALITY
          );

          const preview: FilePreview = {
            id: this.generatePreviewId(file),
            url: URL.createObjectURL(file),
            thumbnailUrl,
            type: "video",
            dimensions: { width, height },
            duration: video.duration,
            size: file.size,
            mimeType: file.type,
            metadata: {
              originalWidth: video.videoWidth,
              originalHeight: video.videoHeight,
              aspectRatio: video.videoWidth / video.videoHeight,
              frameRate:
                video.videoWidth > 0 ? VIDEO.ESTIMATED_FRAME_RATE : undefined,
              codec: this.detectVideoCodec(file.type),
            },
          };

          resolve(preview);
        } catch (error) {
          reject(new Error(`Failed to create video preview: ${error}`));
        }
      };

      video.onerror = () => reject(new Error("Failed to load video"));
      video.src = URL.createObjectURL(file);
      video.load();
    });
  }

  private createGenericPreview(file: File): FilePreview {
    return {
      id: this.generatePreviewId(file),
      url: URL.createObjectURL(file),
      type: "other",
      size: file.size,
      mimeType: file.type,
      metadata: {
        extension: file.name.split(".").pop()?.toLowerCase(),
        lastModified: file.lastModified,
      },
    };
  }

  private async generateThumbnail(
    canvas: HTMLCanvasElement,
    size: number
  ): Promise<string> {
    const thumbnailCanvas = document.createElement("canvas");
    const ctx = thumbnailCanvas.getContext("2d")!;

    thumbnailCanvas.width = size;
    thumbnailCanvas.height = size;

    // Enable high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Calculate thumbnail dimensions maintaining aspect ratio
    const { width, height } = this.calculateThumbnailDimensions(
      canvas.width,
      canvas.height,
      size
    );

    // Center the thumbnail
    const x = (size - width) / 2;
    const y = (size - height) / 2;

    ctx.drawImage(canvas, x, y, width, height);

    return thumbnailCanvas.toDataURL(
      `image/${FORMATS.VIDEO_THUMBNAIL_FORMAT}`,
      QUALITY.THUMBNAIL_QUALITY
    );
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ) {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private calculateThumbnailDimensions(
    originalWidth: number,
    originalHeight: number,
    size: number
  ) {
    const aspectRatio = originalWidth / originalHeight;

    if (aspectRatio > 1) {
      return { width: size, height: size / aspectRatio };
    } else {
      return { width: size * aspectRatio, height: size };
    }
  }

  private generatePreviewId(file: File): string {
    return `preview-${file.name}-${file.size}-${file.lastModified}`;
  }

  private detectVideoCodec(mimeType: string): string {
    return (
      VIDEO.CODEC_DETECTION_MAP[
        mimeType as keyof typeof VIDEO.CODEC_DETECTION_MAP
      ] || "Unknown"
    );
  }

  clearCache(): void {
    this.previewCache.clear();
  }

  getCachedPreview(file: File): FilePreview | undefined {
    const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
    return this.previewCache.get(cacheKey);
  }
}
