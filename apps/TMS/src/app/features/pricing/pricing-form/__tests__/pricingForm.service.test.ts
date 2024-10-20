import {InvoiceItem, type FuelSurchargeLine} from "dashdoc-utils";

import {PricingFormData, PricingFormLine, TariffGridLineForm} from "app/services/invoicing";

import {PricingTotal, pricingFormService} from "../pricingForm.service";

const testComputeTotal = (pricingForm: PricingFormData, expected: PricingTotal) => {
    const total = pricingFormService.computeTotal(pricingForm, true, true);
    expect(total).toEqual(expected);
};

describe("computeTotal without VAT", () => {
    const A_LINE_100: PricingFormLine = {
        description: "",
        metric: "FLAT",
        unit_price: "100.000",
        quantity: "1.000",
        is_gas_indexed: true,
        isOverridden: true,
        invoice_item: null,
        currency: "EUR",
    };

    const FUEL_SURCHARGE_LINE: FuelSurchargeLine = {
        name: "FSL",
        quantity: "1.000",
        created_by: {
            pk: 1,
            name: "Some company",
            group_view_id: undefined,
        },
        invoice_item: null,
    };

    const GAS_INDEX = "1.00";

    test("with an empty pricingForm", () => {
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: null,
            lines: [],
        };
        const expectedWithEnabledVAT: PricingTotal = {
            totalGross: 0,
            gasIndex: 0,
            fuelSurcharge: 0,
            vat: 0,
        };
        const expectedWithDisabledVAT: PricingTotal = {
            totalGross: 0,
            gasIndex: 0,
            fuelSurcharge: 0,
            vat: undefined,
        };
        expect(pricingFormService.computeTotal(pricingForm, false, false)).toEqual(
            expectedWithDisabledVAT
        );
        expect(pricingFormService.computeTotal(pricingForm, true, false)).toEqual(
            expectedWithDisabledVAT
        );
        expect(pricingFormService.computeTotal(pricingForm, true, true)).toEqual(
            expectedWithEnabledVAT
        );
        expect(pricingFormService.computeTotal(pricingForm, false, true)).toEqual(
            expectedWithEnabledVAT
        );
    });

    test("with one line, 0 gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: "0",
            gas_index_invoice_item: null,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: 0,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with one line, 1% gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: null,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: 1,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with two lines, 1% gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: null,
            lines: [A_LINE_100, A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 200,
            gasIndex: 2,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with one fuel surcharge line", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: null,
            fuel_surcharge_line: FUEL_SURCHARGE_LINE,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: 1,
            fuelSurcharge: 1,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with one fuel surcharge line and no gas index", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: "0",
            gas_index_invoice_item: null,
            fuel_surcharge_line: FUEL_SURCHARGE_LINE,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: 0,
            fuelSurcharge: 1,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });

    const A_GRID_1000: TariffGridLineForm = {
        changed: false,
        tariff_grid_version_uid: "",
        tariff_grid_name: "",
        final_quantity: "1.000",
        final_unit_price: "1000.000",
        final_price: "1000.00",
        gas_index: GAS_INDEX,
        metric: "FLAT",
        pricing_policy: "flat",
        is_gas_indexed: true,
        invoice_item: null,
        description: "",
        currency: "€",
        owner_type: "carrier",
        tariff_grid_creator_company_id: 1,
        tariff_grid_creator_group_view_id: null,
    };

    test("with a tariff grid, 1% gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: null,
            lines: [],
            tariff_grid_line: A_GRID_1000,
        };
        const expected: PricingTotal = {
            totalGross: 1000,
            gasIndex: 10,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with two lines and a tariff grid pricingForm under gas index", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: null,
            lines: [A_LINE_100, A_LINE_100],
            tariff_grid_line: A_GRID_1000,
        };
        const expected: PricingTotal = {
            totalGross: 1200,
            gasIndex: 12,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with a tariff grid, 1% fuel surcharge", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: "0",
            gas_index_invoice_item: null,
            lines: [],
            tariff_grid_line: A_GRID_1000,
            fuel_surcharge_line: FUEL_SURCHARGE_LINE,
        };
        const expected: PricingTotal = {
            totalGross: 1000,
            gasIndex: 0,
            fuelSurcharge: 10,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });
});

