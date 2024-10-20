export const TRANSPORTS_BUSINESS_STATUSES = [
    "transports",
    "transports_to_approve",
    "transports_to_plan",
    "transports_to_send_to_trucker",
    "transports_ongoing",
    "transports_done_or_cancelled",
    "transports_billed_or_billable",
    "transports_deleted_or_declined",
] as const;

export const ORDERS_BUSINESS_STATUSES = [
    "orders",
    "orders_to_assign_or_declined",
    "orders_to_send_to_carrier",
    "orders_awaiting_carrier_confirmation",
    "orders_ongoing",
    "orders_done_or_cancelled",
    "orders_checked",
    "orders_deleted",
] as const;

/**To Keep in sync with the backend `BUSINESS_STATUSES` */
export const BUSINESS_STATUSES = [
    ...TRANSPORTS_BUSINESS_STATUSES,
    ...ORDERS_BUSINESS_STATUSES,
] as const;

export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];
export type TransportsBusinessStatus = (typeof TRANSPORTS_BUSINESS_STATUSES)[number];
export type OrdersBusinessStatus = (typeof ORDERS_BUSINESS_STATUSES)[number];
