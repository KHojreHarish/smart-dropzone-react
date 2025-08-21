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
export declare class PerformanceMonitor {
    private static instance;
    private events;
    private startTime;
    private renderStartTime;
    private uploadStartTimes;
    private constructor();
    static getInstance(): PerformanceMonitor;
    startRender(): void;
    endRender(): number;
    startUpload(fileId: string): void;
    endUpload(fileId: string, success: boolean): number;
    recordEvent(type: "render" | "upload" | "validation" | "error" | "success", metadata?: Record<string, any>): void;
    getMetrics(): PerformanceMetrics;
    private getBundleSize;
    private getMemoryUsage;
    private getCpuUsage;
    private getTimeToInteractive;
    private getFirstUploadTime;
    reset(): void;
    exportData(): Array<{
        type: "render" | "upload" | "validation" | "error" | "success";
        timestamp: number;
        duration?: number;
        metadata?: Record<string, any>;
    }>;
}
export declare class PerformanceOptimizer {
    static debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
    static throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
    static memoize<T extends (...args: any[]) => any>(func: T, keyGenerator?: (...args: Parameters<T>) => string): T;
    static retry<T>(operation: () => Promise<T>, options?: {
        maxAttempts?: number;
        delay?: number;
    }): Promise<T>;
}
//# sourceMappingURL=performance-monitor.d.ts.map