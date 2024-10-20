import {periodOptions} from "@dashdoc/web-common";
import {
    ORDERS_BUSINESS_STATUSES,
    TRANSPORTS_BUSINESS_STATUSES,
} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {z} from "zod";

export const TransportsSettingsSchema = z.object({
    period: z.enum(periodOptions).nullable().optional(),
    start_date: z.string().nullable().optional(),
    end_date: z.string().nullable().optional(),
    loading_period: z.enum(periodOptions).nullable().optional(),
    loading_start_date: z.string().nullable().optional(),
    loading_end_date: z.string().nullable().optional(),
    unloading_period: z.enum(periodOptions).nullable().optional(),
    unloading_start_date: z.string().nullable().optional(),
    unloading_end_date: z.string().nullable().optional(),
    duration_on_site__gte: z.string().optional(),

    address__in: z.array(z.string()).optional(),
    origin_address__in: z.array(z.string()).optional(),
    destination_address__in: z.array(z.string()).optional(),
    address_text: z.string().optional(),
    address_postcode__in: z.string().optional(),
    address_country__in: z.string().optional(),
    origin_address_text: z.string().optional(),
    origin_address_postcode__in: z.string().optional(),
    origin_address_country__in: z.string().optional(),
    destination_address_text: z.string().optional(),
    destination_address_postcode__in: z.string().optional(),
    destination_address_country__in: z.string().optional(),

    text: z.array(z.string()).optional(),
    shipper__in: z.array(z.string()).optional(),
    parent_shipper__in: z.array(z.string()).optional(),
    carrier__in: z.array(z.string()).optional(),
    subcontracted_carrier__in: z.array(z.string()).optional(),
    debtor__in: z.array(z.string()).optional(),
    creator__in: z.array(z.string()).optional(),
    trucker__in: z.array(z.string()).optional(),
    tags__in: z.array(z.string()).optional(),
    invoicing_status__in: z
        .array(z.enum(["unverified", "verified", "draft", "final", "paid"]))
        .optional(),
    transport_status__in: z.array(z.enum(TRANSPORTS_BUSINESS_STATUSES)).optional(),
    order_status__in: z.array(z.enum(ORDERS_BUSINESS_STATUSES)).optional(),
    has_dangerous_goods: z.boolean().optional().nullable(),
    subcontracted_transports: z.boolean().optional().nullable(),

    // transport alerts
    has_price: z.boolean().optional().nullable(),
    has_carbon_footprint: z.boolean().optional().nullable(),
    has_booking_needed: z.boolean().optional().nullable(),
    has_cmr_to_be_checked: z.boolean().optional().nullable(),
    has_complete_cmr_document: z.boolean().optional().nullable(),
    has_non_cmr_document: z.boolean().optional().nullable(),
    has_observations: z.boolean().optional().nullable(),
    has_weight_to_be_checked: z.boolean().optional().nullable(),
    has_customer_to_invoice: z.boolean().optional().nullable(),
    has_missing_invoice_item: z.boolean().optional().nullable(),
    has_edition_by_trucker: z.boolean().optional().nullable(),

    // transport dashboard
    loading_duration__lte: z.string().optional().nullable(),
    loading_duration__gt: z.string().optional().nullable(),
    unloading_duration__lte: z.string().optional().nullable(),
    unloading_duration__gt: z.string().optional().nullable(),
    origin_arrival_delay__lte: z.string().optional().nullable(),
    origin_arrival_delay__gt: z.string().optional().nullable(),
    destination_arrival_delay__lte: z.string().optional().nullable(),
    destination_arrival_delay__gt: z.string().optional().nullable(),
    destination_arrival_delay: z.string().optional().nullable(),
    origin_arrival_delay: z.string().optional().nullable(),
    cancelled: z.boolean().optional().nullable(),
    is_done: z.boolean().optional().nullable(),
    is_order: z.boolean().optional().nullable(),
    is_child: z.boolean().optional().nullable(),
});

export type TransportsSettings = z.infer<typeof TransportsSettingsSchema>;

export const TransportsAndOrdersSettingsSchema = TransportsSettingsSchema.merge(
    z.object({
        archived: z.boolean().optional(),
    })
);
export type TransportsAndOrdersSettings = z.infer<typeof TransportsAndOrdersSettingsSchema>;

export const TransportsToInvoiceSettingsSchema = TransportsSettingsSchema.omit({
    carrier__in: true,
}).merge(
    z.object({
        archived: z.boolean().optional(),
        debtor__in: z.array(z.string()).optional(),
        created_period: z.enum(periodOptions).nullable().optional(),
        created_start_date: z.string().nullable().optional(),
        created_end_date: z.string().nullable().optional(),
        credit_note_document_number: z.string().optional().nullable(),
    })
);
export type TransportsToInvoiceSettings = z.infer<typeof TransportsToInvoiceSettingsSchema>;

export type TranportsSettingsViewCategory =
    | "transports"
    | "orders"
    | "transports_and_orders"
    | "transports_to_invoice"
    | "transports_dashboard";
