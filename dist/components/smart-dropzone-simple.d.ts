import React from "react";
import { type PresetName } from "../core/smart-defaults";
import type { SmartDropzoneProps } from "../types";
/**
 * Simplified SmartDropzone with smart defaults
 *
 * Usage:
 * <SmartDropzoneSimple preset="gallery" />
 * <SmartDropzoneSimple maxFiles={5} />
 * <SmartDropzoneSimple preset="documents" maxFileSize={50 * 1024 * 1024} />
 */
export interface SmartDropzoneSimpleProps extends Partial<SmartDropzoneProps> {
    /**
     * Use a preset configuration
     */
    preset?: PresetName;
    /**
     * Cloudinary configuration (required)
     */
    cloudinary: {
        cloudName: string;
        uploadPreset: string;
        defaultFolder?: string;
    };
    /**
     * Override any preset/default values
     */
    overrides?: Partial<SmartDropzoneProps>;
}
/**
 * SmartDropzone with intelligent defaults and presets
 *
 * Features:
 * - Smart defaults based on research
 * - Preset configurations for common use cases
 * - Easy overrides for customization
 * - Only Cloudinary provider (simplified)
 */
export declare const SmartDropzoneSimple: React.FC<SmartDropzoneSimpleProps>;
/**
 * Preset-based components for common use cases
 */
export declare const SimpleUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & {
    cloudinary: SmartDropzoneSimpleProps['cloudinary'];
}>;
export declare const GalleryUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & {
    cloudinary: SmartDropzoneSimpleProps['cloudinary'];
}>;
export declare const DocumentUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & {
    cloudinary: SmartDropzoneSimpleProps['cloudinary'];
}>;
export declare const MediaUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & {
    cloudinary: SmartDropzoneSimpleProps['cloudinary'];
}>;
export declare const EnterpriseUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & {
    cloudinary: SmartDropzoneSimpleProps['cloudinary'];
}>;
//# sourceMappingURL=smart-dropzone-simple.d.ts.map