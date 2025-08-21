/**
 * Smart Dropzone Configuration Constants
 *
 * This file centralizes all configuration values to eliminate magic numbers
 * and provide a single source of truth for all configurable settings.
 */
export declare const FILE_SIZE: {
    readonly DEFAULT_MAX_SIZE: number;
    readonly CHUNK_SIZE: number;
    readonly BYTES_PER_KB: 1024;
    readonly BYTES_PER_MB: number;
    readonly BYTES_PER_GB: number;
    readonly BYTES_PER_TB: number;
};
export declare const TIMING: {
    readonly ANIMATION_DURATION: 300;
    readonly DRAG_TRANSITION_DURATION: 200;
    readonly DEBOUNCE_DELAY: 300;
    readonly RETRY_DELAY: 1000;
    readonly RETRY_EXPONENTIAL_BASE: 2;
    readonly PROGRESS_UPDATE_INTERVAL: 100;
    readonly PERFORMANCE_TIMEOUT: 3000;
    readonly TEST_TIMEOUT: 10000;
    readonly STRESS_TEST_TIMEOUT: 30000;
};
export declare const QUALITY: {
    readonly DEFAULT_IMAGE_QUALITY: 0.8;
    readonly HIGH_IMAGE_QUALITY: 0.9;
    readonly THUMBNAIL_QUALITY: 0.8;
    readonly VIDEO_THUMBNAIL_QUALITY: 0.9;
    readonly GZIP_COMPRESSION_RATIO: 0.3;
    readonly MINIFICATION_RATIO: 0.7;
};
export declare const DIMENSIONS: {
    readonly DEFAULT_MAX_WIDTH: 800;
    readonly DEFAULT_MAX_HEIGHT: 600;
    readonly THUMBNAIL_SIZE: 200;
    readonly CUSTOM_THUMBNAIL_SIZE: 150;
    readonly ACCESSIBILITY_HIDDEN_POSITION: -10000;
    readonly DRAG_PREVIEW_Z_INDEX: 9999;
    readonly PREVIEW_OPACITY: 0.8;
};
export declare const UPLOAD: {
    readonly MAX_RETRY_ATTEMPTS: 3;
    readonly MAX_CONCURRENT_CHUNKS: 3;
    readonly DEFAULT_MAX_FILES: 10;
    readonly UPLOAD_SIMULATION_DELAY_MIN: 500;
    readonly UPLOAD_SIMULATION_DELAY_RANGE: 1000;
    readonly CLOUDINARY_POLLING_INTERVAL: 200;
};
export declare const PERFORMANCE: {
    readonly ESTIMATED_BUNDLE_SIZE: number;
    readonly FILES_PER_SECOND_CALCULATION_DIVISOR: 1000;
    readonly MEMORY_WARNING_THRESHOLD: 0.8;
    readonly CPU_USAGE_POLLING_INTERVAL: 1000;
    readonly PERFORMANCE_SCORE_MAX: 100;
    readonly RENDER_TIME_WEIGHT: 10;
    readonly UPLOAD_SPEED_WEIGHT: 1000000;
    readonly MEMORY_USAGE_WEIGHT: 1000000;
};
export declare const LAYOUT: {
    readonly DRAG_THRESHOLD: 5;
    readonly GRID_SIZE: 10;
    readonly BORDER_RADIUS: 8;
    readonly PADDING_SMALL: 4;
    readonly PADDING_MEDIUM: 6;
    readonly PADDING_LARGE: 8;
};
export declare const FORMATS: {
    readonly DEFAULT_FORMAT: "webp";
    readonly FALLBACK_FORMAT: "png";
    readonly VIDEO_THUMBNAIL_FORMAT: "webp";
    readonly SUPPORTED_IMAGE_FORMATS: readonly ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"];
    readonly SUPPORTED_VIDEO_FORMATS: readonly ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
};
export declare const COLORS: {
    readonly PRIMARY_BLUE: "#3b82f6";
    readonly PRIMARY_BLUE_HOVER: "#2563eb";
    readonly BACKGROUND_LIGHT: "#ffffff";
    readonly BACKGROUND_DARK: "#1f2937";
    readonly BACKGROUND_GRAY: "#f9fafb";
    readonly BORDER_LIGHT: "#d1d5db";
    readonly BORDER_FOCUS: "#3b82f6";
    readonly TEXT_LIGHT: "#374151";
    readonly TEXT_DARK: "#ffffff";
    readonly ERROR_RED: "#ef4444";
    readonly SUCCESS_GREEN: "#10b981";
    readonly WARNING_YELLOW: "#f59e0b";
};
export declare const TESTING: {
    readonly LARGE_ARRAY_SIZE: 1000;
    readonly STRESS_TEST_OPERATIONS: 100;
    readonly CONCURRENT_OPERATIONS: 50;
    readonly PERFORMANCE_BENCHMARK_THRESHOLD: 2000;
    readonly FILENAME_MAX_LENGTH: 300;
};
export declare const VIDEO: {
    readonly THUMBNAIL_SEEK_PERCENTAGE: 0.25;
    readonly FALLBACK_SEEK_TIME: 1;
    readonly ESTIMATED_FRAME_RATE: 30;
    readonly CODEC_DETECTION_MAP: {
        readonly "video/mp4": "H.264/AVC";
        readonly "video/webm": "VP8/VP9";
        readonly "video/ogg": "Theora";
        readonly "video/quicktime": "H.264/HEVC";
        readonly "video/x-msvideo": "MPEG-4";
    };
};
/**
 * Configuration validation utilities
 */
