export type TransportAlertQuery = {
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
};
export type TransportDelayAndDurationDashboardQuery = {
    loading_duration__lte?: string | null;
    loading_duration__gt?: string | null;
    unloading_duration__lte?: string | null;
    unloading_duration__gt?: string | null;
    origin_arrival_delay__lte?: string | null;
    origin_arrival_delay__gt?: string | null;
    destination_arrival_delay__lte?: string | null;
    destination_arrival_delay__gt?: string | null;
};
export type TransportPunctualityDashboardQuery = {
    destination_arrival_delay__gt?: string | null;
    origin_arrival_delay__gt?: string | null;
    destination_arrival_delay?: string | null;
    origin_arrival_delay?: string | null;
};
export type TransportProgressDashboardQuery = {
    cancelled?: boolean | null;
    is_done?: boolean | null;
};
export type TransportTypesQuery = {
    is_order?: boolean | null;
    is_child?: boolean | null;
};
