import {
    BusinessStatus,
    TransportsBusinessStatus,
    OrdersBusinessStatus,
    BUSINESS_STATUSES,
} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {checkType, stringifyQueryObject} from "dashdoc-utils";
export const TRANSPORTS_TAB = "transports";
export const TRANSPORTS_TO_APPROVE_TAB = "transports_to_approve";
export const TRANSPORTS_TO_PLAN_TAB = "transports_to_plan";
export const TRANSPORTS_TO_SEND_TO_TRUCKER_TAB = "transports_to_send_to_trucker";
export const TRANSPORTS_ONGOING_TAB = "transports_ongoing";
export const TRANSPORTS_DONE_TAB = "transports_done_or_cancelled";
export const TRANSPORTS_BILLING_TAB = "transports_billed_or_billable";
export const TRANSPORTS_DELETED_OR_DECLINED_TAB = "transports_deleted_or_declined";
export const ORDERS_TAB = "orders";
export const ORDERS_TO_ASSIGN_OR_DECLINED_TAB = "orders_to_assign_or_declined";
export const ORDERS_TO_SEND_TO_CARRIER_TAB = "orders_to_send_to_carrier";
export const ORDERS_AWAITING_CONFIRMATION_TAB = "orders_awaiting_carrier_confirmation";
export const ORDERS_ONGOING_TAB = "orders_ongoing";
export const ORDERS_DONE_OR_CANCELLED_TAB = "orders_done_or_cancelled";
export const ORDERS_CHECKED_TAB = "orders_checked";
export const ORDERS_DELETED_TAB = "orders_deleted";

// Let's ensure That the tabs correspond exactly to the business statuses
// Using typescript tricks 🪄
const allTabs = [
    TRANSPORTS_TAB,
    TRANSPORTS_TO_APPROVE_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_BILLING_TAB,
    TRANSPORTS_DELETED_OR_DECLINED_TAB,
    ORDERS_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_CHECKED_TAB,
    ORDERS_DELETED_TAB,
] as const;
type AllTabsType = (typeof allTabs)[number];
checkType<Readonly<BusinessStatus[]>>(allTabs);
checkType<Readonly<AllTabsType[]>>(BUSINESS_STATUSES);

export type TransportBusinessStatusesDescriptor = {
    tabName: TransportsBusinessStatus;
    path: "transports";
    query: {
        business_status: TransportsBusinessStatus;
        tab: TransportsBusinessStatus;
        archived?: false;
    };
    link: string;
};

type TransportBusinessStatusesType = {
    [Property in TransportsBusinessStatus]: TransportBusinessStatusesDescriptor;
};

export const TransportBusinessStatuses: TransportBusinessStatusesType = {
    [TRANSPORTS_TAB]: {
        tabName: TRANSPORTS_TAB,
        path: "transports",
        query: {
            business_status: TRANSPORTS_TAB,
            tab: TRANSPORTS_TAB,
            archived: false,
        },
        link: `/app/transports/`,
    },
    [TRANSPORTS_TO_APPROVE_TAB]: {
        tabName: TRANSPORTS_TO_APPROVE_TAB,
        path: "transports",
        query: {
            business_status: TRANSPORTS_TO_APPROVE_TAB,
            tab: TRANSPORTS_TO_APPROVE_TAB,
            archived: false,
        },
        link: `/app/transports/`,
    },
    [TRANSPORTS_TO_PLAN_TAB]: {
        tabName: TRANSPORTS_TO_PLAN_TAB,
        path: "transports",
        query: {
            business_status: TRANSPORTS_TO_PLAN_TAB,
            tab: TRANSPORTS_TO_PLAN_TAB,
            archived: false,
        },
        link: `/app/transports/`,
    },
    [TRANSPORTS_TO_SEND_TO_TRUCKER_TAB]: {
        tabName: TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
        path: "transports",
        query: {
            business_status: TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
            tab: TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
            archived: false,
        },
        link: `/app/transports/`,
    },
    [TRANSPORTS_ONGOING_TAB]: {
        tabName: TRANSPORTS_ONGOING_TAB,
        path: "transports",
        query: {
            business_status: TRANSPORTS_ONGOING_TAB,
            tab: TRANSPORTS_ONGOING_TAB,
            archived: false,
        },
        link: `/app/transports/`,
    },
    [TRANSPORTS_DONE_TAB]: {
        tabName: TRANSPORTS_DONE_TAB,
        path: "transports",
        query: {business_status: TRANSPORTS_DONE_TAB, tab: TRANSPORTS_DONE_TAB, archived: false},
        link: `/app/transports/`,
    },
    [TRANSPORTS_BILLING_TAB]: {
        tabName: TRANSPORTS_BILLING_TAB,
        path: "transports",
        query: {
            business_status: TRANSPORTS_BILLING_TAB,
            tab: TRANSPORTS_BILLING_TAB,
            archived: false,
        },
        link: `/app/transports/`,
    },
    [TRANSPORTS_DELETED_OR_DECLINED_TAB]: {
        tabName: TRANSPORTS_DELETED_OR_DECLINED_TAB,
        path: "transports",
        query: {
            business_status: TRANSPORTS_DELETED_OR_DECLINED_TAB,
            tab: TRANSPORTS_DELETED_OR_DECLINED_TAB,
            /* Implicitly archived: undefined, */
        },
        link: `/app/transports/`,
    },
};

