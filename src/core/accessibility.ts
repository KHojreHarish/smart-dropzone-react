export interface AccessibilityConfig {
  enableHighContrast: boolean;
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  enableFocusIndicators: boolean;
  enableReducedMotion: boolean;
  enableLargeText: boolean;
  enableColorBlindSupport: boolean;
}

export interface AccessibilityTheme {
  highContrast: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
  };
  reducedMotion: {
    transitionDuration: string;
    animationDuration: string;
  };
  largeText: {
    fontSize: string;
    lineHeight: string;
    spacing: string;
  };
}

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig;
  private theme: AccessibilityTheme;
  private isHighContrast: boolean = false;
  private isReducedMotion: boolean = false;
  private isLargeText: boolean = false;

  // Default high contrast theme
  private static readonly DEFAULT_HIGH_CONTRAST: AccessibilityTheme["highContrast"] =
    {
      primary: "#ffffff",
      secondary: "#000000",
      background: "#000000",
      text: "#ffffff",
      border: "#ffffff",
      focus: "#ffff00",
      error: "#ff0000",
      success: "#00ff00",
      warning: "#ffff00",
    };

  // Default reduced motion theme
  private static readonly DEFAULT_REDUCED_MOTION: AccessibilityTheme["reducedMotion"] =
    {
      transitionDuration: "0.1s",
      animationDuration: "0.1s",
    };

  // Default large text theme
  private static readonly DEFAULT_LARGE_TEXT: AccessibilityTheme["largeText"] =
    {
      fontSize: "18px",
      lineHeight: "1.5",
      spacing: "1.2em",
    };

  private constructor(config: Partial<AccessibilityConfig> = {}) {
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

  static getInstance(
    config?: Partial<AccessibilityConfig>
  ): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager(config);
    }
    return AccessibilityManager.instance;
  }

  private initialize(): void {
    this.detectUserPreferences();
    this.setupEventListeners();
    this.applyAccessibilityFeatures();
  }

  private detectUserPreferences(): void {
    // Use configuration values if they are explicitly set, otherwise detect from system
    if (this.config.enableHighContrast !== undefined) {
      this.isHighContrast = this.config.enableHighContrast;
    } else {
      this.isHighContrast = this.detectHighContrastPreference();
    }

    if (this.config.enableReducedMotion !== undefined) {
      this.isReducedMotion = this.config.enableReducedMotion;
    } else {
      this.isReducedMotion = this.detectReducedMotionPreference();
    }

    if (this.config.enableLargeText !== undefined) {
      this.isLargeText = this.config.enableLargeText;
    } else {
      this.isLargeText = this.detectLargeTextPreference();
    }
  }

  private detectHighContrastPreference(): boolean {
    // Check for high contrast media query
    if (window.matchMedia) {
      return window.matchMedia("(prefers-contrast: high)").matches;
    }
    return false;
  }

  private detectReducedMotionPreference(): boolean {
    // Check for reduced motion media query
    if (window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }

  private detectLargeTextPreference(): boolean {
    // Check for large text preference
    if (window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  }

  private setupEventListeners(): void {
    // Listen for preference changes
    if (window.matchMedia) {
      const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
      const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

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
      document.addEventListener(
        "keydown",
        this.handleKeyboardNavigation.bind(this)
      );
    }
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

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

  private handleTabNavigation(event: KeyboardEvent): void {
    // Ensure focus indicators are visible
    if (this.config.enableFocusIndicators) {
      this.showFocusIndicator(event.target as HTMLElement);
    }
  }

  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;

    // Handle different types of interactive elements
    if (target.hasAttribute("data-file-item")) {
      this.activateFileItem(target);
    } else if (target.hasAttribute("data-upload-button")) {
      this.activateUploadButton(target);
    } else if (target.hasAttribute("data-clear-button")) {
      this.activateClearButton(target);
    }
  }

  private handleEscape(event: KeyboardEvent): void {
    // Close any open modals or focus on main dropzone
    const dropzone = (event.target as HTMLElement).closest("[data-dropzone]");
    if (dropzone) {
      (dropzone as HTMLElement).focus();
    }
  }

  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const fileItems = Array.from(
      target.closest("[data-dropzone]")?.querySelectorAll("[data-file-item]") ||
        []
    );

    if (fileItems.length === 0) return;

    const currentIndex = fileItems.findIndex((item) => item === target);
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % fileItems.length;
    } else {
      nextIndex = currentIndex === 0 ? fileItems.length - 1 : currentIndex - 1;
    }

    (fileItems[nextIndex] as HTMLElement).focus();
  }

  private activateFileItem(element: HTMLElement): void {
    // Simulate click on file item
    element.click();
  }

  private activateUploadButton(element: HTMLElement): void {
    // Simulate click on upload button
    element.click();
  }

  private activateClearButton(element: HTMLElement): void {
    // Simulate click on clear button
    element.click();
  }

  private showFocusIndicator(element: HTMLElement): void {
    // Add focus indicator styles
    element.style.outline = `2px solid ${this.theme.highContrast.focus}`;
    element.style.outlineOffset = "2px";

    // Remove focus indicator after a delay
    setTimeout(() => {
      element.style.outline = "";
      element.style.outlineOffset = "";
    }, 3000);
  }

  private applyAccessibilityFeatures(): void {
    this.applyHighContrast();
    this.applyReducedMotion();
    this.applyLargeText();
    this.applyScreenReaderSupport();
  }

  private applyHighContrast(): void {
    if (!this.isHighContrast) return;

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

  private applyReducedMotion(): void {
    if (!this.isReducedMotion) return;

    const root = document.documentElement;
    const theme = this.theme.reducedMotion;

    // Apply reduced motion CSS variables
    root.style.setProperty(
      "--ac-transition-duration",
      theme.transitionDuration
    );
    root.style.setProperty("--ac-animation-duration", theme.animationDuration);

    // Add reduced motion class
    document.body.classList.add("ac-reduced-motion");
  }

  private applyLargeText(): void {
    if (!this.isLargeText) return;

    const root = document.documentElement;
    const theme = this.theme.largeText;

    // Apply large text CSS variables
    root.style.setProperty("--ac-font-size", theme.fontSize);
    root.style.setProperty("--ac-line-height", theme.lineHeight);
    root.style.setProperty("--ac-spacing", theme.spacing);

    // Add large text class
    document.body.classList.add("ac-large-text");
  }

  private applyScreenReaderSupport(): void {
    if (!this.config.enableScreenReader) return;

    // Add ARIA labels and descriptions
    this.addAriaLabels();
    this.addAriaDescriptions();
    this.addAriaLiveRegions();
  }

  private addAriaLabels(): void {
    // Add ARIA labels to interactive elements
    const dropzones = document.querySelectorAll("[data-dropzone]");
    dropzones.forEach((dropzone, index) => {
      const dropzoneElement = dropzone as HTMLElement;
      dropzoneElement.setAttribute(
        "aria-label",
        `File upload area ${index + 1}`
      );
      dropzoneElement.setAttribute(
        "aria-describedby",
        `dropzone-description-${index + 1}`
      );
    });

    const fileItems = document.querySelectorAll("[data-file-item]");
    fileItems.forEach((item, index) => {
      const itemElement = item as HTMLElement;
      const fileName =
        itemElement.getAttribute("data-file-name") || `File ${index + 1}`;
      itemElement.setAttribute(
        "aria-label",
        `${fileName}, click to view details`
      );
    });
  }

  private addAriaDescriptions(): void {
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

  private addAriaLiveRegions(): void {
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
  updateConfig(
    newConfig:
      | Partial<AccessibilityConfig>
      | {
          highContrast?: boolean;
          reducedMotion?: boolean;
          largeText?: boolean;
          screenReader?: boolean;
        }
  ): void {
    // Handle both configuration formats
    if (
      "highContrast" in newConfig ||
      "reducedMotion" in newConfig ||
      "largeText" in newConfig ||
      "screenReader" in newConfig
    ) {
      // Legacy format from tests
      const legacyConfig = newConfig as any;
      this.config = {
        ...this.config,
        enableHighContrast:
          legacyConfig.highContrast ?? this.config.enableHighContrast,
        enableReducedMotion:
          legacyConfig.reducedMotion ?? this.config.enableReducedMotion,
        enableLargeText: legacyConfig.largeText ?? this.config.enableLargeText,
        enableScreenReader:
          legacyConfig.screenReader ?? this.config.enableScreenReader,
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
    } else {
      // New format
      this.config = { ...this.config, ...newConfig };
    }
    this.initialize();
  }

  getConfig():
    | AccessibilityConfig
    | {
        highContrast: boolean;
        reducedMotion: boolean;
        largeText: boolean;
        screenReader: boolean;
      } {
    // Return legacy format for backward compatibility with tests
    return {
      highContrast: this.isHighContrast,
      reducedMotion: this.isReducedMotion,
      largeText: this.isLargeText,
      screenReader: this.config.enableScreenReader,
    };
  }

  generateAriaLabel(action: string, options: Record<string, any>): string {
    let label = action;

    if (options.maxFiles) {
      label += `, maximum ${options.maxFiles} files`;
    }

    if (options.acceptedTypes) {
      label += `, accepted types: ${options.acceptedTypes.join(", ")}`;
    }

    return label;
  }

  enableHighContrast(): void {
    this.isHighContrast = true;
    this.applyAccessibilityFeatures();
  }

  disableHighContrast(): void {
    this.isHighContrast = false;
    this.applyAccessibilityFeatures();
  }

  enableReducedMotion(): void {
    this.isReducedMotion = true;
    this.applyAccessibilityFeatures();
  }

  disableReducedMotion(): void {
    this.isReducedMotion = false;
    this.applyAccessibilityFeatures();
  }

  enableLargeText(): void {
    this.isLargeText = true;
    this.applyAccessibilityFeatures();
  }

  disableLargeText(): void {
    this.isLargeText = false;
    this.applyAccessibilityFeatures();
  }

  updateTheme(newTheme: Partial<AccessibilityTheme>): void {
    this.theme = { ...this.theme, ...newTheme };
    this.applyAccessibilityFeatures();
  }

  getStatus(): {
    isHighContrast: boolean;
    isReducedMotion: boolean;
    isLargeText: boolean;
    isScreenReaderEnabled: boolean;
    isKeyboardNavigationEnabled: boolean;
  } {
    return {
      isHighContrast: this.isHighContrast,
      isReducedMotion: this.isReducedMotion,
      isLargeText: this.isLargeText,
      isScreenReaderEnabled: this.config.enableScreenReader,
      isKeyboardNavigationEnabled: this.config.enableKeyboardNavigation,
    };
  }

  announceToScreenReader(message: string): void {
    if (!this.config.enableScreenReader) return;

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
