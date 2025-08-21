export interface PerformanceMetrics {
  bundleSize: {
    raw: number;
    gzipped: number;
    minified: number;
  };
  runtime: {
    renderTime: number;
    uploadSpeed: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  userExperience: {
    timeToInteractive: number;
    firstUploadTime: number;
    errorRate: number;
    successRate: number;
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private events: Array<{
    type: "render" | "upload" | "validation" | "error" | "success";
    timestamp: number;
    duration?: number;
    metadata?: Record<string, any>;
  }> = [];
  private startTime: number = performance.now();
  private renderStartTime: number = 0;
  private uploadStartTimes: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startRender(): void {
    this.renderStartTime = performance.now();
  }

  endRender(): number {
    const duration = performance.now() - this.renderStartTime;
    this.events.push({
      type: "render",
      timestamp: Date.now(),
      duration,
    });
    return duration;
  }

  startUpload(fileId: string): void {
    this.uploadStartTimes.set(fileId, performance.now());
  }

  endUpload(fileId: string, success: boolean): number {
    const startTime = this.uploadStartTimes.get(fileId);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.uploadStartTimes.delete(fileId);

    this.events.push({
      type: success ? "success" : "error",
      timestamp: Date.now(),
      duration,
      metadata: { fileId, success },
    });

    return duration;
  }

  recordEvent(
    type: "render" | "upload" | "validation" | "error" | "success",
    metadata?: Record<string, any>
  ): void {
    this.events.push({
      type,
      timestamp: Date.now(),
      metadata,
    });
  }

  getMetrics(): PerformanceMetrics {
    const renderEvents = this.events.filter((e) => e.type === "render");
    const successEvents = this.events.filter((e) => e.type === "success");
    const errorEvents = this.events.filter((e) => e.type === "error");

    const avgRenderTime =
      renderEvents.length > 0
        ? renderEvents.reduce((sum, e) => sum + (e.duration || 0), 0) /
          renderEvents.length
        : 0;

    const avgUploadTime =
      successEvents.length > 0
        ? successEvents.reduce((sum, e) => sum + (e.duration || 0), 0) /
          successEvents.length
        : 0;

    const uploadSpeed = avgUploadTime > 0 ? 1000 / avgUploadTime : 0; // files per second
    const errorRate =
      this.events.length > 0 ? errorEvents.length / this.events.length : 0;
    const successRate =
      this.events.length > 0 ? successEvents.length / this.events.length : 0;

    return {
      bundleSize: {
        raw: this.getBundleSize(),
        gzipped: this.getBundleSize() * 0.3, // Approximate gzip ratio
        minified: this.getBundleSize() * 0.7, // Approximate minification ratio
      },
      runtime: {
        renderTime: avgRenderTime,
        uploadSpeed,
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage(),
      },
      userExperience: {
        timeToInteractive: this.getTimeToInteractive(),
        firstUploadTime: this.getFirstUploadTime(),
        errorRate,
        successRate,
      },
    };
  }

  private getBundleSize(): number {
    // This would be calculated during build time
    // For now, return an estimated size based on typical React component
    return 40 * 1024; // 40KB estimated
  }

  private getMemoryUsage(): number {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }

  private getCpuUsage(): number {
    // CPU usage is difficult to measure in browsers
    // This is a simplified approximation
    return 0;
  }

  private getTimeToInteractive(): number {
    const firstRender = this.events.find((e) => e.type === "render");
    return firstRender ? firstRender.timestamp - this.startTime : 0;
  }

  private getFirstUploadTime(): number {
    const firstUpload = this.events.find((e) => e.type === "success");
    return firstUpload ? firstUpload.timestamp - this.startTime : 0;
  }

  reset(): void {
    this.events = [];
    this.startTime = performance.now();
    this.uploadStartTimes.clear();
  }

  exportData(): Array<{
    type: "render" | "upload" | "validation" | "error" | "success";
    timestamp: number;
    duration?: number;
    metadata?: Record<string, any>;
  }> {
    return [...this.events];
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static memoize<T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  static async retry<T>(
    operation: () => Promise<T>,
    options: { maxAttempts?: number; delay?: number } = {}
  ): Promise<T> {
    const { maxAttempts = 3, delay = 1000 } = options;
    let lastError: Error;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxAttempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(2, i))
          );
        }
      }
    }

    throw lastError!;
  }
}
