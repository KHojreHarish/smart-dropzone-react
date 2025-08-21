/**
 * Comprehensive validation utilities for Smart Dropzone
 *
 * This module provides robust input validation for all user inputs,
 * file operations, and configuration parameters throughout the package.
 */
import { ConfigValidator, UPLOAD, FILE_SIZE } from "./config";
import { UploadError } from "./error-handler";
export class InputValidator {
    /**
     * Validate file objects
     */
    static validateFile(file) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!file) {
            result.isValid = false;
            result.errors.push("File is required");
            return result;
        }
        if (!(file instanceof File)) {
            result.isValid = false;
            result.errors.push("Invalid file object");
            return result;
        }
        // Check file name
        if (!file.name || file.name.trim().length === 0) {
            result.isValid = false;
            result.errors.push("File name is required");
        }
        // Check file name length
        if (file.name.length > 255) {
            result.isValid = false;
            result.errors.push("File name is too long (maximum 255 characters)");
        }
        // Check for potentially dangerous file names
        const dangerousPatterns = [
            /^\.+$/, // Only dots
            /[<>:"|?*]/, // Windows forbidden characters
            /\0/, // Null character
            /^\s+$/, // Only whitespace
        ];
        if (dangerousPatterns.some((pattern) => pattern.test(file.name))) {
            result.isValid = false;
            result.errors.push("File name contains invalid characters");
        }
        // Check file size (allow zero-byte files but warn)
        if (file.size < 0 || file.size > FILE_SIZE.BYTES_PER_TB) {
            result.isValid = false;
            result.errors.push("File size is invalid");
        }
        if (file.size === 0) {
            result.warnings.push("File appears to be empty");
        }
        return result;
    }
    /**
     * Validate file arrays
     */
    static validateFileList(files) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!Array.isArray(files)) {
            result.isValid = false;
            result.errors.push("Files must be an array");
            return result;
        }
        if (files.length === 0) {
            result.warnings.push("No files provided");
            return result;
        }
        if (files.length > UPLOAD.DEFAULT_MAX_FILES) {
            result.isValid = false;
            result.errors.push(`Too many files (maximum ${UPLOAD.DEFAULT_MAX_FILES})`);
        }
        // Validate each file
        files.forEach((file, index) => {
            const fileValidation = this.validateFile(file);
            if (!fileValidation.isValid) {
                result.isValid = false;
                fileValidation.errors.forEach((error) => {
                    result.errors.push(`File ${index + 1}: ${error}`);
                });
            }
            fileValidation.warnings.forEach((warning) => {
                result.warnings.push(`File ${index + 1}: ${warning}`);
            });
        });
        return result;
    }
    /**
     * Validate upload options
     */
    static validateUploadOptions(options) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!options || typeof options !== "object") {
            result.warnings.push("No upload options provided, using defaults");
            return result;
        }
        const opts = options;
        // Validate maxFileSize
        if (opts.maxFileSize !== undefined) {
            if (typeof opts.maxFileSize !== "number" || opts.maxFileSize <= 0) {
                result.isValid = false;
                result.errors.push("maxFileSize must be a positive number");
            }
            else if (!ConfigValidator.validateFileSize(opts.maxFileSize)) {
                result.isValid = false;
                result.errors.push("maxFileSize exceeds maximum allowed size");
            }
        }
        // Validate maxFiles
        if (opts.maxFiles !== undefined) {
            if (typeof opts.maxFiles !== "number" ||
                opts.maxFiles <= 0 ||
                opts.maxFiles > 100) {
                result.isValid = false;
                result.errors.push("maxFiles must be a number between 1 and 100");
            }
        }
        // Validate allowedTypes
        if (opts.allowedTypes !== undefined) {
            if (!Array.isArray(opts.allowedTypes)) {
                result.isValid = false;
                result.errors.push("allowedTypes must be an array");
            }
            else if (opts.allowedTypes.length === 0) {
                result.warnings.push("allowedTypes is empty - all file types will be rejected");
            }
            else {
                opts.allowedTypes.forEach((type, index) => {
                    if (typeof type !== "string") {
                        result.isValid = false;
                        result.errors.push(`allowedTypes[${index}] must be a string`);
                    }
                });
            }
        }
        return result;
    }
    /**
     * Validate preview options
     */
    static validatePreviewOptions(options) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!options || typeof options !== "object") {
            return result; // Optional parameter
        }
        const opts = options;
        // Validate dimensions
        if (opts.maxWidth !== undefined) {
            if (typeof opts.maxWidth !== "number" || opts.maxWidth <= 0) {
                result.isValid = false;
                result.errors.push("maxWidth must be a positive number");
            }
            else if (!ConfigValidator.validateDimensions(opts.maxWidth, 100)) {
                result.isValid = false;
                result.errors.push("maxWidth exceeds maximum allowed dimensions");
            }
        }
        if (opts.maxHeight !== undefined) {
            if (typeof opts.maxHeight !== "number" || opts.maxHeight <= 0) {
                result.isValid = false;
                result.errors.push("maxHeight must be a positive number");
            }
            else if (!ConfigValidator.validateDimensions(100, opts.maxHeight)) {
                result.isValid = false;
                result.errors.push("maxHeight exceeds maximum allowed dimensions");
            }
        }
        // Validate quality
        if (opts.quality !== undefined) {
            if (!ConfigValidator.validateQuality(opts.quality)) {
                result.isValid = false;
                result.errors.push("quality must be a number between 0 and 1");
            }
        }
        // Validate format
        if (opts.format !== undefined) {
            const allowedFormats = ["webp", "jpeg", "png"];
            if (!allowedFormats.includes(opts.format)) {
                result.isValid = false;
                result.errors.push(`format must be one of: ${allowedFormats.join(", ")}`);
            }
        }
        return result;
    }
    /**
     * Validate drag and drop options
     */
    static validateDragOptions(options) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!options || typeof options !== "object") {
            return result; // Optional parameter
        }
        const opts = options;
        // Validate animationDuration
        if (opts.animationDuration !== undefined) {
            if (typeof opts.animationDuration !== "number" ||
                opts.animationDuration < 0) {
                result.isValid = false;
                result.errors.push("animationDuration must be a non-negative number");
            }
            else if (opts.animationDuration > 5000) {
                result.warnings.push("animationDuration is quite long - may affect user experience");
            }
        }
        // Validate dragThreshold
        if (opts.dragThreshold !== undefined) {
            if (typeof opts.dragThreshold !== "number" || opts.dragThreshold < 0) {
                result.isValid = false;
                result.errors.push("dragThreshold must be a non-negative number");
            }
        }
        // Validate gridSize
        if (opts.gridSize !== undefined) {
            if (typeof opts.gridSize !== "number" || opts.gridSize <= 0) {
                result.isValid = false;
                result.errors.push("gridSize must be a positive number");
            }
        }
        return result;
    }
    /**
     * Validate provider configuration
     */
    static validateProviderConfig(config) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!config || typeof config !== "object") {
            result.isValid = false;
            result.errors.push("Provider configuration is required");
            return result;
        }
        const cfg = config;
        // Check for required fields (these will vary by provider)
        if (!cfg.apiKey && !cfg.accessToken && !cfg.credentials) {
            result.warnings.push("No authentication credentials found in configuration");
        }
        // Validate string fields
        const stringFields = ["apiKey", "cloudName", "uploadPreset", "folder"];
        stringFields.forEach((field) => {
            if (cfg[field] !== undefined && typeof cfg[field] !== "string") {
                result.isValid = false;
                result.errors.push(`${field} must be a string`);
            }
        });
        return result;
    }
    /**
     * Validate array indices and ranges
     */
    static validateArrayOperation(fromIndex, toIndex, arrayLength) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
            result.isValid = false;
            result.errors.push("Indices must be integers");
            return result;
        }
        if (fromIndex < 0 || toIndex < 0) {
            result.isValid = false;
            result.errors.push("Indices cannot be negative");
        }
        if (fromIndex >= arrayLength || toIndex >= arrayLength) {
            result.isValid = false;
            result.errors.push("Indices exceed array bounds");
        }
        if (fromIndex === toIndex) {
            result.warnings.push("Source and target indices are the same - no operation needed");
        }
        return result;
    }
    /**
     * Validate and sanitize user input strings
     */
    static sanitizeString(input, maxLength = 1000) {
        if (typeof input !== "string") {
            throw UploadError.validationError("Input must be a string");
        }
        // Remove potentially dangerous characters
        let sanitized = input
            .replace(/[<>]/g, "") // Remove angle brackets
            .replace(/javascript:/gi, "") // Remove javascript: protocol
            .replace(/data:/gi, "") // Remove data: protocol
            .trim();
        // Truncate if too long
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        return sanitized;
    }
    /**
     * Validate HTML element references
     */
    static validateElement(element) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        if (!element) {
            result.isValid = false;
            result.errors.push("Element is required");
            return result;
        }
        if (!(element instanceof HTMLElement)) {
            result.isValid = false;
            result.errors.push("Must be a valid HTML element");
            return result;
        }
        if (!element.isConnected) {
            result.warnings.push("Element is not connected to the DOM");
        }
        return result;
    }
    /**
     * Comprehensive validation for all inputs
     */
    static validateAllInputs(inputs) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
        };
        // Validate each input type
        if (inputs.files !== undefined) {
            const fileValidation = this.validateFileList(inputs.files);
            if (!fileValidation.isValid) {
                result.isValid = false;
                result.errors.push(...fileValidation.errors);
            }
            result.warnings.push(...fileValidation.warnings);
        }
        if (inputs.options !== undefined) {
            const optionsValidation = this.validateUploadOptions(inputs.options);
            if (!optionsValidation.isValid) {
                result.isValid = false;
                result.errors.push(...optionsValidation.errors);
            }
            result.warnings.push(...optionsValidation.warnings);
        }
        if (inputs.previewOptions !== undefined) {
            const previewValidation = this.validatePreviewOptions(inputs.previewOptions);
            if (!previewValidation.isValid) {
                result.isValid = false;
                result.errors.push(...previewValidation.errors);
            }
            result.warnings.push(...previewValidation.warnings);
        }
        if (inputs.dragOptions !== undefined) {
            const dragValidation = this.validateDragOptions(inputs.dragOptions);
            if (!dragValidation.isValid) {
                result.isValid = false;
                result.errors.push(...dragValidation.errors);
            }
            result.warnings.push(...dragValidation.warnings);
        }
        if (inputs.providerConfig !== undefined) {
            const configValidation = this.validateProviderConfig(inputs.providerConfig);
            if (!configValidation.isValid) {
                result.isValid = false;
                result.errors.push(...configValidation.errors);
            }
            result.warnings.push(...configValidation.warnings);
        }
        return result;
    }
}
/**
 * Validation decorators for method parameters
 */
export function validateInput(validationFn) {
    return function (_target, _propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = function (...args) {
            // Validate first argument (most common case)
            if (args.length > 0) {
                const validation = validationFn(args[0]);
                if (!validation.isValid) {
                    throw UploadError.validationError(validation.errors.join("; "));
                }
                // Log warnings if any
                if (validation.warnings.length > 0) {
                    console.warn("Validation warnings:", validation.warnings);
                }
            }
            return method.apply(this, args);
        };
    };
}
export default InputValidator;
//# sourceMappingURL=validation.js.map