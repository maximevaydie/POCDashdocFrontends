import {fetchDetailAction, fetchListAction} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Trailer, TransportAddress, Vehicle} from "dashdoc-utils";

import {transportSchema} from "../schemas";

import type {Site} from "app/types/transport";

type UpdateBreakSegmentScheduledDate = {
    extended_view?: boolean;
    segment_to_break_site: {
        uid: string;
        scheduled_end_range: {start: string | null; end: string | null};
    };
    segment_from_break_site: {
        uid: string;
        scheduled_start_range: {start: string | null; end: string | null};
    };
};

export function fetchUpdateBreakSegmentScheduledDate(payload: UpdateBreakSegmentScheduledDate) {
    return fetchListAction(
        "segments",
        "segment",
        "update-break-scheduled-date",
        "POST",
        null,
        payload,
        t("common.updateSaved"),
        undefined,
        "v4"
    );
}

export function fetchBreakSegment(
    uid: string,
    site:
        | Partial<Site>
        | {
              address:
                  | number
                  | (Pick<TransportAddress, Exclude<"pk", "company">> & {
                        pk?: number;
                        company?: number;
                    })
                  | undefined;
          },
    truckerPk: number,
    vehicle: Partial<Vehicle>,
    trailers: Array<Partial<Trailer>>,
    sendToTrucker: boolean,
    deliveryUid?: string,
    extended_view = false
) {
    return fetchDetailAction(
        "segments",
        "segment",
        "break",
        "POST",
        null,
        uid,
        {
            site,
            trucker_id: truckerPk ? {pk: truckerPk} : null,
            vehicle,
            trailers,
            send_to_trucker: sendToTrucker,
            delivery_uid: deliveryUid,
            extended_view: extended_view,
        },
        transportSchema,
        t("segments.segmentBreakAdded"), // "Rupture de charge ajoutée",
        undefined,
        "v4"
    );
}
