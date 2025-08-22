# 🚀 Smart Dropzone React - Cloudflare Workers & TanStack Start Guide

## Overview

This guide explains how to use the `smart-dropzone-react` package in a **TanStack Start** application hosted on **Cloudflare Workers** with **Cloudinary** integration.

## 🏗️ Architecture

```
TanStack Start App (Cloudflare Workers)
├── Server-side: Environment variables & bindings
├── Client-side: React components & upload logic
└── Cloudinary: File storage & processing
```

## 🔧 Setup

### 1. Install Package

```bash
npm install smart-dropzone-react@0.1.4
# or
pnpm add smart-dropzone-react@0.1.4
```

### 2. Cloudflare Workers Configuration

Add this to your `wrangler.toml`:

```toml
[env.production]
name = "your-app"
compatibility_flags = ["nodejs_compat_v2"]

[env.production.vars]
CLOUDINARY_CLOUD_NAME = "your-cloud-name"
CLOUDINARY_UPLOAD_PRESET = "ml_default"

[env.production.secret]
CLOUDINARY_API_KEY = "your-api-key"
CLOUDINARY_API_SECRET = "your-api-secret"
```

### 3. TanStack Start Server Loader

```tsx
// app/routes/upload-demo.tsx
import { createFileRoute } from "@tanstack/react-router";
import { getBindings } from "~/lib/cloudflare";

export const Route = createFileRoute("/upload-demo")({
  loader: async () => {
    const bindings = getBindings();

    return {
      cloudinaryConfig: {
        cloudName: bindings.CLOUDINARY_CLOUD_NAME,
        apiKey: bindings.CLOUDINARY_API_KEY,
        apiSecret: bindings.CLOUDINARY_API_SECRET,
        uploadPreset: bindings.CLOUDINARY_UPLOAD_PRESET || "ml_default",
      },
    };
  },
});
```

### 4. Client Component

```tsx
// app/routes/upload-demo.tsx (continued)
import { useLoaderData } from "@tanstack/react-router";
import {
  SmartDropzone,
  CloudinaryProvider,
  DemoComponent,
} from "smart-dropzone-react";

export default function UploadDemo() {
  const { cloudinaryConfig } = useLoaderData({ from: "/upload-demo" });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">File Upload Demo</h1>

      {/* Option 1: Use the demo component (recommended for testing) */}
      <DemoComponent cloudinaryConfig={cloudinaryConfig} />

      {/* Option 2: Manual implementation */}
      {/* <ManualUploadComponent config={cloudinaryConfig} /> */}
    </div>
  );
}
```

## 🧪 Testing & Debugging

### 1. Test Package Exports

Open browser console and run:

```javascript
// Test if package loaded correctly
window.testSmartDropzoneExports();

// Test CloudinaryProvider constructor
window.testCloudinaryProvider();
```

### 2. Check Console Logs

Look for these messages:

```
🚀 SmartDropzone React package loading...
✅ SmartDropzone React package loaded successfully!
🔧 CloudinaryProvider initialized with: {cloudName: "...", ...}
✅ CloudinaryProvider initialized successfully
```

### 3. Common Issues & Solutions

#### Issue: "Loading Cloudinary provider..." never completes

**Solution**: Check console for errors. Ensure `cloudName` is provided.

#### Issue: Package imports fail silently

**Solution**:

1. Verify package version is 0.1.4+
2. Check browser console for loading messages
3. Ensure no bundler conflicts

#### Issue: Cloudflare Workers compatibility

**Solution**:

1. Enable `nodejs_compat_v2` flag
2. Use `getBindings()` for environment access
3. Avoid Node.js specific APIs

## 🔍 Advanced Usage

### 1. Custom Upload Component

```tsx
import React from "react";
import { SmartDropzone, CloudinaryProvider } from "smart-dropzone-react";

function CustomUpload({ config }) {
  const [provider, setProvider] = React.useState(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    async function init() {
      const cloudinary = new CloudinaryProvider(config);
      await cloudinary.initialize();
      setProvider(cloudinary);
      setIsReady(true);
    }
    init();
  }, [config]);

  if (!isReady) return <div>Initializing...</div>;

  return (
    <SmartDropzone
      provider={provider}
      onUploadComplete={(files) => console.log("Uploaded:", files)}
      onUploadError={(error) => console.error("Error:", error)}
    />
  );
}
```

### 2. Environment Variable Access

```tsx
// lib/cloudflare.ts
export function getBindings() {
  // Access Cloudflare Workers bindings
  return {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
  };
}
```

### 3. Error Handling

```tsx
function UploadWithErrorHandling({ config }) {
  const [error, setError] = React.useState(null);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h3 className="text-red-800 font-medium">Upload Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <SmartDropzone
      provider={new CloudinaryProvider(config)}
      onUploadError={(err) => setError(err.message)}
    />
  );
}
```

## 📦 Package Structure

```
smart-dropzone-react@0.1.4
├── Main exports (index.js)
├── Components (SmartDropzone, FileItem, etc.)
├── Providers (CloudinaryProvider)
├── Hooks (useUpload)
└── Types & Utilities
```

## 🚀 Deployment

### 1. Build & Deploy

```bash
# Build your TanStack Start app
pnpm build

# Deploy to Cloudflare Workers
pnpm deploy
```

### 2. Environment Variables

Ensure these are set in Cloudflare Workers:

- `CLOUDINARY_CLOUD_NAME` (required)
- `CLOUDINARY_API_KEY` (optional, for server-side)
- `CLOUDINARY_API_SECRET` (optional, for server-side)
- `CLOUDINARY_UPLOAD_PRESET` (required)

### 3. CORS Configuration

If needed, configure CORS in your Cloudflare Workers:

```tsx
// Add to your worker
app.use(
  cors({
    origin: ["https://yourdomain.com"],
    credentials: true,
  })
);
```

## 🔧 Troubleshooting

### 1. Package Loading Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check package version
npm list smart-dropzone-react
```

### 2. Import Resolution

```tsx
// Try different import patterns
import { SmartDropzone } from "smart-dropzone-react";
// or
import SmartDropzone from "smart-dropzone-react/dist/components/smart-dropzone";
```

### 3. Cloudflare Workers Issues

- Check `wrangler.toml` configuration
- Verify environment variables are set
- Check worker logs in Cloudflare dashboard

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [TanStack Start Documentation](https://tanstack.com/start)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Package GitHub Repository](https://github.com/KHojreHarish/smart-dropzone-react)

## 🆘 Support

If you encounter issues:

1. Check browser console for error messages
2. Verify package version (should be 0.1.4+)
3. Test with the `DemoComponent` first
4. Check Cloudflare Workers logs
5. Open an issue on GitHub with detailed error information

---

**Version**: 0.1.4  
**Last Updated**: December 2024  
**Compatibility**: React 18+, TanStack Start, Cloudflare Workers
