import { useState, useCallback, useMemo, useEffect } from "react";
import { FileProcessor } from "../core/file-processor";
/**
 * Hook for managing file uploads with a specific provider
 */
export function useUpload(provider, options = {}) {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});
    // Memoized file processor instance
    const fileProcessor = useMemo(() => new FileProcessor(options), [options.maxFiles, options.maxFileSize, options.allowedTypes]);
    // Initialize provider on mount
    useEffect(() => {
        const initProvider = async () => {
            try {
                await provider.initialize();
            }
            catch (error) {
                setError(`Failed to initialize ${provider.getName()} provider: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        };
        initProvider();
        // Cleanup on unmount
        return () => {
            provider.cleanup().catch(console.warn);
        };
    }, [provider]);
    /**
     * Process and add files to the upload queue
     */
    const addFiles = useCallback(async (newFiles) => {
        try {
            setError(null);
            const result = await fileProcessor.processFiles(newFiles);
            if (result.success && result.files) {
                setFiles((prev) => [...prev, ...result.files]);
                return { success: true, files: result.files };
            }
            else if (result.errors) {
                const errorMessage = result.errors.join("; ");
                setError(errorMessage);
                return { success: false, errors: result.errors };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to process files";
            setError(errorMessage);
            return { success: false, errors: [errorMessage] };
        }
    }, [fileProcessor]);
    /**
     * Remove a file from the upload queue
     */
    const removeFile = useCallback((fileId) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
        });
    }, []);
    /**
     * Clear all files from the upload queue
     */
    const clearAll = useCallback(() => {
        setFiles([]);
        setUploadProgress({});
        setError(null);
    }, []);
    /**
     * Upload a single file
     */
    const uploadFile = useCallback(async (fileId, uploadOptions) => {
        const file = files.find((f) => f.id === fileId);
        if (!file || file.status === "success")
            return;
        try {
            setError(null);
            setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));
            // Update file status to uploading
            setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: "uploading" } : f));
            const finalOptions = { ...options, ...uploadOptions };
            const result = await provider.uploadFile(file.file, finalOptions);
            // Update file with success status
            setFiles((prev) => prev.map((f) => f.id === fileId
                ? {
                    ...f,
                    status: "success",
                    progress: 100,
                    publicId: result.id,
                    url: result.url,
                    uploadedAt: result.createdAt,
                }
                : f));
            setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Upload failed";
            setError(errorMessage);
            // Update file with error status
            setFiles((prev) => prev.map((f) => f.id === fileId
                ? { ...f, status: "error", error: errorMessage }
                : f));
            throw error;
        }
    }, [files, provider, options]);
    /**
     * Upload all pending files
     */
    const uploadAll = useCallback(async (uploadOptions) => {
        if (files.length === 0 || isUploading)
            return;
        const pendingFiles = files.filter((f) => f.status === "pending");
        if (pendingFiles.length === 0)
            return;
        setIsUploading(true);
        setError(null);
        try {
            const finalOptions = { ...options, ...uploadOptions };
            const results = await provider.uploadFiles(pendingFiles.map((f) => f.file), finalOptions, (fileId, progress) => {
                setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
            });
            // Update all files with success status
            setFiles((prev) => prev.map((f) => {
                const result = results.find((r) => r.filename === f.name);
                if (result && f.status === "pending") {
                    return {
                        ...f,
                        status: "success",
                        progress: 100,
                        publicId: result.id,
                        url: result.url,
                        uploadedAt: result.createdAt,
                    };
                }
                return f;
            }));
            return results;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Upload failed";
            setError(errorMessage);
            // Update uploading files with error status
            setFiles((prev) => prev.map((f) => f.status === "uploading"
                ? { ...f, status: "error", error: errorMessage }
                : f));
            throw error;
        }
        finally {
            setIsUploading(false);
        }
    }, [files, isUploading, provider, options]);
    /**
     * Retry upload for a failed file
     */
    const retryUpload = useCallback(async (fileId, uploadOptions) => {
        const file = files.find((f) => f.id === fileId);
        if (!file || file.status !== "error")
            return;
        try {
            setError(null);
            const result = await uploadFile(fileId, uploadOptions);
            return result;
        }
        catch (error) {
            // Error is already handled in uploadFile
            throw error;
        }
    }, [files, uploadFile]);
    /**
     * Cancel upload for a file
     */
    const cancelUpload = useCallback(async (fileId) => {
        const file = files.find((f) => f.id === fileId);
        if (!file || file.status !== "uploading")
            return;
        try {
            // Update file status to cancelled
            setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, status: "cancelled" } : f));
            setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[fileId];
                return newProgress;
            });
        }
        catch (error) {
            console.warn(`Failed to cancel upload for ${fileId}:`, error);
        }
    }, [files]);
    /**
     * Get upload statistics
     */
    const getStats = useCallback(async () => {
        try {
            return await provider.getStats();
        }
        catch (error) {
            console.warn("Failed to get upload stats:", error);
            return null;
        }
    }, [provider]);
    /**
     * Test provider connection
     */
    const testConnection = useCallback(async () => {
        try {
            return await provider.testConnection();
        }
        catch (error) {
            console.warn("Failed to test provider connection:", error);
            return false;
        }
    }, [provider]);
    // Computed values
    const pendingFiles = useMemo(() => files.filter((f) => f.status === "pending"), [files]);
    const uploadingFiles = useMemo(() => files.filter((f) => f.status === "uploading"), [files]);
    const successFiles = useMemo(() => files.filter((f) => f.status === "success"), [files]);
    const errorFiles = useMemo(() => files.filter((f) => f.status === "error"), [files]);
    const cancelledFiles = useMemo(() => files.filter((f) => f.status === "cancelled"), [files]);
    const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
    const uploadedSize = useMemo(() => successFiles.reduce((sum, f) => sum + f.size, 0), [successFiles]);
    return {
        // State
        files,
        isUploading,
        error,
        uploadProgress,
        // Computed values
        pendingFiles,
        uploadingFiles,
        successFiles,
        errorFiles,
        cancelledFiles,
        totalSize,
        uploadedSize,
        // Actions
        addFiles,
        removeFile,
        clearAll,
        uploadFile,
        uploadAll,
        retryUpload,
        cancelUpload,
        getStats,
        testConnection,
        // Utilities
        hasFiles: files.length > 0,
        hasPendingFiles: pendingFiles.length > 0,
        hasErrors: errorFiles.length > 0,
        isFullyUploaded: files.length > 0 && files.every((f) => f.status === "success"),
    };
}
//# sourceMappingURL=use-upload.js.map