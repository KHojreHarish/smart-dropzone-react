---
name: 🐛 Bug Report
about: Create a report to help us improve
title: "[BUG] "
labels: ["bug", "needs-triage"]
assignees: ""
---

## 🐛 Bug Description

A clear and concise description of what the bug is.

## 🔄 Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## ✅ Expected Behavior

A clear and concise description of what you expected to happen.

## ❌ Actual Behavior

A clear and concise description of what actually happened.

## 📱 Environment

- **OS**: [e.g. Windows 11, macOS 14.0, Ubuntu 22.04]
- **Browser**: [e.g. Chrome 120, Firefox 121, Safari 17]
- **Package Version**: [e.g. 0.1.0]
- **React Version**: [e.g. 18.2.0]
- **Node Version**: [e.g. 20.10.0]

## 📋 Additional Context

Add any other context about the problem here.

## 🧪 Reproduction Code

```tsx
import { SimpleUpload } from "smart-dropzone-react";

function App() {
  return (
    <SimpleUpload
      cloudinary={{
        cloudName: "your-cloud-name",
        uploadPreset: "your-upload-preset",
      }}
      onFilesAdded={(files) => console.log("Files uploaded:", files)}
    />
  );
}
```

## 📸 Screenshots

If applicable, add screenshots to help explain your problem.

## 🔍 Console Errors

If there are console errors, please paste them here.

## 📝 Checklist

- [ ] I have searched existing issues to avoid duplicates
- [ ] I have provided all the requested information
- [ ] I can reproduce this issue consistently
- [ ] This is a bug in the package, not in my implementation
