import {useTimezone} from "@dashdoc/web-common";
import {
    Box,
    SchedulerByDay,
    DndData,
    DropEvent,
    SchedulerCardFormatted,
    SchedulerResource,
    useContextMenu,
} from "@dashdoc/web-ui";
import {Unavailability} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import React, {useCallback, useMemo, useState} from "react";

import {isDroppable} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/dndTripScheduler.service";
import {getResourceUid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {
    TripResource,
    TripSchedulerView,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {
    CELL_CONTEXT_MENU_ID,
    CellContextMenu,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/context-menus/CellContextMenu";
import {
    RESOURCE_CONTEXT_MENU_ID,
    ResourceContextMenu,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/context-menus/ResourceContextMenu";
import {
    UNAVAILABILITY_CONTEXT_MENU_ID,
    UnavailabilityContextMenu,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/context-menus/UnavailabilityContextMenu";
import {UnavailabilityCardContent} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/unavailability-card/UnavailabilityCardContent";
import {useSelector} from "app/redux/hooks";
import {getCompactTripByUid} from "app/redux/selectors";
import {useSchedulerTimeAndDays} from "app/screens/scheduler/hook/useSchedulerTimeAndDays";

import {useTripCards} from "./hook/useTripCards";
import {useUnavailabilityCards} from "./hook/useUnavailabilityCards";
import {ResourceHeader} from "./resource/ResourceHeader";
import {ResourceLabel} from "./resource/ResourceLabel";
import {RevenueCell} from "./revenue/RevenueCell";
import {RevenueHeader} from "./revenue/RevenueHeader";
import {DayActionButton} from "./send-instructions/DayActionButton";
import {TripCardContent} from "./trip-card/TripCardContent";
import {tripGhostCards} from "./trip-card/TripGhostCard";

type FilteredCarrierSchedulerProps = {
    startDate: Date;
    endDate: Date;
    view: TripSchedulerView;
    resources: TripResource[];
    resourcesTotalCount: number;
    onEndReached: () => void;
    onResetResources?: () => void;
    selectedTripUid?: string;
    onTripSelected: (tripUid: string) => void;
    onDrop: (drop: DropEvent) => void;
    onUpdateResource: () => void;
};

export function TripSchedulerDayGrid({
    startDate,
    endDate,
    view,
    resources,
    resourcesTotalCount,
    onEndReached,
    onResetResources,
    onDrop,
    selectedTripUid,
    onTripSelected,
    onUpdateResource,
}: FilteredCarrierSchedulerProps) {
    const tripCards = useTripCards(view);
    const {cards: unavailabilityCards, regenerate: regenerateUnavailabilityCards} =
        useUnavailabilityCards(resources, view);
    const cards = useMemo(
        () => [...tripCards, ...unavailabilityCards],
        [tripCards, unavailabilityCards]
    );

    const {show: openContextMenu} = useContextMenu();
    const [contextMenuData, setContextMenuData] = useState<{
        resource?: TripResource | undefined;
        day?: Date;
        unavailability?: Unavailability;
    } | null>(null);
    const formattedResources: SchedulerResource[] = useMemo(
        () =>
            resources.map((r) => ({
                uid: getResourceUid(r, view) ?? "",
                label: (
                    <Box
                        height="100%"
                        width="100%"
                        onContextMenu={(event) => {
                            if (r) {
                                setContextMenuData({resource: r});
                                openContextMenu({
                                    id: RESOURCE_CONTEXT_MENU_ID,
                                    event,
                                });
                            }
                        }}
                    >
                        <ResourceLabel view={view} resource={r} displayLinkedResources />
                    </Box>
                ),
            })),
        [openContextMenu, resources, view]
    );

    const revenueInformation = useMemo(
        () => ({
            header: <RevenueHeader view={view} startDate={startDate} endDate={endDate} />,
            getResourceInformation: (resourceUid: string) => (
                <RevenueCell
                    resourceUid={resourceUid}
                    view={view}
                    startDate={startDate}
                    endDate={endDate}
                />
            ),
        }),
        [endDate, startDate, view]
    );

    const getDayActionButton = useCallback(
        (day: Date, currentDate: Date) => (
            <DayActionButton
                day={day}
                currentDate={currentDate}
                view={view}
                allResourceLoaded={resources.length === resourcesTotalCount}
            />
        ),
        [resources.length, resourcesTotalCount, view]
    );

    const getCardContent = useCallback(
        (card: SchedulerCardFormatted, displayStart = startDate, displayEnd = endDate) => {
            const {itemUid, type, inconsistentOrder, height, resourceUid, width} = card;
            switch (type) {
                case "trip":
                    return (
                        <TripCardContent
                            tripUid={itemUid}
                            inconsistentOrder={inconsistentOrder}
                            isSelected={itemUid === selectedTripUid}
                            onSelect={onTripSelected}
                            view={view}
                            schedulerStartDate={displayStart}
                            schedulerEndDate={displayEnd}
                            height={height}
                        />
                    );
                case "unavailability":
                    return (
                        <UnavailabilityCardContent
                            resource={resources.find(
                                (r) => getResourceUid(r, view) === resourceUid
                            )}
                            unavailabilityId={itemUid}
                            view={view}
                            height={height}
                            width={width}
                            onUnavailabilityUpdated={regenerateUnavailabilityCards}
                            schedulerStartDate={startDate}
                            schedulerEndDate={endDate}
                            onRightClick={(event, data) => {
                                setContextMenuData(data);
                                openContextMenu({
                                    id: UNAVAILABILITY_CONTEXT_MENU_ID,
                                    event,
                                });
                            }}
                        />
                    );
                default:
                    return <></>;
            }
        },
        [
            selectedTripUid,
            onTripSelected,
            view,
            startDate,
            endDate,
            resources,
            regenerateUnavailabilityCards,
            openContextMenu,
        ]
    );

    const dndData: DndData = useMemo(
        () => ({
            onDrop,
            useDraggedEntityByUid: (itemUid) => useCompactTripByUid(itemUid),
            kind: "scheduler",
            acceptedTypes: ["planned", "*"],
            isDroppable: isDroppable,
            ghostCards: tripGhostCards,
            draggableType: "planned",
        }),
        [onDrop]
    );
    const {hideSaturdays, hideSundays} = useSchedulerTimeAndDays();
    const datesSettings = useMemo(
        () => ({
            start: startDate,
            end: endDate,
            getDayIndicator: getDayActionButton,
            hideSaturdays,
            hideSundays,
        }),
        [startDate, endDate, getDayActionButton, hideSaturdays, hideSundays]
    );
    const byResources = useMemo(
        () => ({
            header: <ResourceHeader />,
            resources: formattedResources,
            resourcesTotalCount,
            onResetResources,
            ontResourcesEndReached: onEndReached,
            additionalResourcesInformation: revenueInformation,
        }),
        [
            formattedResources,
            onEndReached,
            onResetResources,
            resourcesTotalCount,
            revenueInformation,
        ]
    );

    const onCellRightClick = useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>, resourceUid: string, day: Date) => {
            const resource = resources.find((r) => getResourceUid(r, view) === resourceUid);
            if (resource) {
                setContextMenuData({resource, day});
                openContextMenu({
                    id: CELL_CONTEXT_MENU_ID,
                    event,
                });
            }
        },
        [resources, openContextMenu, view]
    );
    const timezone = useTimezone();
    return (
        <>
            <SchedulerByDay
                datesSettings={datesSettings}
                byResources={byResources}
                onCellRightClick={onCellRightClick}
                cards={cards}
                getCardContent={getCardContent}
                dndData={dndData}
                timezone={timezone}
            />

            <ResourceContextMenu
                resource={contextMenuData?.resource}
                view={view}
                onUnavailabilityUpdated={regenerateUnavailabilityCards}
                onUpdateResource={onUpdateResource}
            />
            <CellContextMenu
                resource={contextMenuData?.resource}
                day={contextMenuData?.day}
                view={view}
                onUnavailabilityUpdated={regenerateUnavailabilityCards}
            />
            <UnavailabilityContextMenu
                resource={contextMenuData?.resource}
                view={view}
                selectedUnavailability={contextMenuData?.unavailability}
                onUnavailabilityUpdated={regenerateUnavailabilityCards}
            />
        </>
    );
}

function useCompactTripByUid(tripUid: string) {
    const trip = useSelector((state) => getCompactTripByUid(state, tripUid), isEqual);
    return trip;
}
