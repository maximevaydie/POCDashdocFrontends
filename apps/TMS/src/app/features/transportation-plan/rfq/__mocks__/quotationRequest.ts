import {SimpleContact, SlimCompany} from "dashdoc-utils";

import {aCompany} from "app/services/transport/__mocks__/companyMocks";
import {QuotationRequest} from "app/types/rfq";

const atlanticTransport: SlimCompany = {
    pk: 1,
    name: "Atlantic Transport",
};

const chuckTransport: SlimCompany = {
    pk: 2,
    name: "Chuck Transport",
};

const marchadourTransport: SlimCompany = {
    pk: 3,
    name: "Marchadour Transport",
};

const aContact: SimpleContact = {
    uid: "",
    created: "",
    company: aCompany,
    created_by: 0,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@nowhere.com",
    phone_number: "",
    language: "fr",
    jobs: [],
    does_receive_share_emails: false,
    does_receive_reminder_emails: false,
};

const anotherContact: SimpleContact = {
    uid: "",
    created: "",
    company: aCompany,
    created_by: 0,
    first_name: "John long name",
    last_name: "Doe long name",
    email: "john.doe.long.email.to.test.the.display.and.trigger.the.crop@nowhere.com",
    phone_number: "",
    language: "fr",
    jobs: [],
    does_receive_share_emails: false,
    does_receive_reminder_emails: false,
};

export const quotationRequest: QuotationRequest = {
    pk: 0,
    created: "",
    expiration_date: null,
    comment: "",
    carrier_quotations: [
        {
            pk: 1,
            uid: "1",
            replied_date: null,
            carrier: atlanticTransport,
            contact: aContact,
            status: "PENDING",
            pricing: {
                overridden_gas_index: "",
                final_gas_index: "",
                lines: [
                    {
                        id: 10348,
                        description: "Prix convenu",
                        quantity: "1.000",
                        unit_price: "149.000",
                        currency: "EUR",
                        // @ts-ignore
                        invoice_item: null,
                        // @ts-ignore
                        is_gas_indexed: null,
                    },
                ],
            },
            comment: "This is a comment",
        },
        {
            pk: 2,
            uid: "2",
            replied_date: null,
            carrier: chuckTransport,
            contact: anotherContact,
            status: "REJECTED",
            pricing: {
                overridden_gas_index: "",
                final_gas_index: "",
                lines: [
                    {
                        id: 10349,
                        description: "Prix convenu",
                        quantity: "2.000",
                        unit_price: "100.000",
                        currency: "EUR",
                        // @ts-ignore
                        invoice_item: null,
                        // @ts-ignore
                        is_gas_indexed: null,
                    },
                ],
            },
            comment: "This is a comment",
        },
        {
            pk: 3,
            uid: "3",
            replied_date: null,
            carrier: marchadourTransport,
            contact: aContact,
            status: "REPLIED",
            pricing: {
                overridden_gas_index: "",
                final_gas_index: "",
                lines: [
                    {
                        id: 10350,
                        description: "Prix convenu",
                        quantity: "1.000",
                        unit_price: "100.000",
                        currency: "EUR",
                        // @ts-ignore
                        invoice_item: null,
                        // @ts-ignore
                        is_gas_indexed: null,
                    },
                    {
                        id: 1035,
                        description: "Prix convenu supplémentaire",
                        quantity: "1.000",
                        unit_price: "50.000",
                        currency: "EUR",
                        // @ts-ignore
                        invoice_item: null,
                        // @ts-ignore
                        is_gas_indexed: null,
                    },
                ],
            },
            comment: "This is a comment",
        },
    ],
};
