/**
 * Abstract base class for all upload providers
 * This allows for easy switching between different upload services
 */
export class UploadProvider {
    constructor(name, config = {}) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = name;
        this.config = config;
    }
    /**
     * Get the provider name
     */
    getName() {
        return this.name;
    }
    /**
     * Get the provider configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Clean up resources
     */
    async cleanup() {
        // Default implementation does nothing
    }
}
/**
 * Provider factory for creating provider instances
 */
export class ProviderFactory {
    /**
     * Register a provider class
     */
    static register(name, providerClass) {
        this.providers.set(name, providerClass);
    }
    /**
     * Create a provider instance
     */
    static create(name, config) {
        const ProviderClass = this.providers.get(name);
        if (!ProviderClass) {
            throw new Error(`Provider '${name}' not found. Available providers: ${Array.from(this.providers.keys()).join(", ")}`);
        }
        return new ProviderClass(config);
    }
    /**
     * Get list of available providers
     */
    static getAvailableProviders() {
        return Array.from(this.providers.keys());
    }
}
Object.defineProperty(ProviderFactory, "providers", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: new Map()
});
//# sourceMappingURL=provider.js.map