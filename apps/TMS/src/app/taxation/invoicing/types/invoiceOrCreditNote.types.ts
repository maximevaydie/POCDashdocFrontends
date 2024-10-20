import {
    DeliveryDocumentType,
    InvoiceItem,
    MessageDocumentType,
    PricingMetricKey,
} from "dashdoc-utils";

import {InvoiceLineGroup} from "app/taxation/invoicing/types/invoice.types";

export interface LineGroup {
    id: number;
    transport: InvoiceTransport;
    lines: Array<InvoiceLine>;
    /**The total price of the invoice line group without taxes*/
    total_price_without_tax: string;
    description: string;
    ordering_datetime: string;
}

export interface InvoiceTransportDeliverySite {
    uid: string;
    company_name: string;
    city: string;
}

export interface InvoiceTransportDelivery {
    uid: string;
    origin: InvoiceTransportDeliverySite;
    destination: InvoiceTransportDeliverySite;
}

export interface InvoiceTransportDocument {
    delivery: string;
    file: string;
    reference: string;
    category: DeliveryDocumentType;
}

export interface InvoiceTransportMessage {
    document: string;
    reference: string;
    document_type: MessageDocumentType;
    author_company_id: number | null;
    uid: string;
    extracted_reference: string | null;
}

export interface InvoiceTransport {
    uid: string;
    sequential_id: number;
    deliveries: InvoiceTransportDelivery[];
    documents: InvoiceTransportDocument[];
    messages: InvoiceTransportMessage[];
}

export const INVOICE_MERGE_BY = [
    "NONE",
    "ALL_GROUPS",
    "TRUCKER",
    "TRAILER",
    "VEHICLE",
    "LOADING_ADDRESS",
    "UNLOADING_ADDRESS",
    "LOADING_AND_UNLOADING_ADDRESS",
    "CARRIER_REFERENCE",
    "SHIPPER_REFERENCE",
    "TAG",
    "UNIT_PRICE",
    "LOAD",
    "CREATION_DATE",
    "FIRST_LOADING_ASKED_DATE",
    "FIRST_LOADING_PLANNED_DATE",
    "FIRST_LOADING_REAL_DATE",
    "LAST_UNLOADING_ASKED_DATE",
    "LAST_UNLOADING_PLANNED_DATE",
    "LAST_UNLOADING_REAL_DATE",
    "UNIT_PRICE",
    "TAG",
    "PLANNED_LOAD",
    "LOADED_LOAD",
    "UNLOADED_LOAD",
] as const;
export const INVOICE_GROUP_MODE = ["MERGED", "GROUPED", "DEFAULT"] as const;
export type InvoiceMergeLinesBy = (typeof INVOICE_MERGE_BY)[number];
export type InvoiceGroupMode = (typeof INVOICE_GROUP_MODE)[number];

export interface InvoiceLine {
    id: number;
    description: string;
    quantity: string;
    unit_price?: string;
    metric?: PricingMetricKey;
    is_fuel_surcharge?: boolean;
    /**The total price of the invoice line without taxes*/
    amount: string;
    currency: string;
    invoice_item?: InvoiceItem;
    is_gas_indexed?: boolean;
    tax_rate: string | null;
}

export interface InvoiceMergedLineGroups {
    id: number;
    uid: string;
    description: string;
    tax_rate: string;
    total_price_without_tax: string;
    line_groups: InvoiceLineGroup[];
    merge_by?: InvoiceMergeLinesBy | null;
}
