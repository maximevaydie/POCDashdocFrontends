import {useTimezone} from "@dashdoc/web-common";
import {formatNumber} from "dashdoc-utils";
import React, {useMemo} from "react";

import {DedicatedResourcesView} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";

import {CharteringView, RawCarrierCharteringSchedulerSegment} from "../chartering-scheduler.types";

import {getTurnoverByResource} from "./revenue.service";

export function RevenueCell({
    resourceUid,
    charteringSegments,
    startDate,
    endDate,
    viewType,
}: {
    resourceUid: string;
    charteringSegments: RawCarrierCharteringSchedulerSegment[];
    startDate: Date;
    endDate: Date;
    viewType: CharteringView | DedicatedResourcesView;
}) {
    const timezone = useTimezone();
    const agreedPrice = useMemo(() => {
        const rowTurnover = getTurnoverByResource(
            resourceUid,
            charteringSegments,
            startDate,
            endDate,
            timezone,
            viewType
        );
        return rowTurnover
            ? formatNumber(rowTurnover, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
              })
            : "--";
    }, [endDate, resourceUid, startDate, timezone, charteringSegments, viewType]);
    return <>{agreedPrice}</>;
}
