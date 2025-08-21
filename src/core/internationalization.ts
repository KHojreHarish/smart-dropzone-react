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

export class InternationalizationManager {
  private static instance: InternationalizationManager;
  private config: I18nConfig;
  private currentLocale: string;
  private fallbackLocale: string;
  private translations: Map<string, Translation> = new Map();
  private loadedLocales: Set<string> = new Set();

  // Default English translations
  private static readonly DEFAULT_TRANSLATIONS: Record<string, Translation> = {
    "en-US": {
      common: {
        upload: "Upload",
        cancel: "Cancel",
        retry: "Retry",
        remove: "Remove",
        clear: "Clear All",
        close: "Close",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        confirm: "Confirm",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Information",
      },
      dropzone: {
        title: "Drag & Drop Files Here",
        subtitle: "or click to browse",
        description: "Drop your files here to upload them",
        maxFiles: "Maximum {count} files allowed",
        maxFileSize: "Maximum file size: {size}",
        allowedTypes: "Allowed file types: {types}",
        dragActive: "Drop files here to upload",
        dragInactive: "Drag files here or click to select",
        fileTooLarge: 'File "{name}" is too large',
        fileTypeNotAllowed: 'File type "{type}" is not allowed',
        tooManyFiles: "Too many files selected",
        uploadInProgress: "Upload in progress...",
        uploadComplete: "Upload complete!",
        uploadFailed: "Upload failed",
        processing: "Processing...",
        ready: "Ready to upload",
        dragAndDrop: "Drag and drop files here to upload",
      },
      fileItem: {
        uploading: "Uploading...",
        uploaded: "Uploaded",
        failed: "Failed",
        cancelled: "Cancelled",
        pending: "Pending",
        retryUpload: "Retry upload",
        cancelUpload: "Cancel upload",
        removeFile: "Remove file",
        viewFile: "View file",
        downloadFile: "Download file",
        fileSize: "File size: {size}",
        fileType: "File type: {type}",
        uploadProgress: "Upload progress: {progress}%",
        uploadSpeed: "Upload speed: {speed}",
        timeRemaining: "Time remaining: {time}",
        errorMessage: "Error: {message}",
      },
      validation: {
        required: "This field is required",
        invalidFormat: "Invalid format",
        fileTooLarge: "File is too large",
        fileTypeNotAllowed: "File type not allowed",
        tooManyFiles: "Too many files",
        invalidFile: "Invalid file",
        corruptedFile: "File appears to be corrupted",
        virusDetected: "Virus detected in file",
        passwordProtected: "File is password protected",
        unsupportedFormat: "Unsupported file format",
      },
      errors: {
        networkError:
          "Network connection error. Please check your internet connection.",
        serverError: "Server error. Please try again later.",
        timeoutError: "Request timed out. Please try again.",
        quotaExceeded: "Storage quota exceeded. Please remove some files.",
        unauthorized: "You are not authorized to perform this action.",
        forbidden: "Access denied. You do not have permission.",
        notFound: "Resource not found.",
        conflict: "Resource conflict. Please resolve and try again.",
        tooManyRequests: "Too many requests. Please wait and try again.",
        internalError: "Internal server error. Please contact support.",
        unknownError: "An unknown error occurred. Please try again.",
      },
      accessibility: {
        dropzoneLabel: "File upload area",
        dropzoneDescription:
          "Drag and drop files here or click to browse. Supported formats: images, PDFs, and text files.",
        fileItemLabel: "File item",
        uploadButtonLabel: "Upload button",
        cancelButtonLabel: "Cancel button",
        retryButtonLabel: "Retry button",
        removeButtonLabel: "Remove button",
        progressBarLabel: "Upload progress",
        statusLabel: "File status",
        errorMessageLabel: "Error message",
        successMessageLabel: "Success message",
        loadingMessageLabel: "Loading message",
      },
      voice: {
        commands: {
          upload: "Upload files",
          cancel: "Cancel upload",
          clear: "Clear all",
          retry: "Retry failed",
          select: "Select files",
          help: "Voice help",
        },
        feedback: {
          listening: "Listening for voice commands...",
          commandRecognized: "Command recognized: {command}",
          commandExecuted: "Command executed: {action}",
          commandNotFound: "Command not found: {command}",
          listeningStopped: "Voice recognition stopped",
          error: "Voice recognition error: {error}",
        },
      },
    },
    "es-ES": {
      common: {
        upload: "Subir",
        cancel: "Cancelar",
        retry: "Reintentar",
        remove: "Eliminar",
        clear: "Limpiar Todo",
        close: "Cerrar",
        save: "Guardar",
        edit: "Editar",
        delete: "Eliminar",
        confirm: "Confirmar",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        warning: "Advertencia",
        info: "Información",
      },
      dropzone: {
        title: "Arrastra y Suelta Archivos Aquí",
        subtitle: "o haz clic para explorar",
        description: "Suelta tus archivos aquí para subirlos",
        maxFiles: "Máximo {count} archivos permitidos",
        maxFileSize: "Tamaño máximo de archivo: {size}",
        allowedTypes: "Tipos de archivo permitidos: {types}",
        dragActive: "Suelta los archivos aquí para subirlos",
        dragInactive: "Arrastra archivos aquí o haz clic para seleccionar",
        fileTooLarge: 'El archivo "{name}" es demasiado grande',
        fileTypeNotAllowed: 'El tipo de archivo "{type}" no está permitido',
        tooManyFiles: "Demasiados archivos seleccionados",
        uploadInProgress: "Subida en progreso...",
        uploadComplete: "¡Subida completada!",
        uploadFailed: "Subida fallida",
        processing: "Procesando...",
        ready: "Listo para subir",
        dragAndDrop: "Arrastra y suelta archivos aquí",
      },
    },
    "fr-FR": {
      common: {
        upload: "Télécharger",
        cancel: "Annuler",
        retry: "Réessayer",
        remove: "Supprimer",
        clear: "Tout effacer",
        close: "Fermer",
        save: "Enregistrer",
        edit: "Modifier",
        delete: "Supprimer",
        confirm: "Confirmer",
        loading: "Chargement...",
        error: "Erreur",
        success: "Succès",
        warning: "Avertissement",
        info: "Information",
      },
      dropzone: {
        title: "Glissez et Déposez les Fichiers Ici",
        subtitle: "ou cliquez pour parcourir",
        description: "Déposez vos fichiers ici pour les télécharger",
        maxFiles: "Maximum {count} fichiers autorisés",
        maxFileSize: "Taille maximale de fichier: {size}",
        allowedTypes: "Types de fichiers autorisés: {types}",
        dragActive: "Déposez les fichiers ici pour les télécharger",
        dragInactive: "Glissez les fichiers ici ou cliquez pour sélectionner",
        fileTooLarge: 'Le fichier "{name}" est trop volumineux',
        fileTypeNotAllowed: 'Le type de fichier "{type}" n\'est pas autorisé',
        tooManyFiles: "Trop de fichiers sélectionnés",
        uploadInProgress: "Téléchargement en cours...",
        uploadComplete: "Téléchargement terminé !",
        uploadFailed: "Téléchargement échoué",
        processing: "Traitement...",
        ready: "Prêt à télécharger",
      },
    },
    "de-DE": {
      common: {
        upload: "Hochladen",
        cancel: "Abbrechen",
        retry: "Wiederholen",
        remove: "Entfernen",
        clear: "Alle löschen",
        close: "Schließen",
        save: "Speichern",
        edit: "Bearbeiten",
        delete: "Löschen",
        confirm: "Bestätigen",
        loading: "Wird geladen...",
        error: "Fehler",
        success: "Erfolg",
        warning: "Warnung",
        info: "Information",
      },
      dropzone: {
        title: "Dateien Hier Hineinziehen und Ablegen",
        subtitle: "oder klicken zum Durchsuchen",
        description: "Legen Sie Ihre Dateien hier ab, um sie hochzuladen",
        maxFiles: "Maximal {count} Dateien erlaubt",
        maxFileSize: "Maximale Dateigröße: {size}",
        allowedTypes: "Erlaubte Dateitypen: {types}",
        dragActive: "Dateien hier ablegen zum Hochladen",
        dragInactive: "Dateien hier hineinziehen oder klicken zum Auswählen",
        fileTooLarge: 'Datei "{name}" ist zu groß',
        fileTypeNotAllowed: 'Dateityp "{type}" ist nicht erlaubt',
        tooManyFiles: "Zu viele Dateien ausgewählt",
        uploadInProgress: "Upload läuft...",
        uploadComplete: "Upload abgeschlossen!",
        uploadFailed: "Upload fehlgeschlagen",
        processing: "Wird verarbeitet...",
        ready: "Bereit zum Hochladen",
      },
    },
    "ja-JP": {
      common: {
        upload: "アップロード",
        cancel: "キャンセル",
        retry: "再試行",
        remove: "削除",
        clear: "すべてクリア",
        close: "閉じる",
        save: "保存",
        edit: "編集",
        delete: "削除",
        confirm: "確認",
        loading: "読み込み中...",
        error: "エラー",
        success: "成功",
        warning: "警告",
        info: "情報",
      },
      dropzone: {
        title: "ここにファイルをドラッグ＆ドロップ",
        subtitle: "またはクリックして参照",
        description: "ファイルをここにドロップしてアップロード",
        maxFiles: "最大{count}ファイルまで",
        maxFileSize: "最大ファイルサイズ: {size}",
        allowedTypes: "許可されたファイルタイプ: {types}",
        dragActive: "ここにファイルをドロップしてアップロード",
        dragInactive: "ここにファイルをドラッグするか、クリックして選択",
        fileTooLarge: "ファイル「{name}」が大きすぎます",
        fileTypeNotAllowed: "ファイルタイプ「{type}」は許可されていません",
        tooManyFiles: "ファイルが多すぎます",
        uploadInProgress: "アップロード中...",
        uploadComplete: "アップロード完了！",
        uploadFailed: "アップロード失敗",
        processing: "処理中...",
        ready: "アップロード準備完了",
      },
    },
  };

