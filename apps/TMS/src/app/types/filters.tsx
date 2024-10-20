import {Period} from "@dashdoc/web-common";
import {
    BusinessStatus,
    OrdersBusinessStatus,
    TransportsBusinessStatus,
} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {FuelType} from "dashdoc-utils";

import {InvoiceStatusValue} from "app/features/filters/badges-and-selectors/transport-statuses/statusFilter.types";

/* TODO: Split this into TransportFilters & SchedulerFilter & ... */
export type BaseFilterParams = {
    address__in?: string[];
    address_country__in?: string;
    address_postcode__in?: string;
    address_text?: string;
    archived?: boolean;
    cancelled?: boolean | null;
    carrier__in?: string[];
    subcontracted_carrier__in?: string[];
    category?: string;
    company?: string;
    created__gte?: string;
    created__lte?: string;
    creation_method__in?: string[];
    creator__in?: string[];
    credit_note_document_number?: string | null;
    date?: string;
    debtor__in?: string[];
    customer__in?: string[];
    deleted?: boolean;
    destination_address__in?: string[];
    destination_address_country__in?: string;
    destination_address_postcode__in?: string;
    destination_address_text?: string;
    destination_arrival_delay__gt?: string | null;
    destination_arrival_delay__lte?: string | null;
    destination_arrival_delay?: string | null;
    done?: boolean;
    end_date?: string | null;
    fleet_tags__in?: string[];
    fuel_type__in?: FuelType[];
    has_cmr_to_be_checked?: boolean | null;
    has_complete_cmr_document?: boolean | null;
    has_non_cmr_document?: boolean | null;
    has_observations?: boolean | null;
    has_price?: boolean | null;
    has_trade_number?: boolean;
    has_vat_number?: boolean;
    has_invoicing_remote_id?: boolean;
    has_weight_to_be_checked?: boolean | null;
    invoicing_status__in?: InvoiceStatusValue[];
    transport_status__in?: TransportsBusinessStatus[];
    order_status__in?: OrdersBusinessStatus[];
    invitation_status?: string;
    is_child?: boolean | null;
    is_done?: boolean | null;
    is_order?: boolean | null;
    is_parent?: boolean | null;
    license_plate__in?: string[];
    loading_duration__gt?: string | null;
    loading_duration__lte?: string | null;
    ordering?: string;
    origin_address__in?: string[];
    origin_address_country__in?: string;
    origin_address_postcode__in?: string;
    origin_address_text?: string;
    origin_arrival_delay__gt?: string | null;
    origin_arrival_delay__lte?: string | null;
    origin_arrival_delay?: string | null;
    period?: Period | null;
    pool_end_date?: string | null;
    pool_period?: string | null;
    pool_start_date?: string | null;
    query?: string[];
    shipper__in?: string[];
    parent_shipper__in?: string[];
    start_date?: string | null;
    status?: InvoiceStatusValue; // Invoice statuses - This filter mechanism should be reworked!
    tags__in?: string[];
    text?: string[];
    timeout?: boolean;
    to_send_to_trucker?: boolean; // FIXME: Temporary solution: remove this in PR #9664
    trucker__in?: string[];
    trucker_tags__in?: string[];
    type_of_dates?:
        | "real"
        | "planned" //Warning: here planned will filter on slots (or created if there is no slots)
        | "loading"
        | "unloading"
        | "created";
    unloading_duration__gt?: string | null;
    unloading_duration__lte?: string | null;
    vehicle__in?: string[];
    trailer__in?: string[];
    business_status?: BusinessStatus;
    has_customer_to_invoice?: boolean | null;
    has_missing_invoice_item?: boolean | null;
    has_edition_by_trucker?: boolean | null;
    has_carbon_footprint?: boolean | null;
    has_booking_needed?: boolean | null;
    is_late?: boolean;
    loading_period?: Period | null;
    loading_start_date?: string | null;
    loading_end_date?: string | null;
    unloading_period?: Period | null;
    unloading_start_date?: string | null;
    unloading_end_date?: string | null;
    created_period?: Period | null;
    created_start_date?: string | null;
    created_end_date?: string | null;
    subcontracted_transports?: boolean | null;
};
