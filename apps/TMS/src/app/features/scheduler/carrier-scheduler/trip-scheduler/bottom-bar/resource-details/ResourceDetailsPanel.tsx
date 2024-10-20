import {useTimezone} from "@dashdoc/web-common";
import {Card, Flex, Box} from "@dashdoc/web-ui";
import {SCHEDULER_ZOOM_SCALE} from "@dashdoc/web-ui/src/scheduler/scheduler-by-time/SchedulerZoom";
import {schedulerDatesService} from "@dashdoc/web-ui/src/scheduler/scheduler-by-time/service/dates.service";
import {SiteSlot, parseAndZoneDate, zoneDateToISO} from "dashdoc-utils";
import React from "react";

import {useResources} from "app/features/scheduler/carrier-scheduler/hooks/useResources";
import {LoadUnitSelect} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/components/LoadUnitSelect";
import {getResourceUid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {useLoadsUnits} from "app/features/trip/hook/useLoadsUnits";
import {CompactTrip} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getTripByUid, getPlannedTripsForCurrentQuery} from "app/redux/selectors";
import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

import {ResourceHeader} from "./components/ResourceHeader";
import {ResourceLoadGraph} from "./components/ResourceLoadGraph";
import {ResourceTimeline} from "./components/ResourceTimeline";
import {TripsData} from "./components/TripsData";

type Props = {
    tripUid: string | null;
    view: TripSchedulerView;
    onTripSelected: (tripUid: string) => void;
    onTripHovered: (uid: string | null) => void;
    onActivityHovered: (value: {uid: string; count: number} | null) => void;
};
const minutesPerCell = SCHEDULER_ZOOM_SCALE[3];
export function ResourceDetailsPanel({
    tripUid,
    view,
    onTripSelected,
    onTripHovered,
    onActivityHovered,
}: Props) {
    const selectedTrip = useSelector((state) => (tripUid ? getTripByUid(state, tripUid) : null));
    const timezone = useTimezone();
    const tripStartDate = parseAndZoneDate(
        selectedTrip.scheduler_datetime_range.start,
        timezone
    ) as Date;
    const {timeRange} = useSchedulerTimeAndDays();
    const {start: startDate, end: endDate} =
        schedulerDatesService.getDisplayDateRangeAccordingZoom(
            tripStartDate,
            tripStartDate,
            timeRange,
            minutesPerCell
        );
    const dayRange = {
        start: zoneDateToISO(startDate, timezone),
        end: zoneDateToISO(endDate, timezone),
    };
    const trips = useSelector((state) =>
        getPlannedTripsForCurrentQuery(state).filter(
            (trip) =>
                isTripInRange(trip, dayRange) &&
                ((view !== "trucker" && trip[view]?.original === selectedTrip[view]?.original) ||
                    trip[view]?.pk === selectedTrip[view]?.pk)
        )
    );
    const tripsToCountInData = trips.filter(
        (trip) => trip.scheduler_datetime_range.start > dayRange.start
    );
    const {unitOptions, selectedUnit, setSelectedUnit} = useLoadsUnits("L");

    const resourceUid = selectedTrip ? getResourceUid(selectedTrip[view], view) : null;
    const {rows: resources} = useResources({
        view,
        [`${view}__in`]: resourceUid ?? -1,
    });
    if (!selectedTrip) {
        return null;
    }
    if (!resourceUid) {
        return null;
    }
    const resource = resources && resources.length > 0 ? resources[0] : undefined;
    return (
        <>
            <Card
                position="relative"
                height="100%"
                boxShadow="none"
                border="1px solid"
                borderColor="grey.light"
                data-testid="resource-detailed-bar"
            >
                <ResourceHeader trip={selectedTrip} view={view} />
                <Flex height="calc(100% - 35px)">
                    <Box
                        borderRight="1px solid"
                        borderColor="grey.light"
                        p={3}
                        width="150px"
                        backgroundColor="grey.white"
                        zIndex="level2"
                    >
                        <TripsData
                            trips={tripsToCountInData}
                            startDate={startDate}
                            endDate={endDate}
                        />
                        <Box my={2}>
                            <LoadUnitSelect
                                unitOptions={unitOptions}
                                selectedUnit={selectedUnit}
                                setSelectedUnit={setSelectedUnit}
                            />
                        </Box>
                    </Box>
                    <Box width="100%" overflow="auto">
                        <Box width="fit-content" height="100%">
                            <ResourceTimeline
                                selectedTripUid={selectedTrip.uid}
                                resourceUid={resourceUid}
                                resourceDetails={resource}
                                trips={trips}
                                view={view}
                                startDate={startDate}
                                endDate={endDate}
                                minutesPerCell={minutesPerCell}
                                onTripSelected={onTripSelected}
                                onTripHovered={onTripHovered}
                                onActivityHovered={onActivityHovered}
                            />
                            <ResourceLoadGraph
                                trips={trips}
                                startDate={startDate}
                                endDate={endDate}
                                minutesPerCell={minutesPerCell}
                                selectedUnit={selectedUnit}
                                unitLabel={
                                    unitOptions.find(({value}) => selectedUnit === value)?.unit
                                }
                            />
                        </Box>
                    </Box>
                </Flex>
            </Card>
        </>
    );
}

function isTripInRange(trip: CompactTrip, range: SiteSlot) {
    const tripRange = trip.scheduler_datetime_range;
    return tripRange.end > range.start && tripRange.start < range.end;
}
