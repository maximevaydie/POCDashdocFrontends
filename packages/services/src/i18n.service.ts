import {
    Locale,
    bindToLocale,
    formatDate,
    formatVolumeI18N,
    getAdrUnCodeLabelI18N,
    getCompartmentsTextI18N,
    getDeliveryDocumentNameI18N,
    getEventMessageTranslationI18N,
    getLoadCategoryLabelI18N,
    getLoadTextI18N,
    getReadableAddressI18N,
    setupI18n as setupI18nOriginal,
    translateMetricUnitI18N,
    translate as translateOriginal,
    translateVolumeUnitI18N,
} from "dashdoc-utils";
import i18next from "i18next";
import {z, ZodIssueOptionalMessage, ErrorMapCtx} from "zod";
import {zodI18nMap} from "zod-i18n-map";
import deZodTranslations from "zod-i18n-map/locales/de/zod.json";
import enZodTranslations from "zod-i18n-map/locales/en/zod.json";
import esZodTranslations from "zod-i18n-map/locales/es/zod.json";
import frZodTranslations from "zod-i18n-map/locales/fr/zod.json";
import nlZodTranslations from "zod-i18n-map/locales/nl/zod.json";
import plZodTranslations from "zod-i18n-map/locales/pl/zod.json";

// we keep the fr translation as explicit import to be able to compute an explicit TranslationKeys type

import {translations as defaultTranslations} from "../locales/fr";
import {BuildConstants} from "../types/constants";
import {SupportedLocale} from "../types/locale";

import {DEFAULT_LOCALE, localeService} from "./locale.service";
import {Logger} from "./logging.service";

export {getLocale, setLocale} from "dashdoc-utils";

type OriginalTranslateParams = Parameters<typeof translateOriginal>;

const getTranslations = (locale: SupportedLocale): Promise<Record<string, string>> => {
    let result;
    switch (locale) {
        case "en":
            // we use an explicit path to let the builder detect files
            // @see https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
            result = import(`../locales/en`);
            break;
        case "nl":
            result = import(`../locales/nl`);
            break;
        case "es":
            result = import(`../locales/es`);
            break;
        case "de":
            result = import(`../locales/de`);
            break;
        case "pl":
            result = import(`../locales/pl`);
            break;
        default:
            result = Promise.resolve({translations: defaultTranslations});
    }
    return result.then(({translations}) => ({...translations}));
};

const TRANSLATION_KEYS = Object.keys(defaultTranslations) as [keyof typeof defaultTranslations];

export const translationKeysZodSchema = z.enum(TRANSLATION_KEYS);
export type TranslationKeys = z.infer<typeof translationKeysZodSchema>;

export const isTranslationKey = (potentialKey: string): potentialKey is TranslationKeys => {
    return potentialKey in defaultTranslations;
};

export const translate = (
    key: TranslationKeys,
    polyglotOptions?: OriginalTranslateParams[1],
    options?: OriginalTranslateParams[2]
) => {
    return translateOriginal(key, polyglotOptions, options);
};

export const t = translate; // alias for translate

const frenchTerritories = [
    "fr", // France
    "gf", // Guyane
    "gp", // Guadeloupe
    "mq", // Martinique
    "re", // La Réunion
    "pm", // Saint-Pierre-et-Miquelon
    "yt", // Mayotte
    "bl", // Saint-Barthélemy
    "mf", // Saint-martin
    "wf", // Wallis-et-Futuna
    "pf", // Polynésie française
    "nc", // Nouvelle-Calédonie
    "tf", // Terres australes et antarctiques françaises
];

