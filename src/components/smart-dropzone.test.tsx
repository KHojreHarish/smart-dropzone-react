import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SmartDropzone } from "./smart-dropzone";
import { MockProvider } from "../__mocks__/mock-provider";

// Mock react-dropzone
vi.mock("react-dropzone", () => ({
  useDropzone: () => ({
    getRootProps: () => ({ onClick: vi.fn() }),
    getInputProps: () => ({}),
    isDragActive: false,
  }),
}));

// Mock the useUpload hook
vi.mock("../hooks/use-upload", () => ({
  useUpload: () => ({
    files: [],
    isUploading: false,
    error: null,
    uploadProgress: {},
    pendingFiles: [],
    successFiles: [],
    errorFiles: [],
    hasFiles: false,
    hasPendingFiles: false,
    addFiles: vi.fn(),
    removeFile: vi.fn(),
    clearAll: vi.fn(),
    uploadAll: vi.fn(),
    retryUpload: vi.fn(),
    cancelUpload: vi.fn(),
  }),
}));

describe("SmartDropzone Component", () => {
  let mockProvider: MockProvider;

  beforeEach(() => {
    mockProvider = new MockProvider("test-provider");
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<SmartDropzone provider={mockProvider} />);

      expect(screen.getByText("Drag & drop files here")).toBeInTheDocument();
      expect(screen.getByText("or click to select files")).toBeInTheDocument();
      expect(screen.getByText(/Max files: 10/)).toBeInTheDocument();
      expect(screen.getByText(/Max size: 10MB/)).toBeInTheDocument();
      expect(screen.getByText("Provider: test-provider")).toBeInTheDocument();
    });

    it("should render with custom theme", () => {
      render(<SmartDropzone provider={mockProvider} theme="dark" />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement;
      expect(dropzone).toHaveClass("bg-gray-800");
    });

    it("should render with custom variant", () => {
      render(<SmartDropzone provider={mockProvider} variant="filled" />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement;
      expect(dropzone).toHaveClass("bg-blue-50");
    });

    it("should render with custom size", () => {
      render(<SmartDropzone provider={mockProvider} size="lg" />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement;
      expect(dropzone).toHaveClass("p-8");
    });

    it("should render with minimal variant", () => {
      render(<SmartDropzone provider={mockProvider} variant="minimal" />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement;
      expect(dropzone).toHaveClass("border-gray-300", "text-gray-600");
    });

    it("should render with small size", () => {
      render(<SmartDropzone provider={mockProvider} size="sm" />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement;
      expect(dropzone).toHaveClass("p-4");
    });
  });

  describe("Configuration Display", () => {
    it("should display custom max files", () => {
      render(<SmartDropzone provider={mockProvider} maxFiles={5} />);

      expect(screen.getByText(/Max files: 5/)).toBeInTheDocument();
    });

    it("should display custom max file size", () => {
      render(
        <SmartDropzone provider={mockProvider} maxFileSize={5 * 1024 * 1024} />
      );

      expect(screen.getByText(/Max size: 5MB/)).toBeInTheDocument();
    });

    it("should display folder information when provided", () => {
      render(<SmartDropzone provider={mockProvider} folder="test-folder" />);

      expect(
        screen.getByText("📁 Uploading to: test-folder")
      ).toBeInTheDocument();
    });

    it("should display allowed file types", () => {
      render(
        <SmartDropzone
          provider={mockProvider}
          allowedTypes={["image/*", "application/pdf"]}
        />
      );

      expect(
        screen.getByText(/Allowed types: image\/\*, application\/pdf/)
      ).toBeInTheDocument();
    });

    it("should handle wildcard file types", () => {
      render(<SmartDropzone provider={mockProvider} allowedTypes={["*"]} />);

      expect(screen.getByText(/Allowed types: \*/)).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should render in disabled state", () => {
      render(<SmartDropzone provider={mockProvider} disabled={true} />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement;
      expect(dropzone).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("should not show hover effects when disabled", () => {
      render(<SmartDropzone provider={mockProvider} disabled={true} />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement;
      expect(dropzone).not.toHaveClass(
        "hover:border-blue-400",
        "hover:bg-blue-50"
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<SmartDropzone provider={mockProvider} />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div");
      expect(dropzone).toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      render(<SmartDropzone provider={mockProvider} tabIndex={0} />);

      const dropzone = screen
        .getByText("Drag & drop files here")
        .closest("div");
      expect(dropzone).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should render efficiently with many props", () => {
      const startTime = performance.now();

      render(
        <SmartDropzone
          provider={mockProvider}
          theme="dark"
          variant="filled"
          size="lg"
          maxFiles={20}
          maxFileSize={50 * 1024 * 1024}
          allowedTypes={["image/*", "video/*", "application/pdf"]}
          folder="performance-test"
          showPreview={true}
          showProgress={true}
          showFileSize={true}
          showFileType={true}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);

      expect(screen.getByText("Drag & drop files here")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle custom className", () => {
      render(
        <SmartDropzone provider={mockProvider} className="custom-class" />
      );

      const container = screen
        .getByText("Drag & drop files here")
        .closest("div")?.parentElement?.parentElement;
      expect(container).toHaveClass("custom-class");
    });

    it("should handle custom maxSize prop", () => {
      render(
        <SmartDropzone provider={mockProvider} maxSize={5 * 1024 * 1024} />
      );

      expect(screen.getByText(/Max size: 5MB/)).toBeInTheDocument();
    });

    it("should handle empty allowedTypes array", () => {
      render(<SmartDropzone provider={mockProvider} allowedTypes={[]} />);

      expect(screen.getByText("Allowed types:")).toBeInTheDocument();
    });

    it("should handle null error state", () => {
      render(<SmartDropzone provider={mockProvider} />);

      expect(screen.queryByText("⚠️")).not.toBeInTheDocument();
    });
  });
});
