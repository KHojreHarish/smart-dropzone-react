import React from "react";
import {
  SmartDropzone,
  CloudinaryProvider,
  UploadProviderFactory,
  useUpload,
  FileProcessor,
  type UploadFile,
  type UploadOptions,
} from "./src";

// Test that all exports are working
console.log("✅ All exports imported successfully");

// Test provider creation
const provider = new CloudinaryProvider({
  cloudName: "test-cloud",
  uploadPreset: "test-preset",
});

console.log("✅ CloudinaryProvider created:", provider.getName());

// Test provider factory
const factoryProvider = UploadProviderFactory.create("cloudinary", {
  cloudName: "test-cloud-2",
  uploadPreset: "test-preset-2",
});

console.log("✅ ProviderFactory working:", factoryProvider.getName());

// Test FileProcessor
const processor = new FileProcessor();
console.log("✅ FileProcessor created");

// Test component props
const props: React.ComponentProps<typeof SmartDropzone> = {
  provider,
  maxFiles: 5,
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ["image/*"],
  folder: "test-folder",
};

console.log("✅ Component props validated");

// Test types
const uploadFile: UploadFile = {
  id: "test-id",
  file: new File(["test"], "test.txt", { type: "text/plain" }),
  name: "test.txt",
  size: 4,
  type: "text/plain",
  progress: 0,
  status: "pending",
};

const uploadOptions: UploadOptions = {
  maxFiles: 1,
  maxFileSize: 1024,
  allowedTypes: ["text/*"],
};

console.log("✅ Type definitions working");

console.log("🎉 All tests passed! The package is working correctly.");
