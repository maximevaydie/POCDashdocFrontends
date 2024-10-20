import {usePaginatedFetch, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    FullHeightMinWidthScreen,
    Icon,
    LoadingWheel,
    ScrollableTableFixedHeader,
    TabTitle,
    Table,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {Trace, formatDate, useToggle} from "dashdoc-utils";
import debounce from "lodash.debounce";
import uniqBy from "lodash.uniqby";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useLocation} from "react-router";

import {getQueryDates} from "app/features/filters/deprecated/utils";
import {DeleteTracesButton} from "app/features/maps/traces/DeleteTracesButton";
import {TraceMap} from "app/features/maps/traces/TraceMap";
import {TraceQuery, TracesFilteringBar} from "app/features/maps/traces/TracesFilteringBar";

export function TracesScreen() {
    const location = useLocation<{id: number}>();
    const timezone = useTimezone();

    const [currentQuery, updateQuery] = useState<TraceQuery>({
        telematic_vehicle_plate__in: location.state ? [`${location.state.id}`] : [],
        start_date: undefined,
        end_date: undefined,
        period: undefined,
    });

    const handleUpdateQuery = useCallback(
        (newQuery: Partial<TraceQuery>) => {
            updateQuery((prev) => ({...prev, ...newQuery}));
        },
        [updateQuery]
    );

    const currentQueryParams = useMemo(() => {
        return getTracesQueryParamsFromFiltersQuery(currentQuery, timezone);
    }, [currentQuery, timezone]);

    const {items, isLoading, loadNext, totalCount, reload, hasNext} = usePaginatedFetch<Trace>(
        "/telematics/traces/",
        currentQueryParams
    );
    const traces = uniqBy(items, "id");
    const [allTracesSelected, selectAllTraces, unselectAllTraces] = useToggle();
    const [selectedTraces, setSelectedTraces] = useState<number[]>([]);
    const selectedRows = useMemo(() => {
        let selected: Record<string, boolean> = {};
        selectedTraces.map((traceId) => (selected[traceId] = true));
        return selected;
    }, [selectedTraces]);

    const handleSelectRow = useCallback(
        (selectedTrace: Trace) => {
            setSelectedTraces((previousTraces) => {
                const index = previousTraces.findIndex((traceId) => traceId === selectedTrace.id);
                if (index === -1) {
                    return [...previousTraces, selectedTrace.id];
                }
                return previousTraces.filter((traceId) => traceId !== selectedTrace.id);
            });
            unselectAllTraces();
        },
        [setSelectedTraces, unselectAllTraces]
    );

    useEffect(() => {
        setSelectedTraces([]);
        unselectAllTraces();
    }, [currentQuery]);

    const debouncedOnScroll = useCallback(
        debounce(({target}) => {
            if (
                hasNext &&
                target.scrollHeight - target.clientHeight - target.scrollTop <= SCROLL_THRESHOLD
            ) {
                loadNext();
            }
        }, 300),
        [loadNext, hasNext]
    );

    const onScroll = useCallback(
        (e: React.UIEvent<HTMLElement>) => {
            e.persist();
            debouncedOnScroll(e);
        },
        [debouncedOnScroll]
    );

    return (
        <FullHeightMinWidthScreen pt={3} overflow="auto" onScroll={onScroll}>
            <ScrollableTableFixedHeader>
                <TabTitle
                    title={t("traces.myTraces")}
                    detailText={`- ${t("common.resultCount", {smart_count: totalCount ?? 0})}`}
                    data-testid="traces-screen"
                />
                <Box pt={3} pb={2}>
                    <TracesFilteringBar query={currentQuery} updateQuery={handleUpdateQuery} />
                </Box>
            </ScrollableTableFixedHeader>

            <Box mx={3}>
                {isLoading ? (
                    <Flex
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="flex-start"
                        py={8}
                        height="40vh"
                    >
                        <LoadingWheel noMargin />
                    </Flex>
                ) : (
                    <TraceMap traces={traces} />
                )}

                <Table
                    rows={traces}
                    columns={getTracesColumns()}
                    getRowCellContent={getRowCellContent}
                    getRowId={(trace) => `${trace.id}`}
                    getRowKey={(trace) => `${trace.id}`}
                    data-testid="traces-list"
                    withSelectableRows
                    selectedRows={selectedRows}
                    allRowsSelected={allTracesSelected}
                    onSelectRow={handleSelectRow}
                    onSelectAllVisibleRows={(selected) => {
                        if (selected) {
                            setSelectedTraces(traces.map((x: Trace) => x.id));
                        } else {
                            setSelectedTraces([]);
                            unselectAllTraces();
                        }
                    }}
                    onSelectAllRows={selectAllTraces}
                    allVisibleRowsSelectedMessage={t("traces.matchingTracesAreSelected", {
                        selectedTraces: traces.length,
                    })}
                    selectAllRowsMessage={t("traces.selectMatchingTraces", {
                        matchingTraces: totalCount,
                    })}
                    allRowsSelectedMessage={t("traces.matchingTracesSelected", {
                        selectedTraces: totalCount,
                    })}
                    isLoading={isLoading}
                    hasNextPage={hasNext}
                    overrideHeader={getOverrideHeader()}
                    narrowColumnGaps
                />
            </Box>
        </FullHeightMinWidthScreen>
    );

    function getOverrideHeader() {
        if (selectedTraces.length > 0 || allTracesSelected) {
            return (
                <Flex alignItems="center">
                    <Text>
                        {t("traces.selectedTraces", {
                            selectedCount: allTracesSelected ? totalCount : selectedTraces.length,
                        })}
                    </Text>
                    <Box
                        ml={3}
                        height="2em"
                        borderLeftWidth={1}
                        borderLeftStyle="solid"
                        borderLeftColor="grey.dark"
                    />
                    <DeleteTracesButton
                        selectedTraces={selectedTraces}
                        allTracesSelected={allTracesSelected}
                        query={currentQueryParams}
                        queryCount={totalCount}
                        onTracesDeleted={() => {
                            setSelectedTraces([]);
                            unselectAllTraces();
                            reload();
                        }}
                    />
                </Flex>
            );
        }
        return null;
    }
}

