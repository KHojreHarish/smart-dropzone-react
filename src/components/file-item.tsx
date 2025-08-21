import React from 'react';
import type { UploadFile } from '../types';
import { FileProcessor } from '../core/file-processor';

interface FileItemProps {
  readonly file: UploadFile;
  readonly progress: number;
  readonly onRemove: (fileId: string) => void;
  readonly onRetry: (fileId: string) => void;
  readonly onCancel: (fileId: string) => void;
  readonly showPreview: boolean;
  readonly showProgress: boolean;
  readonly showFileSize: boolean;
  readonly showFileType: boolean;
  readonly theme: 'light' | 'dark' | 'custom';
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  progress,
  onRemove,
  onRetry,
  onCancel,
  showPreview,
  showProgress,
  showFileSize,
  showFileType,
  theme,
}) => {
  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-700' : 'bg-gray-50';
  const textClass = isDark ? 'text-gray-200' : 'text-gray-700';

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'uploading':
        return '⏳';
      case 'cancelled':
        return '⊘';
      default:
        return '⏸️';
    }
  };

  return (
    <div className={`p-3 rounded-lg ${bgClass} ${textClass}`}>
      <div className="flex items-center space-x-3">
        {/* File Icon */}
        <div className="text-2xl">{FileProcessor.getFileIcon(file.type)}</div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.name}</p>
          <div className="flex items-center space-x-2 text-sm opacity-75">
            {showFileSize && (
              <span>{FileProcessor.formatFileSize(file.size)}</span>
            )}
            {showFileSize && showFileType && <span>•</span>}
            {showFileType && <span>{file.type}</span>}
            {file.uploadedAt && (
              <>
                <span>•</span>
                <span>{file.uploadedAt.toLocaleTimeString()}</span>
              </>
            )}
          </div>

          {/* Progress Bar */}
          {showProgress && file.status === 'uploading' && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs mt-1">{Math.round(progress)}%</p>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-sm ${getStatusColor(file.status)}`}>
              {getStatusIcon(file.status)} {file.status}
            </span>
            {file.status === 'error' && file.error && (
              <span className="text-xs text-red-500">({file.error})</span>
            )}
          </div>
        </div>

        {/* Preview */}
        {showPreview && file.preview && FileProcessor.isImage(file.type) && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {file.status === 'error' && (
            <button
              onClick={() => onRetry(file.id)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
              title="Retry upload"
            >
              🔄
            </button>
          )}
          {file.status === 'uploading' && (
            <button
              onClick={() => onCancel(file.id)}
              className="text-yellow-500 hover:text-yellow-700 transition-colors"
              title="Cancel upload"
            >
              ⏹️
            </button>
          )}
          <button
            onClick={() => onRemove(file.id)}
            className="text-red-500 hover:text-red-700 transition-colors"
            title="Remove file"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Additional File Details */}
      {file.status === 'success' && file.url && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-600">Upload successful!</span>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View file
            </a>
          </div>
        </div>
      )}

      {/* File Category Badge */}
      <div className="mt-2">
        <span className="inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
          {FileProcessor.getFileCategory(file.type)}
        </span>
      </div>
    </div>
  );
};
