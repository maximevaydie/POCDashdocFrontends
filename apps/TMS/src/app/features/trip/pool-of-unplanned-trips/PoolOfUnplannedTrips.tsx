import {fetchUpdateManager, getConnectedManager, useTimezone, useToday} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    ListEmptyNoResultsWithFilters,
    SortValue,
    ColumnDirection,
    Text,
    VirtualizedTable,
} from "@dashdoc/web-ui";
import {
    PoolOfUnplannedTransportsColumnNames,
    PoolOfUnplannedTripsColumnNames,
} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import React, {ComponentType, useCallback, useContext, useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import createPersistedState from "use-persisted-state";

import {cleanUnplannedFilterQuery} from "app/features/scheduler/carrier-scheduler/components/filters/filters.service";
import {DEFAULT_POOL_SETTINGS} from "app/features/scheduler/carrier-scheduler/trip-scheduler/unplanned-trips/constant";
import {preselectedPoolSortState} from "app/features/trip/pool-of-unplanned-trips/hook/usePreselectedPoolSort";
import {useExtendedView} from "app/hooks/useExtendedView";
import {usePoolTripEventHandler} from "app/hooks/useTripEventHandler";
import {fetchSearchUnplannedTrips} from "app/redux/actions/scheduler-trip";
import {
    getUnplannedBasicTripsCurrentQueryLoadingStatus,
    getUnplannedBasicTripsForCurrentQuery,
    getUnplannedPreparedTripsCurrentQueryLoadingStatus,
    getUnplannedPreparedTripsForCurrentQuery,
} from "app/redux/selectors/searches";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

import {CompactTrip, TripsSortCriterion} from "../trip.types";

import {
    getInitialSortCriteria,
    getSortCriteriaByColumnName,
    getSortTripData,
    poolElementaryTripColumns,
    poolPreparedTripColumns,
} from "./columns";
import {TripColumn, TripType} from "./types";

export const LOCAL_POOL_OF_UNPLANNED_COLUMNS_WIDTH = "P0OL_OF_UNPLANNNED_COLUMNS_WIDTH";

const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "poolOfUnplannedTrips.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);

export type PoolOfUnplannedTripsProps = {
    onTripSelected?: (tripUid: string) => void;
    poolType: TripType;
    draggedTripUid?: string | null; // We keep this props for the moment, but it will be removed soon
    lockedTripsUids?: Set<string>;
    selectedTrips: Array<CompactTrip>;
    withDraggableRows?: boolean;
    setSelectedTrips: (
        newSelectedRows:
            | Array<CompactTrip>
            | ((previousValue: Array<CompactTrip>) => Array<CompactTrip>)
    ) => void;
    PoolEmptyList?: ComponentType<any>;
    onTripHovered?: (tripUid: string | null) => void;
};

export function PoolOfUnplannedTrips({
    onTripSelected,
    poolType,
    lockedTripsUids = new Set(),
    selectedTrips,
    withDraggableRows = true,
    setSelectedTrips,
    PoolEmptyList,
    onTripHovered,
}: PoolOfUnplannedTripsProps) {
    const today = useToday();
    const timezone = useTimezone();
    const dispatch = useDispatch();
    const selectedRows = useMemo(() => {
        let selected: Record<string, boolean> = {};
        selectedTrips.map((trip) => (selected[trip.uid] = true));
        return selected;
    }, [selectedTrips]);
    const [predefinedColumnsWidth, setPredefinedColumnsWidth] = predefinedColumnsWidthState<
        Partial<Record<TripColumn["name"], string>>
    >({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setPreselectedSort] = preselectedPoolSortState<string | null>();
    const {extendedView} = useExtendedView();

    const {currentQuery, updateQuery} = useContext(PoolCurrentQueryContext);

    const poolOfUnplannedColumnsKey =
        poolType === "basic"
            ? "pool_of_unplanned_transports_columns"
            : "pool_of_unplanned_trips_columns";

    const poolOfUnplannedInitialOrderingKey =
        poolType === "basic"
            ? "pool_of_unplanned_transports_initial_ordering"
            : "pool_of_unplanned_trips_initial_ordering";

    const {
        pk: connectedManagerPk,
        [poolOfUnplannedColumnsKey]: connectedManagerSelectedColumns,
        [poolOfUnplannedInitialOrderingKey]: initialPoolOrdering,
    } = useSelector(getConnectedManager)!;

    const {
        trips = [],
        page: lastFetchedPage = 1,
        totalCount,
        hasNextPage,
    } = useSelector(
        poolType === "prepared"
            ? getUnplannedPreparedTripsForCurrentQuery
            : getUnplannedBasicTripsForCurrentQuery,
        (prev, next) => {
            /**
             * Equality function
             * We can't trust the getUnplannedPreparedTripsForCurrentQuery or getUnplannedBasicTripsForCurrentQuery
             * to detect an update, indeed, the trips array will be a new instance at each useSelector!
             * We check the length before performing a deep comparison!
             */
            if (prev.trips?.length === next.trips?.length) {
                return isEqual(prev, next);
            } else {
                return false;
            }
        }
    );

    const isLoading = useSelector(
        poolType === "prepared"
            ? getUnplannedPreparedTripsCurrentQueryLoadingStatus
            : getUnplannedBasicTripsCurrentQueryLoadingStatus
    );

    const columns: Partial<Record<TripColumn["name"], TripColumn>> = useMemo(() => {
        let c: Partial<Record<TripColumn["name"], TripColumn>>;
        if (poolType === "prepared") {
            c = {...poolPreparedTripColumns};
        } else {
            c = {...poolElementaryTripColumns};
        }
        if (!extendedView) {
            delete c.carrier;
        }

        return c;
    }, [extendedView, poolType]);

    const fetchTrips = useCallback(
        (fromPage = 1, toPage?: number) => {
            dispatch(
                fetchSearchUnplannedTrips(
                    cleanUnplannedFilterQuery(
                        today,
                        currentQuery,
                        extendedView,
                        initialPoolOrdering
                    ),
                    poolType,
                    fromPage,
                    toPage
                )
            );
        },
        [
            today,
            currentQuery.text,
            currentQuery.pool_period,
            currentQuery.pool_start_date,
            currentQuery.pool_end_date,
            currentQuery.pool_loading_period,
            currentQuery.pool_loading_start_date,
            currentQuery.pool_loading_end_date,
            currentQuery.pool_unloading_period,
            currentQuery.pool_unloading_start_date,
            currentQuery.pool_unloading_end_date,
            currentQuery.address_text,
            currentQuery.address_country__in,
            currentQuery.address_postcode__in,
            currentQuery.origin_address_text,
            currentQuery.origin_address_country__in,
            currentQuery.origin_address_postcode__in,
            currentQuery.destination_address_text,
            currentQuery.destination_address_country__in,
            currentQuery.destination_address_postcode__in,
            currentQuery.address__in,
            currentQuery.destination_address__in,
            currentQuery.origin_address__in,
            currentQuery.shipper__in,
            currentQuery.tags__in,
            currentQuery.ordering,
            currentQuery.view,
            dispatch,
            poolType,
            extendedView,
            initialPoolOrdering,
        ]
    );

    const fetchUnplannedTrips = useCallback(() => {
        fetchTrips(1, lastFetchedPage);
    }, [fetchTrips, lastFetchedPage]);

    useEffect(() => {
        fetchTrips(1);
    }, [fetchTrips]);

    const loadNextPageOfTrips = useCallback(async () => {
        if (hasNextPage && !isLoading) {
            dispatch(
                fetchSearchUnplannedTrips(
                    cleanUnplannedFilterQuery(
                        today,
                        currentQuery,
                        extendedView,
                        initialPoolOrdering
                    ),
                    poolType,
                    lastFetchedPage + 1
                )
            );
        }
    }, [
        today,
        hasNextPage,
        currentQuery,
        lastFetchedPage,
        dispatch,
        isLoading,
        poolType,
        extendedView,
        initialPoolOrdering,
    ]);

    const selectedColumnNames = useMemo(
        () =>
            connectedManagerSelectedColumns?.filter(
                (
                    columnName:
                        | PoolOfUnplannedTransportsColumnNames
                        | PoolOfUnplannedTripsColumnNames
                ) => Object.keys(columns).includes(columnName)
            ) ?? [],
        [connectedManagerSelectedColumns, columns]
    );

    const onSelectColumns = useCallback(
        (newSelection: string[], newInitialOrdering: string | null) => {
            dispatch(
                fetchUpdateManager(
                    connectedManagerPk,
                    {
                        [poolOfUnplannedColumnsKey]: newSelection,
                        [poolOfUnplannedInitialOrderingKey]: newInitialOrdering,
                    },
                    t("components.updatedColumns")
                )
            );
        },
        [
            connectedManagerPk,
            poolOfUnplannedColumnsKey,
            poolOfUnplannedInitialOrderingKey,
            dispatch,
        ]
    );

    const onSelectRow = useCallback(
        (selectedTrip: CompactTrip) => {
            setSelectedTrips((previousTrips: Array<CompactTrip>) => {
                const index = previousTrips.findIndex((trip) => trip.uid === selectedTrip.uid);
                if (index === -1) {
                    return [...previousTrips, selectedTrip];
                }
                return previousTrips.filter((trip) => trip.uid !== selectedTrip.uid);
            });
        },
        [setSelectedTrips]
    );
    const onHoverRow = useCallback(
        (trip: CompactTrip | null) => {
            onTripHovered?.(trip ? trip.uid : null);
        },
        [onTripHovered]
    );
    const onSelectAllVisibleRows = useCallback(
        (selected: boolean) => {
            if (selected) {
                setSelectedTrips(trips);
            } else {
                setSelectedTrips([]);
            }
        },
        [trips, setSelectedTrips]
    );

    const columnsValues = useMemo(() => Object.values(columns), [columns]);
    const getRowCell = useCallback(
        (
            trip: CompactTrip,
            columnName: PoolOfUnplannedTransportsColumnNames | PoolOfUnplannedTripsColumnNames
        ) => (
            <Box height="35px" overflow="hidden">
                {columns[columnName]?.getCellContent?.(
                    trip,
                    // @ts-ignore
                    currentQuery.view,
                    timezone
                )}
            </Box>
        ),
        [currentQuery.view, timezone, columns]
    );
    const getListEmpty = useCallback(
        () => (
            <ListEmptyNoResultsWithFilters resetQuery={() => updateQuery(DEFAULT_POOL_SETTINGS)} />
        ),
        [updateQuery]
    );

    const ordering = useMemo((): Record<string, ColumnDirection> | undefined => {
        return currentQuery.ordering
            ? {
                  [currentQuery.ordering.replace("-", "")]: currentQuery.ordering.includes("-")
                      ? "desc"
                      : "asc",
              }
            : undefined;
    }, [currentQuery.ordering]);

    const initialSort = useMemo(() => {
        if (initialPoolOrdering) {
            return {
                criterion: initialPoolOrdering.replace("-", ""),
                order: initialPoolOrdering.includes("-") ? "desc" : "asc",
            } as SortValue<TripsSortCriterion>;
        }
        return null;
    }, [initialPoolOrdering]);

    const handleOrderingChange = useCallback(
        (newOrdering: Record<string, ColumnDirection> | null) => {
            const ordering = newOrdering
                ? `${Object.values(newOrdering)[0] === "desc" ? "-" : ""}${
                      Object.keys(newOrdering)[0]
                  }`
                : undefined;
            updateQuery({
                ordering: ordering,
            });
            setPreselectedSort(ordering ?? null); //createPersistedState does not handle undefined
        },
        [setPreselectedSort, updateQuery]
    );

    const getTripId = useCallback((trip: CompactTrip) => trip.uid, []);
    const getTripTestId = useCallback(() => "unplanned-trip-row", []);

    const onClickOnRow = useCallback(
        onTripSelected ? (trip: CompactTrip) => onTripSelected(trip.uid) : onSelectRow,
        [onTripSelected, onSelectRow]
    );

    useEffect(() => {
        setSelectedTrips((previousTrips: Array<CompactTrip>) => {
            const newTrips = previousTrips.filter((trip) => trips.find((t) => t.uid === trip.uid));
            if (newTrips.length !== previousTrips.length) {
                return newTrips;
            }
            return previousTrips;
        });
    }, [trips, setSelectedTrips]);

    usePoolTripEventHandler(fetchUnplannedTrips, lockedTripsUids);
    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                fontSize={1}
                height="100%"
                data-testid={`pool-of-unplanned-${poolType}-trips`}
            >
                <Flex
                    flexDirection="column"
                    overflow="auto"
                    borderRadius={2}
                    boxShadow="medium"
                    height="100%"
                >
                    <VirtualizedTable<TripsSortCriterion>
                        columns={columnsValues}
                        estimatedHeight={51}
                        withSelectableRows
                        selectedRows={selectedRows}
                        onSelectRow={onSelectRow}
                        onHoverRow={onHoverRow}
                        onSelectAllVisibleRows={onSelectAllVisibleRows}
                        allVisibleRowsSelectedMessage={t("components.visbleSelectedResults", {
                            selected: trips.length,
                            total: totalCount,
                        })}
                        withSelectableColumns
                        columnsSelectionModalTitle={
                            poolType === "prepared"
                                ? t("poolOfUnplanned.preparedTrips.columnsSelectionTitle")
                                : t("poolOfUnplanned.basicTrips.columnsSelectionTitle")
                        }
                        withDraggableRows={withDraggableRows}
                        selectedColumnNames={selectedColumnNames}
                        onSelectColumns={onSelectColumns}
                        sortableColumns={getSortCriteriaByColumnName()}
                        getColumnWidth={getColumnWidth}
                        setColumnWidth={setColumnWidth}
                        ordering={ordering}
                        onOrderingChange={handleOrderingChange}
                        rows={trips}
                        getRowKey={getTripId}
                        getRowId={getTripId}
                        getRowTestId={getTripTestId}
                        getRowCellContent={getRowCell}
                        onClickOnRow={onClickOnRow}
                        isLoading={isLoading}
                        ListEmptyComponent={PoolEmptyList ?? getListEmpty}
                        onEndReached={loadNextPageOfTrips}
                        hasNextPage={hasNextPage}
                        initialSort={initialSort}
                        initialSortCriteria={getInitialSortCriteria()}
                        getRowSeparator={getGroupBySectionHeader}
                    />
                </Flex>
            </Box>
        </>
    );
    function getColumnWidth(column: TripColumn) {
        return predefinedColumnsWidth[column.name] ?? column.width ?? "auto";
    }
    function setColumnWidth(column: TripColumn, width: string) {
        setPredefinedColumnsWidth((prev) => ({...prev, [column.name]: width}));
    }
    function getGroupBySectionHeader(trip: CompactTrip, previousTrip: CompactTrip) {
        if (!initialPoolOrdering) {
            return null;
        }
        const criteriaKey = initialPoolOrdering.replace("-", "") as TripsSortCriterion;
        if (
            previousTrip &&
            getSortTripData(trip, criteriaKey, timezone) ===
                getSortTripData(previousTrip, criteriaKey, timezone)
        ) {
            return null;
        }
        return (
            <Text variant="captionBold" color="blue.dark">
                {getSortTripData(trip, criteriaKey, timezone)}
            </Text>
        );
    }
}
