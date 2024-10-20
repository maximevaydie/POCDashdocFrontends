import {AnalyticsEvent, analyticsService} from "@dashdoc/web-common";
import {Company} from "dashdoc-utils";

function sendTransportsSearchAnalyticsEvent(
    companyId: Company["pk"] | undefined,
    triggeredFrom: "transports_list" | "top_bar"
) {
    analyticsService.sendEvent(AnalyticsEvent.transportsSearch, {
        "company id": companyId,
        "triggered from": triggeredFrom,
        url: window.location.href,
    });
}

export const transportsListAnalyticsService = {
    sendTransportsSearchAnalyticsEvent,
};
