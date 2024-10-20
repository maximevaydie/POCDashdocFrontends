import {utilsService} from "services/utils.service";

describe("getCurrencySymbol", () => {
    test.each([
        ["fr", "EUR", "€"],
        ["fr", "USD", "$US"],
        ["en", "USD", "$"],
        ["en-GB", "USD", "US$"],
    ])("euro", (locale, currency, symbol) => {
        expect(utilsService.getCurrencySymbol(currency, {locale})).toBe(symbol);
    });
});
