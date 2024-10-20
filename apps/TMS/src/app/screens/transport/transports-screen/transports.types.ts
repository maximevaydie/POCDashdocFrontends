import {Period} from "@dashdoc/web-common";
import {
    BusinessStatus,
    OrdersBusinessStatus,
    TransportsBusinessStatus,
} from "@dashdoc/web-common/src/types/businessStatusTypes";

import {TabName} from "app/common/tabs";
import {InvoiceStatusValue} from "app/features/filters/badges-and-selectors/transport-statuses/statusFilter.types";

export type TransportsScreenQuery = {
    tab: TabName;
    text?: string[];
    done?: boolean;
    archived?: boolean;
    deleted?: boolean;
    period?: Period | null;
    start_date?: string | null;
    end_date?: string | null;
    type_of_dates?: "real" | "planned"; //Warning: here planned will filter on slots (or created if there is no slots)
    address__in?: string[];
    origin_address__in?: string[];
    destination_address__in?: string[];
    address_country__in?: string;
    address_postcode__in?: string;
    destination_address_country__in?: string;
    destination_address_postcode__in?: string;
    origin_address_country__in?: string;
    origin_address_postcode__in?: string;
    shipper__in?: string[];
    parent_shipper__in?: string[];
    carrier__in?: string[];
    subcontracted_carrier__in?: string[];
    creator__in?: string[];
    trucker__in?: string[];
    debtor__in?: string[];
    is_done?: boolean | null;
    loading_duration__lte?: string | null;
    loading_duration__gt?: string | null;
    unloading_duration__lte?: string | null;
    unloading_duration__gt?: string | null;
    origin_arrival_delay?: string | null;
    origin_arrival_delay__lte?: string | null;
    origin_arrival_delay__gt?: string | null;
    destination_arrival_delay?: string | null;
    destination_arrival_delay__lte?: string | null;
    destination_arrival_delay__gt?: string | null;
    ordering?: string;
    fleet_tags__in?: string[];
    tags__in?: string[];
    invoicing_status__in?: InvoiceStatusValue[];
    transport_status__in?: TransportsBusinessStatus[];
    order_status__in?: OrdersBusinessStatus[];
    is_order?: boolean | null;
    isExtendedSearch?: boolean;
    business_status?: BusinessStatus;

    loading_period?: Period | null;
    loading_start_date?: string | null;
    loading_end_date?: string | null;
    unloading_period?: Period | null;
    unloading_start_date?: string | null;
    unloading_end_date?: string | null;
    has_price?: boolean | null;
    has_carbon_footprint?: boolean | null;
    has_booking_needed?: boolean | null;
    has_cmr_to_be_checked?: boolean | null;
    has_complete_cmr_document?: boolean | null;
    has_non_cmr_document?: boolean | null;
    has_observations?: boolean | null;
    has_weight_to_be_checked?: boolean | null;
    has_customer_to_invoice?: boolean | null;
    has_missing_invoice_item?: boolean | null;
    has_edition_by_trucker?: boolean | null;
    has_dangerous_goods?: boolean | null;
    cancelled?: boolean | null;
    duration_on_site__gte?: string;
    subcontracted_transports?: boolean | null;
};

export type TransportsScreenCleanedQuery = Partial<
    Omit<
        TransportsScreenQuery,
        | "period"
        | "start_date"
        | "end_date"
        | "type_of_dates"
        | "loading_period"
        | "loading_start_date"
        | "loading_end_date"
        | "unloading_period"
        | "unloading_start_date"
        | "unloading_end_date"
    >
> & {
    real_date__in?: string[];
    planned_date__in?: string[]; // Warning: here planned corresponds to slots
    origin_address__in?: string[];
    destination_address__in?: string[];
    date__in?: string[];
    origin_date__in?: string[];
    destaintion_date__in?: string[];
};
export type TransportsScreenUpdateQuery = (
    newQuery: Partial<TransportsScreenQuery>,
    method?: "push" | "replace",
    location?: string
) => void;
