import {FilterData, getStaticListFilter} from "@dashdoc/web-common";
import {TransportsBusinessStatus} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {TranslationKeys, t} from "@dashdoc/web-core";
import {checkType} from "dashdoc-utils";

import {
    TRANSPORTS_TO_APPROVE_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_BILLING_TAB,
} from "app/types/businessStatus";

import {TransportStatusQuery} from "./statusFilter.types";

const BUSINESS_STATUS_TRANSLATION_KEYS = [
    {translationKey: "sidebar.transports.toConfirm", value: TRANSPORTS_TO_APPROVE_TAB},
    {
        translationKey: "sidebar.toPlan",
        value: TRANSPORTS_TO_PLAN_TAB,
    },
    {translationKey: "sidebar.toSendToTrucker", value: TRANSPORTS_TO_SEND_TO_TRUCKER_TAB},
    {translationKey: "sidebar.ongoing", value: TRANSPORTS_ONGOING_TAB},
    {translationKey: "sidebar.done", value: TRANSPORTS_DONE_TAB},
    {translationKey: "sidebar.billing", value: TRANSPORTS_BILLING_TAB},
] as const;

checkType<Readonly<{translationKey: TranslationKeys; value: TransportsBusinessStatus}[]>>(
    BUSINESS_STATUS_TRANSLATION_KEYS
);

export function getBusinessStatusLabel(status: TransportsBusinessStatus): string {
    const translationKey = BUSINESS_STATUS_TRANSLATION_KEYS.find((item) => item.value === status)
        ?.translationKey;
    if (translationKey !== undefined) {
        return t(translationKey);
    }
    return status;
}

export function getTransportStatusFilter(ignore = false): FilterData<TransportStatusQuery> {
    const items = BUSINESS_STATUS_TRANSLATION_KEYS.map(({translationKey, value}) => ({
        label: t(translationKey),
        value,
    }));
    return getStaticListFilter<TransportStatusQuery>({
        key: "transport-status",
        label: t("filter.transportStatus"),
        icon: "checkList",
        items,
        queryKey: "transport_status__in",
        ignore,
        testId: "transport-status",
    });
}
