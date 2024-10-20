import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {Flex, FloatingPanel, SchedulerZoom} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import {format} from "date-fns";
import React, {useCallback, useContext} from "react";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {Legend} from "app/features/scheduler/carrier-scheduler/components/legend";
import {SchedulerByTimeBanner} from "app/features/scheduler/carrier-scheduler/components/SchedulerByTimeBanner";
import {SchedulerDateRangeSelect} from "app/features/scheduler/carrier-scheduler/components/SchedulerDateRangeSelect";
import {SchedulerSettingsButton} from "app/features/scheduler/carrier-scheduler/components/settings/SchedulerSettingsButton";
import {SchedulerSettingsViewSelect} from "app/features/scheduler/carrier-scheduler/components/settings/SchedulerSettingsViewSelect";
import {useDates} from "app/features/scheduler/carrier-scheduler/hooks/useDates";
import {useDateZoom} from "app/features/scheduler/carrier-scheduler/trip-scheduler/hooks/useDateZoom";
import {SchedulerByTimeActivateBanner} from "app/features/scheduler/settings/find-out-more-scheduler-by-time/SchedulerByTimeActivateBanner";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";
import {TransportScreen} from "app/screens/transport/TransportScreen";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

import {RowCompany} from "./chartering-scheduler-grid/chartering-scheduler.types";
import {CharteringSchedulerGrid} from "./chartering-scheduler-grid/CharteringSchedulerGrid";
import {useCharteringSegmentSelection} from "./hooks/useCharteringSegmentSelection";
import {useFetchCharteringSegments} from "./hooks/useFetchCharteringSegments";
import {useTransportsEventHandler} from "./hooks/useTransportsEventHandler";

function getCompaniesUrlAndParams(currentQuery: SchedulerFilters, startDate: Date, endDate: Date) {
    const start = format(startDate, "yyyy-MM-dd");
    const end = format(endDate, "yyyy-MM-dd");
    return {
        companiesUrl: "/chartering-scheduler/companies/",
        companiesQueryParams: {
            id__in: currentQuery.carrier__in,
            custom_id_order: currentQuery.custom_id_order,
            date__gte: start,
            date__lte: end,
        },
    };
}

export function CharteringScheduler() {
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();
    const {currentQuery, updateSchedulerDates, resetSchedulerResourcesFilters} =
        useContext(PoolCurrentQueryContext);
    const {startDate, endDate, onDateChange} = useDates(currentQuery, updateSchedulerDates);

    const {zoom, handleDateZoom} = useDateZoom();
    const scrollGridRef = React.useRef<HTMLDivElement>(null);

    const {companiesUrl, companiesQueryParams} = getCompaniesUrlAndParams(
        currentQuery,
        startDate,
        endDate
    );
    const {
        items: companies,
        loadNext: onEndReached,
        loadAll: loadAllCompanies,
        isLoading: isLoadingCompanies,
        hasNext: hasNextCompanies,
        totalCount: companiesTotalCount,
    } = usePaginatedFetch<RowCompany>(companiesUrl, companiesQueryParams);
    const onSchedulerEndReached = useCallback(() => {
        if (hasNextCompanies && !isLoadingCompanies) {
            onEndReached();
        }
    }, [hasNextCompanies, isLoadingCompanies, onEndReached]);

    const {charteringSegments, isLoadingCharteringSegments, fetchCharteringSegmentsByUIDs} =
        useFetchCharteringSegments(startDate, endDate, companies);

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
                <CharteringSchedulerGrid
                    startDate={startDate}
                    endDate={endDate}
                    minutesScale={zoom}
                    onDateZoom={handleDateZoom}
                    companies={companies}
                    isLoadingCompanies={isLoadingCompanies}
                    companiesTotalCount={companiesTotalCount}
                    loadAllCompanies={loadAllCompanies}
                    onEndReached={onSchedulerEndReached}
                    onResetResources={resetSchedulerResourcesFilters}
                    charteringSegments={charteringSegments}
                    isLoadingCharteringSegments={isLoadingCharteringSegments}
                    selectedCharteringSegmentUid={selectedCharteringSegmentUid ?? undefined}
                    onSelectCharteringSegment={selectCharteringSegment}
                    fetchCharteringSegmentsByUIDs={fetchCharteringSegmentsByUIDs}
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
