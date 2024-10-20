import {useTimezone} from "@dashdoc/web-common";
import {formatNumber} from "dashdoc-utils";
import React from "react";

import {getTurnoverByResource} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useSelector} from "app/redux/hooks";
import {getPlannedTripsForCurrentQuery} from "app/redux/selectors";

export function RevenueCell({
    resourceUid,
    view,
    startDate,
    endDate,
}: {
    resourceUid: string;
    view: TripSchedulerView;
    startDate: Date;
    endDate: Date;
}) {
    const timezone = useTimezone();
    const agreedPrice = useSelector((state) => {
        const trips = getPlannedTripsForCurrentQuery(state);
        const rowTurnover = getTurnoverByResource(
            resourceUid,
            trips,
            view,
            startDate,
            endDate,
            timezone
        );
        return rowTurnover
            ? formatNumber(rowTurnover, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
              })
            : "--";
    });
    return <>{agreedPrice}</>;
}
