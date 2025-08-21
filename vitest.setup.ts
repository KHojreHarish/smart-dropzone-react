import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Setup global test environment
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

// Mock Web APIs that may not be available in test environment
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock FileReader
global.FileReader = class FileReader extends EventTarget {
  readAsDataURL = vi.fn();
  readAsText = vi.fn();
  readAsArrayBuffer = vi.fn();
  abort = vi.fn();
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = FileReader.EMPTY;

  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;
};

// Mock File with arrayBuffer method
const OriginalFile = global.File;
global.File = class File extends OriginalFile {
  arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));
  stream = vi.fn();
  text = vi.fn().mockResolvedValue("file content");

  constructor(
    fileBits: BlobPart[],
    fileName: string,
    options?: FilePropertyBag
  ) {
    super(fileBits, fileName, options);
  }
} as any;

// Mock canvas methods
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  toDataURL: vi.fn(() => "data:image/png;base64,"),
  imageSmoothingEnabled: true,
  imageSmoothingQuality: "high",
});

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,");

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock crypto.subtle for checksums
Object.defineProperty(global, "crypto", {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

// Mock performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  },
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock HTMLMediaElement for video tests
Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
  get: vi.fn(() => 1920),
});

Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
  get: vi.fn(() => 1080),
});

Object.defineProperty(HTMLVideoElement.prototype, "duration", {
  get: vi.fn(() => 60),
});

HTMLVideoElement.prototype.load = vi.fn();

// Mock drag and drop events
const mockDataTransfer = {
  files: [],
  setData: vi.fn(),
  getData: vi.fn(),
  clearData: vi.fn(),
  dropEffect: "none",
  effectAllowed: "all",
};

global.DataTransfer = vi.fn().mockImplementation(() => mockDataTransfer);

// Mock DragEvent
global.DragEvent = class DragEvent extends Event {
  dataTransfer: DataTransfer | null;

  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict);
    this.dataTransfer = eventInitDict?.dataTransfer || new DataTransfer();
  }
} as any;

// Mock FileList
global.FileList = class FileList {
  length: number = 0;

  constructor(...files: File[]) {
    files.forEach((file, index) => {
      (this as any)[index] = file;
    });
    this.length = files.length;
  }

  item(index: number): File | null {
    return (this as any)[index] || null;
  }

  *[Symbol.iterator](): IterableIterator<File> {
    for (let i = 0; i < this.length; i++) {
      yield (this as any)[i];
    }
  }
} as any;

// Mock custom events
global.CustomEvent = class CustomEvent extends Event {
  detail: any;

  constructor(type: string, options?: CustomEventInit) {
    super(type, options);
    this.detail = options?.detail;
  }
} as any;
