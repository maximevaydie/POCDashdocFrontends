import {useTimezone} from "@dashdoc/web-common";
import {
    Card,
    Flex,
    Box,
    LoadingWheel,
    DndProvider,
    DndData,
    DropEvent,
    DndSchedulerPayload,
} from "@dashdoc/web-ui";
import {SCHEDULER_ZOOM_SCALE} from "@dashdoc/web-ui/src/scheduler/scheduler-by-time/SchedulerZoom";
import {schedulerDatesService} from "@dashdoc/web-ui/src/scheduler/scheduler-by-time/service/dates.service";
import {parseAndZoneDate} from "dashdoc-utils";
import React, {useCallback, useMemo} from "react";

import {useResources} from "app/features/scheduler/carrier-scheduler/hooks/useResources";
import {LoadUnitSelect} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/components/LoadUnitSelect";
import {ResourceHeader} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/components/ResourceHeader";
import {ResourceLoadGraph} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/components/ResourceLoadGraph";
import {ResourceTimeline} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/components/ResourceTimeline";
import {TripsData} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/resource-details/components/TripsData";
import {useTripsOfTheDays} from "app/features/scheduler/carrier-scheduler/trip-scheduler/scheduler-plan-preview/useTripsOfTheDay";
import {getResourceUid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {tripGhostCards} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/TripGhostCard";
import {useLoadsUnits} from "app/features/trip/hook/useLoadsUnits";
import {getCompactActivities} from "app/features/trip/trip.service";
import {CompactTrip, Trip} from "app/features/trip/trip.types";
import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

type Props = {
    trip: Trip | null;
    startDate: Date;
    endDate: Date;
    view: TripSchedulerView;
    setStartDate: (date: Date | null) => void;
};
const minutesPerCell = SCHEDULER_ZOOM_SCALE[3];
export function SchedulerPlanPreviewByResource({
    trip,
    startDate,
    endDate,
    view,
    setStartDate,
}: Props) {
    const {unitOptions, selectedUnit, setSelectedUnit} = useLoadsUnits("L");
    const timezone = useTimezone();
    const tripsOfTheDay = useTripsOfTheDays(trip, startDate, endDate, view);
    const trips = useMemo(
        () =>
            trip
                ? [
                      ...tripsOfTheDay.filter((t) => t.uid !== trip.uid),
                      {
                          ...trip,
                          activities: getCompactActivities(trip.activities),
                      } as CompactTrip,
                  ]
                : tripsOfTheDay,
        [tripsOfTheDay, trip]
    );

    const onDrop = useCallback(
        (drop: DropEvent) => {
            const {target} = drop;
            const payload = target.payload as DndSchedulerPayload;
            if (target.kind !== "table" && payload.day) {
                const date = parseAndZoneDate(payload.day, timezone);
                setStartDate(date);
            }
        },
        [setStartDate, timezone]
    );

    const dndData: DndData = useMemo(
        () => ({
            onDrop,
            useDraggedEntityByUid: (itemUid) =>
                trips.find((t) => t.uid === itemUid) as CompactTrip,
            kind: "scheduler",
            acceptedTypes: ["planned", "*"],
            isDroppable: () => true,
            ghostCards: tripGhostCards,
            draggableType: "planned",
        }),
        [onDrop]
    );

    const resourceUid = trip ? getResourceUid(trip[view], view) : null;
    const {rows: resources} = useResources({
        view,
        [`${view}__in`]: resourceUid ?? -1,
    });
    const isTripUid = useCallback(
        (uid: string) => {
            return uid === trip?.uid;
        },
        [trip?.uid]
    );
    const isNotTripUid = useCallback(
        (uid: string) => {
            return !isTripUid(uid);
        },
        [isTripUid]
    );
    const isDraggableTrip = useCallback(
        (uid: string) => {
            return isTripUid(uid) && trip?.status === "unstarted";
        },
        [isTripUid, trip?.status]
    );
    const {timeRange} = useSchedulerTimeAndDays();
    const {start: displayStartDate, end: displayEndDate} =
        schedulerDatesService.getDisplayDateRangeAccordingZoom(
            startDate,
            endDate,
            timeRange,
            minutesPerCell
        );

    if (!trip) {
        return <LoadingWheel />;
    }
    if (!resourceUid) {
        return null;
    }
    const resource = resources.length > 0 ? resources[0] : undefined;

    return (
        <DndProvider>
            <Card position="relative" height="100%" mt={3} overflow="unset">
                <ResourceHeader trip={trip} view={view} setStartDate={setStartDate} />
                <Flex height="calc(100% - 35px)">
                    <Box
                        borderRight="1px solid"
                        borderColor="grey.light"
                        p={3}
                        width="150px"
                        backgroundColor="grey.white"
                        zIndex="level2"
                    >
                        <TripsData trips={trips} startDate={startDate} endDate={endDate} />
                        <Box my={2}>
                            <LoadUnitSelect
                                unitOptions={unitOptions}
                                selectedUnit={selectedUnit}
                                setSelectedUnit={setSelectedUnit}
                            />
                        </Box>
                    </Box>
                    <Box width="100%" overflow="auto" height="100%">
                        <Box width="fit-content">
                            <ResourceTimeline
                                selectedTripUid={trip.uid}
                                resourceUid={resourceUid}
                                resourceDetails={resource}
                                trips={trips}
                                view={view}
                                startDate={displayStartDate}
                                endDate={displayEndDate}
                                minutesPerCell={minutesPerCell}
                                isTripFiltered={isNotTripUid}
                                isTripDraggable={isDraggableTrip}
                                isFakeTrip={isTripUid}
                                onTripHovered={empty}
                                dndData={dndData}
                            />
                            <ResourceLoadGraph
                                trips={trips}
                                startDate={displayStartDate}
                                endDate={displayEndDate}
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
        </DndProvider>
    );
}

function empty() {}
