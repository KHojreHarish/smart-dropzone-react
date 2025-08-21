import { DIMENSIONS, QUALITY, FORMATS, VIDEO } from "./config";
export class FilePreviewManager {
    constructor() {
        Object.defineProperty(this, "previewCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "supportedImageTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [...FORMATS.SUPPORTED_IMAGE_FORMATS]
        });
        Object.defineProperty(this, "supportedVideoTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [...FORMATS.SUPPORTED_VIDEO_FORMATS]
        });
    }
    static getInstance() {
        if (!FilePreviewManager.instance) {
            FilePreviewManager.instance = new FilePreviewManager();
        }
        return FilePreviewManager.instance;
    }
    async generatePreview(file, options = {}) {
        const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
        if (this.previewCache.has(cacheKey)) {
            return this.previewCache.get(cacheKey);
        }
        const preview = await this.createPreview(file, options);
        this.previewCache.set(cacheKey, preview);
        return preview;
    }
    async createPreview(file, options) {
        const { maxWidth = DIMENSIONS.DEFAULT_MAX_WIDTH, maxHeight = DIMENSIONS.DEFAULT_MAX_HEIGHT, quality = QUALITY.DEFAULT_IMAGE_QUALITY, format = FORMATS.DEFAULT_FORMAT, } = options;
        if (this.supportedImageTypes.includes(file.type)) {
            return this.createImagePreview(file, {
                maxWidth,
                maxHeight,
                quality,
                format,
            });
        }
        else if (this.supportedVideoTypes.includes(file.type)) {
            return this.createVideoPreview(file, {
                maxWidth,
                maxHeight,
                thumbnailSize: options.thumbnailSize || DIMENSIONS.THUMBNAIL_SIZE,
            });
        }
        else {
            return this.createGenericPreview(file);
        }
    }
    async createImagePreview(file, options) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                try {
                    const { width, height } = this.calculateDimensions(img.width, img.height, options.maxWidth, options.maxHeight);
                    canvas.width = width;
                    canvas.height = height;
                    // Enable image smoothing for better quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    // Draw image with proper scaling
                    ctx.drawImage(img, 0, 0, width, height);
                    // Convert to desired format with quality
                    const dataUrl = canvas.toDataURL(`image/${options.format}`, options.quality);
                    const preview = {
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
                        this.generateThumbnail(canvas, options.thumbnailSize || DIMENSIONS.THUMBNAIL_SIZE).then((thumbnailUrl) => {
                            preview.thumbnailUrl = thumbnailUrl;
                        });
                    }
                    resolve(preview);
                }
                catch (error) {
                    reject(new Error(`Failed to create image preview: ${error}`));
                }
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = URL.createObjectURL(file);
        });
    }
    async createVideoPreview(file, options) {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            video.onloadedmetadata = () => {
                try {
                    // Seek to 25% of video for thumbnail
                    video.currentTime = video.duration * VIDEO.THUMBNAIL_SEEK_PERCENTAGE;
                }
                catch (error) {
                    video.currentTime = VIDEO.FALLBACK_SEEK_TIME;
                }
            };
            video.onseeked = () => {
                try {
                    const { width, height } = this.calculateDimensions(video.videoWidth, video.videoHeight, options.maxWidth, options.maxHeight);
                    canvas.width = width;
                    canvas.height = height;
                    // Enable high-quality rendering
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    // Draw video frame
                    ctx.drawImage(video, 0, 0, width, height);
                    const thumbnailUrl = canvas.toDataURL(`image/${FORMATS.VIDEO_THUMBNAIL_FORMAT}`, QUALITY.VIDEO_THUMBNAIL_QUALITY);
                    const preview = {
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
                            frameRate: video.videoWidth > 0 ? VIDEO.ESTIMATED_FRAME_RATE : undefined,
                            codec: this.detectVideoCodec(file.type),
                        },
                    };
                    resolve(preview);
                }
                catch (error) {
                    reject(new Error(`Failed to create video preview: ${error}`));
                }
            };
            video.onerror = () => reject(new Error("Failed to load video"));
            video.src = URL.createObjectURL(file);
            video.load();
        });
    }
    createGenericPreview(file) {
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
    async generateThumbnail(canvas, size) {
        const thumbnailCanvas = document.createElement("canvas");
        const ctx = thumbnailCanvas.getContext("2d");
        thumbnailCanvas.width = size;
        thumbnailCanvas.height = size;
        // Enable high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        // Calculate thumbnail dimensions maintaining aspect ratio
        const { width, height } = this.calculateThumbnailDimensions(canvas.width, canvas.height, size);
        // Center the thumbnail
        const x = (size - width) / 2;
        const y = (size - height) / 2;
        ctx.drawImage(canvas, x, y, width, height);
        return thumbnailCanvas.toDataURL(`image/${FORMATS.VIDEO_THUMBNAIL_FORMAT}`, QUALITY.THUMBNAIL_QUALITY);
    }
    calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
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
    calculateThumbnailDimensions(originalWidth, originalHeight, size) {
        const aspectRatio = originalWidth / originalHeight;
        if (aspectRatio > 1) {
            return { width: size, height: size / aspectRatio };
        }
        else {
            return { width: size * aspectRatio, height: size };
        }
    }
    generatePreviewId(file) {
        return `preview-${file.name}-${file.size}-${file.lastModified}`;
    }
    detectVideoCodec(mimeType) {
        return (VIDEO.CODEC_DETECTION_MAP[mimeType] || "Unknown");
    }
    clearCache() {
        this.previewCache.clear();
    }
    getCachedPreview(file) {
        const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
        return this.previewCache.get(cacheKey);
    }
}
//# sourceMappingURL=file-preview.js.map