import {
    BusinessStatus,
    ORDERS_BUSINESS_STATUSES,
    TRANSPORTS_BUSINESS_STATUSES,
} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {t} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";

import {
    OrderBusinessStatuses,
    OrderBusinessStatusesDescriptor,
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_DELETED_TAB,
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    TransportBusinessStatuses,
    TransportBusinessStatusesDescriptor,
    TRANSPORTS_BILLING_TAB,
    TRANSPORTS_DELETED_OR_DECLINED_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_TO_APPROVE_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
} from "app/types/businessStatus";

export const getEmptyListText = (businessStatus: BusinessStatus): string => {
    switch (businessStatus) {
        case ORDERS_TO_ASSIGN_OR_DECLINED_TAB:
            return t("transportEmptyList.orders.toAssignUpToDate");
        case ORDERS_AWAITING_CONFIRMATION_TAB:
            return t("transportEmptyList.orders.awaitingConfirmationEmpty");
        case ORDERS_ONGOING_TAB:
            return t("transportEmptyList.orders.ongoingEmpty");
        case ORDERS_DONE_OR_CANCELLED_TAB:
            return t("transportEmptyList.orders.doneEmpty");
        case ORDERS_DELETED_TAB:
            return t("transportEmptyList.bin");

        case TRANSPORTS_TO_APPROVE_TAB:
            return t("transportEmptyList.transport.toApproveUpToDate");
        case TRANSPORTS_TO_PLAN_TAB:
            return t("transportEmptyList.transport.toPlanUpToDate");
        case TRANSPORTS_TO_SEND_TO_TRUCKER_TAB:
            return t("transportEmptyList.transport.toSendToTruckerUpToDate");
        case TRANSPORTS_ONGOING_TAB:
            return t("transportEmptyList.transport.ongoingEmpty");
        case TRANSPORTS_DONE_TAB:
            return t("transportEmptyList.transport.doneEmpty");
        case TRANSPORTS_BILLING_TAB:
            return t("transportEmptyList.transport.billingEmpty");
        case TRANSPORTS_DELETED_OR_DECLINED_TAB:
            return t("transportEmptyList.bin");
        default:
            return t("common.noResultFound");
    }
};

export const getEmptyListIconName = (businessStatus: BusinessStatus): IconNames | null => {
    if ([ORDERS_DELETED_TAB, TRANSPORTS_DELETED_OR_DECLINED_TAB].includes(businessStatus)) {
        return "bin";
    }

    if ((ORDERS_BUSINESS_STATUSES as Readonly<BusinessStatus[]>).includes(businessStatus)) {
        return "cart";
    }

    if ((TRANSPORTS_BUSINESS_STATUSES as Readonly<BusinessStatus[]>).includes(businessStatus)) {
        return "truck";
    }

    return null;
};

type TabDetails = {
    buttonLabel: string | null;
    link:
        | OrderBusinessStatusesDescriptor["link"]
        | TransportBusinessStatusesDescriptor["link"]
        | null;
    query:
        | OrderBusinessStatusesDescriptor["query"]
        | TransportBusinessStatusesDescriptor["query"]
        | null;
};

export const getNextTabDetails = (currentTabName: BusinessStatus): TabDetails => {
    let businessStatus = null;
    let nextTabDetails: TabDetails = {
        buttonLabel: null,
        link: null,
        query: null,
    };

    switch (currentTabName) {
        case ORDERS_TO_ASSIGN_OR_DECLINED_TAB:
        case ORDERS_AWAITING_CONFIRMATION_TAB:
        case ORDERS_DONE_OR_CANCELLED_TAB:
            nextTabDetails.buttonLabel = t("transportEmptyList.orders.seeMyOngoingOrders");
            businessStatus = OrderBusinessStatuses[ORDERS_ONGOING_TAB];
            break;
        case ORDERS_ONGOING_TAB:
            nextTabDetails.buttonLabel = t("transportEmptyList.orders.seeMyDoneOrders");
            businessStatus = OrderBusinessStatuses[ORDERS_DONE_OR_CANCELLED_TAB];
            break;

        case TRANSPORTS_TO_APPROVE_TAB:
        case TRANSPORTS_TO_PLAN_TAB:
        case TRANSPORTS_TO_SEND_TO_TRUCKER_TAB:
            nextTabDetails.buttonLabel = t("transportEmptyList.transport.seeMyOngoingTransports");
            businessStatus = TransportBusinessStatuses[TRANSPORTS_ONGOING_TAB];
            break;
        case TRANSPORTS_ONGOING_TAB:
        case TRANSPORTS_BILLING_TAB:
            nextTabDetails.buttonLabel = t("transportEmptyList.transport.seeMyDoneTransports");
            businessStatus = TransportBusinessStatuses[TRANSPORTS_DONE_TAB];
            break;
        case TRANSPORTS_DONE_TAB:
            nextTabDetails.buttonLabel = t(
                "transportEmptyList.transport.seeMyTransportsInInvoicing"
            );
            businessStatus = TransportBusinessStatuses[TRANSPORTS_BILLING_TAB];
            break;
        default:
            break;
    }

    if (businessStatus) {
        nextTabDetails.link = businessStatus.link;
        nextTabDetails.query = businessStatus.query;
    }

    return nextTabDetails;
};
