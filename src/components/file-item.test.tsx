import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FileItem } from "./file-item";
import type { UploadFile } from "../types";

// Mock FileProcessor
vi.mock("../core/file-processor", () => ({
  FileProcessor: {
    getFileIcon: vi.fn((type: string) => {
      if (type.startsWith("image/")) return "📷";
      if (type.startsWith("video/")) return "🎥";
      if (type.startsWith("audio/")) return "🎵";
      if (type === "application/pdf") return "📄";
      return "📁";
    }),
    formatFileSize: vi.fn((bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
      return `${Math.round(bytes / (1024 * 1024))} MB`;
    }),
    isImage: vi.fn((type: string) => type.startsWith("image/")),
    getFileCategory: vi.fn((type: string) => {
      if (type.startsWith("image/")) return "Image";
      if (type.startsWith("video/")) return "Video";
      if (type.startsWith("audio/")) return "Audio";
      if (type === "application/pdf") return "Document";
      return "File";
    }),
  },
}));

describe("FileItem Component", () => {
  const mockOnRemove = vi.fn();
  const mockOnRetry = vi.fn();
  const mockOnCancel = vi.fn();

  const createMockFile = (overrides: Partial<UploadFile> = {}): UploadFile => ({
    id: "test-file-1",
    name: "test-image.jpg",
    size: 1024 * 1024, // 1MB
    type: "image/jpeg",
    status: "pending",
    ...overrides,
  });

  const defaultProps = {
    progress: 0,
    onRemove: mockOnRemove,
    onRetry: mockOnRetry,
    onCancel: mockOnCancel,
    showPreview: true,
    showProgress: true,
    showFileSize: true,
    showFileType: true,
    theme: "light" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render file item with basic information", () => {
      const file = createMockFile();
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("test-image.jpg")).toBeInTheDocument();
      expect(screen.getByText("📷")).toBeInTheDocument(); // File icon
      expect(screen.getByText("1 MB")).toBeInTheDocument(); // File size
      expect(screen.getByText("image/jpeg")).toBeInTheDocument(); // File type
      expect(screen.getByText("Image")).toBeInTheDocument(); // File category
    });

    it("should render with dark theme", () => {
      const file = createMockFile();
      const { container } = render(
        <FileItem file={file} {...defaultProps} theme="dark" />
      );

      const fileItemContainer = container.firstElementChild as HTMLElement;
      expect(fileItemContainer).toHaveClass("bg-gray-700", "text-gray-200");
    });

    it("should render with light theme", () => {
      const file = createMockFile();
      const { container } = render(
        <FileItem file={file} {...defaultProps} theme="light" />
      );

      const fileItemContainer = container.firstElementChild as HTMLElement;
      expect(fileItemContainer).toHaveClass("bg-gray-50", "text-gray-700");
    });

    it("should render with custom theme", () => {
      const file = createMockFile();
      const { container } = render(
        <FileItem file={file} {...defaultProps} theme="custom" />
      );

      const fileItemContainer = container.firstElementChild as HTMLElement;
      expect(fileItemContainer).toHaveClass("bg-gray-50", "text-gray-700");
    });
  });

  describe("File Status States", () => {
    it("should render pending status", () => {
      const file = createMockFile({ status: "pending" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("⏸️ pending")).toBeInTheDocument();
      expect(screen.getByText("⏸️ pending")).toHaveClass("text-gray-600");
    });

    it("should render uploading status with progress", () => {
      const file = createMockFile({ status: "uploading" });
      render(<FileItem file={file} {...defaultProps} progress={65} />);

      expect(screen.getByText("⏳ uploading")).toBeInTheDocument();
      expect(screen.getByText("⏳ uploading")).toHaveClass("text-blue-600");
      expect(screen.getByText("65%")).toBeInTheDocument();

      // Check that progress bar container exists
      const progressContainer = screen.getByText("65%").previousElementSibling;
      expect(progressContainer).toBeInTheDocument();
    });

    it("should render success status", () => {
      const file = createMockFile({
        status: "success",
        url: "https://example.com/file.jpg",
        uploadedAt: new Date("2023-01-01T12:00:00Z"),
      });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("✓ success")).toBeInTheDocument();
      expect(screen.getByText("✓ success")).toHaveClass("text-green-600");
      expect(screen.getByText("Upload successful!")).toBeInTheDocument();
      expect(screen.getByText("View file")).toBeInTheDocument();
      expect(screen.getByText("View file")).toHaveAttribute(
        "href",
        "https://example.com/file.jpg"
      );
    });

    it("should render error status with error message", () => {
      const file = createMockFile({
        status: "error",
        error: "File too large",
      });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("✗ error")).toBeInTheDocument();
      expect(screen.getByText("✗ error")).toHaveClass("text-red-600");
      expect(screen.getByText("(File too large)")).toBeInTheDocument();
    });

    it("should render cancelled status", () => {
      const file = createMockFile({ status: "cancelled" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("⊘ cancelled")).toBeInTheDocument();
      expect(screen.getByText("⊘ cancelled")).toHaveClass("text-gray-500");
    });
  });

  describe("Progress Bar", () => {
    it("should show progress bar when uploading and showProgress is true", () => {
      const file = createMockFile({ status: "uploading" });
      render(
        <FileItem
          file={file}
          {...defaultProps}
          progress={45}
          showProgress={true}
        />
      );

      expect(screen.getByText("45%")).toBeInTheDocument();
      // Check that progress bar container exists
      const progressContainer = screen.getByText("45%").previousElementSibling;
      expect(progressContainer).toBeInTheDocument();
    });

    it("should not show progress bar when showProgress is false", () => {
      const file = createMockFile({ status: "uploading" });
      render(
        <FileItem
          file={file}
          {...defaultProps}
          progress={45}
          showProgress={false}
        />
      );

      expect(screen.queryByText("45%")).not.toBeInTheDocument();
    });

    it("should not show progress bar when not uploading", () => {
      const file = createMockFile({ status: "success" });
      render(
        <FileItem
          file={file}
          {...defaultProps}
          progress={100}
          showProgress={true}
        />
      );

      expect(screen.queryByText("100%")).not.toBeInTheDocument();
    });

    it("should handle 0% progress", () => {
      const file = createMockFile({ status: "uploading" });
      render(<FileItem file={file} {...defaultProps} progress={0} />);

      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("should handle 100% progress", () => {
      const file = createMockFile({ status: "uploading" });
      render(<FileItem file={file} {...defaultProps} progress={100} />);

      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("File Preview", () => {
    it("should show image preview when file is image and showPreview is true", () => {
      const file = createMockFile({
        type: "image/jpeg",
        preview: "data:image/jpeg;base64,mockpreview",
      });
      render(<FileItem file={file} {...defaultProps} showPreview={true} />);

      const image = screen.getByAltText("test-image.jpg");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute(
        "src",
        "data:image/jpeg;base64,mockpreview"
      );
    });

    it("should not show preview when showPreview is false", () => {
      const file = createMockFile({
        type: "image/jpeg",
        preview: "data:image/jpeg;base64,mockpreview",
      });
      render(<FileItem file={file} {...defaultProps} showPreview={false} />);

      expect(screen.queryByAltText("test-image.jpg")).not.toBeInTheDocument();
    });

    it("should not show preview when file is not an image", () => {
      const file = createMockFile({
        type: "application/pdf",
        preview: "some-preview-url",
      });
      render(<FileItem file={file} {...defaultProps} showPreview={true} />);

      expect(screen.queryByAltText("test-image.jpg")).not.toBeInTheDocument();
    });

    it("should not show preview when preview is not available", () => {
      const file = createMockFile({
        type: "image/jpeg",
        preview: undefined,
      });
      render(<FileItem file={file} {...defaultProps} showPreview={true} />);

      expect(screen.queryByAltText("test-image.jpg")).not.toBeInTheDocument();
    });
  });

  describe("File Information Display", () => {
    it("should show file size when showFileSize is true", () => {
      const file = createMockFile({ size: 2048 });
      render(<FileItem file={file} {...defaultProps} showFileSize={true} />);

      expect(screen.getByText("2 KB")).toBeInTheDocument();
    });

    it("should not show file size when showFileSize is false", () => {
      const file = createMockFile({ size: 2048 });
      render(<FileItem file={file} {...defaultProps} showFileSize={false} />);

      expect(screen.queryByText("2 KB")).not.toBeInTheDocument();
    });

    it("should show file type when showFileType is true", () => {
      const file = createMockFile({ type: "image/png" });
      render(<FileItem file={file} {...defaultProps} showFileType={true} />);

      expect(screen.getByText("image/png")).toBeInTheDocument();
    });

    it("should not show file type when showFileType is false", () => {
      const file = createMockFile({ type: "image/png" });
      render(<FileItem file={file} {...defaultProps} showFileType={false} />);

      expect(screen.queryByText("image/png")).not.toBeInTheDocument();
    });

    it("should show separator when both size and type are shown", () => {
      const file = createMockFile({ size: 1024, type: "image/jpeg" });
      render(
        <FileItem
          file={file}
          {...defaultProps}
          showFileSize={true}
          showFileType={true}
        />
      );

      expect(screen.getByText("1 KB")).toBeInTheDocument();
      expect(screen.getByText("image/jpeg")).toBeInTheDocument();
      expect(screen.getByText("•")).toBeInTheDocument();
    });

    it("should show upload time when file is uploaded", () => {
      const uploadTime = new Date("2023-01-01T12:30:45Z");
      const file = createMockFile({
        status: "success",
        uploadedAt: uploadTime,
      });
      render(<FileItem file={file} {...defaultProps} />);

      expect(
        screen.getByText(uploadTime.toLocaleTimeString())
      ).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should show remove button for all files", () => {
      const file = createMockFile({ status: "pending" });
      render(<FileItem file={file} {...defaultProps} />);

      const removeButton = screen.getByTitle("Remove file");
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveTextContent("✕");
    });

    it("should call onRemove when remove button is clicked", () => {
      const file = createMockFile({ id: "test-file-123" });
      render(<FileItem file={file} {...defaultProps} />);

      const removeButton = screen.getByTitle("Remove file");
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalledWith("test-file-123");
    });

    it("should show retry button for error status", () => {
      const file = createMockFile({ status: "error" });
      render(<FileItem file={file} {...defaultProps} />);

      const retryButton = screen.getByTitle("Retry upload");
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent("🔄");
    });

    it("should call onRetry when retry button is clicked", () => {
      const file = createMockFile({ id: "error-file-456", status: "error" });
      render(<FileItem file={file} {...defaultProps} />);

      const retryButton = screen.getByTitle("Retry upload");
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledWith("error-file-456");
    });

    it("should show cancel button for uploading status", () => {
      const file = createMockFile({ status: "uploading" });
      render(<FileItem file={file} {...defaultProps} />);

      const cancelButton = screen.getByTitle("Cancel upload");
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveTextContent("⏹️");
    });

    it("should call onCancel when cancel button is clicked", () => {
      const file = createMockFile({
        id: "uploading-file-789",
        status: "uploading",
      });
      render(<FileItem file={file} {...defaultProps} />);

      const cancelButton = screen.getByTitle("Cancel upload");
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledWith("uploading-file-789");
    });

    it("should not show retry button for non-error status", () => {
      const file = createMockFile({ status: "success" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.queryByTitle("Retry upload")).not.toBeInTheDocument();
    });

    it("should not show cancel button for non-uploading status", () => {
      const file = createMockFile({ status: "success" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.queryByTitle("Cancel upload")).not.toBeInTheDocument();
    });
  });

  describe("File Types and Icons", () => {
    it("should render correct icon for image files", () => {
      const file = createMockFile({ type: "image/png" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("📷")).toBeInTheDocument();
      expect(screen.getByText("Image")).toBeInTheDocument();
    });

    it("should render correct icon for video files", () => {
      const file = createMockFile({ type: "video/mp4", name: "video.mp4" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("🎥")).toBeInTheDocument();
      expect(screen.getByText("Video")).toBeInTheDocument();
    });

    it("should render correct icon for audio files", () => {
      const file = createMockFile({ type: "audio/mp3", name: "audio.mp3" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("🎵")).toBeInTheDocument();
      expect(screen.getByText("Audio")).toBeInTheDocument();
    });

    it("should render correct icon for PDF files", () => {
      const file = createMockFile({
        type: "application/pdf",
        name: "document.pdf",
      });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("📄")).toBeInTheDocument();
      expect(screen.getByText("Document")).toBeInTheDocument();
    });

    it("should render default icon for unknown file types", () => {
      const file = createMockFile({
        type: "application/unknown",
        name: "unknown.xyz",
      });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("📁")).toBeInTheDocument();
      expect(screen.getByText("File")).toBeInTheDocument();
    });
  });

  describe("File Sizes", () => {
    it("should format bytes correctly", () => {
      const file = createMockFile({ size: 512 });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("512 B")).toBeInTheDocument();
    });

    it("should format kilobytes correctly", () => {
      const file = createMockFile({ size: 1536 }); // 1.5 KB
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("2 KB")).toBeInTheDocument(); // Rounded
    });

    it("should format megabytes correctly", () => {
      const file = createMockFile({ size: 1024 * 1024 * 2.5 }); // 2.5 MB
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("3 MB")).toBeInTheDocument(); // Rounded
    });
  });

  describe("Edge Cases", () => {
    it("should handle files with very long names", () => {
      const longName = "a".repeat(100) + ".jpg";
      const file = createMockFile({ name: longName });
      render(<FileItem file={file} {...defaultProps} />);

      const nameElement = screen.getByText(longName);
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass("truncate");
    });

    it("should handle files without upload time", () => {
      const file = createMockFile({
        status: "success",
        url: "https://example.com/file.jpg",
        uploadedAt: undefined,
      });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("Upload successful!")).toBeInTheDocument();
      // Should not crash when uploadedAt is undefined
    });

    it("should handle error status without error message", () => {
      const file = createMockFile({ status: "error", error: undefined });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("✗ error")).toBeInTheDocument();
      expect(screen.queryByText(/\(/)).not.toBeInTheDocument(); // No error message
    });

    it("should handle success status without URL", () => {
      const file = createMockFile({ status: "success", url: undefined });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.queryByText("Upload successful!")).not.toBeInTheDocument();
      expect(screen.queryByText("View file")).not.toBeInTheDocument();
    });

    it("should handle zero file size", () => {
      const file = createMockFile({ size: 0 });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByText("0 B")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button titles", () => {
      const file = createMockFile({ status: "error" });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByTitle("Remove file")).toBeInTheDocument();
      expect(screen.getByTitle("Retry upload")).toBeInTheDocument();
    });

    it("should have accessible image alt text", () => {
      const file = createMockFile({
        name: "my-photo.jpg",
        type: "image/jpeg",
        preview: "data:image/jpeg;base64,test",
      });
      render(<FileItem file={file} {...defaultProps} />);

      expect(screen.getByAltText("my-photo.jpg")).toBeInTheDocument();
    });

    it("should have accessible external link properties", () => {
      const file = createMockFile({
        status: "success",
        url: "https://example.com/file.jpg",
      });
      render(<FileItem file={file} {...defaultProps} />);

      const link = screen.getByText("View file");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
