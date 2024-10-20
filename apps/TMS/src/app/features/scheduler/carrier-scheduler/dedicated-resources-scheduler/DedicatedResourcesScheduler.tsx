import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {Flex, FloatingPanel, SchedulerZoom} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import {format} from "date-fns";
import React, {useCallback, useContext} from "react";

import {useCharteringSegmentSelection} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/hooks/useCharteringSegmentSelection";
import {useTransportsEventHandler} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/hooks/useTransportsEventHandler";
import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {Legend} from "app/features/scheduler/carrier-scheduler/components/legend";
import {SchedulerByTimeBanner} from "app/features/scheduler/carrier-scheduler/components/SchedulerByTimeBanner";
import {SchedulerDateRangeSelect} from "app/features/scheduler/carrier-scheduler/components/SchedulerDateRangeSelect";
import {SchedulerSettingsButton} from "app/features/scheduler/carrier-scheduler/components/settings/SchedulerSettingsButton";
import {SchedulerSettingsViewSelect} from "app/features/scheduler/carrier-scheduler/components/settings/SchedulerSettingsViewSelect";
import {DedicatedResourceForCharteringScheduler} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/dedicated-resources.types";
import {DedicatedResourcesSchedulerGrid} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/DedicatedResourcesSchedulerGrid";
import {useFetchDedicatedResourcesCharteringSegments} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/hooks/useFetchDedicatedResourcesCharteringSegments";
import {useDates} from "app/features/scheduler/carrier-scheduler/hooks/useDates";
import {useDateZoom} from "app/features/scheduler/carrier-scheduler/trip-scheduler/hooks/useDateZoom";
import {SchedulerByTimeActivateBanner} from "app/features/scheduler/settings/find-out-more-scheduler-by-time/SchedulerByTimeActivateBanner";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {TransportScreen} from "app/screens/transport/TransportScreen";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

function getDedicatedResourcesUrlAndParams(
    currentQuery: SchedulerFilters,
    startDate: Date,
    endDate: Date
) {
    const start = format(startDate, "yyyy-MM-dd");
    const end = format(endDate, "yyyy-MM-dd");
    return {
        dedicatedResourcesUrl: "dedicated-resources-scheduler/dedicated-resources/",
        dedicatedResourcesQueryParams: {
            trucker__in: currentQuery.trucker__in,
            vehicle__in: currentQuery.vehicle__in,
            trailer__in: currentQuery.trailer__in,
            custom_id_order: currentQuery.custom_id_order,
            date__gte: start,
            date__lte: end,
        },
    };
}

export function DedicatedResourcesScheduler() {
    // FFs
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();

    // QUERY
    const {currentQuery, updateSchedulerDates, resetSchedulerResourcesFilters} =
        useContext(PoolCurrentQueryContext);
    const {startDate, endDate, onDateChange} = useDates(currentQuery, updateSchedulerDates);

    const {zoom, handleDateZoom} = useDateZoom();
    const scrollGridRef = React.useRef<HTMLDivElement>(null);

    const {dedicatedResourcesUrl, dedicatedResourcesQueryParams} =
        getDedicatedResourcesUrlAndParams(currentQuery, startDate, endDate);

    // RETRIEVE THE DEDICATED RESOURCES
    const {
        items: dedicatedResources,
        loadNext: onEndReached,
        isLoading: isLoadingDedicatedResources,
        hasNext: hasNextDedicatedResources,
        totalCount: dedicatedResourcesTotalCount,
    } = usePaginatedFetch<DedicatedResourceForCharteringScheduler>(
        dedicatedResourcesUrl,
        dedicatedResourcesQueryParams,
        {apiVersion: "web"}
    );

    const onSchedulerEndReached = useCallback(() => {
        if (hasNextDedicatedResources && !isLoadingDedicatedResources) {
            onEndReached();
        }
    }, [hasNextDedicatedResources, isLoadingDedicatedResources, onEndReached]);

    const {charteringSegments, isLoadingCharteringSegments, fetchCharteringSegmentsByUIDs} =
        useFetchDedicatedResourcesCharteringSegments(startDate, endDate, dedicatedResources);

    const {
        selectedCharteringSegmentUid,
        selectedTransportUid,
        selectCharteringSegment,
        unselectCharteringSegment,
    } = useCharteringSegmentSelection(charteringSegments);

    useTransportsEventHandler(fetchCharteringSegmentsByUIDs);

    return (
        <FullHeightMinWidthScreen data-testid="carrier-segment-scheduler">
            {hasSchedulerByTimeEnabled ? (
                <SchedulerByTimeBanner />
            ) : (
                <SchedulerByTimeActivateBanner />
            )}
            <Flex alignItems="center" justifyContent="space-between" p={3} mr={2}>
                <Flex flex={1} alignItems="center">
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
                    <Legend viewMode={"chartering"} />
                </Flex>
            </Flex>

            <Flex
                p={3}
                height={hasSchedulerByTimeEnabled ? "calc(100% - 81px)" : "calc(100% - 41px)"}
            >
                <DedicatedResourcesSchedulerGrid
                    startDate={startDate}
                    endDate={endDate}
                    minutesScale={zoom}
                    onDateZoom={handleDateZoom}
                    dedicatedResources={dedicatedResources}
                    isLoadingDedicatedResources={isLoadingDedicatedResources}
                    dedicatedResourcesTotalCount={dedicatedResourcesTotalCount}
                    onEndReached={onSchedulerEndReached}
                    onResetResources={resetSchedulerResourcesFilters}
                    charteringSegments={charteringSegments}
                    isLoadingCharteringSegments={isLoadingCharteringSegments}
                    selectedCharteringSegmentUid={selectedCharteringSegmentUid ?? undefined}
                    onSelectCharteringSegment={selectCharteringSegment}
                    scrollGridRef={scrollGridRef}
                />
            </Flex>

            {selectedTransportUid && (
                <FloatingPanel width={1 / 3} minWidth={650} onClose={unselectCharteringSegment}>
                    <TransportScreen
                        transportUid={selectedTransportUid}
                        onTransportDeleted={unselectCharteringSegment}
                    />
                </FloatingPanel>
            )}
        </FullHeightMinWidthScreen>
    );
}
