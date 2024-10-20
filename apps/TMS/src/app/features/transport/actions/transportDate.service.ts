import {parseAndZoneDate} from "dashdoc-utils";

import type {Transport} from "app/types/transport";

export const getLastLoadingRealDate = (transport: Transport, timezone: string): Date | null => {
    let lastLoadingRealDate: Date | null = null;
    transport.deliveries.forEach((delivery) => {
        const parsedLoadingDate = parseAndZoneDate(
            delivery.origin.real_end || delivery.origin.real_start,
            timezone
        );
        if (
            parsedLoadingDate !== null &&
            (lastLoadingRealDate === null || parsedLoadingDate > lastLoadingRealDate)
        ) {
            lastLoadingRealDate = parsedLoadingDate;
        }
    });
    return lastLoadingRealDate;
};
