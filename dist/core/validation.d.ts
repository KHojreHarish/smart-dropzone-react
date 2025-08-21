/**
 * Comprehensive validation utilities for Smart Dropzone
 *
 * This module provides robust input validation for all user inputs,
 * file operations, and configuration parameters throughout the package.
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class InputValidator {
    /**
     * Validate file objects
     */
    static validateFile(file: unknown): ValidationResult;
    /**
     * Validate file arrays
     */
    static validateFileList(files: unknown): ValidationResult;
    /**
     * Validate upload options
     */
    static validateUploadOptions(options: unknown): ValidationResult;
    /**
     * Validate preview options
     */
    static validatePreviewOptions(options: unknown): ValidationResult;
    /**
     * Validate drag and drop options
     */
    static validateDragOptions(options: unknown): ValidationResult;
    /**
     * Validate provider configuration
     */
    static validateProviderConfig(config: unknown): ValidationResult;
    /**
     * Validate array indices and ranges
     */
    static validateArrayOperation(fromIndex: number, toIndex: number, arrayLength: number): ValidationResult;
    /**
     * Validate and sanitize user input strings
     */
    static sanitizeString(input: unknown, maxLength?: number): string;
    /**
     * Validate HTML element references
     */
    static validateElement(element: unknown): ValidationResult;
    /**
     * Comprehensive validation for all inputs
     */
    static validateAllInputs(inputs: {
        files?: unknown;
        options?: unknown;
        previewOptions?: unknown;
        dragOptions?: unknown;
        providerConfig?: unknown;
    }): ValidationResult;
}
/**
 * Validation decorators for method parameters
 */
export declare function validateInput(validationFn: (input: any) => ValidationResult): (_target: any, _propertyName: string, descriptor: PropertyDescriptor) => void;
export default InputValidator;
//# sourceMappingURL=validation.d.ts.map