export const getCountryValidLocale: (countryCode: string) => SupportedLocale = (
    countryCode: string
) => {
    /**
     * Keep in sync with backend method `get_default_language_for_country`
     */

    const countryCodeLowerCase = countryCode.toLowerCase();

    const countriesSpeakingFrench = [...frenchTerritories, "lu", "ch"];
    if (countriesSpeakingFrench.includes(countryCodeLowerCase)) {
        return "fr";
    }

    if (["nl"].includes(countryCodeLowerCase)) {
        return "nl";
    }

    if (["es"].includes(countryCodeLowerCase)) {
        return "es";
    }

    if (["de", "at"].includes(countryCodeLowerCase)) {
        return "de";
    }

    if (["pl"].includes(countryCodeLowerCase)) {
        return "pl";
    }

    if (["es"].includes(countryCodeLowerCase)) {
        return "es";
    }

    return "en";
};

export const setupI18n = async (language = BuildConstants.language, tzName = "Europe/Paris") => {
    Logger.log("[I18n]", "got locale", language);
    let locale: SupportedLocale = DEFAULT_LOCALE;
    if (localeService.isSupported(language)) {
        locale = language as SupportedLocale;
    } else {
        Logger.warn("[I18n]", "couldn't find locale", language);
        Logger.warn("[I18n]", "used default locale", DEFAULT_LOCALE);
    }
    const translations = await getTranslations(locale);
    setupI18nOriginal(locale, translations);
    LOCALE_FOR_JS_UTILS_I18N_FUNCS.tzName = tzName;
    LOCALE_FOR_JS_UTILS_I18N_FUNCS.locales = [locale];
    LOCALE_FOR_JS_UTILS_I18N_FUNCS.mainLocale = locale;

    i18next.init({
        lng: locale,
        resources: {
            fr: {zod: frZodTranslations},
            en: {zod: enZodTranslations},
            es: {zod: esZodTranslations},
            nl: {zod: nlZodTranslations},
            de: {zod: deZodTranslations},
            pl: {zod: plZodTranslations},
        },
    });
    /**
     * Use dashdoc i18n for zod error messages when the message is a translation key.
     */
    function customErrorMap(issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx) {
        if (typeof issue.message === "string" && isTranslationKey(issue.message)) {
            // there is a message and it should be translated
            return {message: t(issue.message)};
        } else if (typeof issue.message === "string") {
            // there is a static message
            return {message: issue.message};
        }
        return zodI18nMap(issue, ctx);
    }
    z.setErrorMap(customErrorMap);
};

/**
 * @deprecated use setupI18n instead (only for storybook and jest)
 */
export const syncSetupI18n = () => {
    setupI18nOriginal(DEFAULT_LOCALE, defaultTranslations);
};

// SECTION : Transition functions. Will be removed soon
// Used to tell the JS-utils functions which language and timezone to use.
export const LOCALE_FOR_JS_UTILS_I18N_FUNCS: Locale = {
    translate,
    formatDate,
    // Next three will be filled by a call to `setupI18n` above.
    tzName: "Europe/Paris",
    locales: ["fr"],
    mainLocale: "fr",
};

// JS utils has functions that do translations. Those require a Locale
// object as first argument. We prebind those functions with a Locale
// which uses the default `translate` and `formatDate`.
export const getReadableAddress = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getReadableAddressI18N
);
export const getDeliveryDocumentName = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getDeliveryDocumentNameI18N
);
export const getEventMessageTranslation = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getEventMessageTranslationI18N
);
export const getCompartmentsText = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getCompartmentsTextI18N
);
export const getLoadCategoryLabel = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getLoadCategoryLabelI18N
);
export const getLoadText = bindToLocale(LOCALE_FOR_JS_UTILS_I18N_FUNCS, getLoadTextI18N);
export const getAdrUnCodeLabel = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    getAdrUnCodeLabelI18N
);
export const formatVolume = bindToLocale(LOCALE_FOR_JS_UTILS_I18N_FUNCS, formatVolumeI18N);
export const translateVolumeUnit = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    translateVolumeUnitI18N
);
export const translateMetricUnit = bindToLocale(
    LOCALE_FOR_JS_UTILS_I18N_FUNCS,
    translateMetricUnitI18N
);
// END SECTION