  private constructor(config: I18nConfig) {
    this.config = config;
    this.currentLocale = config.defaultLocale;
    this.fallbackLocale = config.fallbackLocale;

    // Load default locale
    this.loadLocale(config.defaultLocale);
  }

  static getInstance(config?: I18nConfig): InternationalizationManager {
    if (!InternationalizationManager.instance) {
      const defaultConfig: I18nConfig = {
        defaultLocale: "en-US",
        fallbackLocale: "en-US",
        supportedLocales: ["en-US", "es", "es-ES", "fr-FR", "de-DE", "ja-JP"],
        loadLocaleData: async (locale: string) => {
          // Map short locale codes to full ones
          const localeMap: Record<string, string> = {
            es: "es-ES",
            fr: "fr-FR",
            de: "de-DE",
            ja: "ja-JP",
          };
          const fullLocale = localeMap[locale] || locale;
          return (
            InternationalizationManager.DEFAULT_TRANSLATIONS[fullLocale] ||
            InternationalizationManager.DEFAULT_TRANSLATIONS["en-US"]
          );
        },
      };
      InternationalizationManager.instance = new InternationalizationManager(
        config || defaultConfig
      );
    }
    return InternationalizationManager.instance;
  }

  async setLocale(locale: string): Promise<boolean> {
    if (!this.config.supportedLocales.includes(locale)) {
      console.warn(`Locale ${locale} is not supported`);
      return false;
    }

    if (locale === this.currentLocale) {
      return true;
    }

    try {
      await this.loadLocale(locale);
      this.currentLocale = locale;
      this.config.onLocaleChange?.(locale);
      return true;
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error);
      return false;
    }
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  getSupportedLocales(): string[] {
    return [...this.config.supportedLocales];
  }

