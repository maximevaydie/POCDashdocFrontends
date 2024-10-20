import {useDispatch, useTimezone} from "@dashdoc/web-common";
import {
    Box,
    ResizeData,
    SchedulerByTime,
    DndData,
    DropEvent,
    SchedulerCard,
    SchedulerResource,
    useContextMenu,
} from "@dashdoc/web-ui";
import {Unavailability} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import React, {useCallback, useMemo, useState} from "react";

import {isDroppable} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/dndTripScheduler.service";
import {getResourceUid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.service";
import {
    TripSchedulerView,
    TripResource,
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
import {useExtendedView} from "app/hooks/useExtendedView";
import {updateTripEndDate} from "app/redux/actions/scheduler-trip";
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
    minutesScale: number;
    onDateZoom?: (delta: number) => void;
    view: TripSchedulerView;
    resources: TripResource[];
    resourcesTotalCount: number;
    onEndReached: () => void;
    onResetResources?: () => void;
    selectedTripUid?: string;
    onTripSelected: (tripUid: string) => void;
    onDrop: (drop: DropEvent) => void;
    onUpdateResource: () => void;
    onTripHovered: (uid: string | null) => void;
    onActivityHovered: (value: {uid: string; count: number} | null) => void;
    scrollGridRef?: React.RefObject<HTMLDivElement>;
};

export function TripSchedulerTimeGrid({
    startDate,
    endDate,
    minutesScale,
    onDateZoom,
    view,
    resources,
    resourcesTotalCount,
    onEndReached,
    onResetResources,
    onDrop,
    selectedTripUid,
    onTripSelected,
    onUpdateResource,
    onTripHovered,
    onActivityHovered,
    scrollGridRef,
}: FilteredCarrierSchedulerProps) {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const {extendedView} = useExtendedView();
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
        // missing openContextMenu as it triggers all the time a full re-render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [resources, view]
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
                size="small"
            />
        ),
        [resources.length, resourcesTotalCount, view]
    );

    const getCardContent = useCallback(
        (card: SchedulerCard, displayStart = startDate, displayEnd = endDate) => {
            const {itemUid, type, height, resourceUid} = card;
            switch (type) {
                case "trip":
                    return (
                        <TripCardContent
                            tripUid={itemUid}
                            inconsistentOrder={false}
                            isSelected={itemUid === selectedTripUid}
                            onSelect={onTripSelected}
                            view={view}
                            // used card display start and end instead of full scheduler start and end to handle hidden sections
                            schedulerStartDate={displayStart}
                            schedulerEndDate={displayEnd}
                            onTripHovered={onTripHovered}
                            onActivityHovered={onActivityHovered}
                            minutesScale={minutesScale}
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
                            onUnavailabilityUpdated={regenerateUnavailabilityCards}
                            schedulerStartDate={displayStart}
                            schedulerEndDate={displayEnd}
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
        // missing openContextMenu as it triggers all the time a full re-render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            selectedTripUid,
            onTripSelected,
            view,
            startDate,
            endDate,
            resources,
            regenerateUnavailabilityCards,
            minutesScale,
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
    const resizeData: ResizeData = useMemo(
        () => ({
            onResizeDone: (itemUid: string, type: string, endDate: Date) => {
                if (type === "trip") {
                    dispatch(updateTripEndDate(itemUid, endDate, timezone, extendedView));
                }
            },
            isResizable: (_itemUid: string, type: string, resizable: boolean) =>
                type === "trip" && resizable,
        }),
        [dispatch, extendedView, timezone]
    );

    const {hideSaturdays, hideSundays, timeRange} = useSchedulerTimeAndDays();
    const datesSettings = useMemo(
        () => ({
            start: startDate,
            end: endDate,
            minuteScale: minutesScale,
            getDayIndicator: getDayActionButton,
            onDateZoom: onDateZoom,
            hideSaturdays,
            hideSundays,
            timeRange: timeRange,
        }),
        [
            startDate,
            endDate,
            minutesScale,
            getDayActionButton,
            onDateZoom,
            hideSaturdays,
            hideSundays,
            timeRange,
        ]
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
        (event: MouseEvent, resourceUid: string, day: Date) => {
            const resource = resources.find((r) => getResourceUid(r, view) === resourceUid);
            if (resource) {
                setContextMenuData({resource, day});
                openContextMenu({
                    id: CELL_CONTEXT_MENU_ID,
                    event,
                });
            }
        },
        // missing openContextMenu as it triggers all the time a full re-render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [resources, view]
    );

    return (
        <>
            <SchedulerByTime
                datesSettings={datesSettings}
                byResources={byResources}
                onCellRightClick={onCellRightClick}
                cards={cards}
                getCardContent={getCardContent}
                dndData={dndData}
                resizeData={resizeData}
                timezone={timezone}
                scrollGridRef={scrollGridRef}
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
