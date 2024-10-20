import {SupportedLocale} from "@dashdoc/web-core";
import {
    Address,
    Connector,
    InvoiceItem,
    InvoicingAddress,
    MessageDocumentType,
} from "dashdoc-utils";
import {CountryCode} from "libphonenumber-js";

import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";
import {PaymentMethod} from "app/taxation/invoicing/types/paymentMethods.types";

import {
    CreditNoteCommunicationStatus,
    InvoiceCommunicationStatus,
} from "./communicationStatus.types";
import {CreditNoteStatus} from "./creditNote.types";
import {
    InvoiceGroupMode,
    InvoiceLine,
    InvoiceMergedLineGroups,
    InvoiceMergeLinesBy,
    LineGroup,
} from "./invoiceOrCreditNote.types";

export interface AddOrUpdateInvoiceLine {
    description: string;
    quantity: string;
    unit_price: string;
    invoice_item_uid: string | null;
}

export interface InvoiceLineGroup extends LineGroup {
    gas_index: string | null;
    gas_index_invoice_item: InvoiceItem | null;
}

export interface InvoiceDebtor {
    name: string;
    pk: number;
    notes: string;
    primary_address?: Address;
    invoicing_address?: InvoicingAddress;
    country: CountryCode;
    vat_number: string;
    invoicing_remote_id: string;
}
export type InvoiceStatus = "draft" | "final" | "paid";

/** A partially fetched invoice, for example from the list or search endpoints */
export interface PartialInvoice {
    /**
     * Must be kept in sync with the backend `InvoiceWebListElementOutputSerializer` serializer.
     *
     * TL;DR:
     * Use `isFullInvoice` from "app/services/invoicing" to discriminate
     * between a `IPartialInvoiceOrCreditNote` and an `IInvoiceOrCreditNote`.
     *
     * More details:
     * Note that `__partial` can be both `true` or `undefined` for `IPartialInvoiceOrCreditNote`,
     * so an invoice will be considered partial if it has been explicitly marked as such
     * or if the marker is missing (not all API methods implement this marking yet).
     *
     * However, it can only be `false` for `IInvoiceOrCreditNote`,
     * so an invoice will be considered "complete" only if it has been explicitly marked as such.
     *
     * The fact that only one of the interfaces accepts `undefined` for the `__partial`
     * avoid the weird case where we don't really know whether it is partial
     * and helps with type narrowing without having to check all the other fields.
     * */
    __partial?: true;
    uid: string;
    created_by: InvoiceCreatedBy;
    document_number: string;
    due_date: string;
    currency: string;
    created: string;
    invoicing_date: string;
    communication_statuses: InvoiceCommunicationStatus[];
    file: string;
    // Specific to invoice
    status: InvoiceStatus;
    debtor: InvoiceDebtor;
    is_bare_invoice: boolean;
    total_price: string; // The total price of the invoice without taxes
    total_tax_amount: string | null; // The total amount of taxes (null for non-dashdoc invoices)
    transports_count: number;
    period: {
        first_loading_at: string;
        last_unloading_at: string;
    };
    credit_notes: Array<CreditNoteLink>;
    is_payment_late: boolean;
    paid_at: string | null;
    payment_method: Pick<PaymentMethod, "uid" | "name"> | null;
    payment_notes: string;
}

export type InvoiceAttachment = {
    uid: string;
    name: string;
    file_url: string;
    file_size: number;
    created: string;
};

/** A fully fetched invoice, for example from the retrieve endpoint.
 *
 * Must be kept in sync with the backend `InvoiceOutputSerializer` serializer.
 */
export interface Invoice {
    __partial: false;
    uid: string;
    created_by: InvoiceCreatedBy;
    document_number: string | null;
    due_date: string | null;
    currency: string;
    created: string;
    invoicing_date: string | null;
    communication_statuses: InvoiceCommunicationStatus[];
    file: string | null;
    transports_count: number;
    lines: InvoiceLine[];
    merge_by: InvoiceMergeLinesBy | null;
    group_mode: InvoiceGroupMode | null;
    line_groups: Array<InvoiceLineGroup>;
    status: InvoiceStatus;
    debtor: InvoiceDebtor;
    is_bare_invoice: boolean;
    total_price: string; // The total price of the invoice without taxes
    total_tax_amount: string | null; // The total amount of taxes (null for non-dashdoc invoices)
    period: {
        first_loading_at: string;
        last_unloading_at: string;
    };
    credit_notes: Array<CreditNoteLink>;

    description_template: {
        uid: string;
        name: string;
    } | null;
    remote_id: string;
    invoicing_connector: Connector | null;
    debtor_reference: string;
    is_dashdoc: boolean;
    free_text: string;
    show_carbon_footprint: boolean | null; // TODO: remove nullability when backend is ready
    total_carbon_footprint: string | null;
    number_of_transports_with_carbon_footprint: string | null;
    number_of_transports_without_carbon_footprint: string | null;
    is_payment_late: boolean;
    attachments: InvoiceAttachment[];
    bank_information: Pick<InvoiceBankInformation, "uid" | "name"> | null;
    language: SupportedLocale;
    transports_groups_in_invoice: InvoiceMergedLineGroups[];
    fuel_surcharge_in_footer: boolean;
    paid_at: string | null;
    payment_method: Pick<PaymentMethod, "uid" | "name"> | null;
    payment_notes: string;
}

export interface CreditNoteLink {
    uid: string;
    status: CreditNoteStatus;
    document_number: string | null;
    total_tax_free_amount: string;
    total_tax_amount: string;
    currency: string;
    created: string;
    communication_statuses: CreditNoteCommunicationStatus[];
}

export interface InvoiceCreatedBy {
    name: string;
    pk: number;
    primary_address?: Address;
    country: CountryCode;
    vat_number: string;
    settings_logo: string | null;
}

// Must be kept in sync with the backend `InvoiceMergeByInputValidator` serializer.
export interface PatchInvoiceMergeBy {
    // If null, the merge info will become null.
    merge_by: InvoiceMergeLinesBy;
    group_mode: InvoiceGroupMode;
    // If merge_by null, this filed is useless.
    // If undefined => compute default description
    description?: string;
}

// Must be kept in sync with the backend `ShareInvoiceInputValidator` serializer.
export type ShareInvoicePayload = {
    emails: string[];
    transport_document_types: MessageDocumentType[];
    include_invoice_attachments: boolean;
};

// Must be kept in sync with the backend `SendInvoiceReminderInputValidator` serializer.
export type InvoiceReminderPayload = {
    emails: string[];
};
