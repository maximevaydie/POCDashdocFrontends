import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Card,
    ConfirmationModal,
    Droppable,
    Flex,
    FloatingOverlay,
    FloatingPanel,
    ResizableBox,
    SchedulerZoom,
    DndSchedulerPayload,
    DropEvent,
    Text,
    theme,
} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import React, {CSSProperties, useCallback, useContext, useMemo, useState} from "react";

import {DaySimulationFloatingPanel} from "app/features/optimization/day-simulation/day-simulation-floating-panel/DaySimulationFloatingPanel";
import {DaySimulationTruckerContext} from "app/features/optimization/day-simulation/DaySimulationTruckerContext";
import {PlanningSimulationDroppable} from "app/features/optimization/PlanningSimulationDroppable";
import {HideShowPanelButton} from "app/features/scheduler/carrier-scheduler/components/HideShowPanelButton";
import {Legend} from "app/features/scheduler/carrier-scheduler/components/legend";
import {SchedulerByTimeBanner} from "app/features/scheduler/carrier-scheduler/components/SchedulerByTimeBanner";
import {SchedulerDateRangeSelect} from "app/features/scheduler/carrier-scheduler/components/SchedulerDateRangeSelect";
import {SchedulerSettingsButton} from "app/features/scheduler/carrier-scheduler/components/settings/SchedulerSettingsButton";
import {SchedulerSettingsViewSelect} from "app/features/scheduler/carrier-scheduler/components/settings/SchedulerSettingsViewSelect";
import {useDates} from "app/features/scheduler/carrier-scheduler/hooks/useDates";
import {useResources} from "app/features/scheduler/carrier-scheduler/hooks/useResources";
import {useSchedulerDisplayMode} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerDisplayMode";
import {SchedulerBottomBar} from "app/features/scheduler/carrier-scheduler/trip-scheduler/bottom-bar/SchedulerBottomBar";
import {
    TripSchedulerView,
    TruckerForScheduler,
} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";
import {TripSchedulerDayGrid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/TripSchedulerDayGrid";
import {TripSchedulerTimeGrid} from "app/features/scheduler/carrier-scheduler/trip-scheduler/trip-scheduler-grid/TripSchedulerTimeGrid";
import {PoolsOfUnplannedTrips} from "app/features/scheduler/carrier-scheduler/trip-scheduler/unplanned-trips/PoolsOfUnplannedTrips";
import {SchedulerByTimeActivateBanner} from "app/features/scheduler/settings/find-out-more-scheduler-by-time/SchedulerByTimeActivateBanner";
import {TripEdition} from "app/features/trip/trip-edition";
import {CompactTrip} from "app/features/trip/trip.types";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {useTripEventHandler} from "app/hooks/useTripEventHandler";
import {ResourcesQueryContext} from "app/screens/scheduler/hook/useResourcesQueryContext";
import {TransportScreen} from "app/screens/transport/TransportScreen";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

import {useDragDrop} from "../hooks/useDragAndDrop";

import {SelectTripContext} from "./context/SelectTripContext";
import {useDateZoom} from "./hooks/useDateZoom";
import {useFetchTrips} from "./hooks/useFetchTrips";
import {useTripSelection} from "./hooks/useTripSelection";
import {PoolHeader} from "./unplanned-trips/PoolHeader";

const targetPayload: DndSchedulerPayload = {
    resourceUid: "unplanned",
    day: null,
    index: 0,
};

export function CarrierTripScheduler() {
    const {currentQuery, updateSchedulerDates} = useContext(PoolCurrentQueryContext);

    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();

    const {effectiveResourcesQuery, resetResourcesLocalFilters, updateResourcesLocalFilters} =
        useContext(ResourcesQueryContext);
    const handleResetResourceLocalFilter = useCallback(() => {
        if (resetResourcesLocalFilters) {
            updateResourcesLocalFilters(resetResourcesLocalFilters);
        }
    }, [resetResourcesLocalFilters, updateResourcesLocalFilters]);
    const {startDate, endDate, onDateChange} = useDates(currentQuery, updateSchedulerDates);
    const {zoom, handleDateZoom} = useDateZoom();
    const scrollGridRef = React.useRef<HTMLDivElement>(null);

    const {
        isPoolOfUnplannedDisplayed,
        isSchedulerDisplayed,
        poolWidth,
        updatePoolVisibility,
        updateSchedulerVisibility,
        savePoolWidth,
    } = useSchedulerDisplayMode(currentQuery.view);

    const {
        rows,
        totalCount,
        reload,
        onResourceEndReached: onSchedulerEndReached,
    } = useResources(effectiveResourcesQuery);
    const reloadWithoutReset = useCallback(() => reload(false), [reload]);

    const {fetchPlannedTripsByUids, fetchAndRedrawTripsInTimeSpan} = useFetchTrips(
        currentQuery,
        startDate,
        endDate,
        rows
    );

    const {
        selectedTripUid: editingTripUid,
        selectedTransportUid,
        selectTrip,
        unselectTrip,
    } = useTripSelection();
    const [hoverTripUid, setHoverTripUid] = useState<string | null>(null);
    const [previewTripUid, setPreviewTripUid] = useState<string | null>(null);
    const [bottomBarKey, setBottomBarKey] = useState<string>("key");
    const [hoverActivityUidAndNumber, setHoverActivityUidAndNumber] = useState<{
        uid: string;
        count: number;
    } | null>(null);

    const [selectedUnplannedRows, setSelectedUnplannedRows] = useState<Array<CompactTrip>>([]);

    const {
        isOpenConfirmOrderModal,
        draggedTripUid,
        closeConfirmOrderModal,
        confirmOrder,
        onDropToScheduler,
        onDropToTable,
        processingTripUids,
    } = useDragDrop(
        currentQuery,
        startDate,
        endDate,
        fetchAndRedrawTripsInTimeSpan,
        setSelectedUnplannedRows
    );

    const lockedTripsUids = useMemo(
        () =>
            !selectedTransportUid && editingTripUid
                ? new Set([
                      ...(draggedTripUid ? [draggedTripUid] : []),
                      ...processingTripUids,
                      editingTripUid,
                  ])
                : new Set([...(draggedTripUid ? [draggedTripUid] : []), ...processingTripUids]),
        [selectedTransportUid, editingTripUid, draggedTripUid, processingTripUids]
    );

    useTripEventHandler(fetchPlannedTripsByUids, lockedTripsUids);

    const [daySimulationParameters, setDaySimulationParameters] = useState<{
        trucker: TruckerForScheduler | null;
        initialDate: Date | null;
    }>({trucker: null, initialDate: null});

    const handleDropToTable = useCallback(
        (event: DropEvent) => {
            if ((event.entity as CompactTrip).uid === previewTripUid) {
                setPreviewTripUid(null);
            }
            onDropToTable(event);
        },
        [onDropToTable, previewTripUid]
    );

    const handleSelectPreviewTrip = useCallback((tripUid: string | null) => {
        setPreviewTripUid(tripUid);
        if (tripUid) {
            // to force re-openning bottom bar if it is closed
            setBottomBarKey(guid());
        }
    }, []);

    return (
        <SelectTripContext.Provider value={selectTrip}>
            <FullHeightMinWidthScreen
                pb={2}
                data-testid="carrier-trip-scheduler"
                position="relative"
            >
                {hasSchedulerByTimeEnabled ? (
                    <SchedulerByTimeBanner />
                ) : (
                    <SchedulerByTimeActivateBanner />
                )}
                <Box position="absolute" minHeight={"60px"} top={"40px"} right={0} left={0}>
                    {currentQuery.view === "trucker" && <PlanningSimulationDroppable />}
                </Box>
                <Box
                    display="flex"
                    flexDirection="column"
                    pt={3}
                    height={"calc(100% - 40px)"}
                    maxHeight={"calc(100% - 40px)"}
                >
                    <Flex pb={1} flex={1} overflow="hidden" position="relative">
                        {isPoolOfUnplannedDisplayed && (
                            <ResizableBox
                                allowedDirections={["right"]}
                                width={isSchedulerDisplayed ? (poolWidth ?? "40%") : "100%"}
                                minWidth="230px"
                                maxWidth={isSchedulerDisplayed ? "75%" : "100%"}
                                onResizeDone={savePoolWidth}
                                mt={"0px"}
                                position="relative"
                                disabled={!isSchedulerDisplayed}
                                borderRight={isSchedulerDisplayed ? "1px solid" : undefined}
                                borderColor="grey.light"
                            >
                                <Box px={3} height="100%">
                                    <PoolHeader>
                                        <HideShowPanelButton
                                            isSidePanelDisplayed={isSchedulerDisplayed}
                                            hidePanel={() => updatePoolVisibility(false)}
                                            showSidePanel={() => updateSchedulerVisibility(true)}
                                            side={"left"}
                                            hidePanelLabel={t("scheduler.poolOfUnplanned.hide")}
                                            hidePanelTestID="hide-pool-of-unplanned-trips"
                                            showSidePanelLabel={t("scheduler.planning.show")}
                                            showSidePanelTestID="show-scheduler"
                                        />
                                    </PoolHeader>
                                    <PoolsOfUnplannedTrips
                                        onTripSelected={selectTrip}
                                        selectedTrips={selectedUnplannedRows}
                                        setSelectedTrips={setSelectedUnplannedRows}
                                        draggedTripUid={draggedTripUid}
                                        lockedTripsUids={lockedTripsUids}
                                        onTripHovered={
                                            hasSchedulerByTimeEnabled ? setHoverTripUid : undefined
                                        }
                                    />

                                    <Droppable
                                        onDrop={handleDropToTable}
                                        kind="table"
                                        id="table"
                                        data-testid="unplan-droppable"
                                        payload={targetPayload}
                                        acceptedType="planned"
                                        styleProvider={(isDragging, isOver) =>
                                            styleProvider(isDragging, isOver)
                                        }
                                        whenDrag={<TableDropLayer />}
                                    />
                                </Box>
                            </ResizableBox>
                        )}
                        {isSchedulerDisplayed && (
                            <Flex
                                mx={3}
                                flex={1}
                                display="flex"
                                flexDirection="column"
                                overflow="hidden"
                            >
                                <Flex
                                    alignItems="center"
                                    justifyContent="space-between"
                                    mb={3}
                                    mr={2}
                                >
                                    <Flex height="100%" flexShrink={0} mr={1}>
                                        <HideShowPanelButton
                                            isSidePanelDisplayed={isPoolOfUnplannedDisplayed}
                                            hidePanel={() => updateSchedulerVisibility(false)}
                                            showSidePanel={() => updatePoolVisibility(true)}
                                            side={"right"}
                                            hidePanelLabel={t("scheduler.planning.hide")}
                                            hidePanelTestID="hide-scheduler"
                                            showSidePanelLabel={t(
                                                "scheduler.poolOfUnplanned.show"
                                            )}
                                            showSidePanelTestID="show-pool-of-unplanned-trips"
                                        />
                                    </Flex>
                                    <Flex alignItems="center" flex={1}>
                                        <SchedulerSettingsViewSelect />
                                        <SchedulerSettingsButton />
                                    </Flex>
                                    <Flex alignItems="center">
                                        {hasSchedulerByTimeEnabled && (
                                            <SchedulerZoom
                                                zoom={zoom}
                                                onZoomChange={handleDateZoom}
                                                scrollGridRef={scrollGridRef}
                                            />
                                        )}
                                        <SchedulerDateRangeSelect
                                            startDate={startDate}
                                            endDate={endDate}
                                            onDateRangeChange={onDateChange}
                                        />
                                        {currentQuery.view ? (
                                            <Legend viewMode={currentQuery.view} />
                                        ) : null}
                                    </Flex>
                                </Flex>
                                <Card
                                    mt={0}
                                    flex={1}
                                    display="flex"
                                    flex-direction="row"
                                    overflow="hidden"
                                    position="relative"
                                >
                                    {currentQuery.view && (
                                        <DaySimulationTruckerContext.Provider
                                            value={{setDaySimulationParameters}}
                                        >
                                            {hasSchedulerByTimeEnabled ? (
                                                <TripSchedulerTimeGrid
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    minutesScale={zoom}
                                                    view={currentQuery.view as TripSchedulerView}
                                                    resources={rows}
                                                    resourcesTotalCount={totalCount}
                                                    onEndReached={onSchedulerEndReached}
                                                    onResetResources={
                                                        handleResetResourceLocalFilter
                                                    }
                                                    onTripSelected={handleSelectPreviewTrip}
                                                    onDrop={onDropToScheduler}
                                                    onUpdateResource={reloadWithoutReset}
                                                    onTripHovered={setHoverTripUid}
                                                    onActivityHovered={
                                                        setHoverActivityUidAndNumber
                                                    }
                                                    onDateZoom={handleDateZoom}
                                                    scrollGridRef={scrollGridRef}
                                                    selectedTripUid={previewTripUid ?? undefined}
                                                />
                                            ) : (
                                                <TripSchedulerDayGrid
                                                    startDate={startDate}
                                                    endDate={endDate}
                                                    view={currentQuery.view as TripSchedulerView}
                                                    resources={rows}
                                                    resourcesTotalCount={totalCount}
                                                    onEndReached={onSchedulerEndReached}
                                                    onResetResources={
                                                        handleResetResourceLocalFilter
                                                    }
                                                    selectedTripUid={editingTripUid ?? undefined}
                                                    onTripSelected={selectTrip}
                                                    onDrop={onDropToScheduler}
                                                    onUpdateResource={reloadWithoutReset}
                                                />
                                            )}
                                        </DaySimulationTruckerContext.Provider>
                                    )}
                                </Card>
                            </Flex>
                        )}
                    </Flex>
                    {hasSchedulerByTimeEnabled && (
                        <SchedulerBottomBar
                            key={bottomBarKey}
                            hoverTripUid={hoverTripUid}
                            hoverActivityUidAndNumber={hoverActivityUidAndNumber}
                            previewTripUid={previewTripUid}
                            view={currentQuery.view as TripSchedulerView}
                            onTripSelected={handleSelectPreviewTrip}
                            onTripHovered={setHoverTripUid}
                            onActivityHovered={setHoverActivityUidAndNumber}
                        />
                    )}
                </Box>

                {selectedTransportUid && (
                    <FloatingPanel width={1 / 3} minWidth={650} onClose={unselectTrip}>
                        <TransportScreen
                            transportUid={selectedTransportUid}
                            onTransportDeleted={unselectTrip}
                        />
                    </FloatingPanel>
                )}
                {!selectedTransportUid && editingTripUid && (
                    <FloatingOverlay width={1} maxWidth={1280} onClose={unselectTrip}>
                        <TripEdition
                            tripUid={editingTripUid}
                            handleClose={unselectTrip}
                            onSubcontract={() => {
                                if (editingTripUid === previewTripUid) {
                                    setPreviewTripUid(null);
                                }
                            }}
                        />
                    </FloatingOverlay>
                )}

                {isOpenConfirmOrderModal && (
                    <ConfirmationModal
                        title={t("components.acceptOrder")}
                        onClose={closeConfirmOrderModal}
                        mainButton={{
                            onClick: confirmOrder,
                            children: t("components.acceptOrder"),
                        }}
                        confirmationMessage={t("modal.acceptOrderConfirmation")}
                    />
                )}
                {daySimulationParameters.trucker !== null &&
                    daySimulationParameters.initialDate !== null && (
                        <DaySimulationFloatingPanel
                            trucker={daySimulationParameters.trucker}
                            onClose={() =>
                                setDaySimulationParameters({trucker: null, initialDate: null})
                            }
                            initialDate={daySimulationParameters.initialDate}
                        />
                    )}
            </FullHeightMinWidthScreen>
        </SelectTripContext.Provider>
    );
}
function styleProvider(_isDragging: boolean, isOver: boolean): CSSProperties {
    return {
        backgroundColor: isOver ? theme.colors.blue.light : theme.colors.grey.light,
        opacity: 0.9,
        position: "absolute",
        top: "100px",
        height: "calc(100% - 100px)",
    };
}
function TableDropLayer() {
    return (
        <Flex height="100%" flexGrow={1}>
            <Box margin="auto">
                <Text textAlign="center" variant="title">
                    {t("common.dropHere")}
                </Text>
                <Text textAlign="center">{t("trip.unschedule")}</Text>
            </Box>
        </Flex>
    );
}
