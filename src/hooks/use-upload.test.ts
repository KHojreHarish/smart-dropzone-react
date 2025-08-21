import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUpload } from './use-upload';
import { MockProvider } from '../__mocks__/mock-provider';

describe('useUpload Hook', () => {
  let mockProvider: MockProvider;

  beforeEach(() => {
    mockProvider = new MockProvider('test-provider');
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useUpload(mockProvider));

      expect(result.current.files).toEqual([]);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.uploadProgress).toEqual({});
    });

    it('should initialize provider on mount', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('File Management', () => {
    it('should add files successfully', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await act(async () => {
        const addResult = await result.current.addFiles([mockFile]);
        expect(addResult.success).toBe(true);
        expect(addResult.files).toHaveLength(1);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].name).toBe('test.txt');
      expect(result.current.files[0].status).toBe('pending');
    });

    it('should remove files', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      // Add file first
      await act(async () => {
        await result.current.addFiles([mockFile]);
      });

      expect(result.current.files).toHaveLength(1);

      // Remove file
      act(() => {
        result.current.removeFile(result.current.files[0].id);
      });

      expect(result.current.files).toHaveLength(0);
    });

    it('should clear all files', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFiles = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
      ];

      // Add files first
      await act(async () => {
        await result.current.addFiles(mockFiles);
      });

      expect(result.current.files).toHaveLength(2);

      // Clear all
      act(() => {
        result.current.clearAll();
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.uploadProgress).toEqual({});
      expect(result.current.error).toBeNull();
    });
  });

  describe('File Validation', () => {
    it('should reject files exceeding max file size', async () => {
      const { result } = renderHook(() => 
        useUpload(mockProvider, { maxFileSize: 1000 })
      );
      
      const largeFile = new File(['x'.repeat(2000)], 'large.txt', { type: 'text/plain' });

      await act(async () => {
        const addResult = await result.current.addFiles([largeFile]);
        expect(addResult.success).toBe(false);
        expect(addResult.errors).toBeDefined();
        expect(addResult.errors![0]).toContain('too large');
      });
    });

    it('should reject files exceeding max files limit', async () => {
      const { result } = renderHook(() => 
        useUpload(mockProvider, { maxFiles: 2 })
      );
      
      const mockFiles = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
        new File(['test3'], 'test3.txt', { type: 'text/plain' }),
      ];

      await act(async () => {
        const addResult = await result.current.addFiles(mockFiles);
        expect(addResult.success).toBe(false);
        expect(addResult.errors).toBeDefined();
        expect(addResult.errors![0]).toContain('Maximum 2 files allowed');
      });
    });

    it('should reject files with invalid types', async () => {
      const { result } = renderHook(() => 
        useUpload(mockProvider, { allowedTypes: ['image/*'] })
      );
      
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      await act(async () => {
        const addResult = await result.current.addFiles([textFile]);
        expect(addResult.success).toBe(false);
        expect(addResult.errors).toBeDefined();
        expect(addResult.errors![0]).toContain('not allowed');
      });
    });
  });

  describe('Upload Operations', () => {
    it('should upload single file successfully', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      // Add file first
      await act(async () => {
        await result.current.addFiles([mockFile]);
      });

      const fileId = result.current.files[0].id;

      // Upload file
      await act(async () => {
        const uploadResult = await result.current.uploadFile(fileId);
        expect(uploadResult).toBeDefined();
        expect(uploadResult.filename).toBe('test.txt');
      });

      // Check file status updated
      const updatedFile = result.current.files.find(f => f.id === fileId);
      expect(updatedFile?.status).toBe('success');
      expect(updatedFile?.progress).toBe(100);
    });

    it('should upload all pending files', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFiles = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
      ];

      // Add files first
      await act(async () => {
        await result.current.addFiles(mockFiles);
      });

      expect(result.current.pendingFiles).toHaveLength(2);

      // Upload all
      await act(async () => {
        const uploadResults = await result.current.uploadAll();
        expect(uploadResults).toHaveLength(2);
      });

      // Check all files are uploaded
      expect(result.current.successFiles).toHaveLength(2);
      expect(result.current.pendingFiles).toHaveLength(0);
    });

    it('should retry failed uploads', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      // Add file first
      await act(async () => {
        await result.current.addFiles([mockFile]);
      });

      const fileId = result.current.files[0].id;

      // Simulate failed upload by setting error status
      act(() => {
        result.current.files[0].status = 'error';
        result.current.files[0].error = 'Upload failed';
      });

      // Retry upload
      await act(async () => {
        const retryResult = await result.current.retryUpload(fileId);
        expect(retryResult).toBeDefined();
      });

      // Check file status updated
      const updatedFile = result.current.files.find(f => f.id === fileId);
      expect(updatedFile?.status).toBe('success');
    });
  });

  describe('Progress Tracking', () => {
    it('should track upload progress', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      // Add file first
      await act(async () => {
        await result.current.addFiles([mockFile]);
      });

      const fileId = result.current.files[0].id;

      // Upload file
      await act(async () => {
        await result.current.uploadFile(fileId);
      });

      // Check progress is tracked
      expect(result.current.uploadProgress[fileId]).toBe(100);
    });
  });

  describe('Computed Values', () => {
    it('should calculate file statistics correctly', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFiles = [
        new File(['test1'], 'test1.txt', { type: 'text/plain' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }),
      ];

      // Add files first
      await act(async () => {
        await result.current.addFiles(mockFiles);
      });

      expect(result.current.hasFiles).toBe(true);
      expect(result.current.hasPendingFiles).toBe(true);
      expect(result.current.pendingFiles).toHaveLength(2);
      expect(result.current.totalSize).toBe(10); // 5 + 5
    });
  });

  describe('Error Handling', () => {
    it('should handle provider initialization errors', async () => {
      // Create a provider that fails to initialize
      const failingProvider = new MockProvider('failing-provider');
      vi.spyOn(failingProvider, 'initialize').mockRejectedValue(new Error('Init failed'));

      const { result } = renderHook(() => useUpload(failingProvider));

      await waitFor(() => {
        expect(result.current.error).toContain('Init failed');
      });
    });

    it('should handle upload errors gracefully', async () => {
      const { result } = renderHook(() => useUpload(mockProvider));
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      // Add file first
      await act(async () => {
        await result.current.addFiles([mockFile]);
      });

      const fileId = result.current.files[0].id;

      // Mock upload failure
      vi.spyOn(mockProvider, 'uploadFile').mockRejectedValue(new Error('Upload failed'));

      // Attempt upload
      await act(async () => {
        try {
          await result.current.uploadFile(fileId);
        } catch (error) {
          // Expected to fail
        }
      });

      // Check error is set
      expect(result.current.error).toContain('Upload failed');
      
      // Check file status is error
      const failedFile = result.current.files.find(f => f.id === fileId);
      expect(failedFile?.status).toBe('error');
    });
  });
});
