import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useUpload } from "../hooks/use-upload";
import { FileProcessor } from "../core/file-processor";
import { FileItem } from "./file-item";
import { FILE_SIZE, UPLOAD } from "../core/config";
/**
 * Enhanced SmartDropzone component with provider abstraction
 */
export const SmartDropzone = ({ className = "", theme = "light", variant = "outlined", size = "md", showPreview = true, showProgress = true, showFileSize = true, showFileType = true, maxFiles = UPLOAD.DEFAULT_MAX_FILES, maxFileSize = FILE_SIZE.DEFAULT_MAX_SIZE, allowedTypes = ["image/*", "application/pdf", "text/*"], onFilesSelected, onUploadComplete, onValidationError, folder, provider, disabled = false, multiple = true, maxSize, minSize, noClick = false, noKeyboard = false, noDrag = false, noDragEventsBubbling = false, preventDropOnDocument = true, useFsAccessApi = false, autoFocus = false, tabIndex, ...options }) => {
    // Use the upload hook for state management
    const { files, isUploading, error, uploadProgress, pendingFiles, successFiles, errorFiles, hasFiles, hasPendingFiles, addFiles, removeFile, clearAll, uploadAll, retryUpload, cancelUpload, } = useUpload(provider, {
        maxFiles,
        maxFileSize,
        allowedTypes,
        folder,
        ...options,
    });
    // Handle file drop
    const onDrop = useCallback(async (acceptedFiles) => {
        try {
            const result = await addFiles(acceptedFiles);
            if (result && result.success && result.files) {
                onFilesSelected?.(result.files);
            }
            else if (result && result.errors) {
                const errorMessage = result.errors.join("; ");
                onValidationError?.(errorMessage);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to process files";
            onValidationError?.(errorMessage);
        }
    }, [addFiles, onFilesSelected, onValidationError]);
    // Handle rejected files
    const onDropRejected = useCallback((rejectedFiles) => {
        const errors = rejectedFiles.map(({ file, errors }) => `${file.name}: ${errors.map((e) => e.message).join(", ")}`);
        const errorMessage = errors.join("; ");
        onValidationError?.(errorMessage);
    }, [onValidationError]);
    // Configure dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        maxFiles,
        maxSize: maxSize || maxFileSize,
        minSize,
        multiple,
        noClick,
        noKeyboard,
        noDrag,
        noDragEventsBubbling,
        preventDropOnDocument,
        useFsAccessApi,
        autoFocus,
        accept: useMemo(() => {
            return allowedTypes.reduce((acc, type) => {
                if (type === "*") {
                    acc["*/*"] = [];
                }
                else if (type.endsWith("/*")) {
                    const category = type.split("/")[0];
                    acc[category] = [];
                }
                else if (type.startsWith(".")) {
                    acc["*/*"] = [type];
                }
                else {
                    acc[type] = [];
                }
                return acc;
            }, {});
        }, [allowedTypes]),
        disabled,
    });
    // Handle upload
    const handleUpload = useCallback(async () => {
        if (!hasPendingFiles || isUploading)
            return;
        try {
            const results = await uploadAll();
            onUploadComplete?.(files);
            return results;
        }
        catch (error) {
            // Error is already handled in the hook
            console.error("Upload failed:", error);
        }
    }, [hasPendingFiles, isUploading, uploadAll, files, onUploadComplete]);
    // Memoized theme and variant classes
    const themeClasses = useMemo(() => {
        const baseClasses = "border-2 border-dashed rounded-lg transition-all duration-200";
        if (theme === "dark") {
            return `${baseClasses} bg-gray-800 border-gray-600 text-gray-200`;
        }
        if (variant === "filled") {
            return `${baseClasses} bg-blue-50 border-blue-300 text-blue-700`;
        }
        if (variant === "minimal") {
            return `${baseClasses} border-gray-300 text-gray-600`;
        }
        return `${baseClasses} bg-white border-gray-300 text-gray-600`;
    }, [theme, variant]);
    const sizeClasses = useMemo(() => {
        switch (size) {
            case "sm":
                return "p-4";
            case "lg":
                return "p-8";
            default:
                return "p-6";
        }
    }, [size]);
    const buttonClasses = useMemo(() => {
        const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
        if (theme === "dark") {
            return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
        }
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
    }, [theme]);
    return (_jsxs("div", { className: `space-y-4 ${className}`, children: [error && (_jsx("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "text-red-600 mr-2", children: "\u26A0\uFE0F" }), _jsx("p", { className: "text-red-800 text-sm", children: error }), _jsx("button", { onClick: () => onValidationError?.(error), className: "ml-auto text-red-600 hover:text-red-800", children: "\u2715" })] }) })), _jsxs("div", { ...getRootProps(), className: `
          ${themeClasses}
          ${sizeClasses}
          ${isDragActive ? "border-blue-500 bg-blue-50" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50"}
        `, children: [_jsx("input", { ...getInputProps() }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCC1" }), _jsx("p", { className: "text-lg font-medium mb-2", children: isDragActive ? "Drop files here" : "Drag & drop files here" }), _jsx("p", { className: "text-sm opacity-75", children: "or click to select files" }), _jsxs("div", { className: "mt-4 text-xs opacity-60", children: [_jsxs("p", { children: ["Max files: ", maxFiles, " \u2022 Max size:", " ", Math.round((maxSize || maxFileSize) / FILE_SIZE.BYTES_PER_MB), "MB"] }), _jsxs("p", { children: ["Allowed types: ", allowedTypes.join(", ")] }), folder && (_jsxs("p", { className: "mt-1 text-blue-600", children: ["\uD83D\uDCC1 Uploading to: ", folder] })), _jsxs("p", { className: "mt-1 text-gray-500", children: ["Provider: ", provider.getName()] })] })] })] }), hasFiles && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-medium", children: ["Selected Files (", files.length, ")"] }), _jsxs("div", { className: "space-x-2", children: [_jsx("button", { onClick: handleUpload, disabled: !hasPendingFiles || isUploading, className: `${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`, children: isUploading ? "Uploading..." : "Upload All" }), _jsx("button", { onClick: clearAll, className: "px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors", children: "Clear All" })] })] }), _jsx("div", { className: "space-y-2", children: files.map((file) => (_jsx(FileItem, { file: file, progress: uploadProgress[file.id] || 0, onRemove: removeFile, onRetry: retryUpload, onCancel: cancelUpload, showPreview: showPreview, showProgress: showProgress, showFileSize: showFileSize, showFileType: showFileType, theme: typeof theme === "string" ? theme : theme.mode }, file.id))) }), hasFiles && (_jsx("div", { className: "p-3 bg-gray-50 rounded-lg text-sm text-gray-600", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("span", { children: [successFiles.length, " uploaded \u2022 ", pendingFiles.length, " pending \u2022 ", errorFiles.length, " failed"] }), _jsxs("span", { children: ["Total:", " ", FileProcessor.formatFileSize(files.reduce((sum, f) => sum + f.size, 0))] })] }) }))] }))] }));
};
//# sourceMappingURL=smart-dropzone.js.map