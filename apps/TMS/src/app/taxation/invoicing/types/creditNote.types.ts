import {SUPPORTED_LOCALES} from "@dashdoc/web-core";
import {CountryCode, Address, InvoicingAddress} from "dashdoc-utils";
import {z} from "zod";

import {CreditNoteCommunicationStatus} from "./communicationStatus.types";
import {
    INVOICE_GROUP_MODE,
    INVOICE_MERGE_BY,
    InvoiceLine,
    InvoiceMergedLineGroups,
    LineGroup,
} from "./invoiceOrCreditNote.types";

export const CREDIT_NOTE_STATUSES = ["draft", "final", "paid"] as const;
export type CreditNoteStatus = (typeof CREDIT_NOTE_STATUSES)[number];

export const invoiceLinkZodSchema = z.object({
    uid: z.string(),
    document_number: z.string().nullable(),
});
export type InvoiceLink = z.infer<typeof invoiceLinkZodSchema>;

export const creditNoteCustomerZodSchema = z.object({
    name: z.string(),
    pk: z.number(),
    invoicing_address: z.optional(z.custom<InvoicingAddress>()),
    country: z.custom<CountryCode>(),
    vat_number: z.string(),
});
export type CreditNoteCustomer = z.infer<typeof creditNoteCustomerZodSchema>;

export const creditNoteCreatedByZodSchema = z.object({
    name: z.string(),
    pk: z.number(),
    primary_address: z.optional(z.custom<Address>()),
    country: z.custom<CountryCode>(),
    vat_number: z.optional(z.string()),
    settings_logo: z.optional(z.string().nullable()),
});
export type CreditNoteCreatedBy = z.infer<typeof creditNoteCreatedByZodSchema>;

/** A fully fetched credit note, for example from the retrieve endpoint.
 *
 * Must be kept in sync with the backend `CreditNoteDetailsOutputSerializer` serializer.
 */
export const creditNoteZodSchema = z.object({
    is_list_element: z.literal(false),
    uid: z.string(),
    created_by: creditNoteCreatedByZodSchema,
    document_number: z.string().nullable(),
    due_date: z.string().nullable(),
    currency: z.string(),
    created: z.string(),
    invoicing_date: z.string().nullable(),
    communication_statuses: z.array(z.custom<CreditNoteCommunicationStatus>()),
    transports_count: z.number(),
    file: z.string().nullable(),
    lines: z.array(z.custom<InvoiceLine>()),
    merge_by: z.enum(INVOICE_MERGE_BY).nullable(),
    group_mode: z.enum(INVOICE_GROUP_MODE).nullable(),
    line_groups: z.array(z.custom<LineGroup>()),
    transports_groups_in_invoice: z.array(z.custom<InvoiceMergedLineGroups>()),
    // Specific to credit notes
    notes: z.string(),
    free_text: z.string(),
    status: z.enum(CREDIT_NOTE_STATUSES),
    customer: creditNoteCustomerZodSchema, // corresponds to debtor field in invoice
    total_tax_free_amount: z.string(), // The total price of the invoice without taxes (corresponds to total_price in invoice)
    total_tax_amount: z.string(), // The total amount of taxes (corresponds to total_tax_amount in invoice)
    generated_from: invoiceLinkZodSchema.nullable(),
    is_bare_credit_note: z.boolean(),
    language: z.enum(SUPPORTED_LOCALES),
});

export type CreditNote = z.infer<typeof creditNoteZodSchema>;
export const validateCreditNoteOrRaise = (data: unknown): CreditNote =>
    creditNoteZodSchema.parse(data);

export const creditNoteListElementZodSchema = z.object({
    is_list_element: z.literal(true),
    uid: z.string(),
    created_by: z.object({
        pk: z.number(),
    }),
    currency: z.string(),
    document_number: z.string().nullable(),
    due_date: z.string().nullable(),
    created: z.string(),
    invoicing_date: z.string().nullable(),
    communication_statuses: z.array(z.custom<CreditNoteCommunicationStatus>()),
    file: z.string().nullable(),
    period: z.object({
        first_loading_at: z.string(),
        last_unloading_at: z.string(),
    }),
    // Specific to credit notes

    status: z.enum(CREDIT_NOTE_STATUSES),
    customer: z.object({
        pk: z.number(),
        name: z.string(),
    }), // corresponds to debtor field in invoice
    total_tax_free_amount: z.string(), // The total price of the invoice without taxes (corresponds to total_price in invoice)
    total_tax_amount: z.string(), // The total amount of taxes (corresponds to total_tax_amount in invoice)
    transports_count: z.number(),
});
export type CreditNoteInList = z.infer<typeof creditNoteListElementZodSchema>;

export type ShareCreditNotePayload = {
    emails: string[];
};
