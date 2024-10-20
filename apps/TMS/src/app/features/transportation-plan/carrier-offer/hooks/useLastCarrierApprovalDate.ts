import {useTimezone} from "@dashdoc/web-common";
import {formatDate, parseAndZoneDate} from "dashdoc-utils";
import {toDate} from "date-fns-tz";
import {useMemo} from "react";

import {carrierApprovalService} from "../../services/carrierApproval.service";

import type {TransportStatus} from "app/types/transport";
import type {Transport} from "app/types/transport";

export function useLastCarrierApprovalDate(transport: Transport): string | null {
    const carrierApprovalStatus = carrierApprovalService.getStatus(transport);
    const timezone = useTimezone();
    const {status_updates} = transport;
    const lastApprovalStatus: TransportStatus | null = useMemo(() => {
        if (carrierApprovalStatus === "ordered") {
            return null;
        }

        for (let i = status_updates.length - 1; i >= 0; i--) {
            const lastUpdate = status_updates[i];

            if (carrierApprovalStatus === "requested" && isCarrierSetOnEvent(lastUpdate)) {
                return lastUpdate;
            }

            const {category} = lastUpdate;
            if (carrierApprovalStatus === "accepted" && category === "confirmed") {
                return lastUpdate;
            }

            if (carrierApprovalStatus === "declined" && category === "declined") {
                return lastUpdate;
            }

            if (carrierApprovalStatus === "cancelled" && category === "cancelled") {
                return lastUpdate;
            }
        }

        return null;
    }, [status_updates, carrierApprovalStatus]);

    const date: string | null = useMemo(() => {
        let result = null;
        if (lastApprovalStatus) {
            result = formatDate(
                parseAndZoneDate(
                    toDate(lastApprovalStatus.created_device || lastApprovalStatus.created),
                    timezone
                ),
                "PPPp"
            );
        }
        return result;
    }, [timezone, lastApprovalStatus]);

    return date;
}

function isCarrierSetOnEvent(event: TransportStatus): boolean {
    return (
        event.category === "created" ||
        (event.category === "updated" && event.update_details?.carrier_address)
    );
}
