import {useTimezone} from "@dashdoc/web-common";
import {
    Box,
    SchedulerByTime,
    DndData,
    SchedulerCard,
    SchedulerResource,
    useResourceOffset,
} from "@dashdoc/web-ui";
import {Manager} from "dashdoc-utils";
import React, {useCallback, useMemo} from "react";

import {useSchedulerCardSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerCardSettings";
import {
    TripResource,
    TripSchedulerView,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {formatTripAsCard} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/hook/useTripCards";
import {formatUnavailabilitiesAsCards} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/hook/useUnavailabilityCards";
import {FakeTripCardContent} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/FakeTripCardContent";
import {TripCardContent} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/trip-card/TripCardContent";
import {UnavailabilityCardContent} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/unavailability-card/UnavailabilityCardContent";
import {CompactTrip} from "app/features/trip/trip.types";
import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

type Props = {
    selectedTripUid: string;
    resourceUid: string;
    resourceDetails?: TripResource;
    trips: CompactTrip[];
    view: TripSchedulerView;
    startDate: Date;
    endDate: Date;
    minutesPerCell: number;
    onTripSelected?: (tripUid: string) => void;
    onTripHovered?: (uid: string | null) => void;
    onActivityHovered?: (value: {uid: string; count: number} | null) => void;
    isTripFiltered?: (uid: string) => boolean;
    isTripDraggable?: (uid: string) => boolean;
    isFakeTrip?: (uid: string) => boolean;
    dndData?: DndData;
};
export function ResourceTimeline({
    selectedTripUid,
    resourceUid,
    resourceDetails,
    trips,
    view,
    startDate,
    endDate,
    minutesPerCell,
    onTripSelected,
    onTripHovered,
    onActivityHovered,
    isTripFiltered,
    isTripDraggable,
    isFakeTrip,
    dndData,
}: Props) {
    const timezone = useTimezone();
    const {activity_label_mode} = useSchedulerCardSettings();

    const cardSettings = useMemo(() => {
        return {
            ...LIGHT_CARD_SETTINGS,
            activity_label_mode:
                activity_label_mode === "name_and_city" ? "name" : activity_label_mode,
        };
    }, [activity_label_mode]);

    const {timeRange} = useSchedulerTimeAndDays();
    const datesSettings = useMemo(
        () => ({
            start: startDate,
            end: endDate,
            minuteScale: minutesPerCell,
            hideSaturdays: false,
            hideSundays: false,
            timeRange,
        }),
        [startDate, endDate, minutesPerCell, timeRange]
    );

    const byResources = useMemo(
        () => ({
            resources: [{uid: resourceUid, label: null}] as SchedulerResource[],
            resourcesTotalCount: 1,
        }),
        [resourceUid]
    );

    const cards = useMemo(() => {
        const tripCards = trips.map((trip) =>
            formatTripAsCard(trip, view, timezone, isTripDraggable?.(trip.uid) ?? false)
        );
        const unavailabilityCards = formatUnavailabilitiesAsCards(
            resourceDetails?.unavailability ?? [],
            resourceUid,
            timezone
        );
        return [...tripCards, ...unavailabilityCards];
    }, [isTripDraggable, resourceUid, timezone, trips, resourceDetails?.unavailability, view]);

    const getCardContent = useCallback(
        (card: SchedulerCard, displayStart = startDate, displayEnd = endDate) => {
            const {itemUid, height, type} = card;
            switch (type) {
                case "trip":
                    if (isFakeTrip !== undefined && isFakeTrip(itemUid)) {
                        return (
                            <FakeTripCardContent
                                trip={trips.find((trip) => trip.uid === itemUid)}
                                isSelected={itemUid === selectedTripUid}
                                view={view}
                                schedulerStartDate={displayStart}
                                schedulerEndDate={displayEnd}
                                minutesScale={minutesPerCell}
                                settings={cardSettings}
                                isCardFiltered={isTripFiltered?.(itemUid) ?? false}
                            />
                        );
                    }
                    return (
                        <TripCardContent
                            tripUid={itemUid}
                            inconsistentOrder={false}
                            isSelected={itemUid === selectedTripUid}
                            onSelect={isTripFiltered?.(itemUid) ? undefined : onTripSelected}
                            view={view}
                            schedulerStartDate={displayStart}
                            schedulerEndDate={displayEnd}
                            onTripHovered={onTripHovered}
                            onActivityHovered={onActivityHovered}
                            minutesScale={minutesPerCell}
                            settings={cardSettings}
                            isCardFiltered={isTripFiltered?.(itemUid) ?? false}
                        />
                    );
                case "unavailability":
                    return (
                        <UnavailabilityCardContent
                            resource={resourceDetails}
                            unavailabilityId={itemUid}
                            view={view}
                            height={height}
                            schedulerStartDate={displayStart}
                            schedulerEndDate={displayEnd}
                        />
                    );
                default:
                    return <></>;
            }
        },
        [
            isFakeTrip,
            selectedTripUid,
            onTripSelected,
            view,
            startDate,
            endDate,
            onTripHovered,
            onActivityHovered,
            minutesPerCell,
            isTripFiltered,
            trips,
            resourceDetails,
        ]
    );
    const resourceOffset = useResourceOffset();
    return (
        <>
            <Box mt="-20px" ml={`-${resourceOffset}px`}>
                <SchedulerByTime
                    datesSettings={datesSettings}
                    byResources={byResources}
                    cards={cards}
                    getCardContent={getCardContent}
                    timezone={timezone}
                    scrollGridProps={{overflow: "hidden"}}
                    dndData={dndData}
                />
            </Box>
        </>
    );
}

const LIGHT_CARD_SETTINGS: Manager["scheduler_card_display_settings"] = {
    display_shipper_name: true,
    display_activities: true,
    activity_list_mode: "expand",
    activity_label_mode: "city",
    display_activity_type: true,
    display_means: false,
    display_vehicle_requested: false,
    display_global_instructions: false,
    display_tags: false,
    display_tag_text: false,
};
