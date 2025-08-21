import React from 'react';
import { SmartDropzone, CloudinaryProvider, UploadProviderFactory, useUpload, FileProcessor } from '../src';

// Example 1: Basic Cloudinary usage
export const BasicCloudinaryExample: React.FC = () => {
  const cloudinaryProvider = new CloudinaryProvider({
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-upload-preset',
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Basic Cloudinary Upload</h2>
      <SmartDropzone
        provider={cloudinaryProvider}
        maxFiles={5}
        maxFileSize={5 * 1024 * 1024} // 5MB
        allowedTypes={['image/*', 'application/pdf']}
        folder="example-uploads"
        onFilesSelected={(files) => console.log('Files selected:', files)}
        onUploadComplete={(files) => console.log('Upload complete:', files)}
        onValidationError={(error) => console.error('Validation error:', error)}
      />
    </div>
  );
};

// Example 2: Using provider factory
export const ProviderFactoryExample: React.FC = () => {
  const provider = UploadProviderFactory.create('cloudinary', {
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-upload-preset',
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Provider Factory Example</h2>
      <SmartDropzone
        provider={provider}
        theme="dark"
        variant="filled"
        size="lg"
        showPreview={true}
        showProgress={true}
        showFileSize={true}
        showFileType={true}
        maxFiles={10}
        maxFileSize={10 * 1024 * 1024} // 10MB
        allowedTypes={['image/*', 'video/*', 'application/pdf']}
        folder="factory-example"
        onFilesSelected={(files) => console.log('Files selected:', files)}
        onUploadComplete={(files) => console.log('Upload complete:', files)}
        onValidationError={(error) => console.error('Validation error:', error)}
      />
    </div>
  );
};

// Example 3: Custom configuration
export const CustomConfigExample: React.FC = () => {
  const provider = new CloudinaryProvider({
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-upload-preset',
    defaultFolder: 'custom-config',
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Custom Configuration</h2>
      <SmartDropzone
        provider={provider}
        theme="light"
        variant="minimal"
        size="sm"
        maxFiles={3}
        maxFileSize={2 * 1024 * 1024} // 2MB
        allowedTypes={['image/*']}
        folder="custom-folder"
        disabled={false}
        multiple={true}
        noClick={false}
        noDrag={false}
        preventDropOnDocument={true}
        onFilesSelected={(files) => {
          console.log('Files selected:', files);
          // Custom logic here
        }}
        onUploadComplete={(files) => {
          console.log('Upload complete:', files);
          // Custom logic here
        }}
        onValidationError={(error) => {
          console.error('Validation error:', error);
          // Custom error handling
        }}
      />
    </div>
  );
};

// Example 4: Multiple dropzones with different providers
export const MultipleDropzonesExample: React.FC = () => {
  const cloudinaryProvider = new CloudinaryProvider({
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-upload-preset',
  });

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Multiple Dropzones</h2>
      
      {/* Images only */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Image Uploads</h3>
        <SmartDropzone
          provider={cloudinaryProvider}
          maxFiles={10}
          maxFileSize={5 * 1024 * 1024}
          allowedTypes={['image/*']}
          folder="images"
          theme="light"
          variant="outlined"
        />
      </div>

      {/* Documents only */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Document Uploads</h3>
        <SmartDropzone
          provider={cloudinaryProvider}
          maxFiles={5}
          maxFileSize={10 * 1024 * 1024}
          allowedTypes={['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
          folder="documents"
          theme="dark"
          variant="filled"
        />
      </div>

      {/* Videos only */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Video Uploads</h3>
        <SmartDropzone
          provider={cloudinaryProvider}
          maxFiles={3}
          maxFileSize={100 * 1024 * 1024} // 100MB
          allowedTypes={['video/*']}
          folder="videos"
          theme="light"
          variant="minimal"
        />
      </div>
    </div>
  );
};

// Example 5: Using the hook directly
export const HookUsageExample: React.FC = () => {
  const provider = new CloudinaryProvider({
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-upload-preset',
  });

  const {
    files,
    isUploading,
    error,
    uploadProgress,
    addFiles,
    removeFile,
    clearAll,
    uploadAll,
    retryUpload,
    hasFiles,
    hasPendingFiles,
  } = useUpload(provider, {
    maxFiles: 5,
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/*'],
    folder: 'hook-example',
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      addFiles(Array.from(selectedFiles));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Hook Usage Example</h2>
      
      <div className="space-y-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {hasFiles && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Files: {files.length}</span>
              <div className="space-x-2">
                <button
                  onClick={uploadAll}
                  disabled={!hasPendingFiles || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload All'}
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Clear All
                </button>
              </div>
            </div>

            {files.map((file) => (
              <div key={file.id} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Status: {file.status} • Size: {FileProcessor.formatFileSize(file.size)}
                </div>
                {file.status === 'error' && (
                  <button
                    onClick={() => retryUpload(file.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Retry
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
