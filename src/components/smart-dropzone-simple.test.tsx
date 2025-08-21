import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SmartDropzoneSimple,
  SimpleUpload,
  GalleryUpload,
  DocumentUpload,
  MediaUpload,
  EnterpriseUpload,
} from "./smart-dropzone-simple";
import { CloudinaryProvider } from "../providers/cloudinary";

// Mock the CloudinaryProvider
vi.mock("../providers/cloudinary", () => ({
  CloudinaryProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    isConfigured: vi.fn().mockReturnValue(true),
    uploadFile: vi.fn().mockResolvedValue({
      success: true,
      fileId: "test-file-id",
      url: "https://example.com/test.jpg",
      fileName: "test.jpg",
      fileSize: 1024,
      mimeType: "image/jpeg",
    }),
  })),
}));

// Mock the SmartDropzone component
vi.mock("./smart-dropzone", () => ({
  SmartDropzone: vi.fn().mockImplementation(({ onFilesAdded, ...props }) => (
    <div data-testid="smart-dropzone" {...props}>
      <button
        data-testid="add-files"
        onClick={() =>
          onFilesAdded?.([
            new File(["test"], "test.jpg", { type: "image/jpeg" }),
          ])
        }
      >
        Add Files
      </button>
      <div data-testid="props-display">{JSON.stringify(props)}</div>
    </div>
  )),
}));

