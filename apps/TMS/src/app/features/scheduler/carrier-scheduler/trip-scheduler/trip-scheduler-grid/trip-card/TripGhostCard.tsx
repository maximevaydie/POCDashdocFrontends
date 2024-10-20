import {Box} from "@dashdoc/web-ui";
import {GhostComponentProps} from "@dashdoc/web-ui";
import React, {FunctionComponent, useContext} from "react";

import {useDates} from "app/features/scheduler/carrier-scheduler/hooks/useDates";
import {TripSchedulerCard} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/card/TripSchedulerCard";
import {UnplannedCardGhost} from "app/features/trip/pool-of-unplanned-trips/UnplannedCardGhost";
import {CompactTrip} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getCompactTripByUid} from "app/redux/selectors";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

export const tripGhostCards: Record<string, FunctionComponent<GhostComponentProps>> = {
    "*": DefaultGhost,
    planned: PlannedGhost,
};
function DefaultGhost({item, style}: GhostComponentProps) {
    const {entity} = item;
    const trip = entity as CompactTrip;
    return (
        <Box style={style}>
            <UnplannedCardGhost trip={trip} dragItemsCount={1} />
        </Box>
    );
}

function PlannedGhost({item, style}: GhostComponentProps) {
    const {currentQuery} = useContext(PoolCurrentQueryContext);
    const {startDate, endDate} = useDates(currentQuery);
    const {entity} = item;
    const trip = entity as CompactTrip;
    const draggedTrip = useSelector((state) => getCompactTripByUid(state, trip.uid));
    if (draggedTrip) {
        return (
            <Box style={style}>
                <TripSchedulerCard
                    width="230px"
                    isSelected={false}
                    trip={draggedTrip}
                    schedulerStartDate={startDate}
                    schedulerEndDate={endDate}
                />
            </Box>
        );
    } else {
        return <DefaultGhost item={item} style={style} />;
    }
}