function getTracesQueryParamsFromFiltersQuery(query: TraceQuery, timezone: string) {
    let timeRange: string[] = [];

    const {cleaned_start_date, cleaned_end_date} = getQueryDates(query, timezone);

    if (cleaned_start_date && cleaned_end_date) {
        timeRange = [cleaned_start_date, cleaned_end_date];
    }
    return {
        license_plate__in: query.telematic_vehicle_plate__in,
        time__range: timeRange,
    };
}

type TracesColumn =
    | "vendorId"
    | "vehiclePlate"
    | "date"
    | "time"
    | "mileage"
    | "latitude"
    | "longitude";

function getTracesColumns(): Array<{
    id: TracesColumn;
    name: TracesColumn;
    label: string | JSX.Element;
}> {
    return [
        {
            id: "vendorId",
            name: "vendorId",
            label: t("traces.vendorId"),
        },
        {
            id: "vehiclePlate",
            name: "vehiclePlate",
            label: t("common.vehiclePlate"),
        },
        {
            id: "date",
            name: "date",
            label: t("common.date"),
        },
        {
            id: "time",
            name: "time",
            label: (
                <Text variant="captionBold" ellipsis display="flex" alignItems="center">
                    {t("common.time")}
                    <TooltipWrapper
                        boxProps={{display: "inline-block"}}
                        content={t("traces.timeToolTip")}
                    >
                        <Icon name="info" ml={2} />
                    </TooltipWrapper>
                </Text>
            ),
        },
        {
            id: "mileage",
            name: "mileage",
            label: t("traces.mileage"),
        },
        {
            id: "latitude",
            name: "latitude",
            label: t("common.latitude"),
        },
        {
            id: "longitude",
            name: "longitude",
            label: t("common.longitude"),
        },
    ];
}

const getRowCellContent = (trace: Trace, columnName: TracesColumn) => {
    switch (columnName) {
        case "vendorId":
            return trace.telematic_vehicle.vendor_id || "-";
        case "vehiclePlate":
            return trace.telematic_vehicle.vehicle.license_plate;
        case "date":
            return formatDate(trace.time, "P");
        case "time":
            return formatDate(trace.time, "p");
        case "mileage":
            return trace.mileage || "-";
        case "latitude":
            return trace.latitude || "-";
        case "longitude":
            return trace.longitude || "-";
    }
};

const SCROLL_THRESHOLD = 50;