describe("🎯 SmartDropzoneSimple Component", () => {
  const mockCloudinary = {
    cloudName: "test-cloud",
    uploadPreset: "test-preset",
    defaultFolder: "test-folder",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SmartDropzoneSimple", () => {
    it("should render with smart defaults when no preset specified", () => {
      render(
        <SmartDropzoneSimple
          cloudinary={mockCloudinary}
          onFilesAdded={vi.fn()}
        />
      );

      expect(screen.getByTestId("smart-dropzone")).toBeInTheDocument();
      expect(screen.getByTestId("add-files")).toBeInTheDocument();
    });

    it("should use gallery preset when specified", () => {
      render(
        <SmartDropzoneSimple
          preset="gallery"
          cloudinary={mockCloudinary}
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(20);
      expect(props.maxFileSize).toBe(15 * 1024 * 1024);
      expect(props.allowedTypes).toEqual(["image/*", "video/*"]);
      expect(props.enableReorder).toBe(true);
    });

    it("should merge preset with overrides correctly", () => {
      const overrides = {
        maxFiles: 30,
        theme: "dark" as const,
      };

      render(
        <SmartDropzoneSimple
          preset="gallery"
          cloudinary={mockCloudinary}
          overrides={overrides}
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(30); // From overrides
      expect(props.theme).toBe("dark"); // From overrides
      expect(props.maxFileSize).toBe(15 * 1024 * 1024); // From preset
      expect(props.enableReorder).toBe(true); // From preset
    });

    it("should merge explicit props with highest priority", () => {
      render(
        <SmartDropzoneSimple
          preset="simple"
          cloudinary={mockCloudinary}
          overrides={{ maxFiles: 15 }}
          maxFiles={25} // Explicit prop
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(25); // Explicit prop has highest priority
      expect(props.maxFileSize).toBe(5 * 1024 * 1024); // From preset
    });

    it("should create CloudinaryProvider with correct config", () => {
      render(
        <SmartDropzoneSimple
          cloudinary={mockCloudinary}
          onFilesAdded={vi.fn()}
        />
      );

      expect(CloudinaryProvider).toHaveBeenCalledWith({
        cloudName: "test-cloud",
        uploadPreset: "test-preset",
        defaultFolder: "test-folder",
      });
    });

    it("should handle files added correctly", async () => {
      const onFilesAdded = vi.fn();

      render(
        <SmartDropzoneSimple
          cloudinary={mockCloudinary}
          onFilesAdded={onFilesAdded}
        />
      );

      const addFilesButton = screen.getByTestId("add-files");
      fireEvent.click(addFilesButton);

      await waitFor(() => {
        expect(onFilesAdded).toHaveBeenCalledWith([
          expect.objectContaining({
            name: "test.jpg",
            type: "image/jpeg",
          }),
        ]);
      });
    });
  });

  describe("Preset Components", () => {
    it("should render SimpleUpload with simple preset", () => {
      render(
        <SimpleUpload cloudinary={mockCloudinary} onFilesAdded={vi.fn()} />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(5);
      expect(props.maxFileSize).toBe(5 * 1024 * 1024);
      expect(props.allowedTypes).toEqual(["image/*"]);
      expect(props.enableReorder).toBe(false);
      expect(props.enableResume).toBe(false);
    });

    it("should render GalleryUpload with gallery preset", () => {
      render(
        <GalleryUpload cloudinary={mockCloudinary} onFilesAdded={vi.fn()} />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(20);
      expect(props.maxFileSize).toBe(15 * 1024 * 1024);
      expect(props.allowedTypes).toEqual(["image/*", "video/*"]);
      expect(props.enableReorder).toBe(true);
      expect(props.enableResume).toBe(false);
    });

    it("should render DocumentUpload with documents preset", () => {
      render(
        <DocumentUpload cloudinary={mockCloudinary} onFilesAdded={vi.fn()} />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(10);
      expect(props.maxFileSize).toBe(25 * 1024 * 1024);
      expect(props.allowedTypes).toEqual([
        "application/pdf",
        "text/*",
        "application/*",
      ]);
      expect(props.showPreview).toBe(false);
      expect(props.enableReorder).toBe(false);
      expect(props.enableResume).toBe(true);
      expect(props.variant).toBe("minimal");
    });

    it("should render MediaUpload with media preset", () => {
      render(
        <MediaUpload cloudinary={mockCloudinary} onFilesAdded={vi.fn()} />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(50);
      expect(props.maxFileSize).toBe(100 * 1024 * 1024);
      expect(props.allowedTypes).toEqual(["image/*", "video/*", "audio/*"]);
      expect(props.enableReorder).toBe(true);
      expect(props.enableResume).toBe(true);
      expect(props.size).toBe("lg");
    });

    it("should render EnterpriseUpload with enterprise preset", () => {
      render(
        <EnterpriseUpload cloudinary={mockCloudinary} onFilesAdded={vi.fn()} />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(100);
      expect(props.maxFileSize).toBe(500 * 1024 * 1024);
      expect(props.allowedTypes).toEqual(["*/*"]);
      expect(props.enableReorder).toBe(true);
      expect(props.enableResume).toBe(true);
      expect(props.enableI18n).toBe(true);
      expect(props.variant).toBe("filled");
      expect(props.size).toBe("lg");
    });
  });

  describe("Configuration Merging", () => {
    it("should handle empty overrides", () => {
      render(
        <SmartDropzoneSimple
          preset="gallery"
          cloudinary={mockCloudinary}
          overrides={{}}
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      // Should use preset values
      expect(props.maxFiles).toBe(20);
      expect(props.maxFileSize).toBe(15 * 1024 * 1024);
    });

    it("should handle undefined overrides", () => {
      render(
        <SmartDropzoneSimple
          preset="gallery"
          cloudinary={mockCloudinary}
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      // Should use preset values
      expect(props.maxFiles).toBe(20);
      expect(props.maxFileSize).toBe(15 * 1024 * 1024);
    });

    it("should merge multiple override properties", () => {
      const overrides = {
        maxFiles: 40,
        maxFileSize: 50 * 1024 * 1024,
        showPreview: false,
        theme: "dark" as const,
      };

      render(
        <SmartDropzoneSimple
          preset="media"
          cloudinary={mockCloudinary}
          overrides={overrides}
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(40);
      expect(props.maxFileSize).toBe(50 * 1024 * 1024);
      expect(props.showPreview).toBe(false);
      expect(props.theme).toBe("dark");
      expect(props.enableReorder).toBe(true); // From preset
      expect(props.enableResume).toBe(true); // From preset
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing cloudinary config gracefully", () => {
      // This should not throw an error
      expect(() => {
        render(
          <SmartDropzoneSimple cloudinary={{} as any} onFilesAdded={vi.fn()} />
        );
      }).not.toThrow();
    });

    it("should handle invalid preset names gracefully", () => {
      // This should not throw an error
      expect(() => {
        render(
          <SmartDropzoneSimple
            preset={"invalid" as any}
            cloudinary={mockCloudinary}
            onFilesAdded={vi.fn()}
          />
        );
      }).not.toThrow();
    });

    it("should preserve readonly arrays in props", () => {
      const overrides = {
        allowedTypes: ["video/*", "audio/*"] as const,
      };

      render(
        <SmartDropzoneSimple
          preset="simple"
          cloudinary={mockCloudinary}
          overrides={overrides}
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.allowedTypes).toEqual(["video/*", "audio/*"]);
    });
  });

  describe("Integration Scenarios", () => {
    it("should work with all preset types in sequence", () => {
      const presets = [
        { Component: SimpleUpload, expectedFiles: 5 },
        { Component: GalleryUpload, expectedFiles: 20 },
        { Component: DocumentUpload, expectedFiles: 10 },
        { Component: MediaUpload, expectedFiles: 50 },
        { Component: EnterpriseUpload, expectedFiles: 100 },
      ];

      presets.forEach(({ Component, expectedFiles }) => {
        const { unmount } = render(
          <Component cloudinary={mockCloudinary} onFilesAdded={vi.fn()} />
        );

        const propsDisplay = screen.getByTestId("props-display");
        const props = JSON.parse(propsDisplay.textContent || "{}");

        expect(props.maxFiles).toBe(expectedFiles);
        expect(props.accessibility).toBe(true); // Always enabled

        unmount();
      });
    });

    it("should allow customization of preset components", () => {
      render(
        <GalleryUpload
          cloudinary={mockCloudinary}
          maxFiles={30} // Override preset
          theme="dark" // Override preset
          onFilesAdded={vi.fn()}
        />
      );

      const propsDisplay = screen.getByTestId("props-display");
      const props = JSON.parse(propsDisplay.textContent || "{}");

      expect(props.maxFiles).toBe(30); // Override
      expect(props.theme).toBe("dark"); // Override
      expect(props.maxFileSize).toBe(15 * 1024 * 1024); // From preset
      expect(props.enableReorder).toBe(true); // From preset
    });
  });
});
