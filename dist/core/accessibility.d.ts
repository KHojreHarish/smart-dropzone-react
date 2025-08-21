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
export declare class AccessibilityManager {
    private static instance;
    private config;
    private theme;
    private isHighContrast;
    private isReducedMotion;
    private isLargeText;
    private static readonly DEFAULT_HIGH_CONTRAST;
    private static readonly DEFAULT_REDUCED_MOTION;
    private static readonly DEFAULT_LARGE_TEXT;
    private constructor();
    static getInstance(config?: Partial<AccessibilityConfig>): AccessibilityManager;
    private initialize;
    private detectUserPreferences;
    private detectHighContrastPreference;
    private detectReducedMotionPreference;
    private detectLargeTextPreference;
    private setupEventListeners;
    private handleKeyboardNavigation;
    private handleTabNavigation;
    private handleActivation;
    private handleEscape;
    private handleArrowNavigation;
    private activateFileItem;
    private activateUploadButton;
    private activateClearButton;
    private showFocusIndicator;
    private applyAccessibilityFeatures;
    private applyHighContrast;
    private applyReducedMotion;
    private applyLargeText;
    private applyScreenReaderSupport;
    private addAriaLabels;
    private addAriaDescriptions;
    private addAriaLiveRegions;
    updateConfig(newConfig: Partial<AccessibilityConfig> | {
        highContrast?: boolean;
        reducedMotion?: boolean;
        largeText?: boolean;
        screenReader?: boolean;
    }): void;
    getConfig(): AccessibilityConfig | {
        highContrast: boolean;
        reducedMotion: boolean;
        largeText: boolean;
        screenReader: boolean;
    };
    generateAriaLabel(action: string, options: Record<string, any>): string;
    enableHighContrast(): void;
    disableHighContrast(): void;
    enableReducedMotion(): void;
    disableReducedMotion(): void;
    enableLargeText(): void;
    disableLargeText(): void;
    updateTheme(newTheme: Partial<AccessibilityTheme>): void;
    getStatus(): {
        isHighContrast: boolean;
        isReducedMotion: boolean;
        isLargeText: boolean;
        isScreenReaderEnabled: boolean;
        isKeyboardNavigationEnabled: boolean;
    };
    announceToScreenReader(message: string): void;
}
//# sourceMappingURL=accessibility.d.ts.map