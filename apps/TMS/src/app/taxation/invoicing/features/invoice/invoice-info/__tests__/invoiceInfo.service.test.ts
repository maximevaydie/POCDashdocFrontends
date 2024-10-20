import {invoice} from "app/features/pricing/invoices/invoice-details/__mocks__/invoice";
import {Invoice} from "app/taxation/invoicing/types/invoice.types";

import {invoiceInfoService} from "../invoiceInfo.service";

const invoiceItem1 = {
    uid: "b9fd614d-5b06-4a9f-839e-b19fa8e0ae01",
    description: "product 1",
    remote_id: "",
    tax_code: {
        remote_id: "",
        tax_rate: "10.00",
        description: "France 10% VAT rate",
    },
};
const invoiceItem2 = {
    uid: "b9fd614d-5b06-4a9f-839e-b19fa8e0ae02",
    description: "product 2",
    remote_id: "",
    tax_code: {
        remote_id: "",
        tax_rate: "20.00",
        description: "France 20% VAT rate",
    },
};
const invoiceItem3 = {
    uid: "b9fd614d-5b06-4a9f-839e-b19fa8e0ae03",
    description: "product 3",
    remote_id: "",
    tax_code: {
        remote_id: "",
        tax_rate: "30.00",
        description: "France 30% VAT rate",
    },
};
const invoiceWithInvoiceItems: Invoice = {
    ...invoice,
    line_groups: [
        {
            ...invoice.line_groups[0],
            lines: [
                {
                    id: 10348,
                    description: "Prix convenu",
                    quantity: "1.000",
                    unit_price: "149.00",
                    amount: "149.00",
                    currency: "EUR",
                    invoice_item: invoiceItem1,
                    is_gas_indexed: false,
                    tax_rate: "10.00",
                },
            ],
        },
        {
            ...invoice.line_groups[1],
            lines: [
                {
                    id: 10354,
                    description: "Prix convenu",
                    quantity: "1.000",
                    unit_price: "1009.00",
                    amount: "1009.00",
                    currency: "EUR",
                    invoice_item: invoiceItem1,
                    is_gas_indexed: false,
                    tax_rate: "10.00",
                },
            ],
        },
        {
            ...invoice.line_groups[2],
            lines: [
                {
                    id: 10349,
                    description: "Déplacement",
                    quantity: "1.000",
                    unit_price: "320.00",
                    amount: "320.00",
                    currency: "EUR",
                    invoice_item: invoiceItem3,
                    is_gas_indexed: false,
                    tax_rate: "30.00",
                },
            ],
        },
    ],
    lines: [
        {
            id: 128450,
            description: "Transport",
            quantity: "1.000",
            unit_price: "25.00",
            amount: "25.00",
            currency: "EUR",
            invoice_item: invoiceItem1,
            is_gas_indexed: true,
            tax_rate: "10.00",
        },
        {
            id: 128451,
            description: "Transport",
            quantity: "1.000",
            unit_price: "20.00",
            amount: "20.00",
            currency: "EUR",
            invoice_item: invoiceItem2,
            is_gas_indexed: true,
            tax_rate: "20.00",
        },
    ],
};

test("on draft invoice", () => {
    expect(invoiceInfoService.getInvoiceItemsSummary(invoiceWithInvoiceItems)).toStrictEqual([
        {
            label: "product 1",
            amount: 149 + 1009 + 25,
            uid: invoiceItem1.uid,
        },
        {
            label: "product 3",
            amount: 320,
            uid: invoiceItem3.uid,
        },
        {
            label: "product 2",
            amount: 20,
            uid: invoiceItem2.uid,
        },
    ]);
});
