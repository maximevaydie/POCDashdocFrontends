import {InvoiceNumberingPostData} from "app/taxation/invoicing/types/invoiceSettingsTypes";

import {previewFirstDashdocInvoiceNumber} from "../previewFirstDashdocInvoiceNumber";

describe("previewFirstDashdocInvoiceNumber, case 'keep former numbering'", () => {
    it("should return the correct invoice number when no reset", () => {
        // No reset + last invoice date outside dashdoc is 01/01/2020
        const numberingData: InvoiceNumberingPostData = {
            prefix_template: "FAC-[[year]]-[[month]]-",
            reset_period: "never",
            last_invoice_date_outside_dashdoc: "2020-01-01",
            last_invoice_number_outside_dashdoc: 10,
        };
        let invoicingDate;
        // When invoicing Date 01/01/2020
        invoicingDate = new Date("2020-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-01-11`
        );
        // When invoicing date 02/02/2020
        invoicingDate = new Date("2020-02-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-02-11`
        );
    });

    it("should return the correct invoice number when monthly reinitialization", () => {
        // Monthly reset + last invoice date outside dashdoc is 01/01/2020
        const numberingData: InvoiceNumberingPostData = {
            prefix_template: "FAC-[[year]]-[[month]]-",
            reset_period: "month",
            last_invoice_date_outside_dashdoc: "2020-01-01",
            last_invoice_number_outside_dashdoc: 10,
        };
        let invoicingDate;
        // When invoicing Date 01/01/2020
        invoicingDate = new Date("2020-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-01-11`
        );
        // When invoicing date 01/02/2020
        invoicingDate = new Date("2020-02-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-02-1`
        );
    });

    it("should return the correct invoice number when yearly reinitialization", () => {
        // Yearly reset + last invoice date outside dashdoc is 01/01/2020
        const numberingData: InvoiceNumberingPostData = {
            prefix_template: "FAC-[[year]]-[[month]]-",
            reset_period: "year",
            last_invoice_date_outside_dashdoc: "2020-01-01",
            last_invoice_number_outside_dashdoc: 10,
        };
        let invoicingDate;
        // When invoicing Date 01/01/2020
        invoicingDate = new Date("2020-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-01-11`
        );
        // When invoicing date 01/02/2020
        invoicingDate = new Date("2020-02-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-02-11`
        );
        // When invoicing date 01/01/2021
        invoicingDate = new Date("2021-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2021-01-1`
        );
    });
});

describe("previewFirstDashdocInvoiceNumber, case 'start new numbering'", () => {
    it("should return the correct invoice number when no reset", () => {
        // No reset + last invoice date outside dashdoc is null
        const numberingData: InvoiceNumberingPostData = {
            prefix_template: "FAC-[[year]]-[[month]]-",
            reset_period: "never",
            last_invoice_date_outside_dashdoc: null,
            last_invoice_number_outside_dashdoc: 10,
        };
        let invoicingDate;
        // When invoicing Date 01/12/2019
        invoicingDate = new Date("2019-12-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2019-12-11`
        );
        // When invoicing Date 01/01/2020
        invoicingDate = new Date("2020-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-01-11`
        );
        // When invoicing date 02/02/2020
        invoicingDate = new Date("2020-02-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-02-11`
        );
    });

    it("should return the correct invoice number when monthly reinitialization", () => {
        // Monthly reset + last invoice date outside dashdoc is null
        const numberingData: InvoiceNumberingPostData = {
            prefix_template: "FAC-[[year]]-[[month]]-",
            reset_period: "month",
            last_invoice_date_outside_dashdoc: null,
            last_invoice_number_outside_dashdoc: 10,
        };
        let invoicingDate;
        // When invoicing Date 01/12/2019
        invoicingDate = new Date("2019-12-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2019-12-11`
        );
        // When invoicing Date 01/01/2020
        invoicingDate = new Date("2020-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-01-11`
        );
        // When invoicing date 01/02/2020
        invoicingDate = new Date("2020-02-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-02-11`
        );
    });

    it("should return the correct invoice number when yearly reinitialization", () => {
        // Yearly reset + last invoice date outside dashdoc is null
        const numberingData: InvoiceNumberingPostData = {
            prefix_template: "FAC-[[year]]-[[month]]-",
            reset_period: "year",
            last_invoice_date_outside_dashdoc: null,
            last_invoice_number_outside_dashdoc: 10,
        };
        let invoicingDate;
        // When invoicing Date 01/12/2019
        invoicingDate = new Date("2019-12-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2019-12-11`
        );
        // When invoicing Date 01/01/2020
        invoicingDate = new Date("2020-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-01-11`
        );
        // When invoicing date 01/02/2020
        invoicingDate = new Date("2020-02-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2020-02-11`
        );
        // When invoicing date 01/01/2021
        invoicingDate = new Date("2021-01-01");
        expect(previewFirstDashdocInvoiceNumber(numberingData, invoicingDate)).toBe(
            `FAC-2021-01-11`
        );
    });
});
