import {fetchDetailAction} from "@dashdoc/web-common";

import {fetchAdd} from "./base-actions";

import type {Site, TransportStatus} from "app/types/transport";

export function fetchAddTransportStatus(transportStatus: Partial<TransportStatus>) {
    return fetchAdd("transport-status", "transport-status", transportStatus);
}

export function fetchCancelOnSiteStatus(
    siteUid: Site["uid"],
    transportStatusUid: TransportStatus["uid"]
) {
    return fetchDetailAction(
        "sites",
        "site",
        "cancel-on-site-status",
        "POST",
        null,
        siteUid,
        {event_uid: transportStatusUid},
        null
    );
}
