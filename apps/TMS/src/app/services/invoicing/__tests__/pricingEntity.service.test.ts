import {Pricing, PricingLine, TariffGridLine} from "dashdoc-utils";

import {
    getFuelSurchargeApplicableTotalPrice,
    isPricingEmpty,
} from "app/services/invoicing/pricingEntity.service";

describe("getFuelSurchargeApplicableTotalPrice", () => {
    test("with a missing price", () => {
        expect(getFuelSurchargeApplicableTotalPrice(null)).toBe(0);
    });

    test("with missing pricing lines", () => {
        const partialPricing = {
            lines: [] as PricingLine[],
            tariff_grid_line: null,
        } as Pricing;
        expect(getFuelSurchargeApplicableTotalPrice(partialPricing)).toBe(0);
    });

    test("considers all line types", () => {
        const partialPricing = {
            lines: [
                {final_price: "123.45", is_gas_indexed: true},
                {final_price: "234.56", is_gas_indexed: true},
            ],
            tariff_grid_line: {final_price: "345.67", is_gas_indexed: true},
        } as Pricing;
        expect(getFuelSurchargeApplicableTotalPrice(partialPricing)).toBe(703.68);
    });

    test("ignores lines where fuel surcharge is not applicable", () => {
        const partialPricing = {
            lines: [
                {final_price: "123.45", is_gas_indexed: true}, // Only this one should be counted
                {final_price: "234.56", is_gas_indexed: false},
            ],
            tariff_grid_line: {final_price: "345.67", is_gas_indexed: false},
        } as Pricing;
        expect(getFuelSurchargeApplicableTotalPrice(partialPricing)).toBe(123.45);
    });
});

describe("isPricingEmpty", () => {
    test("with empty pricing", () => {
        const emptyPricing = {
            lines: [] as PricingLine[],
            tariff_grid_line: null,
            overridden_gas_index: "0.00",
        } as Pricing;
        expect(isPricingEmpty(emptyPricing)).toBe(true);
    });

    test("with a pricing with some lines", () => {
        const nonEmptyPricing = {
            lines: [{final_price: "123.45"} as PricingLine],
            tariff_grid_line: null,
            overridden_gas_index: "0.00",
        } as Pricing;
        expect(isPricingEmpty(nonEmptyPricing)).toBe(false);
    });

    test("with a pricing with a tariff grid line", () => {
        const nonEmptyPricing = {
            lines: [] as PricingLine[],
            tariff_grid_line: {final_price: "234.56"} as TariffGridLine,
            overridden_gas_index: "0.00",
        } as Pricing;
        expect(isPricingEmpty(nonEmptyPricing)).toBe(false);
    });

    test("with a pricing with an overridden fuel surcharge", () => {
        const nonEmptyPricing = {
            lines: [] as PricingLine[],
            tariff_grid_line: null,
            overridden_gas_index: "345.67",
        } as Pricing;
        expect(isPricingEmpty(nonEmptyPricing)).toBe(false);
    });
});
