import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { FileProcessor } from '../core/file-processor';
export const FileItem = ({ file, progress, onRemove, onRetry, onCancel, showPreview, showProgress, showFileSize, showFileType, theme, }) => {
    const isDark = theme === 'dark';
    const bgClass = isDark ? 'bg-gray-700' : 'bg-gray-50';
    const textClass = isDark ? 'text-gray-200' : 'text-gray-700';
    const getStatusColor = (status) => {
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
    const getStatusIcon = (status) => {
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
    return (_jsxs("div", { className: `p-3 rounded-lg ${bgClass} ${textClass}`, children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "text-2xl", children: FileProcessor.getFileIcon(file.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium truncate", children: file.name }), _jsxs("div", { className: "flex items-center space-x-2 text-sm opacity-75", children: [showFileSize && (_jsx("span", { children: FileProcessor.formatFileSize(file.size) })), showFileSize && showFileType && _jsx("span", { children: "\u2022" }), showFileType && _jsx("span", { children: file.type }), file.uploadedAt && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsx("span", { children: file.uploadedAt.toLocaleTimeString() })] }))] }), showProgress && file.status === 'uploading' && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all duration-300", style: { width: `${progress}%` } }) }), _jsxs("p", { className: "text-xs mt-1", children: [Math.round(progress), "%"] })] })), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [_jsxs("span", { className: `text-sm ${getStatusColor(file.status)}`, children: [getStatusIcon(file.status), " ", file.status] }), file.status === 'error' && file.error && (_jsxs("span", { className: "text-xs text-red-500", children: ["(", file.error, ")"] }))] })] }), showPreview && file.preview && FileProcessor.isImage(file.type) && (_jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-gray-200", children: _jsx("img", { src: file.preview, alt: file.name, className: "w-full h-full object-cover" }) })), _jsxs("div", { className: "flex items-center space-x-2", children: [file.status === 'error' && (_jsx("button", { onClick: () => onRetry(file.id), className: "text-blue-500 hover:text-blue-700 transition-colors", title: "Retry upload", children: "\uD83D\uDD04" })), file.status === 'uploading' && (_jsx("button", { onClick: () => onCancel(file.id), className: "text-yellow-500 hover:text-yellow-700 transition-colors", title: "Cancel upload", children: "\u23F9\uFE0F" })), _jsx("button", { onClick: () => onRemove(file.id), className: "text-red-500 hover:text-red-700 transition-colors", title: "Remove file", children: "\u2715" })] })] }), file.status === 'success' && file.url && (_jsx("div", { className: "mt-2 pt-2 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "text-green-600", children: "Upload successful!" }), _jsx("a", { href: file.url, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-800 underline", children: "View file" })] }) })), _jsx("div", { className: "mt-2", children: _jsx("span", { className: "inline-block px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full", children: FileProcessor.getFileCategory(file.type) }) })] }));
};
//# sourceMappingURL=file-item.js.map