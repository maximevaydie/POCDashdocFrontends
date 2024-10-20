import {invoice} from "app/features/pricing/invoices/invoice-details/__mocks__/invoice";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import {invoiceActionsService} from "../invoiceActions.service";

const dashdocInvoiceDraft: Invoice = {
    ...invoice,
    is_dashdoc: true,
    invoicing_connector: null,
    status: "draft",
    document_number: null,
};
const dashdocInvoiceFinal: Invoice = {
    ...invoice,
    is_dashdoc: true,
    invoicing_connector: null,
    status: "final",
};
const dashdocInvoicePaid: Invoice = {
    ...invoice,
    is_dashdoc: true,
    invoicing_connector: null,
    status: "paid",
};
const dashdocInvoiceFullyDraftCredited: Invoice = {
    ...invoice,
    is_dashdoc: true,
    invoicing_connector: null,
    status: "paid",
    credit_notes: [
        {
            uid: "f1289ac8-12d1-426a-b45e-6de82291a2d4",
            status: "draft",
            document_number: null,
            total_tax_free_amount: "1518.00",
            total_tax_amount: "0.00",
            currency: "EUR",
            created: "2023-07-31T12:03:54.586931Z",
            communication_statuses: [],
        },
    ],
};
const dashdocInvoiceFullyFinalCredited: Invoice = {
    ...invoice,
    is_dashdoc: true,
    invoicing_connector: null,
    status: "paid",
    credit_notes: [
        {
            uid: "f1289ac8-12d1-426a-b45e-6de82291a2d4",
            status: "final",
            document_number: null,
            total_tax_free_amount: "1518.00",
            total_tax_amount: "0.00",
            currency: "EUR",
            created: "2023-07-31T12:03:54.586931Z",
            communication_statuses: [],
        },
    ],
};

const externalInvoiceDraft: Invoice = {
    ...invoice,
    status: "draft",
    document_number: null,
};
const externalInvoiceFinal: Invoice = {
    ...invoice,
    status: "final",
};
const externalInvoicePaid: Invoice = {
    ...invoice,
    status: "paid",
};

describe("Available Dashdoc Invoice Actions", () => {
    test("on draft invoice", () => {
        expect(invoiceActionsService.getMainActions("draft", false)).toStrictEqual(["markFinal"]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceDraft, false, true)
        ).toStrictEqual(["exportDocuments", "delete"]);
    });

    test("on final invoice", () => {
        expect(invoiceActionsService.getMainActions("final", false)).toStrictEqual(["markPaid"]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceFinal, false, true)
        ).toStrictEqual(["sendReminder", "createCreditNote", "exportDocuments"]);
    });
    test("on paid invoice", () => {
        expect(invoiceActionsService.getMainActions("paid", false)).toStrictEqual(["markNotPaid"]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoicePaid, false, true)
        ).toStrictEqual(["createCreditNote", "exportDocuments"]);
    });
    test("on credited invoice", () => {
        expect(invoiceActionsService.getMainActions("paid", false)).toStrictEqual(["markNotPaid"]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceFullyDraftCredited, false, true)
        ).toStrictEqual(["exportDocuments"]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceFullyFinalCredited, false, true)
        ).toStrictEqual(["exportDocuments"]);
    });
    test("on shared invoice", () => {
        expect(invoiceActionsService.getMainActions("draft", true)).toStrictEqual([
            "exportDocuments",
        ]);
        expect(invoiceActionsService.getMainActions("final", true)).toStrictEqual([
            "exportDocuments",
        ]);
        expect(invoiceActionsService.getMainActions("paid", true)).toStrictEqual([
            "exportDocuments",
        ]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceDraft, true, true)
        ).toStrictEqual([]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceFinal, true, true)
        ).toStrictEqual([]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoicePaid, true, true)
        ).toStrictEqual([]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceFullyDraftCredited, true, true)
        ).toStrictEqual([]);
        expect(
            invoiceActionsService.getExtraActions(dashdocInvoiceFullyFinalCredited, true, true)
        ).toStrictEqual([]);
    });
});

describe("Available External Invoice Actions", () => {
    test("on draft invoice", () => {
        expect(invoiceActionsService.getMainActions("draft", false)).toStrictEqual(["markFinal"]);
        expect(
            invoiceActionsService.getExtraActions(externalInvoiceDraft, false, false)
        ).toStrictEqual(["exportDocuments", "delete"]);
    });

    test("on final invoice", () => {
        expect(invoiceActionsService.getMainActions("final", false)).toStrictEqual(["markPaid"]);
        expect(
            invoiceActionsService.getExtraActions(externalInvoiceFinal, false, false)
        ).toStrictEqual(["markNotFinal", "exportDocuments"]);
    });
    test("on paid invoice", () => {
        expect(invoiceActionsService.getMainActions("paid", false)).toStrictEqual(["markNotPaid"]);
        expect(
            invoiceActionsService.getExtraActions(externalInvoicePaid, false, false)
        ).toStrictEqual(["exportDocuments"]);
    });

    test("on shared invoice", () => {
        expect(invoiceActionsService.getMainActions("draft", true)).toStrictEqual([
            "exportDocuments",
        ]);
        expect(invoiceActionsService.getMainActions("final", true)).toStrictEqual([
            "exportDocuments",
        ]);
        expect(invoiceActionsService.getMainActions("paid", true)).toStrictEqual([
            "exportDocuments",
        ]);
        expect(
            invoiceActionsService.getExtraActions(externalInvoiceDraft, true, false)
        ).toStrictEqual([]);
        expect(
            invoiceActionsService.getExtraActions(externalInvoiceFinal, true, false)
        ).toStrictEqual([]);
        expect(
            invoiceActionsService.getExtraActions(externalInvoicePaid, true, false)
        ).toStrictEqual([]);
    });
});
