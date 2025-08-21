import React from "react";
import { SmartDropzone } from "./smart-dropzone";
import { CloudinaryProvider } from "../providers/cloudinary";
import { getSmartDefaults, mergePreset, type PresetName } from "../core/smart-defaults";
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
export const SmartDropzoneSimple: React.FC<SmartDropzoneSimpleProps> = ({
  preset,
  cloudinary,
  overrides = {},
  ...props
}) => {
  // Create Cloudinary provider
  const provider = new CloudinaryProvider({
    cloudName: cloudinary.cloudName,
    uploadPreset: cloudinary.uploadPreset,
    defaultFolder: cloudinary.defaultFolder,
  });

  // Get configuration based on preset or smart defaults
  let config: Partial<SmartDropzoneProps>;
  
  if (preset) {
    // Use preset with overrides
    config = mergePreset(preset, overrides);
  } else {
    // Use smart defaults with overrides
    config = getSmartDefaults(overrides);
  }

  // Merge with explicit props (highest priority)
  const finalConfig = { ...config, ...props };

  return (
    <SmartDropzone
      {...finalConfig}
      provider={provider}
    />
  );
};

/**
 * Preset-based components for common use cases
 */

export const SimpleUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & { cloudinary: SmartDropzoneSimpleProps['cloudinary'] }> = (props) => (
  <SmartDropzoneSimple preset="simple" {...props} />
);

export const GalleryUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & { cloudinary: SmartDropzoneSimpleProps['cloudinary'] }> = (props) => (
  <SmartDropzoneSimple preset="gallery" {...props} />
);

export const DocumentUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & { cloudinary: SmartDropzoneSimpleProps['cloudinary'] }> = (props) => (
  <SmartDropzoneSimple preset="documents" {...props} />
);

export const MediaUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & { cloudinary: SmartDropzoneSimpleProps['cloudinary'] }> = (props) => (
  <SmartDropzoneSimple preset="media" {...props} />
);

export const EnterpriseUpload: React.FC<Omit<SmartDropzoneSimpleProps, 'preset'> & { cloudinary: SmartDropzoneSimpleProps['cloudinary'] }> = (props) => (
  <SmartDropzoneSimple preset="enterprise" {...props} />
);
