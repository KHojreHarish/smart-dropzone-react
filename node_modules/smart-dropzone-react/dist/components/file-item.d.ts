import React from 'react';
import type { UploadFile } from '../types';
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
export declare const FileItem: React.FC<FileItemProps>;
export {};
//# sourceMappingURL=file-item.d.ts.map