export declare class ConfigValidator {
    static validateFileSize(size: number): boolean;
    static validateQuality(quality: number): boolean;
    static validateDimensions(width: number, height: number): boolean;
    static validateRetryAttempts(attempts: number): boolean;
    static validateTimeout(timeout: number): boolean;
}
/**
 * Type definitions for configuration objects
 */
export type FileFormatType = (typeof FORMATS.SUPPORTED_IMAGE_FORMATS)[number] | (typeof FORMATS.SUPPORTED_VIDEO_FORMATS)[number];
export type ImageFormat = "webp" | "jpeg" | "png";
export type ColorTheme = "light" | "dark" | "custom";
export type ComponentSize = "sm" | "md" | "lg";
export type ComponentVariant = "outlined" | "filled" | "minimal";
/**
 * Default configuration object combining all settings
 */
export declare const DEFAULT_CONFIG: {
    readonly fileSize: {
        readonly DEFAULT_MAX_SIZE: number;
        readonly CHUNK_SIZE: number;
        readonly BYTES_PER_KB: 1024;
        readonly BYTES_PER_MB: number;
        readonly BYTES_PER_GB: number;
        readonly BYTES_PER_TB: number;
    };
    readonly timing: {
        readonly ANIMATION_DURATION: 300;
        readonly DRAG_TRANSITION_DURATION: 200;
        readonly DEBOUNCE_DELAY: 300;
        readonly RETRY_DELAY: 1000;
        readonly RETRY_EXPONENTIAL_BASE: 2;
        readonly PROGRESS_UPDATE_INTERVAL: 100;
        readonly PERFORMANCE_TIMEOUT: 3000;
        readonly TEST_TIMEOUT: 10000;
        readonly STRESS_TEST_TIMEOUT: 30000;
    };
    readonly quality: {
        readonly DEFAULT_IMAGE_QUALITY: 0.8;
        readonly HIGH_IMAGE_QUALITY: 0.9;
        readonly THUMBNAIL_QUALITY: 0.8;
        readonly VIDEO_THUMBNAIL_QUALITY: 0.9;
        readonly GZIP_COMPRESSION_RATIO: 0.3;
        readonly MINIFICATION_RATIO: 0.7;
    };
    readonly dimensions: {
        readonly DEFAULT_MAX_WIDTH: 800;
        readonly DEFAULT_MAX_HEIGHT: 600;
        readonly THUMBNAIL_SIZE: 200;
        readonly CUSTOM_THUMBNAIL_SIZE: 150;
        readonly ACCESSIBILITY_HIDDEN_POSITION: -10000;
        readonly DRAG_PREVIEW_Z_INDEX: 9999;
        readonly PREVIEW_OPACITY: 0.8;
    };
    readonly upload: {
        readonly MAX_RETRY_ATTEMPTS: 3;
        readonly MAX_CONCURRENT_CHUNKS: 3;
        readonly DEFAULT_MAX_FILES: 10;
        readonly UPLOAD_SIMULATION_DELAY_MIN: 500;
        readonly UPLOAD_SIMULATION_DELAY_RANGE: 1000;
        readonly CLOUDINARY_POLLING_INTERVAL: 200;
    };
    readonly performance: {
        readonly ESTIMATED_BUNDLE_SIZE: number;
        readonly FILES_PER_SECOND_CALCULATION_DIVISOR: 1000;
        readonly MEMORY_WARNING_THRESHOLD: 0.8;
        readonly CPU_USAGE_POLLING_INTERVAL: 1000;
        readonly PERFORMANCE_SCORE_MAX: 100;
        readonly RENDER_TIME_WEIGHT: 10;
        readonly UPLOAD_SPEED_WEIGHT: 1000000;
        readonly MEMORY_USAGE_WEIGHT: 1000000;
    };
    readonly layout: {
        readonly DRAG_THRESHOLD: 5;
        readonly GRID_SIZE: 10;
        readonly BORDER_RADIUS: 8;
        readonly PADDING_SMALL: 4;
        readonly PADDING_MEDIUM: 6;
        readonly PADDING_LARGE: 8;
    };
    readonly formats: {
        readonly DEFAULT_FORMAT: "webp";
        readonly FALLBACK_FORMAT: "png";
        readonly VIDEO_THUMBNAIL_FORMAT: "webp";
        readonly SUPPORTED_IMAGE_FORMATS: readonly ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"];
        readonly SUPPORTED_VIDEO_FORMATS: readonly ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
    };
    readonly colors: {
        readonly PRIMARY_BLUE: "#3b82f6";
        readonly PRIMARY_BLUE_HOVER: "#2563eb";
        readonly BACKGROUND_LIGHT: "#ffffff";
        readonly BACKGROUND_DARK: "#1f2937";
        readonly BACKGROUND_GRAY: "#f9fafb";
        readonly BORDER_LIGHT: "#d1d5db";
        readonly BORDER_FOCUS: "#3b82f6";
        readonly TEXT_LIGHT: "#374151";
        readonly TEXT_DARK: "#ffffff";
        readonly ERROR_RED: "#ef4444";
        readonly SUCCESS_GREEN: "#10b981";
        readonly WARNING_YELLOW: "#f59e0b";
    };
    readonly testing: {
        readonly LARGE_ARRAY_SIZE: 1000;
        readonly STRESS_TEST_OPERATIONS: 100;
        readonly CONCURRENT_OPERATIONS: 50;
        readonly PERFORMANCE_BENCHMARK_THRESHOLD: 2000;
        readonly FILENAME_MAX_LENGTH: 300;
    };
    readonly video: {
        readonly THUMBNAIL_SEEK_PERCENTAGE: 0.25;
        readonly FALLBACK_SEEK_TIME: 1;
        readonly ESTIMATED_FRAME_RATE: 30;
        readonly CODEC_DETECTION_MAP: {
            readonly "video/mp4": "H.264/AVC";
            readonly "video/webm": "VP8/VP9";
            readonly "video/ogg": "Theora";
            readonly "video/quicktime": "H.264/HEVC";
            readonly "video/x-msvideo": "MPEG-4";
        };
    };
};
export default DEFAULT_CONFIG;
//# sourceMappingURL=config.d.ts.map