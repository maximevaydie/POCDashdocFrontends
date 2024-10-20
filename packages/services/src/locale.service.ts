import {
    ALL_LOCALES,
    ALL_LOCALE_LABELS,
    LOCALE_ARRAY,
    Locale,
    LocaleOption,
    SupportedLocale,
    SupportedLocaleOption,
} from "../types/locale";

import {Logger} from "./logging.service";

export const DEFAULT_LOCALE: SupportedLocale = "en" as SupportedLocale;

const UNSUPPORTED_LANGUAGES = ALL_LOCALES.filter((locale) => !isSupported(locale));

export const SUPPORTED_LOCALES_OPTIONS: SupportedLocaleOption[] = LOCALE_ARRAY.map((value) => {
    const locale: SupportedLocale = value as SupportedLocale;
    const label = getLocaleLabel(locale);
    return {value: locale, label};
});

export const LOCALES_OPTIONS: LocaleOption[] = [...LOCALE_ARRAY, ...UNSUPPORTED_LANGUAGES].map(
    (value) => {
        const locale: Locale = value as Locale;
        const label = getLocaleLabel(locale);
        return {value: locale, label};
    }
);

/**
 * Return the locale option related to the given language.
 * When the language is not supported, we fallback to the default local option based on the `DEFAULT_LOCALE`.
 */
function getLocaleOption(language: string | undefined): LocaleOption {
    let result: LocaleOption = {
        value: DEFAULT_LOCALE,
        label: ALL_LOCALE_LABELS[DEFAULT_LOCALE],
    };
    if (language && (ALL_LOCALES as readonly string[]).includes(language)) {
        const locale = language as Locale;
        result = {
            value: locale,
            label: ALL_LOCALE_LABELS[locale],
        };
    }
    return result;
}

function getLocaleLabel(locale: Locale): string {
    return `${ALL_LOCALE_LABELS[locale]} (${getShortLocalLabel(locale)})`;
}

function getShortLocalLabel(language: Locale): string {
    if (language.length < 2) {
        Logger.error("Invalid language code", language);
        return language;
    }
    const [firstLetterChar, secondChar] = language;
    return `${firstLetterChar.toUpperCase()}${secondChar.toLowerCase()}`;
}

function isSupported(locale: string) {
    return (LOCALE_ARRAY as readonly string[]).includes(locale);
}

export const localeService = {
    getLocaleOption,
    getLocaleLabel,
    getShortLocalLabel,
    isSupported,
};