export type OrderBusinessStatusesDescriptor = {
    tabName: OrdersBusinessStatus;
    path: "orders";
    query: {
        business_status: OrdersBusinessStatus;
        tab: OrdersBusinessStatus;
        archived?: false;
    };
    link: string;
};

type OrderBusinessStatusesType = {
    [key in OrdersBusinessStatus]: OrderBusinessStatusesDescriptor;
};
export const OrderBusinessStatuses: OrderBusinessStatusesType = {
    [ORDERS_TAB]: {
        tabName: ORDERS_TAB,
        path: "orders",
        query: {
            business_status: ORDERS_TAB,
            tab: ORDERS_TAB,
            archived: false,
        },
        link: `/app/orders/`,
    },
    [ORDERS_TO_ASSIGN_OR_DECLINED_TAB]: {
        tabName: ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
        path: "orders",
        query: {
            business_status: ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
            tab: ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
            archived: false,
        },
        link: `/app/orders/`,
    },
    [ORDERS_TO_SEND_TO_CARRIER_TAB]: {
        tabName: ORDERS_TO_SEND_TO_CARRIER_TAB,
        path: "orders",
        query: {
            business_status: ORDERS_TO_SEND_TO_CARRIER_TAB,
            tab: ORDERS_TO_SEND_TO_CARRIER_TAB,
            archived: false,
        },
        link: `/app/orders/`,
    },
    [ORDERS_AWAITING_CONFIRMATION_TAB]: {
        tabName: ORDERS_AWAITING_CONFIRMATION_TAB,
        path: "orders",
        query: {
            business_status: ORDERS_AWAITING_CONFIRMATION_TAB,
            tab: ORDERS_AWAITING_CONFIRMATION_TAB,
            archived: false,
        },
        link: `/app/orders/`,
    },
    [ORDERS_ONGOING_TAB]: {
        tabName: ORDERS_ONGOING_TAB,
        path: "orders",
        query: {business_status: ORDERS_ONGOING_TAB, tab: ORDERS_ONGOING_TAB, archived: false},
        link: `/app/orders/`,
    },
    [ORDERS_DONE_OR_CANCELLED_TAB]: {
        tabName: ORDERS_DONE_OR_CANCELLED_TAB,
        path: "orders",
        query: {
            business_status: ORDERS_DONE_OR_CANCELLED_TAB,
            tab: ORDERS_DONE_OR_CANCELLED_TAB,
            archived: false,
        },
        link: `/app/orders/`,
    },
    [ORDERS_CHECKED_TAB]: {
        tabName: ORDERS_CHECKED_TAB,
        path: "orders",
        query: {
            business_status: ORDERS_CHECKED_TAB,
            tab: ORDERS_CHECKED_TAB,
            archived: false,
        },
        link: `/app/orders/`,
    },
    [ORDERS_DELETED_TAB]: {
        tabName: ORDERS_DELETED_TAB,
        path: "orders",
        query: {
            business_status: ORDERS_DELETED_TAB,
            tab: ORDERS_DELETED_TAB,
            /* Implicitly archived: undefined, */
        },
        link: `/app/orders/`,
    },
};

export const getFullPathToBusinessStatus = (businessStatus: BusinessStatus) => {
    const allBusinessStatuses = {...TransportBusinessStatuses, ...OrderBusinessStatuses};
    const {link, query} = allBusinessStatuses[businessStatus];
    return `${link}?${stringifyQueryObject(query)}`;
};
