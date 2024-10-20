import {
    getPricingCurrency,
    getTransportTotalInvoicedPrice,
} from "app/services/invoicing/pricing.service";

describe("getTransportTotalInvoicedPrice", () => {
    test("and a defined price", () => {
        expect(getTransportTotalInvoicedPrice({pricing_total_price: "123.45"})).toBe(123.45);
    });

    test("and an empty price", () => {
        expect(getTransportTotalInvoicedPrice({pricing_total_price: ""})).toBe(null);
    });

    test("and a missing price", () => {
        expect(getTransportTotalInvoicedPrice({pricing_total_price: null})).toBe(null);
    });
});

describe("getPricingCurrency", () => {
    it("returns undefined when empty lines and no tariff_grid", () => {
        expect(getPricingCurrency({lines: [], tariff_grid_line: null})).toBeUndefined();
    });

    it("returns the first line currency", () => {
        expect(getPricingCurrency({lines: [{currency: "GBP"}]})).toBe("GBP");
    });

    it("returns the tarrif_grid_line currency if no lines", () => {
        expect(getPricingCurrency({lines: [], tariff_grid_line: {currency: "GBP"}})).toBe("GBP");
    });

    it("returns the first line currency before the tariff grid one", () => {
        expect(
            getPricingCurrency({lines: [{currency: "GBP"}], tariff_grid_line: {currency: "CHF"}})
        ).toBe("GBP");
    });
});
