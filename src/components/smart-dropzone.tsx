import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import type { SmartDropzoneProps, UploadProvider } from "../types";
import { useUpload } from "../hooks/use-upload";
import { FileProcessor } from "../core/file-processor";
import { FileItem } from "./file-item";
import { FILE_SIZE, UPLOAD } from "../core/config";

/**
 * Enhanced SmartDropzone component with provider abstraction
 */
export const SmartDropzone: React.FC<
  SmartDropzoneProps & { provider: UploadProvider }
> = ({
  className = "",
  theme = "light",
  variant = "outlined",
  size = "md",
  showPreview = true,
  showProgress = true,
  showFileSize = true,
  showFileType = true,
  maxFiles = UPLOAD.DEFAULT_MAX_FILES,
  maxFileSize = FILE_SIZE.DEFAULT_MAX_SIZE,
  allowedTypes = ["image/*", "application/pdf", "text/*"],
  onFilesSelected,
  onUploadComplete,
  onValidationError,
  folder,
  provider,
  disabled = false,
  multiple = true,
  maxSize,
  minSize,
  noClick = false,
  noKeyboard = false,
  noDrag = false,
  noDragEventsBubbling = false,
  preventDropOnDocument = true,
  useFsAccessApi = false,
  autoFocus = false,
  tabIndex,
  ...options
}) => {
  // Use the upload hook for state management
  const {
    files,
    isUploading,
    error,
    uploadProgress,
    pendingFiles,
    successFiles,
    errorFiles,
    hasFiles,
    hasPendingFiles,
    addFiles,
    removeFile,
    clearAll,
    uploadAll,
    retryUpload,
    cancelUpload,
  } = useUpload(provider, {
    maxFiles,
    maxFileSize,
    allowedTypes,
    folder,
    ...options,
  });

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: readonly File[]) => {
      try {
        const result = await addFiles(acceptedFiles);

        if (result && result.success && result.files) {
          onFilesSelected?.(result.files);
        } else if (result && result.errors) {
          const errorMessage = result.errors.join("; ");
          onValidationError?.(errorMessage);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process files";
        onValidationError?.(errorMessage);
      }
    },
    [addFiles, onFilesSelected, onValidationError]
  );

  // Handle rejected files
  const onDropRejected = useCallback(
    (rejectedFiles: any[]) => {
      const errors = rejectedFiles.map(
        ({ file, errors }: any) =>
          `${file.name}: ${errors.map((e: any) => e.message).join(", ")}`
      );
      const errorMessage = errors.join("; ");
      onValidationError?.(errorMessage);
    },
    [onValidationError]
  );

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
      return allowedTypes.reduce(
        (acc, type) => {
          if (type === "*") {
            acc["*/*"] = [];
          } else if (type.endsWith("/*")) {
            const category = type.split("/")[0];
            acc[category] = [];
          } else if (type.startsWith(".")) {
            acc["*/*"] = [type];
          } else {
            acc[type] = [];
          }
          return acc;
        },
        {} as Record<string, string[]>
      );
    }, [allowedTypes]),
    disabled,
  });

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!hasPendingFiles || isUploading) return;

    try {
      const results = await uploadAll();
      onUploadComplete?.(files);
      return results;
    } catch (error) {
      // Error is already handled in the hook
      console.error("Upload failed:", error);
    }
  }, [hasPendingFiles, isUploading, uploadAll, files, onUploadComplete]);

  // Memoized theme and variant classes
  const themeClasses = useMemo(() => {
    const baseClasses =
      "border-2 border-dashed rounded-lg transition-all duration-200";

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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => onValidationError?.(error)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          ${themeClasses}
          ${sizeClasses}
          ${isDragActive ? "border-blue-500 bg-blue-50" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50"}
        `}
      >
        <input {...getInputProps()} />

        <div className="text-center">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-lg font-medium mb-2">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-sm opacity-75">or click to select files</p>
          <div className="mt-4 text-xs opacity-60">
            <p>
              Max files: {maxFiles} • Max size:{" "}
              {Math.round((maxSize || maxFileSize) / FILE_SIZE.BYTES_PER_MB)}MB
            </p>
            <p>Allowed types: {allowedTypes.join(", ")}</p>
            {folder && (
              <p className="mt-1 text-blue-600">📁 Uploading to: {folder}</p>
            )}
            <p className="mt-1 text-gray-500">Provider: {provider.getName()}</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {hasFiles && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Selected Files ({files.length})
            </h3>
            <div className="space-x-2">
              <button
                onClick={handleUpload}
                disabled={!hasPendingFiles || isUploading}
                className={`${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUploading ? "Uploading..." : "Upload All"}
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                progress={uploadProgress[file.id] || 0}
                onRemove={removeFile}
                onRetry={retryUpload}
                onCancel={cancelUpload}
                showPreview={showPreview}
                showProgress={showProgress}
                showFileSize={showFileSize}
                showFileType={showFileType}
                theme={typeof theme === "string" ? theme : theme.mode}
              />
            ))}
          </div>

          {/* Upload Summary */}
          {hasFiles && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>
                  {successFiles.length} uploaded • {pendingFiles.length} pending
                  • {errorFiles.length} failed
                </span>
                <span>
                  Total:{" "}
                  {FileProcessor.formatFileSize(
                    files.reduce((sum, f) => sum + f.size, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
