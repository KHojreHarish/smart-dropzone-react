import { jsx as _jsx } from "react/jsx-runtime";
import { SmartDropzone } from "./smart-dropzone";
import { CloudinaryProvider } from "../providers/cloudinary";
import { getSmartDefaults, mergePreset } from "../core/smart-defaults";
/**
 * SmartDropzone with intelligent defaults and presets
 *
 * Features:
 * - Smart defaults based on research
 * - Preset configurations for common use cases
 * - Easy overrides for customization
 * - Only Cloudinary provider (simplified)
 */
export const SmartDropzoneSimple = ({ preset, cloudinary, overrides = {}, ...props }) => {
    // Create Cloudinary provider
    const provider = new CloudinaryProvider({
        cloudName: cloudinary.cloudName,
        uploadPreset: cloudinary.uploadPreset,
        defaultFolder: cloudinary.defaultFolder,
    });
    // Get configuration based on preset or smart defaults
    let config;
    if (preset) {
        // Use preset with overrides
        config = mergePreset(preset, overrides);
    }
    else {
        // Use smart defaults with overrides
        config = getSmartDefaults(overrides);
    }
    // Merge with explicit props (highest priority)
    const finalConfig = { ...config, ...props };
    return (_jsx(SmartDropzone, { ...finalConfig, provider: provider }));
};
/**
 * Preset-based components for common use cases
 */
export const SimpleUpload = (props) => (_jsx(SmartDropzoneSimple, { preset: "simple", ...props }));
export const GalleryUpload = (props) => (_jsx(SmartDropzoneSimple, { preset: "gallery", ...props }));
export const DocumentUpload = (props) => (_jsx(SmartDropzoneSimple, { preset: "documents", ...props }));
export const MediaUpload = (props) => (_jsx(SmartDropzoneSimple, { preset: "media", ...props }));
export const EnterpriseUpload = (props) => (_jsx(SmartDropzoneSimple, { preset: "enterprise", ...props }));
//# sourceMappingURL=smart-dropzone-simple.js.map