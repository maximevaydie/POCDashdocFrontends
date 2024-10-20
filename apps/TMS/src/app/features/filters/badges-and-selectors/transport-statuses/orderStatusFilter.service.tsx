import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

import {
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
} from "app/types/businessStatus";

import {OrderStatusQuery} from "./statusFilter.types";

export function getOrderStatusFilter(ignore?: boolean): FilterData<OrderStatusQuery> {
    const items = [
        {label: t("sidebar.ordersToAssign"), value: ORDERS_TO_ASSIGN_OR_DECLINED_TAB},
        {
            label: t("sidebar.ordersToSend"),
            value: ORDERS_TO_SEND_TO_CARRIER_TAB,
        },
        {label: t("sidebar.ordersAwaitingConfirmation"), value: ORDERS_AWAITING_CONFIRMATION_TAB},
        {label: t("sidebar.orders.handledByCarriers"), value: ORDERS_ONGOING_TAB},
        {label: t("sidebar.orderDone"), value: ORDERS_DONE_OR_CANCELLED_TAB},
    ];
    return getStaticListFilter<OrderStatusQuery>({
        key: "order-status",
        label: t("filter.orderStatus"),
        icon: "checkList",
        items,
        queryKey: "order_status__in",
        ignore,
        testId: "order-status",
    });
}
