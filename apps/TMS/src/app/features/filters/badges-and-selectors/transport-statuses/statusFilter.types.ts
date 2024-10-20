import {
    OrdersBusinessStatus,
    TransportsBusinessStatus,
} from "@dashdoc/web-common/src/types/businessStatusTypes";

export type TransportStatusQuery = {
    transport_status__in?: Array<TransportsBusinessStatus>;
};
export type OrderStatusQuery = {
    order_status__in?: Array<OrdersBusinessStatus>;
};

export type InvoiceStatusValue = "unverified" | "verified" | "draft" | "final" | "paid";
export type TransportInvoicingStatusQuery = {
    invoicing_status__in?: Array<InvoiceStatusValue>;
};