  async loadLocale(locale: string): Promise<void> {
    if (this.loadedLocales.has(locale)) {
      return;
    }

    try {
      let translation: Translation;

      // Try to load from config first
      if (this.config.loadLocaleData) {
        translation = await this.config.loadLocaleData(locale);
      } else {
        // Fall back to built-in translations
        translation =
          InternationalizationManager.DEFAULT_TRANSLATIONS[locale] ||
          InternationalizationManager.DEFAULT_TRANSLATIONS[this.fallbackLocale];
      }

      if (translation) {
        this.translations.set(locale, translation);
        this.loadedLocales.add(locale);
      } else {
        throw new Error(`No translation data found for locale ${locale}`);
      }
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error);

      // Fall back to default locale
      if (locale !== this.fallbackLocale) {
        await this.loadLocale(this.fallbackLocale);
      }
    }
  }

  translate(key: string, params?: Record<string, any>): string {
    const keys = key.split(".");
    let translation: any = this.translations.get(this.currentLocale);

    // Try current locale first
    for (const k of keys) {
      if (translation && typeof translation === "object" && k in translation) {
        translation = translation[k];
      } else {
        translation = null;
        break;
      }
    }

    // Fall back to fallback locale if current locale failed
    if (!translation && this.currentLocale !== this.fallbackLocale) {
      translation = this.translations.get(this.fallbackLocale);
      for (const k of keys) {
        if (
          translation &&
          typeof translation === "object" &&
          k in translation
        ) {
          translation = translation[k];
        } else {
          translation = null;
          break;
        }
      }
    }

    // Fall back to key if no translation found
    if (!translation || typeof translation !== "string") {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Replace parameters
    if (params) {
      return translation.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? String(params[param]) : match;
      });
    }

    return translation;
  }

  // Alias method for backward compatibility with tests
  t(key: string, params?: Record<string, any>): string {
    return this.translate(key, params);
  }

  formatFileSize(bytes: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return (
      new Intl.NumberFormat(targetLocale, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(size) +
      " " +
      units[unitIndex]
    );
  }

  translatePlural(
    key: string,
    count: number,
    params?: Record<string, any>
  ): string {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return this.translate(pluralKey, { ...params, count });
  }

  formatNumber(number: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    return new Intl.NumberFormat(targetLocale).format(number);
  }

  formatDate(date: Date, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    return new Intl.DateTimeFormat(targetLocale).format(date);
  }

  formatCurrency(amount: number, currency: string, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    return new Intl.NumberFormat(targetLocale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  getLocaleConfig(locale: string): LocaleConfig | null {
    // This would typically come from a locale database
    // For now, return basic config
    const isRTL = ["ar", "he", "fa", "ur"].includes(locale.split("-")[0]);

    return {
      code: locale,
      name:
        new Intl.DisplayNames([locale], { type: "language" }).of(locale) ||
        locale,
      direction: isRTL ? "rtl" : "ltr",
      dateFormat: "MM/DD/YYYY",
      numberFormat: {
        decimal: ".",
        thousands: ",",
        currency: "$",
      },
    };
  }

  isRTL(locale?: string): boolean {
    const targetLocale = locale || this.currentLocale;
    const config = this.getLocaleConfig(targetLocale);
    return config?.direction === "rtl";
  }

  // Utility methods for common translations
  tPlural(key: string, count: number, params?: Record<string, any>): string {
    return this.translatePlural(key, count, params);
  }

  // Get all available translations for a key
  getAllTranslations(key: string): Record<string, string> {
    const result: Record<string, string> = {};

    for (const locale of this.loadedLocales) {
      const translation = this.translate(key);
      if (translation !== key) {
        result[locale] = translation;
      }
    }

    return result;
  }

  // Check if a translation exists
  hasTranslation(key: string): boolean {
    return this.translate(key) !== key;
  }

  // Get translation keys for a specific locale
  getTranslationKeys(locale: string): string[] {
    const translation = this.translations.get(locale);
    if (!translation) return [];

    const keys: string[] = [];
    this.extractKeys(translation, "", keys);
    return keys;
  }

  private extractKeys(obj: any, prefix: string, keys: string[]): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "string") {
        keys.push(fullKey);
      } else if (typeof value === "object" && value !== null) {
        this.extractKeys(value, fullKey, keys);
      }
    }
  }
}
