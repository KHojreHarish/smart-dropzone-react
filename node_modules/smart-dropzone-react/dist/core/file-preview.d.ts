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
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    size: number;
    mimeType: string;
    metadata?: Record<string, any>;
}
export declare class FilePreviewManager {
    private static instance;
    private previewCache;
    private supportedImageTypes;
    private supportedVideoTypes;
    static getInstance(): FilePreviewManager;
    generatePreview(file: File, options?: PreviewOptions): Promise<FilePreview>;
    private createPreview;
    private createImagePreview;
    private createVideoPreview;
    private createGenericPreview;
    private generateThumbnail;
    private calculateDimensions;
    private calculateThumbnailDimensions;
    private generatePreviewId;
    private detectVideoCodec;
    clearCache(): void;
    getCachedPreview(file: File): FilePreview | undefined;
}
//# sourceMappingURL=file-preview.d.ts.map