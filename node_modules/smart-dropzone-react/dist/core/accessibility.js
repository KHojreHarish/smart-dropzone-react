export class AccessibilityManager {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "theme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isHighContrast", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isReducedMotion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isLargeText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.config = {
            enableHighContrast: true,
            enableScreenReader: true,
            enableKeyboardNavigation: true,
            enableFocusIndicators: true,
            enableReducedMotion: true,
            enableLargeText: true,
            enableColorBlindSupport: true,
            ...config,
        };
        this.theme = {
            highContrast: { ...AccessibilityManager.DEFAULT_HIGH_CONTRAST },
            reducedMotion: { ...AccessibilityManager.DEFAULT_REDUCED_MOTION },
            largeText: { ...AccessibilityManager.DEFAULT_LARGE_TEXT },
        };
        this.initialize();
    }
    static getInstance(config) {
        if (!AccessibilityManager.instance) {
            AccessibilityManager.instance = new AccessibilityManager(config);
        }
        return AccessibilityManager.instance;
    }
    initialize() {
        this.detectUserPreferences();
        this.setupEventListeners();
        this.applyAccessibilityFeatures();
    }
    detectUserPreferences() {
        // Use configuration values if they are explicitly set, otherwise detect from system
        if (this.config.enableHighContrast !== undefined) {
            this.isHighContrast = this.config.enableHighContrast;
        }
        else {
            this.isHighContrast = this.detectHighContrastPreference();
        }
        if (this.config.enableReducedMotion !== undefined) {
            this.isReducedMotion = this.config.enableReducedMotion;
        }
        else {
            this.isReducedMotion = this.detectReducedMotionPreference();
        }
        if (this.config.enableLargeText !== undefined) {
            this.isLargeText = this.config.enableLargeText;
        }
        else {
            this.isLargeText = this.detectLargeTextPreference();
        }
    }
    detectHighContrastPreference() {
        // Check for high contrast media query
        if (window.matchMedia) {
            return window.matchMedia("(prefers-contrast: high)").matches;
        }
        return false;
    }
    detectReducedMotionPreference() {
        // Check for reduced motion media query
        if (window.matchMedia) {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }
        return false;
    }
    detectLargeTextPreference() {
        // Check for large text preference
        if (window.matchMedia) {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }
        return false;
    }
    setupEventListeners() {
        // Listen for preference changes
        if (window.matchMedia) {
            const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
            const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
            highContrastQuery.addEventListener("change", (e) => {
                this.isHighContrast = e.matches;
                this.applyAccessibilityFeatures();
            });
            reducedMotionQuery.addEventListener("change", (e) => {
                this.isReducedMotion = e.matches;
                this.applyAccessibilityFeatures();
            });
        }
        // Listen for keyboard navigation
        if (this.config.enableKeyboardNavigation) {
            document.addEventListener("keydown", this.handleKeyboardNavigation.bind(this));
        }
    }
    handleKeyboardNavigation(event) {
        const target = event.target;
        // Skip if target is not in our dropzone
        if (!target.closest("[data-dropzone]")) {
            return;
        }
        switch (event.key) {
            case "Tab":
                this.handleTabNavigation(event);
                break;
            case "Enter":
            case " ":
                this.handleActivation(event);
                break;
            case "Escape":
                this.handleEscape(event);
                break;
            case "ArrowUp":
            case "ArrowDown":
                this.handleArrowNavigation(event);
                break;
        }
    }
    handleTabNavigation(event) {
        // Ensure focus indicators are visible
        if (this.config.enableFocusIndicators) {
            this.showFocusIndicator(event.target);
        }
    }
    handleActivation(event) {
        const target = event.target;
        // Handle different types of interactive elements
        if (target.hasAttribute("data-file-item")) {
            this.activateFileItem(target);
        }
        else if (target.hasAttribute("data-upload-button")) {
            this.activateUploadButton(target);
        }
        else if (target.hasAttribute("data-clear-button")) {
            this.activateClearButton(target);
        }
    }
    handleEscape(event) {
        // Close any open modals or focus on main dropzone
        const dropzone = event.target.closest("[data-dropzone]");
        if (dropzone) {
            dropzone.focus();
        }
    }
    handleArrowNavigation(event) {
        const target = event.target;
        const fileItems = Array.from(target.closest("[data-dropzone]")?.querySelectorAll("[data-file-item]") ||
            []);
        if (fileItems.length === 0)
            return;
        const currentIndex = fileItems.findIndex((item) => item === target);
        if (currentIndex === -1)
            return;
        let nextIndex;
        if (event.key === "ArrowDown") {
            nextIndex = (currentIndex + 1) % fileItems.length;
        }
        else {
            nextIndex = currentIndex === 0 ? fileItems.length - 1 : currentIndex - 1;
        }
        fileItems[nextIndex].focus();
    }
    activateFileItem(element) {
        // Simulate click on file item
        element.click();
    }
    activateUploadButton(element) {
        // Simulate click on upload button
        element.click();
    }
    activateClearButton(element) {
        // Simulate click on clear button
        element.click();
    }
    showFocusIndicator(element) {
        // Add focus indicator styles
        element.style.outline = `2px solid ${this.theme.highContrast.focus}`;
        element.style.outlineOffset = "2px";
        // Remove focus indicator after a delay
        setTimeout(() => {
            element.style.outline = "";
            element.style.outlineOffset = "";
        }, 3000);
    }
    applyAccessibilityFeatures() {
        this.applyHighContrast();
        this.applyReducedMotion();
        this.applyLargeText();
        this.applyScreenReaderSupport();
    }
    applyHighContrast() {
        if (!this.isHighContrast)
            return;
        const root = document.documentElement;
        const theme = this.theme.highContrast;
        // Apply high contrast CSS variables
        root.style.setProperty("--ac-primary-color", theme.primary);
        root.style.setProperty("--ac-secondary-color", theme.secondary);
        root.style.setProperty("--ac-background-color", theme.background);
        root.style.setProperty("--ac-text-color", theme.text);
        root.style.setProperty("--ac-border-color", theme.border);
        root.style.setProperty("--ac-focus-color", theme.focus);
        root.style.setProperty("--ac-error-color", theme.error);
        root.style.setProperty("--ac-success-color", theme.success);
        root.style.setProperty("--ac-warning-color", theme.warning);
        // Add high contrast class
        document.body.classList.add("ac-high-contrast");
    }
    applyReducedMotion() {
        if (!this.isReducedMotion)
            return;
        const root = document.documentElement;
        const theme = this.theme.reducedMotion;
        // Apply reduced motion CSS variables
        root.style.setProperty("--ac-transition-duration", theme.transitionDuration);
        root.style.setProperty("--ac-animation-duration", theme.animationDuration);
        // Add reduced motion class
        document.body.classList.add("ac-reduced-motion");
    }
    applyLargeText() {
        if (!this.isLargeText)
            return;
        const root = document.documentElement;
        const theme = this.theme.largeText;
        // Apply large text CSS variables
        root.style.setProperty("--ac-font-size", theme.fontSize);
        root.style.setProperty("--ac-line-height", theme.lineHeight);
        root.style.setProperty("--ac-spacing", theme.spacing);
        // Add large text class
        document.body.classList.add("ac-large-text");
    }
    applyScreenReaderSupport() {
        if (!this.config.enableScreenReader)
            return;
        // Add ARIA labels and descriptions
        this.addAriaLabels();
        this.addAriaDescriptions();
        this.addAriaLiveRegions();
    }
    addAriaLabels() {
        // Add ARIA labels to interactive elements
        const dropzones = document.querySelectorAll("[data-dropzone]");
        dropzones.forEach((dropzone, index) => {
            const dropzoneElement = dropzone;
            dropzoneElement.setAttribute("aria-label", `File upload area ${index + 1}`);
            dropzoneElement.setAttribute("aria-describedby", `dropzone-description-${index + 1}`);
        });
        const fileItems = document.querySelectorAll("[data-file-item]");
        fileItems.forEach((item, index) => {
            const itemElement = item;
            const fileName = itemElement.getAttribute("data-file-name") || `File ${index + 1}`;
            itemElement.setAttribute("aria-label", `${fileName}, click to view details`);
        });
    }
    addAriaDescriptions() {
        // Add ARIA descriptions
        const dropzones = document.querySelectorAll("[data-dropzone]");
        dropzones.forEach((dropzone, index) => {
            const descriptionId = `dropzone-description-${index + 1}`;
            const description = document.createElement("div");
            description.id = descriptionId;
            description.setAttribute("aria-hidden", "true");
            description.style.position = "absolute";
            description.style.left = "-10000px";
            description.style.width = "1px";
            description.style.height = "1px";
            description.style.overflow = "hidden";
            description.textContent =
                "Drag and drop files here or click to browse. Supported formats: images, PDFs, and text files.";
            dropzone.appendChild(description);
        });
    }
    addAriaLiveRegions() {
        // Add ARIA live regions for dynamic content
        const liveRegion = document.createElement("div");
        liveRegion.setAttribute("aria-live", "polite");
        liveRegion.setAttribute("aria-atomic", "false");
        liveRegion.setAttribute("aria-relevant", "additions removals");
        liveRegion.style.position = "absolute";
        liveRegion.style.left = "-10000px";
        liveRegion.style.width = "1px";
        liveRegion.style.height = "1px";
        liveRegion.style.overflow = "hidden";
        document.body.appendChild(liveRegion);
    }
    // Public methods for external control
    updateConfig(newConfig) {
        // Handle both configuration formats
        if ("highContrast" in newConfig ||
            "reducedMotion" in newConfig ||
            "largeText" in newConfig ||
            "screenReader" in newConfig) {
            // Legacy format from tests
            const legacyConfig = newConfig;
            this.config = {
                ...this.config,
                enableHighContrast: legacyConfig.highContrast ?? this.config.enableHighContrast,
                enableReducedMotion: legacyConfig.reducedMotion ?? this.config.enableReducedMotion,
                enableLargeText: legacyConfig.largeText ?? this.config.enableLargeText,
                enableScreenReader: legacyConfig.screenReader ?? this.config.enableScreenReader,
            };
            // Also update internal state properties
            if (legacyConfig.highContrast !== undefined) {
                this.isHighContrast = legacyConfig.highContrast;
            }
            if (legacyConfig.reducedMotion !== undefined) {
                this.isReducedMotion = legacyConfig.reducedMotion;
            }
            if (legacyConfig.largeText !== undefined) {
                this.isLargeText = legacyConfig.largeText;
            }
        }
        else {
            // New format
            this.config = { ...this.config, ...newConfig };
        }
        this.initialize();
    }
    getConfig() {
        // Return legacy format for backward compatibility with tests
        return {
            highContrast: this.isHighContrast,
            reducedMotion: this.isReducedMotion,
            largeText: this.isLargeText,
            screenReader: this.config.enableScreenReader,
        };
    }
    generateAriaLabel(action, options) {
        let label = action;
        if (options.maxFiles) {
            label += `, maximum ${options.maxFiles} files`;
        }
        if (options.acceptedTypes) {
            label += `, accepted types: ${options.acceptedTypes.join(", ")}`;
        }
        return label;
    }
    enableHighContrast() {
        this.isHighContrast = true;
        this.applyAccessibilityFeatures();
    }
    disableHighContrast() {
        this.isHighContrast = false;
        this.applyAccessibilityFeatures();
    }
    enableReducedMotion() {
        this.isReducedMotion = true;
        this.applyAccessibilityFeatures();
    }
    disableReducedMotion() {
        this.isReducedMotion = false;
        this.applyAccessibilityFeatures();
    }
    enableLargeText() {
        this.isLargeText = true;
        this.applyAccessibilityFeatures();
    }
    disableLargeText() {
        this.isLargeText = false;
        this.applyAccessibilityFeatures();
    }
    updateTheme(newTheme) {
        this.theme = { ...this.theme, ...newTheme };
        this.applyAccessibilityFeatures();
    }
    getStatus() {
        return {
            isHighContrast: this.isHighContrast,
            isReducedMotion: this.isReducedMotion,
            isLargeText: this.isLargeText,
            isScreenReaderEnabled: this.config.enableScreenReader,
            isKeyboardNavigationEnabled: this.config.enableKeyboardNavigation,
        };
    }
    announceToScreenReader(message) {
        if (!this.config.enableScreenReader)
            return;
        const liveRegion = document.querySelector('[aria-live="polite"]');
        if (liveRegion) {
            liveRegion.textContent = message;
            // Clear the message after a delay
            setTimeout(() => {
                liveRegion.textContent = "";
            }, 3000);
        }
    }
}
// Default high contrast theme
Object.defineProperty(AccessibilityManager, "DEFAULT_HIGH_CONTRAST", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        primary: "#ffffff",
        secondary: "#000000",
        background: "#000000",
        text: "#ffffff",
        border: "#ffffff",
        focus: "#ffff00",
        error: "#ff0000",
        success: "#00ff00",
        warning: "#ffff00",
    }
});
// Default reduced motion theme
Object.defineProperty(AccessibilityManager, "DEFAULT_REDUCED_MOTION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        transitionDuration: "0.1s",
        animationDuration: "0.1s",
    }
});
// Default large text theme
Object.defineProperty(AccessibilityManager, "DEFAULT_LARGE_TEXT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: {
        fontSize: "18px",
        lineHeight: "1.5",
        spacing: "1.2em",
    }
});
//# sourceMappingURL=accessibility.js.map