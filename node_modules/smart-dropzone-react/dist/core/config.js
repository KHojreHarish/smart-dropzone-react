/**
 * Smart Dropzone Configuration Constants
 *
 * This file centralizes all configuration values to eliminate magic numbers
 * and provide a single source of truth for all configurable settings.
 */
// File size constants (in bytes)
export const FILE_SIZE = {
    DEFAULT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks for upload resume
    BYTES_PER_KB: 1024,
    BYTES_PER_MB: 1024 * 1024,
    BYTES_PER_GB: 1024 * 1024 * 1024,
    BYTES_PER_TB: 1024 * 1024 * 1024 * 1024,
};
// Animation and timing constants (in milliseconds)
export const TIMING = {
    ANIMATION_DURATION: 300,
    DRAG_TRANSITION_DURATION: 200,
    DEBOUNCE_DELAY: 300,
    RETRY_DELAY: 1000,
    RETRY_EXPONENTIAL_BASE: 2,
    PROGRESS_UPDATE_INTERVAL: 100,
    PERFORMANCE_TIMEOUT: 3000,
    TEST_TIMEOUT: 10000,
    STRESS_TEST_TIMEOUT: 30000,
};
// Quality and compression settings
export const QUALITY = {
    DEFAULT_IMAGE_QUALITY: 0.8,
    HIGH_IMAGE_QUALITY: 0.9,
    THUMBNAIL_QUALITY: 0.8,
    VIDEO_THUMBNAIL_QUALITY: 0.9,
    GZIP_COMPRESSION_RATIO: 0.3,
    MINIFICATION_RATIO: 0.7,
};
// Default dimensions and sizes
export const DIMENSIONS = {
    DEFAULT_MAX_WIDTH: 800,
    DEFAULT_MAX_HEIGHT: 600,
    THUMBNAIL_SIZE: 200,
    CUSTOM_THUMBNAIL_SIZE: 150,
    ACCESSIBILITY_HIDDEN_POSITION: -10000, // px
    DRAG_PREVIEW_Z_INDEX: 9999,
    PREVIEW_OPACITY: 0.8,
};
// Upload and retry settings
export const UPLOAD = {
    MAX_RETRY_ATTEMPTS: 3,
    MAX_CONCURRENT_CHUNKS: 3,
    DEFAULT_MAX_FILES: 10,
    UPLOAD_SIMULATION_DELAY_MIN: 500,
    UPLOAD_SIMULATION_DELAY_RANGE: 1000,
    CLOUDINARY_POLLING_INTERVAL: 200,
};
// Performance and bundle settings
export const PERFORMANCE = {
    ESTIMATED_BUNDLE_SIZE: 40 * 1024, // 40KB
    FILES_PER_SECOND_CALCULATION_DIVISOR: 1000,
    MEMORY_WARNING_THRESHOLD: 0.8,
    CPU_USAGE_POLLING_INTERVAL: 1000,
    PERFORMANCE_SCORE_MAX: 100,
    RENDER_TIME_WEIGHT: 10,
    UPLOAD_SPEED_WEIGHT: 1000000,
    MEMORY_USAGE_WEIGHT: 1000000,
};
// Grid and layout settings
export const LAYOUT = {
    DRAG_THRESHOLD: 5,
    GRID_SIZE: 10,
    BORDER_RADIUS: 8, // px
    PADDING_SMALL: 4, // px
    PADDING_MEDIUM: 6, // px
    PADDING_LARGE: 8, // px
};
// Image format settings
export const FORMATS = {
    DEFAULT_FORMAT: "webp",
    FALLBACK_FORMAT: "png",
    VIDEO_THUMBNAIL_FORMAT: "webp",
    SUPPORTED_IMAGE_FORMATS: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/bmp",
    ],
    SUPPORTED_VIDEO_FORMATS: [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
    ],
};
// Color scheme constants
export const COLORS = {
    PRIMARY_BLUE: "#3b82f6",
    PRIMARY_BLUE_HOVER: "#2563eb",
    BACKGROUND_LIGHT: "#ffffff",
    BACKGROUND_DARK: "#1f2937",
    BACKGROUND_GRAY: "#f9fafb",
    BORDER_LIGHT: "#d1d5db",
    BORDER_FOCUS: "#3b82f6",
    TEXT_LIGHT: "#374151",
    TEXT_DARK: "#ffffff",
    ERROR_RED: "#ef4444",
    SUCCESS_GREEN: "#10b981",
    WARNING_YELLOW: "#f59e0b",
};
// Test and development constants
export const TESTING = {
    LARGE_ARRAY_SIZE: 1000,
    STRESS_TEST_OPERATIONS: 100,
    CONCURRENT_OPERATIONS: 50,
    PERFORMANCE_BENCHMARK_THRESHOLD: 2000, // ms
    FILENAME_MAX_LENGTH: 300,
};
// Video processing constants
export const VIDEO = {
    THUMBNAIL_SEEK_PERCENTAGE: 0.25, // 25% into video
    FALLBACK_SEEK_TIME: 1, // 1 second
    ESTIMATED_FRAME_RATE: 30,
    CODEC_DETECTION_MAP: {
        "video/mp4": "H.264/AVC",
        "video/webm": "VP8/VP9",
        "video/ogg": "Theora",
        "video/quicktime": "H.264/HEVC",
        "video/x-msvideo": "MPEG-4",
    },
};
/**
 * Configuration validation utilities
 */
export class ConfigValidator {
    static validateFileSize(size) {
        return size > 0 && size <= FILE_SIZE.BYTES_PER_TB;
    }
    static validateQuality(quality) {
        return quality >= 0 && quality <= 1;
    }
    static validateDimensions(width, height) {
        return width > 0 && height > 0 && width <= 8192 && height <= 8192;
    }
    static validateRetryAttempts(attempts) {
        return attempts >= 0 && attempts <= 10;
    }
    static validateTimeout(timeout) {
        return timeout > 0 && timeout <= 300000; // Max 5 minutes
    }
}
/**
 * Default configuration object combining all settings
 */
export const DEFAULT_CONFIG = {
    fileSize: FILE_SIZE,
    timing: TIMING,
    quality: QUALITY,
    dimensions: DIMENSIONS,
    upload: UPLOAD,
    performance: PERFORMANCE,
    layout: LAYOUT,
    formats: FORMATS,
    colors: COLORS,
    testing: TESTING,
    video: VIDEO,
};
export default DEFAULT_CONFIG;
//# sourceMappingURL=config.js.map