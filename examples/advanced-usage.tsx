import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  SmartDropzone,
  FileItem,
  useUpload,
  UploadProvider,
  ProviderFactory,
  CloudinaryProvider,
  FilePreviewManager,
  DragReorderManager,
  UploadResumeManager,
  PerformanceMonitor,
  AccessibilityManager,
  InternationalizationManager,
  type UploadFile,
  type UploadOptions,
  type PreviewOptions,
  type DragReorderOptions,
  type ResumeOptions,
} from "smart-dropzone-react";

// Example 1: Basic Usage with Enhanced Features
export const BasicAdvancedExample: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [locale, setLocale] = useState<"en" | "es" | "fr" | "de" | "ja">("en");

  const handleFilesAdded = useCallback((newFiles: UploadFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileRemoved = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  return (
    <div
      className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Advanced Smart Dropzone</h1>
          <div className="flex items-center space-x-4">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark")}
              className="px-3 py-2 border rounded-md"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
            <select
              value={locale}
              onChange={(e) =>
                setLocale(e.target.value as "en" | "es" | "fr" | "de" | "ja")
              }
              className="px-3 py-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <SmartDropzone
          onFilesAdded={handleFilesAdded}
          onFileRemoved={handleFileRemoved}
          theme={theme}
          locale={locale}
          maxFiles={10}
          maxFileSize={50 * 1024 * 1024} // 50MB
          acceptedFileTypes={["image/*", "video/*", "application/pdf"]}
          enableDragReorder={true}
          enableResume={true}
          previewOptions={{
            maxWidth: 800,
            maxHeight: 600,
            quality: 0.9,
            format: "webp",
            generateThumbnail: true,
            thumbnailSize: 200,
          }}
          dragReorderOptions={{
            enableReordering: true,
            animationDuration: 300,
            snapToGrid: false,
            gridSize: 10,
          }}
          resumeOptions={{
            chunkSize: 1024 * 1024, // 1MB
            maxConcurrentChunks: 3,
            retryAttempts: 3,
            retryDelay: 1000,
          }}
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-400 transition-colors"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <FileItem
              key={file.id}
              file={file}
              theme={theme}
              onRemove={handleFileRemoved}
              showPreview={true}
              showProgress={true}
              showActions={true}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Example 2: Custom Provider Integration
export const CustomProviderExample: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const { uploadFiles, isUploading, progress } = useUpload();

  // Custom upload provider
  const customProvider: UploadProvider = {
    name: "custom",
    upload: async (file: File, options?: UploadOptions) => {
      // Simulate custom upload logic
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        url: `https://custom-provider.com/uploads/${file.name}`,
        fileId: `custom-${Date.now()}`,
        metadata: {
          provider: "custom",
          uploadedAt: new Date().toISOString(),
        },
      };
    },
  };

  useEffect(() => {
    // Register custom provider
    ProviderFactory.register("custom", customProvider);
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length > 0) {
      await uploadFiles(files, { provider: "custom" });
    }
  }, [files, uploadFiles]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Custom Provider Example</h2>

      <SmartDropzone
        onFilesAdded={setFiles}
        onFileRemoved={(fileId) =>
          setFiles((prev) => prev.filter((f) => f.id !== fileId))
        }
        maxFiles={5}
        className="border-2 border-dashed border-green-300 rounded-lg p-8"
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload with Custom Provider"}
          </button>

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Example 3: Advanced File Preview System
export const AdvancedPreviewExample: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [previewOptions, setPreviewOptions] = useState<PreviewOptions>({
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.9,
    format: "webp",
    generateThumbnail: true,
    thumbnailSize: 200,
  });

  const previewManager = FilePreviewManager.getInstance();

  const handlePreviewGenerated = useCallback(
    async (file: File) => {
      try {
        const preview = await previewManager.generatePreview(
          file,
          previewOptions
        );
        console.log("Generated preview:", preview);
      } catch (error) {
        console.error("Failed to generate preview:", error);
      }
    },
    [previewOptions, previewManager]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Advanced Preview System</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preview Options</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Max Width: {previewOptions.maxWidth}px
            </label>
            <input
              type="range"
              min="200"
              max="1200"
              step="50"
              value={previewOptions.maxWidth}
              onChange={(e) =>
                setPreviewOptions((prev) => ({
                  ...prev,
                  maxWidth: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Quality: {Math.round(previewOptions.quality! * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={previewOptions.quality}
              onChange={(e) =>
                setPreviewOptions((prev) => ({
                  ...prev,
                  quality: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Format</label>
            <select
              value={previewOptions.format}
              onChange={(e) =>
                setPreviewOptions((prev) => ({
                  ...prev,
                  format: e.target.value as "webp" | "jpeg" | "png",
                }))
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="webp">WebP</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={previewOptions.generateThumbnail}
                onChange={(e) =>
                  setPreviewOptions((prev) => ({
                    ...prev,
                    generateThumbnail: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span className="text-sm font-medium">Generate Thumbnails</span>
            </label>
          </div>
        </div>

        <div>
          <SmartDropzone
            onFilesAdded={setFiles}
            onFileRemoved={(fileId) =>
              setFiles((prev) => prev.filter((f) => f.id !== fileId))
            }
            maxFiles={5}
            acceptedFileTypes={["image/*", "video/*"]}
            onFileAdded={handlePreviewGenerated}
            className="border-2 border-dashed border-purple-300 rounded-lg p-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            showPreview={true}
            showProgress={false}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          />
        ))}
      </div>
    </div>
  );
};

// Example 4: Drag Reordering with Custom Logic
export const DragReorderExample: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isReorderingEnabled, setIsReorderingEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragReorderManager = useRef<DragReorderManager>();

  useEffect(() => {
    if (containerRef.current) {
      dragReorderManager.current = new DragReorderManager({
        enableReordering: isReorderingEnabled,
        animationDuration: 300,
        snapToGrid: false,
        gridSize: 10,
      });

      dragReorderManager.current.setContainer(containerRef.current);
    }

    return () => {
      dragReorderManager.current?.destroy();
    };
  }, [isReorderingEnabled]);

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (dragReorderManager.current) {
        const result = dragReorderManager.current.reorderItems(
          fromIndex,
          toIndex,
          files
        );
        if (result.success) {
          setFiles(result.newOrder);
        }
      }
    },
    [files]
  );

  const handleFilesAdded = useCallback((newFiles: UploadFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Drag & Drop Reordering</h2>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isReorderingEnabled}
            onChange={(e) => setIsReorderingEnabled(e.target.checked)}
            className="rounded"
          />
          <span>Enable Reordering</span>
        </label>
      </div>

      <SmartDropzone
        onFilesAdded={handleFilesAdded}
        onFileRemoved={(fileId) =>
          setFiles((prev) => prev.filter((f) => f.id !== fileId))
        }
        maxFiles={10}
        className="border-2 border-dashed border-orange-300 rounded-lg p-8"
      />

      <div
        ref={containerRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {files.map((file, index) => (
          <div
            key={file.id}
            className="bg-white rounded-lg shadow-md p-4 cursor-move hover:shadow-lg transition-shadow"
            draggable={isReorderingEnabled}
            onDragStart={() => {
              if (dragReorderManager.current) {
                dragReorderManager.current.registerItem(
                  file.id,
                  document.activeElement as HTMLElement
                );
              }
            }}
          >
            <FileItem
              file={file}
              showPreview={true}
              showProgress={false}
              className="w-full"
            />
            <div className="mt-2 text-sm text-gray-500 text-center">
              Position: {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 5: Resume Interrupted Uploads
export const ResumeUploadExample: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [resumeStates, setResumeStates] = useState<Map<string, any>>(new Map());
  const resumeManager = useRef<UploadResumeManager>();

  useEffect(() => {
    resumeManager.current = UploadResumeManager.getInstance();

    // Listen for progress events
    const handleProgress = (event: CustomEvent) => {
      const { fileId, progress, uploadedSize, totalSize } = event.detail;
      console.log(`Upload progress for ${fileId}: ${progress.toFixed(1)}%`);
    };

    document.addEventListener(
      "uploadProgress",
      handleProgress as EventListener
    );

    return () => {
      document.removeEventListener(
        "uploadProgress",
        handleProgress as EventListener
      );
    };
  }, []);

  const handleResumeUpload = useCallback(async (fileId: string) => {
    if (resumeManager.current) {
      const result = await resumeManager.current.resumeUpload(fileId, {});
      console.log("Resume result:", result);
    }
  }, []);

  const handlePauseUpload = useCallback((fileId: string) => {
    if (resumeManager.current) {
      resumeManager.current.pauseUpload(fileId);
    }
  }, []);

  const handleFilesAdded = useCallback(async (newFiles: UploadFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);

    // Create resume states for new files
    if (resumeManager.current) {
      for (const file of newFiles) {
        const resumeState = await resumeManager.current.createResumeState(
          file.nativeFile,
          "cloudinary"
        );
        setResumeStates((prev) => new Map(prev).set(file.id, resumeState));
      }
    }
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Resume Interrupted Uploads</h2>

      <SmartDropzone
        onFilesAdded={handleFilesAdded}
        onFileRemoved={(fileId) =>
          setFiles((prev) => prev.filter((f) => f.id !== fileId))
        }
        maxFiles={5}
        enableResume={true}
        className="border-2 border-dashed border-red-300 rounded-lg p-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => {
          const resumeState = resumeStates.get(file.id);
          const progress = resumeState
            ? resumeManager.current?.getUploadProgress(file.id) || 0
            : 0;

          return (
            <div
              key={file.id}
              className="bg-white rounded-lg shadow-md p-4 space-y-3"
            >
              <FileItem
                file={file}
                showPreview={true}
                showProgress={false}
                className="w-full"
              />

              {resumeState && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {progress.toFixed(1)}% - {resumeState.uploadedSize} /{" "}
                    {resumeState.totalSize} bytes
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResumeUpload(file.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => handlePauseUpload(file.id)}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Pause
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Example 6: Performance Monitoring and Optimization
export const PerformanceExample: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const performanceMonitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    // Start monitoring
    performanceMonitor.startRender();

    // Get metrics every 2 seconds
    const interval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    }, 2000);

    return () => {
      clearInterval(interval);
      performanceMonitor.reset();
    };
  }, [performanceMonitor]);

  const handlePerformanceTest = useCallback(() => {
    performanceMonitor.startRender();

    // Simulate some work
    setTimeout(() => {
      performanceMonitor.endRender();
      performanceMonitor.recordEvent("validation", { files: 5 });
      performanceMonitor.recordEvent("success", { files: 3 });
    }, 1000);
  }, [performanceMonitor]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Performance Monitoring</h2>

      <button
        onClick={handlePerformanceTest}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Run Performance Test
      </button>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Bundle Size</h3>
            <div className="text-sm space-y-1">
              <div>Raw: {(metrics.bundleSize.raw / 1024).toFixed(1)} KB</div>
              <div>
                Gzipped: {(metrics.bundleSize.gzipped / 1024).toFixed(1)} KB
              </div>
              <div>
                Minified: {(metrics.bundleSize.minified / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Runtime</h3>
            <div className="text-sm space-y-1">
              <div>Render: {metrics.runtime.renderTime.toFixed(2)}ms</div>
              <div>
                Upload Speed: {metrics.runtime.uploadSpeed.toFixed(2)} files/s
              </div>
              <div>
                Memory: {(metrics.runtime.memoryUsage * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">User Experience</h3>
            <div className="text-sm space-y-1">
              <div>
                TTI: {metrics.userExperience.timeToInteractive.toFixed(2)}ms
              </div>
              <div>
                Success Rate:{" "}
                {(metrics.userExperience.successRate * 100).toFixed(1)}%
              </div>
              <div>
                Error Rate:{" "}
                {(metrics.userExperience.errorRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Example 7: Accessibility and Internationalization
export const AccessibilityExample: React.FC = () => {
  const [accessibilityConfig, setAccessibilityConfig] = useState({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: true,
  });

  const [locale, setLocale] = useState<"en" | "es" | "fr" | "de" | "ja">("en");
  const accessibilityManager = AccessibilityManager.getInstance();
  const i18nManager = InternationalizationManager.getInstance();

  useEffect(() => {
    // Apply accessibility settings
    accessibilityManager.updateConfig(accessibilityConfig);

    // Set locale
    i18nManager.setLocale(locale);
  }, [accessibilityConfig, locale]);

  const translations = i18nManager.getTranslations();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">
        Accessibility & Internationalization
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Accessibility Settings</h3>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={accessibilityConfig.highContrast}
                onChange={(e) =>
                  setAccessibilityConfig((prev) => ({
                    ...prev,
                    highContrast: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span>High Contrast Mode</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={accessibilityConfig.reducedMotion}
                onChange={(e) =>
                  setAccessibilityConfig((prev) => ({
                    ...prev,
                    reducedMotion: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span>Reduced Motion</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={accessibilityConfig.largeText}
                onChange={(e) =>
                  setAccessibilityConfig((prev) => ({
                    ...prev,
                    largeText: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <span>Large Text</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Language Selection</h3>

          <select
            value={locale}
            onChange={(e) =>
              setLocale(e.target.value as "en" | "es" | "fr" | "de" | "ja")
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>

          <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="font-medium mb-2">
              Current Language: {translations.language}
            </h4>
            <p className="text-sm text-gray-600">
              {translations.dropzone.dropFilesHere}
            </p>
          </div>
        </div>
      </div>

      <SmartDropzone
        onFilesAdded={() => {}}
        onFileRemoved={() => {}}
        locale={locale}
        accessibility={accessibilityConfig}
        className="border-2 border-dashed border-indigo-300 rounded-lg p-8"
      />
    </div>
  );
};

// Main App Component
export const AdvancedExamplesApp: React.FC = () => {
  const [activeExample, setActiveExample] = useState<string>("basic");

  const examples = {
    basic: { title: "Basic Advanced", component: BasicAdvancedExample },
    custom: { title: "Custom Provider", component: CustomProviderExample },
    preview: { title: "Advanced Preview", component: AdvancedPreviewExample },
    reorder: { title: "Drag Reordering", component: DragReorderExample },
    resume: { title: "Resume Uploads", component: ResumeUploadExample },
    performance: { title: "Performance", component: PerformanceExample },
    accessibility: {
      title: "Accessibility & i18n",
      component: AccessibilityExample,
    },
  };

  const ActiveComponent =
    examples[activeExample as keyof typeof examples]?.component ||
    BasicAdvancedExample;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {Object.entries(examples).map(([key, { title }]) => (
              <button
                key={key}
                onClick={() => setActiveExample(key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeExample === key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="py-8">
        <ActiveComponent />
      </main>
    </div>
  );
};
