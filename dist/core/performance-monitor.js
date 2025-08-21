export class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: performance.now()
        });
        Object.defineProperty(this, "renderStartTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "uploadStartTimes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
    startRender() {
        this.renderStartTime = performance.now();
    }
    endRender() {
        const duration = performance.now() - this.renderStartTime;
        this.events.push({
            type: "render",
            timestamp: Date.now(),
            duration,
        });
        return duration;
    }
    startUpload(fileId) {
        this.uploadStartTimes.set(fileId, performance.now());
    }
    endUpload(fileId, success) {
        const startTime = this.uploadStartTimes.get(fileId);
        if (!startTime)
            return 0;
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
    recordEvent(type, metadata) {
        this.events.push({
            type,
            timestamp: Date.now(),
            metadata,
        });
    }
    getMetrics() {
        const renderEvents = this.events.filter((e) => e.type === "render");
        const successEvents = this.events.filter((e) => e.type === "success");
        const errorEvents = this.events.filter((e) => e.type === "error");
        const avgRenderTime = renderEvents.length > 0
            ? renderEvents.reduce((sum, e) => sum + (e.duration || 0), 0) /
                renderEvents.length
            : 0;
        const avgUploadTime = successEvents.length > 0
            ? successEvents.reduce((sum, e) => sum + (e.duration || 0), 0) /
                successEvents.length
            : 0;
        const uploadSpeed = avgUploadTime > 0 ? 1000 / avgUploadTime : 0; // files per second
        const errorRate = this.events.length > 0 ? errorEvents.length / this.events.length : 0;
        const successRate = this.events.length > 0 ? successEvents.length / this.events.length : 0;
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
    getBundleSize() {
        // This would be calculated during build time
        // For now, return an estimated size based on typical React component
        return 40 * 1024; // 40KB estimated
    }
    getMemoryUsage() {
        if ("memory" in performance) {
            const memory = performance.memory;
            return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
        return 0;
    }
    getCpuUsage() {
        // CPU usage is difficult to measure in browsers
        // This is a simplified approximation
        return 0;
    }
    getTimeToInteractive() {
        const firstRender = this.events.find((e) => e.type === "render");
        return firstRender ? firstRender.timestamp - this.startTime : 0;
    }
    getFirstUploadTime() {
        const firstUpload = this.events.find((e) => e.type === "success");
        return firstUpload ? firstUpload.timestamp - this.startTime : 0;
    }
    reset() {
        this.events = [];
        this.startTime = performance.now();
        this.uploadStartTimes.clear();
    }
    exportData() {
        return [...this.events];
    }
}
// Performance optimization utilities
export class PerformanceOptimizer {
    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
    static throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }
    static memoize(func, keyGenerator) {
        const cache = new Map();
        return ((...args) => {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func(...args);
            cache.set(key, result);
            return result;
        });
    }
    static async retry(operation, options = {}) {
        const { maxAttempts = 3, delay = 1000 } = options;
        let lastError;
        for (let i = 0; i < maxAttempts; i++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (i < maxAttempts - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }
        throw lastError;
    }
}
//# sourceMappingURL=performance-monitor.js.map