describe("computeTotal with VAT 10%", () => {
    const INVOICE_ITEM_10: InvoiceItem = {
        uid: null,
        description: "",
        remote_id: "",
        tax_code: {remote_id: "", tax_rate: "10.00", description: ""},
    };

    const A_LINE_100: PricingFormLine = {
        description: "",
        metric: "FLAT",
        unit_price: "100.000",
        quantity: "1.000",
        is_gas_indexed: true,
        isOverridden: true,
        invoice_item: INVOICE_ITEM_10,
        currency: "EUR",
    };
    const A_LINE_WITHOUT_VAT: PricingFormLine = {
        description: "",
        metric: "FLAT",
        unit_price: "100.00",
        quantity: "1.000",
        is_gas_indexed: true,
        isOverridden: true,
        invoice_item: null,
        currency: "EUR",
    };

    const GAS_INDEX = "1.00";

    test("with an empty pricingForm", () => {
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [],
        };
        const expectedWithEnabledVAT: PricingTotal = {
            totalGross: 0,
            gasIndex: 0,
            fuelSurcharge: 0,
            vat: 0,
        };
        const expectedWithDisabledVAT: PricingTotal = {
            totalGross: 0,
            gasIndex: 0,
            fuelSurcharge: 0,
            vat: undefined,
        };
        expect(pricingFormService.computeTotal(pricingForm, false, false)).toEqual(
            expectedWithDisabledVAT
        );
        expect(pricingFormService.computeTotal(pricingForm, true, false)).toEqual(
            expectedWithDisabledVAT
        );
        expect(pricingFormService.computeTotal(pricingForm, true, true)).toEqual(
            expectedWithEnabledVAT
        );
        expect(pricingFormService.computeTotal(pricingForm, false, true)).toEqual(
            expectedWithEnabledVAT
        );
    });

    test("with one line, 0 gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: "0",
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: 0,
            fuelSurcharge: 0,
            vat: 10 + 0,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with one line, 1% gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: 1,
            fuelSurcharge: 0,
            vat: 10 + 0.1,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with two lines, 1% gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [A_LINE_100, A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 200,
            gasIndex: 2,
            fuelSurcharge: 0,
            vat: 20 + 0.2,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with one line, -1% gas index", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: "-1",
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: -1,
            fuelSurcharge: 0,
            vat: 9.9,
        };
        testComputeTotal(pricingForm, expected);
    });

    const A_GRID_1000: TariffGridLineForm = {
        changed: false,
        tariff_grid_version_uid: "",
        tariff_grid_name: "",
        final_quantity: "1.000",
        final_unit_price: "1000.000",
        final_price: "1000.00",
        gas_index: GAS_INDEX,
        metric: "FLAT",
        pricing_policy: "flat",
        is_gas_indexed: true,
        invoice_item: INVOICE_ITEM_10,
        description: "",
        currency: "€",
        owner_type: "carrier",
        tariff_grid_creator_company_id: 1,
        tariff_grid_creator_group_view_id: null,
    };
    const A_GRID_WITHOUT_VAT: TariffGridLineForm = {
        changed: false,
        tariff_grid_version_uid: "",
        tariff_grid_name: "",
        final_quantity: "1.000",
        final_unit_price: "1000.00",
        final_price: "1000.00",
        gas_index: GAS_INDEX,
        metric: "FLAT",
        pricing_policy: "flat",
        is_gas_indexed: true,
        invoice_item: null,
        description: "",
        currency: "€",
        owner_type: "carrier",
        tariff_grid_creator_company_id: 1,
        tariff_grid_creator_group_view_id: null,
    };

    test("with a tariff grid, 1% gasIndex", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: INVOICE_ITEM_10,
            tariff_grid_line: A_GRID_1000,
            lines: [],
        };
        const expected: PricingTotal = {
            totalGross: 1000,
            gasIndex: 10,
            fuelSurcharge: 0,
            vat: 100 + 1,
        };
        testComputeTotal(pricingForm, expected);
    });

    test("with two lines and tariff grid pricingForm under gas index", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [A_LINE_100, A_LINE_100],
            tariff_grid_line: A_GRID_1000,
        };
        const expected: PricingTotal = {
            totalGross: 1200,
            gasIndex: 12,
            fuelSurcharge: 0,
            vat: 120 + 1.2,
        };
        testComputeTotal(pricingForm, expected);
    });
    test("with one line with VAT and one without", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [A_LINE_100, A_LINE_WITHOUT_VAT],
        };
        const expected: PricingTotal = {
            totalGross: 200,
            gasIndex: 2,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });
    test("with one line with VAT and tariff grid without VAT", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: INVOICE_ITEM_10,
            lines: [A_LINE_100],
            tariff_grid_line: A_GRID_WITHOUT_VAT,
        };
        const expected: PricingTotal = {
            totalGross: 1100,
            gasIndex: 11,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });
    test("with one line with VAT but gas index without VAT", () => {
        // GIVEN a pricingForm
        const pricingForm: PricingFormData = {
            dismissed_automatic_fuel_surcharge_application: false,
            gas_index: GAS_INDEX,
            gas_index_invoice_item: null,
            lines: [A_LINE_100],
        };
        const expected: PricingTotal = {
            totalGross: 100,
            gasIndex: 1,
            fuelSurcharge: 0,
            vat: null,
        };
        testComputeTotal(pricingForm, expected);
    });
});

