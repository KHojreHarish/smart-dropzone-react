export interface LocaleConfig {
    code: string;
    name: string;
    direction: "ltr" | "rtl";
    dateFormat: string;
    numberFormat: {
        decimal: string;
        thousands: string;
        currency: string;
    };
}
export interface Translation {
    [key: string]: string | Translation;
}
export interface I18nConfig {
    defaultLocale: string;
    fallbackLocale: string;
    supportedLocales: string[];
    loadLocaleData: (locale: string) => Promise<Translation>;
    onLocaleChange?: (locale: string) => void;
}
export declare class InternationalizationManager {
    private static instance;
    private config;
    private currentLocale;
    private fallbackLocale;
    private translations;
    private loadedLocales;
    private static readonly DEFAULT_TRANSLATIONS;
    private constructor();
    static getInstance(config?: I18nConfig): InternationalizationManager;
    setLocale(locale: string): Promise<boolean>;
    getCurrentLocale(): string;
    getSupportedLocales(): string[];
    loadLocale(locale: string): Promise<void>;
    translate(key: string, params?: Record<string, any>): string;
    t(key: string, params?: Record<string, any>): string;
    formatFileSize(bytes: number, locale?: string): string;
    translatePlural(key: string, count: number, params?: Record<string, any>): string;
    formatNumber(number: number, locale?: string): string;
    formatDate(date: Date, locale?: string): string;
    formatCurrency(amount: number, currency: string, locale?: string): string;
    getLocaleConfig(locale: string): LocaleConfig | null;
    isRTL(locale?: string): boolean;
    tPlural(key: string, count: number, params?: Record<string, any>): string;
    getAllTranslations(key: string): Record<string, string>;
    hasTranslation(key: string): boolean;
    getTranslationKeys(locale: string): string[];
    private extractKeys;
}
//# sourceMappingURL=internationalization.d.ts.map