import {LOCALE_ARRAY} from "../../dashdocOLD/core/src/types/locale";
import {getCountryValidLocale, setupI18n, syncSetupI18n, translate} from "../../dashdocOLD/core/src/services/i18n.service";
import {SUPPORTED_LOCALES_OPTIONS} from "../../dashdocOLD/core/src/services/locale.service";

beforeAll(() => {
    syncSetupI18n();
});

describe("Test i18n getCountryValidLocale", () => {
    const testCountryGivesLocale = (countryCode: string, expectedLocale: string) => {
        const result = getCountryValidLocale(countryCode);
        expect(result).toBe(expectedLocale);
    };

    test("'FR' should return fr", () => {
        testCountryGivesLocale("FR", "fr");
    });

    test("'' or 'Unknown' or 'EN' should return en", () => {
        testCountryGivesLocale("", "en");
        testCountryGivesLocale("Unknown", "en");
        testCountryGivesLocale("EN", "en");
    });

    test("'NL' should return nl", () => {
        testCountryGivesLocale("NL", "nl");
    });

    test("'BE' should return en", () => {
        testCountryGivesLocale("BE", "en");
    });
});

describe("Test i18n constants", () => {
    test("LOCALES_OPTIONS should be consistent with LOCALE_ARRAY", async () => {
        const result = SUPPORTED_LOCALES_OPTIONS.map((option) => option.value);
        expect(LOCALE_ARRAY.length).toBe(result.length);
        expect([...LOCALE_ARRAY].sort()).toEqual(result.sort());
    });

    test("LOCALES_OPTIONS should have the expected label", async () => {
        testExpectedLabel("Français (Fr)", "fr");
        testExpectedLabel("English (En)", "en");
        testExpectedLabel("Nederlands (Nl)", "nl");
        testExpectedLabel("Deutsch (De)", "de");
        testExpectedLabel("Polski (Pl)", "pl");
    });

    const testExpectedLabel = async (expectedLabel: string, language: string) => {
        // @ts-ignore
        expect(SUPPORTED_LOCALES_OPTIONS.find((option) => option.value === language).label).toBe(
            expectedLabel
        );
    };
});

describe("Test i18n translate", () => {
    const testTranslateInvoice = async (expectedActionInvoiceI18n: string, language: string) => {
        await setupI18n(language);
        const result = translate("action.invoice");
        expect(result).toBe(expectedActionInvoiceI18n);
    };

    test("Translate 'action.invoice' in fr", async () => {
        await testTranslateInvoice("Facturer", "fr");
    });

    test("Translate 'action.invoice' in 'Unknown'", async () => {
        await testTranslateInvoice("Invoice", "Unknown");
    });

    test("Translate 'action.invoice' in en", async () => {
        await testTranslateInvoice("Invoice", "en");
    });

    test("Translate 'action.invoice' in de", async () => {
        await testTranslateInvoice("Abrechnen", "de");
    });

    test("Translate 'action.invoice' in nl", async () => {
        await testTranslateInvoice("Factureren", "nl");
    });

    test("Translate 'action.invoice' in pl", async () => {
        await testTranslateInvoice("Zafakturuj", "pl");
    });
});