describe("computeVat", () => {
    const PRICE = 100;

    const EMPTY_INVOICE_ITEM: InvoiceItem = {
        uid: null,
        description: "",
        remote_id: "",
        tax_code: null,
    };

    test("with a price and a null tax_code", () => {
        // GIVEN an invoiceItem without tax_code
        const invoiceItem: InvoiceItem = {...EMPTY_INVOICE_ITEM};
        // WHEN I compute the VAT
        expect(pricingFormService.computeVat(PRICE, invoiceItem))
            // THEN it works
            .toBe(null);
    });

    test("with a price and an invalid tax_code", () => {
        // GIVEN an invalid invoiceItem
        const invoiceItem: InvoiceItem = {
            ...EMPTY_INVOICE_ITEM,
            tax_code: {remote_id: "", tax_rate: "", description: ""},
        };
        // WHEN I compute the VAT
        expect(pricingFormService.computeVat(PRICE, invoiceItem))
            // THEN it works
            .toBe(null);
    });

    test("with a price and an invalid tax_code", () => {
        // GIVEN an invalid invoiceItem
        const invoiceItem: InvoiceItem = {
            ...EMPTY_INVOICE_ITEM,
            tax_code: {remote_id: "", tax_rate: "", description: ""},
        };
        // WHEN I compute the VAT
        expect(pricingFormService.computeVat(PRICE, invoiceItem))
            // THEN it works
            .toBe(null);
    });

    test("with a price and a 0% tax_code", () => {
        // GIVEN an invoiceItem at 0%
        const price = 100;
        const invoiceItem: InvoiceItem = {
            ...EMPTY_INVOICE_ITEM,
            tax_code: {remote_id: "", tax_rate: "0", description: ""},
        };
        // WHEN I compute the VAT
        expect(pricingFormService.computeVat(price, invoiceItem))
            // THEN it works
            .toBe(0);
    });

    test("with a price and a 10% tax_code", () => {
        // GIVEN an invoiceItem at 10%
        const invoiceItem: InvoiceItem = {
            ...EMPTY_INVOICE_ITEM,
            tax_code: {remote_id: "", tax_rate: "10", description: ""},
        };
        // WHEN I compute the VAT
        expect(pricingFormService.computeVat(PRICE, invoiceItem))
            // THEN it works
            .toBe(10);
    });
});
