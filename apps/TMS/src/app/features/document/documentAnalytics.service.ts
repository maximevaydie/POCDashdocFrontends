import {AnalyticsEvent, analyticsService} from "@dashdoc/web-common";
import {User} from "dashdoc-utils";

function sendExtractedReferenceUsedAnalyticsEvent(
    user: User | undefined,
    companyId: number | undefined,
    modalType: "edition_modal" | "document_modal",
    actionType: "add" | "replace"
) {
    analyticsService.sendEvent(AnalyticsEvent.extractedReferenceUsed, {
        "is staff": user?.is_staff,
        "company id": companyId,
        "modal type": modalType,
        "action type": actionType,
    });
}

function sendDocumentModalOpenedAnalyticsEvent(
    user: User | undefined,
    companyId: number | undefined,
    openedFrom:
        | "transport_details_documents_panel"
        | "transport_details_status_list"
        | "transports_list"
        | "truckers_dashboard"
        | "invoice"
) {
    analyticsService.sendEvent(AnalyticsEvent.documentModalOpened, {
        "is staff": user?.is_staff,
        "company id": companyId,
        "opened from": openedFrom,
    });
}

export const documentAnalyticsService = {
    sendExtractedReferenceUsedAnalyticsEvent,
    sendDocumentModalOpenedAnalyticsEvent,
};
